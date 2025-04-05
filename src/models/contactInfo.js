const mongoose = require("mongoose");

const contactInfoSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Créer un modèle à partir du schéma
const ContactInfo = mongoose.model("ContactInfo", contactInfoSchema);

module.exports = ContactInfo;
