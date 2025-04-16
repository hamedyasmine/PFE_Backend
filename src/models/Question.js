const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  questions: [
    {
      question: { type: String, required: true },
      tempsDeReponse: { type: Number, required: true } // par exemple en secondes
    }
  ],
  createdAt: { type: Date, default: Date.now },
  interviewPassed: {
    type: Boolean,
    default: false,
  },
  
});


module.exports = mongoose.model("Question", QuestionSchema);
