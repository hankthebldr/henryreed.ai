'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { cn } from '../lib/utils';

// Types for DOR (Design of Record) and SDW (Solution Design Workbook)
interface DORRecord {
  id: string;
  povId: string;
  customerName: string;
  engagementType: string;
  createdAt: string;
  updatedAt: string;

  // Technical Architecture
  architecture: {
    currentState: string;
    targetState: string;
    migrationPath: string;
    dataFlow: string;
    integrationPoints: string[];
  };

  // Security Requirements
  security: {
    complianceFrameworks: string[];
    dataClassification: string;
    encryptionRequirements: string;
    accessControls: string;
    auditRequirements: string;
  };

  // Infrastructure
  infrastructure: {
    cloudProvider: string;
    regions: string[];
    compute: string;
    storage: string;
    networking: string;
  };

  // Automation & Orchestration
  automation: {
    playbooks: string[];
    workflows: string[];
    integrations: string[];
  };

  metadata: {
    aiExtracted: boolean;
    confidence: number;
    reviewStatus: 'pending' | 'reviewed' | 'approved';
    reviewedBy?: string;
    notes?: string;
  };
}

interface SDWRecord {
  id: string;
  povId: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;

  // Business Requirements
  business: {
    objectives: string[];
    successCriteria: string[];
    stakeholders: string[];
    timeline: string;
    budget: string;
  };

  // Technical Requirements
  technical: {
    platforms: string[];
    dataSources: string[];
    integrations: string[];
    scalabilityNeeds: string;
    performanceTargets: string;
  };

  // Use Cases
  useCases: Array<{
    name: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actors: string[];
    preconditions: string[];
    steps: string[];
    expectedOutcome: string;
  }>;

  // Risk Assessment
  risks: Array<{
    category: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    likelihood: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;

  metadata: {
    aiExtracted: boolean;
    confidence: number;
    reviewStatus: 'pending' | 'reviewed' | 'approved';
    reviewedBy?: string;
    notes?: string;
  };
}

type FormType = 'dor' | 'sdw';
type UploadMethod = 'csv' | 'manual' | 'ai-assisted';

interface DORSDWFormCaptureProps {
  povId?: string;
  customerName?: string;
  onComplete?: (record: DORRecord | SDWRecord) => void;
  onCancel?: () => void;
}

export const DORSDWFormCapture: React.FC<DORSDWFormCaptureProps> = ({
  povId,
  customerName,
  onComplete,
  onCancel
}) => {
  const { state, actions } = useAppState();
  const [formType, setFormType] = useState<FormType>('dor');
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('csv');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiExtractionResults, setAiExtractionResults] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV file using AI
  const parseCSVWithAI = async (file: File): Promise<any> => {
    const content = await file.text();

    // Split CSV into rows
    const rows = content.split('\n').map(row =>
      row.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''))
    );

    if (rows.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Use AI to intelligently map CSV columns to our schema
    const aiPrompt = formType === 'dor'
      ? `Extract Design of Record (DOR) information from this CSV data. Parse architecture details, security requirements, infrastructure specs, and automation workflows. Return structured JSON matching the DOR schema.`
      : `Extract Solution Design Workbook (SDW) information from this CSV data. Parse business objectives, technical requirements, use cases, and risk assessments. Return structured JSON matching the SDW schema.`;

    try {
      // Call Gemini AI for intelligent extraction
      const response = await fetch('/api/gemini/extract-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          documentType: formType.toUpperCase(),
          csvData: rows,
          context: {
            povId,
            customerName,
            formType
          }
        })
      });

      if (!response.ok) {
        throw new Error('AI extraction failed');
      }

      const aiResult = await response.json();
      return aiResult;
    } catch (error) {
      console.error('AI extraction error:', error);

      // Fallback to rule-based parsing
      return parseCSVRuleBased(rows, formType);
    }
  };

  // Fallback rule-based CSV parsing
  const parseCSVRuleBased = (rows: string[][], type: FormType): any => {
    const headers = rows[0].map(h => h.toLowerCase());
    const data: any = {};

    if (type === 'dor') {
      // DOR-specific parsing logic
      data.architecture = {
        currentState: findValue(rows, headers, ['current state', 'current architecture', 'as-is']),
        targetState: findValue(rows, headers, ['target state', 'target architecture', 'to-be']),
        migrationPath: findValue(rows, headers, ['migration path', 'migration', 'transition']),
        dataFlow: findValue(rows, headers, ['data flow', 'dataflow']),
        integrationPoints: findValues(rows, headers, ['integrations', 'integration points'])
      };

      data.security = {
        complianceFrameworks: findValues(rows, headers, ['compliance', 'frameworks', 'standards']),
        dataClassification: findValue(rows, headers, ['data classification', 'classification']),
        encryptionRequirements: findValue(rows, headers, ['encryption', 'crypto']),
        accessControls: findValue(rows, headers, ['access control', 'rbac', 'iam']),
        auditRequirements: findValue(rows, headers, ['audit', 'logging'])
      };

      data.infrastructure = {
        cloudProvider: findValue(rows, headers, ['cloud provider', 'provider', 'cloud']),
        regions: findValues(rows, headers, ['regions', 'region', 'location']),
        compute: findValue(rows, headers, ['compute', 'vm', 'instances']),
        storage: findValue(rows, headers, ['storage', 'disk']),
        networking: findValue(rows, headers, ['network', 'networking', 'vpc'])
      };

      data.automation = {
        playbooks: findValues(rows, headers, ['playbooks', 'playbook']),
        workflows: findValues(rows, headers, ['workflows', 'workflow']),
        integrations: findValues(rows, headers, ['integrations', 'apis'])
      };
    } else {
      // SDW-specific parsing logic
      data.business = {
        objectives: findValues(rows, headers, ['objectives', 'goals', 'business objectives']),
        successCriteria: findValues(rows, headers, ['success criteria', 'kpi', 'metrics']),
        stakeholders: findValues(rows, headers, ['stakeholders', 'stakeholder']),
        timeline: findValue(rows, headers, ['timeline', 'schedule', 'duration']),
        budget: findValue(rows, headers, ['budget', 'cost', 'investment'])
      };

      data.technical = {
        platforms: findValues(rows, headers, ['platforms', 'platform', 'technology']),
        dataSources: findValues(rows, headers, ['data sources', 'sources', 'data']),
        integrations: findValues(rows, headers, ['integrations', 'integration']),
        scalabilityNeeds: findValue(rows, headers, ['scalability', 'scale']),
        performanceTargets: findValue(rows, headers, ['performance', 'sla'])
      };

      // Parse use cases from rows
      data.useCases = parseUseCases(rows, headers);

      // Parse risks from rows
      data.risks = parseRisks(rows, headers);
    }

    return data;
  };

  // Helper functions for CSV parsing
  const findValue = (rows: string[][], headers: string[], keywords: string[]): string => {
    for (const keyword of keywords) {
      const index = headers.findIndex(h => h.includes(keyword));
      if (index !== -1 && rows.length > 1) {
        return rows[1][index] || '';
      }
    }
    return '';
  };

  const findValues = (rows: string[][], headers: string[], keywords: string[]): string[] => {
    const values: string[] = [];
    for (const keyword of keywords) {
      const index = headers.findIndex(h => h.includes(keyword));
      if (index !== -1) {
        rows.slice(1).forEach(row => {
          if (row[index]) {
            values.push(row[index]);
          }
        });
      }
    }
    return [...new Set(values)]; // Remove duplicates
  };

  const parseUseCases = (rows: string[][], headers: string[]): any[] => {
    const useCases: any[] = [];
    const useCaseNameIndex = headers.findIndex(h => h.includes('use case') || h.includes('scenario'));

    if (useCaseNameIndex !== -1) {
      rows.slice(1).forEach(row => {
        if (row[useCaseNameIndex]) {
          useCases.push({
            name: row[useCaseNameIndex],
            description: row[useCaseNameIndex + 1] || '',
            priority: 'medium',
            actors: [],
            preconditions: [],
            steps: [],
            expectedOutcome: ''
          });
        }
      });
    }

    return useCases;
  };

  const parseRisks = (rows: string[][], headers: string[]): any[] => {
    const risks: any[] = [];
    const riskIndex = headers.findIndex(h => h.includes('risk'));

    if (riskIndex !== -1) {
      rows.slice(1).forEach(row => {
        if (row[riskIndex]) {
          risks.push({
            category: 'General',
            description: row[riskIndex],
            impact: 'medium',
            likelihood: 'medium',
            mitigation: row[riskIndex + 1] || ''
          });
        }
      });
    }

    return risks;
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadProgress(10);

    try {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        throw new Error('Please upload a CSV file');
      }

      setUploadProgress(30);
      actions.notify('info', 'Processing file with AI...');

      // Parse CSV with AI
      const extractedData = await parseCSVWithAI(file);

      setUploadProgress(70);

      // Store extracted data for review
      setAiExtractionResults({
        ...extractedData,
        originalFile: file.name,
        uploadedAt: new Date().toISOString(),
        confidence: extractedData.confidence || 0.85
      });

      setUploadProgress(100);
      setShowReview(true);

      actions.notify('success', 'AI extraction complete! Please review the results.');
    } catch (error) {
      console.error('Upload error:', error);
      actions.notify('error', error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  // Save record to Firestore
  const handleSaveRecord = async () => {
    if (!aiExtractionResults) return;

    setIsProcessing(true);

    try {
      const recordId = `${formType}-${Date.now()}`;
      const baseRecord = {
        id: recordId,
        povId: povId || 'unassigned',
        customerName: customerName || 'Unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          aiExtracted: true,
          confidence: aiExtractionResults.confidence || 0.85,
          reviewStatus: 'pending' as const,
          notes: ''
        }
      };

      let record: DORRecord | SDWRecord;

      if (formType === 'dor') {
        record = {
          ...baseRecord,
          architecture: aiExtractionResults.architecture || {},
          security: aiExtractionResults.security || {},
          infrastructure: aiExtractionResults.infrastructure || {},
          automation: aiExtractionResults.automation || {}
        } as DORRecord;
      } else {
        record = {
          ...baseRecord,
          business: aiExtractionResults.business || {},
          technical: aiExtractionResults.technical || {},
          useCases: aiExtractionResults.useCases || [],
          risks: aiExtractionResults.risks || []
        } as SDWRecord;
      }

      // Save to Firestore
      const docRef = doc(db, `${formType}_records`, recordId);
      await setDoc(docRef, record);

      actions.notify('success', `${formType.toUpperCase()} record saved successfully!`);

      if (onComplete) {
        onComplete(record);
      }
    } catch (error) {
      console.error('Save error:', error);
      actions.notify('error', 'Failed to save record');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-cortex-bg-primary">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-cortex-border/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cortex-text-primary flex items-center">
              <span className="text-cortex-accent mr-3">📋</span>
              DOR/SDW Form Capture
            </h2>
            <p className="text-sm text-cortex-text-muted mt-1">
              AI-powered document extraction and management
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-cortex-bg-secondary border border-cortex-border text-cortex-text-secondary rounded-lg hover:bg-cortex-bg-tertiary"
            >
              Close
            </button>
          )}
        </div>

        {/* Form Type Selection */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-cortex-text-secondary">Form Type:</div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFormType('dor')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                formType === 'dor'
                  ? 'bg-cortex-primary text-cortex-dark'
                  : 'bg-cortex-bg-secondary text-cortex-text-muted hover:text-cortex-text-primary'
              )}
            >
              📐 Design of Record (DOR)
            </button>
            <button
              onClick={() => setFormType('sdw')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                formType === 'sdw'
                  ? 'bg-cortex-primary text-cortex-dark'
                  : 'bg-cortex-bg-secondary text-cortex-text-muted hover:text-cortex-text-primary'
              )}
            >
              📊 Solution Design Workbook (SDW)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        {!showReview ? (
          <div className="max-w-4xl mx-auto">
            {/* Upload Method Selection */}
            <div className="glass-card p-6 mb-6">
              <h3 className="text-lg font-bold text-cortex-text-primary mb-4">Upload Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setUploadMethod('csv')}
                  className={cn(
                    'p-6 rounded-lg border-2 transition-all hover:shadow-cortex-lg',
                    uploadMethod === 'csv'
                      ? 'border-cortex-accent bg-cortex-accent/10'
                      : 'border-cortex-border bg-cortex-bg-secondary'
                  )}
                >
                  <div className="text-4xl mb-3">📤</div>
                  <div className="text-lg font-semibold text-cortex-text-primary mb-2">
                    CSV Upload
                  </div>
                  <div className="text-sm text-cortex-text-muted">
                    Upload existing CSV export with AI extraction
                  </div>
                </button>

                <button
                  onClick={() => setUploadMethod('manual')}
                  className={cn(
                    'p-6 rounded-lg border-2 transition-all hover:shadow-cortex-lg',
                    uploadMethod === 'manual'
                      ? 'border-cortex-accent bg-cortex-accent/10'
                      : 'border-cortex-border bg-cortex-bg-secondary'
                  )}
                >
                  <div className="text-4xl mb-3">✏️</div>
                  <div className="text-lg font-semibold text-cortex-text-primary mb-2">
                    Manual Entry
                  </div>
                  <div className="text-sm text-cortex-text-muted">
                    Fill out form fields manually
                  </div>
                </button>

                <button
                  onClick={() => setUploadMethod('ai-assisted')}
                  className={cn(
                    'p-6 rounded-lg border-2 transition-all hover:shadow-cortex-lg',
                    uploadMethod === 'ai-assisted'
                      ? 'border-cortex-accent bg-cortex-accent/10'
                      : 'border-cortex-border bg-cortex-bg-secondary'
                  )}
                >
                  <div className="text-4xl mb-3">🤖</div>
                  <div className="text-lg font-semibold text-cortex-text-primary mb-2">
                    AI Assisted
                  </div>
                  <div className="text-sm text-cortex-text-muted">
                    AI guides you through form completion
                  </div>
                </button>
              </div>
            </div>

            {/* CSV Upload Section */}
            {uploadMethod === 'csv' && (
              <div className="glass-card p-8">
                <h3 className="text-xl font-bold text-cortex-text-primary mb-4">
                  Upload {formType.toUpperCase()} CSV File
                </h3>

                <div className="border-2 border-dashed border-cortex-border rounded-lg p-12 text-center">
                  {isProcessing ? (
                    <div className="space-y-4">
                      <div className="text-4xl">🔄</div>
                      <div className="text-cortex-text-primary font-medium">
                        Processing with AI...
                      </div>
                      <div className="max-w-xs mx-auto">
                        <div className="w-full bg-cortex-bg-secondary rounded-full h-2">
                          <div
                            className="bg-cortex-accent h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <div className="text-sm text-cortex-text-muted mt-2">
                          {uploadProgress}% complete
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">📂</div>
                      <div className="text-lg text-cortex-text-primary mb-2">
                        Drop CSV file here or click to browse
                      </div>
                      <div className="text-sm text-cortex-text-muted mb-6">
                        AI will automatically extract and structure your data
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-cortex-accent/20 border border-cortex-accent/40 text-cortex-accent rounded-lg hover:bg-cortex-accent/30 font-medium"
                      >
                        Select CSV File
                      </button>
                    </>
                  )}
                </div>

                {/* CSV Template Download */}
                <div className="mt-6 p-4 bg-cortex-bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-cortex-text-primary">
                        Need a template?
                      </div>
                      <div className="text-xs text-cortex-text-muted">
                        Download a pre-formatted CSV template to get started
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-cortex-success/20 border border-cortex-success/40 text-cortex-success rounded-lg hover:bg-cortex-success/30 text-sm">
                      Download Template
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Entry Placeholder */}
            {uploadMethod === 'manual' && (
              <div className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">🚧</div>
                <div className="text-lg text-cortex-text-primary mb-2">
                  Manual Entry Form
                </div>
                <div className="text-sm text-cortex-text-muted">
                  Coming soon - Interactive form builder
                </div>
              </div>
            )}

            {/* AI Assisted Placeholder */}
            {uploadMethod === 'ai-assisted' && (
              <div className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">🤖</div>
                <div className="text-lg text-cortex-text-primary mb-2">
                  AI-Assisted Wizard
                </div>
                <div className="text-sm text-cortex-text-muted">
                  Coming soon - Conversational form completion
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Review Extracted Data */
          <div className="max-w-6xl mx-auto">
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-cortex-text-primary">
                    Review AI Extraction Results
                  </h3>
                  <div className="text-sm text-cortex-text-muted mt-1">
                    Confidence Score: {Math.round((aiExtractionResults?.confidence || 0) * 100)}%
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowReview(false)}
                    className="px-4 py-2 bg-cortex-bg-secondary border border-cortex-border text-cortex-text-secondary rounded-lg hover:bg-cortex-bg-tertiary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSaveRecord}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-cortex-success/20 border border-cortex-success/40 text-cortex-success rounded-lg hover:bg-cortex-success/30 font-medium disabled:opacity-50"
                  >
                    {isProcessing ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </div>

              {/* Display extracted data */}
              <div className="space-y-4">
                <pre className="p-4 bg-cortex-bg-secondary rounded-lg text-xs text-cortex-text-primary overflow-auto max-h-96 terminal-scrollbar">
                  {JSON.stringify(aiExtractionResults, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DORSDWFormCapture;
