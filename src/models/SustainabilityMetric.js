const mongoose = require('mongoose');

const sustainabilityMetricSchema = new mongoose.Schema(
  {
    id: Number,
    supplier_id: Number,
    reporting_period: String,
    carbon_intensity_kg_per_unit: Number,
    renewable_energy_pct: Number,
    water_usage_kl: Number,
    waste_recycled_pct: Number,
    esg_score: Number,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('SustainabilityMetric', sustainabilityMetricSchema, 'sustainability_metrics');