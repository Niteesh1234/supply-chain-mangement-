const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema(
  {
    id: Number,
    supplier_id: Number,
    product_id: Number,
    quantity: Number,
    shipment_date: String,
    delivery_date: String,
    status: String,
    destination_country: String,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('Shipment', shipmentSchema, 'shipments');