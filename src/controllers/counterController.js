const Counter = require("../models/counter");

// Obtenir tous les compteurs
const getCounters = async (req, res) => {
  try {
    const counters = await Counter.find();
    res.json(counters);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mettre à jour les compteurs
const updateCounters = async (req, res) => {
  try {
    await Counter.deleteMany({});
    await Counter.insertMany(req.body);
    res.json({ message: "Compteurs mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

module.exports = { getCounters, updateCounters };
