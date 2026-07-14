const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    industry_id: Number,
    headquarters_country: String,
    founded_year: Number,
    employee_count: Number,
    annual_revenue_usd: Number,
    stock_ticker: String,
    created_at: String,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('Company', companySchema, 'companies');