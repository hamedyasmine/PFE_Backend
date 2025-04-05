const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  value: String,
  label: String,
});

const Counter = mongoose.model("Counter", counterSchema);

module.exports = Counter;
