// src/routes/category.routes.js
const express = require('express');
const router = express.Router();
const Category = require('../models/category');  // Importer directement le modèle
const  Job  = require('../models/job'); // Assure-toi que le modèle `Job` est importé correctement


// Créer une nouvelle catégorie
router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;

    // Vérifier si la catégorie existe déjà
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Cette catégorie existe déjà" });
    }

    // Créer la catégorie
    const category = new Category({ name });
    await category.save();

    res.status(201).json({
      message: "Catégorie créée avec succès",
      category
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer toutes les catégories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Récupérer une catégorie par son ID
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Catégorie non trouvée" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Mettre à jour une catégorie
router.put('/categories/:id', async (req, res) => {
  try {
    const { name } = req.body;

    // Vérifier si la catégorie existe
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Catégorie non trouvée" });

    // Mettre à jour la catégorie
    category.name = name || category.name;

    // Sauvegarder les modifications
    await category.save();

    res.json({
      message: "Catégorie mise à jour avec succès",
      category
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Supprimer une catégorie
router.delete('/categories/:id', async (req, res) => {
  try {
    // Chercher la catégorie par ID
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    // Vérifier si des jobs sont associés à cette catégorie
    const jobs = await Job.find({ category: req.params.id }); // Vérifie si des jobs ont cette catégorie
    if (jobs.length > 0) {
      return res.status(400).json({ message: "Impossible de supprimer cette catégorie, elle contient des jobs." });
    }

    // Supprimer la catégorie si aucun job n'est associé
    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});





module.exports = router;
