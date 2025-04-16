const mongoose = require("mongoose");
const submitInterviewAnswers = async (req, res) => {
    const { applicationId } = req.params;
    const { answers } = req.body;  // Réponses envoyées par l'utilisateur
  
    try {
      // Trouver la candidature
      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Candidature non trouvée" });
      }
  
      // Vérifier si l'entretien a déjà été passé
      if (application.answers && application.answers.size > 0) {
        return res.status(400).json({ message: "Entretien déjà passé." });
      }
  
      // Ajouter les réponses à l'application
      application.answers = answers;
      application.interviewPassed = true;  // Marquer l'entretien comme effectué
  
      // Sauvegarder les modifications
      await application.save();
  
      res.status(200).json({ message: "Réponses soumises avec succès" });
    } catch (error) {
      console.error("Erreur lors de la soumission des réponses :", error);
      res.status(500).json({ message: "Erreur interne serveur" });
    }
  };

const interviewAnswerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true
  },
  answers: [
    {
      question: String,
      response: String,
      duration: Number
    }
  ],
  interviewPassed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("InterviewAnswer", interviewAnswerSchema);
