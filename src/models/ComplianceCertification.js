const mongoose = require('mongoose');

const complianceCertificationSchema = new mongoose.Schema(
  {
    id: Number,
    supplier_id: Number,
    certification_name: String,
    issuing_body: String,
    issue_date: String,
    expiry_date: String,
    status: String,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model(
  'ComplianceCertification',
  complianceCertificationSchema,
  'compliance_certifications'
);