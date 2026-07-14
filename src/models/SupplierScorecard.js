const mongoose = require('mongoose');

const supplierScorecardSchema = new mongoose.Schema(
  {
    id: Number,
    supplier_id: Number,
    period: String,
    on_time_delivery_rate: Number,
    quality_ppm: Number,
    responsiveness_score: Number,
    cost_variance_pct: Number,
    overall_score: Number,
    trend: String,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('SupplierScorecard', supplierScorecardSchema, 'supplier_scorecards');