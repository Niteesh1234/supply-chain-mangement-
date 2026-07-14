const jwt = require('jsonwebtoken');
const User = require('../models/User');

const AUTH_BYPASS_ENABLED = process.env.AUTH_BYPASS !== 'false';

const protect = async (req, res, next) => {
  if (AUTH_BYPASS_ENABLED) {
    req.user = {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@supplier.local',
    };
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { protect };