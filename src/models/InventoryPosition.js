const mongoose = require('mongoose');

const inventoryPositionSchema = new mongoose.Schema(
  {
    id: Number,
    company_id: Number,
    supplier_id: Number,
    product_id: Number,
    warehouse_location: String,
    on_hand_units: Number,
    safety_stock_units: Number,
    reorder_point_units: Number,
    days_of_supply: Number,
    inventory_status: String,
    last_updated: String,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('InventoryPosition', inventoryPositionSchema, 'inventory_positions');