const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID est requis"]
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: [true, "Job ID est requis"]
  },
  cv: {
    type: String,
    required: [true, "CV est requis"],
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'refused'],
    default: 'pending'
  },
  interviewQuestions: [String],
  answers: { type: Map, of: String },
}, { timestamps: true });

// Supprimer l'index existant et recréer le bon
applicationSchema.index({ userId: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);