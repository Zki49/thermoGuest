const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  let user = null;
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user;
    } catch (e) {
      req.user = null;
    }
  }
  console.log('Utilisateur connecté (global):', req.user || null);
  next();
};
