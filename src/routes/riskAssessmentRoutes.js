const express = require('express');
const RiskAssessment = require('../models/RiskAssessment');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/supplier/:supplierId', async (req, res) => {
  try {
    const supplierId = Number(req.params.supplierId);
    const riskAssessments = await RiskAssessment.find({ supplier_id: supplierId });
    res.json(riskAssessments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch risk assessments for supplier.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const riskAssessments = await RiskAssessment.find();
    res.json(riskAssessments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch risk assessments.' });
  }
});

module.exports = router;