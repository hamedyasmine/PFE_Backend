// models/category.js
const mongoose = require('mongoose');

// Modèle Category
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  jobCount: { type: Number, default: 0 }, // Nombre de jobs dans cette catégorie
});

const Category = mongoose.model('Category', categorySchema);

// Exporter le modèle
module.exports = Category;
