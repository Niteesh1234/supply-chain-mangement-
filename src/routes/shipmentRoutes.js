const express = require('express');
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/supplier/:supplierId', async (req, res) => {
  try {
    const supplierId = Number(req.params.supplierId);
    const shipments = await Shipment.find({ supplier_id: supplierId });
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shipments for supplier.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const shipments = await Shipment.find();
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shipments.' });
  }
});

module.exports = router;