const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const Category = require('../models/category');
const User = require("../models/User.model");
const Application = require("../models/applications");
const upload = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

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
//get all jobs
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().populate('category', 'name');
    console.log("Jobs trouvés:", jobs); // Log des résultats
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









module.exports = router;
