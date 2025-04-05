const jwt = require('jsonwebtoken');

// Middleware d'authentification JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ message: "Token requis" });
  }

  const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token;

  jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide" });
    }

    req.user = user;
    console.log("Authentification réussie, utilisateur:", user); // Ajout de logs
    next();
  });
};



module.exports = authenticateJWT;
