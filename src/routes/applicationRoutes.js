const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware");
const Application = require("../models/applications");
const Job = require("../models/job");
const Question = require("../models/Question");
const InterviewAnswer = require("../models/InterviewAnswer");


const router = express.Router();

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }
};

// Configuration de multer pour gérer l'upload des fichiers CV
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/cvs/"); // Dossier où stocker les CVs
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 🟢 Postuler à un job
// 🟢 Postuler à un job
router.post("/apply", authMiddleware, upload.single("cv"), async (req, res) => {
  console.log("Request Body Received:", req.body);

  const userId = req.user ? req.user.id : null;
  // Vérifier à la fois job et jobId dans le corps de la requête
  const jobId = req.body.job || req.body.jobId || req.body["job"] || req.body["jobId"];
  console.log("Extracted Job ID:", jobId);
  const cvFile = req.file;

  console.log("User ID:", userId);
  console.log("Job ID:", jobId);
  console.log("CV File Path:", cvFile ? cvFile.path : "No CV uploaded");

  if (!userId) {
    return res.status(400).json({ message: "User ID est requis" });
  }

  if (!jobId) {
    return res.status(400).json({ message: "Job ID est requis" });
  }

  if (!cvFile) {
    return res.status(400).json({ message: "CV est requis" });
  }

  try {
    // Vérifier si le job existe dans la base de données
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job non trouvé" });
    }

    // Vérifier si l'utilisateur a déjà postulé pour ce job
    const existingApplication = await Application.findOne({ userId, job: jobId });
    if (existingApplication) {
      return res.status(400).json({ message: "Vous avez déjà postulé pour ce job" });
    }

    // Créer une nouvelle candidature
    const application = new Application({
      userId,
      job: jobId,  // Utiliser 'job' comme dans le schéma
      cv: cvFile.path,
      status: 'pending'
    });

    await application.save();
    res.status(201).json({ message: "Candidature envoyée avec succès", application });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la candidature:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// 🔴 Supprimer une candidature sans autorisation
router.delete("/application/:id", async (req, res) => {
  const { id } = req.params; // ID de la candidature à supprimer

  try {
    // Trouver et supprimer la candidature
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Candidature non trouvée" });
    }

    // Utiliser deleteOne() pour supprimer la candidature
    await Application.deleteOne({ _id: id });

    res.json({ message: "Candidature supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la candidature:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// 🟡 Voir les candidatures d'un utilisateur avec les questions d'entretien
router.get("/my-applications", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id });

    const enrichedApplications = [];

    for (let application of applications) {
      const job = await Job.findById(application.job);
      if (!job) continue;

      const jobInfo = {
        _id: job._id,
        name: job.name,
        description: job.description,
        duration: job.duration,
        location: job.location,
        jobType: job.jobType,
      };

      // Déclare enrichedApp comme un objet vide
      const enrichedApp = {
        ...application._doc, // Ajoute les propriétés de la candidature
        job: jobInfo, // Ajoute les informations du job
      };

      // Cherche si l'utilisateur a déjà passé l'entretien pour ce job
      const existingInterview = await InterviewAnswer.findOne({
        userId: req.user.id,
        jobId: job._id,
      });

      enrichedApp.interviewPassed = !!existingInterview; // true ou false

      if (application.status === 'accepted') {
        // 🧠 Calculer la date limite
        const postedAt = new Date(job.postedAt);
        const deadline = new Date(postedAt.getTime() + job.duration * 24 * 60 * 60 * 1000);
        const deadlineFormatted = deadline.toISOString().split('T')[0]; // ex: "2025-04-08"
        const deadlineMessage = `Veuillez répondre avant le ${deadlineFormatted}`;

        enrichedApp.interviewQuestions = job.interviewQuestions;
        enrichedApp.deadlineMessage = deadlineMessage;
      }

      enrichedApplications.push(enrichedApp); // Ajoute la candidature enrichie au tableau
    }

    res.json(enrichedApplications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des candidatures.' });
  }
});




// 🟠 Récupérer toutes les candidatures (admin uniquement)
router.get("/all", authMiddleware, isAdmin, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: "userId",
        select: "name email"
      })
      .populate({
        path: "job",
        select: "name company"
      });
    
    res.json(applications);
  } catch (error) {
    console.error("Erreur lors de la récupération des candidatures:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// 🔵 Afficher les candidatures d'un job spécifique
router.get("/job/:jobId/applications", async (req, res) => {
  const { jobId } = req.params;

  try {
    // Vérifier si le job existe dans la base de données
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job non trouvé" });
    }

    // Récupérer toutes les candidatures associées à ce job
    const applications = await Application.find({ job: jobId })
      .populate({
        path: "userId",
        select: "name email"
      })
      .populate({
        path: "job",
        select: "name company"
      });

    if (applications.length === 0) {
      return res.status(404).json({ message: "Aucune candidature pour ce job" });
    }

    res.json(applications);
  } catch (error) {
    console.error("Erreur lors de la récupération des candidatures:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// 🟢 Mettre à jour le statut d'une candidature et envoyer les questions d'entretien si accepté
router.put("/application/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Nouveau statut (accepted ou rejected)

  // Vérification que le statut est soit "accepted" soit "rejected"
  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Le statut doit être 'accepted' ou 'rejected'" });
  }

  try {
    // Trouver et mettre à jour la candidature en ne modifiant que le statut
    const application = await Application.findByIdAndUpdate(
      id,
      { status }, // Mise à jour uniquement du statut
      { new: true, runValidators: false } // `runValidators: false` empêche la validation des autres champs
    );

    if (!application) {
      return res.status(404).json({ message: "Candidature non trouvée" });
    }

    // Si le statut est "accepted", ajouter les questions d'entretien
    if (status === 'accepted') {
      const job = await Job.findById(application.job); // Trouver le job associé
      const questions = await Question.findOne({ jobId: job._id }); // Récupérer les questions pour ce job

      if (!questions) {
        return res.status(404).json({ message: "Aucune question d'entretien trouvée pour ce job" });
      }

      application.interviewQuestions = questions.questions; // Ajouter les questions à la candidature
      await application.save(); // Sauvegarder les modifications
    }

    res.json({ message: "Statut de la candidature mis à jour avec succès", application });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de la candidature:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Exemple de route API pour obtenir les candidatures avec les questions d'entretien
router.get('/applications/my-applications', async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id });
    
    const enrichedApplications = [];

    for (let application of applications) {
      const job = await Job.findById(application.job);
      console.log("📦 Job trouvé :", job);

      
      if (application.status === 'accepted' && job) {
        // Ajouter les questions + message de rappel avec la durée
        const deadlineMessage = `Veuillez répondre avant le délai de ${job.duration}`;
        enrichedApplications.push({
          ...application._doc,
          interviewQuestions: job.interviewQuestions,
          deadlineMessage,
          job: {
            _id: job._id,
            name: job.name,
            description: job.description,
            duration: job.duration,
            location: job.location,
            jobType: job.jobType
          }
        });
        
      } else {
        enrichedApplications.push(application);
      }
    }

    res.json(enrichedApplications);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des candidatures.' });
  }
});


module.exports = router;