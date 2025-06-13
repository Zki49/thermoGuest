const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const logUser = require('../middleware/logUser');

// Récupérer tous les feedbacks avec le nom du client
router.get('/feedbacks',logUser, feedbackController.getAllFeedbacks);

// Récupérer les feedbacks par ID d'intervention
router.get('/feedbacks/intervention/:interventionId',logUser, feedbackController.getFeedbacksByInterventionId);

// Créer un nouveau feedback
router.post('/feedbacks',logUser, feedbackController.createFeedback);

module.exports = router; 