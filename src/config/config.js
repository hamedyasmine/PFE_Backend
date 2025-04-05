require("dotenv").config();

const config = {
  DB_URL: process.env.DATABASE_URL,
};

console.log("Database URL:", config.DB_URL); // Vérifie si l'URL s'affiche

module.exports = config;
