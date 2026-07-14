const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id: Number,
    supplier_id: Number,
    name: String,
    category: String,
    unit_cost_usd: Number,
    unit_of_measure: String,
    lead_time_days: Number,
    created_at: String,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('Product', productSchema, 'products');