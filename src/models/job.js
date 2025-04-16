// models/job.js
const mongoose = require('mongoose');

// Modèle Job
const jobSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nom du job
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Référence à la catégorie
  location: { type: String, required: true }, // Localisation du job
  jobType: { type: String, enum: ['Full-time', 'Freelance', 'Internship'], required: true }, // Type de job
  description: { type: String, required: true }, // Description du job
  postedAt: { type: Date, default: Date.now }, // Date de publication du job
  duration: { type: Number, required: true }, // Durée de l'offre de job (ex : 7h, 14 jours, etc.)
  
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
