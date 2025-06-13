const express = require('express');
const router = express.Router();
const interventionController = require('../controllers/interventionController');
const logUser = require('../middleware/logUser');
const authorizeRole = require('../middleware/authorizeRole');

router.get('/interventions',logUser, interventionController.getAllInterventions);
router.get('/interventions/today/:user_id', interventionController.getTodayInterventions);
router.get('/interventions/:id',logUser, interventionController.getInterventionById);
router.delete('/interventions/:id', logUser,authorizeRole(['admin','technician']), interventionController.deleteIntervention);
router.post('/interventions', logUser,authorizeRole(['admin','technician']),interventionController.createIntervention);

module.exports = router; 