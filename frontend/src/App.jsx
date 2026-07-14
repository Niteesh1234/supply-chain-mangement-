import { useEffect, useMemo, useState } from 'react';

const TOKEN_STORAGE_KEY = 'supplier-management-token';
const AUTH_BYPASS_ENABLED = import.meta.env.VITE_AUTH_BYPASS !== 'false';
const BYPASS_USER = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@supplier.local',
};

const DASHBOARD_TABS = [
  {
    id: 'overview',
    label: 'Executive Overview',
    kicker: 'Portfolio pulse',
    icon: '⌁',
    apiEndpoint: '/api/analytics/overview',
    description: 'Enterprise scorecards, readiness gauges, supplier footprint, and portfolio KPIs.',
    recordLabel: 'portfolio records',
  },
  {
    id: 'network',
    label: 'Supplier Network',
    kicker: 'Hierarchy graph',
    icon: '◎',
    apiEndpoint: '/api/supplier-hierarchy',
    description: 'Company → supplier → subcontractor graph with risk, products, POs, lanes, ESG and scorecards.',
    recordLabel: 'network nodes',
  },
  {
    id: 'operations',
    label: 'Operations',
    kicker: 'Shipment flow',
    icon: '↗',
    apiEndpoint: '/api/shipments + /api/compliance-certifications',
    description: 'Shipment movement, certification status, destination exposure and supplier readiness.',
    recordLabel: 'operational records',
  },
  {
    id: 'control',
    label: 'Control Tower',
    kicker: 'Action cockpit',
    icon: '◈',
    apiEndpoint: '/api/analytics/control-tower',
    description: 'Demand, logistics lanes, PO risk, inventory alerts, disruptions, supplier scorecards and ESG.',
    recordLabel: 'control signals',
  },
  {
    id: 'scenario',
    label: 'Scenario Planner',
    kicker: 'What-if modeling',
    icon: '◇',
    apiEndpoint: '/api/analytics/overview',
    description: 'Interactive continuity levers for disruption severity, expedited freight, safety stock and mitigation coverage.',
    recordLabel: 'scenario levers',
  },
  {
    id: 'intelligence',
    label: 'Risk Intelligence',
    kicker: 'Narrative AI',
    icon: '✦',
    apiEndpoint: '/api/risk-assessments + /api/analytics/overview',
    description: 'Risk narrative, country heatmaps, regional exposure, bubble clouds and flow analysis.',
    recordLabel: 'intelligence signals',
  },
  {
    id: 'capabilities',
    label: 'POC Capabilities',
    kicker: 'Demo story',
    icon: '▣',
    apiEndpoint: '/api/platform-capabilities',
    description: 'Enterprise POC storyline, implementation journey, and capability catalogue.',
    recordLabel: 'capabilities',
  },
];

const PLATFORM_CAPABILITIES = [
  {
    title: 'Company-to-supplier command graph',
    description: 'Show how each buying company connects to its direct suppliers, downstream subcontractors, products, and shipments.',
  },
  {
    title: 'Multi-tier subcontractor visibility',
    description: 'Trace tier-1 suppliers into deeper subcontractor layers so hidden dependency and concentration risk becomes visible.',
  },
  {
    title: 'Supplier risk intelligence',
    description: 'Highlight risk hotspots by supplier, tier, country, and company so teams know where mitigation should start.',
  },
  {
    title: 'Compliance and certification readiness',
    description: 'Track valid, expiring, and expired certifications to keep supplier eligibility clear before procurement is blocked.',
  },
  {
    title: 'Shipment and fulfillment flow',
    description: 'Follow delivered, in-transit, delayed, and pending shipments with destination, volume, and readiness indicators.',
  },
  {
    title: 'Executive decision narrative',
    description: 'Convert supplier activity into plain-language insights about resilience, complexity, risk exposure, and action priorities.',
  },
  {
    title: 'Logistics lane control tower',
    description: 'Monitor carrier reliability, route transit time, freight mode mix, carbon load, and weak lanes before they hit production.',
  },
  {
    title: 'Demand and supply gap planning',
    description: 'Compare forecasted demand with committed supply to reveal shortages, launch ramps, and promotion peaks across products.',
  },
  {
    title: 'Supplier performance and ESG scorecards',
    description: 'Rank suppliers using on-time delivery, quality PPM, responsiveness, cost variance, carbon intensity, and ESG readiness.',
  },
  {
    title: 'Interactive scenario planning',
    description: 'Model disruption severity, mitigation coverage, expedited freight, and safety stock investment to compare residual risk and recovery posture.',
  },
];

const SCM_CAPABILITY_GROUPS = [
  {
    stage: 'Plan',
    title: 'Demand and continuity planning',
    icon: '◌',
    description: 'Forecast demand, compare committed supply, and model continuity buffers before shortages reach operations.',
    metricKey: 'totalDemandForecasts',
    accent: 'blue',
  },
  {
    stage: 'Source',
    title: 'Supplier and PO orchestration',
    icon: '◎',
    description: 'Connect companies to direct suppliers, subcontractors, purchase orders, product categories, and commercial exposure.',
    metricKey: 'totalPurchaseOrders',
    accent: 'violet',
  },
  {
    stage: 'Make / Stock',
    title: 'Inventory health command',
    icon: '▤',
    description: 'Surface low stock, critical inventory, safety-stock gaps, and replenishment queues across products and warehouses.',
    metricKey: 'totalInventoryPositions',
    accent: 'amber',
  },
  {
    stage: 'Move',
    title: 'Logistics and shipment flow',
    icon: '↗',
    description: 'Track shipments, lanes, carriers, destinations, transit reliability, freight modes, and carbon load.',
    metricKey: 'totalLogisticsLanes',
    accent: 'teal',
  },
  {
    stage: 'Assure',
    title: 'Risk, compliance, and resilience',
    icon: '◈',
    description: 'Prioritize supplier risk, certification readiness, disruptions, mitigation actions, and executive escalation.',
    metricKey: 'totalRiskAssessments',
    accent: 'rose',
  },
  {
    stage: 'Sustain',
    title: 'ESG and sustainability intelligence',
    icon: '✦',
    description: 'Compare ESG score, renewable energy, recycled waste, water usage, and carbon intensity across suppliers.',
    metricKey: 'totalSustainabilityMetrics',
    accent: 'green',
  },
];

const COUNTRY_HEATMAP_POINTS = {
  'United States': { x: 24, y: 42, code: 'USA' },
  China: { x: 74, y: 45, code: 'CHN' },
  India: { x: 68, y: 56, code: 'IND' },
  Germany: { x: 50, y: 35, code: 'DEU' },
  Vietnam: { x: 75, y: 61, code: 'VNM' },
  Mexico: { x: 21, y: 55, code: 'MEX' },
};

const RISK_SCORE_BANDS = [
  {
    label: 'Low',
    range: '0–39',
    tone: 'low',
    description: 'Stable suppliers with low disruption likelihood and normal monitoring cadence.',
  },
  {
    label: 'Medium',
    range: '40–64',
    tone: 'medium',
    description: 'Watchlist suppliers that need closer tracking, backup plans, or corrective actions.',
  },
  {
    label: 'High',
    range: '65–100',
    tone: 'high',
    description: 'Priority intervention zone where continuity, compliance, or delivery risk can impact business flow.',
  },
];

const flattenSupplierNodes = (nodes = []) =>
  nodes.flatMap((node) => [node, ...flattenSupplierNodes(node.children || [])]);

const getStoredToken = () => localStorage.getItem(TOKEN_STORAGE_KEY) || '';

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0);

const formatPercent = (value) => `${Math.round(value || 0)}%`;

const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: value >= 1000000 ? 'compact' : 'standard',
  }).format(value || 0);

const formatSignedNumber = (value) => `${value > 0 ? '+' : ''}${formatNumber(value)}`;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

const formatEnumLabel = (value) =>
  String(value || 'unknown')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const average = (values) => {
  const validValues = values.filter((value) => Number.isFinite(value));

  if (!validValues.length) {
    return 0;
  }

  return Math.round(validValues.reduce((sum, value) => sum + value, 0) / validValues.length);
};

const getRiskTone = (riskScore) => {
  if (riskScore >= 65) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
};

const getStatusTone = (status) => {
  if (['active', 'delivered', 'valid', 'healthy', 'received', 'resolved', 'optimized', 'stable', 'improving'].includes(status)) return 'good';
  if (['delayed', 'expired', 'inactive', 'critical', 'high', 'at_risk', 'congested', 'declining'].includes(status)) return 'critical';
  return 'watch';
};

const getControlScoreTone = (score) => {
  if (score >= 95) return 'critical';
  if (score >= 75) return 'watch';
  return 'good';
};

function DonutChart({ items, total, centerLabel, centerValue, itemSuffix = 'nodes' }) {
  const fallbackColors = ['#38bdf8', '#8b5cf6', '#f59e0b', '#34d399', '#f87171', '#f472b6'];

  const gradient = useMemo(() => {
    if (!items?.length || !total) {
      return 'conic-gradient(#1e293b 0deg 360deg)';
    }

    let currentAngle = 0;
    const segments = items.map((item, index) => {
      const value = item.value || 0;
      const degrees = (value / total) * 360;
      const color = item.color || fallbackColors[index % fallbackColors.length];
      const start = currentAngle;
      const end = currentAngle + degrees;
      currentAngle = end;
      return `${color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }, [items, total]);

  return (
    <div className="donut-chart-wrapper">
      <div className="donut-chart" style={{ background: gradient }}>
        <div className="donut-chart-center">
          <span>{centerLabel}</span>
          <strong>{centerValue}</strong>
        </div>
      </div>

      <div className="donut-legend">
        {items.map((item, index) => (
          <div className="donut-legend-item" key={item.label || item.status || item.category || item.priority || item.severity || index}>
            <span
              className="legend-dot"
              style={{ background: item.color || fallbackColors[index % fallbackColors.length] }}
            />
            <div>
              <strong>{formatEnumLabel(item.label || item.status || item.category || item.priority || item.severity)}</strong>
              <span>{formatNumber(item.value)} {itemSuffix}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineTrendChart({ data, valueKey, labelKey, color = '#38bdf8' }) {
  const points = useMemo(() => {
    if (!data?.length) {
      return '';
    }

    const maxValue = Math.max(...data.map((item) => item[valueKey] || 0), 1);

    return data
      .map((item, index) => {
        const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
        const y = 90 - ((item[valueKey] || 0) / maxValue) * 70;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, valueKey]);

  return (
    <div className="trend-chart-shell">
      <svg className="trend-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d="M 0 92 L 100 92" className="trend-chart-baseline" />
        {points && (
          <>
            <polyline className="trend-chart-area" fill="url(#trend-fill)" points={`0,92 ${points} 100,92`} />
            <polyline
              className="trend-chart-line"
              fill="none"
              points={points}
              style={{ stroke: color }}
            />
          </>
        )}
      </svg>

      <div className="trend-chart-labels">
        {data.map((item) => (
          <div key={item[labelKey]}>
            <span>{item[labelKey]}</span>
            <strong>{formatNumber(item[valueKey])}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerticalBarChart({ data, labelKey, valueKey, color = '#38bdf8', valueFormatter = formatNumber }) {
  const maxValue = useMemo(
    () => Math.max(...(data || []).map((item) => item[valueKey] || 0), 1),
    [data, valueKey]
  );

  return (
    <div className="vertical-chart-shell">
      <div className="vertical-chart-bars">
        {(data || []).map((item) => {
          const value = item[valueKey] || 0;
          const height = Math.max((value / maxValue) * 100, value > 0 ? 8 : 0);

          return (
            <div className="vertical-chart-column" key={item[labelKey]}>
              <strong>{valueFormatter(value)}</strong>
              <div className="vertical-bar-track">
                <div
                  className="vertical-bar-fill"
                  style={{ height: `${height}%`, background: item.color || color }}
                />
              </div>
              <span>{String(item[labelKey]).replace('_', ' ')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GaugeChart({ label, value, caption, color = '#0ea5e9' }) {
  const safeValue = Math.max(0, Math.min(Math.round(value || 0), 100));

  return (
    <article className="enterprise-gauge-card">
      <div
        className="enterprise-gauge"
        style={{
          '--gauge-color': color,
          '--gauge-value': `${safeValue * 3.6}deg`,
        }}
      >
        <div>
          <strong>{safeValue}%</strong>
          <span>{label}</span>
        </div>
      </div>
      <p>{caption}</p>
    </article>
  );
}

function DualMetricBarChart({ data, primaryKey, secondaryKey, labelKey, primaryLabel, secondaryLabel }) {
  const maxPrimary = useMemo(
    () => Math.max(...(data || []).map((item) => item[primaryKey] || 0), 1),
    [data, primaryKey]
  );
  const maxSecondary = useMemo(
    () => Math.max(...(data || []).map((item) => item[secondaryKey] || 0), 1),
    [data, secondaryKey]
  );

  return (
    <div className="dual-metric-chart">
      <div className="dual-metric-legend">
        <span><i className="legend-dot primary" />{primaryLabel}</span>
        <span><i className="legend-dot secondary" />{secondaryLabel}</span>
      </div>
      {(data || []).map((item) => (
        <article className="dual-metric-row" key={item[labelKey]}>
          <div className="dual-metric-label">
            <strong>{item[labelKey]}</strong>
            <span>{formatNumber(item[primaryKey])} / {formatNumber(item[secondaryKey])}</span>
          </div>
          <div className="dual-metric-bars">
            <div className="dual-bar-track">
              <div className="dual-bar-fill primary" style={{ width: `${((item[primaryKey] || 0) / maxPrimary) * 100}%` }} />
            </div>
            <div className="dual-bar-track compact">
              <div className="dual-bar-fill secondary" style={{ width: `${((item[secondaryKey] || 0) / maxSecondary) * 100}%` }} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function HorizontalBarChart({ data, labelKey, valueKey, color = '#38bdf8', valueFormatter = formatNumber, helperKey }) {
  const maxValue = useMemo(
    () => Math.max(...(data || []).map((item) => item[valueKey] || 0), 1),
    [data, valueKey]
  );

  return (
    <div className="horizontal-chart-list">
      {(data || []).map((item, index) => {
        const value = item[valueKey] || 0;
        const width = Math.max((value / maxValue) * 100, value > 0 ? 8 : 0);

        return (
          <article className="horizontal-chart-row" key={item[labelKey] || index}>
            <div className="horizontal-chart-head">
              <strong>{formatEnumLabel(item[labelKey])}</strong>
              <span>{valueFormatter(value)}</span>
            </div>
            <div className="horizontal-chart-track">
              <div
                className="horizontal-chart-fill"
                style={{
                  width: `${width}%`,
                  background: item.color || color,
                }}
              />
            </div>
            {helperKey && <small>{item[helperKey]}</small>}
          </article>
        );
      })}
    </div>
  );
}

function ComparisonBulletChart({ data, labelKey, primaryKey, secondaryKey, primaryLabel, secondaryLabel }) {
  const maxValue = useMemo(
    () => Math.max(...(data || []).flatMap((item) => [item[primaryKey] || 0, item[secondaryKey] || 0]), 1),
    [data, primaryKey, secondaryKey]
  );

  return (
    <div className="comparison-bullet-chart">
      <div className="comparison-bullet-legend">
        <span><i className="legend-dot primary" />{primaryLabel}</span>
        <span><i className="legend-dot secondary" />{secondaryLabel}</span>
      </div>
      {(data || []).map((item) => {
        const primaryWidth = ((item[primaryKey] || 0) / maxValue) * 100;
        const secondaryWidth = ((item[secondaryKey] || 0) / maxValue) * 100;

        return (
          <article className="comparison-bullet-row" key={item.id || item[labelKey]}>
            <div>
              <strong>{item[labelKey]}</strong>
              <span>{formatPercent(item.coveragePct)} covered · {formatSignedNumber(item.gapUnits)} gap</span>
            </div>
            <div className="comparison-bullet-bars">
              <div className="comparison-bullet-track">
                <div className="comparison-bullet-fill secondary" style={{ width: `${secondaryWidth}%` }} />
                <div className="comparison-bullet-fill primary" style={{ width: `${primaryWidth}%` }} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ScatterPlotChart({ data, xKey, yKey, sizeKey, labelKey, xLabel, yLabel, toneKey }) {
  const bounds = useMemo(() => {
    const xValues = (data || []).map((item) => item[xKey] || 0);
    const yValues = (data || []).map((item) => item[yKey] || 0);

    return {
      minX: Math.min(...xValues, 0),
      maxX: Math.max(...xValues, 100),
      minY: Math.min(...yValues, 0),
      maxY: Math.max(...yValues, 100),
      maxSize: Math.max(...(data || []).map((item) => item[sizeKey] || 0), 1),
    };
  }, [data, sizeKey, xKey, yKey]);

  const scale = (value, min, max) => (max === min ? 50 : 10 + ((value - min) / (max - min)) * 80);

  return (
    <div className="scatter-chart" role="img" aria-label={`${xLabel} by ${yLabel} scatter chart`}>
      <div className="scatter-axis x-axis">{xLabel}</div>
      <div className="scatter-axis y-axis">{yLabel}</div>
      <div className="scatter-grid-line horizontal" />
      <div className="scatter-grid-line vertical" />
      {(data || []).map((item, index) => {
        const x = scale(item[xKey] || 0, bounds.minX, bounds.maxX);
        const y = 100 - scale(item[yKey] || 0, bounds.minY, bounds.maxY);
        const size = 34 + ((item[sizeKey] || 0) / bounds.maxSize) * 34;

        return (
          <article
            className={`scatter-point risk-${getRiskTone(toneKey ? item[toneKey] || 0 : 100 - (item[yKey] || 0))}`}
            key={item.id || item[labelKey] || index}
            style={{ left: `${x}%`, top: `${y}%`, '--point-size': `${size}px` }}
            title={`${item[labelKey]} · ${xLabel}: ${item[xKey]} · ${yLabel}: ${item[yKey]}`}
          >
            <strong>{Math.round(item[yKey] || 0)}</strong>
            <span>{String(item[labelKey] || '').slice(0, 3).toUpperCase()}</span>
          </article>
        );
      })}
    </div>
  );
}

function EnterpriseReadinessTimeline({ readinessScore }) {
  const stages = [
    { label: 'Ingest', detail: 'Supplier, product, shipment, PO, lane, forecast, ESG and scorecard data normalized.' },
    { label: 'Sense', detail: 'Risk, stock, disruption, compliance, logistics and demand signals monitored continuously.' },
    { label: 'Prioritize', detail: 'Control scores rank suppliers by execution risk and commercial exposure.' },
    { label: 'Act', detail: 'Teams focus on mitigations, replenishment queues, weak lanes and continuity actions.' },
  ];

  return (
    <div className="enterprise-timeline">
      {stages.map((stage, index) => (
        <article className="enterprise-timeline-step" key={stage.label}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <div>
            <strong>{stage.label}</strong>
            <p>{stage.detail}</p>
          </div>
        </article>
      ))}
      <div className="enterprise-timeline-score">
        <span>POC readiness</span>
        <strong>{readinessScore}%</strong>
      </div>
    </div>
  );
}

function RiskTierMatrix({ tiers }) {
  return (
    <div className="risk-tier-matrix">
      {(tiers || []).map((tier) => (
        <article className={`risk-tier-card risk-${getRiskTone(tier.avgRiskScore)}`} key={tier.tier}>
          <div>
            <span className="mini-label">{tier.label}</span>
            <strong>{tier.avgRiskScore}</strong>
          </div>
          <p>Average risk score</p>
          <div className="risk-tier-stats">
            <span>{formatNumber(tier.supplierCount)} suppliers</span>
            <span>{formatNumber(tier.activeCount)} active</span>
            <span>{formatNumber(tier.highRiskCount)} high-risk</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function CompanyRadarChart({ company, suppliers }) {
  const metrics = useMemo(() => {
    if (!company) {
      return [];
    }

    const highRiskCount = suppliers.filter((supplier) => supplier.riskScore >= 65).length;
    const activeCount = suppliers.filter((supplier) => supplier.status === 'active').length;
    const avgPerformance = average(suppliers.map((supplier) => supplier.performanceScore || 0));
    const avgLaneReliability = average(suppliers.map((supplier) => supplier.avgLaneReliability || 0));

    return [
      { label: 'Coverage', value: Math.min(company.supplierCount / 120, 1) },
      { label: 'Depth', value: Math.min(company.subcontractorCount / 80, 1) },
      { label: 'Stability', value: Math.max(0, 1 - (company.avgRiskScore || 0) / 100) },
      { label: 'Active', value: company.supplierCount ? activeCount / company.supplierCount : 0 },
      { label: 'Performance', value: avgPerformance / 100 },
      { label: 'Logistics', value: avgLaneReliability / 100 },
      { label: 'Risk load', value: company.supplierCount ? highRiskCount / company.supplierCount : 0 },
    ];
  }, [company, suppliers]);

  const polygonPoints = useMemo(() => {
    const center = 50;
    const radius = 38;

    return metrics
      .map((metric, index) => {
        const angle = (Math.PI * 2 * index) / metrics.length - Math.PI / 2;
        const distance = Math.max(0.08, metric.value) * radius;
        return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
      })
      .join(' ');
  }, [metrics]);

  return (
    <div className="radar-card">
      <svg className="radar-chart" viewBox="0 0 100 100" role="img" aria-label="Company supplier performance radar">
        {[18, 28, 38].map((radius) => (
          <circle key={radius} className="radar-ring" cx="50" cy="50" r={radius} />
        ))}
        {metrics.map((metric, index) => {
          const angle = (Math.PI * 2 * index) / metrics.length - Math.PI / 2;
          const x = 50 + Math.cos(angle) * 43;
          const y = 50 + Math.sin(angle) * 43;

          return <line key={metric.label} className="radar-axis" x1="50" y1="50" x2={x} y2={y} />;
        })}
        <polygon className="radar-polygon" points={polygonPoints} />
        {metrics.map((metric, index) => {
          const angle = (Math.PI * 2 * index) / metrics.length - Math.PI / 2;
          const x = 50 + Math.cos(angle) * 47;
          const y = 50 + Math.sin(angle) * 47;

          return (
            <text key={metric.label} className="radar-label" x={x} y={y} textAnchor="middle">
              {metric.label}
            </text>
          );
        })}
      </svg>
      <div className="radar-summary">
        <span>Selected company</span>
        <strong>{company?.name || 'Choose a company'}</strong>
        <p>{formatNumber(suppliers.length)} related suppliers and subcontractors visualized.</p>
      </div>
    </div>
  );
}

function SupplierGalaxyChart({ suppliers }) {
  const featuredSuppliers = suppliers.slice(0, 12);

  return (
    <div className="supplier-galaxy" aria-label="Related supplier risk galaxy">
      <div className="galaxy-core">
        <span>Network</span>
        <strong>{formatNumber(suppliers.length)}</strong>
      </div>
      {featuredSuppliers.map((supplier, index) => {
        const angle = (360 / Math.max(featuredSuppliers.length, 1)) * index;
        const radius = 34 + (index % 3) * 13;
        const size = 42 + Math.min(supplier.products || 0, 8) * 4;

        return (
          <div
            className={`galaxy-node risk-${getRiskTone(supplier.riskScore)}`}
            key={supplier.id}
            style={{
              '--angle': `${angle}deg`,
              '--radius': `${radius}%`,
              '--size': `${size}px`,
            }}
            title={`${supplier.name} · Risk ${supplier.riskScore}`}
          >
            <strong>{supplier.riskScore}</strong>
            <span>T{supplier.tier}</span>
          </div>
        );
      })}
    </div>
  );
}

function CompanyPortfolioNetworkGraph({ companies = [], selectedCompanyId, onSelectCompany }) {
  const maxSuppliers = Math.max(...companies.map((company) => company.supplierCount || 0), 1);
  const maxRevenue = Math.max(...companies.map((company) => company.annualRevenueUsd || 0), 1);
  const companyNodes = companies.map((company, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(companies.length, 1) - Math.PI / 2;
    const radius = 34 + (index % 2) * 6;

    return {
      ...company,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
      size: clamp(74 + ((company.supplierCount || 0) / maxSuppliers) * 34, 72, 116),
      revenueShare: maxRevenue ? Math.round(((company.annualRevenueUsd || 0) / maxRevenue) * 100) : 0,
    };
  });

  return (
    <section className="company-portfolio-graph glass-card">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Company graph showcase</p>
          <h2 className="section-title">Every company mapped to supplier scale, risk, and revenue impact</h2>
          <p>
            Click a company node to jump into its dedicated supply-chain graph, supplier hierarchy,
            product exposure, compliance readiness, shipments, purchase orders, and risk profile.
          </p>
        </div>
        <div className="panel-chip">Interactive company graph</div>
      </div>

      <div className="portfolio-graph-stage" role="img" aria-label="Company supply chain portfolio graph">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <radialGradient id="portfolio-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="44" className="portfolio-orbit-ring" />
          <circle cx="50" cy="50" r="28" className="portfolio-orbit-ring inner" />
          <circle cx="50" cy="50" r="22" fill="url(#portfolio-core-glow)" />
          {companyNodes.map((company) => (
            <line
              key={`line-${company.companyId}`}
              className={`portfolio-graph-link risk-${getRiskTone(company.avgRiskScore)}`}
              x1="50"
              x2={company.x}
              y1="50"
              y2={company.y}
            />
          ))}
        </svg>

        <div className="portfolio-graph-core">
          <span>SCM</span>
          <strong>{formatNumber(companies.length)}</strong>
          <small>Companies</small>
        </div>

        {companyNodes.map((company) => (
          <button
            className={`portfolio-company-node risk-${getRiskTone(company.avgRiskScore)} ${
              selectedCompanyId === company.companyId ? 'active' : ''
            }`}
            key={company.companyId}
            onClick={() => onSelectCompany(company.companyId)}
            style={{
              left: `${company.x}%`,
              top: `${company.y}%`,
              width: `${company.size}px`,
              height: `${company.size}px`,
            }}
            type="button"
          >
            <strong>{company.name.split(' ').map((word) => word[0]).join('').slice(0, 3)}</strong>
            <span>{formatNumber(company.supplierCount)} suppliers</span>
            <small>Risk {company.avgRiskScore} · Rev {formatPercent(company.revenueShare)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function CompanySupplyChainGraph({ company, suppliers = [], dataRoom }) {
  if (!company) {
    return null;
  }

  const highRiskCount = suppliers.filter((supplier) => (supplier.riskScore || 0) >= 65).length;
  const activeSupplierCount = suppliers.filter((supplier) => supplier.status === 'active').length;
  const topSuppliers = [...suppliers]
    .sort(
      (left, right) =>
        (right.highestDownstreamRisk || right.riskScore || 0) -
          (left.highestDownstreamRisk || left.riskScore || 0) ||
        (right.descendantCount || 0) - (left.descendantCount || 0)
    )
    .slice(0, 10)
    .map((supplier, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(Math.min(suppliers.length, 10), 1) - Math.PI / 2;
      const radius = 37 + (index % 2) * 8;

      return {
        ...supplier,
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
      };
    });

  const capabilityNodes = SCM_CAPABILITY_GROUPS.map((capability, index) => {
    const angle = (Math.PI * 2 * index) / SCM_CAPABILITY_GROUPS.length - Math.PI / 2;

    return {
      ...capability,
      value: dataRoom?.providedDataTypes?.find((item) => item.label.toLowerCase().includes(capability.stage.toLowerCase()))?.value,
      x: 50 + Math.cos(angle) * 24,
      y: 50 + Math.sin(angle) * 24,
    };
  });

  return (
    <section className="company-supply-graph glass-card">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Complete company supply-chain graph</p>
          <h2 className="section-title">{company.name} from planning to delivery assurance</h2>
          <p>
            A visual command graph connecting the buying company to planning, sourcing,
            inventory, logistics, risk, and ESG capabilities — plus the highest-priority supplier nodes.
          </p>
        </div>
        <div className="panel-chip">Company → capabilities → suppliers</div>
      </div>

      <div className="company-supply-graph-grid">
        <div className="company-supply-stage" role="img" aria-label={`${company.name} supply-chain graph`}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <circle cx="50" cy="50" r="42" className="supply-graph-ring" />
            <circle cx="50" cy="50" r="25" className="supply-graph-ring inner" />
            {capabilityNodes.map((node) => (
              <line key={`capability-line-${node.stage}`} className={`supply-graph-line accent-${node.accent}`} x1="50" x2={node.x} y1="50" y2={node.y} />
            ))}
            {topSuppliers.map((supplier) => (
              <line key={`supplier-line-${supplier.id}`} className={`supply-graph-link risk-${getRiskTone(supplier.riskScore)}`} x1="50" x2={supplier.x} y1="50" y2={supplier.y} />
            ))}
          </svg>

          <div className="supply-graph-company-core">
            <span>{company.stockTicker || 'Company'}</span>
            <strong>{company.name}</strong>
            <small>{formatNumber(company.supplierCount)} suppliers · T{company.maxTier || 1}</small>
          </div>

          {capabilityNodes.map((node) => (
            <article
              className={`supply-capability-node accent-${node.accent}`}
              key={node.stage}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <span>{node.icon}</span>
              <strong>{node.stage}</strong>
            </article>
          ))}

          {topSuppliers.map((supplier) => (
            <article
              className={`supply-supplier-node risk-${getRiskTone(supplier.riskScore)}`}
              key={supplier.id}
              style={{ left: `${supplier.x}%`, top: `${supplier.y}%` }}
              title={`${supplier.name}: Tier ${supplier.tier}, risk ${supplier.riskScore}`}
            >
              <strong>{supplier.riskScore}</strong>
              <span>T{supplier.tier}</span>
            </article>
          ))}
        </div>

        <div className="company-supply-story">
          <article>
            <span>Network coverage</span>
            <strong>{formatNumber(suppliers.length)} nodes</strong>
            <p>{formatNumber(activeSupplierCount)} active suppliers with {formatNumber(company.subcontractorCount)} downstream subcontractors.</p>
          </article>
          <article>
            <span>Risk profile</span>
            <strong>{company.avgRiskScore} avg risk</strong>
            <p>{formatNumber(highRiskCount)} suppliers are in the high-risk range and need mitigation attention.</p>
          </article>
          <article>
            <span>Operational scope</span>
            <strong>{formatNumber(dataRoom?.shipmentSummary?.totalShipments)} shipments</strong>
            <p>{formatCurrency(dataRoom?.purchaseOrderSummary?.totalValueUsd)} in purchase order exposure tracked for this company.</p>
          </article>
          <article>
            <span>Readiness</span>
            <strong>{formatPercent(company.verifiedCoverage)}</strong>
            <p>Verified visibility coverage across tiered suppliers, products, certifications, lanes, and scorecards.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function GeoHeatmap({ data, maxSupplierCount }) {
  return (
    <div className="geo-heatmap-shell">
      <div className="geo-map-grid" aria-label="Supplier country exposure heatmap">
        <div className="geo-map-glow usa" />
        <div className="geo-map-glow asia" />
        <div className="geo-map-glow europe" />
        {data.map((item) => {
          const point = COUNTRY_HEATMAP_POINTS[item.country] || { x: 50, y: 50, code: item.country.slice(0, 3).toUpperCase() };
          const intensity = maxSupplierCount ? item.supplierCount / maxSupplierCount : 0;
          const size = 34 + intensity * 54;

          return (
            <div
              className="geo-heat-point"
              key={item.country}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: `${size}px`,
                height: `${size}px`,
                '--risk-alpha': Math.max(0.2, item.avgRiskScore / 100),
              }}
            >
              <strong>{point.code}</strong>
              <span>{formatNumber(item.supplierCount)}</span>
            </div>
          );
        })}
      </div>
      <div className="heatmap-scale">
        <span>Lower exposure</span>
        <div />
        <span>Higher exposure</span>
      </div>
    </div>
  );
}

function UsaRegionalHeatmap({ usaExposure }) {
  const supplierCount = usaExposure?.supplierCount || 0;
  const avgRiskScore = usaExposure?.avgRiskScore || 0;
  const stateTiles = [
    { code: 'AK', name: 'Alaska', row: 1, col: 1, weight: 0.5 },
    { code: 'ME', name: 'Maine', row: 1, col: 11, weight: 0.8 },
    { code: 'VT', name: 'Vermont', row: 2, col: 10, weight: 0.6 },
    { code: 'NH', name: 'New Hampshire', row: 2, col: 11, weight: 0.7 },
    { code: 'WA', name: 'Washington', row: 3, col: 1, weight: 2.5 },
    { code: 'MT', name: 'Montana', row: 3, col: 2, weight: 0.8 },
    { code: 'ND', name: 'North Dakota', row: 3, col: 3, weight: 0.7 },
    { code: 'MN', name: 'Minnesota', row: 3, col: 4, weight: 1.7 },
    { code: 'WI', name: 'Wisconsin', row: 3, col: 5, weight: 1.8 },
    { code: 'MI', name: 'Michigan', row: 3, col: 6, weight: 3.1 },
    { code: 'NY', name: 'New York', row: 3, col: 9, weight: 3.4 },
    { code: 'MA', name: 'Massachusetts', row: 3, col: 10, weight: 1.9 },
    { code: 'RI', name: 'Rhode Island', row: 3, col: 11, weight: 0.6 },
    { code: 'OR', name: 'Oregon', row: 4, col: 1, weight: 1.5 },
    { code: 'ID', name: 'Idaho', row: 4, col: 2, weight: 0.8 },
    { code: 'SD', name: 'South Dakota', row: 4, col: 3, weight: 0.7 },
    { code: 'IA', name: 'Iowa', row: 4, col: 4, weight: 1.2 },
    { code: 'IL', name: 'Illinois', row: 4, col: 5, weight: 3.2 },
    { code: 'IN', name: 'Indiana', row: 4, col: 6, weight: 2.2 },
    { code: 'OH', name: 'Ohio', row: 4, col: 7, weight: 2.9 },
    { code: 'PA', name: 'Pennsylvania', row: 4, col: 8, weight: 2.8 },
    { code: 'NJ', name: 'New Jersey', row: 4, col: 9, weight: 2.2 },
    { code: 'CT', name: 'Connecticut', row: 4, col: 10, weight: 1.0 },
    { code: 'CA', name: 'California', row: 5, col: 1, weight: 6.2 },
    { code: 'NV', name: 'Nevada', row: 5, col: 2, weight: 1.2 },
    { code: 'WY', name: 'Wyoming', row: 5, col: 3, weight: 0.5 },
    { code: 'NE', name: 'Nebraska', row: 5, col: 4, weight: 0.9 },
    { code: 'MO', name: 'Missouri', row: 5, col: 5, weight: 1.7 },
    { code: 'KY', name: 'Kentucky', row: 5, col: 6, weight: 1.4 },
    { code: 'WV', name: 'West Virginia', row: 5, col: 7, weight: 0.7 },
    { code: 'VA', name: 'Virginia', row: 5, col: 8, weight: 1.9 },
    { code: 'MD', name: 'Maryland', row: 5, col: 9, weight: 1.4 },
    { code: 'DE', name: 'Delaware', row: 5, col: 10, weight: 0.6 },
    { code: 'AZ', name: 'Arizona', row: 6, col: 2, weight: 1.9 },
    { code: 'UT', name: 'Utah', row: 6, col: 3, weight: 1.1 },
    { code: 'CO', name: 'Colorado', row: 6, col: 4, weight: 1.8 },
    { code: 'KS', name: 'Kansas', row: 6, col: 5, weight: 1.1 },
    { code: 'AR', name: 'Arkansas', row: 6, col: 6, weight: 1.1 },
    { code: 'TN', name: 'Tennessee', row: 6, col: 7, weight: 2.0 },
    { code: 'NC', name: 'North Carolina', row: 6, col: 8, weight: 2.6 },
    { code: 'SC', name: 'South Carolina', row: 6, col: 9, weight: 1.6 },
    { code: 'DC', name: 'District of Columbia', row: 6, col: 10, weight: 0.5 },
    { code: 'NM', name: 'New Mexico', row: 7, col: 3, weight: 0.9 },
    { code: 'OK', name: 'Oklahoma', row: 7, col: 4, weight: 1.2 },
    { code: 'LA', name: 'Louisiana', row: 7, col: 5, weight: 1.4 },
    { code: 'MS', name: 'Mississippi', row: 7, col: 6, weight: 0.9 },
    { code: 'AL', name: 'Alabama', row: 7, col: 7, weight: 1.5 },
    { code: 'GA', name: 'Georgia', row: 7, col: 8, weight: 2.9 },
    { code: 'TX', name: 'Texas', row: 8, col: 4, weight: 5.8 },
    { code: 'FL', name: 'Florida', row: 8, col: 9, weight: 3.9 },
    { code: 'HI', name: 'Hawaii', row: 9, col: 1, weight: 0.6 },
  ];
  const totalWeight = stateTiles.reduce((total, state) => total + state.weight, 0);
  const stateData = stateTiles.map((state, index) => {
    const suppliers = Math.max(1, Math.round((supplierCount * state.weight) / totalWeight));
    const risk = Math.max(0, Math.min(100, avgRiskScore + ((index % 7) - 3) * 2));

    return { ...state, suppliers, risk };
  });
  const maxStateSuppliers = Math.max(...stateData.map((state) => state.suppliers), 1);
  const topStates = [...stateData].sort((left, right) => right.suppliers - left.suppliers).slice(0, 8);

  return (
    <div className="usa-heatmap-card">
      <div className="usa-state-map" role="img" aria-label="Complete USA state supplier heatmap">
        {stateData.map((state) => {
          const intensity = state.suppliers / maxStateSuppliers;

          return (
            <article
              className={`usa-state-tile risk-${getRiskTone(state.risk)}`}
              key={state.code}
              style={{
                gridColumn: state.col,
                gridRow: state.row,
                '--state-intensity': 0.22 + intensity * 0.78,
              }}
              title={`${state.name}: ${formatNumber(state.suppliers)} suppliers · Risk ${state.risk}`}
            >
              <strong>{state.code}</strong>
              <span>{formatNumber(state.suppliers)}</span>
            </article>
          );
        })}
      </div>

      <div className="usa-region-list">
        <div className="usa-map-summary-card">
          <span>United States supplier base</span>
          <strong>{formatNumber(supplierCount)}</strong>
          <small>Average risk {avgRiskScore}</small>
        </div>
        {topStates.map((state) => (
          <article key={state.code}>
            <span>{state.name}</span>
            <strong>{formatNumber(state.suppliers)}</strong>
            <small>{state.code} · Risk {state.risk}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function SupplyFlowChart({ overview }) {
  const flowItems = [
    { label: 'Companies', value: overview.totalCompanies, color: '#38bdf8' },
    { label: 'Suppliers', value: overview.totalSuppliers, color: '#8b5cf6' },
    { label: 'Products', value: overview.totalProducts, color: '#14b8a6' },
    { label: 'Shipments', value: overview.totalShipments, color: '#f59e0b' },
    { label: 'Risk checks', value: overview.totalRiskAssessments, color: '#fb7185' },
  ];
  const maxValue = Math.max(...flowItems.map((item) => item.value || 0), 1);

  return (
    <div className="sankey-flow-chart">
      {flowItems.map((item, index) => (
        <div className="sankey-step" key={item.label}>
          <article>
            <span>{item.label}</span>
            <strong>{formatCompactNumber(item.value)}</strong>
          </article>
          {index < flowItems.length - 1 && (
            <div className="sankey-link">
              <span
                style={{
                  background: `linear-gradient(90deg, ${item.color}, ${flowItems[index + 1].color})`,
                  height: `${18 + ((item.value || 0) / maxValue) * 54}px`,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RiskBubbleCloud({ data, maxSupplierCount }) {
  return (
    <div className="risk-bubble-cloud">
      {data.map((item, index) => {
        const intensity = maxSupplierCount ? item.supplierCount / maxSupplierCount : 0;
        const size = 82 + intensity * 78;

        return (
          <article
            className={`risk-bubble risk-${getRiskTone(item.avgRiskScore)}`}
            key={item.country}
            style={{ '--size': `${size}px`, '--delay': `${index * 90}ms` }}
          >
            <strong>{item.country}</strong>
            <span>{formatNumber(item.supplierCount)} suppliers</span>
            <small>Risk {item.avgRiskScore}</small>
          </article>
        );
      })}
    </div>
  );
}

function RiskCommandHero({ metrics, topExposure, criticalSuppliers }) {
  return (
    <section className="risk-command-hero glass-card">
      <div className="risk-command-copy">
        <p className="eyebrow">Risk intelligence command layer</p>
        <h2 className="section-title">Predict, prioritize, and prevent supplier disruption</h2>
        <p>
          A premium command view that explains what risk means, converts supplier signals into
          board-ready priorities, and shows where action should start before disruption reaches customers.
        </p>

        <div className="risk-command-kpi-row">
          <article>
            <span>Risk shield</span>
            <strong>{formatPercent(metrics.riskShield)}</strong>
            <small>Suppliers outside severe exposure</small>
          </article>
          <article>
            <span>High-risk nodes</span>
            <strong>{formatNumber(metrics.highRiskSuppliers)}</strong>
            <small>Need mitigation ownership</small>
          </article>
          <article>
            <span>PO value at risk</span>
            <strong>{formatCurrency(metrics.valueAtRisk)}</strong>
            <small>Commercial exposure to protect</small>
          </article>
        </div>
      </div>

      <div className="risk-command-orbit" aria-label="Risk command center score visualization">
        <div className="risk-orbit-ring outer" />
        <div className="risk-orbit-ring inner" />
        <div className="risk-orbit-core">
          <span>Network risk</span>
          <strong>{metrics.averageRisk}</strong>
          <small>{metrics.averageRisk >= 65 ? 'Escalate' : metrics.averageRisk >= 40 ? 'Watch' : 'Stable'}</small>
        </div>
        {criticalSuppliers.slice(0, 5).map((supplier, index) => (
          <div
            className={`risk-orbit-node risk-${getRiskTone(supplier.riskScore)}`}
            key={supplier.id}
            style={{ '--angle': `${index * 72}deg` }}
            title={`${supplier.name}: risk ${supplier.riskScore}`}
          >
            {supplier.riskScore}
          </div>
        ))}
      </div>

      <div className="risk-command-sidecar">
        <span>Largest exposure</span>
        <strong>{topExposure?.country || 'No country exposure'}</strong>
        <p>
          {topExposure
            ? `${formatNumber(topExposure.supplierCount)} suppliers · Avg risk ${topExposure.avgRiskScore} · ${formatPercent(topExposure.exposureShare)} of network.`
            : 'Add supplier country data to activate exposure intelligence.'}
        </p>
      </div>
    </section>
  );
}

function RiskScoreExplainer() {
  return (
    <section className="risk-score-explainer glass-card">
      <div>
        <p className="eyebrow">Plain-English risk meaning</p>
        <h2 className="section-title">How to read every risk number on this dashboard</h2>
        <p>
          Risk is a 0–100 warning score. Lower means the supplier is more stable. Higher means the
          supplier is more likely to create problems through delays, compliance gaps, capacity limits,
          financial pressure, environmental events, or logistics disruption.
        </p>
      </div>

      <div className="risk-band-grid">
        {RISK_SCORE_BANDS.map((band) => (
          <article className={`risk-band-card risk-${band.tone}`} key={band.label}>
            <span>{band.label} risk</span>
            <strong>{band.range}</strong>
            <p>{band.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RiskPortfolioQuadrants({ companies }) {
  return (
    <div className="risk-quadrant-chart">
      <div className="quadrant-label top-left">High risk / focused base</div>
      <div className="quadrant-label top-right">High risk / broad exposure</div>
      <div className="quadrant-label bottom-left">Stable / focused base</div>
      <div className="quadrant-label bottom-right">Stable / broad exposure</div>
      <div className="quadrant-axis horizontal" />
      <div className="quadrant-axis vertical" />
      {(companies || []).map((company) => (
        <article
          className={`quadrant-company-dot risk-${getRiskTone(company.avgRiskScore)}`}
          key={company.companyId}
          style={{
            left: `${company.x}%`,
            top: `${100 - company.y}%`,
            '--dot-size': `${company.size}px`,
          }}
          title={`${company.name}: ${company.supplierCount} suppliers · risk ${company.avgRiskScore}`}
        >
          <strong>{company.shortName}</strong>
          <span>{company.avgRiskScore}</span>
        </article>
      ))}
    </div>
  );
}

function EarlyWarningRadar({ signals }) {
  return (
    <div className="early-warning-grid">
      {(signals || []).map((signal) => (
        <article className={`early-warning-card tone-${signal.tone}`} key={signal.label}>
          <div>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
          </div>
          <div className="warning-meter">
            <div style={{ width: `${signal.score}%` }} />
          </div>
          <p>{signal.detail}</p>
        </article>
      ))}
    </div>
  );
}

function RiskCategoryPulse({ categories }) {
  const maxScore = Math.max(...(categories || []).map((category) => category.avgScore || 0), 1);

  return (
    <div className="risk-category-pulse">
      {(categories || []).map((category) => (
        <article className={`risk-category-card risk-${getRiskTone(category.avgScore)}`} key={category.category}>
          <div>
            <span>{category.category}</span>
            <strong>{category.avgScore}</strong>
          </div>
          <div className="risk-category-track">
            <div style={{ width: `${((category.avgScore || 0) / maxScore) * 100}%` }} />
          </div>
          <small>{formatNumber(category.assessments)} assessments</small>
        </article>
      ))}
    </div>
  );
}

function MitigationPlaybook({ actions }) {
  return (
    <div className="mitigation-playbook">
      {(actions || []).map((action, index) => (
        <article className={`mitigation-card tone-${action.tone}`} key={action.title}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <div>
            <strong>{action.title}</strong>
            <p>{action.detail}</p>
            <small>{action.owner}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

function IsometricSupplyNetwork({ company, suppliers = [], compact = false }) {
  const featuredNodes = suppliers.slice(0, compact ? 6 : 9);
  const maxTier = suppliers.reduce((highestTier, supplier) => Math.max(highestTier, supplier.tier || 1), 1);
  const highRiskNodes = suppliers.filter((supplier) => (supplier.riskScore || 0) >= 65).length;

  return (
    <div className={compact ? 'isometric-showcase compact' : 'isometric-showcase'} aria-label="3D supplier network visualization">
      <div className="iso-scene">
        <div className="iso-grid-floor" />
        <div className="iso-data-ribbon ribbon-one" />
        <div className="iso-data-ribbon ribbon-two" />
        <div className="iso-floating-metric metric-risk">
          <span>Risk</span>
          <strong>{formatNumber(highRiskNodes)}</strong>
        </div>
        <div className="iso-floating-metric metric-tier">
          <span>Depth</span>
          <strong>T{maxTier}</strong>
        </div>
        <div className="iso-company-tower">
          <div className="project-3d-image supplier-hub-image" aria-hidden="true">
            <div className="hub-building">
              <span className="hub-roof" />
              <span className="hub-face left" />
              <span className="hub-face right" />
              <span className="hub-door" />
            </div>
            <div className="hub-satellite one" />
            <div className="hub-satellite two" />
            <div className="hub-satellite three" />
          </div>
          <strong>{company?.name?.split(' ').map((word) => word[0]).join('').slice(0, 3) || 'SMS'}</strong>
          <small>Buying company</small>
        </div>

        {featuredNodes.map((supplier, index) => {
          const lane = index % 3;
          const depth = Math.floor(index / 3);
          const riskTone = getRiskTone(supplier.riskScore);

          return (
            <div
              className={`iso-supplier-node risk-${riskTone}`}
              key={supplier.id}
              style={{
                '--lane': lane,
                '--depth': depth,
                '--delay': `${index * 120}ms`,
              }}
              title={`${supplier.name} · Tier ${supplier.tier} · Risk ${supplier.riskScore}`}
            >
              <div className="iso-pillar">
                <span className="pillar-top" />
                <span className="pillar-side" />
              </div>
              <strong>T{supplier.tier}</strong>
              <small>{supplier.riskScore}</small>
            </div>
          );
        })}

        <div className="iso-orbit orbit-one" />
        <div className="iso-orbit orbit-two" />
        <div className="iso-cargo-stack stack-one">
          <span />
          <span />
          <span />
        </div>
        <div className="iso-cargo-stack stack-two">
          <span />
          <span />
        </div>
      </div>

      <div className="iso-caption-card">
        <span>3D network showcase</span>
        <strong>{formatNumber(suppliers.length)} mapped nodes</strong>
        <p>
          {formatNumber(highRiskNodes)} high-risk suppliers · deepest tier T{maxTier} · animated traceability view.
        </p>
      </div>
    </div>
  );
}

function DynamicShowcaseStrip({ overview }) {
  const showcaseItems = [
    {
      label: 'Live graph depth',
      value: `T${Math.max(...(overview?.tierDistribution || []).map((item) => item.tier || 1), 1)}`,
      detail: 'Deepest supplier tier visible',
      icon: '◬',
      tone: 'blue',
      progress: Math.min(Math.max(...(overview?.tierDistribution || []).map((item) => item.tier || 1), 1) * 18, 100),
    },
    {
      label: 'Risk pulse',
      value: formatNumber(overview?.networkStats?.highRiskSuppliers),
      detail: 'High-risk nodes flagged',
      icon: '◉',
      tone: 'rose',
      progress: overview?.totalSuppliers
        ? Math.min(((overview?.networkStats?.highRiskSuppliers || 0) / overview.totalSuppliers) * 100, 100)
        : 0,
    },
    {
      label: 'Control signals',
      value: formatNumber((overview?.supplierControlTower || []).length),
      detail: 'Ranked action cards',
      icon: '✦',
      tone: 'violet',
      progress: Math.min(((overview?.supplierControlTower || []).length / 12) * 100, 100),
    },
    {
      label: 'Demo readiness',
      value: formatPercent(overview?.networkHighlights?.demandForecastCoverage),
      detail: 'Forecast coverage live in UI',
      icon: '▰',
      tone: 'teal',
      progress: overview?.networkHighlights?.demandForecastCoverage || 0,
    },
  ];

  return (
    <section className="dynamic-showcase-strip glass-card">
      <div className="dynamic-showcase-copy">
        <p className="eyebrow">Dynamic demo layer</p>
        <h2 className="section-title">Animated supplier story cards</h2>
        <p>
          Use this strip during walkthroughs to show live data, 3D motion, and executive-ready visual cues
          without opening a separate presentation.
        </p>
      </div>

      <div className="dynamic-showcase-cards">
        {showcaseItems.map((item) => (
          <article className={`dynamic-showcase-card tone-${item.tone}`} key={item.label}>
            <div className="dynamic-icon-orb">{item.icon}</div>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </div>
            <div className="dynamic-progress-track" aria-hidden="true">
              <div style={{ width: `${clamp(item.progress, 6, 100)}%` }} />
            </div>
          </article>
        ))}
      </div>

      <div className="dynamic-visual-stage" aria-label="3D supply chain image showcase">
        <div className="stage-ring" />
        <div className="project-3d-image warehouse-image">
          <div className="warehouse-building">
            <span className="warehouse-roof" />
            <span className="warehouse-left" />
            <span className="warehouse-right" />
            <span className="warehouse-door" />
          </div>
          <div className="warehouse-pallet pallet-one" />
          <div className="warehouse-pallet pallet-two" />
        </div>
        <div className="project-3d-image logistics-image">
          <div className="truck-body" />
          <div className="truck-cab" />
          <span className="truck-wheel front" />
          <span className="truck-wheel rear" />
          <span className="truck-package" />
        </div>
        <div className="project-3d-image compliance-image">
          <div className="shield-plate">
            <span className="shield-check" />
          </div>
          <span className="cert-card card-one" />
          <span className="cert-card card-two" />
        </div>
        <div className="project-3d-image analytics-image">
          <span className="analytics-bar bar-one" />
          <span className="analytics-bar bar-two" />
          <span className="analytics-bar bar-three" />
          <span className="analytics-line" />
        </div>
        <div className="stage-route route-one" />
        <div className="stage-route route-two" />
      </div>
    </section>
  );
}

function SupplierTraceabilityPanel({ company, dataRoom, suppliers }) {
  const supplierById = useMemo(
    () => new Map((suppliers || []).map((supplier) => [supplier.id, supplier])),
    [suppliers]
  );

  const deepestSupplier = useMemo(
    () =>
      [...(suppliers || [])].sort(
        (left, right) =>
          (right.tier || 0) - (left.tier || 0) ||
          (right.highestDownstreamRisk || right.riskScore || 0) -
            (left.highestDownstreamRisk || left.riskScore || 0)
      )[0] || null,
    [suppliers]
  );

  const criticalPaths = useMemo(
    () =>
      [...(suppliers || [])]
        .sort(
          (left, right) =>
            (right.highestDownstreamRisk || right.riskScore || 0) -
              (left.highestDownstreamRisk || left.riskScore || 0) ||
            (right.descendantCount || 0) - (left.descendantCount || 0)
        )
        .slice(0, 4),
    [suppliers]
  );

  const lineage = useMemo(() => {
    if (!deepestSupplier) {
      return [];
    }

    const path = [];
    const visited = new Set();
    let currentSupplier = deepestSupplier;

    while (currentSupplier && !visited.has(currentSupplier.id)) {
      path.unshift(currentSupplier);
      visited.add(currentSupplier.id);
      currentSupplier = supplierById.get(currentSupplier.parentSupplierId);
    }

    return path;
  }, [deepestSupplier, supplierById]);

  if (!company || !dataRoom) {
    return null;
  }

  const traceabilitySummary = dataRoom.traceabilitySummary || {};
  const verifiedCoverage = company.supplierCount
    ? Math.round(((traceabilitySummary.verifiedCount || 0) / company.supplierCount) * 100)
    : 0;

  return (
    <section className="traceability-command-panel">
      <div className="traceability-hero-card">
        <p className="eyebrow">Multi-tier traceability</p>
        <h3>Track every supplier, subcontractor, and sub-subcontractor path</h3>
        <p>
          This view is built for your POC use case: start with a buying company, follow each tier-1 supplier,
          and keep tracing downstream until raw-material and hidden dependency risk becomes visible.
        </p>

        <div className="traceability-kpi-grid">
          <article>
            <span>Deepest tier</span>
            <strong>T{traceabilitySummary.maxTier || company.maxTier || 1}</strong>
          </article>
          <article>
            <span>Verified coverage</span>
            <strong>{formatPercent(verifiedCoverage)}</strong>
          </article>
          <article>
            <span>Needs validation</span>
            <strong>{formatNumber(traceabilitySummary.needsValidationCount)}</strong>
          </article>
          <article>
            <span>High-risk downstream</span>
            <strong>{formatNumber(traceabilitySummary.highRiskSubcontractors)}</strong>
          </article>
        </div>
      </div>

      <div className="lineage-path-card">
        <div className="section-heading-row compact-heading">
          <div>
            <p className="eyebrow">Example lineage</p>
            <h3>Deepest visible supplier chain</h3>
          </div>
          <div className="panel-chip">Company → Tier N</div>
        </div>

        <div className="lineage-path">
          <article className="lineage-step company-step">
            <span>Company</span>
            <strong>{company.name}</strong>
          </article>

          {lineage.map((supplier) => (
            <article className={`lineage-step risk-${getRiskTone(supplier.riskScore)}`} key={supplier.id}>
              <span>Tier {supplier.tier} · {formatEnumLabel(supplier.relationshipType)}</span>
              <strong>{supplier.name}</strong>
              <small>{supplier.city}, {supplier.country} · Risk {supplier.riskScore}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="traceability-breakdown-grid">
        <div>
          <h4>Relationship mix</h4>
          <div className="traceability-pill-list">
            {(dataRoom.relationshipBreakdown || []).map((item) => (
              <article key={item.relationshipType}>
                <span>{formatEnumLabel(item.relationshipType)}</span>
                <strong>{formatNumber(item.supplierCount)}</strong>
                <small>Avg risk {item.avgRiskScore}</small>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h4>Criticality and visibility</h4>
          <div className="traceability-pill-list compact">
            {(dataRoom.criticalityBreakdown || []).map((item) => (
              <article key={item.criticality}>
                <span>{formatEnumLabel(item.criticality)}</span>
                <strong>{formatNumber(item.supplierCount)}</strong>
                <small>Risk {item.avgRiskScore}</small>
              </article>
            ))}
            {(dataRoom.visibilityBreakdown || []).map((item) => (
              <article key={item.visibilityStatus}>
                <span>{formatEnumLabel(item.visibilityStatus)}</span>
                <strong>{formatNumber(item.supplierCount)}</strong>
                <small>Visibility status</small>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="critical-path-grid">
        {criticalPaths.map((supplier) => (
          <article className={`critical-path-card risk-${getRiskTone(supplier.highestDownstreamRisk || supplier.riskScore)}`} key={supplier.id}>
            <div>
              <span>Tier {supplier.tier} path · {formatEnumLabel(supplier.visibilityStatus)}</span>
              <strong>{supplier.name}</strong>
            </div>
            <div>
              <span>{formatNumber(supplier.descendantCount)} downstream</span>
              <strong>Peak risk {supplier.highestDownstreamRisk || supplier.riskScore}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HierarchyNode({ node }) {
  const riskTone = getRiskTone(node.riskScore);
  const statusTone = getStatusTone(node.status);

  return (
    <div className="tree-node">
      <article className={`network-node risk-${riskTone}`}>
        <div className="network-node-meta">
          <span className="tier-badge">Tier {node.tier}</span>
          <span className={`status-pill ${statusTone}`}>{node.status}</span>
        </div>
        <div className="network-node-tags">
          <span>{formatEnumLabel(node.relationshipType)}</span>
          <span>{formatEnumLabel(node.criticality)} criticality</span>
          <span>{formatEnumLabel(node.visibilityStatus)}</span>
        </div>
        <h4>{node.name}</h4>
        <p>
          {node.city}, {node.country}
        </p>
        <div className="network-node-stats">
          <span>Risk {node.riskScore}</span>
          <span>Peak downstream {node.highestDownstreamRisk || node.riskScore}</span>
          <span>{node.descendantCount || 0} descendants</span>
          <span>{node.products} products</span>
          <span>{node.shipments} shipments</span>
          <span>{node.openPurchaseOrders || 0} open POs</span>
          <span>{node.inventoryAlerts || 0} stock alerts</span>
          <span>{node.logisticsLanes || 0} lanes</span>
          <span>Perf {node.performanceScore || '—'}</span>
          <span>ESG {node.esgScore || '—'}</span>
        </div>
      </article>

      {node.children?.length > 0 && (
        <div className="tree-children">
          {node.children.map((child) => (
            <HierarchyNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionLoading, setSessionLoading] = useState(Boolean(getStoredToken()));
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [scenarioInputs, setScenarioInputs] = useState({
    disruptionSeverity: 60,
    expeditedFreight: 35,
    safetyStock: 45,
    mitigationCoverage: 55,
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const effectiveUser = useMemo(
    () => (AUTH_BYPASS_ENABLED ? user || BYPASS_USER : user),
    [user]
  );

  const isAuthenticated = useMemo(
    () => AUTH_BYPASS_ENABLED || Boolean(token && effectiveUser),
    [token, effectiveUser]
  );

  const selectedCompany = useMemo(() => {
    if (!overview?.companySummary?.length) {
      return null;
    }

    return (
      overview.companySummary.find((company) => company.companyId === selectedCompanyId) ||
      overview.companySummary[0]
    );
  }, [overview, selectedCompanyId]);

  const selectedCompanySuppliers = useMemo(
    () => (selectedCompany ? flattenSupplierNodes(selectedCompany.rootSuppliers || []) : []),
    [selectedCompany]
  );

  const selectedCompanyDataRoom = useMemo(
    () => selectedCompany?.dataRoom || null,
    [selectedCompany]
  );

  const selectedCompanySupplierPreview = useMemo(
    () => [...selectedCompanySuppliers].sort((left, right) => right.riskScore - left.riskScore).slice(0, 8),
    [selectedCompanySuppliers]
  );

  const maxRiskBar = useMemo(
    () => Math.max(...(overview?.riskDistribution?.map((item) => item.value) || [1])),
    [overview]
  );

  const maxShipmentBar = useMemo(
    () => Math.max(...(overview?.shipmentStatusBreakdown?.map((item) => item.value) || [1])),
    [overview]
  );

  const riskTotal = useMemo(
    () => (overview?.riskDistribution || []).reduce((sum, item) => sum + item.value, 0),
    [overview]
  );

  const shipmentTotal = useMemo(
    () => (overview?.shipmentStatusBreakdown || []).reduce((sum, item) => sum + item.value, 0),
    [overview]
  );

  const certificationTotal = useMemo(
    () => (overview?.certificationStatusBreakdown || []).reduce((sum, item) => sum + item.value, 0),
    [overview]
  );

  const companyRevenueMax = useMemo(
    () => Math.max(...(overview?.companyComparison?.map((company) => company.annualRevenueUsd) || [1])),
    [overview]
  );

  const geographyExposure = useMemo(
    () =>
      (overview?.supplierCountryDistribution || []).map((item) => ({
        ...item,
        exposureShare: overview.totalSuppliers
          ? Math.round((item.supplierCount / overview.totalSuppliers) * 100)
          : 0,
      })),
    [overview]
  );

  const maxGeoSupplierCount = useMemo(
    () => Math.max(...geographyExposure.map((item) => item.supplierCount || 0), 1),
    [geographyExposure]
  );

  const maxControlScore = useMemo(
    () => Math.max(...(overview?.supplierControlTower?.map((supplier) => supplier.controlScore || 0) || [1]), 1),
    [overview]
  );

  const enterpriseReadinessScore = useMemo(() => {
    if (!overview?.networkHighlights) {
      return 0;
    }

    return average([
      overview.networkHighlights.validCertificationRate || 0,
      overview.networkHighlights.purchaseOrderFillRate || 0,
      overview.networkHighlights.demandForecastCoverage || 0,
      overview.networkHighlights.avgLaneReliability || 0,
      overview.networkHighlights.avgSupplierPerformanceScore || 0,
      overview.networkHighlights.avgEsgScore || 0,
    ]);
  }, [overview]);

  const activeTabMeta = useMemo(
    () => DASHBOARD_TABS.find((tab) => tab.id === activeTab) || DASHBOARD_TABS[0],
    [activeTab]
  );

  const activeModuleRecordCount = useMemo(() => {
    if (!overview) {
      return 0;
    }

    const moduleCounts = {
      overview:
        overview.totalCompanies +
        overview.totalSuppliers +
        overview.totalProducts +
        overview.totalShipments +
        overview.totalRiskAssessments,
      network: selectedCompanySuppliers.length,
      operations:
        overview.totalShipments +
        overview.totalComplianceCertifications +
        overview.totalProducts,
      control:
        overview.totalLogisticsLanes +
        overview.totalDemandForecasts +
        overview.totalSupplierScorecards +
        overview.totalSustainabilityMetrics +
        overview.totalPurchaseOrders +
        overview.totalInventoryPositions +
        overview.totalSupplyDisruptions,
      scenario:
        overview.totalSupplyDisruptions +
        overview.totalInventoryPositions +
        overview.totalPurchaseOrders +
        (overview.supplierControlTower || []).length,
      intelligence:
        overview.totalRiskAssessments +
        (overview.supplierCountryDistribution || []).length +
        (overview.companyComparison || []).length,
      capabilities: PLATFORM_CAPABILITIES.length,
    };

    return moduleCounts[activeTab] || 0;
  }, [activeTab, overview, selectedCompanySuppliers.length]);

  const usaExposure = useMemo(
    () => geographyExposure.find((item) => item.country === 'United States') || null,
    [geographyExposure]
  );

  const certificationChartData = useMemo(
    () =>
      (overview?.certificationStatusBreakdown || []).map((item) => ({
        ...item,
        color:
          item.status === 'valid'
            ? '#34d399'
            : item.status === 'expired'
              ? '#f87171'
              : '#f59e0b',
      })),
    [overview]
  );

  const supplierStatusChartData = useMemo(
    () =>
      (overview?.supplierStatusBreakdown || []).map((item) => ({
        ...item,
        color:
          item.status === 'active'
            ? '#34d399'
            : item.status === 'inactive'
              ? '#f87171'
              : '#f59e0b',
      })),
    [overview]
  );

  const shipmentStatusChartData = useMemo(
    () =>
      (overview?.shipmentStatusBreakdown || []).map((item) => ({
        ...item,
        color:
          item.status === 'delivered'
            ? '#34d399'
            : item.status === 'delayed'
              ? '#f87171'
              : item.status === 'in_transit'
                ? '#38bdf8'
                : '#f59e0b',
      })),
    [overview]
  );

  const purchaseOrderStatusChartData = useMemo(
    () =>
      (overview?.purchaseOrderStatusBreakdown || []).map((item) => ({
        ...item,
        color:
          item.status === 'received'
            ? '#34d399'
            : item.status === 'at_risk'
              ? '#f87171'
              : item.status === 'approved'
                ? '#38bdf8'
                : '#f59e0b',
      })),
    [overview]
  );

  const purchaseOrderPriorityChartData = useMemo(
    () =>
      (overview?.purchaseOrderPriorityBreakdown || []).map((item) => ({
        ...item,
        color:
          item.priority === 'critical'
            ? '#f87171'
            : item.priority === 'high'
              ? '#f59e0b'
              : item.priority === 'medium'
                ? '#38bdf8'
                : '#34d399',
      })),
    [overview]
  );

  const inventoryStatusChartData = useMemo(
    () =>
      (overview?.inventoryStatusBreakdown || []).map((item) => ({
        ...item,
        color:
          item.status === 'healthy'
            ? '#34d399'
            : item.status === 'critical'
              ? '#f87171'
              : item.status === 'low_stock'
                ? '#f59e0b'
                : '#38bdf8',
      })),
    [overview]
  );

  const disruptionSeverityChartData = useMemo(
    () =>
      (overview?.disruptionSeverityBreakdown || []).map((item) => ({
        ...item,
        color:
          item.severity === 'critical'
            ? '#f87171'
            : item.severity === 'high'
              ? '#fb923c'
              : item.severity === 'medium'
                ? '#f59e0b'
                : '#34d399',
      })),
    [overview]
  );

  const logisticsCarbonChartData = useMemo(
    () =>
      (overview?.logisticsModeBreakdown || []).map((item) => ({
        ...item,
        label: item.mode,
        helper: `Avg reliability ${formatPercent(item.avgReliability)} · ${formatNumber(item.value)} lanes`,
      })),
    [overview]
  );

  const supplierPerformanceScatterData = useMemo(
    () =>
      (overview?.supplierPerformanceLeaders || []).map((scorecard) => ({
        ...scorecard,
        name: scorecard.supplierName,
        size: Math.max(1, scorecard.qualityPpm || 1),
      })),
    [overview]
  );

  const sustainabilityScatterData = useMemo(
    () =>
      (overview?.sustainabilityLeaderboard || []).map((metric) => ({
        ...metric,
        name: metric.supplierName,
        size: Math.max(1, metric.carbonIntensityKgPerUnit || 1),
      })),
    [overview]
  );

  const companyPortfolioScatterData = useMemo(() => {
    const companies = overview?.companyComparison || [];
    const maxRevenue = Math.max(...companies.map((company) => company.annualRevenueUsd || 0), 1);

    return companies.map((company) => ({
      ...company,
      name: company.name,
      revenueWeight: Math.max(1, (company.annualRevenueUsd || 0) / maxRevenue),
    }));
  }, [overview]);

  const analystInsights = useMemo(() => {
    if (!overview?.networkHighlights) {
      return [];
    }

    const highestRisk = overview.networkHighlights.highestRiskSupplier;
    const complexCompany = overview.networkHighlights.mostComplexCompany;

    return [
      {
        title: 'Primary risk hotspot',
        tone: 'critical',
        summary: highestRisk
          ? `${highestRisk.name} in ${highestRisk.country} has the highest measured risk at ${highestRisk.riskScore}.`
          : 'No high-risk hotspot detected.',
        detail: highestRisk
          ? `${highestRisk.companyName} should prioritize tier-${highestRisk.tier} mitigation and continuity planning.`
          : 'Continue monitoring the network for emerging high-risk suppliers.',
      },
      {
        title: 'Network complexity',
        tone: 'watch',
        summary: complexCompany
          ? `${complexCompany.name} has the deepest subcontractor footprint with ${complexCompany.subcontractorCount} downstream nodes.`
          : 'Complexity data is not available yet.',
        detail: complexCompany
          ? `Its blended supplier risk averages ${complexCompany.avgRiskScore}, which makes it a good candidate for enhanced traceability workflows.`
          : 'Add more supplier hierarchy data to unlock network-complexity insights.',
      },
      {
        title: 'Fulfillment resilience',
        tone: overview.networkHighlights.delayedShipmentRate > 20 ? 'critical' : 'good',
        summary: `${formatPercent(overview.networkHighlights.onTimeShipmentRate)} of shipments are moving on-time or already delivered.`,
        detail: `${overview.networkHighlights.delayedShipmentCount} delayed shipments are currently pressuring flow, while certification validity remains at ${formatPercent(overview.networkHighlights.validCertificationRate)}.`,
      },
      {
        title: 'Planning coverage',
        tone: overview.networkHighlights.demandForecastCoverage < 90 ? 'watch' : 'good',
        summary: `${formatPercent(overview.networkHighlights.demandForecastCoverage)} demand coverage across forecasted products.`,
        detail: `Average lane reliability is ${formatPercent(overview.networkHighlights.avgLaneReliability)}, supplier performance averages ${overview.networkHighlights.avgSupplierPerformanceScore}, and ESG averages ${overview.networkHighlights.avgEsgScore}.`,
      },
    ];
  }, [overview]);

  const criticalSupplierWatchlist = useMemo(
    () =>
      [...(overview?.supplierControlTower || overview?.topSuppliers || [])]
        .map((supplier) => ({
          ...supplier,
          riskScore: supplier.riskScore || 0,
          controlScore: supplier.controlScore || supplier.riskScore || 0,
        }))
        .sort((left, right) =>
          right.riskScore + (right.controlScore || 0) * 0.25 -
          (left.riskScore + (left.controlScore || 0) * 0.25)
        )
        .slice(0, 8),
    [overview]
  );

  const riskCommandMetrics = useMemo(() => {
    const averageRisk = overview?.networkHighlights?.averageNetworkRisk || 0;

    return {
      averageRisk,
      riskShield: clamp(100 - averageRisk, 0, 100),
      highRiskSuppliers: overview?.networkStats?.highRiskSuppliers || 0,
      valueAtRisk: overview?.networkHighlights?.purchaseOrderValueAtRisk || 0,
      activeDisruptions: overview?.networkHighlights?.activeDisruptionCount || 0,
      inventoryAlerts: overview?.networkHighlights?.inventoryAlertCount || 0,
    };
  }, [overview]);

  const topExposureCountry = useMemo(
    () =>
      [...geographyExposure].sort(
        (left, right) =>
          right.supplierCount * (right.avgRiskScore || 0) -
          left.supplierCount * (left.avgRiskScore || 0)
      )[0] || null,
    [geographyExposure]
  );

  const riskQuadrantCompanies = useMemo(() => {
    const companies = overview?.companyComparison || [];
    const maxSuppliers = Math.max(...companies.map((company) => company.supplierCount || 0), 1);
    const maxRevenue = Math.max(...companies.map((company) => company.annualRevenueUsd || 0), 1);

    return companies.map((company) => ({
      ...company,
      shortName: company.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 3),
      x: clamp(12 + ((company.supplierCount || 0) / maxSuppliers) * 76, 8, 92),
      y: clamp(12 + ((company.avgRiskScore || 0) / 100) * 76, 8, 92),
      size: clamp(54 + ((company.annualRevenueUsd || 0) / maxRevenue) * 42, 52, 98),
    }));
  }, [overview]);

  const earlyWarningSignals = useMemo(() => {
    if (!overview?.networkHighlights) {
      return [];
    }

    const delayedRate = overview.networkHighlights.delayedShipmentRate || 0;
    const complianceGap = 100 - (overview.networkHighlights.validCertificationRate || 0);
    const laneGap = 100 - (overview.networkHighlights.avgLaneReliability || 0);
    const demandGap = 100 - (overview.networkHighlights.demandForecastCoverage || 0);
    const disruptionPressure = Math.min((overview.networkHighlights.activeDisruptionCount || 0) * 18, 100);
    const stockPressure = Math.min((overview.networkHighlights.inventoryAlertCount || 0) * 10, 100);

    return [
      {
        label: 'Shipment delay pressure',
        value: formatPercent(delayedRate),
        score: clamp(delayedRate, 0, 100),
        tone: delayedRate > 20 ? 'critical' : delayedRate > 8 ? 'watch' : 'good',
        detail: `${formatNumber(overview.networkHighlights.delayedShipmentCount)} delayed shipments can impact customer commitments.`,
      },
      {
        label: 'Compliance gap',
        value: formatPercent(complianceGap),
        score: clamp(complianceGap, 0, 100),
        tone: complianceGap > 25 ? 'critical' : complianceGap > 10 ? 'watch' : 'good',
        detail: 'Expired or expiring certification exposure that can block procurement eligibility.',
      },
      {
        label: 'Lane reliability gap',
        value: formatPercent(laneGap),
        score: clamp(laneGap, 0, 100),
        tone: laneGap > 25 ? 'critical' : laneGap > 12 ? 'watch' : 'good',
        detail: 'Weak freight lanes should be reviewed for alternate carriers or premium recovery options.',
      },
      {
        label: 'Demand coverage gap',
        value: formatPercent(demandGap),
        score: clamp(demandGap, 0, 100),
        tone: demandGap > 20 ? 'critical' : demandGap > 8 ? 'watch' : 'good',
        detail: 'Forecasted demand without matching committed supply increases shortage probability.',
      },
      {
        label: 'Disruption pressure',
        value: formatNumber(overview.networkHighlights.activeDisruptionCount),
        score: disruptionPressure,
        tone: disruptionPressure > 50 ? 'critical' : disruptionPressure > 20 ? 'watch' : 'good',
        detail: 'Open disruption events that require continuity owners and resolution tracking.',
      },
      {
        label: 'Inventory pressure',
        value: formatNumber(overview.networkHighlights.inventoryAlertCount),
        score: stockPressure,
        tone: stockPressure > 50 ? 'critical' : stockPressure > 20 ? 'watch' : 'good',
        detail: 'Stock alerts outside healthy thresholds that can become order fulfillment risk.',
      },
    ];
  }, [overview]);

  const mitigationPlaybookActions = useMemo(() => {
    const highRiskSuppliers = riskCommandMetrics.highRiskSuppliers;
    const topSupplier = criticalSupplierWatchlist[0];

    return [
      {
        title: 'Assign risk owners to critical suppliers',
        detail: topSupplier
          ? `Start with ${topSupplier.name}, currently scoring ${topSupplier.riskScore}, and require a named mitigation owner.`
          : 'No critical supplier is currently available in the watchlist.',
        owner: 'Owner: Supplier Risk Lead',
        tone: topSupplier?.riskScore >= 65 ? 'critical' : 'watch',
      },
      {
        title: 'Protect commercial exposure',
        detail: `Prioritize purchase orders contributing to ${formatCurrency(riskCommandMetrics.valueAtRisk)} of value at risk.`,
        owner: 'Owner: Procurement + Finance',
        tone: riskCommandMetrics.valueAtRisk > 0 ? 'critical' : 'good',
      },
      {
        title: 'Activate continuity coverage',
        detail: `Create backup plans for ${formatNumber(highRiskSuppliers)} high-risk suppliers and validate alternate lanes weekly.`,
        owner: 'Owner: Supply Continuity Team',
        tone: highRiskSuppliers > 0 ? 'watch' : 'good',
      },
      {
        title: 'Close operating weak signals',
        detail: `${formatNumber(riskCommandMetrics.inventoryAlerts)} inventory alerts and ${formatNumber(riskCommandMetrics.activeDisruptions)} disruptions should be reviewed in the next control-tower standup.`,
        owner: 'Owner: Operations Command Center',
        tone: riskCommandMetrics.inventoryAlerts + riskCommandMetrics.activeDisruptions > 0 ? 'watch' : 'good',
      },
    ];
  }, [criticalSupplierWatchlist, riskCommandMetrics]);

  const scenarioModel = useMemo(() => {
    if (!overview?.networkHighlights) {
      return null;
    }

    const baselineRisk = overview.networkHighlights.averageNetworkRisk || 0;
    const valueAtRisk = overview.networkHighlights.purchaseOrderValueAtRisk || 0;
    const trackedRevenue = overview.networkHighlights.totalTrackedRevenueUsd || 0;
    const highRiskSuppliers = overview.networkStats?.highRiskSuppliers || 0;
    const activeDisruptions = overview.networkHighlights.activeDisruptionCount || 0;
    const inventoryAlerts = overview.networkHighlights.inventoryAlertCount || 0;

    const severityImpact = scenarioInputs.disruptionSeverity * 0.28;
    const mitigationRelief =
      scenarioInputs.mitigationCoverage * 0.22 +
      scenarioInputs.safetyStock * 0.12 +
      scenarioInputs.expeditedFreight * 0.08;
    const projectedRisk = clamp(Math.round(baselineRisk + severityImpact - mitigationRelief), 0, 100);
    const projectedReadiness = clamp(
      Math.round(
        enterpriseReadinessScore +
          scenarioInputs.mitigationCoverage * 0.18 +
          scenarioInputs.safetyStock * 0.12 +
          scenarioInputs.expeditedFreight * 0.1 -
          scenarioInputs.disruptionSeverity * 0.1
      ),
      0,
      100
    );
    const estimatedCost = Math.round(
      valueAtRisk * (scenarioInputs.expeditedFreight / 100) * 0.08 +
        (overview.totalProducts || 0) * (scenarioInputs.safetyStock / 100) * 42000 +
        highRiskSuppliers * (scenarioInputs.mitigationCoverage / 100) * 18000
    );
    const recoveryDays = clamp(
      Math.round(
        28 +
          scenarioInputs.disruptionSeverity * 0.22 -
          scenarioInputs.mitigationCoverage * 0.12 -
          scenarioInputs.expeditedFreight * 0.1 -
          scenarioInputs.safetyStock * 0.06
      ),
      3,
      60
    );
    const residualValueAtRisk = Math.round(valueAtRisk * (projectedRisk / 100));
    const protectedRevenue = Math.round(trackedRevenue * (projectedReadiness / 100) * 0.08);
    const suppliersToMitigate = Math.ceil(highRiskSuppliers * (scenarioInputs.mitigationCoverage / 100));
    const expeditedLaneCount = Math.ceil((overview.totalLogisticsLanes || 0) * (scenarioInputs.expeditedFreight / 100));

    const actionPlan = [
      {
        title: 'Stabilize critical suppliers',
        detail: `Launch mitigation playbooks for ${formatNumber(suppliersToMitigate)} high-risk suppliers and active disruption owners.`,
        tone: projectedRisk >= 65 ? 'critical' : 'watch',
      },
      {
        title: 'Protect constrained inventory',
        detail: `Raise buffers around ${formatNumber(inventoryAlerts)} alerting stock positions using the selected safety-stock posture.`,
        tone: inventoryAlerts > 0 ? 'watch' : 'good',
      },
      {
        title: 'Expedite vulnerable lanes',
        detail: `Reserve premium freight on ${formatNumber(expeditedLaneCount)} priority lanes while recovery actions are active.`,
        tone: scenarioInputs.expeditedFreight > 50 ? 'good' : 'watch',
      },
      {
        title: 'Executive escalation',
        detail: `${formatNumber(activeDisruptions)} active disruptions remain in scope; review residual exposure every 24 hours.`,
        tone: activeDisruptions > 2 ? 'critical' : 'good',
      },
    ];

    const timeline = [
      { label: '0-24h', value: 'Triage', detail: 'Freeze priorities and validate constrained products.' },
      { label: '2-5d', value: 'Shift', detail: 'Move volume to expedited lanes and covered alternates.' },
      { label: '1-2w', value: 'Recover', detail: 'Rebuild safety stock and lower residual risk score.' },
      { label: `${recoveryDays}d`, value: 'Normalize', detail: 'Return to planned flow and close mitigation tasks.' },
    ];

    return {
      baselineRisk,
      projectedRisk,
      projectedReadiness,
      estimatedCost,
      recoveryDays,
      residualValueAtRisk,
      protectedRevenue,
      actionPlan,
      timeline,
    };
  }, [enterpriseReadinessScore, overview, scenarioInputs]);

  const clearSession = (message = '') => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setUser(null);
    setOverview(null);
    setSelectedCompanyId(null);
    setError('');
    setAuthError(message);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleScenarioInputChange = (event) => {
    const { name, value } = event.target;
    setScenarioInputs((currentInputs) => ({
      ...currentInputs,
      [name]: Number(value),
    }));
  };

  const persistSession = (nextToken, nextUser, successMessage = '') => {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
    setAuthError('');
    setAuthSuccess(successMessage);
    setFormData({ name: '', email: '', password: '' });
  };

  const handleLogout = () => {
    clearSession();
    setAuthSuccess('You have been logged out.');
    setAuthMode('login');
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload =
      authMode === 'register'
        ? formData
        : {
            email: formData.email,
            password: formData.password,
          };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      persistSession(
        data.token,
        data.user,
        authMode === 'register' ? 'Account created successfully.' : 'Logged in successfully.'
      );
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (AUTH_BYPASS_ENABLED) {
        setUser((currentUser) => currentUser || BYPASS_USER);
        setSessionLoading(false);
        return;
      }

      if (!token) {
        setSessionLoading(false);
        return;
      }

      setSessionLoading(true);

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Session validation failed.');
        }

        setUser(data.user);
      } catch (err) {
        clearSession('Your session expired. Please log in again.');
      } finally {
        setSessionLoading(false);
      }
    };

    restoreSession();
  }, [token]);

  useEffect(() => {
    const fetchOverview = async () => {
      if (!isAuthenticated || !effectiveUser) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const headers = {};

        if (token && !AUTH_BYPASS_ENABLED) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch('/api/analytics/overview', {
          headers,
        });

        const data = await response.json();

        if (response.status === 401) {
          clearSession('Your session expired. Please log in again.');
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch analytics overview.');
        }

        setOverview(data);
        setSelectedCompanyId((current) => current || data.companySpotlight?.companyId || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [token, effectiveUser, isAuthenticated]);

  if (sessionLoading) {
    return (
      <div className="app-shell auth-shell">
        <div className="auth-card auth-feedback-card glass-card">
          <p className="eyebrow">Loading Session</p>
          <h1>Checking your login…</h1>
          <p>Please wait while I restore your authenticated workspace.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-shell auth-shell">
        <div className="background-orb orb-one" />
        <div className="background-orb orb-two" />

        <section className="auth-layout">
          <div className="auth-copy">
            <p className="eyebrow">Supply Chain Intelligence</p>
            <h1>Supplier Management System</h1>
            <p>
              Sign in to unlock a protected command center for supplier analytics,
              multi-tier visibility, compliance, and operational risk monitoring.
            </p>

            <div className="hero-highlight glass-card">
              <div>
                <span className="mini-label">What’s inside</span>
                <strong>Company → supplier → subcontractor mapping</strong>
              </div>
              <p>
                Explore a realistic supply-chain hierarchy with parent companies,
                suppliers, subcontractors, products, risk signals, and shipment flow.
              </p>
            </div>
          </div>

          <div className="auth-card glass-card">
            <div className="auth-toggle">
              <button
                className={authMode === 'login' ? 'toggle-button active' : 'toggle-button'}
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                type="button"
              >
                Login
              </button>
              <button
                className={authMode === 'register' ? 'toggle-button active' : 'toggle-button'}
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                type="button"
              >
                Register
              </button>
            </div>

            <h2>{authMode === 'register' ? 'Create your account' : 'Welcome back'}</h2>
            <p className="auth-subtitle">
              {authMode === 'register'
                ? 'Create an account to explore the protected supplier dashboard.'
                : 'Use your account to enter the live supply chain analytics dashboard.'}
            </p>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <label>
                  Full name
                  <input
                    name="name"
                    onChange={handleInputChange}
                    placeholder="Jane Supplier"
                    required
                    type="text"
                    value={formData.name}
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  name="email"
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={formData.email}
                />
              </label>

              <label>
                Password
                <input
                  minLength="6"
                  name="password"
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                  required
                  type="password"
                  value={formData.password}
                />
              </label>

              {authError && <p className="status-message error-message">{authError}</p>}
              {authSuccess && <p className="status-message success-message">{authSuccess}</p>}

              <button className="primary-button" disabled={authLoading} type="submit">
                {authLoading
                  ? authMode === 'register'
                    ? 'Creating account...'
                    : 'Signing in...'
                  : authMode === 'register'
                    ? 'Create account'
                    : 'Sign in'}
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell dashboard-shell">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />

      <header className="topbar glass-card">
        <div>
          <p className="eyebrow">Authenticated session</p>
          <h2 className="topbar-title">Welcome back, {effectiveUser.name}</h2>
          <p className="topbar-subtitle">
            {AUTH_BYPASS_ENABLED ? 'Temporary auth bypass is enabled.' : `Signed in as ${effectiveUser.email}`}
          </p>
        </div>

        <button className="secondary-button" onClick={handleLogout} type="button">
          Log out
        </button>
      </header>

      <section className="hero-panel glass-card">
        <div>
          <p className="eyebrow">Executive Supply View</p>
          <h1>Supplier Network Command Center</h1>
          <p>
            Explore supplier relationships, spot high-risk subcontractors, and track the
            operational health of your multi-tier supply ecosystem.
          </p>
        </div>

        <div className="hero-showcase-stack">
          <IsometricSupplyNetwork
            compact
            company={selectedCompany || overview?.companySpotlight}
            suppliers={selectedCompanySuppliers.length ? selectedCompanySuppliers : flattenSupplierNodes(overview?.companySpotlight?.rootSuppliers || [])}
          />

          <div className="hero-status-grid">
            <div className="hero-status-card">
              <span>Live companies</span>
              <strong>{formatNumber(overview?.totalCompanies)}</strong>
            </div>
            <div className="hero-status-card">
              <span>Multi-tier suppliers</span>
              <strong>{formatNumber(overview?.networkStats?.multiTierSuppliers)}</strong>
            </div>
            <div className="hero-status-card">
              <span>Subcontractors tracked</span>
              <strong>{formatNumber(overview?.networkStats?.totalSubcontractors)}</strong>
            </div>
            <div className="hero-status-card">
              <span>Demand coverage</span>
              <strong>{formatPercent(overview?.networkHighlights?.demandForecastCoverage)}</strong>
            </div>
          </div>
        </div>
      </section>

      {authSuccess && <p className="status-message success-message dashboard-message">{authSuccess}</p>}
      {loading && <p className="dashboard-message">Loading analytics overview...</p>}
      {error && <p className="status-message error-message dashboard-message">{error}</p>}

      {overview && (
        <>
          <div className="supply-banner glass-card">
            <strong>Supply-chain view active.</strong>
            <span>
              The dashboard is using the available supplier, subcontractor, product,
              shipment, risk, certification, logistics lane, demand forecast, scorecard,
              and sustainability records to generate these insights.
            </span>
          </div>

          <nav className="dashboard-tabs glass-card" aria-label="Supplier dashboard sections">
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'dashboard-tab active' : 'dashboard-tab'}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <span>{tab.kicker}</span>
                <strong>{tab.label}</strong>
              </button>
            ))}
          </nav>

          <DynamicShowcaseStrip overview={overview} />

          {activeTab === 'overview' && (
            <>
          <section className="metric-grid">
            {[
              { label: 'Total Companies', value: formatNumber(overview.totalCompanies), accent: 'blue' },
              { label: 'Total Suppliers', value: formatNumber(overview.totalSuppliers), accent: 'violet' },
              { label: 'Products', value: formatNumber(overview.totalProducts), accent: 'teal' },
              { label: 'Shipments', value: formatNumber(overview.totalShipments), accent: 'amber' },
              { label: 'Logistics Lanes', value: formatNumber(overview.totalLogisticsLanes), accent: 'cyan' },
              { label: 'Demand Forecasts', value: formatNumber(overview.totalDemandForecasts), accent: 'indigo' },
              {
                label: 'Risk Assessments',
                value: formatNumber(overview.totalRiskAssessments),
                accent: 'rose',
              },
              {
                label: 'Valid Certifications',
                value: formatNumber(overview.validCertifications),
                accent: 'green',
              },
            ].map((item) => (
              <article className={`metric-card accent-${item.accent}`} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </section>

          <section className="enterprise-command-panel glass-card">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Enterprise POC layer</p>
                <h2 className="section-title">Board-ready supply resilience cockpit</h2>
              </div>
              <div className="panel-chip">Executive scorecards</div>
            </div>

            <div className="enterprise-score-grid">
              <GaugeChart
                caption="Blended readiness across certifications, PO fill rate, demand coverage, lane reliability, supplier performance and ESG maturity."
                color="#0ea5e9"
                label="Readiness"
                value={enterpriseReadinessScore}
              />
              <GaugeChart
                caption="Percentage of suppliers outside the high-risk zone, highlighting network resilience at a glance."
                color="#14b8a6"
                label="Risk shield"
                value={100 - (overview.networkHighlights.averageNetworkRisk || 0)}
              />
              <GaugeChart
                caption="Operational shipment flow based on delivered and in-transit movement across the network."
                color="#8b5cf6"
                label="Flow health"
                value={overview.networkHighlights.onTimeShipmentRate}
              />
              <GaugeChart
                caption="Demand signal coverage comparing committed supply against forecasted demand."
                color="#f59e0b"
                label="Supply cover"
                value={overview.networkHighlights.demandForecastCoverage}
              />
            </div>
          </section>

          <section className="flow-strip glass-card">
            <div className="flow-heading">
              <p className="eyebrow">Statistics flow</p>
              <h2 className="section-title">From network visibility to action</h2>
              <p>Follow the operational story from supplier coverage, to risk signals, to shipment movement, to compliance readiness.</p>
            </div>

            <div className="flow-steps">
              <article className="flow-step">
                <span>01</span>
                <strong>{formatNumber(overview.totalSuppliers)} suppliers mapped</strong>
                <p>{formatNumber(overview.networkStats.totalSubcontractors)} subcontractors extend the tracked supply chain.</p>
              </article>
              <article className="flow-step">
                <span>02</span>
                <strong>{formatNumber(overview.networkStats.highRiskSuppliers)} high-risk nodes</strong>
                <p>Risk scoring highlights where mitigation and continuity plans should start first.</p>
              </article>
              <article className="flow-step">
                <span>03</span>
                <strong>{formatPercent(overview.networkHighlights.onTimeShipmentRate)} shipment flow</strong>
                <p>{formatNumber(overview.deliveredShipments)} delivered shipments anchor the operational health view.</p>
              </article>
              <article className="flow-step">
                <span>04</span>
                <strong>{formatPercent(overview.networkHighlights.demandForecastCoverage)} demand covered</strong>
                <p>{formatNumber(overview.totalLogisticsLanes)} logistics lanes and {formatNumber(overview.totalSupplierScorecards)} scorecards complete the control-tower view.</p>
              </article>
            </div>
          </section>

          <section className="panel glass-card enterprise-portfolio-panel">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Portfolio intelligence</p>
                <h2 className="section-title">Company supplier footprint vs subcontractor depth</h2>
              </div>
              <div className="panel-chip">Dual metric chart</div>
            </div>
            <DualMetricBarChart
              data={(overview.companyComparison || []).slice(0, 8)}
              labelKey="name"
              primaryKey="supplierCount"
              primaryLabel="Suppliers"
              secondaryKey="subcontractorCount"
              secondaryLabel="Subcontractors"
            />
          </section>

          <section className="insight-chart-grid">
            <div className="panel glass-card chart-span-2">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Portfolio scatter</p>
                  <h2 className="section-title">Supplier scale vs average risk</h2>
                </div>
                <div className="panel-chip">Bubble chart</div>
              </div>
              <ScatterPlotChart
                data={companyPortfolioScatterData}
                labelKey="name"
                sizeKey="revenueWeight"
                toneKey="avgRiskScore"
                xKey="supplierCount"
                xLabel="Supplier count"
                yKey="avgRiskScore"
                yLabel="Average risk"
              />
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Shipment health</p>
                  <h2 className="section-title">Movement status distribution</h2>
                </div>
                <div className="panel-chip">Donut chart</div>
              </div>
              <DonutChart
                itemSuffix="shipments"
                items={shipmentStatusChartData}
                total={shipmentTotal}
                centerLabel="Shipments"
                centerValue={formatNumber(shipmentTotal)}
              />
            </div>
          </section>
            </>
          )}

          {activeTab === 'operations' && (
            <>
          <section className="dashboard-grid-visuals">
            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Portfolio composition</p>
                  <h2 className="section-title">Risk posture snapshot</h2>
                </div>
                <div className="panel-chip">Donut chart</div>
              </div>

              <DonutChart
                items={overview.riskDistribution}
                total={riskTotal}
                centerLabel="Suppliers"
                centerValue={formatNumber(riskTotal)}
              />
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Depth analysis</p>
                  <h2 className="section-title">Tier concentration curve</h2>
                </div>
                <div className="panel-chip">Line / area chart</div>
              </div>

              <LineTrendChart
                color="#8b5cf6"
                data={(overview.tierDistribution || []).map((item) => ({
                  label: `Tier ${item.tier}`,
                  value: item.value,
                }))}
                labelKey="label"
                valueKey="value"
              />
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Certification pulse</p>
                  <h2 className="section-title">Compliance health mix</h2>
                </div>
                <div className="panel-chip">Segmented status</div>
              </div>

              <div className="status-segment-chart">
                {certificationChartData.map((item) => (
                  <div
                    key={item.status}
                    className="status-segment"
                    style={{
                      width: `${certificationTotal ? (item.value / certificationTotal) * 100 : 0}%`,
                      background: item.color,
                    }}
                  />
                ))}
              </div>

              <div className="status-segment-legend">
                {certificationChartData.map((item) => (
                  <div className="status-segment-item" key={item.status}>
                    <span className="legend-dot" style={{ background: item.color }} />
                    <div>
                      <strong>{item.status.replace('_', ' ')}</strong>
                      <span>
                        {formatNumber(item.value)} · {formatPercent(certificationTotal ? (item.value / certificationTotal) * 100 : 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="dashboard-grid-visuals supply-chart-grid">
            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Shipment movement</p>
                  <h2 className="section-title">Quantity moved by ship date</h2>
                </div>
                <div className="panel-chip">Flow trend</div>
              </div>

              <LineTrendChart
                color="#2dd4bf"
                data={overview.shipmentVolumeByDate || []}
                labelKey="label"
                valueKey="quantity"
              />
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Supplier readiness</p>
                  <h2 className="section-title">Supplier status columns</h2>
                </div>
                <div className="panel-chip">Bar chart</div>
              </div>

              <VerticalBarChart
                color="#38bdf8"
                data={supplierStatusChartData}
                labelKey="status"
                valueKey="value"
              />
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Supplier tier risk</p>
                  <h2 className="section-title">Risk intensity by supplier tier</h2>
                </div>
                <div className="panel-chip">Tier matrix</div>
              </div>

              <RiskTierMatrix tiers={overview.riskByTier || []} />
            </div>
          </section>

          <section className="dashboard-grid-secondary supply-chart-grid-wide">
            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Destination exposure</p>
                  <h2 className="section-title">Shipment quantity by destination</h2>
                </div>
                <div className="panel-chip">Horizontal bars</div>
              </div>

              <div className="bar-chart-list compact">
                {(overview.destinationCountryBreakdown || []).map((item) => {
                  const maxQuantity = Math.max(
                    ...(overview.destinationCountryBreakdown || []).map((country) => country.quantity || 0),
                    1
                  );

                  return (
                    <div className="bar-row" key={item.country}>
                      <div className="bar-label-group">
                        <span>{item.country}</span>
                        <strong>{formatNumber(item.quantity)} units</strong>
                      </div>
                      <div className="bar-track dark">
                        <div
                          className="bar-fill destination"
                          style={{ width: `${(item.quantity / maxQuantity) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Supplier product mix</p>
                  <h2 className="section-title">Product mix and lead times</h2>
                </div>
                <div className="panel-chip">Category view</div>
              </div>

              <div className="product-category-list">
                {(overview.productCategoryBreakdown || []).map((item) => (
                  <article className="product-category-card" key={item.category}>
                    <div>
                      <strong>{item.category}</strong>
                      <span>{formatNumber(item.products)} products</span>
                    </div>
                    <div>
                      <strong>{item.avgLeadTimeDays} days</strong>
                      <span>Avg lead time</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="operational-chart-grid">
            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Shipment exceptions</p>
                  <h2 className="section-title">Shipment status by count</h2>
                </div>
                <div className="panel-chip">Horizontal bars</div>
              </div>
              <HorizontalBarChart
                data={shipmentStatusChartData}
                labelKey="status"
                valueKey="value"
                valueFormatter={formatNumber}
              />
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Compliance readiness</p>
                  <h2 className="section-title">Certification status by count</h2>
                </div>
                <div className="panel-chip">Horizontal bars</div>
              </div>
              <HorizontalBarChart
                data={certificationChartData}
                labelKey="status"
                valueKey="value"
                valueFormatter={formatNumber}
              />
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Category economics</p>
                  <h2 className="section-title">Product category cost exposure</h2>
                </div>
                <div className="panel-chip">Cost bars</div>
              </div>
              <HorizontalBarChart
                color="#8b5cf6"
                data={overview.productCategoryBreakdown || []}
                labelKey="category"
                valueKey="totalUnitCostUsd"
                valueFormatter={formatCurrency}
              />
            </div>
          </section>
            </>
          )}

          {activeTab === 'network' && (
            <>
          <CompanyPortfolioNetworkGraph
            companies={overview.companySummary || []}
            onSelectCompany={setSelectedCompanyId}
            selectedCompanyId={selectedCompany?.companyId}
          />

          <section className="dashboard-grid-primary">
            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Company Switcher</p>
                  <h2 className="section-title">Supplier network by company</h2>
                </div>
                <div className="panel-chip">Interactive hierarchy</div>
              </div>

              <div className="company-selector-card">
                <label htmlFor="company-selector">
                  <span>Choose company</span>
                  <strong>{selectedCompany?.name || 'Select a company'}</strong>
                </label>
                <select
                  id="company-selector"
                  onChange={(event) => setSelectedCompanyId(Number(event.target.value))}
                  value={selectedCompany?.companyId || ''}
                >
                  {(overview.companySummary || []).map((company) => (
                    <option key={company.companyId} value={company.companyId}>
                      {company.name} · {company.supplierCount} suppliers · Risk {company.avgRiskScore}
                    </option>
                  ))}
                </select>
              </div>

              <div className="company-tabs">
                {overview.companySummary.map((company) => (
                  <button
                    key={company.companyId}
                    className={
                      company.companyId === selectedCompany?.companyId
                        ? 'company-tab active'
                        : 'company-tab'
                    }
                    onClick={() => setSelectedCompanyId(company.companyId)}
                    type="button"
                  >
                    <strong>{company.name}</strong>
                    <span>{company.supplierCount} suppliers</span>
                  </button>
                ))}
              </div>

              {selectedCompany && (
                <>
                  <div className="spotlight-strip">
                    <div>
                      <span className="mini-label">Headquarters</span>
                      <strong>{selectedCompany.headquartersCountry}</strong>
                    </div>
                    <div>
                      <span className="mini-label">Supplier footprint</span>
                      <strong>{selectedCompany.supplierCount}</strong>
                    </div>
                    <div>
                      <span className="mini-label">Subcontractors</span>
                      <strong>{selectedCompany.subcontractorCount}</strong>
                    </div>
                    <div>
                      <span className="mini-label">Average risk</span>
                      <strong>{selectedCompany.avgRiskScore}</strong>
                    </div>
                    <div>
                      <span className="mini-label">Deepest tier</span>
                      <strong>T{selectedCompany.maxTier || 1}</strong>
                    </div>
                    <div>
                      <span className="mini-label">Verified coverage</span>
                      <strong>{formatPercent(selectedCompany.verifiedCoverage)}</strong>
                    </div>
                  </div>

                  <CompanySupplyChainGraph
                    company={selectedCompany}
                    dataRoom={selectedCompanyDataRoom}
                    suppliers={selectedCompanySuppliers}
                  />

                  {selectedCompanyDataRoom && (
                    <section className="company-data-room">
                      <div className="company-data-room-hero">
                        <div>
                          <p className="eyebrow">Company data room</p>
                          <h3>{selectedCompany.name} supplier intelligence showcase</h3>
                          <p>
                            A clean view of what this company contributes to the platform: direct suppliers,
                            downstream subcontractors, products supplied, shipments, purchase orders,
                            certifications, risk signals, and logistics lanes.
                          </p>
                        </div>
                        <div className="company-data-room-score">
                          <span>Data coverage</span>
                          <strong>{formatNumber(selectedCompanyDataRoom.providedDataTypes.length)}</strong>
                          <small>tracked data domains</small>
                        </div>
                      </div>

                      <div className="company-data-type-grid">
                        {selectedCompanyDataRoom.providedDataTypes.map((item) => (
                          <article className="company-data-type-card" key={item.label}>
                            <span>{item.label}</span>
                            <strong>{formatNumber(item.value)}</strong>
                            <p>{item.detail}</p>
                          </article>
                        ))}
                      </div>

                      <div className="company-data-summary-grid">
                        <article>
                          <span>Shipment footprint</span>
                          <strong>{formatNumber(selectedCompanyDataRoom.shipmentSummary.totalQuantity)} units</strong>
                          <p>
                            {formatNumber(selectedCompanyDataRoom.shipmentSummary.totalShipments)} shipments across{' '}
                            {selectedCompanyDataRoom.shipmentSummary.destinationCountries.join(', ') || 'tracked destinations'}.
                          </p>
                        </article>
                        <article>
                          <span>Purchase order posture</span>
                          <strong>{formatCurrency(selectedCompanyDataRoom.purchaseOrderSummary.totalValueUsd)}</strong>
                          <p>
                            {formatPercent(selectedCompanyDataRoom.purchaseOrderSummary.fillRate)} fill rate ·{' '}
                            {formatNumber(selectedCompanyDataRoom.purchaseOrderSummary.atRiskCount)} at-risk orders.
                          </p>
                        </article>
                        <article>
                          <span>Compliance readiness</span>
                          <strong>{formatNumber(selectedCompanyDataRoom.complianceSummary.validCount)} valid</strong>
                          <p>
                            {formatNumber(selectedCompanyDataRoom.complianceSummary.expiringCount)} expiring ·{' '}
                            {formatNumber(selectedCompanyDataRoom.complianceSummary.expiredCount)} expired certifications.
                          </p>
                        </article>
                        <article>
                          <span>Logistics coverage</span>
                          <strong>{formatPercent(selectedCompanyDataRoom.logisticsSummary.avgReliability)}</strong>
                          <p>
                            {formatNumber(selectedCompanyDataRoom.logisticsSummary.laneCount)} lanes · modes:{' '}
                            {selectedCompanyDataRoom.logisticsSummary.modes.join(', ') || 'not assigned'}.
                          </p>
                        </article>
                      </div>

                      <div className="company-data-deep-grid">
                        <div>
                          <h4>Supplied product categories</h4>
                          <div className="company-category-list">
                            {(selectedCompanyDataRoom.categoryBreakdown || []).map((category) => (
                              <article key={category.category}>
                                <div>
                                  <strong>{category.category}</strong>
                                  <span>{formatNumber(category.suppliers)} suppliers</span>
                                </div>
                                <div>
                                  <span>{formatNumber(category.productCount)} products</span>
                                  <span>{category.avgLeadTimeDays} day avg lead</span>
                                  <span>{formatCurrency(category.avgUnitCostUsd)} avg unit</span>
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4>Tier and subcontractor depth</h4>
                          <div className="company-tier-list">
                            {(selectedCompanyDataRoom.tierBreakdown || []).map((tier) => (
                              <article className={`risk-${getRiskTone(tier.avgRiskScore)}`} key={tier.tier}>
                                <span>Tier {tier.tier}</span>
                                <strong>{formatNumber(tier.supplierCount)}</strong>
                                <small>
                                  {formatNumber(tier.subcontractorCount)} subcontractors · Risk {tier.avgRiskScore}
                                </small>
                              </article>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="company-supplier-showcase">
                        <div className="section-heading-row compact-heading">
                          <div>
                            <p className="eyebrow">Supplier showcase</p>
                            <h3>Top suppliers and what they provide</h3>
                          </div>
                        </div>

                        <div className="company-supplier-card-grid">
                          {(selectedCompanyDataRoom.topSuppliers || []).map((supplier) => (
                            <article className={`company-supplier-showcase-card risk-${getRiskTone(supplier.riskScore)}`} key={supplier.id}>
                              <div className="company-supplier-showcase-head">
                                <div>
                                  <strong>{supplier.name}</strong>
                                  <span>
                                    Tier {supplier.tier} · {supplier.city}, {supplier.country}
                                  </span>
                                </div>
                                <div className={`risk-orb risk-${getRiskTone(supplier.riskScore)}`}>{supplier.riskScore}</div>
                              </div>

                              <div className="supplier-provided-list">
                                {(supplier.products || []).slice(0, 3).map((product) => (
                                  <span key={product.id}>{product.name} · {product.category}</span>
                                ))}
                                {supplier.products?.length > 3 && <span>+{supplier.products.length - 3} more products</span>}
                              </div>

                              <div className="supplier-evidence-row">
                                <span>{formatNumber(supplier.certifications?.length)} certifications</span>
                                <span>{formatNumber(supplier.riskCategories?.length)} risk checks</span>
                                <strong>{formatCurrency(supplier.annualRevenueUsd)}</strong>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  <SupplierTraceabilityPanel
                    company={selectedCompany}
                    dataRoom={selectedCompanyDataRoom}
                    suppliers={selectedCompanySuppliers}
                  />

                  <section className="network-3d-panel glass-card">
                    <div className="section-heading-row">
                      <div>
                        <p className="eyebrow">3D supplier map</p>
                        <h2 className="section-title">Animated supply-chain topology</h2>
                        <p>
                          Use this visual during demos to explain how each supplier node sits in the company network,
                          where risk accumulates, and how deeper subcontractor tiers can be traced.
                        </p>
                      </div>
                      <div className="panel-chip">CSS 3D visual</div>
                    </div>
                    <IsometricSupplyNetwork company={selectedCompany} suppliers={selectedCompanySuppliers} />
                  </section>

                  <div className="company-visual-grid">
                    <CompanyRadarChart company={selectedCompany} suppliers={selectedCompanySuppliers} />
                    <SupplierGalaxyChart suppliers={selectedCompanySuppliers} />
                  </div>

                  <div className="network-chart-shell">
                    <div className="network-company-card">
                      <span className="company-node-tag">Parent company</span>
                      <h3>{selectedCompany.name}</h3>
                      <p>
                        Founded {selectedCompany.foundedYear} · {selectedCompany.stockTicker} ·{' '}
                        {formatCurrency(selectedCompany.annualRevenueUsd)} revenue
                      </p>
                    </div>

                    <div className="network-roots">
                      {selectedCompany.rootSuppliers.map((supplier) => (
                        <HierarchyNode key={supplier.id} node={supplier} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="stacked-column">
              <div className="panel glass-card">
                <div className="section-heading-row">
                  <div>
                    <p className="eyebrow">Related suppliers</p>
                    <h2 className="section-title">Selected company watchlist</h2>
                  </div>
                  <div className="panel-chip">Dropdown driven</div>
                </div>

                <div className="related-supplier-list">
                  {selectedCompanySupplierPreview.map((supplier) => (
                    <article className="related-supplier-card" key={supplier.id}>
                      <div>
                        <strong>{supplier.name}</strong>
                        <span>
                          Tier {supplier.tier} · {supplier.city}, {supplier.country}
                        </span>
                      </div>
                      <div className={`risk-orb risk-${getRiskTone(supplier.riskScore)}`}>
                        {supplier.riskScore}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="panel glass-card">
                <div className="section-heading-row">
                  <div>
                    <p className="eyebrow">Risk balance</p>
                    <h2 className="section-title">Supplier risk distribution</h2>
                  </div>
                </div>

                <div className="bar-chart-list">
                  {overview.riskDistribution.map((item) => (
                    <div className="bar-row" key={item.label}>
                      <div className="bar-label-group">
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(item.value / maxRiskBar) * 100}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel glass-card">
                <div className="section-heading-row">
                  <div>
                    <p className="eyebrow">Operational flow</p>
                    <h2 className="section-title">Shipment status mix</h2>
                  </div>
                </div>

                <div className="bar-chart-list compact">
                  {overview.shipmentStatusBreakdown.map((item) => (
                    <div className="bar-row" key={item.status}>
                      <div className="bar-label-group">
                        <span>{item.status.replace('_', ' ')}</span>
                        <strong>{item.value}</strong>
                      </div>
                      <div className="bar-track dark">
                        <div
                          className="bar-fill gradient"
                          style={{ width: `${(item.value / maxShipmentBar) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-grid-secondary">
            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Priority partners</p>
                  <h2 className="section-title">Top suppliers by revenue impact</h2>
                </div>
              </div>

              <div className="supplier-list">
                {overview.topSuppliers.map((supplier) => (
                  <article className="supplier-card" key={supplier.id}>
                    <div className="supplier-card-head">
                      <div>
                        <h3>{supplier.name}</h3>
                        <p>{supplier.companyName}</p>
                      </div>
                      <span className={`status-pill ${getStatusTone(supplier.status)}`}>
                        {supplier.status}
                      </span>
                    </div>

                    <div className="supplier-card-grid">
                      <span>Tier {supplier.tier}</span>
                      <span>{supplier.country}</span>
                      <span>Risk {supplier.riskScore}</span>
                      <span>{supplier.products} products</span>
                    </div>

                    <strong className="supplier-revenue">
                      {formatCurrency(supplier.annualRevenueUsd)} annual revenue
                    </strong>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Health snapshot</p>
                  <h2 className="section-title">Operational readiness</h2>
                </div>
              </div>

              <ul className="insight-list upgraded">
                <li>
                  <span>Active Suppliers</span>
                  <strong>{overview.activeSuppliers}</strong>
                </li>
                <li>
                  <span>Delivered Shipments</span>
                  <strong>{overview.deliveredShipments}</strong>
                </li>
                <li>
                  <span>High-Risk Suppliers</span>
                  <strong>{overview.networkStats.highRiskSuppliers}</strong>
                </li>
                <li>
                  <span>Total Subcontractors</span>
                  <strong>{overview.networkStats.totalSubcontractors}</strong>
                </li>
              </ul>
            </div>
          </section>
            </>
          )}

          {activeTab === 'control' && (
            <>
              <section className="control-tower-hero glass-card">
                <div>
                  <p className="eyebrow">Supply chain control tower</p>
                  <h2 className="section-title">From demand signal to lane execution</h2>
                  <p>
                    This view blends the new MongoDB collections for logistics lanes, demand forecasts,
                    supplier scorecards, and sustainability metrics into one operational cockpit.
                  </p>
                </div>

                <div className="control-kpi-grid">
                  <article>
                    <span>Lane reliability</span>
                    <strong>{formatPercent(overview.networkHighlights.avgLaneReliability)}</strong>
                  </article>
                  <article>
                    <span>Forecast coverage</span>
                    <strong>{formatPercent(overview.networkHighlights.demandForecastCoverage)}</strong>
                  </article>
                  <article>
                    <span>Supplier performance</span>
                    <strong>{overview.networkHighlights.avgSupplierPerformanceScore}</strong>
                  </article>
                  <article>
                    <span>Avg ESG score</span>
                    <strong>{overview.networkHighlights.avgEsgScore}</strong>
                  </article>
                </div>
              </section>

              <section className="action-command-grid">
                <div className="panel glass-card action-summary-panel">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Execution risk</p>
                      <h2 className="section-title">Action command cockpit</h2>
                    </div>
                    <div className="panel-chip">PO + disruption focus</div>
                  </div>

                  <div className="action-kpi-grid">
                    <article className="action-kpi-card critical">
                      <span>PO value at risk</span>
                      <strong>{formatCurrency(overview.networkHighlights.purchaseOrderValueAtRisk)}</strong>
                      <p>Critical or at-risk purchase orders requiring intervention.</p>
                    </article>
                    <article className="action-kpi-card good">
                      <span>PO fill rate</span>
                      <strong>{formatPercent(overview.networkHighlights.purchaseOrderFillRate)}</strong>
                      <p>Received units compared with total ordered units.</p>
                    </article>
                    <article className="action-kpi-card watch">
                      <span>Active disruptions</span>
                      <strong>{formatNumber(overview.networkHighlights.activeDisruptionCount)}</strong>
                      <p>Open events currently impacting suppliers or lanes.</p>
                    </article>
                    <article className="action-kpi-card critical">
                      <span>Inventory alerts</span>
                      <strong>{formatNumber(overview.networkHighlights.inventoryAlertCount)}</strong>
                      <p>Stock positions outside healthy operating thresholds.</p>
                    </article>
                  </div>
                </div>

                <div className="panel glass-card supplier-command-panel">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Supplier prioritization</p>
                      <h2 className="section-title">Control score watchlist</h2>
                    </div>
                    <div className="panel-chip">Ranked actions</div>
                  </div>

                  <div className="control-score-list">
                    {(overview.supplierControlTower || []).map((supplier) => {
                      const tone = getControlScoreTone(supplier.controlScore);

                      return (
                        <article className={`control-score-card tone-${tone}`} key={supplier.id}>
                          <div className="control-score-head">
                            <div>
                              <strong>{supplier.name}</strong>
                              <span>
                                {supplier.companyName} · Tier {supplier.tier} · {supplier.country}
                              </span>
                            </div>
                            <div className={`risk-orb risk-${getRiskTone(supplier.riskScore)}`}>{supplier.riskScore}</div>
                          </div>

                          <div className="control-score-track">
                            <div
                              className={`control-score-fill ${tone}`}
                              style={{ width: `${Math.min((supplier.controlScore / maxControlScore) * 100, 100)}%` }}
                            />
                          </div>

                          <div className="control-score-meta">
                            <span>{formatNumber(supplier.openPurchaseOrders)} open POs</span>
                            <span>{formatNumber(supplier.atRiskPurchaseOrders)} at risk</span>
                            <span>{formatNumber(supplier.inventoryAlerts)} stock alerts</span>
                            <span>{formatNumber(supplier.activeDisruptions)} disruptions</span>
                            <strong>Control {supplier.controlScore}</strong>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="dashboard-grid-visuals control-grid">
                <div className="panel glass-card">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Freight mode mix</p>
                      <h2 className="section-title">Lane reliability by mode</h2>
                    </div>
                    <div className="panel-chip">New collection</div>
                  </div>

                  <VerticalBarChart
                    color="#0ea5e9"
                    data={(overview.logisticsModeBreakdown || []).map((item) => ({
                      ...item,
                      label: item.mode,
                    }))}
                    labelKey="label"
                    valueFormatter={formatPercent}
                    valueKey="avgReliability"
                  />
                </div>

                <div className="panel glass-card control-span-2">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Weak lanes first</p>
                      <h2 className="section-title">Logistics lane watchlist</h2>
                    </div>
                    <div className="panel-chip">Carrier cockpit</div>
                  </div>

                  <div className="lane-list">
                    {(overview.logisticsLaneWatchlist || []).map((lane) => (
                      <article className="lane-card" key={lane.id}>
                        <div>
                          <div className="lane-card-head">
                            <strong>{lane.route}</strong>
                            <span className={`status-pill ${getStatusTone(lane.status)}`}>{lane.status.replace('_', ' ')}</span>
                          </div>
                          <p>{lane.supplierName} · {lane.carrier} · {lane.mode}</p>
                        </div>
                        <div className="lane-metrics">
                          <span>{lane.avgTransitDays} days</span>
                          <span>{formatCurrency(lane.costPerUnitUsd)}/unit</span>
                          <strong>{formatPercent(lane.reliabilityScore)}</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="dashboard-grid-secondary control-wide-grid">
                <div className="panel glass-card">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Demand planning</p>
                      <h2 className="section-title">Forecast vs committed supply gaps</h2>
                    </div>
                    <div className="panel-chip">S&OP view</div>
                  </div>

                  <div className="forecast-list">
                    {(overview.demandForecastByProduct || []).map((forecast) => (
                      <article className="forecast-card" key={forecast.id}>
                        <div className="forecast-head">
                          <div>
                            <strong>{forecast.productName}</strong>
                            <span>{forecast.companyName} · {forecast.forecastMonth} · {forecast.demandSignal.replace('_', ' ')}</span>
                          </div>
                          <span className={`status-pill ${forecast.gapUnits < 0 ? 'critical' : 'good'}`}>
                            {formatSignedNumber(forecast.gapUnits)} units
                          </span>
                        </div>

                        <div className="forecast-bar-track">
                          <div className="forecast-bar-fill" style={{ width: `${Math.min(forecast.coveragePct, 120)}%` }} />
                        </div>

                        <div className="forecast-meta">
                          <span>Forecast {formatNumber(forecast.forecastUnits)}</span>
                          <span>Committed {formatNumber(forecast.committedSupplyUnits)}</span>
                          <strong>{formatPercent(forecast.coveragePct)} covered</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="panel glass-card">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Supplier scorecards</p>
                      <h2 className="section-title">Performance leaders</h2>
                    </div>
                  </div>

                  <div className="scorecard-list">
                    {(overview.supplierPerformanceLeaders || []).slice(0, 5).map((scorecard) => (
                      <article className="scorecard-row" key={scorecard.id}>
                        <div>
                          <strong>{scorecard.supplierName}</strong>
                          <span>{scorecard.companyName} · {scorecard.onTimeDeliveryRate}% OTIF · {formatNumber(scorecard.qualityPpm)} PPM</span>
                        </div>
                        <span className={`status-pill ${getStatusTone(scorecard.trend)}`}>{scorecard.overallScore}</span>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="control-analytics-grid">
                <div className="panel glass-card chart-span-2">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Demand coverage</p>
                      <h2 className="section-title">Forecast vs committed supply</h2>
                    </div>
                    <div className="panel-chip">Bullet chart</div>
                  </div>
                  <ComparisonBulletChart
                    data={overview.demandForecastByProduct || []}
                    labelKey="productName"
                    primaryKey="committedSupplyUnits"
                    primaryLabel="Committed"
                    secondaryKey="forecastUnits"
                    secondaryLabel="Forecast"
                  />
                </div>

                <div className="panel glass-card">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Purchase orders</p>
                      <h2 className="section-title">PO status mix</h2>
                    </div>
                    <div className="panel-chip">Donut chart</div>
                  </div>
                  <DonutChart
                    itemSuffix="orders"
                    items={purchaseOrderStatusChartData}
                    total={overview.totalPurchaseOrders}
                    centerLabel="POs"
                    centerValue={formatNumber(overview.totalPurchaseOrders)}
                  />
                </div>

                <div className="panel glass-card">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Priority pressure</p>
                      <h2 className="section-title">PO priority distribution</h2>
                    </div>
                    <div className="panel-chip">Priority bars</div>
                  </div>
                  <HorizontalBarChart
                    data={purchaseOrderPriorityChartData}
                    labelKey="priority"
                    valueKey="value"
                    valueFormatter={formatNumber}
                  />
                </div>

                <div className="panel glass-card">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Inventory health</p>
                      <h2 className="section-title">Stock status distribution</h2>
                    </div>
                    <div className="panel-chip">Inventory bars</div>
                  </div>
                  <HorizontalBarChart
                    data={inventoryStatusChartData}
                    labelKey="status"
                    valueKey="value"
                    valueFormatter={formatNumber}
                  />
                </div>

                <div className="panel glass-card">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Disruption severity</p>
                      <h2 className="section-title">Event severity mix</h2>
                    </div>
                    <div className="panel-chip">Severity bars</div>
                  </div>
                  <HorizontalBarChart
                    data={disruptionSeverityChartData}
                    labelKey="severity"
                    valueKey="value"
                    valueFormatter={formatNumber}
                  />
                </div>

                <div className="panel glass-card chart-span-2">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Freight carbon</p>
                      <h2 className="section-title">Carbon load by logistics mode</h2>
                    </div>
                    <div className="panel-chip">Carbon bars</div>
                  </div>
                  <HorizontalBarChart
                    color="#14b8a6"
                    data={logisticsCarbonChartData}
                    helperKey="helper"
                    labelKey="label"
                    valueKey="totalCarbonKg"
                    valueFormatter={(value) => `${formatCompactNumber(value)} kg`}
                  />
                </div>

                <div className="panel glass-card chart-span-2">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Supplier performance cloud</p>
                      <h2 className="section-title">On-time delivery vs overall score</h2>
                    </div>
                    <div className="panel-chip">Scatter chart</div>
                  </div>
                  <ScatterPlotChart
                    data={supplierPerformanceScatterData}
                    labelKey="name"
                    sizeKey="size"
                    xKey="onTimeDeliveryRate"
                    xLabel="On-time delivery"
                    yKey="overallScore"
                    yLabel="Overall score"
                  />
                </div>

                <div className="panel glass-card chart-span-2">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">ESG efficiency cloud</p>
                      <h2 className="section-title">Renewable energy vs ESG score</h2>
                    </div>
                    <div className="panel-chip">Scatter chart</div>
                  </div>
                  <ScatterPlotChart
                    data={sustainabilityScatterData}
                    labelKey="name"
                    sizeKey="size"
                    xKey="renewableEnergyPct"
                    xLabel="Renewable energy"
                    yKey="esgScore"
                    yLabel="ESG score"
                  />
                </div>
              </section>

              <section className="dashboard-grid-secondary action-watch-grid">
                <div className="panel glass-card">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Inventory intervention</p>
                      <h2 className="section-title">Stock alerts by product</h2>
                    </div>
                    <div className="panel-chip">Replenishment queue</div>
                  </div>

                  <div className="inventory-alert-list">
                    {(overview.inventoryAlerts || []).slice(0, 6).map((alert) => (
                      <article className="inventory-alert-card" key={alert.id}>
                        <div>
                          <strong>{alert.productName}</strong>
                          <span>{alert.supplierName} · {alert.warehouseLocation}</span>
                        </div>
                        <div className="inventory-alert-metrics">
                          <span className={`status-pill ${getStatusTone(alert.status)}`}>{alert.status.replace('_', ' ')}</span>
                          <strong>{alert.daysOfSupply} days</strong>
                          <small>{formatNumber(alert.onHandUnits)} on hand / {formatNumber(alert.safetyStockUnits)} safety</small>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="panel glass-card">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Disruption response</p>
                      <h2 className="section-title">Mitigation watchlist</h2>
                    </div>
                    <div className="panel-chip">Continuity plan</div>
                  </div>

                  <div className="disruption-watch-list">
                    {(overview.disruptionWatchlist || []).map((disruption) => (
                      <article className="disruption-card" key={disruption.id}>
                        <div className="disruption-head">
                          <div>
                            <strong>{disruption.type.replace('_', ' ')}</strong>
                            <span>{disruption.supplierName} · {disruption.affectedLane}</span>
                          </div>
                          <span className={`status-pill ${getStatusTone(disruption.severity)}`}>{disruption.severity}</span>
                        </div>
                        <p>{disruption.impactSummary}</p>
                        <div className="disruption-action-row">
                          <span>{disruption.mitigationAction}</span>
                          <strong>ETA {formatDate(disruption.estimatedResolutionDate)}</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="panel glass-card sustainability-panel">
                <div className="section-heading-row">
                  <div>
                    <p className="eyebrow">Sustainability intelligence</p>
                    <h2 className="section-title">ESG and carbon readiness leaderboard</h2>
                  </div>
                  <div className="panel-chip">ESG collection</div>
                </div>

                <div className="sustainability-grid">
                  {(overview.sustainabilityLeaderboard || []).map((metric) => (
                    <article className="sustainability-card" key={metric.id}>
                      <div className="sustainability-score">
                        <span>ESG</span>
                        <strong>{metric.esgScore}</strong>
                      </div>
                      <div>
                        <h3>{metric.supplierName}</h3>
                        <p>{metric.companyName}</p>
                        <div className="sustainability-stats">
                          <span>{metric.renewableEnergyPct}% renewable</span>
                          <span>{metric.wasteRecycledPct}% recycled</span>
                          <span>{metric.carbonIntensityKgPerUnit} kg/unit CO₂e</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'scenario' && scenarioModel && (
            <>
              <section className="scenario-hero glass-card">
                <div>
                  <p className="eyebrow">Scenario planning cockpit</p>
                  <h2 className="section-title">Model disruption response before it hits delivery</h2>
                  <p>
                    Tune the operating levers below to estimate residual risk, recovery time,
                    investment level, and protected commercial exposure using the current supplier network.
                  </p>
                </div>

                <div className="scenario-result-ring" style={{ '--scenario-score': `${scenarioModel.projectedReadiness * 3.6}deg` }}>
                  <div>
                    <span>Projected readiness</span>
                    <strong>{formatPercent(scenarioModel.projectedReadiness)}</strong>
                    <small>Risk {scenarioModel.projectedRisk}</small>
                  </div>
                </div>
              </section>

              <section className="scenario-grid">
                <div className="panel glass-card scenario-controls-panel">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Continuity levers</p>
                      <h2 className="section-title">Adjust the what-if assumptions</h2>
                    </div>
                    <div className="panel-chip">Interactive model</div>
                  </div>

                  <div className="scenario-control-list">
                    {[
                      {
                        name: 'disruptionSeverity',
                        label: 'Disruption severity',
                        helper: 'How aggressive the supplier, lane, or demand shock is.',
                        low: 'Contained',
                        high: 'Severe',
                      },
                      {
                        name: 'expeditedFreight',
                        label: 'Expedited freight coverage',
                        helper: 'Share of weak lanes moved to premium or alternate transport.',
                        low: 'Base lanes',
                        high: 'Premium lanes',
                      },
                      {
                        name: 'safetyStock',
                        label: 'Safety stock uplift',
                        helper: 'Incremental inventory buffer for constrained product families.',
                        low: 'Lean',
                        high: 'Buffered',
                      },
                      {
                        name: 'mitigationCoverage',
                        label: 'Supplier mitigation coverage',
                        helper: 'High-risk suppliers with an active continuity playbook.',
                        low: 'Reactive',
                        high: 'Covered',
                      },
                    ].map((control) => (
                      <label className="scenario-slider" key={control.name}>
                        <div>
                          <strong>{control.label}</strong>
                          <span>{formatPercent(scenarioInputs[control.name])}</span>
                        </div>
                        <input
                          max="100"
                          min="0"
                          name={control.name}
                          onChange={handleScenarioInputChange}
                          type="range"
                          value={scenarioInputs[control.name]}
                        />
                        <div className="scenario-slider-scale">
                          <span>{control.low}</span>
                          <small>{control.helper}</small>
                          <span>{control.high}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="panel glass-card scenario-results-panel">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Modeled outcome</p>
                      <h2 className="section-title">Risk, cost, and recovery impact</h2>
                    </div>
                    <div className={`status-pill ${getStatusTone(scenarioModel.projectedRisk >= 65 ? 'critical' : 'stable')}`}>
                      {scenarioModel.projectedRisk >= 65 ? 'Escalate' : 'Controlled'}
                    </div>
                  </div>

                  <div className="scenario-kpi-grid">
                    <article>
                      <span>Baseline risk</span>
                      <strong>{scenarioModel.baselineRisk}</strong>
                      <p>Current average supplier-network risk.</p>
                    </article>
                    <article>
                      <span>Projected risk</span>
                      <strong>{scenarioModel.projectedRisk}</strong>
                      <p>After severity and mitigation levers are applied.</p>
                    </article>
                    <article>
                      <span>Recovery window</span>
                      <strong>{scenarioModel.recoveryDays}d</strong>
                      <p>Estimated time to normalize flow.</p>
                    </article>
                    <article>
                      <span>Mitigation cost</span>
                      <strong>{formatCurrency(scenarioModel.estimatedCost)}</strong>
                      <p>Estimated premium freight, buffers, and supplier actions.</p>
                    </article>
                  </div>

                  <div className="scenario-value-band">
                    <div>
                      <span>Residual PO value at risk</span>
                      <strong>{formatCurrency(scenarioModel.residualValueAtRisk)}</strong>
                    </div>
                    <div>
                      <span>Protected revenue exposure</span>
                      <strong>{formatCurrency(scenarioModel.protectedRevenue)}</strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className="dashboard-grid-secondary scenario-action-grid">
                <div className="panel glass-card">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Recommended response</p>
                      <h2 className="section-title">Action plan generated from this scenario</h2>
                    </div>
                    <div className="panel-chip">Playbook</div>
                  </div>

                  <div className="scenario-action-list">
                    {scenarioModel.actionPlan.map((action, index) => (
                      <article className={`scenario-action-card tone-${action.tone}`} key={action.title}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <strong>{action.title}</strong>
                          <p>{action.detail}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="panel glass-card">
                  <div className="section-heading-row">
                    <div>
                      <p className="eyebrow">Recovery journey</p>
                      <h2 className="section-title">Timeline to operational normalization</h2>
                    </div>
                    <div className="panel-chip">Continuity timeline</div>
                  </div>

                  <div className="scenario-timeline">
                    {scenarioModel.timeline.map((step) => (
                      <article key={step.label}>
                        <span>{step.label}</span>
                        <strong>{step.value}</strong>
                        <p>{step.detail}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'intelligence' && (
            <>
          <RiskCommandHero
            criticalSuppliers={criticalSupplierWatchlist}
            metrics={riskCommandMetrics}
            topExposure={topExposureCountry}
          />

          <RiskScoreExplainer />

          <section className="dashboard-grid-tertiary">
            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Portfolio risk map</p>
                  <h2 className="section-title">Company scale vs. supplier risk quadrants</h2>
                </div>
                <div className="panel-chip">Bubble quadrant</div>
              </div>

              <RiskPortfolioQuadrants companies={riskQuadrantCompanies} />
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Regional exposure</p>
                  <h2 className="section-title">Country dependency heatmap</h2>
                </div>
                <div className="panel-chip">USA + global view</div>
              </div>

              <GeoHeatmap data={geographyExposure} maxSupplierCount={maxGeoSupplierCount} />

              <div className="geo-list">
                {geographyExposure.map((item) => (
                  <article className="geo-card" key={item.country}>
                    <div className="geo-card-head">
                      <strong>{item.country}</strong>
                      <span>{formatPercent(item.exposureShare)} of suppliers</span>
                    </div>

                    <div className="geo-progress-track">
                      <div className="geo-progress-fill" style={{ width: `${item.exposureShare}%` }} />
                    </div>

                    <div className="geo-card-stats">
                      <span>{item.supplierCount} suppliers</span>
                      <span>{item.activeCount} active</span>
                      <strong>Avg risk {item.avgRiskScore}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="risk-intelligence-grid">
            <div className="panel glass-card risk-watchlist-panel">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Critical supplier watchlist</p>
                  <h2 className="section-title">Ranked suppliers requiring attention</h2>
                </div>
                <div className="panel-chip">Priority queue</div>
              </div>

              <div className="critical-supplier-list">
                {criticalSupplierWatchlist.map((supplier, index) => (
                  <article className={`critical-supplier-card risk-${getRiskTone(supplier.riskScore)}`} key={supplier.id}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{supplier.name}</strong>
                      <small>
                        {supplier.companyName || 'Supplier network'} · Tier {supplier.tier || '—'} · {supplier.country || 'Global'}
                      </small>
                    </div>
                    <div className={`risk-orb risk-${getRiskTone(supplier.riskScore)}`}>{supplier.riskScore}</div>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Early warning radar</p>
                  <h2 className="section-title">Weak signals before they become incidents</h2>
                </div>
                <div className="panel-chip">Signal radar</div>
              </div>
              <EarlyWarningRadar signals={earlyWarningSignals} />
            </div>
          </section>

          <section className="risk-intelligence-grid equal">
            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Risk category pulse</p>
                  <h2 className="section-title">Which risk types are driving exposure</h2>
                </div>
                <div className="panel-chip">Assessment themes</div>
              </div>
              <RiskCategoryPulse categories={overview.riskCategoryBreakdown || []} />
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Recommended mitigation playbook</p>
                  <h2 className="section-title">Next-best actions generated from current signals</h2>
                </div>
                <div className="panel-chip">Action engine</div>
              </div>
              <MitigationPlaybook actions={mitigationPlaybookActions} />
            </div>
          </section>

          <section className="advanced-visual-grid">
            <div className="panel glass-card visual-span-2">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">USA heatmap capability</p>
                  <h2 className="section-title">Regional supplier intensity map</h2>
                </div>
                <div className="panel-chip">SVG map</div>
              </div>
              <UsaRegionalHeatmap usaExposure={usaExposure} />
            </div>

            <div className="panel glass-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Risk bubble cloud</p>
                  <h2 className="section-title">Country risk by supplier volume</h2>
                </div>
                <div className="panel-chip">Bubble chart</div>
              </div>
              <RiskBubbleCloud data={geographyExposure} maxSupplierCount={maxGeoSupplierCount} />
            </div>

            <div className="panel glass-card visual-span-3">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Supply flow</p>
                  <h2 className="section-title">Company → supplier → product → shipment flow</h2>
                </div>
                <div className="panel-chip">Sankey-style chart</div>
              </div>
              <SupplyFlowChart overview={overview} />
            </div>
          </section>

          <section className="panel glass-card analyst-panel">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Analyst narrative</p>
                <h2 className="section-title">What I’m seeing in the network</h2>
              </div>
              <div className="panel-chip">AI-style analysis</div>
            </div>

            <div className="analyst-grid">
              {analystInsights.map((insight) => (
                <article className={`analyst-card tone-${insight.tone}`} key={insight.title}>
                  <h3>{insight.title}</h3>
                  <p>{insight.summary}</p>
                  <span>{insight.detail}</span>
                </article>
              ))}
            </div>

            <div className="micro-insight-grid">
              <div className="micro-insight-card">
                <span>Shipment completion view</span>
                <strong>{formatPercent(overview.networkHighlights.onTimeShipmentRate)}</strong>
                <p>{formatNumber(shipmentTotal)} tracked shipments across delivered, in-transit, delayed, and pending states.</p>
              </div>
              <div className="micro-insight-card">
                <span>Average network risk</span>
                <strong>{overview.networkHighlights.averageNetworkRisk}</strong>
                <p>The overall network sits in a managed-but-watchful zone, with concentrated risk in deeper tiers.</p>
              </div>
              <div className="micro-insight-card">
                <span>Total company revenue</span>
                <strong>{formatCompactNumber(overview.networkHighlights.totalTrackedRevenueUsd)}</strong>
                <p>Commercial exposure is meaningful, so even a few downstream bottlenecks can create outsized business impact.</p>
              </div>
            </div>
          </section>
            </>
          )}

          {activeTab === 'capabilities' && (
            <section className="panel glass-card capability-panel">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Platform capabilities</p>
                  <h2 className="section-title">What this supplier system can showcase</h2>
                </div>
                <div className="panel-chip">End-to-end workflow</div>
              </div>

              <div className="capability-hero">
                <div>
                  <h3>Designed as a complete supplier command center</h3>
                  <p>
                    The app turns available supply-chain records into an executive workflow for company ownership,
                    supplier performance, subcontractor depth, shipment continuity, risk exposure, and compliance readiness.
                  </p>
                </div>
                <div className="capability-score">
                  <span>Coverage</span>
                  <strong>360°</strong>
                  <p>Company, supplier, product, shipment, risk, and compliance intelligence.</p>
                </div>
              </div>

              <div className="capability-grid">
                {PLATFORM_CAPABILITIES.map((capability, index) => (
                  <article className="capability-card" key={capability.title}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <h3>{capability.title}</h3>
                    <p>{capability.description}</p>
                  </article>
                ))}
              </div>

              <div className="capability-readiness-block">
                <div>
                  <p className="eyebrow">Implementation storyline</p>
                  <h3>Enterprise proof-of-concept journey</h3>
                  <p>
                    The POC now demonstrates the full path from data ingestion to prioritized action,
                    with visual analytics that are suitable for executive walkthroughs and stakeholder demos.
                  </p>
                </div>
                <EnterpriseReadinessTimeline readinessScore={enterpriseReadinessScore} />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default App;