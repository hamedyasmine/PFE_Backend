const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const Job = require("../models/job"); // Importer le modèle Job
const Application = require('../models/applications'); // Remplace ce chemin par le bon chemin vers ton modèle

// Middleware d'authentification
const verifyToken = require('../middlewares/authMiddleware');
// 📌 Ajouter des questions pour un job précis
router.post("/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { questions } = req.body;

    // Vérifier que des questions sont bien envoyées
    if (!questions || questions.length === 0) {
      return res.status(400).json({ error: "Les questions sont requises" });
    }

    // Vérifier si le job existe
    const jobExists = await Job.findById(jobId);
    if (!jobExists) {
      return res.status(404).json({ error: "Le job spécifié n'existe pas" });
    }

    // Ajouter les questions au job
    const newQuestions = new Question({ jobId, questions });
    await newQuestions.save();

    res.status(201).json({ message: "Questions ajoutées avec succès", newQuestions });
  } catch (error) {
    console.error("Erreur lors de l'ajout des questions:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 📌 Récupérer les questions d’un job précis
router.get("/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;

    // Vérifier si le job existe
    const jobExists = await Job.findById(jobId);
    if (!jobExists) {
      return res.status(404).json({ error: "Le job spécifié n'existe pas" });
    }

    // Récupérer les questions
    const questions = await Question.findOne({ jobId });

    if (!questions) {
      return res.status(404).json({ message: "Aucune question trouvée pour ce job" });
    }

    res.json(questions);
  } catch (error) {
    console.error("Erreur lors de la récupération des questions:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});



// 📌 🔄 Mettre à jour les questions d’un job
router.put("/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const { questions } = req.body;
  
      if (!questions || questions.length === 0) {
        return res.status(400).json({ error: "Les questions sont requises" });
      }
  
      const jobExists = await Job.findById(jobId);
      if (!jobExists) {
        return res.status(404).json({ error: "Le job spécifié n'existe pas" });
      }
  
      const updatedQuestions = await Question.findOneAndUpdate(
        { jobId },
        { questions },
        { new: true, upsert: true } // Met à jour ou crée si inexistant
      );
  
      res.json({ message: "Questions mises à jour avec succès", updatedQuestions });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des questions:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  // 📌 ❌ Supprimer les questions d’un job
  router.delete("/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
  
      const jobExists = await Job.findById(jobId);
      if (!jobExists) {
        return res.status(404).json({ error: "Le job spécifié n'existe pas" });
      }
  
      const deletedQuestions = await Question.findOneAndDelete({ jobId });
  
      if (!deletedQuestions) {
        return res.status(404).json({ error: "Aucune question trouvée pour ce job" });
      }
  
      res.json({ message: "Questions supprimées avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression des questions:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
 // Soumettre les réponses d'entretien pour une candidature donnée
router.post('/applications/:applicationId/submit-answers',  async (req, res) => {
    const { applicationId } = req.params;
    const { answers } = req.body;  // Les réponses envoyées par l'utilisateur
  
    try {
      // Vérifier si l'application existe
      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(404).json({ message: 'Candidature non trouvée.' });
      }
  
      // Vérifier si les réponses sont présentes
      if (!answers || Object.keys(answers).length === 0) {
        return res.status(400).json({ message: 'Aucune réponse soumise.' });
      }
  
      // Sauvegarder les réponses dans la base de données
      application.answers = answers;  // Assurez-vous que votre modèle 'Application' a un champ pour stocker les réponses.
      await application.save();
  
      return res.status(200).json({ message: 'Réponses soumises avec succès.' });
    } catch (error) {
      console.error("Erreur lors de la soumission des réponses :", error);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  });

  // Route pour récupérer les questions d'entretien d'une candidature
// Route pour récupérer les questions basées sur le jobId d'une candidature
router.get('/applications/:applicationId/questions', async (req, res) => {
    try {
      // Trouver la candidature par son ID
      const application = await Application.findById(req.params.applicationId).populate('job');
      
      if (!application) {
        return res.status(404).json({ message: 'Candidature non trouvée.' });
      }
  
      // Trouver les questions associées au jobId de la candidature
      const questions = await Question.find({ jobId: application.job._id });
  
      if (questions.length === 0) {
        return res.status(404).json({ message: 'Aucune question d\'entretien trouvée pour ce job.' });
      }
  
      // Retourner les questions de l'entretien
      res.json(questions[0].questions); // Les questions sont dans un tableau "questions"
    } catch (error) {
      console.error("Erreur lors de la récupération des questions :", error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des questions.' });
    }
  });

module.exports = router;
