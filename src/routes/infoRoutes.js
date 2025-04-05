const express = require("express");
const router = express.Router();
const ContactInfo = require("../models/contactInfo");

// Route GET pour récupérer les informations de contact
router.get("/contact-info", async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findOne(); // Trouver un seul enregistrement
    if (!contactInfo) {
      return res.status(404).json({ message: "Informations de contact non trouvées" });
    }
    res.json(contactInfo); // Retourner les informations de contact
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route POST pour ajouter des informations de contact
router.post("/contact-info", async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Validation simple
    if (!email || !phone) {
      return res.status(400).json({ message: "Email et téléphone sont requis" });
    }

    // Créer un nouvel objet ContactInfo
    const newContact = new ContactInfo({
      email,
      phone,
    });

    await newContact.save(); // Sauvegarder le nouvel enregistrement
    res.status(201).json({ message: "Informations de contact ajoutées avec succès", data: newContact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route PUT pour modifier les informations de contact (sans ID)
router.put("/contact-info", async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Validation simple
    if (!email || !phone) {
      return res.status(400).json({ message: "Email et téléphone sont requis" });
    }

    // Modifier les informations de contact existantes
    const updatedContact = await ContactInfo.findOneAndUpdate(
      {}, // Aucun ID spécifié, on met à jour l'unique enregistrement
      { email, phone },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Informations de contact non trouvées" });
    }

    res.json({ message: "Informations de contact mises à jour avec succès", data: updatedContact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route DELETE pour supprimer les informations de contact (sans ID)
router.delete("/contact-info", async (req, res) => {
  try {
    const deletedContact = await ContactInfo.findOneAndDelete(); // Supprimer l'unique enregistrement

    if (!deletedContact) {
      return res.status(404).json({ message: "Informations de contact non trouvées" });
    }

    res.json({ message: "Informations de contact supprimées avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
