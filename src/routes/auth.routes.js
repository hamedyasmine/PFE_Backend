const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Register
// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    // Vérifier si les mots de passe correspondent
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
    }

    // Vérifier si l'email ou le téléphone existe déjà
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email ou téléphone déjà utilisé" });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Par défaut, le rôle est 'user'. Si un rôle 'admin' est spécifié, l'utilisateur sera un admin.
    const newRole = role === 'admin' ? 'admin' : 'user';

    // Création de l'utilisateur
    const user = new User({ name, email, phone, password: hashedPassword, role: newRole });
    await user.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });
    
    console.log('Utilisateur trouvé:', user);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Ne pas envoyer les mots de passe
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get un utilisateur par ID
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // Ne pas envoyer les mots de passe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Grâce au middleware authMiddleware

    const user = await User.findById(userId).select("-password"); // Récupérer l'utilisateur sans son mot de passe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Update user
router.put("/update/:id", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Mise à jour des champs
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    // Hash du nouveau mot de passe si fourni
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Sauvegarde des modifications
    await user.save();

    res.json({ message: "Utilisateur mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Delete user (par lui-même avec mot de passe ou par admin)
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const authenticatedUser = req.user; // Utilisateur authentifié (grâce au middleware)

    // Vérifier si l'utilisateur à supprimer existe
    const userToDelete = await User.findById(userId);
    if (!userToDelete) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Si c'est un admin, il peut supprimer directement
    if (authenticatedUser.role === "admin") {
      await User.findByIdAndDelete(userId);
      return res.json({ message: "Utilisateur supprimé par l'admin" });
    }

    // Si c'est un utilisateur qui veut supprimer son propre compte
    if (authenticatedUser.id !== userId) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    // Vérifier le mot de passe pour s'assurer que l'utilisateur peut supprimer son compte
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Mot de passe requis" });
    }

    // Comparer le mot de passe avec celui de l'utilisateur
    const isMatch = await bcrypt.compare(password, authenticatedUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Suppression du compte
    await User.findByIdAndDelete(userId);
    res.json({ message: "Compte supprimé avec succès" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
