require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Configuration de la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

// Test de la connexion à la base de données
sequelize.authenticate()
  .then(() => console.log('Connexion à la base de données établie avec succès.'))
  .catch(err => console.error('Impossible de se connecter à la base de données:', err));

// Route GET pour toutes les interventions (exemple avec données fictives)
app.get('/api/interventions', (req, res) => {
  const interventions = [
    {
      id: 1,
      date: '2024-03-20',
      status: 'PLANIFIÉ',
      description: 'Installation de prises électriques'
    },
    {
      id: 2,
      date: '2024-03-21',
      status: 'EN_COURS',
      description: "Remplacement d'ampoules"
    }
  ];
  res.json(interventions);
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré avec succès sur http://localhost:${PORT}`);
}); 