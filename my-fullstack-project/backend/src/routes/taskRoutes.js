const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');


router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.patch('/:id/status', taskController.updateTaskStatus);

module.exports = router; 