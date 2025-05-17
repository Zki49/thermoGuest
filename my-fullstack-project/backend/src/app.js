require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const interventionRoutes = require('./routes/interventionRoutes');
const userRoutes = require('./routes/userRoutes');
const stockRoutes = require('./routes/stockRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const documentRoutes = require('./routes/documentRoutes');
const interventionStockRoutes = require('./routes/interventionStockRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', interventionRoutes);
app.use('/api', userRoutes);
app.use('/api', stockRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', documentRoutes);
app.use('/api', interventionStockRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

// Synchroniser la base de données et démarrer le serveur
sequelize.sync({ force: false }).then(() => {
  console.log('Base de données synchronisée');
  app.listen(process.env.PORT || 3001, () => {
    console.log(`Serveur démarré sur le port ${process.env.PORT || 3001}`);
  });
}).catch(err => {
  console.error('Erreur lors de la synchronisation de la base de données:', err);
});