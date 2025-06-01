const express = require('express');
const router = express.Router();
const disponibilitesController = require('../controllers/disponibilitesController');

// GET /api/disponibilites?technician_id=...
router.get('/', disponibilitesController.getAll);

// POST /api/disponibilites
router.post('/', disponibilitesController.create);

// DELETE /api/disponibilites/:id
router.delete('/:id', disponibilitesController.remove);

// PUT /api/disponibilites/:id
router.put('/:id', disponibilitesController.update);

module.exports = router; 