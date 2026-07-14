const express = require('express');
const Supplier = require('../models/Supplier');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch suppliers.' });
  }
});

module.exports = router;