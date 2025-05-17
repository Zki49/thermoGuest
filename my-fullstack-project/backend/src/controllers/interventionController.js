const Intervention = require('../models/Intervention');
const { Op } = require('sequelize');

const getAllInterventions = async (req, res) => {
  try {
    const { user_id, role } = req.query;
    let where = {};
    if (!(role && role === 'admin')) {
      if (user_id) {
        where.user_id = user_id;
      }
    }
    console.log('Fetching interventions with where clause:', where);
    const interventions = await Intervention.findAll({ where });
    console.log('Found interventions:', interventions.map(i => ({
      id: i.id,
      scheduled_date: i.scheduled_date,
      status: i.status,
      description: i.description
    })));
    res.json(interventions);
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getTodayInterventions = async (req, res) => {
  try {
    const { user_id } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = {
      user_id: user_id,
      scheduled_date: {
        [Op.gte]: today,
        [Op.lt]: tomorrow
      }
    };

    console.log('Fetching today interventions with where clause:', where);
    const interventions = await Intervention.findAll({ 
      where,
      order: [['scheduled_date', 'ASC']]
    });

    console.log('Found today interventions:', interventions.map(i => ({
      id: i.id,
      scheduled_date: i.scheduled_date,
      status: i.status,
      description: i.description
    })));

    res.json(interventions);
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions du jour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createIntervention = async (req, res) => {
  try {
    const intervention = await Intervention.create(req.body);
    res.status(201).json(intervention);
  } catch (error) {
    console.error('Erreur lors de la création de l\'intervention:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getInterventionById = async (req, res) => {
  try {
    const intervention = await Intervention.findByPk(req.params.id);
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention non trouvée' });
    }
    res.json(intervention);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getAllInterventions,
  createIntervention,
  getTodayInterventions,
  getInterventionById
}; 