const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
  stop_id: String,
  stop_code: Number,
  stop_name: String,
  stop_url: String,
  location_type: Number,
  parent_station: String,
  wheelchair_boarding: Number,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
  },
});

// Ensure 2dsphere index for geospatial queries
StopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Stop', StopSchema);
