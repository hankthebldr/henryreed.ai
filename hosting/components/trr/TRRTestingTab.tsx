'use client';

import React, { useState } from 'react';
import { TRR, TRRTestCase } from '../../types/trr';
import CortexButton from '../CortexButton';

interface TRRTestingTabProps {
  trr: TRR;
  onUpdateTestCase?: (testCaseId: string, updates: Partial<TRRTestCase>) => void;
  onAddTestCase?: (testCase: Omit<TRRTestCase, 'id'>) => void;
  onDeleteTestCase?: (testCaseId: string) => void;
  onRunTest?: (testCaseId: string) => void;
  onUpdateAcceptanceCriteria?: (criteria: string[]) => void;
}

export const TRRTestingTab: React.FC<TRRTestingTabProps> = ({
  trr,
  onUpdateTestCase,
  onAddTestCase,
  onDeleteTestCase,
  onRunTest,
  onUpdateAcceptanceCriteria,
}) => {
  const [activePanel, setActivePanel] = useState<'criteria' | 'testcases'>('criteria');
  const [editingCriteria, setEditingCriteria] = useState(false);
  const [newCriterion, setNewCriterion] = useState('');
  const [editingTestCase, setEditingTestCase] = useState<string | null>(null);
  const [newTestCase, setNewTestCase] = useState<Partial<TRRTestCase>>({
    title: '',
    steps: [''],
    expectedResult: '',
    automated: false
  });

  const getTestStatusColor = (status: string): string => {
    const colors = {
      'not-run': 'text-cortex-text-muted bg-cortex-bg-hover',
      'running': 'text-cortex-info bg-cortex-info/10',
      'passed': 'text-cortex-success bg-cortex-success/10',
      'failed': 'text-cortex-error bg-cortex-error/10',
      'skipped': 'text-cortex-warning bg-cortex-warning/10',
      'blocked': 'text-cortex-error bg-cortex-error/10'
    };
    return colors[status as keyof typeof colors] || 'text-cortex-text-muted bg-cortex-bg-hover';
  };

  const getTestStatusIcon = (status: string): string => {
    const icons = {
      'not-run': '⚪',
      'running': '🔄',
      'passed': '✅',
      'failed': '❌',
      'skipped': '⏭️',
      'blocked': '🚫'
    };
    return icons[status as keyof typeof icons] || '❓';
  };

  const calculateTestingProgress = (): { total: number; passed: number; failed: number; skipped: number; progress: number } => {
    const testCases = trr.testCases || [];
    const total = testCases.length;
    const passed = testCases.filter(tc => tc.status === 'passed').length;
    const failed = testCases.filter(tc => tc.status === 'failed').length;
    const skipped = testCases.filter(tc => tc.status === 'skipped').length;
    const completed = passed + failed + skipped;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, passed, failed, skipped, progress };
  };

  const addCriterion = () => {
    if (newCriterion.trim() && onUpdateAcceptanceCriteria) {
      const updated = [...(trr.acceptanceCriteria || []), newCriterion.trim()];
      onUpdateAcceptanceCriteria(updated);
      setNewCriterion('');
    }
  };

  const removeCriterion = (index: number) => {
    if (onUpdateAcceptanceCriteria) {
      const updated = trr.acceptanceCriteria?.filter((_, i) => i !== index) || [];
      onUpdateAcceptanceCriteria(updated);
    }
  };

  const addTestStep = () => {
    setNewTestCase(prev => ({
      ...prev,
      steps: [...(prev.steps || ['']), '']
    }));
  };

  const updateTestStep = (index: number, value: string) => {
    setNewTestCase(prev => ({
      ...prev,
      steps: prev.steps?.map((step, i) => i === index ? value : step) || []
    }));
  };

  const removeTestStep = (index: number) => {
    setNewTestCase(prev => ({
      ...prev,
      steps: prev.steps?.filter((_, i) => i !== index) || []
    }));
  };

  const saveNewTestCase = () => {
    if (newTestCase.title?.trim() && onAddTestCase) {
      const testCase: Omit<TRRTestCase, 'id'> = {
        title: newTestCase.title.trim(),
        steps: newTestCase.steps?.filter(step => step.trim()) || [],
        expectedResult: newTestCase.expectedResult || '',
        automated: newTestCase.automated || false,
        status: 'not-run'
      };
      onAddTestCase(testCase);
      setNewTestCase({ title: '', steps: [''], expectedResult: '', automated: false });
    }
  };

  const testingMetrics = calculateTestingProgress();

  return (
    <div className="space-y-6">
      {/* Testing Overview */}
      <div className="cortex-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-cortex-text-primary">
            Testing Overview
          </h3>
          
          <div className="flex items-center space-x-3">
            <CortexButton
              variant="outline"
              icon="🤖"
              onClick={() => {
                // TODO: Integrate with terminal command system
                console.log(`trr test generate ${trr.id}`);
              }}
            >
              AI Generate Tests
            </CortexButton>
            
            <CortexButton
              variant="primary"
              icon="🧪"
              onClick={() => {
                // Run all tests
              }}
            >
              Run All Tests
            </CortexButton>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-cortex-bg-tertiary p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-cortex-text-primary">
              {testingMetrics.total}
            </div>
            <p className="text-sm text-cortex-text-muted">Total Tests</p>
          </div>
          
          <div className="bg-cortex-success/10 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-cortex-success">
              {testingMetrics.passed}
            </div>
            <p className="text-sm text-cortex-text-muted">Passed</p>
          </div>
          
          <div className="bg-cortex-error/10 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-cortex-error">
              {testingMetrics.failed}
            </div>
            <p className="text-sm text-cortex-text-muted">Failed</p>
          </div>
          
          <div className="bg-cortex-warning/10 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-cortex-warning">
              {testingMetrics.skipped}
            </div>
            <p className="text-sm text-cortex-text-muted">Skipped</p>
          </div>
          
          <div className="bg-cortex-info/10 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-cortex-info">
              {testingMetrics.progress}%
            </div>
            <p className="text-sm text-cortex-text-muted">Progress</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-cortex-text-muted">Testing Progress</span>
            <span className="font-medium text-cortex-text-primary">{testingMetrics.progress}%</span>
          </div>
          <div className="w-full bg-cortex-bg-tertiary rounded-full h-3">
            <div 
              className="bg-cortex-info h-3 rounded-full transition-all duration-300"
              style={{ width: `${testingMetrics.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="cortex-card overflow-hidden">
        <div className="flex border-b border-cortex-border-secondary">
          <button
            onClick={() => setActivePanel('criteria')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activePanel === 'criteria'
                ? 'text-cortex-green border-b-2 border-cortex-green bg-cortex-green/5'
                : 'text-cortex-text-secondary hover:text-cortex-text-primary hover:bg-cortex-bg-hover'
            }`}
          >
            📋 Acceptance Criteria ({trr.acceptanceCriteria?.length || 0})
          </button>
          <button
            onClick={() => setActivePanel('testcases')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activePanel === 'testcases'
                ? 'text-cortex-green border-b-2 border-cortex-green bg-cortex-green/5'
                : 'text-cortex-text-secondary hover:text-cortex-text-primary hover:bg-cortex-bg-hover'
            }`}
          >
            🧪 Test Cases ({trr.testCases?.length || 0})
          </button>
        </div>

        <div className="p-6">
          {/* Acceptance Criteria Panel */}
          {activePanel === 'criteria' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-cortex-text-primary">
                  Acceptance Criteria
                </h4>
                <CortexButton
                  onClick={() => setEditingCriteria(!editingCriteria)}
                  variant="outline"
                  icon={editingCriteria ? '💾' : '✏️'}
                >
                  {editingCriteria ? 'Save Changes' : 'Edit Criteria'}
                </CortexButton>
              </div>

              {/* Criteria List */}
              {trr.acceptanceCriteria && trr.acceptanceCriteria.length > 0 ? (
                <div className="space-y-3">
                  {trr.acceptanceCriteria.map((criterion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-cortex-bg-tertiary rounded-lg">
                      <span className="text-cortex-success text-lg">✓</span>
                      <div className="flex-1">
                        <p className="text-cortex-text-primary">{criterion}</p>
                      </div>
                      {editingCriteria && (
                        <CortexButton
                          onClick={() => removeCriterion(index)}
                          variant="outline"
                          size="sm"
                          icon="🗑️"
                        >
                          Remove
                        </CortexButton>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-cortex-text-muted mb-4">No acceptance criteria defined</p>
                  <CortexButton
                    onClick={() => setEditingCriteria(true)}
                    variant="primary"
                    icon="➕"
                  >
                    Add First Criterion
                  </CortexButton>
                </div>
              )}

              {/* Add New Criterion */}
              {editingCriteria && (
                <div className="border-t border-cortex-border-secondary pt-4">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newCriterion}
                      onChange={(e) => setNewCriterion(e.target.value)}
                      placeholder="Enter new acceptance criterion..."
                      className="flex-1 px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                      onKeyDown={(e) => e.key === 'Enter' && addCriterion()}
                    />
                    <CortexButton
                      onClick={addCriterion}
                      variant="primary"
                      icon="➕"
                    >
                      Add
                    </CortexButton>
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              <div className="bg-cortex-info/5 p-4 rounded-lg border border-cortex-info">
                <div className="flex items-start space-x-3">
                  <span className="text-cortex-info text-lg">💡</span>
                  <div>
                    <h5 className="font-semibold text-cortex-info mb-2">AI Suggestions</h5>
                    <p className="text-sm text-cortex-text-secondary mb-3">
                      Based on your TRR description, here are some suggested acceptance criteria:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-cortex-bg-hover rounded">
                        <span className="text-sm text-cortex-text-primary">
                          System should validate all required input fields
                        </span>
                        <CortexButton size="sm" variant="outline" icon="➕">Add</CortexButton>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-cortex-bg-hover rounded">
                        <span className="text-sm text-cortex-text-primary">
                          Error messages should be clear and actionable
                        </span>
                        <CortexButton size="sm" variant="outline" icon="➕">Add</CortexButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Cases Panel */}
          {activePanel === 'testcases' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-cortex-text-primary">
                  Test Cases
                </h4>
                <CortexButton
                  onClick={() => setEditingTestCase('new')}
                  variant="primary"
                  icon="➕"
                >
                  Add Test Case
                </CortexButton>
              </div>

              {/* Test Cases List */}
              {trr.testCases && trr.testCases.length > 0 ? (
                <div className="space-y-4">
                  {trr.testCases.map((testCase, index) => (
                    <div key={testCase.id || index} className="cortex-card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {getTestStatusIcon(testCase.status || 'not-run')}
                          </span>
                          <div>
                            <h5 className="font-semibold text-cortex-text-primary">
                              {testCase.title}
                            </h5>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTestStatusColor(testCase.status || 'not-run')}`}>
                                {(testCase.status || 'not-run').replace('-', ' ').toUpperCase()}
                              </span>
                              {testCase.automated && (
                                <span className="px-2 py-1 bg-cortex-info/10 text-cortex-info rounded-full text-xs">
                                  🤖 AUTOMATED
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {onRunTest && (
                            <CortexButton
                              onClick={() => onRunTest(testCase.id!)}
                              variant="outline"
                              size="sm"
                              icon="▶️"
                            >
                              Run
                            </CortexButton>
                          )}
                          <CortexButton
                            onClick={() => setEditingTestCase(testCase.id || index.toString())}
                            variant="outline"
                            size="sm"
                            icon="✏️"
                          >
                            Edit
                          </CortexButton>
                          {onDeleteTestCase && (
                            <CortexButton
                              onClick={() => onDeleteTestCase(testCase.id!)}
                              variant="outline"
                              size="sm"
                              icon="🗑️"
                            >
                              Delete
                            </CortexButton>
                          )}
                        </div>
                      </div>

                      {/* Test Steps */}
                      <div className="mb-3">
                        <h6 className="text-sm font-medium text-cortex-text-secondary mb-2">Test Steps:</h6>
                        <ol className="space-y-1 text-sm text-cortex-text-primary">
                          {testCase.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start space-x-2">
                              <span className="text-cortex-text-muted font-mono">{stepIndex + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Expected Result */}
                      <div className="bg-cortex-bg-tertiary p-3 rounded">
                        <h6 className="text-sm font-medium text-cortex-text-secondary mb-1">Expected Result:</h6>
                        <p className="text-sm text-cortex-text-primary">{testCase.expectedResult}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🧪</div>
                  <p className="text-cortex-text-muted mb-4">No test cases defined</p>
                  <CortexButton
                    onClick={() => setEditingTestCase('new')}
                    variant="primary"
                    icon="➕"
                  >
                    Create First Test Case
                  </CortexButton>
                </div>
              )}

              {/* Add/Edit Test Case Modal-like Form */}
              {editingTestCase && (
                <div className="cortex-card p-6 border-2 border-cortex-green">
                  <h5 className="text-lg font-semibold text-cortex-text-primary mb-4">
                    {editingTestCase === 'new' ? 'Add New Test Case' : 'Edit Test Case'}
                  </h5>
                  
                  <div className="space-y-4">
                    {/* Test Case Title */}
                    <div>
                      <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                        Test Case Title
                      </label>
                      <input
                        type="text"
                        value={newTestCase.title || ''}
                        onChange={(e) => setNewTestCase(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter test case title..."
                        className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                      />
                    </div>

                    {/* Test Steps */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-cortex-text-secondary">
                          Test Steps
                        </label>
                        <CortexButton onClick={addTestStep} size="sm" variant="outline" icon="➕">
                          Add Step
                        </CortexButton>
                      </div>
                      <div className="space-y-2">
                        {(newTestCase.steps || ['']).map((step, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-cortex-text-muted font-mono text-sm w-8">
                              {index + 1}.
                            </span>
                            <input
                              type="text"
                              value={step}
                              onChange={(e) => updateTestStep(index, e.target.value)}
                              placeholder="Enter test step..."
                              className="flex-1 px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                            />
                            {(newTestCase.steps || []).length > 1 && (
                              <CortexButton
                                onClick={() => removeTestStep(index)}
                                size="sm"
                                variant="outline"
                                icon="🗑️"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expected Result */}
                    <div>
                      <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                        Expected Result
                      </label>
                      <textarea
                        value={newTestCase.expectedResult || ''}
                        onChange={(e) => setNewTestCase(prev => ({ ...prev, expectedResult: e.target.value }))}
                        placeholder="Describe the expected result..."
                        rows={3}
                        className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                      />
                    </div>

                    {/* Automated Toggle */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="automated"
                        checked={newTestCase.automated || false}
                        onChange={(e) => setNewTestCase(prev => ({ ...prev, automated: e.target.checked }))}
                        className="rounded border-cortex-border-secondary focus:ring-cortex-green"
                      />
                      <label htmlFor="automated" className="text-sm text-cortex-text-primary">
                        This is an automated test
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <CortexButton
                        onClick={() => setEditingTestCase(null)}
                        variant="outline"
                      >
                        Cancel
                      </CortexButton>
                      <CortexButton
                        onClick={saveNewTestCase}
                        variant="primary"
                        icon="💾"
                      >
                        Save Test Case
                      </CortexButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TRRTestingTab;