const express = require('express');
const router = express.Router();

// Import des routes feedbacks
const feedbackRoutes = require('./feedbackRoutes');

// Utilisation de la route feedbacks
router.use(feedbackRoutes);

// Export the router
module.exports = router;