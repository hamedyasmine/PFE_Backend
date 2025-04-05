const express = require("express");
const multer = require("multer");
const ApplicationSimplifiee = require("../models/applicationsimplifiee");

const router = express.Router();

// 📌 Configuration de Multer pour uploader les CVs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/cvs"); // Dossier où les fichiers seront stockés
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// 📌 Route pour soumettre une candidature simplifiée
router.post("/apply", upload.single("cv"), async (req, res) => {
    try {
      console.log("Données reçues :", req.body);
      console.log("Fichier reçu :", req.file);
  
      const {
        firstName,
        lastName,
        email,
       
       category, // ✅ Correction ici
        jobType,
        gender
      } = req.body;
  
      const cvPath = req.file ? req.file.path : null;
  
      if (!cvPath) {
        return res.status(400).json({ message: "Veuillez uploader un CV" });
      }
  
      const newApplication = new ApplicationSimplifiee({
        firstname: firstName,
        lastname: lastName,
        email,
        category: category, // ✅ Correction ici
        jobType,
        gender,
        cv: cvPath
      });
  
      await newApplication.save();
      res.status(201).json({ message: "Candidature simplifiée envoyée avec succès !" });
  
    } catch (error) {
      console.error("Erreur serveur :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
});

// 📌 Route pour supprimer une candidature simplifiée
router.delete("/applications-simplifiees/:id", async (req, res) => {
  try {
      const application = await ApplicationSimplifiee.findByIdAndDelete(req.params.id);
      if (!application) {
          return res.status(404).json({ message: "Candidature non trouvée" });
      }
      res.json({ message: "Candidature supprimée avec succès" });
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
  }
});

//recuperer tous les candidaturessimplifier 
router.get("/applications", async (req, res) => {
  try {
      const applications = await ApplicationSimplifiee.find();
      res.json(applications);
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
  }
});


  
  

// 📌 Route pour récupérer toutes les catégories
router.get("/categories", async (req, res) => {
  const categories = ["Informatique", "Marketing", "Finance", "Ressources Humaines"];
  res.json(categories);
});

// 📌 Route pour récupérer les types de jobs
router.get("/jobTypes", async (req, res) => {
  const jobTypes = ["CDI", "CDD", "Freelance", "Stage"];
  res.json(jobTypes);
});

module.exports = router;
