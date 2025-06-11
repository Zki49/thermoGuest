const Task = require('../models/Task');

// Créer une nouvelle tâche
exports.createTask = async (req, res) => {
  try {
    const { description } = req.body;
    // L'ID de l'admin est 3 comme demandé
    const employee = 3;

    const newTask = await Task.create({
      employee,
      description,
      status: 'À_FAIRE',
      date_created: new Date(),
      date_updated: new Date(),
    });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const user = req.user;
    let where = {
      status: 'À_FAIRE'
    };
    if (user && user.role !== 'admin') {
      where.employee = user.id;
    }
    const tasks = await Task.findAll({ 
      where, 
      order: [['date_created', 'DESC']] 
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    task.status = status;
    task.date_updated = new Date();
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 