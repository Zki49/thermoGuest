require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const path = require('path');
const authRoutes = require('./src/routes/authRoutes');

console.log('Démarrage de l\'application...');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

console.log('Configuration de la base de données...');

// Configuration de la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME || 'chauffagiste_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'admin123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// Test de la connexion à la base de données
sequelize.authenticate()
  .then(() => console.log('Connexion à la base de données établie avec succès.'))
  .catch(err => console.error('Impossible de se connecter à la base de données:', err));

console.log('Configuration des routes...');

// Routes
app.use('/api/auth', authRoutes);

// Routes de base
app.get('/', (req, res) => {
  res.json({ message: 'API de gestion pour chauffagiste' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

// Démarrage du serveur
const PORT = parseInt(process.env.PORT) || 3001;

console.log(`Tentative de démarrage du serveur sur le port ${PORT}...`);

// Création du serveur avec gestion explicite des erreurs
const server = app.listen(PORT, '127.0.0.1', (error) => {
    if (error) {
        console.error('Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
    console.log(`Serveur démarré avec succès sur http://127.0.0.1:${PORT}`);
    console.log('Pour tester :');
    console.log(`1. http://127.0.0.1:${PORT}`);
    console.log(`2. http://127.0.0.1:${PORT}/api/auth/login`);
});

// Gestion explicite des erreurs du serveur
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Le port ${PORT} est déjà utilisé. Tentative avec le port ${PORT + 1}...`);
        server.listen(PORT + 1, '127.0.0.1');
    } else {
        console.error('Erreur du serveur:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', () => {
    console.log('Arrêt du serveur...');
    server.close(() => {
        console.log('Serveur arrêté.');
        process.exit(0);
    });
});

process.on('uncaughtException', (error) => {
    console.error('Erreur non gérée:', error);
    process.exit(1);
}); 

const interventionsRouter = require('./src/routes/interventions');
app.use(interventionsRouter);