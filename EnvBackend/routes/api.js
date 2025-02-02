const express = require('express');
const Stop = require('../models/Stop');
const Crime = require('../models/Crime');
const StopTime = require('../models/StopTime');

const router = express.Router();

// 🔹 Get All Stops
router.get('/stops', async (req, res) => {
  const stops = await Stop.find();
  res.json(stops);
});

// 🔹 Get Crimes Near a Stop (500m radius)
router.get('/crimes/near-stop/:stop_id', async (req, res) => {
  const stop = await Stop.findOne({ stop_id: req.params.stop_id });
  if (!stop) return res.status(404).json({ error: 'Stop not found' });

  const crimes = await Crime.find({
    location: {
      $near: {
        $geometry: stop.location,
        $maxDistance: 500, // 500 meters
      },
    },
  });

  res.json({ stop, crimes });
});

// 🔹 Filter Crimes by Time of Day
router.get('/crimes/filter', async (req, res) => {
  const { quart, category } = req.query;
  let query = {};

  if (quart) query.quart = quart;
  if (category) query.category = category;

  const crimes = await Crime.find(query);
  res.json(crimes);
});

// 🔹 Get Stop Frequency
router.get('/stops/frequency/:stop_id', async (req, res) => {
  const stop = await Stop.findOne({ stop_id: req.params.stop_id });
  if (!stop) return res.status(404).json({ error: 'Stop not found' });

  const stopTime = await StopTime.findOne({ stop: stop._id });
  res.json(stopTime || { error: 'No frequency data available' });
});

let cachedHeatmap = null;
let lastCacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

router.get('/heatmap', async (req, res) => {
  try {
    const now = Date.now();
    const { quart } = req.query;

    if (!quart && cachedHeatmap && now - lastCacheTime < CACHE_DURATION) {
      return res.json(cachedHeatmap);
    }

    console.log('📥 Fetching optimized heatmap data...');

    // ✅ Fetch all stops in one query
    const stops = await Stop.find({}, { stop_id: 1, location: 1 });

    // ✅ Find crimes within 500m of any stop **in a single query**
    const crimes = await Crime.aggregate([
      {
        $match: quart ? { quart } : {}, // Apply time filter if requested
      },
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [0, 0] }, // This will be dynamically replaced per stop
          distanceField: 'distance',
          maxDistance: 500,
          spherical: true,
          key: 'location',
        },
      },
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }, // Count crimes at each location
        },
      },
    ]);

    // ✅ Map crime counts to stops
    const heatmapData = stops.map((stop) => {
      const crimeData = crimes.find(
        (crime) => crime._id && crime._id.equals(stop.location)
      );
      return {
        lat: stop.location.coordinates[1], // Latitude
        lon: stop.location.coordinates[0], // Longitude
        weight: crimeData ? crimeData.count : 0, // ✅ Ensure weight is returned
      };
    });

    if (!quart) {
      cachedHeatmap = heatmapData;
      lastCacheTime = now;
    }

    res.json(heatmapData);
  } catch (error) {
    console.error('❌ Error generating heatmap:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  
  

module.exports = router;
