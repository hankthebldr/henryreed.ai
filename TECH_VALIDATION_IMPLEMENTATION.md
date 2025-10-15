# Tech Validation Playbook - Lightweight Implementation

## Overview

This document describes the **lightweight, metrics-driven** implementation of the XSIAM Technical Validation Playbook integration. Unlike the comprehensive strategy document, this implementation **leverages existing platform structures** and **derives metrics from existing data sources** instead of creating duplicate schemas.

---

## Design Philosophy

### ✅ **DO: Leverage Existing Structures**
- Use existing `BusinessValueFramework` for all metrics
- Use existing `ScenarioDeployment` for scenario tracking
- Use existing `POVProject` as source of truth
- Derive Tech Validation stages from POV phase/status

### ❌ **DON'T: Duplicate Data**
- Don't create separate TV metrics storage
- Don't duplicate POV/TRR data
- Don't create parallel tracking systems
- Don't reinvent what already exists

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│          Existing Data Sources                  │
├─────────────────────────────────────────────────┤
│ POVProject                                      │
│  ├── businessValueFramework (BVF)              │
│  │   ├── operationalMetrics ★ (source)        │
│  │   └── financialMetrics ★ (source)          │
│  ├── scenarios[] → ScenarioDeployment[]        │
│  ├── phase (discovery/validation/closure)      │
│  └── status (planning/active/completed)        │
└─────────────────────────────────────────────────┘
                     ↓
         ┌──────────────────────────┐
         │ TechValidationContext    │
         │  (Lightweight Wrapper)   │
         ├──────────────────────────┤
         │ povId: string            │ ← Links to POV
         │ currentStage: derived    │ ← Computed from POV phase
         │ playbookScenarios: []    │ ← Maps to existing scenarios
         │ asanaProjectId?: string  │ ← External system
         │ metricsSource: 'derived' │ ← Not stored, computed
         └──────────────────────────┘
                     ↓
         ┌──────────────────────────┐
         │ PlaybookMetricsView      │
         │   (Computed, Not Stored) │
         ├──────────────────────────┤
         │ automationRate           │ ← FROM BVF.operationalMetrics
         │ mttr/mttd                │ ← FROM BVF.operationalMetrics
         │ alertGroupingRatio       │ ← COMPUTED from scenarios
         │ mitreCoverage            │ ← COMPUTED from scenarios
         │ costSavings              │ ← FROM BVF.financialMetrics
         └──────────────────────────┘
                     ↓
         ┌──────────────────────────┐
         │ PlaybookReadoutData      │
         │    (Generated On-Demand) │
         ├──────────────────────────┤
         │ Aggregates data from:    │
         │  - BVF (metrics)         │
         │  - Scenarios (results)   │
         │  - TV Context (stage)    │
         │ → Generates PDF readout  │
         └──────────────────────────┘
```

---

## Implementation Details

### 1. Tech Validation Context (Wrapper Only)

**File:** `hosting/types/tech-validation.ts`

The `TechValidationContext` is a **lightweight wrapper** that:
- Links to existing POV (`povId`)
- Tracks playbook stage transitions (audit trail)
- Maps playbook scenarios to existing scenario deployments
- Connects to Asana (external system)
- **Does NOT store metrics** (they're derived on-demand)

```typescript
interface TechValidationContext {
  povId: string;  // Source of truth
  currentStage: TechValidationStage;  // Derived from POV.phase
  playbookScenarios: PlaybookScenarioMapping[];  // Maps to existing scenarios
  asanaProjectId?: string;  // External
  metricsSource: 'derived-from-pov-bvf';  // NOT stored separately
}
```

### 2. Metrics are Computed, Not Stored

**Key Function:** `computePlaybookMetricsView()`

All metrics come from existing data sources:

| Playbook Metric | Source | Computation |
|----------------|---------|------------|
| **Automation Rate** | `BVF.operationalMetrics.automationRate` | Direct passthrough |
| **MTTR** | `BVF.operationalMetrics.mttr` | Direct passthrough |
| **MTTD** | `BVF.operationalMetrics.mttd` | Direct passthrough |
| **Detection Accuracy** | `BVF.operationalMetrics.threatDetectionAccuracy` | Direct passthrough |
| **Tool Consolidation** | `BVF.financialMetrics.toolConsolidation` | Direct passthrough |
| **Cost Savings** | `BVF.financialMetrics.estimatedCostSavings` | Direct passthrough |
| **Alert Grouping Ratio** | `ScenarioDeployment[].results.detectionAlerts` | **Computed:** Total alerts / scenarios |
| **MITRE Coverage** | `ScenarioDeployment[].results.detectionAlerts` | **Computed:** Unique techniques / 200 |
| **Cloud Compliance** | Cloud scenarios (`cloud-posture` results) | **Computed:** Validation pass rate |

```typescript
export function computePlaybookMetricsView(
  bvf: BusinessValueFramework,
  scenarios: ScenarioDeployment[]
): PlaybookMetricsView {
  return {
    // Direct from BVF
    automationRate: bvf.operationalMetrics.automationRate,
    mttr: bvf.operationalMetrics.mttr,

    // Computed from scenarios
    alertGroupingRatio: computeAlertGroupingRatio(scenarios),
    mitreCoverage: computeMitreCoverage(scenarios),
  };
}
```

### 3. Tech Validation Stages (View Layer)

Stages are **derived** from POV phase, not stored separately:

```typescript
export function deriveTechValidationStage(
  povPhase: string,
  povStatus: string
): TechValidationStage {
  switch (povPhase) {
    case 'discovery':
      return 'tv-stage-0-1';  // Discovery & Alignment
    case 'design':
      return 'tv-stage-2';    // Non-POV Validation
    case 'deployment':
      return 'tv-stage-3';    // POV Planning
    case 'validation':
    case 'demonstration':
      return 'tv-stage-4';    // POV Execution ★
    case 'closure':
      return povStatus === 'completed' ? 'tv-stage-7' : 'tv-stage-8';
    default:
      return 'tv-stage-3';
  }
}
```

**Usage:**
```typescript
// In UI component or command
const tvStage = deriveTechValidationStage(pov.phase, pov.status);
// tvStage = 'tv-stage-4' (POV Execution)
```

### 4. Playbook Scenario Mapping

Maps FY26 playbook scenarios to existing scenario library:

```typescript
export const PLAYBOOK_SCENARIO_TEMPLATES = {
  'cortex-gambit': {
    name: 'Cortex Gambit - Syslog Ingestion',
    underlyingScenarioTypes: ['custom'],  // Maps to existing types
    expectedMetrics: {
      mttr: '<2 minutes',
      automationRate: '>60%',
    }
  },
  'cortex-turla': {
    name: 'Cortex Turla - MITRE ATT&CK',
    underlyingScenarioTypes: ['apt-simulation', 'evasion-techniques'],
    expectedMetrics: {
      mttr: '<5 minutes',
      automationRate: '>70%',
      alertReduction: '>75%',
      mitreTechniques: 15,
    }
  },
  'cortex-cdr': {
    name: 'Cortex CDR - Code-to-Cloud',
    underlyingScenarioTypes: ['container-vuln', 'cloud-posture', 'code-vuln'],
    expectedMetrics: {
      mttr: '<10 minutes',
      automationRate: '>85%',
    }
  },
};
```

---

## Usage Examples

### Example 1: Get Tech Validation Stage

```typescript
import { deriveTechValidationStage } from '../types/tech-validation';

// In POVManagement component
const tvStage = deriveTechValidationStage(selectedPOV.phase, selectedPOV.status);

// Display: "Current Stage: POV Execution (Stage 4)"
```

### Example 2: Compute Metrics View

```typescript
import { computePlaybookMetricsView } from '../types/tech-validation';

// Get POV with BVF and scenarios
const pov = getPOVProject(povId);
const scenarios = getScenarioDeployments(pov.scenarios.map(s => s.id));

// Compute metrics (no storage)
const metricsView = computePlaybookMetricsView(
  pov.businessValueFramework,
  scenarios
);

// Display: "Alert Grouping: 25:1 (96% reduction)"
//          "Automation Rate: 100%"
//          "MTTR: 1.5 minutes"
```

### Example 3: Generate Readout

```typescript
import { PlaybookReadoutData } from '../types/tech-validation';

// Aggregate data for readout
const readoutData: PlaybookReadoutData = {
  povId: pov.id,
  tvContext: getTechValidationContext(pov.id),
  businessValueFramework: pov.businessValueFramework,
  scenarioResults: scenarios,
  metricsView: computePlaybookMetricsView(pov.businessValueFramework, scenarios),
  generatedAt: new Date().toISOString(),
};

// Generate PDF (implementation in readout generator)
const pdfUrl = await generatePlaybookReadout(readoutData);
```

---

## Dashboard Integration

### Existing Dashboard Enhancement

Update `POVManagement.tsx` to show Tech Validation view:

```tsx
// Add TV stage badge
const tvStage = deriveTechValidationStage(selectedPOV.phase, selectedPOV.status);

<div className="flex items-center space-x-2">
  <span className="text-sm">POV Phase: {selectedPOV.phase}</span>
  <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">
    TV Stage: {TV_STAGE_DEFINITIONS[tvStage].name}
  </span>
</div>
```

### Metrics Dashboard

Create a **metrics view component** (not a new dashboard):

```tsx
// components/TechValidationMetricsView.tsx
export const TechValidationMetricsView: React.FC<{ povId: string }> = ({ povId }) => {
  const pov = useAppState().povProjects.find(p => p.id === povId);
  const scenarios = useScenarios(pov?.scenarios.map(s => s.id));

  // Compute metrics on-demand
  const metrics = useMemo(() =>
    computePlaybookMetricsView(pov?.businessValueFramework, scenarios),
    [pov, scenarios]
  );

  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        title="Alert Grouping"
        value={metrics.alertGroupingRatio ? `${metrics.alertGroupingRatio}:1` : 'N/A'}
        subtitle={`>${(1 - 1/metrics.alertGroupingRatio) * 100}% reduction`}
      />
      <MetricCard
        title="Automation Rate"
        value={metrics.automationRate ? `${metrics.automationRate}%` : 'N/A'}
        subtitle="Automated responses"
      />
      {/* ... more metrics */}
    </div>
  );
};
```

---

## Terminal Commands

### Simplified Command Set

Commands **operate on existing POV data**, not separate TV structures:

```bash
# Link TV context to existing POV
tv enable <pov-id>

# View current TV stage (derived)
tv status <pov-id>

# Map playbook scenario to existing scenario deployment
tv scenario map <pov-id> cortex-turla <scenario-deployment-id>

# Compute and display metrics
tv metrics <pov-id>

# Generate readout (aggregates existing data)
tv readout generate <pov-id> --format executive

# Sync with Asana (external system)
tv asana sync <pov-id> --project-id <asana-id>
```

**Command Implementation:**
```typescript
// lib/tech-validation-commands.tsx
export const tvCommands: CommandConfig[] = [
  {
    name: 'tv',
    description: 'Tech Validation playbook commands',
    handler: (args) => {
      if (args[0] === 'enable') {
        const povId = args[1];
        // Create lightweight TV context wrapper
        const tvContext = createTechValidationContext(povId);
        return <div>Tech Validation enabled for POV: {povId}</div>;
      }

      if (args[0] === 'status') {
        const povId = args[1];
        const pov = getPOVProject(povId);
        const tvStage = deriveTechValidationStage(pov.phase, pov.status);
        const stageDef = TV_STAGE_DEFINITIONS[tvStage];

        return (
          <div>
            <div>POV: {pov.name}</div>
            <div>Current Stage: {stageDef.name}</div>
            <div>Activities: {stageDef.keyActivities.join(', ')}</div>
          </div>
        );
      }

      if (args[0] === 'metrics') {
        const povId = args[1];
        const pov = getPOVProject(povId);
        const scenarios = getScenarioDeployments(pov.scenarios);
        const metrics = computePlaybookMetricsView(pov.businessValueFramework, scenarios);

        return (
          <div>
            <div>Automation Rate: {metrics.automationRate}%</div>
            <div>MTTR: {metrics.mttr} minutes</div>
            <div>Alert Grouping: {metrics.alertGroupingRatio}:1</div>
            <div>MITRE Coverage: {metrics.mitreCoverage}%</div>
          </div>
        );
      }
    }
  }
];
```

---

## Benefits of This Approach

### ✅ **Advantages**

1. **No Data Duplication**
   - Metrics stored once in BVF
   - Scenarios stored once in ScenarioDeployment
   - TV is a view layer, not a storage layer

2. **Leverages Existing Investment**
   - Reuses existing BusinessValueFramework
   - Reuses existing scenario tracking
   - Reuses existing POV lifecycle

3. **Simplified Maintenance**
   - One source of truth (POV + BVF)
   - Metrics computed on-demand
   - No sync issues between duplicate stores

4. **Backward Compatible**
   - Existing POVs work without TV
   - TV is opt-in enhancement
   - No breaking changes

5. **Flexible**
   - Can add new metrics by extending BVF
   - Can add new stages without schema changes
   - Can disable TV without data loss

### ⚠️ **Trade-offs**

1. **Computation Overhead**
   - Metrics computed on-demand (acceptable for dashboard views)
   - Mitigation: Add React memoization (`useMemo`)

2. **Limited Historical TV Stage Tracking**
   - Stage is derived from current POV phase
   - Mitigation: Add optional `stageHistory` to TV context for audit trail

3. **Asana Sync is External**
   - Not deeply integrated
   - Mitigation: Use webhooks or scheduled sync

---

## Next Steps

### Immediate (Week 1)
1. ✅ Create `types/tech-validation.ts` (DONE)
2. ⬜ Create `lib/tech-validation-commands.tsx`
3. ⬜ Create `components/TechValidationMetricsView.tsx`

### Short-term (Week 2-3)
4. ⬜ Add TV stage badge to POVManagement component
5. ⬜ Implement `tv` terminal commands
6. ⬜ Create readout generator using existing BVF data

### Medium-term (Week 4-6)
7. ⬜ Add Asana integration (`lib/asana-integration.ts`)
8. ⬜ Add playbook scenario mapping UI
9. ⬜ Create TV metrics dashboard component

### Long-term (Week 7-8)
10. ⬜ Add optional stage history tracking (audit trail)
11. ⬜ Create automated readout generation workflow
12. ⬜ Add MITRE dashboard export integration

---

## File Structure

```
hosting/
├── types/
│   ├── tech-validation.ts              ✅ CREATED (lightweight types)
│   ├── business-value-framework.ts      (existing, source of metrics)
│   └── trr.ts                           (existing)
├── lib/
│   ├── tech-validation-commands.tsx     ⬜ TODO (aggregates existing data)
│   ├── scenario-types.ts                (existing, source of scenarios)
│   └── scenario-pov-map.ts              (existing, playbook mapping)
├── components/
│   ├── TechValidationMetricsView.tsx    ⬜ TODO (computed view)
│   ├── POVManagement.tsx                (existing, add TV badge)
│   └── shared/
│       └── BusinessValueCard.tsx        (existing, reuse for metrics)
└── contexts/
    └── AppStateContext.tsx              (existing, POV source of truth)
```

---

## Conclusion

This implementation provides **full Tech Validation playbook integration** without duplicating metrics or creating parallel data structures. It's a **view layer** that aggregates and computes from existing data sources, making it lightweight, maintainable, and backward-compatible.

The playbook scenarios (Gambit, Turla, CDR) map directly to existing scenario types, and all metrics derive from the existing Business Value Framework. This approach respects the principle: **"Metrics should be derivative from underlying platform metrics."**
