// routes/places.js
const express = require('express');
const router = express.Router();
const Place = require('../models/place');

// Route GET pour récupérer toutes les places
router.get('/places', async (req, res) => {
  try {
    const places = await Place.find(); // Récupérer toutes les places
    res.json(places);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route POST pour ajouter une place
router.post('/places', async (req, res) => {
  try {
    const { name } = req.body;

    // Validation simple
    if (!name) {
      return res.status(400).json({ message: 'Le nom est requis' });
    }

    // Créer un nouvel objet Place
    const newPlace = new Place({
      name,
    });

    await newPlace.save();
    res.status(201).json({ message: 'Place ajoutée avec succès', data: newPlace });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route DELETE pour supprimer une place
router.delete('/places/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPlace = await Place.findByIdAndDelete(id);

    if (!deletedPlace) {
      return res.status(404).json({ message: 'Place non trouvée' });
    }

    res.json({ message: 'Place supprimée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
