const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Job = require('../models/job');
const Category = require('../models/category');
const User = require("../models/User.model");
const Application = require("../models/applications");
const upload = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
// L'URL de votre service Flask (à remplacer par l'URL ngrok générée)
const FLASK_SERVICE_URL = 'https://ae8a-34-86-117-199.ngrok-free.app/upload';

// 🟢 1. Ajouter un Job
router.post('/jobs', async (req, res) => {
  try {
    const { name, category, location, jobType, description, duration } = req.body;

    // Vérifier si la catégorie existe
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Catégorie invalide" });
    }

    // Créer le job
    const newJob = new Job({ name, category, location, jobType, description, duration });
    await newJob.save();

    // Mettre à jour le nombre de jobs dans la catégorie
    await Category.findByIdAndUpdate(category, { $inc: { jobCount: 1 } });

    res.status(201).json({ message: "Job ajouté avec succès", job: newJob });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/jobs', async (req, res) => {
  try {
    const { category, jobType, location, postedWithin } = req.query;
    console.log("jobType reçu:", jobType);
    
    // Construction dynamique du filtre
    let filter = {};
    
    // Filtre par catégorie
    if (category) {
      filter['category'] = category;
    }
    
    // Filtre par type d'emploi (peut être multiple)
   
if (jobType) {
  console.log("Type d'emploi reçu:", jobType);
  const jobTypes = jobType.split(',');
  console.log("Types d'emploi après split:", jobTypes);
  filter.jobType = { $in: jobTypes };
  console.log("Filtre jobType appliqué:", filter.jobType);
}
    // Filtre par localisation
    if (location) {
      filter['location'] = location;
    }
    
    // Filtre par date de publication
   // Filter by posted date
   if (postedWithin) {
    const now = new Date();
    const days = parseInt(postedWithin, 10);
    
    if (!isNaN(days) && days > 0) {
      const fromDate = new Date();
      fromDate.setDate(now.getDate() - days);
      
      filter['postedAt'] = { $gte: fromDate };
      console.log("Date filter applied:", { from: fromDate, days });
    }
  }
    
    console.log("Filtres appliqués:", filter);
    
    const jobs = await Job.find(filter).populate('category', 'name');
    
    console.log("Jobs trouvés:", jobs.length);
    res.json(jobs);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: error.message });
  }
});

//get les 4 derniers job posted

router.get('/jobs/recent', async (req, res) => {
  try {
    const jobs = await Job.find()
      .sort({ postedAt: -1 }) // Trie par date décroissante (du plus récent au plus ancien)
      .limit(4) // Prend les 4 derniers jobs
      .populate('category', 'name'); // Récupère la catégorie avec son nom

    console.log("Jobs récents récupérés:", jobs); // Vérifie que les jobs sont bien trouvés
    res.json(jobs);
  } catch (error) {
    console.error("Erreur lors de la récupération des jobs récents:", error);
    res.status(500).json({ message: error.message });
  }
});




// 🟡 3. Mettre à jour un Job
router.put('/jobs/:id', async (req, res) => {
  try {
    const { name, category, location, jobType, description, duration } = req.body;

    // Vérifier si le job existe
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job non trouvé" });

    // Vérifier si la catégorie existe
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: "Catégorie invalide" });
      }
    }

    // Mise à jour
    job = await Job.findByIdAndUpdate(req.params.id, { name, category, location, jobType, description, duration }, { new: true });
    res.json({ message: "Job mis à jour avec succès", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔴 4. Supprimer un Job
router.delete('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job non trouvé" });

    // Supprimer le job
    await Job.findByIdAndDelete(req.params.id);

    // Mettre à jour le nombre de jobs dans la catégorie
    await Category.findByIdAndUpdate(job.category, { $inc: { jobCount: -1 } });

    res.json({ message: "Job supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🟠 5. Filtrer les jobs (par catégorie, type, localisation et date d'ajout)
router.get('/jobs/filter', async (req, res) => {
  try {
    let { category, jobType, location, dateAdded, name } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (jobType) filter.jobType = jobType;
    if (location) filter.location = location;

    if (dateAdded) {
      const date = new Date(dateAdded);
      filter.postedAt = { $gte: date }; // Jobs ajoutés après cette date
    }

    if (name) {
      // Ajouter un filtre pour rechercher par nom de job (sensible à la casse)
      filter.title = { $regex: name, $options: "i" }; // Recherche insensible à la casse
    }

    const jobs = await Job.find(filter).populate('category', 'name');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// 🟣 6. Obtenir les détails d'un job spécifique
router.get('/jobs/:id', async (req, res) => {
  try {
    // Récupérer l'id du job depuis les paramètres de la route
    const jobId = req.params.id;

    // Chercher le job par son id
    const job = await Job.findById(jobId).populate('category', 'name');
    if (!job) {
      return res.status(404).json({ message: "Job non trouvé" });
    }

    // Retourner les détails du job
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Postuler à un job

// Route pour le bouton "MatchCV"
// Route pour envoyer le CV et la description du poste à Flask

router.post('/analyze-cv', upload.single('cv_file'), async (req, res) => {
  try {
    const { job_description } = req.body;
    const cvFile = req.file;
    
    console.log("CV File reçu:", cvFile ? cvFile.originalname : "aucun");
    console.log("Description du poste reçue:", job_description);
    
    if (!cvFile || !job_description) {
      return res.status(400).json({ error: 'CV et description du poste requis' });
    }
    
    // Préparer les données pour le service Flask
    const formData = new FormData();
    formData.append('cv_file', fs.createReadStream(cvFile.path), cvFile.originalname);
    formData.append('job_description', job_description);
    
    console.log("FormData prêt, envoi à:", FLASK_SERVICE_URL);
    
    // Appeler le service Flask
    const response = await axios.post(FLASK_SERVICE_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log("Réponse reçue:", response.data);
    
    // Nettoyer le fichier temporaire
    fs.unlinkSync(cvFile.path);
    
    // Renvoyer les résultats au frontend
    return res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de l\'analyse du CV:', error.message);
    if (error.response) {
      console.error('Réponse d\'erreur:', error.response.data);
    }
    return res.status(500).json({ error: 'Erreur lors de l\'analyse du CV' });
  }
});








module.exports = router;
