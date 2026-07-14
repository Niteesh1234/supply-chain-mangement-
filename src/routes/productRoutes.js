const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/supplier/:supplierId', async (req, res) => {
  try {
    const supplierId = Number(req.params.supplierId);
    const products = await Product.find({ supplier_id: supplierId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products for supplier.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
});

module.exports = router;