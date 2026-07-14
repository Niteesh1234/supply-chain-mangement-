const express = require('express');
const Supplier = require('../models/Supplier');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

const buildHierarchy = (rootSupplier, suppliersByParent, visited = new Set()) => {
  if (!rootSupplier || visited.has(rootSupplier.id)) {
    return null;
  }

  visited.add(rootSupplier.id);

  const children = (suppliersByParent.get(rootSupplier.id) || [])
    .map((childSupplier) => buildHierarchy(childSupplier, suppliersByParent, new Set(visited)))
    .filter(Boolean);

  return {
    ...rootSupplier,
    children,
    descendant_count: children.reduce(
      (total, childSupplier) => total + 1 + (childSupplier.descendant_count || 0),
      0
    ),
    highest_downstream_risk: Math.max(
      rootSupplier.risk_score || 0,
      ...children.map((childSupplier) => childSupplier.highest_downstream_risk || 0)
    ),
  };
};

const groupByParentSupplier = (suppliers) =>
  suppliers.reduce((supplierMap, supplier) => {
    const parentId = supplier.parent_supplier_id;
    const currentSuppliers = supplierMap.get(parentId) || [];
    currentSuppliers.push(supplier);
    supplierMap.set(parentId, currentSuppliers);
    return supplierMap;
  }, new Map());

router.get('/', async (req, res) => {
  try {
    const companyId = req.query.companyId ? Number(req.query.companyId) : null;
    const query = Number.isFinite(companyId) ? { company_id: companyId } : {};
    const suppliers = await Supplier.find(query).sort({ company_id: 1, tier: 1, name: 1 }).lean();
    const suppliersByParent = groupByParentSupplier(suppliers);
    const roots = suppliers
      .filter((supplier) => supplier.parent_supplier_id === null)
      .map((supplier) => buildHierarchy(supplier, suppliersByParent))
      .filter(Boolean);

    res.json({
      companyId,
      supplierCount: suppliers.length,
      rootCount: roots.length,
      maxTier: suppliers.reduce((maxTier, supplier) => Math.max(maxTier, supplier.tier || 0), 0),
      roots,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch supplier hierarchy.' });
  }
});

router.get('/:id/tree', async (req, res) => {
  try {
    const supplierId = Number(req.params.id);
    const supplier = await Supplier.findOne({ id: supplierId }).lean();

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    const companySuppliers = await Supplier.find({ company_id: supplier.company_id })
      .sort({ tier: 1, name: 1 })
      .lean();
    const suppliersByParent = groupByParentSupplier(companySuppliers);

    res.json(buildHierarchy(supplier, suppliersByParent));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch supplier tree.' });
  }
});

router.get('/company/:companyId/root-suppliers', async (req, res) => {
  try {
    const companyId = Number(req.params.companyId);
    const rootSuppliers = await Supplier.find({
      company_id: companyId,
      parent_supplier_id: null,
    });
    res.json(rootSuppliers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch root suppliers.' });
  }
});

router.get('/:id/children', async (req, res) => {
  try {
    const supplierId = Number(req.params.id);
    const childSuppliers = await Supplier.find({ parent_supplier_id: supplierId });
    res.json(childSuppliers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch child suppliers.' });
  }
});

module.exports = router;