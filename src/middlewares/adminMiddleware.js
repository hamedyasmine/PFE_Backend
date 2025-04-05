module.exports = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit. Réservé aux administrateurs." });
    }
    next();
  };
  