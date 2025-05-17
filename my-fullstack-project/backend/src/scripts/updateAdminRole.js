require('dotenv').config();
const User = require('../models/User');

async function updateAdminRole() {
  try {
    console.log('Recherche de l\'admin...');
    
    const admin = await User.findOne({ where: { email: 'admin@example.com' } });
    console.log('Admin trouvé:', admin ? {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      password: admin.password
    } : 'Non trouvé');

    if (!admin) {
      console.log('Admin non trouvé');
      process.exit(1);
    }

    // Mettre à jour le rôle
    await admin.update({ role: 'admin' });
    console.log('Rôle mis à jour avec succès');
    
    // Vérifier la mise à jour
    const updatedAdmin = await User.findOne({ where: { email: 'admin@example.com' } });
    console.log('Admin après mise à jour:', {
      id: updatedAdmin.id,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      password: updatedAdmin.password
    });

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    process.exit(1);
  }
}

updateAdminRole(); 