'use client';

import React, { useState } from 'react';
import CortexButton from './CortexButton';
import { StatusBadge } from './shared';
import {
  Workshop,
  DCWorkshopProgress,
  XSIAM_PLAYBOOK_WORKSHOP,
  calculateWorkshopCompletion,
  getNextModule,
  isReadyForCertification,
} from '../types/workshop';

// Sample DC Workshop Progress Data
const SAMPLE_DC_PROGRESS: DCWorkshopProgress[] = [
  {
    dcId: 'DC-001',
    dcName: 'Sarah Martinez',
    dcEmail: 'smartinez@company.com',
    workshopId: 'WORKSHOP-FY26-001',
    cohortId: 'COHORT-NAM-001',
    enrollmentDate: '2025-10-01',
    status: 'in-progress',
    preWorkCompleted: true,
    lmsAccessVerified: true,
    systemAccessVerified: true,
    currentDay: 1,
    completedModules: ['D1M1'],
    deliverables: [
      {
        moduleId: 'D1M1',
        deliverableName: 'POV Proposal Deck',
        submitted: true,
        submittedDate: '2025-11-10T15:30:00Z',
        asanaLink: 'https://app.asana.com/project/dc001-pov-proposal'
      },
      {
        moduleId: 'D1M1',
        deliverableName: 'POV Test Plan',
        submitted: true,
        submittedDate: '2025-11-10T16:00:00Z'
      }
    ],
    certificationStatus: 'in-progress',
    officeHoursAttended: 0,
    povsExecutedWithPlaybook: 0,
    createdAt: '2025-10-01T09:00:00Z',
    updatedAt: '2025-11-10T16:00:00Z'
  },
  {
    dcId: 'DC-002',
    dcName: 'Michael Chen',
    dcEmail: 'mchen@company.com',
    workshopId: 'WORKSHOP-FY26-001',
    cohortId: 'COHORT-NAM-001',
    enrollmentDate: '2025-10-01',
    status: 'completed',
    preWorkCompleted: true,
    lmsAccessVerified: true,
    systemAccessVerified: true,
    currentDay: 2,
    completedModules: ['D1M1', 'D1M2', 'D2M1', 'D2M2'],
    deliverables: [
      {
        moduleId: 'D2M2',
        deliverableName: 'POV Readout Deck',
        submitted: true,
        submittedDate: '2025-11-11T17:00:00Z',
        feedback: 'Excellent work! Very compelling narrative.'
      },
      {
        moduleId: 'D2M2',
        deliverableName: 'Badass Blueprint document',
        submitted: true,
        submittedDate: '2025-11-11T17:15:00Z'
      }
    ],
    certificationStatus: 'certified',
    certificationDate: '2025-11-15',
    certificationExpiry: '2026-11-15',
    assessmentScore: 92,
    officeHoursAttended: 2,
    povsExecutedWithPlaybook: 3,
    npsScore: 9,
    feedback: 'Outstanding workshop! The hands-on scenarios were incredibly valuable.',
    createdAt: '2025-10-01T09:00:00Z',
    updatedAt: '2025-11-15T10:00:00Z'
  }
];

export const WorkshopManagement: React.FC = () => {
  const [workshop] = useState<Workshop>(XSIAM_PLAYBOOK_WORKSHOP);
  const [dcProgress, setDcProgress] = useState<DCWorkshopProgress[]>(SAMPLE_DC_PROGRESS);
  const [selectedDC, setSelectedDC] = useState<DCWorkshopProgress | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'cohorts' | 'dc-progress' | 'kpis'>('overview');

  const getCohortStatusColor = (status: string) => {
    const colors = {
      'scheduled': 'text-status-info bg-status-info/10 border-status-info/30',
      'in-progress': 'text-status-warning bg-status-warning/10 border-status-warning/30',
      'completed': 'text-status-success bg-status-success/10 border-status-success/30',
      'cancelled': 'text-cortex-text-muted bg-cortex-bg-hover border-cortex-border/40',
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const getCertificationBadgeColor = (status: string) => {
    const colors = {
      'not-started': 'text-cortex-text-muted',
      'in-progress': 'text-status-warning',
      'certified': 'text-status-success',
      'expired': 'text-status-error',
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cortex-text-primary flex items-center space-x-3">
            <span>🎓</span>
            <span>{workshop.name}</span>
          </h1>
          <p className="text-cortex-text-secondary mt-2 max-w-3xl">
            {workshop.description}
          </p>
          <div className="flex items-center space-x-4 mt-3 text-sm">
            <span className="text-cortex-text-muted">Version: <span className="text-cortex-text-primary font-medium">{workshop.version}</span></span>
            <span className="text-cortex-text-muted">Created by: <span className="text-cortex-text-primary">{workshop.createdBy}</span></span>
            <span className="text-cortex-text-muted">Updated: <span className="text-cortex-text-primary">{new Date(workshop.lastUpdatedOn).toLocaleDateString()}</span></span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <CortexButton
            onClick={() => console.log('Enroll DC')}
            variant="primary"
            icon="➕"
          >
            Enroll DC
          </CortexButton>
          <CortexButton
            onClick={() => console.log('Export Report')}
            variant="outline"
            icon="📊"
          >
            Export Report
          </CortexButton>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-cortex-bg-secondary rounded-lg p-1">
        {(['overview', 'cohorts', 'dc-progress', 'kpis'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeView === view
                ? 'bg-cortex-green text-black shadow-lg'
                : 'text-cortex-text-secondary hover:text-cortex-text-primary hover:bg-cortex-bg-hover'
            }`}
          >
            {view === 'dc-progress' ? 'DC Progress' : view === 'kpis' ? 'KPIs' : view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Workshop Goal */}
            <div className="cortex-card p-6">
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-3 flex items-center space-x-2">
                <span>🎯</span>
                <span>Workshop Goal</span>
              </h3>
              <p className="text-cortex-text-primary">{workshop.goal}</p>
            </div>

            {/* Workshop Structure */}
            <div className="cortex-card p-6">
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Workshop Structure ({workshop.duration} Days)</h3>
              <div className="space-y-6">
                {workshop.days.map((day, index) => (
                  <div key={index} className="bg-cortex-bg-secondary p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-cortex-text-primary">Day {day.day}: {day.title}</h4>
                        <p className="text-sm text-cortex-text-secondary mt-1">{day.goal}</p>
                      </div>
                      <span className="px-3 py-1 bg-cortex-bg-tertiary text-cortex-text-primary rounded text-sm">
                        {day.modules.length} Modules
                      </span>
                    </div>

                    <div className="space-y-3 mt-4">
                      {day.modules.map((module) => (
                        <div key={module.id} className="border-l-4 border-cortex-primary pl-4 py-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-cortex-text-primary">{module.name}</h5>
                              <p className="text-sm text-cortex-text-secondary mt-1">{module.description}</p>

                              <div className="flex items-center space-x-4 mt-2 text-xs text-cortex-text-muted">
                                <span>⏱️ {module.duration} min</span>
                                <span>📦 {module.deliverables.length} deliverables</span>
                                <span>🔧 {module.tools.length} tools</span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              module.type === 'theory' ? 'bg-blue-500/10 text-blue-400' :
                              module.type === 'lab' ? 'bg-green-500/10 text-green-400' :
                              module.type === 'demo' ? 'bg-purple-500/10 text-purple-400' :
                              'bg-orange-500/10 text-orange-400'
                            }`}>
                              {module.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Required */}
            <div className="cortex-card p-6">
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Required Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workshop.tools.map((tool, index) => (
                  <div key={index} className="bg-cortex-bg-secondary p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-cortex-text-primary">{tool.name}</h4>
                      {tool.accessRequired && (
                        <span className="px-2 py-0.5 bg-status-warning/10 text-status-warning text-xs rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-cortex-text-secondary">{tool.description}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-cortex-bg-tertiary text-cortex-text-muted text-xs rounded">
                      {tool.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pre-Work Resources */}
            <div className="cortex-card p-6">
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">📚 Pre-Workshop Preparation</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-cortex-text-primary mb-2">LMS Modules</h4>
                  <ul className="space-y-1">
                    {workshop.preWorkResources.lmsModules.map((module, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-cortex-text-secondary">
                        <span className="text-cortex-primary mt-0.5">•</span>
                        <span>{module}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-cortex-text-primary mb-2">Required Reading</h4>
                  <ul className="space-y-1">
                    {workshop.preWorkResources.requiredReading.map((reading, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-cortex-text-secondary">
                        <span className="text-cortex-info mt-0.5">•</span>
                        <span>{reading}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'cohorts' && (
          <div className="space-y-4">
            {workshop.cohorts.map((cohort) => (
              <div key={cohort.id} className="cortex-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-cortex-text-primary">{cohort.name}</h3>
                    <p className="text-sm text-cortex-text-secondary mt-1">
                      {new Date(cohort.date).toLocaleDateString()} • {cohort.location}
                    </p>
                  </div>
                  <StatusBadge status={cohort.status} variant="status" colorMap={{
                    [cohort.status]: getCohortStatusColor(cohort.status)
                  }} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-cortex-bg-secondary p-3 rounded">
                    <div className="text-sm text-cortex-text-secondary">Type</div>
                    <div className="text-lg font-semibold text-cortex-text-primary capitalize">{cohort.type}</div>
                  </div>
                  <div className="bg-cortex-bg-secondary p-3 rounded">
                    <div className="text-sm text-cortex-text-secondary">Enrolled</div>
                    <div className="text-lg font-semibold text-cortex-text-primary">{cohort.enrolled} / {cohort.capacity}</div>
                  </div>
                  <div className="bg-cortex-bg-secondary p-3 rounded">
                    <div className="text-sm text-cortex-text-secondary">Instructors</div>
                    <div className="text-lg font-semibold text-cortex-text-primary">{cohort.instructors.length}</div>
                  </div>
                  <div className="bg-cortex-bg-secondary p-3 rounded">
                    <div className="text-sm text-cortex-text-secondary">Facilitators</div>
                    <div className="text-lg font-semibold text-cortex-text-primary">{cohort.facilitators.length}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-cortex-bg-tertiary rounded-full h-2" style={{ width: '200px' }}>
                      <div
                        className="bg-cortex-primary h-2 rounded-full transition-all"
                        style={{ width: `${(cohort.enrolled / cohort.capacity) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-cortex-text-muted">
                      {Math.round((cohort.enrolled / cohort.capacity) * 100)}% Full
                    </span>
                  </div>

                  <CortexButton
                    onClick={() => console.log('View cohort details', cohort.id)}
                    variant="outline"
                    size="sm"
                    icon="👁️"
                  >
                    View Details
                  </CortexButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === 'dc-progress' && (
          <div className="space-y-4">
            {dcProgress.map((dc) => {
              const completion = calculateWorkshopCompletion(dc, workshop);
              const nextModule = getNextModule(dc, workshop);
              const readyForCert = isReadyForCertification(dc, workshop);

              return (
                <div key={dc.dcId} className="cortex-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-cortex-text-primary">{dc.dcName}</h3>
                      <p className="text-sm text-cortex-text-secondary">{dc.dcEmail}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-cortex-text-muted">
                        <span>Cohort: {dc.cohortId.split('-')[1]}</span>
                        <span>Enrolled: {new Date(dc.enrollmentDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <StatusBadge status={dc.status} />
                      <div className={`flex items-center space-x-2 ${getCertificationBadgeColor(dc.certificationStatus)}`}>
                        <span className="text-2xl">
                          {dc.certificationStatus === 'certified' ? '🏆' : dc.certificationStatus === 'in-progress' ? '📝' : '⏳'}
                        </span>
                        <span className="text-sm font-medium capitalize">{dc.certificationStatus.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-cortex-text-secondary">Overall Progress</span>
                      <span className="text-sm font-bold text-cortex-primary">{completion}%</span>
                    </div>
                    <div className="w-full bg-cortex-bg-tertiary rounded-full h-2">
                      <div
                        className="bg-cortex-primary h-2 rounded-full transition-all"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>

                  {/* Module Status */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-cortex-bg-secondary p-3 rounded text-center">
                      <div className="text-2xl font-bold text-cortex-primary">{dc.completedModules.length}</div>
                      <div className="text-xs text-cortex-text-muted">Modules Completed</div>
                    </div>
                    <div className="bg-cortex-bg-secondary p-3 rounded text-center">
                      <div className="text-2xl font-bold text-cortex-text-primary">{dc.currentDay}</div>
                      <div className="text-xs text-cortex-text-muted">Current Day</div>
                    </div>
                    <div className="bg-cortex-bg-secondary p-3 rounded text-center">
                      <div className="text-2xl font-bold text-status-success">{dc.deliverables.filter(d => d.submitted).length}</div>
                      <div className="text-xs text-cortex-text-muted">Deliverables Submitted</div>
                    </div>
                    <div className="bg-cortex-bg-secondary p-3 rounded text-center">
                      <div className="text-2xl font-bold text-cortex-info">{dc.povsExecutedWithPlaybook}</div>
                      <div className="text-xs text-cortex-text-muted">POVs with Playbook</div>
                    </div>
                  </div>

                  {/* Next Module */}
                  {nextModule && (
                    <div className="bg-cortex-bg-secondary p-4 rounded-lg mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-cortex-warning">⏭️</span>
                        <span className="font-semibold text-cortex-text-primary">Next Module:</span>
                        <span className="text-cortex-text-secondary">{nextModule.name}</span>
                      </div>
                      <p className="text-sm text-cortex-text-muted">{nextModule.description}</p>
                    </div>
                  )}

                  {/* Certification Status */}
                  {readyForCert && dc.certificationStatus !== 'certified' && (
                    <div className="bg-status-success/10 border border-status-success/30 p-4 rounded-lg mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">✅</span>
                        <div>
                          <h4 className="font-semibold text-status-success">Ready for Certification!</h4>
                          <p className="text-sm text-cortex-text-secondary">All requirements met. Complete the assessment to earn certification.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {dc.certificationStatus === 'certified' && (
                    <div className="bg-cortex-primary/10 border border-cortex-primary/30 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">🏆</span>
                          <div>
                            <h4 className="font-semibold text-cortex-primary">XSIAM Playbook Certified</h4>
                            <p className="text-sm text-cortex-text-secondary">
                              Score: {dc.assessmentScore}% | Valid until {new Date(dc.certificationExpiry!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-2">
                    <CortexButton
                      onClick={() => setSelectedDC(dc)}
                      variant="outline"
                      size="sm"
                      icon="👁️"
                    >
                      View Details
                    </CortexButton>
                    <CortexButton
                      onClick={() => console.log('Update progress', dc.dcId)}
                      variant="outline"
                      size="sm"
                      icon="✏️"
                    >
                      Update Progress
                    </CortexButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeView === 'kpis' && (
          <div className="space-y-6">
            {['effectiveness', 'efficiency', 'impact'].map((category) => {
              const categoryKPIs = workshop.kpis.filter(kpi => kpi.category === category);

              return (
                <div key={category} className="cortex-card p-6">
                  <h3 className="text-lg font-semibold text-cortex-text-primary mb-4 capitalize">
                    {category} KPIs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryKPIs.map((kpi, index) => (
                      <div key={index} className="bg-cortex-bg-secondary p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-cortex-text-primary">{kpi.name}</h4>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-cortex-primary">
                              {kpi.target}{kpi.unit === '%' ? '%' : ` ${kpi.unit}`}
                            </div>
                            <div className="text-xs text-cortex-text-muted">Target</div>
                          </div>
                        </div>
                        <p className="text-sm text-cortex-text-secondary">{kpi.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Milestones */}
            <div className="cortex-card p-6">
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">📅 Program Milestones</h3>
              <div className="space-y-3">
                {workshop.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-cortex-bg-secondary rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      milestone.status === 'completed' ? 'bg-status-success' :
                      milestone.status === 'in-progress' ? 'bg-status-warning' :
                      'bg-cortex-text-muted'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-cortex-text-primary">{milestone.name}</h4>
                      <p className="text-sm text-cortex-text-secondary">Owner: {milestone.owner}</p>
                    </div>
                    {milestone.dueDate && (
                      <span className="text-sm text-cortex-text-muted">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <StatusBadge status={milestone.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
