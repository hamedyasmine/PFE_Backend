// models/place.js
const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
