const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Route pour créer une tâche
router.post('/', taskController.createTask);

module.exports = router; 