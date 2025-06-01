const express = require('express');
const router = express.Router();

// Import des routes feedbacks
const feedbackRoutes = require('./feedbackRoutes');
const taskRoutes = require('./taskRoutes');
const userRoutes = require('./userRoutes');
const interventionRoutes = require('./interventionRoutes');
const stockRoutes = require('./stockRoutes');
const documentRoutes = require('./documentRoutes');
const interventionStockRoutes = require('./interventionStockRoutes');
const disponibilitesRoutes = require('./disponibilites');
// Utilisation de la route feedbacks
router.use(feedbackRoutes);
router.use('/tasks', taskRoutes);
router.use('/', userRoutes);
router.use('/', interventionRoutes);
router.use('/', stockRoutes);
router.use('/', documentRoutes);
router.use('/', interventionStockRoutes);
router.use('/disponibilites', disponibilitesRoutes);


// Export the router
module.exports = router;