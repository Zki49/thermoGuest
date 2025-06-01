const express = require('express');
const router = express.Router();
const disponibilitesController = require('../controllers/disponibilitesController');

router.get('/', disponibilitesController.getAll);
router.post('/add', disponibilitesController.create);
router.delete('/:id', disponibilitesController.remove);
router.put('/:id', disponibilitesController.update);

module.exports = router; 