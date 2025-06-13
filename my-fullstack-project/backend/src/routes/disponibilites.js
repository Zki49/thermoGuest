const express = require('express');
const router = express.Router();
const disponibilitesController = require('../controllers/disponibilitesController');
const logUser = require('../middleware/logUser');
const authorizeRole = require('../middleware/authorizeRole');

router.get('/',logUser,authorizeRole(['admin']), disponibilitesController.getAll);
router.post('/add',logUser,authorizeRole(['admin']), disponibilitesController.create);
router.delete('/:id',logUser,authorizeRole(['admin']), disponibilitesController.remove);
router.put('/:id',logUser,authorizeRole(['admin']), disponibilitesController.update);

module.exports = router; 