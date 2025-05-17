const Intervention = require('../models/Intervention');
const sequelize = require('../config/database');

async function createTestInterventions() {
  try {
    console.log('Début de la création des interventions de test...');

    // Synchroniser la base de données en forçant la recréation des tables
    console.log('Synchronisation de la base de données...');
    await sequelize.sync({ force: true });
    console.log('Base de données synchronisée');

    // Créer des interventions de test
    const testInterventions = [
      {
        date: new Date(),
        status: 'PLANIFIÉ',
        description: 'Maintenance préventive du système de chauffage'
      },
      {
        date: new Date(Date.now() + 86400000), // Demain
        status: 'EN_COURS',
        description: 'Réparation d\'une fuite d\'eau'
      },
      {
        date: new Date(Date.now() - 86400000), // Hier
        status: 'TERMINÉ',
        description: 'Installation d\'un nouveau thermostat'
      },
      {
        date: new Date(Date.now() + 172800000), // Dans 2 jours
        status: 'PLANIFIÉ',
        description: 'Vérification des détecteurs de fumée'
      },
      {
        date: new Date(Date.now() + 259200000), // Dans 3 jours
        status: 'PLANIFIÉ',
        description: 'Nettoyage des conduits de ventilation'
      }
    ];

    // Insérer les interventions
    const createdInterventions = await Intervention.bulkCreate(testInterventions);
    console.log(`${createdInterventions.length} interventions créées avec succès`);

    // Afficher les interventions créées
    console.log('Interventions créées :');
    createdInterventions.forEach(intervention => {
      console.log({
        id: intervention.id,
        date: intervention.date,
        status: intervention.status,
        description: intervention.description
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création des interventions de test:', error);
    process.exit(1);
  }
}

createTestInterventions(); 