/**
 * Solution Design Workbook (SDW) Workflow Component
 * Step-by-step wizard for creating and managing SDWs within TRR workflow
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { 
  SolutionDesignWorkbook, 
  CustomerEnvironment,
  DataSourceConfiguration,
  SizingCalculations,
  TechnicalSpecifications,
  ImplementationPlan,
  SDWSection,
  sdwCalculator
} from '../lib/sdw-models';
import { dcContextStore, TRRRecord } from '../lib/dc-context-store';

interface SDWWorkflowProps {
  trrId: string;
  existingSDW?: SolutionDesignWorkbook;
  onSave: (sdw: SolutionDesignWorkbook) => Promise<void>;
  onCancel: () => void;
  readOnly?: boolean;
}

export const SDWWorkflow: React.FC<SDWWorkflowProps> = ({
  trrId,
  existingSDW,
  onSave,
  onCancel,
  readOnly = false
}) => {
  const { state, actions } = useAppState();
  const [currentStep, setCurrentStep] = useState<SDWSection>('customer');
  const [sdwData, setSDWData] = useState<Partial<SolutionDesignWorkbook>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (existingSDW) {
      setSDWData(existingSDW);
    } else {
      initializeNewSDW();
    }
  }, [existingSDW, trrId]);

  const initializeNewSDW = () => {
    const trr = dcContextStore.getTRRRecord(trrId);
    const customer = trr ? dcContextStore.getCustomerEngagement(trr.customerId) : null;
    
    setSDWData({
      id: `sdw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trrId,
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Current User',
      lastModifiedBy: 'Current User',
      status: 'draft',
      approvalWorkflow: [],
      dataSources: [],
      technicalNotes: [],
      assumptions: [],
      constraints: [],
      dependencies: [],
      attachments: [],
      references: [],
      customerEnvironment: customer ? {
        customerName: customer.name,
        industry: customer.industry,
        region: 'US-East',
        timezone: 'EST',
        totalEmployees: 1000,
        itStaff: 50,
        securityTeamSize: 5,
        onPremiseServers: 100,
        cloudProviders: ['AWS'],
        networkSegments: 10,
        remoteWorkers: 200,
        complianceFrameworks: [],
        dataResidencyRequirements: [],
        retentionPolicies: {
          logs: '1 year',
          incidents: '7 years',
          forensics: '7 years'
        }
      } : {} as CustomerEnvironment,
      validationResults: {
        isValid: false,
        errors: [],
        warnings: [],
        lastValidated: new Date().toISOString()
      },
      executiveSummary: '',
    });
  };

  const steps: Array<{ id: SDWSection; label: string; icon: string; description: string }> = [
    { id: 'customer', label: 'Customer Info', icon: '🏢', description: 'Customer environment and requirements' },
    { id: 'dataSources', label: 'Data Sources', icon: '📊', description: 'Configure data sources and integration' },
    { id: 'sizing', label: 'Sizing', icon: '📏', description: 'Calculate storage and performance requirements' },
    { id: 'technical', label: 'Technical Specs', icon: '⚙️', description: 'Technical configuration and security' },
    { id: 'implementation', label: 'Implementation', icon: '🚀', description: 'Project plan and timeline' },
    { id: 'review', label: 'Review', icon: '✅', description: 'Validate and finalize SDW' }
  ];

  const validateStep = (step: SDWSection): string[] => {
    const errors: string[] = [];
    
    switch (step) {
      case 'customer':
        if (!sdwData.customerEnvironment?.customerName) errors.push('Customer name is required');
        if (!sdwData.customerEnvironment?.industry) errors.push('Industry is required');
        break;
      case 'dataSources':
        if (!sdwData.dataSources?.length) errors.push('At least one data source is required');
        break;
      case 'sizing':
        if (!sdwData.sizingCalculations?.totalDailyIngestion) errors.push('Sizing calculations are incomplete');
        break;
      case 'technical':
        if (!sdwData.technicalSpecifications?.deploymentModel) errors.push('Deployment model is required');
        break;
      case 'implementation':
        if (!sdwData.implementationPlan?.phases?.length) errors.push('Implementation phases are required');
        break;
    }
    
    return errors;
  };

  const handleNext = () => {
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    const errors = validateStep(currentStep);
    
    if (errors.length > 0) {
      setValidationErrors({ ...validationErrors, [currentStep]: errors });
      return;
    }
    
    setValidationErrors({ ...validationErrors, [currentStep]: [] });
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Recalculate sizing if data sources changed
      if (sdwData.dataSources?.length) {
        const ingestionCalcs = sdwCalculator.calculateTotalIngestion(sdwData.dataSources);
        const storageCalcs = sdwCalculator.calculateStorageRequirements(
          ingestionCalcs, 
          sdwData.customerEnvironment?.retentionPolicies
        );
        const performanceCalcs = sdwCalculator.calculatePerformanceRequirements(
          ingestionCalcs.dailyEvents,
          10 // Default concurrent users
        );

        const sizingCalculations: SizingCalculations = {
          totalDailyIngestion: {
            events: ingestionCalcs.dailyEvents,
            sizeGB: ingestionCalcs.dailyGB
          },
          totalMonthlyIngestion: {
            events: ingestionCalcs.dailyEvents * 30,
            sizeGB: ingestionCalcs.monthlyGB
          },
          peakIngestionRate: {
            eventsPerSecond: Math.round(ingestionCalcs.dailyEvents / (24 * 60 * 60) * 3), // 3x peak
            mbPerSecond: Math.round((ingestionCalcs.dailyGB * 1024) / (24 * 60 * 60) * 3)
          },
          hotStorage: {
            period: '30 days',
            sizeGB: storageCalcs.hotGB
          },
          warmStorage: {
            period: '1 year',
            sizeGB: storageCalcs.warmGB
          },
          coldStorage: {
            period: '7 years',
            sizeGB: storageCalcs.coldGB
          },
          totalStorageGB: storageCalcs.totalGB,
          searchPerformance: {
            averageQueryTime: '< 5 seconds',
            concurrentUsers: 10,
            dashboardRefreshRate: '5 minutes'
          },
          growthProjection: {
            yearOverYearGrowth: 20,
            projectedSize3Years: storageCalcs.totalGB * 1.7
          },
          recommendedConfiguration: {
            tier: performanceCalcs.recommendedTier as any,
            specifications: performanceCalcs.specifications,
            estimatedCost: {
              monthly: performanceCalcs.recommendedTier === 'starter' ? 5000 :
                      performanceCalcs.recommendedTier === 'professional' ? 15000 : 50000,
              annual: (performanceCalcs.recommendedTier === 'starter' ? 5000 :
                      performanceCalcs.recommendedTier === 'professional' ? 15000 : 50000) * 12,
              currency: 'USD'
            }
          }
        };

        setSDWData(prev => ({
          ...prev,
          sizingCalculations,
          updatedAt: new Date().toISOString()
        }));
      }

      await onSave(sdwData as SolutionDesignWorkbook);
      actions.notify('success', 'Solution Design Workbook saved successfully');
    } catch (error) {
      console.error('Failed to save SDW:', error);
      actions.notify('error', 'Failed to save Solution Design Workbook');
    } finally {
      setIsLoading(false);
    }
  };

  const addDataSource = () => {
    const newDataSource: DataSourceConfiguration = {
      id: `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'New Data Source',
      type: 'siem',
      vendor: '',
      dailyVolume: { events: 0, size: '0', unit: 'GB' },
      peakVolume: { events: 0, multiplier: 3 },
      integrationMethod: 'api',
      protocol: 'HTTPS',
      authentication: 'api-key',
      dataTypes: [],
      sensitivityLevel: 'internal',
      realTimeRequired: true,
      batchProcessing: false,
      transformationNeeded: false,
      enrichmentRequired: false,
      status: 'planned',
      notes: ''
    };

    setSDWData(prev => ({
      ...prev,
      dataSources: [...(prev.dataSources || []), newDataSource]
    }));
  };

  const updateDataSource = (index: number, updates: Partial<DataSourceConfiguration>) => {
    setSDWData(prev => ({
      ...prev,
      dataSources: prev.dataSources?.map((ds, i) => 
        i === index ? { ...ds, ...updates } : ds
      ) || []
    }));
  };

  const removeDataSource = (index: number) => {
    setSDWData(prev => ({
      ...prev,
      dataSources: prev.dataSources?.filter((_, i) => i !== index) || []
    }));
  };

  const CustomerInfoStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/30 p-6 rounded border border-gray-600">
        <h3 className="text-lg font-bold text-white mb-4">📋 Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={sdwData.customerEnvironment?.customerName || ''}
              onChange={(e) => setSDWData(prev => ({
                ...prev,
                customerEnvironment: {
                  ...prev.customerEnvironment!,
                  customerName: e.target.value
                }
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Industry *
            </label>
            <select
              value={sdwData.customerEnvironment?.industry || ''}
              onChange={(e) => setSDWData(prev => ({
                ...prev,
                customerEnvironment: {
                  ...prev.customerEnvironment!,
                  industry: e.target.value
                }
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              disabled={readOnly}
            >
              <option value="">Select industry...</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Technology">Technology</option>
              <option value="Government">Government</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Total Employees
            </label>
            <input
              type="number"
              value={sdwData.customerEnvironment?.totalEmployees || 0}
              onChange={(e) => setSDWData(prev => ({
                ...prev,
                customerEnvironment: {
                  ...prev.customerEnvironment!,
                  totalEmployees: parseInt(e.target.value) || 0
                }
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              IT Staff
            </label>
            <input
              type="number"
              value={sdwData.customerEnvironment?.itStaff || 0}
              onChange={(e) => setSDWData(prev => ({
                ...prev,
                customerEnvironment: {
                  ...prev.customerEnvironment!,
                  itStaff: parseInt(e.target.value) || 0
                }
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800/30 p-6 rounded border border-gray-600">
        <h3 className="text-lg font-bold text-white mb-4">🏗️ Infrastructure Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              On-Premise Servers
            </label>
            <input
              type="number"
              value={sdwData.customerEnvironment?.onPremiseServers || 0}
              onChange={(e) => setSDWData(prev => ({
                ...prev,
                customerEnvironment: {
                  ...prev.customerEnvironment!,
                  onPremiseServers: parseInt(e.target.value) || 0
                }
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Network Segments
            </label>
            <input
              type="number"
              value={sdwData.customerEnvironment?.networkSegments || 0}
              onChange={(e) => setSDWData(prev => ({
                ...prev,
                customerEnvironment: {
                  ...prev.customerEnvironment!,
                  networkSegments: parseInt(e.target.value) || 0
                }
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      {validationErrors.customer?.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded">
          <h4 className="text-red-400 font-medium mb-2">Validation Errors:</h4>
          <ul className="list-disc list-inside text-red-300 text-sm">
            {validationErrors.customer.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const DataSourcesStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/30 p-6 rounded border border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">📊 Data Sources Configuration</h3>
          <button
            onClick={addDataSource}
            disabled={readOnly}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            + Add Data Source
          </button>
        </div>

        <div className="space-y-4">
          {sdwData.dataSources?.map((dataSource, index) => (
            <div key={dataSource.id} className="bg-gray-700/30 p-4 rounded border border-gray-600">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-white font-medium">Data Source #{index + 1}</h4>
                <button
                  onClick={() => removeDataSource(index)}
                  disabled={readOnly}
                  className="text-red-400 hover:text-red-300 disabled:text-gray-500"
                >
                  🗑️
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={dataSource.name}
                    onChange={(e) => updateDataSource(index, { name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={dataSource.type}
                    onChange={(e) => updateDataSource(index, { type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    disabled={readOnly}
                  >
                    <option value="siem">SIEM</option>
                    <option value="edr">EDR</option>
                    <option value="network">Network</option>
                    <option value="cloud">Cloud</option>
                    <option value="identity">Identity</option>
                    <option value="email">Email</option>
                    <option value="web">Web</option>
                    <option value="database">Database</option>
                    <option value="application">Application</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={dataSource.vendor}
                    onChange={(e) => updateDataSource(index, { vendor: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Daily Events
                  </label>
                  <input
                    type="number"
                    value={dataSource.dailyVolume.events}
                    onChange={(e) => updateDataSource(index, {
                      dailyVolume: {
                        ...dataSource.dailyVolume,
                        events: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Daily Size
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={dataSource.dailyVolume.size}
                      onChange={(e) => updateDataSource(index, {
                        dailyVolume: {
                          ...dataSource.dailyVolume,
                          size: e.target.value
                        }
                      })}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l text-white text-sm"
                      disabled={readOnly}
                    />
                    <select
                      value={dataSource.dailyVolume.unit}
                      onChange={(e) => updateDataSource(index, {
                        dailyVolume: {
                          ...dataSource.dailyVolume,
                          unit: e.target.value as any
                        }
                      })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-r text-white text-sm"
                      disabled={readOnly}
                    >
                      <option value="MB">MB</option>
                      <option value="GB">GB</option>
                      <option value="TB">TB</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Integration Method
                  </label>
                  <select
                    value={dataSource.integrationMethod}
                    onChange={(e) => updateDataSource(index, { integrationMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    disabled={readOnly}
                  >
                    <option value="api">API</option>
                    <option value="syslog">Syslog</option>
                    <option value="file">File</option>
                    <option value="database">Database</option>
                    <option value="agent">Agent</option>
                    <option value="webhook">Webhook</option>
                  </select>
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">📊 No Data Sources Configured</div>
              <div className="text-gray-500 text-sm mb-4">Add data sources to begin sizing calculations</div>
            </div>
          )}
        </div>
      </div>

      {validationErrors.dataSources?.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded">
          <h4 className="text-red-400 font-medium mb-2">Validation Errors:</h4>
          <ul className="list-disc list-inside text-red-300 text-sm">
            {validationErrors.dataSources.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const SizingStep = () => {
    // Auto-calculate sizing when data sources are available
    const ingestionCalcs = sdwData.dataSources?.length 
      ? sdwCalculator.calculateTotalIngestion(sdwData.dataSources)
      : { dailyEvents: 0, dailyGB: 0, monthlyGB: 0 };

    const storageCalcs = ingestionCalcs.dailyGB > 0 
      ? sdwCalculator.calculateStorageRequirements(ingestionCalcs, sdwData.customerEnvironment?.retentionPolicies)
      : { hotGB: 0, warmGB: 0, coldGB: 0, totalGB: 0 };

    return (
      <div className="space-y-6">
        <div className="bg-gray-800/30 p-6 rounded border border-gray-600">
          <h3 className="text-lg font-bold text-white mb-4">📏 Automated Sizing Calculations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
              <h4 className="text-blue-400 font-medium mb-2">Daily Ingestion</h4>
              <div className="text-2xl font-mono text-blue-300">{ingestionCalcs.dailyEvents.toLocaleString()}</div>
              <div className="text-sm text-gray-400">events/day</div>
              <div className="text-lg font-mono text-blue-300 mt-1">{ingestionCalcs.dailyGB} GB</div>
              <div className="text-sm text-gray-400">data/day</div>
            </div>
            
            <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
              <h4 className="text-green-400 font-medium mb-2">Monthly Volume</h4>
              <div className="text-2xl font-mono text-green-300">{ingestionCalcs.monthlyGB}</div>
              <div className="text-sm text-gray-400">GB/month</div>
            </div>
            
            <div className="bg-purple-900/20 p-4 rounded border border-purple-500/30">
              <h4 className="text-purple-400 font-medium mb-2">Total Storage (7 years)</h4>
              <div className="text-2xl font-mono text-purple-300">{storageCalcs.totalGB}</div>
              <div className="text-sm text-gray-400">GB total</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 p-6 rounded border border-gray-600">
          <h3 className="text-lg font-bold text-white mb-4">💾 Storage Breakdown</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <div>
                <div className="text-white font-medium">Hot Storage (30 days)</div>
                <div className="text-sm text-gray-400">Fast access, frequent queries</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-mono text-orange-400">{storageCalcs.hotGB} GB</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <div>
                <div className="text-white font-medium">Warm Storage (1 year)</div>
                <div className="text-sm text-gray-400">Moderate access, compliance searches</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-mono text-yellow-400">{storageCalcs.warmGB} GB</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <div>
                <div className="text-white font-medium">Cold Storage (6 years)</div>
                <div className="text-sm text-gray-400">Long-term retention, archival</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-mono text-blue-400">{storageCalcs.coldGB} GB</div>
              </div>
            </div>
          </div>
        </div>

        {ingestionCalcs.dailyEvents === 0 && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded">
            <h4 className="text-yellow-400 font-medium mb-2">⚠️ No Data Sources</h4>
            <p className="text-yellow-300 text-sm">
              Configure data sources in the previous step to see automated sizing calculations.
            </p>
          </div>
        )}
      </div>
    );
  };

  const TechnicalSpecsStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/30 p-6 rounded border border-gray-600">
        <h3 className="text-lg font-bold text-white mb-4">⚙️ Deployment Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Deployment Model *
            </label>
            <select
              value={sdwData.technicalSpecifications?.deploymentModel || ''}
              onChange={(e) => setSDWData(prev => ({
                ...prev,
                technicalSpecifications: {
                  ...prev.technicalSpecifications!,
                  deploymentModel: e.target.value as any
                }
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              disabled={readOnly}
            >
              <option value="">Select deployment model...</option>
              <option value="cloud">Cloud</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-premise">On-Premise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Architecture
            </label>
            <select
              value={sdwData.technicalSpecifications?.architecture || ''}
              onChange={(e) => setSDWData(prev => ({
                ...prev,
                technicalSpecifications: {
                  ...prev.technicalSpecifications!,
                  architecture: e.target.value as any
                }
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              disabled={readOnly}
            >
              <option value="">Select architecture...</option>
              <option value="single-tenant">Single Tenant</option>
              <option value="multi-tenant">Multi Tenant</option>
              <option value="distributed">Distributed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/30 p-6 rounded border border-gray-600">
        <h3 className="text-lg font-bold text-white mb-4">🔐 Security Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sdwData.technicalSpecifications?.securitySettings?.encryption?.inTransit || false}
                onChange={(e) => setSDWData(prev => ({
                  ...prev,
                  technicalSpecifications: {
                    ...prev.technicalSpecifications!,
                    securitySettings: {
                      ...prev.technicalSpecifications?.securitySettings!,
                      encryption: {
                        ...prev.technicalSpecifications?.securitySettings?.encryption!,
                        inTransit: e.target.checked
                      }
                    }
                  }
                }))}
                className="mr-2"
                disabled={readOnly}
              />
              <span className="text-white">Encryption in Transit</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sdwData.technicalSpecifications?.securitySettings?.encryption?.atRest || false}
                onChange={(e) => setSDWData(prev => ({
                  ...prev,
                  technicalSpecifications: {
                    ...prev.technicalSpecifications!,
                    securitySettings: {
                      ...prev.technicalSpecifications?.securitySettings!,
                      encryption: {
                        ...prev.technicalSpecifications?.securitySettings?.encryption!,
                        atRest: e.target.checked
                      }
                    }
                  }
                }))}
                className="mr-2"
                disabled={readOnly}
              />
              <span className="text-white">Encryption at Rest</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sdwData.technicalSpecifications?.securitySettings?.accessControl?.sso || false}
                onChange={(e) => setSDWData(prev => ({
                  ...prev,
                  technicalSpecifications: {
                    ...prev.technicalSpecifications!,
                    securitySettings: {
                      ...prev.technicalSpecifications?.securitySettings!,
                      accessControl: {
                        ...prev.technicalSpecifications?.securitySettings?.accessControl!,
                        sso: e.target.checked
                      }
                    }
                  }
                }))}
                className="mr-2"
                disabled={readOnly}
              />
              <span className="text-white">Single Sign-On (SSO)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sdwData.technicalSpecifications?.securitySettings?.accessControl?.mfa || false}
                onChange={(e) => setSDWData(prev => ({
                  ...prev,
                  technicalSpecifications: {
                    ...prev.technicalSpecifications!,
                    securitySettings: {
                      ...prev.technicalSpecifications?.securitySettings!,
                      accessControl: {
                        ...prev.technicalSpecifications?.securitySettings?.accessControl!,
                        mfa: e.target.checked
                      }
                    }
                  }
                }))}
                className="mr-2"
                disabled={readOnly}
              />
              <span className="text-white">Multi-Factor Authentication</span>
            </label>
          </div>
        </div>
      </div>

      {validationErrors.technical?.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded">
          <h4 className="text-red-400 font-medium mb-2">Validation Errors:</h4>
          <ul className="list-disc list-inside text-red-300 text-sm">
            {validationErrors.technical.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const ImplementationStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/30 p-6 rounded border border-gray-600">
        <h3 className="text-lg font-bold text-white mb-4">🚀 Implementation Plan</h3>
        
        <div className="space-y-4">
          {[
            { name: 'Planning & Design', duration: 14, description: 'Requirements analysis and solution design' },
            { name: 'Infrastructure Setup', duration: 10, description: 'Cloud resources and network configuration' },
            { name: 'Data Source Integration', duration: 21, description: 'Configure and test all data sources' },
            { name: 'Security Configuration', duration: 7, description: 'Implement security controls and access policies' },
            { name: 'Testing & Validation', duration: 14, description: 'End-to-end testing and performance validation' },
            { name: 'Go-Live & Handover', duration: 5, description: 'Production deployment and knowledge transfer' }
          ].map((phase, index) => (
            <div key={index} className="p-4 bg-gray-700/30 rounded border border-gray-600">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-medium">{phase.name}</h4>
                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-sm">
                  {phase.duration} days
                </span>
              </div>
              <p className="text-gray-400 text-sm">{phase.description}</p>
              <div className="mt-2 bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-green-900/20 rounded border border-green-500/30">
          <h4 className="text-green-400 font-medium mb-2">📅 Total Project Duration</h4>
          <div className="text-2xl font-mono text-green-300">71 days</div>
          <div className="text-sm text-gray-400 mt-1">Approximately 10 weeks</div>
        </div>
      </div>
    </div>
  );

  const ReviewStep = () => {
    const recommendations = sdwData.dataSources?.length 
      ? sdwCalculator.generateRecommendations(sdwData as SolutionDesignWorkbook)
      : [];

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-6 rounded border border-green-500/30">
          <h3 className="text-lg font-bold text-green-400 mb-4">✅ SDW Review Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">Customer Information</h4>
              <div className="text-sm text-gray-300">
                <div>• {sdwData.customerEnvironment?.customerName || 'Not specified'}</div>
                <div>• {sdwData.customerEnvironment?.industry || 'Industry not specified'}</div>
                <div>• {sdwData.customerEnvironment?.totalEmployees || 0} employees</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Data Sources</h4>
              <div className="text-sm text-gray-300">
                <div>• {sdwData.dataSources?.length || 0} configured sources</div>
                <div>• {sdwData.dataSources?.reduce((sum, ds) => sum + ds.dailyVolume.events, 0).toLocaleString() || 0} events/day</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Storage Requirements</h4>
              <div className="text-sm text-gray-300">
                <div>• {sdwData.sizingCalculations?.totalStorageGB || 0} GB total</div>
                <div>• {sdwData.sizingCalculations?.recommendedConfiguration?.tier || 'Not calculated'} tier</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Deployment</h4>
              <div className="text-sm text-gray-300">
                <div>• {sdwData.technicalSpecifications?.deploymentModel || 'Not specified'} deployment</div>
                <div>• {sdwData.technicalSpecifications?.architecture || 'Not specified'} architecture</div>
              </div>
            </div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="bg-yellow-900/20 p-6 rounded border border-yellow-500/30">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">💡 Recommendations</h3>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-yellow-300 text-sm">• {rec}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-gray-800/30 p-6 rounded border border-gray-600">
          <h3 className="text-lg font-bold text-white mb-4">📄 Executive Summary</h3>
          <textarea
            value={sdwData.executiveSummary || ''}
            onChange={(e) => setSDWData(prev => ({ ...prev, executiveSummary: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            placeholder="Enter executive summary of the solution design..."
            disabled={readOnly}
          />
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'customer':
        return <CustomerInfoStep />;
      case 'dataSources':
        return <DataSourcesStep />;
      case 'sizing':
        return <SizingStep />;
      case 'technical':
        return <TechnicalSpecsStep />;
      case 'implementation':
        return <ImplementationStep />;
      case 'review':
        return <ReviewStep />;
      default:
        return <CustomerInfoStep />;
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const currentStepInfo = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            📋 Solution Design Workbook
          </h1>
          <p className="text-gray-400">
            {existingSDW ? 'Review and edit' : 'Create'} solution design workbook for TRR-{trrId?.slice(-8)}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                disabled={readOnly}
                className={`flex-1 p-3 text-center transition-colors rounded-lg mx-1 ${
                  currentStep === step.id
                    ? 'bg-cyan-600 text-white'
                    : index < currentStepIndex
                    ? 'bg-green-600/50 text-green-200'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                }`}
              >
                <div className="text-lg mb-1">{step.icon}</div>
                <div className="text-sm font-medium">{step.label}</div>
              </button>
            ))}
          </div>
          <div className="bg-gray-700 rounded-full h-2">
            <div 
              className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step Info */}
        <div className="mb-6 p-4 bg-gray-800/30 rounded border border-gray-600">
          <h2 className="text-xl font-bold text-white mb-1">
            {currentStepInfo.icon} {currentStepInfo.label}
          </h2>
          <p className="text-gray-400 text-sm">{currentStepInfo.description}</p>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Cancel
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0 || readOnly}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:opacity-50 text-white rounded transition-colors"
            >
              ← Previous
            </button>
            
            {currentStepIndex < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={readOnly}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isLoading || readOnly}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save SDW'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};