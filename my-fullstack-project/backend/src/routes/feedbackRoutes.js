const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Récupérer tous les feedbacks avec le nom du client
router.get('/feedbacks', feedbackController.getAllFeedbacks);

// Récupérer les feedbacks par ID d'intervention
router.get('/feedbacks/intervention/:interventionId', feedbackController.getFeedbacksByInterventionId);

// Créer un nouveau feedback
router.post('/feedbacks', feedbackController.createFeedback);

module.exports = router; 