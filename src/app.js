require('dotenv').config();

const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const supplierHierarchyRoutes = require('./routes/supplierHierarchyRoutes');
const productRoutes = require('./routes/productRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const riskAssessmentRoutes = require('./routes/riskAssessmentRoutes');
const complianceCertificationRoutes = require('./routes/complianceCertificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const isAuthBypassEnabled = process.env.AUTH_BYPASS !== 'false';

if (!isAuthBypassEnabled && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required when AUTH_BYPASS is disabled.');
}

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed.',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/supplier-hierarchy', supplierHierarchyRoutes);
app.use('/api/products', productRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/risk-assessments', riskAssessmentRoutes);
app.use('/api/compliance-certifications', complianceCertificationRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('Supplier Management System backend is running');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'supplier-management-system-backend',
    authBypass: isAuthBypassEnabled,
  });
});

module.exports = app;