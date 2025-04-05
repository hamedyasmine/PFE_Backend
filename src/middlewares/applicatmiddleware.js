const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Accès refusé. Pas de token fourni." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Ajouter les infos de l'utilisateur à la requête
    next();
  } catch (error) {
    res.status(400).json({ message: "Token invalide." });
  }
};
