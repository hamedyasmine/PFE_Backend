const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors"); // 📌 Ajout de CORS
const fs = require("fs");

// 📌 Import des routes
const database = require("./src/database/db.config");
const categoryRoutes = require("./src/routes/category.routes");
const jobRoutes = require("./src/routes/job.routes");
const contactRoutes = require("./src/routes/contact.routes");
const applicationSimplifieeRoutes = require("./src/routes/applicationSimplifieeRoutes");
const path = require("path");
const authRoutes = require("./src/routes/auth.routes");
const applicationRoutes = require("./src/routes/applicationRoutes");
const counterRoutes = require("./src/routes/counterRoutes");
const infoRoutes = require("./src/routes/infoRoutes");
const placesRoutes = require('./src/routes/placeRoutes');
const questionRoutes = require("./src/routes/questions");
const app = express();

// 📂 Vérifier et créer le dossier `uploads/cvs_simplifies/` s'il n'existe pas
const cvsSimplifiesPath = path.join(__dirname, "uploads", "cvs_simplifies");
if (!fs.existsSync(cvsSimplifiesPath)) {
  fs.mkdirSync(cvsSimplifiesPath, { recursive: true });
  console.log("📂 Dossier 'uploads/cvs_simplifies/' créé.");
}

// 📌 Middleware
app.use(cors({ origin: "http://localhost:3000" })); // ✅ Permet les requêtes depuis le frontend
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/applications-simplifiees", applicationSimplifieeRoutes);
app.use("/api", infoRoutes);
app.use('/api', placesRoutes);
app.use("/api/questions", questionRoutes);
 // 📌 Rendre les fichiers accessibles

// 📌 Connexion à la base de données
mongoose
  .connect(database.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connecté à la base de données"))
  .catch((err) => console.error("❌ Erreur de connexion à la base de données:", err));

// 📌 Utilisation des routes
app.use("/api/auth", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", jobRoutes);
app.use("/api", contactRoutes);

app.use("/api/counters", counterRoutes);


// 📌 Route d'accueil
app.get("/", (req, res) => {
  res.send({ message: "Hello" });
});
// Route application 
app.use("/api/applications", applicationRoutes);

// 📌 Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
