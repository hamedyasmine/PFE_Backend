const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const authMiddleware = require("../middlewares/authMiddleware");

// 🟢 1. Envoi d'un message de contact
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Créer un nouveau message
    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();

    res.status(201).json({ message: "Message envoyé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔵 2. Récupérer tous les messages (accessible uniquement pour l'admin)
// Dans ton backend
router.get('/contact/messages', async (req, res) => {
  try {
    const messages = await Message.find();
    // Assurez-vous que la date est formatée correctement
    const formattedMessages = messages.map(message => ({
      ...message.toObject(),
      createdAt: message.createdAt.toISOString() // Convertir la date en ISO
    }));
    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH - Marquer ou démarcher un message comme important
// PATCH pour mettre à jour isImportant
router.patch('/messages/:id', async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      { isImportant: req.body.isImportant },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});



// Supprimer un message par ID
router.delete('/contact/messages/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    res.json({ message: 'Message supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
