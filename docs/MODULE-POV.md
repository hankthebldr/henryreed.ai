# POV Management Module

## Overview

The POV (Proof of Value) Management module orchestrates security assessment projects from initiation to completion. It integrates with scenarios, provides project tracking, timeline management, and generates comprehensive reports for stakeholders.

## Architecture

```mermaid
graph TD
    USER[User] --> POV_CMD[pov commands]
    POV_CMD --> POV_SRV[POVService]
    
    POV_SRV --> POV_STORE[POVStore]
    POV_SRV --> SCENARIO_ENG[ScenarioEngine]
    POV_SRV --> POV_TEMPL[POVTemplates]
    
    POV_STORE --> LOCAL[localStorage]
    POV_STORE --> FIRESTORE[Firestore (optional)]
    
    SCENARIO_ENG --> POV_MAP[scenario-pov-map.ts]
    POV_MAP --> DYNAMIC_INT[Dynamic Integration]
    
    POV_SRV --> REPORT_GEN[ReportGenerator]
    REPORT_GEN --> MOCK{Integration Mode}
    
    MOCK -->|Mock Mode| CLIENT_DL[Client Download]
    MOCK -->|Real Mode| STORAGE[Firebase Storage]
    
    subgraph "POV Lifecycle"
        INIT[Initialize POV]
        PLAN[Planning Phase]
        EXEC[Execution Phase]
        VALID[Validation Phase]
        REPORT[Reporting Phase]
        COMPLETE[Completion]
    end
    
    POV_SRV --> INIT
    INIT --> PLAN
    PLAN --> EXEC
    EXEC --> VALID
    VALID --> REPORT
    REPORT --> COMPLETE
    
    subgraph "Report Types"
        EXEC_RPT[Executive Summary]
        TECH_RPT[Technical Report]
        TIMELINE[Timeline View]
        METRICS[KPI Dashboard]
    end
    
    REPORT_GEN --> EXEC_RPT
    REPORT_GEN --> TECH_RPT
    REPORT_GEN --> TIMELINE
    REPORT_GEN --> METRICS
```

## Module Structure

```
hosting/lib/pov/
├── index.ts                     # Public API exports
├── pov.service.ts              # Core POV orchestration service
├── pov.types.ts                # TypeScript interfaces and types
├── pov.store.ts                # Persistent state management
├── pov.ui.tsx                  # React components for POV display
├── pov.timeline.ts             # Timeline calculation and management
├── templates/
│   ├── technical-deep-dive.ts  # Technical assessment template
│   ├── executive-overview.ts   # Executive-focused template
│   ├── compliance-audit.ts     # Compliance assessment template
│   └── incident-simulation.ts  # Incident response template
├── reports/
│   ├── report-generator.ts     # Report generation engine
│   ├── executive-report.tsx    # Executive summary components
│   ├── technical-report.tsx    # Technical detail components
│   └── timeline-report.tsx     # Timeline visualization
└── commands/
    └── pov-commands.tsx         # Command definitions
```

## Type Definitions

```typescript
// hosting/lib/pov/pov.types.ts

export interface POVProject {
  id: string;
  name: string;
  customerName: string;
  description: string;
  template: POVTemplate;
  status: POVStatus;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  
  // Project configuration
  scope: POVScope;
  objectives: string[];
  successCriteria: string[];
  
  // Scenario integration
  scenarios: POVScenario[];
  currentScenario?: string;
  
  // Timeline and progress
  phases: POVPhase[];
  currentPhase: POVPhaseType;
  progress: POVProgress;
  
  // Stakeholders and context
  stakeholders: POVStakeholder[];
  customerProfile: CustomerProfile;
  
  // Results and metrics
  results: POVResult[];
  kpis: POVMetric[];
  
  // Reporting
  reports: POVReport[];
  deliverables: POVDeliverable[];
}

export interface POVScenario {
  scenarioKey: string;
  scenarioName: string;
  provider: string;
  status: 'planned' | 'in-progress' | 'completed' | 'blocked';
  addedAt: string;
  completedAt?: string;
  results?: ScenarioResult;
  integrationCommands: string[];
}

export interface POVPhase {
  type: POVPhaseType;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  tasks: POVTask[];
  deliverables: string[];
  dependencies: string[];
}

export interface POVTask {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  completedAt?: string;
  dependencies: string[];
  scenarioKey?: string;
}

export interface POVResult {
  id: string;
  timestamp: string;
  phase: POVPhaseType;
  scenarioKey?: string;
  type: 'security-finding' | 'performance-metric' | 'compliance-gap' | 'recommendation';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  evidence: string[];
  remediation?: string;
  businessImpact: string;
}

export interface POVMetric {
  id: string;
  name: string;
  category: MetricCategory;
  value: number;
  unit: string;
  target?: number;
  timestamp: string;
  scenarioKey?: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface POVReport {
  id: string;
  type: ReportType;
  format: ReportFormat;
  generatedAt: string;
  title: string;
  summary: string;
  filePath?: string;
  downloadUrl?: string;
  recipients: string[];
}

export type POVStatus = 
  | 'draft' 
  | 'planned' 
  | 'in-progress' 
  | 'validation' 
  | 'reporting' 
  | 'completed' 
  | 'cancelled';

export type POVPhaseType = 
  | 'initiation'
  | 'planning' 
  | 'execution' 
  | 'validation' 
  | 'reporting' 
  | 'closure';

export type POVTemplate = 
  | 'technical-deep-dive'
  | 'executive-overview'
  | 'compliance-audit'
  | 'incident-simulation'
  | 'custom';

export type TaskStatus = 
  | 'todo' 
  | 'in-progress' 
  | 'blocked' 
  | 'completed' 
  | 'cancelled';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type ReportType = 
  | 'executive-summary'
  | 'technical-detailed'
  | 'timeline-view'
  | 'kpi-dashboard'
  | 'scenario-results'
  | 'compliance-matrix';

export type ReportFormat = 'pdf' | 'html' | 'markdown' | 'json';

export type MetricCategory = 
  | 'security-posture'
  | 'threat-detection'
  | 'incident-response'
  | 'compliance-score'
  | 'performance';

export interface POVScope {
  domains: SecurityDomain[];
  providers: string[];
  environments: string[];
  timeframe: {
    start: string;
    end: string;
    totalDays: number;
  };
  constraints: string[];
  exclusions: string[];
}

export interface POVStakeholder {
  name: string;
  role: string;
  email: string;
  responsibilities: string[];
  availabilityLevel: 'high' | 'medium' | 'low';
  reportingPreference: ReportType[];
}

export interface POVProgress {
  overallPercent: number;
  phasesCompleted: number;
  totalPhases: number;
  scenariosCompleted: number;
  totalScenarios: number;
  tasksCompleted: number;
  totalTasks: number;
  daysElapsed: number;
  daysRemaining: number;
  isOnSchedule: boolean;
}

export interface CustomerProfile {
  name: string;
  industry: string;
  size: 'startup' | 'smb' | 'mid-market' | 'enterprise';
  geography: string;
  currentSolutions: string[];
  painPoints: string[];
  complianceRequirements: string[];
  budgetRange?: string;
  decisionMakers: POVStakeholder[];
  technicalContacts: POVStakeholder[];
}

export interface POVDeliverable {
  id: string;
  name: string;
  type: 'report' | 'presentation' | 'demo' | 'documentation';
  status: 'planned' | 'in-progress' | 'completed' | 'delivered';
  dueDate: string;
  deliveryDate?: string;
  recipients: string[];
  description: string;
  filePath?: string;
}
```

## Service Implementation

```typescript
// hosting/lib/pov/pov.service.ts

import { POVStore } from './pov.store';
import { scenarioService } from '../scenario/scenario.service';
import { userActivityService } from '../services/user-activity.service';
import { POVTimelineCalculator } from './pov.timeline';
import { POVReportGenerator } from './reports/report-generator';
import { getPovIntegrationCommands } from '../scenario-pov-map';
import {
  POVProject,
  POVTemplate,
  POVScenario,
  POVPhaseType,
  POVResult,
  POVReport,
  ReportType,
  ReportFormat,
  CustomerProfile
} from './pov.types';

export class POVService {
  private store: POVStore;
  private timelineCalculator: POVTimelineCalculator;
  private reportGenerator: POVReportGenerator;

  constructor() {
    this.store = new POVStore();
    this.timelineCalculator = new POVTimelineCalculator();
    this.reportGenerator = new POVReportGenerator();
  }

  /**
   * Initialize a new POV project
   */
  async initializePOV(
    customerName: string,
    template: POVTemplate,
    options: {
      scenarios?: string[];
      description?: string;
      startDate?: string;
      durationDays?: number;
    } = {}
  ): Promise<POVProject> {
    const povId = this.generatePOVId();
    
    // Load template configuration
    const templateConfig = await this.loadTemplate(template);
    
    // Calculate timeline
    const timeline = this.timelineCalculator.calculateTimeline(
      options.startDate || new Date().toISOString(),
      options.durationDays || templateConfig.defaultDuration
    );

    // Initialize project
    const pov: POVProject = {
      id: povId,
      name: `${customerName} Security Assessment`,
      customerName,
      description: options.description || templateConfig.description,
      template,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startDate: timeline.startDate,
      expectedEndDate: timeline.endDate,
      
      scope: templateConfig.scope,
      objectives: templateConfig.objectives,
      successCriteria: templateConfig.successCriteria,
      
      scenarios: [],
      phases: timeline.phases,
      currentPhase: 'initiation',
      progress: this.calculateProgress([]),
      
      stakeholders: [],
      customerProfile: {
        name: customerName,
        industry: 'Unknown',
        size: 'smb',
        geography: 'Unknown',
        currentSolutions: [],
        painPoints: [],
        complianceRequirements: [],
        decisionMakers: [],
        technicalContacts: []
      },
      
      results: [],
      kpis: [],
      reports: [],
      deliverables: templateConfig.deliverables
    };

    // Add initial scenarios if provided
    if (options.scenarios?.length) {
      for (const scenarioKey of options.scenarios) {
        await this.addScenarioToPOV(povId, scenarioKey);
      }
    }

    // Save project
    this.store.savePOV(pov);
    
    // Track POV creation
    await userActivityService.track({
      event: 'pov-initialized',
      source: 'pov-management',
      payload: {
        povId,
        customerName,
        template,
        scenarioCount: options.scenarios?.length || 0
      }
    });

    return pov;
  }

  /**
   * Add a scenario to an existing POV
   */
  async addScenarioToPOV(povId: string, scenarioKey: string): Promise<POVProject> {
    const pov = this.store.getPOV(povId);
    if (!pov) {
      throw new Error('POV project not found');
    }

    // Check if scenario already exists
    if (pov.scenarios.find(s => s.scenarioKey === scenarioKey)) {
      throw new Error('Scenario already added to POV');
    }

    // Get scenario information
    const scenarioInfo = await scenarioService.getScenarioInfo(scenarioKey);
    if (!scenarioInfo) {
      throw new Error('Scenario not found');
    }

    // Create POV scenario entry
    const povScenario: POVScenario = {
      scenarioKey,
      scenarioName: scenarioInfo.name,
      provider: scenarioInfo.provider,
      status: 'planned',
      addedAt: new Date().toISOString(),
      integrationCommands: getPovIntegrationCommands({
        scenarioKey,
        provider: scenarioInfo.provider,
        hasActivePov: true,
        customerName: pov.customerName
      })
    };

    // Add scenario to POV
    pov.scenarios.push(povScenario);
    pov.updatedAt = new Date().toISOString();
    
    // Update progress calculation
    pov.progress = this.calculateProgress(pov.scenarios);
    
    // Save updated POV
    this.store.updatePOV(pov);
    
    // Track scenario addition
    await userActivityService.track({
      event: 'pov-scenario-added',
      source: 'pov-management',
      payload: { povId, scenarioKey, provider: scenarioInfo.provider }
    });

    return pov;
  }

  /**
   * Update POV status and phase
   */
  async updatePOVStatus(povId: string, phase: POVPhaseType): Promise<POVProject> {
    const pov = this.store.getPOV(povId);
    if (!pov) {
      throw new Error('POV project not found');
    }

    const previousPhase = pov.currentPhase;
    pov.currentPhase = phase;
    pov.updatedAt = new Date().toISOString();

    // Update status based on phase
    const statusMap: Record<POVPhaseType, POVStatus> = {
      'initiation': 'planned',
      'planning': 'planned',
      'execution': 'in-progress',
      'validation': 'validation',
      'reporting': 'reporting',
      'closure': 'completed'
    };
    
    pov.status = statusMap[phase];

    // Mark previous phase as completed
    const phaseToComplete = pov.phases.find(p => p.type === previousPhase);
    if (phaseToComplete && phaseToComplete.status !== 'completed') {
      phaseToComplete.status = 'completed';
      phaseToComplete.endDate = new Date().toISOString();
    }

    // Start new phase
    const newPhase = pov.phases.find(p => p.type === phase);
    if (newPhase && newPhase.status === 'not-started') {
      newPhase.status = 'in-progress';
      newPhase.startDate = new Date().toISOString();
    }

    // Update progress
    pov.progress = this.calculateProgress(pov.scenarios, pov.phases);

    this.store.updatePOV(pov);
    
    await userActivityService.track({
      event: 'pov-phase-changed',
      source: 'pov-management',
      payload: { povId, previousPhase, newPhase: phase }
    });

    return pov;
  }

  /**
   * Add result to POV
   */
  async addResult(povId: string, result: Omit<POVResult, 'id' | 'timestamp'>): Promise<POVProject> {
    const pov = this.store.getPOV(povId);
    if (!pov) {
      throw new Error('POV project not found');
    }

    const povResult: POVResult = {
      ...result,
      id: `result-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    pov.results.push(povResult);
    pov.updatedAt = new Date().toISOString();

    this.store.updatePOV(pov);
    
    await userActivityService.track({
      event: 'pov-result-added',
      source: 'pov-management',
      payload: { povId, resultType: result.type, severity: result.severity }
    });

    return pov;
  }

  /**
   * Generate POV report
   */
  async generateReport(
    povId: string,
    type: ReportType,
    format: ReportFormat = 'pdf'
  ): Promise<POVReport> {
    const pov = this.store.getPOV(povId);
    if (!pov) {
      throw new Error('POV project not found');
    }

    try {
      const report = await this.reportGenerator.generateReport(pov, type, format);
      
      // Add report to POV
      pov.reports.push(report);
      pov.updatedAt = new Date().toISOString();
      this.store.updatePOV(pov);
      
      await userActivityService.track({
        event: 'pov-report-generated',
        source: 'pov-management',
        payload: { povId, reportType: type, format }
      });

      return report;
    } catch (error) {
      console.error('Report generation failed:', error);
      
      // Return mock report for static mode
      const mockReport: POVReport = {
        id: `report-${Date.now()}`,
        type,
        format,
        generatedAt: new Date().toISOString(),
        title: `${this.getReportTypeTitle(type)} - ${pov.customerName}`,
        summary: 'Report generated in mock mode - full functionality requires backend integration',
        recipients: pov.stakeholders.map(s => s.email).filter(Boolean)
      };

      pov.reports.push(mockReport);
      this.store.updatePOV(pov);
      
      return mockReport;
    }
  }

  /**
   * Get POV status with detailed information
   */
  async getPOVStatus(povId?: string, detailed: boolean = false): Promise<POVProject | POVProject[]> {
    if (povId) {
      const pov = this.store.getPOV(povId);
      if (!pov) {
        throw new Error('POV project not found');
      }
      
      // Update progress calculation
      pov.progress = this.calculateProgress(pov.scenarios, pov.phases);
      return pov;
    }

    // Return all active POVs
    const activePOVs = this.store.getActivePOVs();
    
    if (detailed) {
      // Update progress for all POVs
      activePOVs.forEach(pov => {
        pov.progress = this.calculateProgress(pov.scenarios, pov.phases);
      });
    }

    return activePOVs;
  }

  /**
   * Complete POV project
   */
  async completePOV(povId: string): Promise<POVProject> {
    const pov = await this.updatePOVStatus(povId, 'closure');
    pov.status = 'completed';
    pov.actualEndDate = new Date().toISOString();

    this.store.updatePOV(pov);
    
    await userActivityService.track({
      event: 'pov-completed',
      source: 'pov-management',
      payload: {
        povId,
        duration: Date.now() - new Date(pov.startDate).getTime(),
        scenarioCount: pov.scenarios.length,
        resultCount: pov.results.length
      }
    });

    return pov;
  }

  /**
   * Get current active POV
   */
  getCurrentPOV(): POVProject | null {
    const activePOVs = this.store.getActivePOVs();
    return activePOVs.length > 0 ? activePOVs[0] : null;
  }

  /**
   * Calculate progress metrics
   */
  private calculateProgress(scenarios: POVScenario[], phases?: POVPhase[]): POVProgress {
    const completedScenarios = scenarios.filter(s => s.status === 'completed').length;
    const completedPhases = phases?.filter(p => p.status === 'completed').length || 0;
    const totalPhases = phases?.length || 6;
    
    // Calculate task completion if phases are available
    let completedTasks = 0;
    let totalTasks = 0;
    
    if (phases) {
      for (const phase of phases) {
        totalTasks += phase.tasks.length;
        completedTasks += phase.tasks.filter(t => t.status === 'completed').length;
      }
    }

    // Calculate time progress
    const now = Date.now();
    const startDate = new Date().getTime(); // Would be actual POV start date
    const endDate = startDate + (30 * 24 * 60 * 60 * 1000); // 30 days default
    
    const daysElapsed = Math.floor((now - startDate) / (24 * 60 * 60 * 1000));
    const totalDays = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    // Overall progress calculation
    const scenarioProgress = scenarios.length > 0 ? (completedScenarios / scenarios.length) * 100 : 0;
    const phaseProgress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;
    const timeProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
    
    const overallPercent = Math.round((scenarioProgress + phaseProgress) / 2);
    const isOnSchedule = overallPercent >= timeProgress - 10; // 10% tolerance

    return {
      overallPercent,
      phasesCompleted: completedPhases,
      totalPhases,
      scenariosCompleted: completedScenarios,
      totalScenarios: scenarios.length,
      tasksCompleted: completedTasks,
      totalTasks,
      daysElapsed,
      daysRemaining,
      isOnSchedule
    };
  }

  /**
   * Load template configuration
   */
  private async loadTemplate(template: POVTemplate): Promise<any> {
    // In a real implementation, this would load template configurations
    // For now, return a basic template structure
    const templates = {
      'technical-deep-dive': {
        description: 'Comprehensive technical security assessment',
        defaultDuration: 30,
        scope: {
          domains: ['cloud-security', 'network-security', 'identity-access'],
          providers: ['gcp', 'aws', 'azure'],
          environments: ['dev', 'staging', 'prod'],
          timeframe: { totalDays: 30 },
          constraints: [],
          exclusions: []
        },
        objectives: [
          'Assess current security posture',
          'Identify critical vulnerabilities',
          'Validate detection capabilities',
          'Provide remediation roadmap'
        ],
        successCriteria: [
          'Complete security assessment across all domains',
          'Generate executive and technical reports',
          'Provide actionable recommendations',
          'Demonstrate security improvements'
        ],
        deliverables: [
          {
            id: 'exec-summary',
            name: 'Executive Summary',
            type: 'report',
            status: 'planned',
            dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
            recipients: [],
            description: 'High-level summary for executive stakeholders'
          }
        ]
      }
      // Add other templates...
    };

    return templates[template] || templates['technical-deep-dive'];
  }

  /**
   * Generate unique POV ID
   */
  private generatePOVId(): string {
    return `pov-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get report type title
   */
  private getReportTypeTitle(type: ReportType): string {
    const titles = {
      'executive-summary': 'Executive Summary',
      'technical-detailed': 'Technical Assessment Report',
      'timeline-view': 'Project Timeline',
      'kpi-dashboard': 'KPI Dashboard',
      'scenario-results': 'Scenario Results',
      'compliance-matrix': 'Compliance Matrix'
    };
    return titles[type] || 'POV Report';
  }
}

// Export singleton instance
export const povService = new POVService();
```

## Command Integration

```typescript
// hosting/lib/pov/commands/pov-commands.tsx

import React from 'react';
import { CommandConfig } from '../../types/command.types';
import { povService } from '../pov.service';
import { POVStatusOutput, POVReportOutput } from '../pov.ui';
import { extractArg } from '../../utils/command-utils';

export const povCommands: CommandConfig[] = [
  {
    name: 'pov init',
    description: 'Initialize a new POV project',
    usage: 'pov init "Customer Name" --template [template] --scenarios [list] --description [text]',
    aliases: ['pov create', 'pov new'],
    permissions: ['terminal.user_commands'],
    handler: async (args: string[]) => {
      const customerName = args[0];
      if (!customerName) {
        return (
          <div className="text-yellow-400">
            <div className="mb-2">⚠️ Customer name is required</div>
            <div className="text-sm opacity-75">
              Usage: <code>pov init "Customer Name" --template technical-deep-dive</code>
            </div>
          </div>
        );
      }

      const template = extractArg(args, '--template') as any || 'technical-deep-dive';
      const scenariosArg = extractArg(args, '--scenarios');
      const description = extractArg(args, '--description');
      
      const scenarios = scenariosArg ? scenariosArg.split(',').map(s => s.trim()) : [];

      try {
        const pov = await povService.initializePOV(customerName, template, {
          scenarios,
          description
        });

        return (
          <div className="text-green-400">
            <div className="mb-4">
              <div className="text-xl mb-2">🎯 POV Project Initialized</div>
              <div className="text-lg font-semibold">{pov.name}</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-300">Project ID:</span>
                  <span className="ml-2 text-yellow-300 font-mono">{pov.id}</span>
                </div>
                <div>
                  <span className="text-blue-300">Template:</span>
                  <span className="ml-2">{pov.template}</span>
                </div>
                <div>
                  <span className="text-blue-300">Start Date:</span>
                  <span className="ml-2">{new Date(pov.startDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-blue-300">Expected End:</span>
                  <span className="ml-2">{new Date(pov.expectedEndDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {pov.scenarios.length > 0 && (
              <div className="mb-4">
                <div className="text-blue-300 mb-2">📋 Initial Scenarios ({pov.scenarios.length}):</div>
                {pov.scenarios.map((scenario, idx) => (
                  <div key={idx} className="text-sm text-gray-300 ml-4">
                    • {scenario.scenarioName} ({scenario.provider})
                  </div>
                ))}
              </div>
            )}

            <div className="text-sm text-gray-400">
              💡 Next steps: <code>pov status --detailed</code> or <code>pov add-scenario --scenario [name]</code>
            </div>
          </div>
        );
      } catch (error) {
        return (
          <div className="text-red-400">
            <div className="mb-2">❌ Failed to initialize POV project</div>
            <div className="text-sm opacity-75">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </div>
          </div>
        );
      }
    }
  },

  {
    name: 'pov add-scenario',
    description: 'Add a security scenario to the current POV',
    usage: 'pov add-scenario --scenario [scenario-key] --pov [pov-id]',
    permissions: ['terminal.user_commands'],
    handler: async (args: string[]) => {
      const scenarioKey = extractArg(args, '--scenario');
      const povId = extractArg(args, '--pov');

      if (!scenarioKey) {
        return (
          <div className="text-yellow-400">
            <div className="mb-2">⚠️ Scenario key is required</div>
            <div className="text-sm opacity-75">
              Usage: <code>pov add-scenario --scenario ransomware</code>
            </div>
          </div>
        );
      }

      try {
        // Use current POV if no POV ID specified
        let targetPovId = povId;
        if (!targetPovId) {
          const currentPov = povService.getCurrentPOV();
          if (!currentPov) {
            throw new Error('No active POV found. Initialize a POV first with: pov init "Customer Name"');
          }
          targetPovId = currentPov.id;
        }

        const updatedPov = await povService.addScenarioToPOV(targetPovId, scenarioKey);
        const addedScenario = updatedPov.scenarios.find(s => s.scenarioKey === scenarioKey);

        return (
          <div className="text-green-400">
            <div className="mb-3">✅ Scenario added to POV</div>
            
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <div className="text-white font-medium mb-2">{addedScenario!.scenarioName}</div>
              <div className="text-sm text-gray-300 grid grid-cols-2 gap-2">
                <div><span className="text-blue-300">Provider:</span> {addedScenario!.provider}</div>
                <div><span className="text-blue-300">Status:</span> {addedScenario!.status}</div>
              </div>
            </div>

            <div className="text-sm text-blue-300 mb-2">
              🔗 Integration Commands Available:
            </div>
            {addedScenario!.integrationCommands.map((cmd, idx) => (
              <div key={idx} className="text-xs text-gray-400 ml-4 font-mono">
                {cmd}
              </div>
            ))}

            <div className="text-sm text-gray-400 mt-3">
              📊 Progress: {updatedPov.scenarios.length} scenarios total
            </div>
          </div>
        );
      } catch (error) {
        return (
          <div className="text-red-400">
            <div className="mb-2">❌ Failed to add scenario to POV</div>
            <div className="text-sm opacity-75">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </div>
          </div>
        );
      }
    }
  },

  {
    name: 'pov status',
    description: 'Show POV project status and progress',
    usage: 'pov status [--pov pov-id] [--current] [--detailed]',
    permissions: ['terminal.user_commands'],
    handler: async (args: string[]) => {
      const povId = extractArg(args, '--pov');
      const current = args.includes('--current');
      const detailed = args.includes('--detailed');

      try {
        if (current || povId) {
          const targetId = povId || povService.getCurrentPOV()?.id;
          if (!targetId) {
            return (
              <div className="text-yellow-400">
                ⚠️ No active POV found. Initialize one with: <code>pov init "Customer Name"</code>
              </div>
            );
          }

          const pov = await povService.getPOVStatus(targetId, detailed) as POVProject;
          return <POVStatusOutput pov={pov} detailed={detailed} />;
        } else {
          const povs = await povService.getPOVStatus(undefined, detailed) as POVProject[];
          if (povs.length === 0) {
            return (
              <div className="text-blue-300">
                <div className="mb-2">📋 No active POV projects</div>
                <div className="text-sm opacity-75">
                  Start a new POV with: <code>pov init "Customer Name"</code>
                </div>
              </div>
            );
          }

          return (
            <div className="text-blue-300">
              <div className="mb-3">📋 Active POV Projects ({povs.length})</div>
              {povs.map((pov, idx) => (
                <POVStatusOutput key={pov.id} pov={pov} detailed={detailed} compact={povs.length > 1} />
              ))}
            </div>
          );
        }
      } catch (error) {
        return (
          <div className="text-red-400">
            ❌ Failed to retrieve POV status: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        );
      }
    }
  },

  {
    name: 'pov report',
    description: 'Generate POV assessment report',
    usage: 'pov report --format [executive|technical|timeline|kpi] --export [pdf|md|html]',
    permissions: ['terminal.user_commands'],
    handler: async (args: string[]) => {
      const format = extractArg(args, '--format') as any || 'executive-summary';
      const exportFormat = extractArg(args, '--export') as any || 'pdf';
      const povId = extractArg(args, '--pov');

      try {
        // Use current POV if no POV ID specified
        let targetPovId = povId;
        if (!targetPovId) {
          const currentPov = povService.getCurrentPOV();
          if (!currentPov) {
            throw new Error('No active POV found. Initialize a POV first.');
          }
          targetPovId = currentPov.id;
        }

        const report = await povService.generateReport(targetPovId, format, exportFormat);
        
        return <POVReportOutput report={report} />;
      } catch (error) {
        return (
          <div className="text-red-400">
            <div className="mb-2">❌ Failed to generate POV report</div>
            <div className="text-sm opacity-75">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </div>
          </div>
        );
      }
    }
  },

  {
    name: 'pov complete',
    description: 'Mark POV project as completed',
    usage: 'pov complete [--pov pov-id]',
    permissions: ['terminal.user_commands'],
    handler: async (args: string[]) => {
      const povId = extractArg(args, '--pov');

      try {
        let targetPovId = povId;
        if (!targetPovId) {
          const currentPov = povService.getCurrentPOV();
          if (!currentPov) {
            throw new Error('No active POV found');
          }
          targetPovId = currentPov.id;
        }

        const completedPov = await povService.completePOV(targetPovId);
        
        return (
          <div className="text-green-400">
            <div className="mb-4">
              <div className="text-xl">🎉 POV Project Completed!</div>
              <div className="text-lg font-semibold">{completedPov.name}</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-300">Duration:</span>
                  <span className="ml-2">
                    {Math.ceil(
                      (new Date(completedPov.actualEndDate!).getTime() - 
                       new Date(completedPov.startDate).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )} days
                  </span>
                </div>
                <div>
                  <span className="text-blue-300">Scenarios:</span>
                  <span className="ml-2">{completedPov.scenarios.length}</span>
                </div>
                <div>
                  <span className="text-blue-300">Results:</span>
                  <span className="ml-2">{completedPov.results.length}</span>
                </div>
                <div>
                  <span className="text-blue-300">Reports:</span>
                  <span className="ml-2">{completedPov.reports.length}</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              💡 Generate final reports with: <code>pov report --format executive</code>
            </div>
          </div>
        );
      } catch (error) {
        return (
          <div className="text-red-400">
            ❌ Failed to complete POV: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        );
      }
    }
  }
];
```

## React Components

```typescript
// hosting/lib/pov/pov.ui.tsx

import React from 'react';
import { POVProject, POVReport, POVProgress } from './pov.types';
import { useCommandExecutor } from '../../hooks/useCommandExecutor';

interface POVStatusOutputProps {
  pov: POVProject;
  detailed?: boolean;
  compact?: boolean;
}

export const POVStatusOutput: React.FC<POVStatusOutputProps> = ({ pov, detailed, compact }) => {
  const { run: executeCommand } = useCommandExecutor();

  const getStatusColor = (status: string) => {
    const colors = {
      'draft': 'text-gray-400',
      'planned': 'text-blue-400',
      'in-progress': 'text-yellow-400',
      'validation': 'text-purple-400',
      'reporting': 'text-orange-400',
      'completed': 'text-green-400',
      'cancelled': 'text-red-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const ProgressBar: React.FC<{ progress: POVProgress }> = ({ progress }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>Overall Progress</span>
        <span>{progress.overallPercent}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${progress.isOnSchedule ? 'bg-green-500' : 'bg-yellow-500'}`}
          style={{ width: `${progress.overallPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{progress.scenariosCompleted}/{progress.totalScenarios} scenarios</span>
        <span>{progress.daysRemaining} days remaining</span>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="border-l-2 border-blue-500 pl-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium">{pov.name}</span>
          <span className={`text-sm ${getStatusColor(pov.status)}`}>
            {pov.status}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          {pov.scenarios.length} scenarios • {pov.progress.overallPercent}% complete
        </div>
      </div>
    );
  }

  return (
    <div className="pov-status-output mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🎯</span>
        <div>
          <div className="text-xl font-bold text-white">{pov.name}</div>
          <div className="flex items-center gap-4 text-sm">
            <span className={getStatusColor(pov.status)}>{pov.status}</span>
            <span className="text-gray-400">{pov.template}</span>
            <span className="text-gray-400">Phase: {pov.currentPhase}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar progress={pov.progress} />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-400">{pov.scenarios.length}</div>
          <div className="text-sm text-gray-300">Scenarios</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-400">{pov.results.length}</div>
          <div className="text-sm text-gray-300">Results</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-400">{pov.reports.length}</div>
          <div className="text-sm text-gray-300">Reports</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-400">{pov.progress.daysRemaining}</div>
          <div className="text-sm text-gray-300">Days Left</div>
        </div>
      </div>

      {/* Scenarios */}
      {pov.scenarios.length > 0 && (
        <div className="mb-6">
          <div className="text-lg font-medium text-blue-300 mb-3">
            📋 Scenarios ({pov.scenarios.length})
          </div>
          <div className="space-y-2">
            {pov.scenarios.map((scenario, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2">
                <div>
                  <span className="text-white">{scenario.scenarioName}</span>
                  <span className="text-gray-400 ml-2">({scenario.provider})</span>
                </div>
                <span className={`text-sm ${getStatusColor(scenario.status)}`}>
                  {scenario.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Results */}
      {detailed && pov.results.length > 0 && (
        <div className="mb-6">
          <div className="text-lg font-medium text-yellow-300 mb-3">
            🔍 Recent Results ({pov.results.length})
          </div>
          <div className="space-y-2">
            {pov.results.slice(-3).map((result, idx) => (
              <div key={idx} className="bg-gray-800 rounded px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm">{result.title}</span>
                  <span className={`text-xs ${
                    result.severity === 'critical' ? 'text-red-400' :
                    result.severity === 'high' ? 'text-orange-400' :
                    result.severity === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {result.severity}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{result.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 text-sm">
        <button
          onClick={() => executeCommand('pov add-scenario --scenario')}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
        >
          ➕ Add Scenario
        </button>
        
        <button
          onClick={() => executeCommand('pov report --format executive')}
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition-colors"
        >
          📊 Generate Report
        </button>
        
        {pov.status !== 'completed' && (
          <button
            onClick={() => executeCommand('pov complete')}
            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded transition-colors"
          >
            ✅ Complete POV
          </button>
        )}
      </div>
    </div>
  );
};

interface POVReportOutputProps {
  report: POVReport;
}

export const POVReportOutput: React.FC<POVReportOutputProps> = ({ report }) => {
  return (
    <div className="pov-report-output">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📊</span>
        <div>
          <div className="text-xl font-bold text-green-400">Report Generated</div>
          <div className="text-gray-400">{report.title}</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-300">Type:</span>
            <span className="ml-2">{report.type}</span>
          </div>
          <div>
            <span className="text-blue-300">Format:</span>
            <span className="ml-2">{report.format}</span>
          </div>
          <div>
            <span className="text-blue-300">Generated:</span>
            <span className="ml-2">{new Date(report.generatedAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-blue-300">Recipients:</span>
            <span className="ml-2">{report.recipients.length || 'None specified'}</span>
          </div>
        </div>
      </div>

      <div className="text-white bg-gray-800 rounded-lg p-4 mb-4">
        <div className="font-medium mb-2">Summary:</div>
        <div className="text-gray-300">{report.summary}</div>
      </div>

      {report.downloadUrl && (
        <div className="text-sm">
          <a 
            href={report.downloadUrl} 
            className="text-blue-400 hover:text-blue-300 underline"
            target="_blank" 
            rel="noopener noreferrer"
          >
            📥 Download Report
          </a>
        </div>
      )}
    </div>
  );
};
```

## Integration Points

### Scenario Integration
- Uses `scenario-pov-map.ts` for dynamic command generation
- Automatically suggests relevant commands when scenarios are added
- Tracks scenario completion status within POV context

### Reporting System  
- Mock mode: Client-side report generation and download
- Real mode: Server-side report generation with Firebase Storage
- Multiple formats: PDF, HTML, Markdown, JSON

### Storage Strategy
- Primary: localStorage for immediate access
- Optional: Firestore sync for persistence and collaboration
- Graceful fallback when Firestore is unavailable

## Usage Examples

```bash
# Initialize new POV with scenarios
pov init "Acme Corp" --template technical-deep-dive --scenarios "ransomware,cloud-posture"

# Add additional scenario to current POV
pov add-scenario --scenario network-segmentation

# Check current POV status
pov status --current --detailed

# Generate executive summary report
pov report --format executive --export pdf

# Complete the POV project
pov complete
```

## Testing Strategy

### Unit Tests
- POV lifecycle management
- Progress calculations
- Report generation (mock mode)

### Integration Tests  
- Scenario integration workflows
- Command execution and state updates
- Storage synchronization

### E2E Tests
- Complete POV workflows from initialization to completion
- Report generation and download
- Multi-scenario POV management

This POV Management module provides comprehensive project orchestration while maintaining the mock-first approach for maximum compatibility with the hosting-only deployment model.