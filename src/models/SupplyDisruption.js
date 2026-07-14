const mongoose = require('mongoose');

const supplyDisruptionSchema = new mongoose.Schema(
  {
    id: Number,
    supplier_id: Number,
    company_id: Number,
    disruption_type: String,
    severity: String,
    start_date: String,
    estimated_resolution_date: String,
    affected_lane: String,
    impact_summary: String,
    mitigation_action: String,
    status: String,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('SupplyDisruption', supplyDisruptionSchema, 'supply_disruptions');