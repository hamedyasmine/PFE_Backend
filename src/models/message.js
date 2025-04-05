const mongoose = require('mongoose');

// Modèle Message
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Nom de l'utilisateur
  email: { type: String, required: true }, // Email de l'utilisateur
  subject: { type: String, required: true }, // Sujet du message
  message: { type: String, required: true }, // Contenu du message
  createdAt: { type: Date, default: Date.now } // Date de création du message
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
