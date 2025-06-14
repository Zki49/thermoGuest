require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const mainRoutes = require('./routes');
const logUser = require('./middleware/logUser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const app = express();

// Configuration de base Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation de mon API Express',
    },
    servers: [
      { url: 'http://localhost:3001' } // adapte le port si besoin
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'], // Chemin vers tes fichiers de routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Route Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(logUser);


// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://thermoguest.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());

// Utilisation du routeur principal
app.use('/api', mainRoutes);

// Middleware pour logger l'utilisateur connecté


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