const mongoose = require('mongoose');

const CrimeSchema = new mongoose.Schema({
  category: String,
  date: Date,
  quart: { type: String, enum: ['jour', 'soir', 'nuit'] },
  pdq: Number,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
  },
});

// Ensure 2dsphere index for geospatial queries
CrimeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Crime', CrimeSchema);
