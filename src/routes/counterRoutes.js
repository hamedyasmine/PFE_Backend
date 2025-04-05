const express = require("express");
const router = express.Router();
const { getCounters, updateCounters } = require("../controllers/counterController");
const Counter = require("../models/counter");

router.get("/getcounter", getCounters);
router.put("/updatecounter", updateCounters);
router.post("/", async (req, res) => {
    try {
      const counters = await Counter.create(req.body);
      res.status(201).json(counters);
    } catch (error) {
      console.error("Erreur lors de l'ajout des compteurs:", error);
      res.status(500).json({ message: "Erreur lors de l'ajout des compteurs" });
    }
  });

  // Route pour supprimer un compteur par son ID
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedCounter = await Counter.findByIdAndDelete(id);
  
      if (!deletedCounter) {
        return res.status(404).json({ message: "Compteur non trouvé" });
      }
  
      res.status(200).json({ message: "Compteur supprimé avec succès", deletedCounter });
    } catch (error) {
      console.error("Erreur lors de la suppression du compteur", error);
      res.status(500).json({ message: "Erreur lors de la suppression du compteur" });
    }
  });
  // Route pour modifier un compteur par son ID
router.put("/updatecounter/:id", async (req, res) => {
    const { id } = req.params;
    const { label, value } = req.body;
  
    try {
      const updatedCounter = await Counter.findByIdAndUpdate(
        id,
        { label, value },
        { new: true } // Retourner le compteur mis à jour
      );
  
      if (!updatedCounter) {
        return res.status(404).json({ message: "Compteur non trouvé" });
      }
  
      res.status(200).json(updatedCounter);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du compteur", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du compteur" });
    }
  });
  
  

module.exports = router;
