'use client';

import React, { useState } from 'react';
import { CortexCloudFrame } from './CortexCloudFrame';

type CreationMode = 'pov' | 'template' | 'scenario' | 'none';

interface POVFormData {
  name: string;
  customer: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  estimatedEndDate: string;
  objectives: string[];
  successCriteria: string[];
  teamLead: string;
  budget: number;
  scenarios: string[];
}

interface TemplateFormData {
  name: string;
  category: 'security' | 'compliance' | 'performance' | 'integration';
  description: string;
  requirements: string[];
  validationSteps: string[];
  expectedOutcomes: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours: number;
}

interface ScenarioFormData {
  name: string;
  type: 'ransomware' | 'insider-threat' | 'advanced-persistent-threat' | 'data-exfiltration' | 'cloud-attack' | 'supply-chain';
  description: string;
  attackVectors: string[];
  mitreMapping: string[];
  detectionRules: string[];
  responseActions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: number;
  prerequisites: string[];
}

export const ManualCreationGUI: React.FC = () => {
  const [activeMode, setActiveMode] = useState<CreationMode>('none');
  const [showDocs, setShowDocs] = useState(false);
  
  // Form states
  const [povForm, setPovForm] = useState<POVFormData>({
    name: '',
    customer: '',
    description: '',
    priority: 'medium',
    startDate: '',
    estimatedEndDate: '',
    objectives: [''],
    successCriteria: [''],
    teamLead: '',
    budget: 0,
    scenarios: ['']
  });

  const [templateForm, setTemplateForm] = useState<TemplateFormData>({
    name: '',
    category: 'security',
    description: '',
    requirements: [''],
    validationSteps: [''],
    expectedOutcomes: [''],
    riskLevel: 'medium',
    estimatedHours: 0
  });

  const [scenarioForm, setScenarioForm] = useState<ScenarioFormData>({
    name: '',
    type: 'ransomware',
    description: '',
    attackVectors: [''],
    mitreMapping: [''],
    detectionRules: [''],
    responseActions: [''],
    severity: 'medium',
    duration: 0,
    prerequisites: ['']
  });

  // Helper functions for dynamic arrays
  const addArrayItem = <T extends Record<string, any>>(
    form: T, 
    setForm: React.Dispatch<React.SetStateAction<T>>, 
    field: keyof T
  ) => {
    setForm(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const updateArrayItem = <T extends Record<string, any>>(
    form: T,
    setForm: React.Dispatch<React.SetStateAction<T>>,
    field: keyof T,
    index: number,
    value: string
  ) => {
    const newArray = [...(form[field] as string[])];
    newArray[index] = value;
    setForm(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const removeArrayItem = <T extends Record<string, any>>(
    form: T,
    setForm: React.Dispatch<React.SetStateAction<T>>,
    field: keyof T,
    index: number
  ) => {
    setForm(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  // Form submission handlers
  const handlePOVSubmit = () => {
    console.log('Creating POV:', povForm);
    // In real implementation, this would call the POV creation API
    alert('POV created successfully!');
    setActiveMode('none');
  };

  const handleTemplateSubmit = () => {
    console.log('Creating Template:', templateForm);
    alert('Template created successfully!');
    setActiveMode('none');
  };

  const handleScenarioSubmit = () => {
    console.log('Creating Scenario:', scenarioForm);
    alert('Detection Scenario created successfully!');
    setActiveMode('none');
  };

  // POV Creation Form
  const renderPOVForm = () => (
    <div className="bg-gray-800 rounded-lg p-6 border border-blue-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🎯</div>
          <div>
            <h3 className="text-xl font-bold text-blue-400">Create New POV</h3>
            <p className="text-sm text-gray-300">Proof of Value Project Setup</p>
          </div>
        </div>
        <button
          onClick={() => setActiveMode('none')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">POV Name *</label>
            <input
              type="text"
              value={povForm.name}
              onChange={(e) => setPovForm({...povForm, name: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="e.g., ACME Corp XSIAM Implementation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Customer *</label>
            <input
              type="text"
              value={povForm.customer}
              onChange={(e) => setPovForm({...povForm, customer: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="e.g., acme-corp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
            <select
              value={povForm.priority}
              onChange={(e) => setPovForm({...povForm, priority: e.target.value as POVFormData['priority']})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                value={povForm.startDate}
                onChange={(e) => setPovForm({...povForm, startDate: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                value={povForm.estimatedEndDate}
                onChange={(e) => setPovForm({...povForm, estimatedEndDate: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Team Lead</label>
            <input
              type="text"
              value={povForm.teamLead}
              onChange={(e) => setPovForm({...povForm, teamLead: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="e.g., john.doe@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Budget ($)</label>
            <input
              type="number"
              value={povForm.budget}
              onChange={(e) => setPovForm({...povForm, budget: parseInt(e.target.value) || 0})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="150000"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={povForm.description}
              onChange={(e) => setPovForm({...povForm, description: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white h-24"
              placeholder="Describe the POV objectives and scope..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Objectives</label>
            {povForm.objectives.map((objective, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => updateArrayItem(povForm, setPovForm, 'objectives', index, e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="Enter objective"
                />
                <button
                  onClick={() => removeArrayItem(povForm, setPovForm, 'objectives', index)}
                  className="text-red-400 hover:text-red-300 p-2"
                  disabled={povForm.objectives.length === 1}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem(povForm, setPovForm, 'objectives')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              + Add Objective
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Success Criteria</label>
            {povForm.successCriteria.map((criteria, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={criteria}
                  onChange={(e) => updateArrayItem(povForm, setPovForm, 'successCriteria', index, e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="Enter success criteria"
                />
                <button
                  onClick={() => removeArrayItem(povForm, setPovForm, 'successCriteria', index)}
                  className="text-red-400 hover:text-red-300 p-2"
                  disabled={povForm.successCriteria.length === 1}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem(povForm, setPovForm, 'successCriteria')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              + Add Success Criteria
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
        <button
          onClick={() => setActiveMode('none')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handlePOVSubmit}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
        >
          Create POV
        </button>
      </div>
    </div>
  );

  // Template Creation Form
  const renderTemplateForm = () => (
    <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">📋</div>
          <div>
            <h3 className="text-xl font-bold text-green-400">Create New Template</h3>
            <p className="text-sm text-gray-300">Reusable Scenario Template</p>
          </div>
        </div>
        <button
          onClick={() => setActiveMode('none')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Template Name *</label>
            <input
              type="text"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="e.g., SIEM Integration Validation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={templateForm.category}
              onChange={(e) => setTemplateForm({...templateForm, category: e.target.value as TemplateFormData['category']})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="security">Security</option>
              <option value="compliance">Compliance</option>
              <option value="performance">Performance</option>
              <option value="integration">Integration</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
            <select
              value={templateForm.riskLevel}
              onChange={(e) => setTemplateForm({...templateForm, riskLevel: e.target.value as TemplateFormData['riskLevel']})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Hours</label>
            <input
              type="number"
              value={templateForm.estimatedHours}
              onChange={(e) => setTemplateForm({...templateForm, estimatedHours: parseInt(e.target.value) || 0})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="16"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={templateForm.description}
              onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white h-24"
              placeholder="Describe the template purpose and scope..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
            {templateForm.requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateArrayItem(templateForm, setTemplateForm, 'requirements', index, e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="Enter requirement"
                />
                <button
                  onClick={() => removeArrayItem(templateForm, setTemplateForm, 'requirements', index)}
                  className="text-red-400 hover:text-red-300 p-2"
                  disabled={templateForm.requirements.length === 1}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem(templateForm, setTemplateForm, 'requirements')}
              className="text-green-400 hover:text-green-300 text-sm"
            >
              + Add Requirement
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Validation Steps</label>
            {templateForm.validationSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={step}
                  onChange={(e) => updateArrayItem(templateForm, setTemplateForm, 'validationSteps', index, e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="Enter validation step"
                />
                <button
                  onClick={() => removeArrayItem(templateForm, setTemplateForm, 'validationSteps', index)}
                  className="text-red-400 hover:text-red-300 p-2"
                  disabled={templateForm.validationSteps.length === 1}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem(templateForm, setTemplateForm, 'validationSteps')}
              className="text-green-400 hover:text-green-300 text-sm"
            >
              + Add Validation Step
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
        <button
          onClick={() => setActiveMode('none')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleTemplateSubmit}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
        >
          Create Template
        </button>
      </div>
    </div>
  );

  // Scenario Creation Form
  const renderScenarioForm = () => (
    <div className="bg-gray-800 rounded-lg p-6 border border-purple-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🔬</div>
          <div>
            <h3 className="text-xl font-bold text-purple-400">Create Detection Scenario</h3>
            <p className="text-sm text-gray-300">Cloud Detection and Response Scenario</p>
          </div>
        </div>
        <button
          onClick={() => setActiveMode('none')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scenario Name *</label>
            <input
              type="text"
              value={scenarioForm.name}
              onChange={(e) => setScenarioForm({...scenarioForm, name: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="e.g., Advanced Ransomware Simulation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scenario Type</label>
            <select
              value={scenarioForm.type}
              onChange={(e) => setScenarioForm({...scenarioForm, type: e.target.value as ScenarioFormData['type']})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="ransomware">Ransomware Attack</option>
              <option value="insider-threat">Insider Threat</option>
              <option value="advanced-persistent-threat">Advanced Persistent Threat</option>
              <option value="data-exfiltration">Data Exfiltration</option>
              <option value="cloud-attack">Cloud Attack</option>
              <option value="supply-chain">Supply Chain Attack</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
            <select
              value={scenarioForm.severity}
              onChange={(e) => setScenarioForm({...scenarioForm, severity: e.target.value as ScenarioFormData['severity']})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Duration (hours)</label>
            <input
              type="number"
              value={scenarioForm.duration}
              onChange={(e) => setScenarioForm({...scenarioForm, duration: parseInt(e.target.value) || 0})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={scenarioForm.description}
              onChange={(e) => setScenarioForm({...scenarioForm, description: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white h-24"
              placeholder="Describe the attack scenario and objectives..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Attack Vectors</label>
            {scenarioForm.attackVectors.map((vector, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={vector}
                  onChange={(e) => updateArrayItem(scenarioForm, setScenarioForm, 'attackVectors', index, e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="e.g., Phishing email"
                />
                <button
                  onClick={() => removeArrayItem(scenarioForm, setScenarioForm, 'attackVectors', index)}
                  className="text-red-400 hover:text-red-300 p-2"
                  disabled={scenarioForm.attackVectors.length === 1}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem(scenarioForm, setScenarioForm, 'attackVectors')}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              + Add Attack Vector
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">MITRE ATT&CK Mapping</label>
            {scenarioForm.mitreMapping.map((mapping, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={mapping}
                  onChange={(e) => updateArrayItem(scenarioForm, setScenarioForm, 'mitreMapping', index, e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="e.g., T1566 - Phishing"
                />
                <button
                  onClick={() => removeArrayItem(scenarioForm, setScenarioForm, 'mitreMapping', index)}
                  className="text-red-400 hover:text-red-300 p-2"
                  disabled={scenarioForm.mitreMapping.length === 1}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem(scenarioForm, setScenarioForm, 'mitreMapping')}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              + Add MITRE Mapping
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Detection Rules</label>
            {scenarioForm.detectionRules.map((rule, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => updateArrayItem(scenarioForm, setScenarioForm, 'detectionRules', index, e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="Enter detection rule"
                />
                <button
                  onClick={() => removeArrayItem(scenarioForm, setScenarioForm, 'detectionRules', index)}
                  className="text-red-400 hover:text-red-300 p-2"
                  disabled={scenarioForm.detectionRules.length === 1}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem(scenarioForm, setScenarioForm, 'detectionRules')}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              + Add Detection Rule
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
        <button
          onClick={() => setActiveMode('none')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleScenarioSubmit}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white transition-colors"
        >
          Create Scenario
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🛠️</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Manual Creation Interface</h2>
              <p className="text-gray-400">Create POVs, Templates, and Detection Scenarios with guided forms</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowDocs(!showDocs)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors flex items-center space-x-2"
          >
            <span>📚</span>
            <span>{showDocs ? 'Hide' : 'Show'} Documentation</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveMode('pov')}
            className="p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg hover:bg-blue-900/40 transition-colors group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎯</div>
            <h3 className="text-lg font-bold text-blue-400 mb-2">Create POV</h3>
            <p className="text-sm text-gray-300">Start a new Proof of Value project with comprehensive planning and tracking</p>
          </button>

          <button
            onClick={() => setActiveMode('template')}
            className="p-6 bg-green-900/20 border border-green-500/30 rounded-lg hover:bg-green-900/40 transition-colors group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div>
            <h3 className="text-lg font-bold text-green-400 mb-2">Create Template</h3>
            <p className="text-sm text-gray-300">Design reusable templates for common validation scenarios</p>
          </button>

          <button
            onClick={() => setActiveMode('scenario')}
            className="p-6 bg-purple-900/20 border border-purple-500/30 rounded-lg hover:bg-purple-900/40 transition-colors group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔬</div>
            <h3 className="text-lg font-bold text-purple-400 mb-2">Create Detection Scenario</h3>
            <p className="text-sm text-gray-300">Build Cloud Detection and Response scenarios with MITRE mapping</p>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">12</div>
              <div className="text-sm text-gray-400">Active POVs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">8</div>
              <div className="text-sm text-gray-400">Templates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">24</div>
              <div className="text-sm text-gray-400">Scenarios</div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Frame */}
      {showDocs && (
        <CortexCloudFrame
          title="Cortex Cloud Detection and Response Documentation"
          height="500px"
          className="border-2 border-blue-500"
        />
      )}

      {/* Dynamic Form Rendering */}
      {activeMode === 'pov' && renderPOVForm()}
      {activeMode === 'template' && renderTemplateForm()}
      {activeMode === 'scenario' && renderScenarioForm()}
    </div>
  );
};

export default ManualCreationGUI;
