const Company = require('./models/Company');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
const Shipment = require('./models/Shipment');
const RiskAssessment = require('./models/RiskAssessment');
const ComplianceCertification = require('./models/ComplianceCertification');
const PurchaseOrder = require('./models/PurchaseOrder');
const InventoryPosition = require('./models/InventoryPosition');
const SupplyDisruption = require('./models/SupplyDisruption');
const LogisticsLane = require('./models/LogisticsLane');
const DemandForecast = require('./models/DemandForecast');
const SupplierScorecard = require('./models/SupplierScorecard');
const SustainabilityMetric = require('./models/SustainabilityMetric');

const demoCompanies = [
  {
    id: 1,
    name: 'NovaTech Manufacturing',
    industry_id: 101,
    headquarters_country: 'United States',
    founded_year: 2009,
    employee_count: 4200,
    annual_revenue_usd: 285000000,
    stock_ticker: 'NOVA',
    created_at: '2026-01-05',
  },
  {
    id: 2,
    name: 'Meridian Retail Group',
    industry_id: 205,
    headquarters_country: 'Germany',
    founded_year: 1998,
    employee_count: 8300,
    annual_revenue_usd: 412000000,
    stock_ticker: 'MRDG',
    created_at: '2026-01-05',
  },
  {
    id: 3,
    name: 'Helios Mobility Systems',
    industry_id: 309,
    headquarters_country: 'Japan',
    founded_year: 2014,
    employee_count: 5100,
    annual_revenue_usd: 338000000,
    stock_ticker: 'HELI',
    created_at: '2026-01-05',
  },
];

const demoSuppliers = [
  {
    id: 101,
    company_id: 1,
    parent_supplier_id: null,
    tier: 1,
    name: 'Northstar Metals',
    industry_id: 401,
    country: 'United States',
    city: 'Detroit',
    status: 'active',
    founded_year: 2001,
    employee_count: 740,
    annual_revenue_usd: 92000000,
    risk_score: 31,
    created_at: '2026-01-05',
  },
  {
    id: 102,
    company_id: 1,
    parent_supplier_id: null,
    tier: 1,
    name: 'BluePeak Electronics',
    industry_id: 402,
    country: 'South Korea',
    city: 'Seoul',
    status: 'active',
    founded_year: 2007,
    employee_count: 610,
    annual_revenue_usd: 118000000,
    risk_score: 46,
    created_at: '2026-01-06',
  },
  {
    id: 103,
    company_id: 1,
    parent_supplier_id: 101,
    tier: 2,
    name: 'Alloy Forge Subs',
    industry_id: 403,
    country: 'Canada',
    city: 'Hamilton',
    status: 'active',
    founded_year: 2012,
    employee_count: 260,
    annual_revenue_usd: 28000000,
    risk_score: 38,
    created_at: '2026-01-07',
  },
  {
    id: 104,
    company_id: 1,
    parent_supplier_id: 102,
    tier: 2,
    name: 'Precision Circuits',
    industry_id: 404,
    country: 'Taiwan',
    city: 'Hsinchu',
    status: 'active',
    founded_year: 2011,
    employee_count: 320,
    annual_revenue_usd: 41000000,
    risk_score: 58,
    created_at: '2026-01-08',
  },
  {
    id: 105,
    company_id: 1,
    parent_supplier_id: 104,
    tier: 3,
    name: 'CleanCore Components',
    industry_id: 405,
    country: 'Malaysia',
    city: 'Penang',
    status: 'active',
    founded_year: 2018,
    employee_count: 180,
    annual_revenue_usd: 16000000,
    risk_score: 67,
    created_at: '2026-01-10',
  },
  {
    id: 106,
    company_id: 2,
    parent_supplier_id: null,
    tier: 1,
    name: 'SkyBridge Logistics',
    industry_id: 406,
    country: 'Netherlands',
    city: 'Rotterdam',
    status: 'active',
    founded_year: 2004,
    employee_count: 970,
    annual_revenue_usd: 151000000,
    risk_score: 29,
    created_at: '2026-01-06',
  },
  {
    id: 107,
    company_id: 2,
    parent_supplier_id: null,
    tier: 1,
    name: 'FreshLine Packaging',
    industry_id: 407,
    country: 'Poland',
    city: 'Warsaw',
    status: 'active',
    founded_year: 2010,
    employee_count: 540,
    annual_revenue_usd: 64000000,
    risk_score: 36,
    created_at: '2026-01-08',
  },
  {
    id: 108,
    company_id: 2,
    parent_supplier_id: 107,
    tier: 2,
    name: 'HarborPrint Labs',
    industry_id: 408,
    country: 'Czech Republic',
    city: 'Brno',
    status: 'inactive',
    founded_year: 2015,
    employee_count: 120,
    annual_revenue_usd: 12000000,
    risk_score: 61,
    created_at: '2026-01-09',
  },
  {
    id: 109,
    company_id: 3,
    parent_supplier_id: null,
    tier: 1,
    name: 'VoltEdge Cells',
    industry_id: 409,
    country: 'Japan',
    city: 'Osaka',
    status: 'active',
    founded_year: 2013,
    employee_count: 680,
    annual_revenue_usd: 134000000,
    risk_score: 44,
    created_at: '2026-01-07',
  },
  {
    id: 110,
    company_id: 3,
    parent_supplier_id: 109,
    tier: 2,
    name: 'AeroMold Systems',
    industry_id: 410,
    country: 'Thailand',
    city: 'Rayong',
    status: 'active',
    founded_year: 2016,
    employee_count: 250,
    annual_revenue_usd: 23000000,
    risk_score: 52,
    created_at: '2026-01-09',
  },
  {
    id: 111,
    company_id: 3,
    parent_supplier_id: 110,
    tier: 3,
    name: 'Quantum Plastics',
    industry_id: 411,
    country: 'Vietnam',
    city: 'Hai Phong',
    status: 'active',
    founded_year: 2019,
    employee_count: 145,
    annual_revenue_usd: 14000000,
    risk_score: 73,
    created_at: '2026-01-12',
  },
  {
    id: 112,
    company_id: 1,
    parent_supplier_id: 105,
    tier: 4,
    name: 'RareEarth Refining Network',
    industry_id: 412,
    country: 'Malaysia',
    city: 'Kuantan',
    status: 'active',
    founded_year: 2017,
    employee_count: 95,
    annual_revenue_usd: 8600000,
    risk_score: 78,
    created_at: '2026-01-14',
  },
  {
    id: 113,
    company_id: 1,
    parent_supplier_id: 112,
    tier: 5,
    name: 'MineGate Minerals Cooperative',
    industry_id: 413,
    country: 'Australia',
    city: 'Perth',
    status: 'watch',
    founded_year: 2008,
    employee_count: 210,
    annual_revenue_usd: 19000000,
    risk_score: 69,
    created_at: '2026-01-15',
  },
  {
    id: 114,
    company_id: 2,
    parent_supplier_id: 108,
    tier: 3,
    name: 'LabelChem Inks',
    industry_id: 414,
    country: 'Czech Republic',
    city: 'Ostrava',
    status: 'active',
    founded_year: 2014,
    employee_count: 88,
    annual_revenue_usd: 7400000,
    risk_score: 55,
    created_at: '2026-01-14',
  },
  {
    id: 115,
    company_id: 2,
    parent_supplier_id: 114,
    tier: 4,
    name: 'BioResin Feedstock',
    industry_id: 415,
    country: 'Sweden',
    city: 'Gothenburg',
    status: 'active',
    founded_year: 2020,
    employee_count: 63,
    annual_revenue_usd: 5200000,
    risk_score: 42,
    created_at: '2026-01-15',
  },
  {
    id: 116,
    company_id: 3,
    parent_supplier_id: 111,
    tier: 4,
    name: 'Polymer Additives Works',
    industry_id: 416,
    country: 'Vietnam',
    city: 'Da Nang',
    status: 'active',
    founded_year: 2018,
    employee_count: 132,
    annual_revenue_usd: 9800000,
    risk_score: 82,
    created_at: '2026-01-16',
  },
  {
    id: 117,
    company_id: 3,
    parent_supplier_id: 116,
    tier: 5,
    name: 'Monomer SourceWorks',
    industry_id: 417,
    country: 'Indonesia',
    city: 'Surabaya',
    status: 'watch',
    founded_year: 2016,
    employee_count: 176,
    annual_revenue_usd: 12400000,
    risk_score: 64,
    created_at: '2026-01-17',
  },
  {
    id: 118,
    company_id: 1,
    parent_supplier_id: 103,
    tier: 3,
    name: 'HeatTreat Partners',
    industry_id: 418,
    country: 'Mexico',
    city: 'Monterrey',
    status: 'active',
    founded_year: 2011,
    employee_count: 155,
    annual_revenue_usd: 13200000,
    risk_score: 47,
    created_at: '2026-01-18',
  },
  {
    id: 119,
    company_id: 1,
    parent_supplier_id: 118,
    tier: 4,
    name: 'Alloy Powder Co.',
    industry_id: 419,
    country: 'United States',
    city: 'Pittsburgh',
    status: 'active',
    founded_year: 2006,
    employee_count: 220,
    annual_revenue_usd: 24600000,
    risk_score: 58,
    created_at: '2026-01-19',
  },
];

const enrichSupplierForDemo = (supplier) => ({
  relationship_type:
    supplier.tier === 1
      ? supplier.name.toLowerCase().includes('logistics')
        ? 'logistics_partner'
        : 'direct_supplier'
      : supplier.tier >= 4
        ? 'raw_material_source'
        : 'subcontractor',
  criticality:
    supplier.risk_score >= 75
      ? 'strategic'
      : supplier.risk_score >= 60
        ? 'high'
        : supplier.risk_score >= 40
          ? 'medium'
          : 'low',
  visibility_status:
    supplier.tier <= 2 ? 'verified' : supplier.tier <= 4 ? 'self_reported' : 'needs_validation',
  ...supplier,
});

const enrichedDemoSuppliers = demoSuppliers.map(enrichSupplierForDemo);

const demoProducts = [
  { id: 201, supplier_id: 101, name: 'Titanium Frames', category: 'Metals', unit_cost_usd: 1200, unit_of_measure: 'batch', lead_time_days: 18, created_at: '2026-01-05' },
  { id: 202, supplier_id: 102, name: 'Control Boards', category: 'Electronics', unit_cost_usd: 340, unit_of_measure: 'unit', lead_time_days: 14, created_at: '2026-01-05' },
  { id: 203, supplier_id: 104, name: 'Sensor Circuits', category: 'Components', unit_cost_usd: 120, unit_of_measure: 'unit', lead_time_days: 11, created_at: '2026-01-06' },
  { id: 204, supplier_id: 106, name: 'Fulfillment Routing', category: 'Logistics', unit_cost_usd: 4800, unit_of_measure: 'shipment', lead_time_days: 6, created_at: '2026-01-07' },
  { id: 205, supplier_id: 107, name: 'Eco Packaging Kits', category: 'Packaging', unit_cost_usd: 62, unit_of_measure: 'carton', lead_time_days: 9, created_at: '2026-01-07' },
  { id: 206, supplier_id: 109, name: 'Battery Modules', category: 'Energy', unit_cost_usd: 990, unit_of_measure: 'unit', lead_time_days: 20, created_at: '2026-01-08' },
  { id: 207, supplier_id: 110, name: 'Composite Casings', category: 'Industrial', unit_cost_usd: 420, unit_of_measure: 'unit', lead_time_days: 13, created_at: '2026-01-08' },
  { id: 208, supplier_id: 112, name: 'Rare Earth Oxide Blend', category: 'Raw Materials', unit_cost_usd: 860, unit_of_measure: 'kg', lead_time_days: 31, created_at: '2026-01-14' },
  { id: 209, supplier_id: 113, name: 'Concentrated Mineral Feed', category: 'Raw Materials', unit_cost_usd: 540, unit_of_measure: 'kg', lead_time_days: 42, created_at: '2026-01-15' },
  { id: 210, supplier_id: 114, name: 'Low-VOC Label Ink', category: 'Chemicals', unit_cost_usd: 28, unit_of_measure: 'liter', lead_time_days: 15, created_at: '2026-01-14' },
  { id: 211, supplier_id: 116, name: 'Flame Retardant Additive', category: 'Chemicals', unit_cost_usd: 76, unit_of_measure: 'kg', lead_time_days: 24, created_at: '2026-01-16' },
];

const demoShipments = [
  { id: 301, supplier_id: 101, product_id: 201, quantity: 120, shipment_date: '2026-06-01', delivery_date: '2026-06-16', status: 'delivered', destination_country: 'United States' },
  { id: 302, supplier_id: 102, product_id: 202, quantity: 340, shipment_date: '2026-06-06', delivery_date: '2026-06-20', status: 'in_transit', destination_country: 'Mexico' },
  { id: 303, supplier_id: 104, product_id: 203, quantity: 520, shipment_date: '2026-06-10', delivery_date: '2026-06-22', status: 'delayed', destination_country: 'United States' },
  { id: 304, supplier_id: 106, product_id: 204, quantity: 72, shipment_date: '2026-06-08', delivery_date: '2026-06-14', status: 'delivered', destination_country: 'Germany' },
  { id: 305, supplier_id: 107, product_id: 205, quantity: 640, shipment_date: '2026-06-12', delivery_date: '2026-06-21', status: 'pending', destination_country: 'France' },
  { id: 306, supplier_id: 109, product_id: 206, quantity: 280, shipment_date: '2026-06-05', delivery_date: '2026-06-24', status: 'delivered', destination_country: 'Japan' },
  { id: 307, supplier_id: 110, product_id: 207, quantity: 190, shipment_date: '2026-06-14', delivery_date: '2026-06-28', status: 'in_transit', destination_country: 'Singapore' },
];

const demoRiskAssessments = [
  { id: 401, supplier_id: 101, assessment_date: '2026-05-20', risk_category: 'operational', risk_score: 31, notes: 'Stable material availability and strong OTIF performance.' },
  { id: 402, supplier_id: 102, assessment_date: '2026-05-21', risk_category: 'geopolitical', risk_score: 46, notes: 'Moderate exposure to port congestion and export lead-time swings.' },
  { id: 403, supplier_id: 104, assessment_date: '2026-05-22', risk_category: 'quality', risk_score: 58, notes: 'Yield variability requires tighter incoming QA controls.' },
  { id: 404, supplier_id: 105, assessment_date: '2026-05-23', risk_category: 'environmental', risk_score: 67, notes: 'Flood season planning needed for the subcontractor site.' },
  { id: 405, supplier_id: 106, assessment_date: '2026-05-22', risk_category: 'logistics', risk_score: 29, notes: 'Highly reliable logistics lanes and warehouse visibility.' },
  { id: 406, supplier_id: 108, assessment_date: '2026-05-22', risk_category: 'financial', risk_score: 61, notes: 'Reduced capacity after customer concentration pressure.' },
  { id: 407, supplier_id: 109, assessment_date: '2026-05-24', risk_category: 'capacity', risk_score: 44, notes: 'Battery demand is growing but expansion plans are on track.' },
  { id: 408, supplier_id: 111, assessment_date: '2026-05-25', risk_category: 'compliance', risk_score: 73, notes: 'Documentation refresh required for downstream subcontractor traceability.' },
  { id: 409, supplier_id: 112, assessment_date: '2026-05-26', risk_category: 'source concentration', risk_score: 78, notes: 'Tier-4 refining dependency is concentrated in one region with extended lead time.' },
  { id: 410, supplier_id: 113, assessment_date: '2026-05-26', risk_category: 'geopolitical', risk_score: 69, notes: 'Mineral feedstock requires origin verification and geopolitical monitoring.' },
  { id: 411, supplier_id: 114, assessment_date: '2026-05-27', risk_category: 'chemical compliance', risk_score: 55, notes: 'Ink formulation requires REACH documentation refresh before renewal.' },
  { id: 412, supplier_id: 116, assessment_date: '2026-05-28', risk_category: 'single-source', risk_score: 82, notes: 'Tier-4 additive supplier is a single-source dependency for polymer casings.' },
  { id: 413, supplier_id: 117, assessment_date: '2026-05-28', risk_category: 'capacity', risk_score: 64, notes: 'Feedstock capacity is tight during regional maintenance season.' },
  { id: 414, supplier_id: 119, assessment_date: '2026-05-29', risk_category: 'operational', risk_score: 58, notes: 'Powder availability depends on two qualified furnaces with maintenance exposure.' },
];

const demoCertifications = [
  { id: 501, supplier_id: 101, certification_name: 'ISO 9001', issuing_body: 'BSI', issue_date: '2025-03-10', expiry_date: '2028-03-10', status: 'valid' },
  { id: 502, supplier_id: 102, certification_name: 'ISO 14001', issuing_body: 'SGS', issue_date: '2024-11-18', expiry_date: '2027-11-18', status: 'valid' },
  { id: 503, supplier_id: 104, certification_name: 'IATF 16949', issuing_body: 'TUV', issue_date: '2025-01-30', expiry_date: '2028-01-30', status: 'valid' },
  { id: 504, supplier_id: 107, certification_name: 'FSC Chain of Custody', issuing_body: 'NEPCon', issue_date: '2024-08-20', expiry_date: '2026-08-20', status: 'expiring' },
  { id: 505, supplier_id: 109, certification_name: 'ISO 45001', issuing_body: 'DNV', issue_date: '2025-02-11', expiry_date: '2028-02-11', status: 'valid' },
  { id: 506, supplier_id: 111, certification_name: 'RoHS Compliance', issuing_body: 'Intertek', issue_date: '2024-06-14', expiry_date: '2025-06-14', status: 'expired' },
];

const demoPurchaseOrders = [
  { id: 601, company_id: 1, supplier_id: 101, product_id: 201, po_number: 'PO-NOVA-2401', order_date: '2026-06-01', promised_date: '2026-06-19', status: 'received', priority: 'standard', quantity_ordered: 120, quantity_received: 120, total_value_usd: 144000 },
  { id: 602, company_id: 1, supplier_id: 102, product_id: 202, po_number: 'PO-NOVA-2402', order_date: '2026-06-04', promised_date: '2026-06-18', status: 'partial', priority: 'expedite', quantity_ordered: 500, quantity_received: 340, total_value_usd: 170000 },
  { id: 603, company_id: 1, supplier_id: 104, product_id: 203, po_number: 'PO-NOVA-2403', order_date: '2026-06-06', promised_date: '2026-06-21', status: 'at_risk', priority: 'critical', quantity_ordered: 700, quantity_received: 420, total_value_usd: 84000 },
  { id: 604, company_id: 2, supplier_id: 106, product_id: 204, po_number: 'PO-MRDG-3107', order_date: '2026-06-03', promised_date: '2026-06-13', status: 'received', priority: 'standard', quantity_ordered: 72, quantity_received: 72, total_value_usd: 345600 },
  { id: 605, company_id: 2, supplier_id: 107, product_id: 205, po_number: 'PO-MRDG-3112', order_date: '2026-06-09', promised_date: '2026-06-22', status: 'open', priority: 'standard', quantity_ordered: 900, quantity_received: 0, total_value_usd: 55800 },
  { id: 606, company_id: 3, supplier_id: 109, product_id: 206, po_number: 'PO-HELI-8802', order_date: '2026-06-02', promised_date: '2026-06-24', status: 'partial', priority: 'critical', quantity_ordered: 450, quantity_received: 280, total_value_usd: 445500 },
  { id: 607, company_id: 3, supplier_id: 110, product_id: 207, po_number: 'PO-HELI-8810', order_date: '2026-06-12', promised_date: '2026-06-29', status: 'open', priority: 'expedite', quantity_ordered: 300, quantity_received: 0, total_value_usd: 126000 },
];

const demoInventoryPositions = [
  { id: 701, company_id: 1, supplier_id: 101, product_id: 201, warehouse_location: 'Detroit DC', on_hand_units: 310, safety_stock_units: 180, reorder_point_units: 220, days_of_supply: 21, inventory_status: 'healthy', last_updated: '2026-06-18' },
  { id: 702, company_id: 1, supplier_id: 102, product_id: 202, warehouse_location: 'Monterrey Assembly Hub', on_hand_units: 130, safety_stock_units: 210, reorder_point_units: 260, days_of_supply: 7, inventory_status: 'critical', last_updated: '2026-06-18' },
  { id: 703, company_id: 1, supplier_id: 104, product_id: 203, warehouse_location: 'Austin Electronics Buffer', on_hand_units: 260, safety_stock_units: 240, reorder_point_units: 310, days_of_supply: 10, inventory_status: 'watch', last_updated: '2026-06-18' },
  { id: 704, company_id: 2, supplier_id: 107, product_id: 205, warehouse_location: 'Frankfurt Retail DC', on_hand_units: 1200, safety_stock_units: 850, reorder_point_units: 950, days_of_supply: 28, inventory_status: 'healthy', last_updated: '2026-06-18' },
  { id: 705, company_id: 3, supplier_id: 109, product_id: 206, warehouse_location: 'Nagoya Battery Hub', on_hand_units: 95, safety_stock_units: 160, reorder_point_units: 190, days_of_supply: 5, inventory_status: 'critical', last_updated: '2026-06-18' },
  { id: 706, company_id: 3, supplier_id: 110, product_id: 207, warehouse_location: 'Singapore Mobility DC', on_hand_units: 410, safety_stock_units: 300, reorder_point_units: 360, days_of_supply: 16, inventory_status: 'healthy', last_updated: '2026-06-18' },
];

const demoSupplyDisruptions = [
  { id: 801, supplier_id: 102, company_id: 1, disruption_type: 'Port congestion', severity: 'medium', start_date: '2026-06-07', estimated_resolution_date: '2026-06-24', affected_lane: 'Busan → Long Beach', impact_summary: 'Control board shipments are running 4 days behind plan.', mitigation_action: 'Shift critical orders to air freight and pull from safety stock.', status: 'active' },
  { id: 802, supplier_id: 104, company_id: 1, disruption_type: 'Quality hold', severity: 'high', start_date: '2026-06-11', estimated_resolution_date: '2026-06-21', affected_lane: 'Hsinchu → Austin', impact_summary: 'Sensor circuit inspection failure triggered a partial receiving hold.', mitigation_action: 'Deploy supplier quality engineer and approve alternate lot.', status: 'active' },
  { id: 803, supplier_id: 109, company_id: 3, disruption_type: 'Capacity constraint', severity: 'high', start_date: '2026-06-05', estimated_resolution_date: '2026-07-02', affected_lane: 'Osaka → Nagoya', impact_summary: 'Battery module output is below plan due to cell allocation pressure.', mitigation_action: 'Prioritize high-margin builds and split purchase orders across qualified backup lines.', status: 'active' },
  { id: 804, supplier_id: 106, company_id: 2, disruption_type: 'Carrier delay', severity: 'low', start_date: '2026-06-09', estimated_resolution_date: '2026-06-15', affected_lane: 'Rotterdam → Hamburg', impact_summary: 'Routing delay affected one replenishment wave.', mitigation_action: 'Recovered through alternate cross-dock routing.', status: 'resolved' },
];

const demoLogisticsLanes = [
  { id: 901, company_id: 1, supplier_id: 101, origin: 'Detroit, US', destination: 'Austin, US', mode: 'truck', carrier: 'Atlas Freight', avg_transit_days: 3, cost_per_unit_usd: 18, reliability_score: 94, carbon_kg: 1200, status: 'optimized' },
  { id: 902, company_id: 1, supplier_id: 102, origin: 'Busan, KR', destination: 'Long Beach, US', mode: 'ocean', carrier: 'Pacific Star Lines', avg_transit_days: 22, cost_per_unit_usd: 9, reliability_score: 71, carbon_kg: 7200, status: 'congested' },
  { id: 903, company_id: 1, supplier_id: 104, origin: 'Hsinchu, TW', destination: 'Austin, US', mode: 'air', carrier: 'SkyLift Cargo', avg_transit_days: 4, cost_per_unit_usd: 44, reliability_score: 82, carbon_kg: 4100, status: 'expedite' },
  { id: 904, company_id: 2, supplier_id: 106, origin: 'Rotterdam, NL', destination: 'Hamburg, DE', mode: 'rail', carrier: 'EuroBridge Intermodal', avg_transit_days: 2, cost_per_unit_usd: 13, reliability_score: 91, carbon_kg: 850, status: 'optimized' },
  { id: 905, company_id: 2, supplier_id: 107, origin: 'Warsaw, PL', destination: 'Frankfurt, DE', mode: 'truck', carrier: 'GreenRoad Logistics', avg_transit_days: 3, cost_per_unit_usd: 11, reliability_score: 88, carbon_kg: 1020, status: 'healthy' },
  { id: 906, company_id: 3, supplier_id: 109, origin: 'Osaka, JP', destination: 'Nagoya, JP', mode: 'truck', carrier: 'Nippon Express', avg_transit_days: 1, cost_per_unit_usd: 21, reliability_score: 79, carbon_kg: 640, status: 'capacity_watch' },
  { id: 907, company_id: 3, supplier_id: 110, origin: 'Rayong, TH', destination: 'Singapore, SG', mode: 'ocean', carrier: 'ASEAN SeaLink', avg_transit_days: 8, cost_per_unit_usd: 16, reliability_score: 84, carbon_kg: 2300, status: 'healthy' },
  { id: 908, company_id: 3, supplier_id: 111, origin: 'Hai Phong, VN', destination: 'Singapore, SG', mode: 'ocean', carrier: 'Mekong Maritime', avg_transit_days: 7, cost_per_unit_usd: 14, reliability_score: 68, carbon_kg: 2100, status: 'watch' },
];

const demoDemandForecasts = [
  { id: 1001, company_id: 1, product_id: 201, forecast_month: '2026-07', forecast_units: 155, committed_supply_units: 170, demand_signal: 'stable', confidence_score: 91 },
  { id: 1002, company_id: 1, product_id: 202, forecast_month: '2026-07', forecast_units: 720, committed_supply_units: 540, demand_signal: 'surge', confidence_score: 84 },
  { id: 1003, company_id: 1, product_id: 203, forecast_month: '2026-07', forecast_units: 880, committed_supply_units: 690, demand_signal: 'surge', confidence_score: 78 },
  { id: 1004, company_id: 2, product_id: 204, forecast_month: '2026-07', forecast_units: 84, committed_supply_units: 94, demand_signal: 'stable', confidence_score: 88 },
  { id: 1005, company_id: 2, product_id: 205, forecast_month: '2026-07', forecast_units: 1040, committed_supply_units: 900, demand_signal: 'promotion_peak', confidence_score: 82 },
  { id: 1006, company_id: 3, product_id: 206, forecast_month: '2026-07', forecast_units: 520, committed_supply_units: 380, demand_signal: 'launch_ramp', confidence_score: 76 },
  { id: 1007, company_id: 3, product_id: 207, forecast_month: '2026-07', forecast_units: 340, committed_supply_units: 360, demand_signal: 'stable', confidence_score: 86 },
  { id: 1008, company_id: 1, product_id: 202, forecast_month: '2026-08', forecast_units: 760, committed_supply_units: 620, demand_signal: 'surge', confidence_score: 80 },
  { id: 1009, company_id: 3, product_id: 206, forecast_month: '2026-08', forecast_units: 600, committed_supply_units: 420, demand_signal: 'launch_ramp', confidence_score: 74 },
];

const demoSupplierScorecards = [
  { id: 1101, supplier_id: 101, period: '2026-Q2', on_time_delivery_rate: 96, quality_ppm: 120, responsiveness_score: 92, cost_variance_pct: -1.4, overall_score: 94, trend: 'improving' },
  { id: 1102, supplier_id: 102, period: '2026-Q2', on_time_delivery_rate: 78, quality_ppm: 390, responsiveness_score: 83, cost_variance_pct: 4.8, overall_score: 76, trend: 'watch' },
  { id: 1103, supplier_id: 104, period: '2026-Q2', on_time_delivery_rate: 81, quality_ppm: 620, responsiveness_score: 79, cost_variance_pct: 3.1, overall_score: 72, trend: 'declining' },
  { id: 1104, supplier_id: 106, period: '2026-Q2', on_time_delivery_rate: 97, quality_ppm: 90, responsiveness_score: 95, cost_variance_pct: -0.8, overall_score: 96, trend: 'improving' },
  { id: 1105, supplier_id: 107, period: '2026-Q2', on_time_delivery_rate: 89, quality_ppm: 180, responsiveness_score: 88, cost_variance_pct: 1.2, overall_score: 88, trend: 'stable' },
  { id: 1106, supplier_id: 109, period: '2026-Q2', on_time_delivery_rate: 74, quality_ppm: 310, responsiveness_score: 81, cost_variance_pct: 6.3, overall_score: 73, trend: 'watch' },
  { id: 1107, supplier_id: 110, period: '2026-Q2', on_time_delivery_rate: 86, quality_ppm: 240, responsiveness_score: 84, cost_variance_pct: 2.6, overall_score: 82, trend: 'stable' },
  { id: 1108, supplier_id: 111, period: '2026-Q2', on_time_delivery_rate: 69, quality_ppm: 760, responsiveness_score: 72, cost_variance_pct: 7.8, overall_score: 66, trend: 'declining' },
];

const demoSustainabilityMetrics = [
  { id: 1201, supplier_id: 101, reporting_period: '2026-Q2', carbon_intensity_kg_per_unit: 8.4, renewable_energy_pct: 52, water_usage_kl: 1180, waste_recycled_pct: 74, esg_score: 86 },
  { id: 1202, supplier_id: 102, reporting_period: '2026-Q2', carbon_intensity_kg_per_unit: 5.9, renewable_energy_pct: 61, water_usage_kl: 820, waste_recycled_pct: 68, esg_score: 81 },
  { id: 1203, supplier_id: 104, reporting_period: '2026-Q2', carbon_intensity_kg_per_unit: 4.6, renewable_energy_pct: 48, water_usage_kl: 610, waste_recycled_pct: 63, esg_score: 76 },
  { id: 1204, supplier_id: 106, reporting_period: '2026-Q2', carbon_intensity_kg_per_unit: 3.1, renewable_energy_pct: 72, water_usage_kl: 430, waste_recycled_pct: 82, esg_score: 90 },
  { id: 1205, supplier_id: 107, reporting_period: '2026-Q2', carbon_intensity_kg_per_unit: 2.7, renewable_energy_pct: 58, water_usage_kl: 360, waste_recycled_pct: 88, esg_score: 84 },
  { id: 1206, supplier_id: 109, reporting_period: '2026-Q2', carbon_intensity_kg_per_unit: 11.8, renewable_energy_pct: 44, water_usage_kl: 1540, waste_recycled_pct: 58, esg_score: 71 },
  { id: 1207, supplier_id: 110, reporting_period: '2026-Q2', carbon_intensity_kg_per_unit: 6.3, renewable_energy_pct: 49, water_usage_kl: 740, waste_recycled_pct: 69, esg_score: 78 },
  { id: 1208, supplier_id: 111, reporting_period: '2026-Q2', carbon_intensity_kg_per_unit: 7.9, renewable_energy_pct: 36, water_usage_kl: 920, waste_recycled_pct: 54, esg_score: 64 },
];

let seedPromise;

const upsertById = async (Model, records) =>
  Promise.all(
    records.map((record) =>
      Model.updateOne({ id: record.id }, { $set: record }, { upsert: true })
    )
  );

const ensureDemoData = async () => {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    const [companyCount, supplierCount] = await Promise.all([
      Company.countDocuments(),
      Supplier.countDocuments(),
    ]);

    await Promise.all([
      upsertById(Company, demoCompanies),
      upsertById(Supplier, enrichedDemoSuppliers),
      upsertById(Product, demoProducts),
      upsertById(Shipment, demoShipments),
      upsertById(RiskAssessment, demoRiskAssessments),
      upsertById(ComplianceCertification, demoCertifications),
      upsertById(PurchaseOrder, demoPurchaseOrders),
      upsertById(InventoryPosition, demoInventoryPositions),
      upsertById(SupplyDisruption, demoSupplyDisruptions),
      upsertById(LogisticsLane, demoLogisticsLanes),
      upsertById(DemandForecast, demoDemandForecasts),
      upsertById(SupplierScorecard, demoSupplierScorecards),
      upsertById(SustainabilityMetric, demoSustainabilityMetrics),
    ]);

    return { seeded: companyCount === 0 && supplierCount === 0 };
  })();

  try {
    return await seedPromise;
  } finally {
    seedPromise = null;
  }
};

module.exports = ensureDemoData;