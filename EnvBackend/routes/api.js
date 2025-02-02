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
    let { quart } = req.query;

    // ✅ Translate quart filter from English to French (if needed)
    const quartMapping = {
      morning: 'nuit', // 00:01 - 08:00
      day: 'jour', // 08:01 - 16:00
      evening: 'soir', // 16:01 - 00:00
    };

    if (quartMapping[quart]) {
      quart = quartMapping[quart]; // Convert to French equivalent
    }

    if (!quart && cachedHeatmap && now - lastCacheTime < CACHE_DURATION) {
      return res.json(cachedHeatmap);
    }

    console.log(`📥 Fetching heatmap data for quart: ${quart || 'all times'}`);

    // ✅ Fetch all stops
    const stops = await Stop.find({}, { stop_id: 1, location: 1 });

    // ✅ Prepare crime filtering condition
    let crimeFilter = {};
    if (quart) {
      crimeFilter.quart = quart; // Ensure we're filtering with the correct value
    }

    // ✅ Run all queries in parallel using `Promise.all()`
    const crimeCounts = await Promise.all(
      stops.map((stop) =>
        Crime.countDocuments({
          ...crimeFilter, // Apply time filter if provided
          location: {
            $geoWithin: {
              $centerSphere: [stop.location.coordinates, 500 / 6378100], // Convert 500m to radians
            },
          },
        })
      )
    );

    // ✅ Map crime counts to stops
    const heatmapData = stops.map((stop, index) => ({
      lat: stop.location.coordinates[1], // Latitude
      lon: stop.location.coordinates[0], // Longitude
      weight: crimeCounts[index], // ✅ Correct crime count at this stop
    }));

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
