const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const Job = require("../models/job"); // Importer le modèle Job
const Application = require('../models/applications'); // Remplace ce chemin par le bon chemin vers ton modèle

// Middleware d'authentification
const verifyToken = require('../middlewares/authMiddleware');
// 📌 Ajouter des questions pour un job précis
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

////**************** */
// 📌 Ajouter des questions pour un job précis
router.post("/:jobId", async (req, res) => {
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

    // ✅ questions doivent avoir aussi le champ 'time'
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

    const jobExists = await Job.findById(jobId);
    if (!jobExists) {
      return res.status(404).json({ error: "Le job spécifié n'existe pas" });
    }

    const questions = await Question.findOne({ jobId });

    if (!questions) {
      return res.status(404).json({ message: "Aucune question trouvée pour ce job" });
    }

    // ✅ Les questions contiendront maintenant le champ time
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

    // ✅ Met à jour avec les questions contenant 'time'
    const updatedQuestions = await Question.findOneAndUpdate(
      { jobId },
      { questions },
      { new: true, upsert: true }
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

// 📌 Récupérer les questions d’un entretien via une application
router.get('/applications/:applicationId/questions', async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId).populate('job');
    
    if (!application) {
      return res.status(404).json({ message: 'Candidature non trouvée.' });
    }

    const questions = await Question.find({ jobId: application.job._id });

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Aucune question d\'entretien trouvée pour ce job.' });
    }

    // ✅ Retourner les questions avec le temps de réponse
    res.json(questions[0].questions);
  } catch (error) {
    console.error("Erreur lors de la récupération des questions :", error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des questions.' });
  }
});

router.put('/applications/:id/markInterviewPassed', async (req, res) => {
  try {
    const applicationId = req.params.id;

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { interviewPassed: true },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Candidature non trouvée" });
    }

    res.status(200).json({ message: "Entretien marqué comme passé" });
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


module.exports = router;
