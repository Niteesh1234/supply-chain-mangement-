const express = require('express');
const Company = require('../models/Company');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Shipment = require('../models/Shipment');
const RiskAssessment = require('../models/RiskAssessment');
const ComplianceCertification = require('../models/ComplianceCertification');
const PurchaseOrder = require('../models/PurchaseOrder');
const InventoryPosition = require('../models/InventoryPosition');
const SupplyDisruption = require('../models/SupplyDisruption');
const LogisticsLane = require('../models/LogisticsLane');
const DemandForecast = require('../models/DemandForecast');
const SupplierScorecard = require('../models/SupplierScorecard');
const SustainabilityMetric = require('../models/SustainabilityMetric');
const ensureDemoData = require('../seedDemoData');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

const average = (values) => {
  if (!values.length) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const sum = (values) => values.reduce((total, value) => total + value, 0);

const groupBy = (items, getKey) =>
  items.reduce((accumulator, item) => {
    const key = getKey(item);
    const currentItems = accumulator.get(key) || [];
    currentItems.push(item);
    accumulator.set(key, currentItems);
    return accumulator;
  }, new Map());

const normalizeSupplierField = (value, fallback = 'unknown') => value || fallback;

router.get('/overview', async (req, res) => {
  try {
    const seedResult = await ensureDemoData();

    const [
      companies,
      suppliers,
      products,
      shipments,
      riskAssessments,
      complianceCertifications,
      purchaseOrders,
      inventoryPositions,
      supplyDisruptions,
      logisticsLanes,
      demandForecasts,
      supplierScorecards,
      sustainabilityMetrics,
    ] =
      await Promise.all([
        Company.find().lean(),
        Supplier.find().lean(),
        Product.find().lean(),
        Shipment.find().lean(),
        RiskAssessment.find().lean(),
        ComplianceCertification.find().lean(),
        PurchaseOrder.find().lean(),
        InventoryPosition.find().lean(),
        SupplyDisruption.find().lean(),
        LogisticsLane.find().lean(),
        DemandForecast.find().lean(),
        SupplierScorecard.find().lean(),
        SustainabilityMetric.find().lean(),
      ]);

    const productsBySupplier = groupBy(products, (product) => product.supplier_id);
    const shipmentsBySupplier = groupBy(shipments, (shipment) => shipment.supplier_id);
    const purchaseOrdersBySupplier = groupBy(purchaseOrders, (purchaseOrder) => purchaseOrder.supplier_id);
    const inventoryBySupplier = groupBy(inventoryPositions, (inventoryPosition) => inventoryPosition.supplier_id);
    const disruptionsBySupplier = groupBy(supplyDisruptions, (disruption) => disruption.supplier_id);
    const lanesBySupplier = groupBy(logisticsLanes, (lane) => lane.supplier_id);
    const scorecardsBySupplier = groupBy(supplierScorecards, (scorecard) => scorecard.supplier_id);
    const sustainabilityBySupplier = groupBy(
      sustainabilityMetrics,
      (sustainabilityMetric) => sustainabilityMetric.supplier_id
    );
    const childSuppliersByParent = groupBy(
      suppliers.filter((supplier) => supplier.parent_supplier_id !== null),
      (supplier) => supplier.parent_supplier_id
    );
    const riskAssessmentsBySupplier = groupBy(
      riskAssessments,
      (riskAssessment) => riskAssessment.supplier_id
    );
    const certificationsBySupplier = groupBy(
      complianceCertifications,
      (certification) => certification.supplier_id
    );

    const buildSupplierTree = (supplier) => {
      const children = (childSuppliersByParent.get(supplier.id) || []).map(buildSupplierTree);
      const descendantCount = children.reduce(
        (total, childSupplier) => total + 1 + (childSupplier.descendantCount || 0),
        0
      );
      const downstreamRiskScores = children.map(
        (childSupplier) => childSupplier.highestDownstreamRisk || childSupplier.riskScore || 0
      );

      return {
        id: supplier.id,
        parentSupplierId: supplier.parent_supplier_id,
        companyId: supplier.company_id,
        name: supplier.name,
        tier: supplier.tier,
        status: supplier.status,
        country: supplier.country,
        city: supplier.city,
        riskScore: supplier.risk_score,
        relationshipType: normalizeSupplierField(supplier.relationship_type, supplier.tier === 1 ? 'direct_supplier' : 'subcontractor'),
        criticality: normalizeSupplierField(supplier.criticality, 'medium'),
        visibilityStatus: normalizeSupplierField(supplier.visibility_status, 'self_reported'),
        employeeCount: supplier.employee_count,
        annualRevenueUsd: supplier.annual_revenue_usd,
        products: (productsBySupplier.get(supplier.id) || []).length,
        shipments: (shipmentsBySupplier.get(supplier.id) || []).length,
        openPurchaseOrders: (purchaseOrdersBySupplier.get(supplier.id) || []).filter(
          (purchaseOrder) => purchaseOrder.status !== 'received'
        ).length,
        inventoryAlerts: (inventoryBySupplier.get(supplier.id) || []).filter(
          (inventoryPosition) => inventoryPosition.inventory_status !== 'healthy'
        ).length,
        activeDisruptions: (disruptionsBySupplier.get(supplier.id) || []).filter(
          (disruption) => disruption.status === 'active'
        ).length,
        logisticsLanes: (lanesBySupplier.get(supplier.id) || []).length,
        avgLaneReliability: average(
          (lanesBySupplier.get(supplier.id) || []).map((lane) => lane.reliability_score || 0)
        ),
        performanceScore: average(
          (scorecardsBySupplier.get(supplier.id) || []).map((scorecard) => scorecard.overall_score || 0)
        ),
        esgScore: average(
          (sustainabilityBySupplier.get(supplier.id) || []).map(
            (sustainabilityMetric) => sustainabilityMetric.esg_score || 0
          )
        ),
        descendantCount,
        highestDownstreamRisk: Math.max(supplier.risk_score || 0, ...downstreamRiskScores),
        children,
      };
    };

    const companySummary = companies
      .map((company) => {
        const companySuppliers = suppliers.filter((supplier) => supplier.company_id === company.id);
        const rootSuppliers = companySuppliers
          .filter((supplier) => supplier.parent_supplier_id === null)
          .map(buildSupplierTree);
        const activeCompanySuppliers = companySuppliers.filter(
          (supplier) => supplier.status === 'active'
        );
        const subcontractors = companySuppliers.filter(
          (supplier) => supplier.parent_supplier_id !== null
        );
        const companySupplierIds = companySuppliers.map((supplier) => supplier.id);
        const companyProducts = products.filter((product) =>
          companySupplierIds.includes(product.supplier_id)
        );
        const companyShipments = shipments.filter((shipment) =>
          companySupplierIds.includes(shipment.supplier_id)
        );
        const companyPurchaseOrders = purchaseOrders.filter(
          (purchaseOrder) => purchaseOrder.company_id === company.id
        );
        const companyLanes = logisticsLanes.filter((lane) => lane.company_id === company.id);
        const companyDisruptions = supplyDisruptions.filter(
          (disruption) => disruption.company_id === company.id
        );
        const companyRiskAssessments = riskAssessments.filter((assessment) =>
          companySupplierIds.includes(assessment.supplier_id)
        );
        const companyCertifications = complianceCertifications.filter((certification) =>
          companySupplierIds.includes(certification.supplier_id)
        );
        const directSuppliers = companySuppliers.filter(
          (supplier) => supplier.parent_supplier_id === null
        );
        const categoryBreakdown = Array.from(
          groupBy(companyProducts, (product) => product.category).entries()
        )
          .map(([category, categoryProducts]) => ({
            category,
            productCount: categoryProducts.length,
            avgLeadTimeDays: average(categoryProducts.map((product) => product.lead_time_days || 0)),
            avgUnitCostUsd: average(categoryProducts.map((product) => product.unit_cost_usd || 0)),
            suppliers: new Set(categoryProducts.map((product) => product.supplier_id)).size,
          }))
          .sort((left, right) => right.productCount - left.productCount);
        const tierBreakdown = Array.from(groupBy(companySuppliers, (supplier) => supplier.tier).entries())
          .map(([tier, tierSuppliers]) => ({
            tier,
            supplierCount: tierSuppliers.length,
            avgRiskScore: average(tierSuppliers.map((supplier) => supplier.risk_score || 0)),
            subcontractorCount: tierSuppliers.filter((supplier) => supplier.parent_supplier_id !== null).length,
          }))
          .sort((left, right) => left.tier - right.tier);
        const relationshipBreakdown = Array.from(
          groupBy(companySuppliers, (supplier) => normalizeSupplierField(supplier.relationship_type, supplier.tier === 1 ? 'direct_supplier' : 'subcontractor')).entries()
        )
          .map(([relationshipType, relationshipSuppliers]) => ({
            relationshipType,
            supplierCount: relationshipSuppliers.length,
            avgRiskScore: average(relationshipSuppliers.map((supplier) => supplier.risk_score || 0)),
          }))
          .sort((left, right) => right.supplierCount - left.supplierCount);
        const criticalityBreakdown = Array.from(
          groupBy(companySuppliers, (supplier) => normalizeSupplierField(supplier.criticality, 'medium')).entries()
        )
          .map(([criticality, criticalitySuppliers]) => ({
            criticality,
            supplierCount: criticalitySuppliers.length,
            avgRiskScore: average(criticalitySuppliers.map((supplier) => supplier.risk_score || 0)),
          }))
          .sort((left, right) => right.avgRiskScore - left.avgRiskScore);
        const visibilityBreakdown = Array.from(
          groupBy(companySuppliers, (supplier) => normalizeSupplierField(supplier.visibility_status, 'self_reported')).entries()
        )
          .map(([visibilityStatus, visibilitySuppliers]) => ({
            visibilityStatus,
            supplierCount: visibilitySuppliers.length,
            avgRiskScore: average(visibilitySuppliers.map((supplier) => supplier.risk_score || 0)),
          }))
          .sort((left, right) => right.supplierCount - left.supplierCount);
        const topCompanySuppliers = [...companySuppliers]
          .sort((left, right) => (right.annual_revenue_usd || 0) - (left.annual_revenue_usd || 0))
          .slice(0, 6)
          .map((supplier) => ({
            id: supplier.id,
            name: supplier.name,
            tier: supplier.tier,
            country: supplier.country,
            city: supplier.city,
            status: supplier.status,
            riskScore: supplier.risk_score,
            relationshipType: normalizeSupplierField(supplier.relationship_type, supplier.tier === 1 ? 'direct_supplier' : 'subcontractor'),
            criticality: normalizeSupplierField(supplier.criticality, 'medium'),
            visibilityStatus: normalizeSupplierField(supplier.visibility_status, 'self_reported'),
            annualRevenueUsd: supplier.annual_revenue_usd,
            products: (productsBySupplier.get(supplier.id) || []).map((product) => ({
              id: product.id,
              name: product.name,
              category: product.category,
              leadTimeDays: product.lead_time_days,
            })),
            certifications: (certificationsBySupplier.get(supplier.id) || []).map((certification) => ({
              id: certification.id,
              name: certification.certification_name,
              status: certification.status,
              expiryDate: certification.expiry_date,
            })),
            riskCategories: (riskAssessmentsBySupplier.get(supplier.id) || []).map((assessment) => ({
              id: assessment.id,
              category: assessment.risk_category,
              score: assessment.risk_score,
              notes: assessment.notes,
            })),
          }));
        const companyDataRoom = {
          providedDataTypes: [
            { label: 'Direct suppliers', value: directSuppliers.length, detail: 'Tier-1 companies supplying materials, parts or services.' },
            { label: 'Subcontractors', value: subcontractors.length, detail: 'Downstream supplier tiers connected to each parent supplier.' },
            { label: 'Products supplied', value: companyProducts.length, detail: 'Products and categories tied to the supplier network.' },
            { label: 'Shipments', value: companyShipments.length, detail: 'Tracked shipment movement and destination exposure.' },
            { label: 'Purchase orders', value: companyPurchaseOrders.length, detail: 'Commercial demand, status, priority and received quantities.' },
            { label: 'Certifications', value: companyCertifications.length, detail: 'Compliance evidence, validity and expiry readiness.' },
            { label: 'Risk assessments', value: companyRiskAssessments.length, detail: 'Supplier risk categories, scores and analyst notes.' },
            { label: 'Logistics lanes', value: companyLanes.length, detail: 'Carrier, mode, route, cost, transit and reliability data.' },
          ],
          categoryBreakdown,
          tierBreakdown,
          relationshipBreakdown,
          criticalityBreakdown,
          visibilityBreakdown,
          topSuppliers: topCompanySuppliers,
          traceabilitySummary: {
            maxTier: companySuppliers.reduce((maxTier, supplier) => Math.max(maxTier, supplier.tier || 0), 0),
            verifiedCount: companySuppliers.filter((supplier) => supplier.visibility_status === 'verified').length,
            needsValidationCount: companySuppliers.filter((supplier) => supplier.visibility_status === 'needs_validation').length,
            strategicCount: companySuppliers.filter((supplier) => supplier.criticality === 'strategic').length,
            highRiskSubcontractors: subcontractors.filter((supplier) => (supplier.risk_score || 0) >= 65).length,
          },
          shipmentSummary: {
            totalShipments: companyShipments.length,
            totalQuantity: sum(companyShipments.map((shipment) => shipment.quantity || 0)),
            delayedCount: companyShipments.filter((shipment) => shipment.status === 'delayed').length,
            destinationCountries: Array.from(
              new Set(companyShipments.map((shipment) => shipment.destination_country))
            ).filter(Boolean),
          },
          purchaseOrderSummary: {
            totalValueUsd: sum(companyPurchaseOrders.map((purchaseOrder) => purchaseOrder.total_value_usd || 0)),
            atRiskCount: companyPurchaseOrders.filter(
              (purchaseOrder) => purchaseOrder.status === 'at_risk' || purchaseOrder.priority === 'critical'
            ).length,
            fillRate: companyPurchaseOrders.length
              ? Math.round(
                  (sum(companyPurchaseOrders.map((purchaseOrder) => purchaseOrder.quantity_received || 0)) /
                    sum(companyPurchaseOrders.map((purchaseOrder) => purchaseOrder.quantity_ordered || 0))) *
                    100
                )
              : 0,
          },
          complianceSummary: {
            validCount: companyCertifications.filter((certification) => certification.status === 'valid').length,
            expiringCount: companyCertifications.filter((certification) => certification.status === 'expiring').length,
            expiredCount: companyCertifications.filter((certification) => certification.status === 'expired').length,
          },
          logisticsSummary: {
            laneCount: companyLanes.length,
            avgReliability: average(companyLanes.map((lane) => lane.reliability_score || 0)),
            activeDisruptions: companyDisruptions.filter((disruption) => disruption.status === 'active').length,
            modes: Array.from(new Set(companyLanes.map((lane) => lane.mode))).filter(Boolean),
          },
        };

        return {
          companyId: company.id,
          name: company.name,
          headquartersCountry: company.headquarters_country,
          foundedYear: company.founded_year,
          stockTicker: company.stock_ticker,
          annualRevenueUsd: company.annual_revenue_usd,
          supplierCount: companySuppliers.length,
          activeSuppliers: activeCompanySuppliers.length,
          subcontractorCount: subcontractors.length,
          avgRiskScore: average(companySuppliers.map((supplier) => supplier.risk_score || 0)),
          maxTier: companySuppliers.reduce((maxTier, supplier) => Math.max(maxTier, supplier.tier || 0), 0),
          verifiedCoverage: companySuppliers.length
            ? Math.round((companySuppliers.filter((supplier) => supplier.visibility_status === 'verified').length / companySuppliers.length) * 100)
            : 0,
          highRiskSubcontractors: subcontractors.filter((supplier) => (supplier.risk_score || 0) >= 65).length,
          dataRoom: companyDataRoom,
          rootSuppliers,
        };
      })
      .sort((left, right) => right.supplierCount - left.supplierCount);

    const shipmentStatusCounts = shipments.reduce((accumulator, shipment) => {
      accumulator[shipment.status] = (accumulator[shipment.status] || 0) + 1;
      return accumulator;
    }, {});

    const certificationStatusCounts = complianceCertifications.reduce((accumulator, certification) => {
      accumulator[certification.status] = (accumulator[certification.status] || 0) + 1;
      return accumulator;
    }, {});

    const supplierStatusBreakdown = Object.entries(
      suppliers.reduce((accumulator, supplier) => {
        accumulator[supplier.status] = (accumulator[supplier.status] || 0) + 1;
        return accumulator;
      }, {})
    ).map(([status, value]) => ({ status, value }));

    const riskDistribution = [
      {
        label: 'Low Risk',
        value: suppliers.filter((supplier) => (supplier.risk_score || 0) < 40).length,
        color: '#34d399',
      },
      {
        label: 'Moderate Risk',
        value: suppliers.filter(
          (supplier) => (supplier.risk_score || 0) >= 40 && (supplier.risk_score || 0) < 65
        ).length,
        color: '#f59e0b',
      },
      {
        label: 'High Risk',
        value: suppliers.filter((supplier) => (supplier.risk_score || 0) >= 65).length,
        color: '#f87171',
      },
    ];

    const tierDistribution = Array.from(new Set(suppliers.map((supplier) => supplier.tier)))
      .sort((left, right) => left - right)
      .map((tier) => ({
        tier,
        value: suppliers.filter((supplier) => supplier.tier === tier).length,
      }));

    const supplierCountryDistribution = Array.from(
      groupBy(suppliers, (supplier) => supplier.country).entries()
    )
      .map(([country, countrySuppliers]) => ({
        country,
        supplierCount: countrySuppliers.length,
        activeCount: countrySuppliers.filter((supplier) => supplier.status === 'active').length,
        avgRiskScore: average(countrySuppliers.map((supplier) => supplier.risk_score || 0)),
      }))
      .sort((left, right) => {
        if (right.supplierCount === left.supplierCount) {
          return right.avgRiskScore - left.avgRiskScore;
        }

        return right.supplierCount - left.supplierCount;
      })
      .slice(0, 6);

    const riskCategoryBreakdown = Array.from(
      groupBy(riskAssessments, (assessment) => assessment.risk_category).entries()
    )
      .map(([category, assessments]) => ({
        category,
        assessments: assessments.length,
        avgScore: average(assessments.map((assessment) => assessment.risk_score || 0)),
      }))
      .sort((left, right) => right.avgScore - left.avgScore);

    const certificationStatusBreakdown = Object.entries(certificationStatusCounts).map(
      ([status, value]) => ({
        status,
        value,
      })
    );

    const shipmentVolumeByDate = Array.from(
      groupBy(shipments, (shipment) => shipment.shipment_date).entries()
    )
      .map(([date, dateShipments]) => ({
        date,
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        shipments: dateShipments.length,
        quantity: sum(dateShipments.map((shipment) => shipment.quantity || 0)),
        delayed: dateShipments.filter((shipment) => shipment.status === 'delayed').length,
      }))
      .sort((left, right) => new Date(left.date) - new Date(right.date));

    const riskByTier = Array.from(groupBy(suppliers, (supplier) => supplier.tier).entries())
      .map(([tier, tierSuppliers]) => ({
        tier,
        label: `Tier ${tier}`,
        supplierCount: tierSuppliers.length,
        activeCount: tierSuppliers.filter((supplier) => supplier.status === 'active').length,
        highRiskCount: tierSuppliers.filter((supplier) => (supplier.risk_score || 0) >= 65).length,
        avgRiskScore: average(tierSuppliers.map((supplier) => supplier.risk_score || 0)),
      }))
      .sort((left, right) => left.tier - right.tier);

    const destinationCountryBreakdown = Array.from(
      groupBy(shipments, (shipment) => shipment.destination_country).entries()
    )
      .map(([country, countryShipments]) => ({
        country,
        shipments: countryShipments.length,
        quantity: sum(countryShipments.map((shipment) => shipment.quantity || 0)),
      }))
      .sort((left, right) => right.quantity - left.quantity)
      .slice(0, 6);

    const productCategoryBreakdown = Array.from(
      groupBy(products, (product) => product.category).entries()
    )
      .map(([category, categoryProducts]) => ({
        category,
        products: categoryProducts.length,
        avgLeadTimeDays: average(categoryProducts.map((product) => product.lead_time_days || 0)),
        totalUnitCostUsd: sum(categoryProducts.map((product) => product.unit_cost_usd || 0)),
      }))
      .sort((left, right) => right.products - left.products);

    const purchaseOrderStatusBreakdown = Object.entries(
      purchaseOrders.reduce((accumulator, purchaseOrder) => {
        accumulator[purchaseOrder.status] = (accumulator[purchaseOrder.status] || 0) + 1;
        return accumulator;
      }, {})
    ).map(([status, value]) => ({ status, value }));

    const purchaseOrderPriorityBreakdown = Object.entries(
      purchaseOrders.reduce((accumulator, purchaseOrder) => {
        accumulator[purchaseOrder.priority] = (accumulator[purchaseOrder.priority] || 0) + 1;
        return accumulator;
      }, {})
    ).map(([priority, value]) => ({ priority, value }));

    const inventoryStatusBreakdown = Object.entries(
      inventoryPositions.reduce((accumulator, inventoryPosition) => {
        accumulator[inventoryPosition.inventory_status] =
          (accumulator[inventoryPosition.inventory_status] || 0) + 1;
        return accumulator;
      }, {})
    ).map(([status, value]) => ({ status, value }));

    const activeDisruptions = supplyDisruptions.filter((disruption) => disruption.status === 'active');

    const disruptionSeverityBreakdown = Object.entries(
      supplyDisruptions.reduce((accumulator, disruption) => {
        accumulator[disruption.severity] = (accumulator[disruption.severity] || 0) + 1;
        return accumulator;
      }, {})
    ).map(([severity, value]) => ({ severity, value }));

    const logisticsModeBreakdown = Array.from(groupBy(logisticsLanes, (lane) => lane.mode).entries())
      .map(([mode, lanes]) => ({
        mode,
        value: lanes.length,
        avgReliability: average(lanes.map((lane) => lane.reliability_score || 0)),
        totalCarbonKg: sum(lanes.map((lane) => lane.carbon_kg || 0)),
      }))
      .sort((left, right) => right.value - left.value);

    const logisticsLaneWatchlist = logisticsLanes
      .map((lane) => {
        const supplier = suppliers.find((item) => item.id === lane.supplier_id);
        const company = companies.find((item) => item.id === lane.company_id);

        return {
          id: lane.id,
          supplierName: supplier?.name || 'Unknown supplier',
          companyName: company?.name || 'Unknown company',
          route: `${lane.origin} → ${lane.destination}`,
          mode: lane.mode,
          carrier: lane.carrier,
          avgTransitDays: lane.avg_transit_days,
          costPerUnitUsd: lane.cost_per_unit_usd,
          reliabilityScore: lane.reliability_score,
          carbonKg: lane.carbon_kg,
          status: lane.status,
        };
      })
      .sort((left, right) => left.reliabilityScore - right.reliabilityScore)
      .slice(0, 5);

    const demandForecastCoverage = demandForecasts.length
      ? Math.round(
          (sum(demandForecasts.map((forecast) => forecast.committed_supply_units || 0)) /
            sum(demandForecasts.map((forecast) => forecast.forecast_units || 0))) *
            100
        )
      : 0;

    const demandForecastByProduct = demandForecasts
      .map((forecast) => {
        const product = products.find((item) => item.id === forecast.product_id);
        const company = companies.find((item) => item.id === forecast.company_id);
        const gapUnits = (forecast.committed_supply_units || 0) - (forecast.forecast_units || 0);

        return {
          id: forecast.id,
          productName: product?.name || 'Unknown product',
          companyName: company?.name || 'Unknown company',
          forecastMonth: forecast.forecast_month,
          forecastUnits: forecast.forecast_units,
          committedSupplyUnits: forecast.committed_supply_units,
          gapUnits,
          demandSignal: forecast.demand_signal,
          confidenceScore: forecast.confidence_score,
          coveragePct: forecast.forecast_units
            ? Math.round(((forecast.committed_supply_units || 0) / forecast.forecast_units) * 100)
            : 0,
        };
      })
      .sort((left, right) => left.gapUnits - right.gapUnits)
      .slice(0, 6);

    const supplierPerformanceLeaders = supplierScorecards
      .map((scorecard) => {
        const supplier = suppliers.find((item) => item.id === scorecard.supplier_id);
        const company = companies.find((item) => item.id === supplier?.company_id);

        return {
          id: scorecard.id,
          supplierName: supplier?.name || 'Unknown supplier',
          companyName: company?.name || 'Unknown company',
          period: scorecard.period,
          onTimeDeliveryRate: scorecard.on_time_delivery_rate,
          qualityPpm: scorecard.quality_ppm,
          responsivenessScore: scorecard.responsiveness_score,
          costVariancePct: scorecard.cost_variance_pct,
          overallScore: scorecard.overall_score,
          trend: scorecard.trend,
        };
      })
      .sort((left, right) => right.overallScore - left.overallScore);

    const sustainabilityLeaderboard = sustainabilityMetrics
      .map((sustainabilityMetric) => {
        const supplier = suppliers.find((item) => item.id === sustainabilityMetric.supplier_id);
        const company = companies.find((item) => item.id === supplier?.company_id);

        return {
          id: sustainabilityMetric.id,
          supplierName: supplier?.name || 'Unknown supplier',
          companyName: company?.name || 'Unknown company',
          reportingPeriod: sustainabilityMetric.reporting_period,
          carbonIntensityKgPerUnit: sustainabilityMetric.carbon_intensity_kg_per_unit,
          renewableEnergyPct: sustainabilityMetric.renewable_energy_pct,
          waterUsageKl: sustainabilityMetric.water_usage_kl,
          wasteRecycledPct: sustainabilityMetric.waste_recycled_pct,
          esgScore: sustainabilityMetric.esg_score,
        };
      })
      .sort((left, right) => right.esgScore - left.esgScore);

    const supplierControlTower = suppliers
      .map((supplier) => {
        const company = companies.find((item) => item.id === supplier.company_id);
        const supplierPurchaseOrders = purchaseOrdersBySupplier.get(supplier.id) || [];
        const supplierInventory = inventoryBySupplier.get(supplier.id) || [];
        const supplierDisruptions = disruptionsBySupplier.get(supplier.id) || [];
        const supplierLanes = lanesBySupplier.get(supplier.id) || [];
        const supplierScorecard = (scorecardsBySupplier.get(supplier.id) || [])[0];
        const supplierSustainability = (sustainabilityBySupplier.get(supplier.id) || [])[0];
        const atRiskPurchaseOrders = supplierPurchaseOrders.filter(
          (purchaseOrder) => purchaseOrder.status === 'at_risk' || purchaseOrder.priority === 'critical'
        );
        const inventoryAlerts = supplierInventory.filter(
          (inventoryPosition) => inventoryPosition.inventory_status !== 'healthy'
        );
        const openDisruptions = supplierDisruptions.filter(
          (disruption) => disruption.status === 'active'
        );
        const controlScore =
          (supplier.risk_score || 0) +
          atRiskPurchaseOrders.length * 12 +
          inventoryAlerts.length * 10 +
          openDisruptions.length * 15 +
          supplierLanes.filter((lane) => (lane.reliability_score || 0) < 75).length * 8 +
          (supplierScorecard && supplierScorecard.overall_score < 75 ? 10 : 0) +
          (supplierSustainability && supplierSustainability.esg_score < 70 ? 6 : 0);

        return {
          id: supplier.id,
          name: supplier.name,
          companyName: company?.name || 'Unknown company',
          tier: supplier.tier,
          country: supplier.country,
          riskScore: supplier.risk_score,
          openPurchaseOrders: supplierPurchaseOrders.filter(
            (purchaseOrder) => purchaseOrder.status !== 'received'
          ).length,
          atRiskPurchaseOrders: atRiskPurchaseOrders.length,
          inventoryAlerts: inventoryAlerts.length,
          activeDisruptions: openDisruptions.length,
          laneReliability: average(supplierLanes.map((lane) => lane.reliability_score || 0)),
          performanceScore: supplierScorecard?.overall_score || 0,
          esgScore: supplierSustainability?.esg_score || 0,
          controlScore,
        };
      })
      .sort((left, right) => right.controlScore - left.controlScore)
      .slice(0, 6);

    const inventoryAlerts = inventoryPositions
      .filter((inventoryPosition) => inventoryPosition.inventory_status !== 'healthy')
      .map((inventoryPosition) => {
        const supplier = suppliers.find((item) => item.id === inventoryPosition.supplier_id);
        const product = products.find((item) => item.id === inventoryPosition.product_id);

        return {
          id: inventoryPosition.id,
          supplierName: supplier?.name || 'Unknown supplier',
          productName: product?.name || 'Unknown product',
          warehouseLocation: inventoryPosition.warehouse_location,
          status: inventoryPosition.inventory_status,
          daysOfSupply: inventoryPosition.days_of_supply,
          onHandUnits: inventoryPosition.on_hand_units,
          safetyStockUnits: inventoryPosition.safety_stock_units,
        };
      })
      .sort((left, right) => left.daysOfSupply - right.daysOfSupply);

    const disruptionWatchlist = activeDisruptions.map((disruption) => {
      const supplier = suppliers.find((item) => item.id === disruption.supplier_id);
      const company = companies.find((item) => item.id === disruption.company_id);

      return {
        id: disruption.id,
        supplierName: supplier?.name || 'Unknown supplier',
        companyName: company?.name || 'Unknown company',
        type: disruption.disruption_type,
        severity: disruption.severity,
        affectedLane: disruption.affected_lane,
        impactSummary: disruption.impact_summary,
        mitigationAction: disruption.mitigation_action,
        estimatedResolutionDate: disruption.estimated_resolution_date,
      };
    });

    const purchaseOrderValueAtRisk = purchaseOrders
      .filter(
        (purchaseOrder) => purchaseOrder.status === 'at_risk' || purchaseOrder.priority === 'critical'
      )
      .reduce((total, purchaseOrder) => total + (purchaseOrder.total_value_usd || 0), 0);

    const purchaseOrderFillRate = purchaseOrders.length
      ? Math.round(
          (sum(purchaseOrders.map((purchaseOrder) => purchaseOrder.quantity_received || 0)) /
            sum(purchaseOrders.map((purchaseOrder) => purchaseOrder.quantity_ordered || 0))) *
            100
        )
      : 0;

    const topSuppliers = suppliers
      .map((supplier) => {
        const company = companies.find((item) => item.id === supplier.company_id);
        return {
          id: supplier.id,
          name: supplier.name,
          companyName: company?.name || 'Unknown company',
          tier: supplier.tier,
          status: supplier.status,
          country: supplier.country,
          riskScore: supplier.risk_score,
          annualRevenueUsd: supplier.annual_revenue_usd,
          products: (productsBySupplier.get(supplier.id) || []).length,
        };
      })
      .sort((left, right) => right.annualRevenueUsd - left.annualRevenueUsd)
      .slice(0, 5);

    const networkStats = {
      totalSubcontractors: suppliers.filter((supplier) => supplier.parent_supplier_id !== null).length,
      multiTierSuppliers: suppliers.filter((supplier) => supplier.tier >= 2).length,
      highRiskSuppliers: suppliers.filter((supplier) => (supplier.risk_score || 0) >= 65).length,
      seededDemoData: seedResult.seeded,
    };

    const companyComparison = companySummary.map((company) => ({
      companyId: company.companyId,
      name: company.name,
      supplierCount: company.supplierCount,
      subcontractorCount: company.subcontractorCount,
      avgRiskScore: company.avgRiskScore,
      annualRevenueUsd: company.annualRevenueUsd,
      activeSuppliers: company.activeSuppliers,
    }));

    const highestRiskSupplierSource = suppliers.reduce(
      (currentHighest, supplier) =>
        (supplier.risk_score || 0) > (currentHighest?.risk_score || 0) ? supplier : currentHighest,
      null
    );

    const highestRiskSupplierCompany = companies.find(
      (company) => company.id === highestRiskSupplierSource?.company_id
    );

    const mostComplexCompany = companyComparison.reduce(
      (currentMostComplex, company) =>
        !currentMostComplex || company.subcontractorCount > currentMostComplex.subcontractorCount
          ? company
          : currentMostComplex,
      null
    );

    const delayedShipments = shipments.filter((shipment) => shipment.status === 'delayed');
    const delayedShipmentRate = shipments.length
      ? Math.round((delayedShipments.length / shipments.length) * 100)
      : 0;

    const onTimeShipmentRate = shipments.length
      ? Math.round(
          (((shipmentStatusCounts.delivered || 0) + (shipmentStatusCounts.in_transit || 0)) /
            shipments.length) *
            100
        )
      : 0;

    const validCertificationRate = complianceCertifications.length
      ? Math.round(((certificationStatusCounts.valid || 0) / complianceCertifications.length) * 100)
      : 0;

    const networkHighlights = {
      highestRiskSupplier: highestRiskSupplierSource
        ? {
            id: highestRiskSupplierSource.id,
            name: highestRiskSupplierSource.name,
            companyName: highestRiskSupplierCompany?.name || 'Unknown company',
            riskScore: highestRiskSupplierSource.risk_score,
            tier: highestRiskSupplierSource.tier,
            country: highestRiskSupplierSource.country,
            status: highestRiskSupplierSource.status,
          }
        : null,
      mostComplexCompany,
      delayedShipmentRate,
      delayedShipmentCount: delayedShipments.length,
      onTimeShipmentRate,
      validCertificationRate,
      averageNetworkRisk: average(suppliers.map((supplier) => supplier.risk_score || 0)),
      totalTrackedRevenueUsd: sum(companies.map((company) => company.annual_revenue_usd || 0)),
    };

    res.json({
      totalCompanies: companies.length,
      totalSuppliers: suppliers.length,
      totalProducts: products.length,
      totalShipments: shipments.length,
      totalRiskAssessments: riskAssessments.length,
      totalComplianceCertifications: complianceCertifications.length,
      totalPurchaseOrders: purchaseOrders.length,
      totalInventoryPositions: inventoryPositions.length,
      totalSupplyDisruptions: supplyDisruptions.length,
      totalLogisticsLanes: logisticsLanes.length,
      totalDemandForecasts: demandForecasts.length,
      totalSupplierScorecards: supplierScorecards.length,
      totalSustainabilityMetrics: sustainabilityMetrics.length,
      activeSuppliers: suppliers.filter((supplier) => supplier.status === 'active').length,
      deliveredShipments: shipmentStatusCounts.delivered || 0,
      validCertifications: complianceCertifications.filter(
        (certification) => certification.status === 'valid'
      ).length,
      companySummary,
      companyComparison,
      companySpotlight: companySummary[0] || null,
      riskDistribution,
      tierDistribution,
      supplierCountryDistribution,
      riskCategoryBreakdown,
      shipmentStatusBreakdown: Object.entries(shipmentStatusCounts).map(([status, value]) => ({
        status,
        value,
      })),
      supplierStatusBreakdown,
      shipmentVolumeByDate,
      riskByTier,
      destinationCountryBreakdown,
      productCategoryBreakdown,
      purchaseOrderStatusBreakdown,
      purchaseOrderPriorityBreakdown,
      inventoryStatusBreakdown,
      disruptionSeverityBreakdown,
      logisticsModeBreakdown,
      logisticsLaneWatchlist,
      demandForecastByProduct,
      supplierPerformanceLeaders: supplierPerformanceLeaders.slice(0, 6),
      sustainabilityLeaderboard: sustainabilityLeaderboard.slice(0, 6),
      supplierControlTower,
      inventoryAlerts,
      disruptionWatchlist,
      certificationStatusBreakdown,
      topSuppliers,
      networkStats,
      networkHighlights: {
        ...networkHighlights,
        activeDisruptionCount: activeDisruptions.length,
        inventoryAlertCount: inventoryAlerts.length,
        purchaseOrderValueAtRisk,
        purchaseOrderFillRate,
        demandForecastCoverage,
        avgLaneReliability: average(logisticsLanes.map((lane) => lane.reliability_score || 0)),
        avgSupplierPerformanceScore: average(
          supplierScorecards.map((scorecard) => scorecard.overall_score || 0)
        ),
        avgEsgScore: average(
          sustainabilityMetrics.map((sustainabilityMetric) => sustainabilityMetric.esg_score || 0)
        ),
        totalLaneCarbonKg: sum(logisticsLanes.map((lane) => lane.carbon_kg || 0)),
      },
    });
  } catch (error) {
    console.error('Failed to fetch analytics overview:', error);
    res.status(500).json({ message: 'Failed to fetch analytics overview.' });
  }
});

module.exports = router;