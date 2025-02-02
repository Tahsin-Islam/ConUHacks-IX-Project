const Stop = require('../models/Stop');
const Crime = require('../models/Crime');

let cachedHeatmap = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // Cache for 5 minutes

// Function to fetch and cache heatmap data
async function fetchAndCacheHeatmap() {
  try {
    console.log('🔄 Preloading heatmap data...');

    const stops = await Stop.find();
    const crimeQueries = stops.map((stop) =>
      Crime.countDocuments({
        location: {
          $geoWithin: {
            $centerSphere: [stop.location.coordinates, 500 / 6378100], // Convert 500m to radians
          },
        },
      })
    );

    // Execute all crime count queries in parallel
    const crimeCounts = await Promise.all(crimeQueries);

    // Combine results
    cachedHeatmap = stops.map((stop, index) => ({
      lat: stop.location.coordinates[1],
      lon: stop.location.coordinates[0],
      weight: crimeCounts[index],
    }));

    lastCacheTime = Date.now();
    console.log('✅ Heatmap preloaded successfully.');
  } catch (error) {
    console.error('❌ Error preloading heatmap:', error);
  }
}

// Function to get cached heatmap
function getCachedHeatmap() {
  return cachedHeatmap;
}

module.exports = { fetchAndCacheHeatmap, getCachedHeatmap };
