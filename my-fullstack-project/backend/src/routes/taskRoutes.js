const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const logUser = require('../middleware/logUser');
const authorizeRole = require('../middleware/authorizeRole');


router.post('/',logUser,authorizeRole(['admin']), taskController.createTask);
router.get('/',logUser,authorizeRole(['admin','technician']), taskController.getTasks);
router.patch('/:id/status',logUser,authorizeRole(['admin','technician']), taskController.updateTaskStatus);

module.exports = router; 