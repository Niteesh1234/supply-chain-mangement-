const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema(
  {
    id: Number,
    supplier_id: Number,
    assessment_date: String,
    risk_category: String,
    risk_score: Number,
    notes: String,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema, 'risk_assessments');