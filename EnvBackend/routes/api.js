const express = require('express');
const axios = require('axios');
const Stop = require('../models/Stop');
const Crime = require('../models/Crime');
const StopTime = require('../models/StopTime');

const router = express.Router();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY; // Ensure this is set in .env

// 🔹 Get All Stops
router.get('/stops', async (req, res) => {
  const stops = await Stop.find();
  res.json(stops);
});

// 🔹 Get Crimes Near a Stop (500m radius) + Google Maps Info + Crime Summary + Street View Image
router.get('/crimes/near-stop/:stop_id', async (req, res) => {
  try {
    const stop = await Stop.findOne({ stop_id: req.params.stop_id });
    if (!stop) return res.status(404).json({ error: 'Stop not found' });

    let { quart, category } = req.query;

    // ✅ Translate quart filter from English to French
    const quartMapping = {
      morning: 'nuit',
      day: 'jour',
      evening: 'soir',
    };
    if (quartMapping[quart]) {
      quart = quartMapping[quart];
    }

    // ✅ Build query with optional filters
    let crimeQuery = {
      location: {
        $near: {
          $geometry: stop.location,
          $maxDistance: 500, // 500 meters
        },
      },
    };
    if (quart) crimeQuery.quart = quart;
    if (category) crimeQuery.category = category;

    // ✅ Fetch Crimes Near Stop
    const crimes = await Crime.find(crimeQuery);

    // ✅ Create a Pie Chart Data Summary (Count Crime Types)
    const crimeSummary = crimes.reduce((acc, crime) => {
      acc[crime.category] = (acc[crime.category] || 0) + 1;
      return acc;
    }, {});

    // ✅ Fetch Stop Info from Google Maps
    const googleMapsResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location: `${stop.location.coordinates[1]},${stop.location.coordinates[0]}`,
          radius: 10, // Look exactly at this stop
          type: 'transit_station',
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    const googleMapsData = googleMapsResponse.data.results[0] || {};

    // ✅ Generate Google Maps Street View Image URL
    const streetViewImage = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${stop.location.coordinates[1]},${stop.location.coordinates[0]}&key=${GOOGLE_MAPS_API_KEY}`;

    // ✅ Send Combined Response
    res.json({
      stop,
      google_maps_info: {
        name: googleMapsData.name || 'Unknown',
        address: googleMapsData.vicinity || 'Unknown',
        rating: googleMapsData.rating || 'No rating',
        user_ratings_total: googleMapsData.user_ratings_total || 0,
        image_url: streetViewImage, // ✅ Street View Image URL
      },
      crime_summary: crimeSummary,
      crimes,
    });
  } catch (error) {
    console.error('❌ Error fetching crimes or Google Maps data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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

    // ✅ Fetch all stops (with stop_id, location)
    const stops = await Stop.find({}, { stop_id: 1, location: 1 });

    // ✅ Prepare crime filtering condition
    let crimeFilter = {};
    if (quart) {
      crimeFilter.quart = quart; // Apply correct time filter
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

    // ✅ Map crime counts to stops (Include `stop_id`)
    const heatmapData = stops.map((stop, index) => ({
      stop_id: stop.stop_id, // ✅ Keep stop ID
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
