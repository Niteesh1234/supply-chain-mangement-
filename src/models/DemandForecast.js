const mongoose = require('mongoose');

const demandForecastSchema = new mongoose.Schema(
  {
    id: Number,
    company_id: Number,
    product_id: Number,
    forecast_month: String,
    forecast_units: Number,
    committed_supply_units: Number,
    demand_signal: String,
    confidence_score: Number,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('DemandForecast', demandForecastSchema, 'demand_forecasts');