const express = require('express');
const router = express.Router();
const interventionController = require('../controllers/interventionController');

router.delete('/interventions/:id', interventionController.deleteIntervention);
router.get('/interventions', interventionController.getAllInterventions);
router.get('/interventions/today/:user_id', interventionController.getTodayInterventions);
router.post('/interventions', interventionController.createIntervention);


module.exports = router; 