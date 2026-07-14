const express = require('express');
const ComplianceCertification = require('../models/ComplianceCertification');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/expiring-soon', async (req, res) => {
  try {
    const today = new Date();
    const after90Days = new Date();
    after90Days.setDate(today.getDate() + 90);

    const certifications = await ComplianceCertification.find({
      status: 'valid',
      expiry_date: {
        $gte: today.toISOString().split('T')[0],
        $lte: after90Days.toISOString().split('T')[0],
      },
    });

    res.json(certifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expiring certifications.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const certifications = await ComplianceCertification.find();
    res.json(certifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch compliance certifications.' });
  }
});

module.exports = router;