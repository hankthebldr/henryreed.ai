'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { requestBlueprintGeneration, subscribeToBlueprint, BadassBlueprintRecord } from '../lib/badass-blueprint-service';
import { cn } from '../lib/utils';

interface BadassBlueprintWorkflowProps {
  engagementId?: string;
  customerName?: string;
  onClose?: () => void;
  onComplete?: (blueprint: BadassBlueprintRecord) => void;
}

type Step = 'input' | 'generating' | 'success' | 'error';

export const BadassBlueprintWorkflow: React.FC<BadassBlueprintWorkflowProps> = ({
  engagementId: initialEngagementId,
  customerName: initialCustomerName,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState<Step>('input');
  const [engagementId, setEngagementId] = useState(initialEngagementId || '');
  const [customerName, setCustomerName] = useState(initialCustomerName || '');
  const [executiveTone, setExecutiveTone] = useState('Transformation Momentum');
  const [wins, setWins] = useState<string[]>([]);
  const [risks, setRisks] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<string[]>([]);
  const [newWin, setNewWin] = useState('');
  const [newRisk, setNewRisk] = useState('');
  const [newRoadmapItem, setNewRoadmapItem] = useState('');
  const [blueprint, setBlueprint] = useState<BadassBlueprintRecord | null>(null);
  const [blueprintId, setBlueprintId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (step === 'generating') {
      const interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    if (!blueprintId) return;

    const unsubscribe = subscribeToBlueprint(blueprintId, (record) => {
      if (!record) return;

      setBlueprint(record);

      if (record.status === 'succeeded') {
        setStep('success');
        onComplete?.(record);
      } else if (record.status === 'failed') {
        setStep('error');
        setError(record.error?.message || 'Blueprint generation failed');
      }
    });

    return () => unsubscribe();
  }, [blueprintId, onComplete]);

  const handleGenerate = async () => {
    if (!engagementId.trim()) {
      setError('Engagement ID is required');
      return;
    }

    setStep('generating');
    setError(null);
    setElapsedSeconds(0);

    try {
      const response = await requestBlueprintGeneration({
        engagementId: engagementId.trim(),
        executiveTone,
        emphasis: {
          wins: wins.length > 0 ? wins : undefined,
          risks: risks.length > 0 ? risks : undefined,
          roadmap: roadmap.length > 0 ? roadmap : undefined,
        }
      });

      setBlueprintId(response.blueprintId);
    } catch (err) {
      setStep('error');
      setError(err instanceof Error ? err.message : 'Failed to start blueprint generation');
    }
  };

  const addItem = (type: 'win' | 'risk' | 'roadmap') => {
    if (type === 'win' && newWin.trim()) {
      setWins([...wins, newWin.trim()]);
      setNewWin('');
    } else if (type === 'risk' && newRisk.trim()) {
      setRisks([...risks, newRisk.trim()]);
      setNewRisk('');
    } else if (type === 'roadmap' && newRoadmapItem.trim()) {
      setRoadmap([...roadmap, newRoadmapItem.trim()]);
      setNewRoadmapItem('');
    }
  };

  const removeItem = (type: 'win' | 'risk' | 'roadmap', index: number) => {
    if (type === 'win') {
      setWins(wins.filter((_, i) => i !== index));
    } else if (type === 'risk') {
      setRisks(risks.filter((_, i) => i !== index));
    } else if (type === 'roadmap') {
      setRoadmap(roadmap.filter((_, i) => i !== index));
    }
  };

  const getStatusMessage = () => {
    if (!blueprint) return 'Initializing...';

    switch (blueprint.status) {
      case 'processing':
        return 'Processing engagement context with AI...';
      case 'rendered':
        return 'PDF rendered - preparing bundle...';
      case 'export_pending':
        return 'Publishing artifact bundle...';
      case 'bundled':
        return 'Bundle ready - exporting analytics...';
      case 'succeeded':
        return 'Blueprint generation complete!';
      default:
        return 'Generating blueprint...';
    }
  };

  const getProgressPercent = () => {
    if (!blueprint) return 10;

    switch (blueprint.status) {
      case 'processing':
        return 30;
      case 'rendered':
        return 60;
      case 'export_pending':
        return 80;
      case 'bundled':
        return 95;
      case 'succeeded':
        return 100;
      default:
        return 10;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-cortex-bg-secondary to-cortex-bg-tertiary rounded-2xl shadow-2xl border border-cortex-border max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cortex-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-cortex-primary to-cortex-accent rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🧭</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-cortex-text-primary">Badass Blueprint Generator</h2>
              <p className="text-sm text-cortex-text-secondary">Transform your POV into executive-ready deliverables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-cortex-bg-hover transition-colors text-cortex-text-secondary hover:text-cortex-text-primary"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'input' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                    Engagement ID <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={engagementId}
                    onChange={(e) => setEngagementId(e.target.value)}
                    placeholder="e.g., acme-corp-pov-2025"
                    className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border rounded-lg text-cortex-text-primary placeholder-cortex-text-disabled focus:outline-none focus:ring-2 focus:ring-cortex-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g., ACME Corporation"
                    className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border rounded-lg text-cortex-text-primary placeholder-cortex-text-disabled focus:outline-none focus:ring-2 focus:ring-cortex-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                    Executive Tone
                  </label>
                  <select
                    value={executiveTone}
                    onChange={(e) => setExecutiveTone(e.target.value)}
                    className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-primary focus:border-transparent"
                  >
                    <option>Transformation Momentum</option>
                    <option>Risk Mitigation</option>
                    <option>Business Value</option>
                    <option>Technical Excellence</option>
                    <option>Innovation Leadership</option>
                  </select>
                </div>
              </div>

              {/* Emphasis Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Wins */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-status-success">Key Wins</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newWin}
                      onChange={(e) => setNewWin(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('win')}
                      placeholder="Add a win..."
                      className="flex-1 px-3 py-2 bg-cortex-bg-tertiary border border-cortex-border rounded-lg text-sm text-cortex-text-primary placeholder-cortex-text-disabled focus:outline-none focus:ring-2 focus:ring-status-success"
                    />
                    <button
                      onClick={() => addItem('win')}
                      className="px-3 py-2 bg-status-success/20 text-status-success rounded-lg hover:bg-status-success/30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-1">
                    {wins.map((win, index) => (
                      <div key={index} className="flex items-center justify-between px-3 py-2 bg-status-success/10 rounded-lg border border-status-success/20">
                        <span className="text-xs text-cortex-text-primary">{win}</span>
                        <button
                          onClick={() => removeItem('win', index)}
                          className="text-status-error hover:text-status-error/80"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-status-warning">Risks to Address</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newRisk}
                      onChange={(e) => setNewRisk(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('risk')}
                      placeholder="Add a risk..."
                      className="flex-1 px-3 py-2 bg-cortex-bg-tertiary border border-cortex-border rounded-lg text-sm text-cortex-text-primary placeholder-cortex-text-disabled focus:outline-none focus:ring-2 focus:ring-status-warning"
                    />
                    <button
                      onClick={() => addItem('risk')}
                      className="px-3 py-2 bg-status-warning/20 text-status-warning rounded-lg hover:bg-status-warning/30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-1">
                    {risks.map((risk, index) => (
                      <div key={index} className="flex items-center justify-between px-3 py-2 bg-status-warning/10 rounded-lg border border-status-warning/20">
                        <span className="text-xs text-cortex-text-primary">{risk}</span>
                        <button
                          onClick={() => removeItem('risk', index)}
                          className="text-status-error hover:text-status-error/80"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Roadmap */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-cortex-info">Roadmap Items</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newRoadmapItem}
                      onChange={(e) => setNewRoadmapItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('roadmap')}
                      placeholder="Add roadmap item..."
                      className="flex-1 px-3 py-2 bg-cortex-bg-tertiary border border-cortex-border rounded-lg text-sm text-cortex-text-primary placeholder-cortex-text-disabled focus:outline-none focus:ring-2 focus:ring-cortex-info"
                    />
                    <button
                      onClick={() => addItem('roadmap')}
                      className="px-3 py-2 bg-cortex-info/20 text-cortex-info rounded-lg hover:bg-cortex-info/30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-1">
                    {roadmap.map((item, index) => (
                      <div key={index} className="flex items-center justify-between px-3 py-2 bg-cortex-info/10 rounded-lg border border-cortex-info/20">
                        <span className="text-xs text-cortex-text-primary">{item}</span>
                        <button
                          onClick={() => removeItem('roadmap', index)}
                          className="text-status-error hover:text-status-error/80"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-status-error/10 border border-status-error/20 rounded-lg text-status-error text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'generating' && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cortex-text-secondary">{getStatusMessage()}</span>
                  <span className="text-cortex-primary font-mono">{elapsedSeconds}s</span>
                </div>
                <div className="w-full h-3 bg-cortex-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cortex-primary to-cortex-accent transition-all duration-500 ease-out"
                    style={{ width: `${getProgressPercent()}%` }}
                  />
                </div>
                <div className="text-xs text-cortex-text-muted text-right">{getProgressPercent()}% Complete</div>
              </div>

              {/* Analytics (if available) */}
              {blueprint?.analytics && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-status-success/10 border border-status-success/20 rounded-lg">
                    <div className="text-xs text-status-success mb-1">Recommendation Coverage</div>
                    <div className="text-2xl font-bold text-cortex-text-primary">
                      {Math.round((blueprint.analytics.recommendationCoverage || 0) * 100)}%
                    </div>
                  </div>
                  <div className="p-4 bg-cortex-info/10 border border-cortex-info/20 rounded-lg">
                    <div className="text-xs text-cortex-info mb-1">Automation Confidence</div>
                    <div className="text-2xl font-bold text-cortex-text-primary">
                      {Math.round((blueprint.analytics.automationConfidence || 0) * 100)}%
                    </div>
                  </div>
                  <div className="p-4 bg-status-warning/10 border border-status-warning/20 rounded-lg">
                    <div className="text-xs text-status-warning mb-1">Risk Score</div>
                    <div className="text-2xl font-bold text-cortex-text-primary">
                      {Math.round((blueprint.analytics.riskScore || 0) * 100)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Live Progress Indicator */}
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-cortex-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 w-24 h-24 border-4 border-cortex-primary border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">🧭</div>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && blueprint && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-status-success/20 rounded-full mx-auto flex items-center justify-center mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <h3 className="text-2xl font-bold text-cortex-text-primary mb-2">Blueprint Generated!</h3>
                <p className="text-cortex-text-secondary">Your executive-ready deliverables are ready for download</p>
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-2 gap-4">
                {blueprint.pdf?.downloadUrl && (
                  <a
                    href={blueprint.pdf.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-status-success/20 border border-status-success/30 rounded-lg hover:bg-status-success/30 transition-colors text-status-success font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download PDF</span>
                  </a>
                )}
                {blueprint.artifactBundle?.downloadUrl && (
                  <a
                    href={blueprint.artifactBundle.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-cortex-info/20 border border-cortex-info/30 rounded-lg hover:bg-cortex-info/30 transition-colors text-cortex-info font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Download Artifact Bundle</span>
                  </a>
                )}
              </div>

              {/* Analytics Summary */}
              {blueprint.analytics && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-cortex-text-primary">Analytics Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between p-3 bg-cortex-bg-tertiary rounded-lg">
                      <span className="text-cortex-text-secondary">Scenarios</span>
                      <span className="text-cortex-text-primary font-medium">{blueprint.analytics.scenarioCount}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-cortex-bg-tertiary rounded-lg">
                      <span className="text-cortex-text-secondary">Notes</span>
                      <span className="text-cortex-text-primary font-medium">{blueprint.analytics.notesCount}</span>
                    </div>
                    {blueprint.analytics.bigQueryJobId && (
                      <div className="col-span-2 flex justify-between p-3 bg-cortex-bg-tertiary rounded-lg">
                        <span className="text-cortex-text-secondary">BigQuery Export</span>
                        <span className="text-cortex-primary font-mono text-xs">{blueprint.analytics.bigQueryJobId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-status-error/20 rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="text-4xl">❌</span>
              </div>
              <h3 className="text-2xl font-bold text-cortex-text-primary mb-2">Generation Failed</h3>
              <p className="text-cortex-text-secondary mb-6">{error}</p>
              <button
                onClick={() => {
                  setStep('input');
                  setError(null);
                  setBlueprintId(null);
                  setBlueprint(null);
                }}
                className="px-6 py-3 bg-cortex-primary text-white rounded-lg hover:bg-cortex-primary-light transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-cortex-border bg-cortex-bg-tertiary/50">
          {step === 'input' && (
            <>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-cortex-bg-hover text-cortex-text-secondary rounded-lg hover:bg-cortex-bg-tertiary transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!engagementId.trim()}
                className="px-6 py-3 bg-gradient-to-r from-cortex-primary to-cortex-accent text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Generate Blueprint</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </>
          )}
          {step === 'generating' && (
            <div className="text-sm text-cortex-text-secondary">
              Generating blueprint... This may take a few moments
            </div>
          )}
          {step === 'success' && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-cortex-primary text-white rounded-lg hover:bg-cortex-primary-light transition-colors font-medium"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
