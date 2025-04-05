router.post("/apply", authMiddleware, upload.single("cv"), async (req, res) => {
  const userId = req.user ? req.user.id : null; // Assurez-vous que userId est valide
  const { jobId } = req.body;
  const cvFile = req.file;

  // Vérification stricte de la présence de userId et jobId
  if (!userId) {
    return res.status(400).json({ message: "User ID est requis" });
  }

  if (!jobId) {
    return res.status(400).json({ message: "Job ID est requis" });
  }

  if (!cvFile) {
    return res.status(400).json({ message: "CV est requis" });
  }

  try {
    // Vérifier si le job existe
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job non trouvé" });
    }

    // Vérifier si l'utilisateur a déjà postulé pour ce job
    const existingApplication = await Application.findOne({ user: userId, job: jobId });
    if (existingApplication) {
      return res.status(400).json({ message: "Vous avez déjà postulé pour ce job" });
    }

    // Créer une nouvelle candidature
    const application = new Application({
      user: userId,
      job: jobId,
      cv: cvFile.path, // Enregistrer le chemin du CV
    });

    await application.save();

    res.status(201).json({ message: "Candidature envoyée avec succès", application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});
