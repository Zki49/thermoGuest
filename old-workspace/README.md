# Application de Gestion pour Chauffagiste

Application web et mobile pour la gestion complète des activités d'une entreprise de chauffagiste.

## Fonctionnalités principales

- Gestion des clients et de leur historique
- Planification des interventions
- Gestion des stocks
- Portail client
- Rapports et analyses

## Prérequis

- Node.js (v14 ou supérieur)
- PostgreSQL
- npm ou yarn

## Installation

1. Cloner le dépôt :
```bash
git clone [URL_DU_REPO]
cd chauffagiste-app
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
- Copier le fichier `.env.example` en `.env`
- Modifier les valeurs selon votre configuration

4. Initialiser la base de données :
```bash
npm run db:setup
```

5. Démarrer le serveur de développement :
```bash
npm run dev
```

## Structure du projet

```
chauffagiste-app/
├── server.js          # Point d'entrée du serveur
├── src/
│   ├── models/        # Modèles de données
│   ├── controllers/   # Contrôleurs
│   ├── routes/        # Routes API
│   └── middleware/    # Middleware personnalisés
├── public/            # Fichiers statiques
└── tests/             # Tests unitaires et d'intégration
```

## Technologies utilisées

- Backend : Node.js, Express, PostgreSQL, Sequelize
- Frontend : React.js
- Autres : JWT pour l'authentification, Jest pour les tests 