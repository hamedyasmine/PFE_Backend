const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// L'URL de votre service Flask (à remplacer par l'URL ngrok générée)
const FLASK_SERVICE_URL = 'https://votre-url-ngrok-generee.ngrok.io/upload';

// Endpoint pour analyser la similarité des CV
router.post('/analyze-cv', upload.single('cv_file'), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const cvFile = req.file;
    
    if (!cvFile || !jobDescription) {
      return res.status(400).json({ error: 'CV et description du poste requis' });
    }
    
    // Préparer les données pour le service Flask
    const formData = new FormData();
    formData.append('cv_file', fs.createReadStream(cvFile.path), cvFile.originalname);
    formData.append('job_description', jobDescription);
    
    // Appeler le service Flask
    const response = await axios.post(FLASK_SERVICE_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    // Nettoyer le fichier temporaire
    fs.unlinkSync(cvFile.path);
    
    // Renvoyer les résultats au frontend
    return res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de l\'analyse du CV:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'analyse du CV' });
  }
});

module.exports = router;