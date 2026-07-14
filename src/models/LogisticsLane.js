const mongoose = require('mongoose');

const logisticsLaneSchema = new mongoose.Schema(
  {
    id: Number,
    company_id: Number,
    supplier_id: Number,
    origin: String,
    destination: String,
    mode: String,
    carrier: String,
    avg_transit_days: Number,
    cost_per_unit_usd: Number,
    reliability_score: Number,
    carbon_kg: Number,
    status: String,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('LogisticsLane', logisticsLaneSchema, 'logistics_lanes');