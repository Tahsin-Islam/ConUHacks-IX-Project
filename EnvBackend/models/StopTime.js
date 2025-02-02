const mongoose = require('mongoose');

const StopTimeSchema = new mongoose.Schema({
  stop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop' },
  morning_freq: Number, // 00:01 - 08:00
  day_freq: Number, // 08:01 - 16:00
  evening_freq: Number, // 16:01 - 00:00
});

module.exports = mongoose.model('StopTime', StopTimeSchema);
