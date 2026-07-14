const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema(
  {
    id: Number,
    company_id: Number,
    supplier_id: Number,
    product_id: Number,
    po_number: String,
    order_date: String,
    promised_date: String,
    status: String,
    priority: String,
    quantity_ordered: Number,
    quantity_received: Number,
    total_value_usd: Number,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema, 'purchase_orders');