const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    company_id: { type: Number, required: true, index: true },
    parent_supplier_id: { type: Number, default: null, index: true },
    tier: { type: Number, required: true, min: 1, max: 10, index: true },
    name: { type: String, required: true, trim: true },
    industry_id: { type: Number, index: true },
    country: { type: String, required: true, trim: true, index: true },
    city: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'watch'],
      default: 'active',
      index: true,
    },
    founded_year: { type: Number, min: 1800, max: 2100 },
    employee_count: { type: Number, min: 0 },
    annual_revenue_usd: { type: Number, min: 0 },
    risk_score: { type: Number, min: 0, max: 100, default: 0, index: true },
    relationship_type: {
      type: String,
      enum: ['direct_supplier', 'contract_manufacturer', 'subcontractor', 'raw_material_source', 'logistics_partner'],
      default: 'subcontractor',
    },
    criticality: {
      type: String,
      enum: ['low', 'medium', 'high', 'strategic'],
      default: 'medium',
      index: true,
    },
    visibility_status: {
      type: String,
      enum: ['verified', 'self_reported', 'needs_validation'],
      default: 'self_reported',
    },
    created_at: String,
  },
  {
    versionKey: false,
  }
);

supplierSchema.index({ company_id: 1, tier: 1, risk_score: -1 });
supplierSchema.index({ company_id: 1, parent_supplier_id: 1 });

module.exports = mongoose.model('Supplier', supplierSchema, 'suppliers');