const Intervention = require('../models/Intervention');
const InterventionStock = require('../models/InterventionStock');
const Stock = require('../models/Stock');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

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
  const t = await sequelize.transaction();
  try {
    const { materials, ...interventionData } = req.body;
    // Créer l'intervention
    const intervention = await Intervention.create(interventionData, { transaction: t });

    // Pour chaque matériau, insérer dans intervention_stocks et mettre à jour le stock
    if (Array.isArray(materials)) {
      for (const mat of materials) {
        // Insérer dans la table d'association
        await InterventionStock.create({
          intervention_id: intervention.id,
          stock_id: mat.stock_id,
          quantity_used: mat.quantity_used
        }, { transaction: t });
        // Mettre à jour le stock
        const stock = await Stock.findByPk(mat.stock_id, { transaction: t });
        if (stock) {
          if (stock.quantity < mat.quantity_used) {
            throw new Error(`Stock insuffisant pour l'article ${stock.name}`);
          }
          stock.quantity -= mat.quantity_used;
          await stock.save({ transaction: t });
        }
      }
    }

    await t.commit();
    res.status(201).json(intervention);
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la création de l\'intervention:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
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