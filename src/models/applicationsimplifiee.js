const mongoose = require("mongoose");

const applicationSimplifieeSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  category: { type: String, required: true },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship'], required: true }, 
  gender: { type: String, enum: ["Male", "Female", "other"], required: true },
  cv: { type: String, required: true }, // Chemin du fichier CV
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ApplicationSimplifiee", applicationSimplifieeSchema);
