const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Récupérer tous les feedbacks avec le nom du client
exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [{
        model: User,
        as: 'client',
        attributes: ['first_name', 'last_name']
      }],
      order: [['id', 'ASC']]
    });
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des feedbacks' });
  }
};

// Récupérer les feedbacks par ID d'intervention avec le nom du client
exports.getFeedbacksByInterventionId = async (req, res) => {
  try {
    const { interventionId } = req.params;
    const feedbacks = await Feedback.findAll({
      where: { intervention_id: interventionId },
      include: [{
        model: User,
        as: 'client',
        attributes: ['first_name', 'last_name']
      }],
      order: [['id', 'ASC']]
    });

    // Mapper pour inclure le nom complet du client
    const formattedFeedbacks = feedbacks.map(fb => ({
      id: fb.id,
      intervention_id: fb.intervention_id,
      client_id: fb.client_id,
      comment: fb.comment,
      rating: fb.rating,
      client_name: fb.client ? `${fb.client.first_name} ${fb.client.last_name}` : 'Client inconnu'
    }));

    res.json(formattedFeedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des feedbacks pour l\'intervention' });
  }
}; 