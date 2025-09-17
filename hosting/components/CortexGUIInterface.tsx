'use client';

import React, { useState } from 'react';
import EnhancedManualCreationGUI from './EnhancedManualCreationGUI';

interface GUITab {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType;
  description: string;
}

interface QuickAction {
  name: string;
  icon: string;
  description: string;
  onClick: () => void;
  className: string;
}

const POVDashboard = () => {
  // Helper to create a Blueprint PDF from GUI
  const createGuiBlueprintPdf = async () => {
    try {
      const customer = window.prompt('Enter customer name for the Blueprint PDF:', 'Customer') || 'Customer';
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const lines = [
        'POV Badass Blueprint (GUI)',
        `Customer: ${customer}`,
        `Timeframe: 90d`,
        'Engagements: 12',
        'Scenarios Executed: 34',
        'Detections Validated: 78',
        'TRR Win Rate: 82%',
        'Average Cycle: 41 days',
        '',
        'Transformation Journey:',
        '- Current State:',
        '   • Fragmented tooling',
        '   • Manual incident triage',
        '   • Limited detection coverage',
        '- Transition:',
        '   • Unified telemetry to XSIAM',
        '   • Automated playbooks',
        '   • MITRE-aligned detections',
        '- Target State:',
        '   • Proactive threat hunting',
        '   • Continuous validation',
        '   • Business-aligned KPIs'
      ];
      let y = 10;
      doc.setFontSize(14);
      lines.forEach((l, idx) => {
        if (idx === 0) doc.setFont(undefined, 'bold'); else doc.setFont(undefined, 'normal');
        doc.text(l, 10, y);
        y += 8;
        if (y > 280) { doc.addPage(); y = 10; }
      });
      doc.save(`POV_Blueprint_${customer}.pdf`);
    } catch (e) {
      alert('Failed to generate PDF.');
    }
  };

  const quickActions: QuickAction[] = [
    {
      name: 'New POV',
      icon: '🎯',
      description: 'Initialize a new Proof of Value project',
      onClick: () => alert('New POV creation initiated'),
      className: 'bg-green-900 bg-opacity-20 border-green-500 border-opacity-30 hover:bg-green-900 hover:bg-opacity-40 text-green-400'
    },
    {
      name: 'Upload CSV',
      icon: '📊',
      description: 'Import TRR data from CSV file',
      onClick: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = () => alert('CSV upload functionality would be implemented here');
        input.click();
      },
      className: 'bg-blue-900 bg-opacity-20 border-blue-500 border-opacity-30 hover:bg-blue-900 hover:bg-opacity-40 text-blue-400'
    },
    {
      name: 'Generate Report',
      icon: '📝',
      description: 'Create executive or technical report',
      onClick: () => alert('Report generation started'),
      className: 'bg-purple-900 bg-opacity-20 border-purple-500 border-opacity-30 hover:bg-purple-900 hover:bg-opacity-40 text-purple-400'
    },
    {
      name: 'AI Analysis',
      icon: '🤖',
      description: 'Run Gemini AI analysis on current data',
      onClick: () => alert('AI analysis initiated'),
      className: 'bg-cyan-900 bg-opacity-20 border-cyan-500 border-opacity-30 hover:bg-cyan-900 hover:bg-opacity-40 text-cyan-400'
    },
    {
      name: 'Badass Blueprint',
      icon: '🧭',
      description: 'Create transformation blueprint and download PDF',
      onClick: createGuiBlueprintPdf,
      className: 'bg-pink-900 bg-opacity-20 border-pink-500 border-opacity-30 hover:bg-pink-900 hover:bg-opacity-40 text-pink-400'
    }
  ];

  const activityData = [
    { action: 'POV Completed', target: 'Enterprise Banking Corp', time: '2 hours ago', status: 'success' },
    { action: 'Template Deployed', target: 'Ransomware Chain v2.1', time: '4 hours ago', status: 'info' },
    { action: 'Detection Generated', target: 'T1078 Account Access', time: '6 hours ago', status: 'warning' },
    { action: 'TRR Validated', target: 'Multi-Cloud Security', time: '1 day ago', status: 'success' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-gradient-to-r from-green-900 from-opacity-20 to-blue-900 to-opacity-20 p-6 rounded-lg border border-green-500 border-opacity-30">
        <h2 className="text-2xl font-bold text-green-400 mb-4">🎯 POV Management Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-green-500 border-opacity-20">
            <h3 className="text-lg font-bold text-green-300 mb-2">Active POVs</h3>
            <div className="text-3xl font-mono text-green-400">12</div>
            <div className="text-sm text-gray-400 mt-2">3 in progress, 9 completed</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-blue-500 border-opacity-20">
            <h3 className="text-lg font-bold text-blue-300 mb-2">Templates Used</h3>
            <div className="text-3xl font-mono text-blue-400">27</div>
            <div className="text-sm text-gray-400 mt-2">Across 8 scenarios</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-purple-500 border-opacity-20">
            <h3 className="text-lg font-bold text-purple-300 mb-2">Customer Engagements</h3>
            <div className="text-3xl font-mono text-purple-400">8</div>
            <div className="text-sm text-gray-400 mt-2">5 enterprise, 3 mid-market</div>
          </div>
        </div>
      </div>
      
      {/* Activity and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded border border-gray-700">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">📊 Recent Activity</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-800 bg-opacity-30 rounded hover:bg-gray-700 bg-opacity-30 transition-colors">
                <div className="flex-1">
                  <div className="font-mono text-white text-sm">{item.action}</div>
                  <div className="text-gray-400 text-xs">{item.target}</div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-xs font-mono ${
                    item.status === 'success' ? 'text-green-400' : 
                    item.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded border border-gray-700">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`p-4 rounded border transition-all duration-200 text-center hover:scale-105 hover:shadow-lg ${action.className}`}
                title={action.description}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-sm font-mono">{action.name}</div>
              </button>
            ))}
          </div>
          
          {/* Additional Actions */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <h4 className="text-sm font-bold text-gray-300 mb-2">Advanced Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white">
                🔄 Sync with XSIAM tenant
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white">
                📋 Export current dashboard
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white">
                ⚙️ Configure notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TRRManagement = () => {
  const [selectedTRR, setSelectedTRR] = useState<string | null>(null);
  
  const trrData = [
    { id: 'TRR-2024-001', title: 'Multi-Cloud Security Assessment', status: 'Validated', hash: '0x7d4a...f2e9', priority: 'High', assignee: 'John Smith' },
    { id: 'TRR-2024-002', title: 'Zero Trust Architecture Review', status: 'Pending', hash: '0x8c5b...a1d8', priority: 'Medium', assignee: 'Sarah Johnson' },
    { id: 'TRR-2024-003', title: 'SIEM Integration Requirements', status: 'Validated', hash: '0x9f6e...c3b7', priority: 'High', assignee: 'Mike Davis' },
    { id: 'TRR-2024-004', title: 'Cloud Native Security Framework', status: 'In Progress', hash: '0xa8e7...d4c2', priority: 'Low', assignee: 'Lisa Wilson' }
  ];

  const handleCreateTRR = () => {
    alert('New TRR creation form would open here');
  };

  const handleBlockchainSign = (id: string) => {
    alert(`Blockchain signing initiated for ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-gradient-to-r from-orange-900 from-opacity-20 to-red-900 to-opacity-20 p-6 rounded-lg border border-orange-500 border-opacity-30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-orange-400">📊 TRR Management Center</h2>
          <button 
            onClick={handleCreateTRR}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-mono"
          >
            + New TRR
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-orange-500 border-opacity-20 hover:bg-opacity-70 transition-all">
            <h3 className="text-sm font-bold text-orange-300 mb-2">Total TRRs</h3>
            <div className="text-2xl font-mono text-orange-400">145</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-green-500 border-opacity-20 hover:bg-opacity-70 transition-all">
            <h3 className="text-sm font-bold text-green-300 mb-2">Completed</h3>
            <div className="text-2xl font-mono text-green-400">128</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-yellow-500 border-opacity-20 hover:bg-opacity-70 transition-all">
            <h3 className="text-sm font-bold text-yellow-300 mb-2">In Progress</h3>
            <div className="text-2xl font-mono text-yellow-400">12</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-red-500 border-opacity-20 hover:bg-opacity-70 transition-all">
            <h3 className="text-sm font-bold text-red-300 mb-2">Blocked</h3>
            <div className="text-2xl font-mono text-red-400">5</div>
          </div>
        </div>
      </div>
      
      {/* TRR List and Blockchain Validations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TRR List */}
        <div className="lg:col-span-2 bg-gray-900 bg-opacity-50 p-6 rounded border border-gray-700">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">📝 Active TRRs</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {trrData.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded border cursor-pointer transition-all hover:bg-gray-700 hover:bg-opacity-30 ${
                  selectedTRR === item.id ? 'border-cyan-500 bg-gray-800 bg-opacity-50' : 'border-gray-600 bg-gray-800 bg-opacity-30'
                }`}
                onClick={() => setSelectedTRR(selectedTRR === item.id ? null : item.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="font-mono text-white text-sm">{item.id}</div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.priority === 'High' ? 'bg-red-900 bg-opacity-30 text-red-400' :
                        item.priority === 'Medium' ? 'bg-yellow-900 bg-opacity-30 text-yellow-400' :
                        'bg-gray-700 bg-opacity-50 text-gray-300'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs mb-2">{item.title}</div>
                    <div className="text-gray-500 text-xs">Assigned: {item.assignee}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-sm font-mono mb-1 ${
                      item.status === 'Validated' ? 'text-green-400' : 
                      item.status === 'In Progress' ? 'text-blue-400' : 'text-yellow-400'
                    }`}>
                      {item.status}
                    </div>
                    {item.status === 'Validated' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleBlockchainSign(item.id); }}
                        className="text-xs text-purple-400 hover:text-purple-300 underline"
                      >
                        View Proof
                      </button>
                    )}
                  </div>
                </div>
                {selectedTRR === item.id && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="text-xs text-gray-400 space-y-1">
                      <div><strong>Hash:</strong> {item.hash}</div>
                      <div><strong>Created:</strong> 2 days ago</div>
                      <div><strong>Last Updated:</strong> 1 hour ago</div>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors">
                        Sign
                      </button>
                      <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors">
                        Export
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Blockchain Summary */}
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded border border-gray-700">
          <h3 className="text-xl font-bold text-purple-400 mb-4">🔐 Blockchain Status</h3>
          <div className="space-y-4">
            <div className="p-3 bg-green-900 bg-opacity-20 rounded border border-green-500 border-opacity-30">
              <div className="text-green-400 font-mono text-sm">Signed TRRs</div>
              <div className="text-2xl font-mono text-green-300">128</div>
            </div>
            <div className="p-3 bg-yellow-900 bg-opacity-20 rounded border border-yellow-500 border-opacity-30">
              <div className="text-yellow-400 font-mono text-sm">Pending Signature</div>
              <div className="text-2xl font-mono text-yellow-300">17</div>
            </div>
            <div className="p-3 bg-blue-900 bg-opacity-20 rounded border border-blue-500 border-opacity-30">
              <div className="text-blue-400 font-mono text-sm">Network Health</div>
              <div className="text-sm font-mono text-blue-300">99.9% Uptime</div>
            </div>
            
            <div className="pt-4 border-t border-gray-600">
              <h4 className="text-sm font-bold text-gray-300 mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white">
                  📊 Upload CSV
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white">
                  📝 Generate Report
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white">
                  🔍 Verify Signatures
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIInsights = () => {
  const [chatInput, setChatInput] = useState('');
  const [analysisType, setAnalysisType] = useState('pov');
  
  const recommendations = [
    {
      title: 'POV Optimization Suggestion',
      content: 'Consider focusing on cloud-native security scenarios for the enterprise banking client based on their infrastructure profile.',
      confidence: '94%',
      type: 'optimization',
      timestamp: '2 hours ago'
    },
    {
      title: 'Detection Rule Enhancement',
      content: 'T1078 detection rules can be improved by adding behavioral analysis patterns for this customer environment.',
      confidence: '87%',
      type: 'detection',
      timestamp: '4 hours ago'
    },
    {
      title: 'Risk Assessment Update',
      content: 'Multi-cloud deployment introduces additional attack vectors that should be addressed in the next TRR cycle.',
      confidence: '91%',
      type: 'risk',
      timestamp: '1 day ago'
    }
  ];

  const handleStartAnalysis = () => {
    alert(`Starting ${analysisType} analysis with Gemini AI...`);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      alert(`AI Chat: "${chatInput}" - This would connect to Gemini AI`);
      setChatInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Stats and Controls */}
      <div className="bg-gradient-to-r from-indigo-900 from-opacity-20 to-purple-900 to-opacity-20 p-6 rounded-lg border border-indigo-500 border-opacity-30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-indigo-400">🤖 Gemini AI Insights</h2>
          <div className="flex items-center space-x-2">
            <select 
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-1 text-sm border border-gray-600"
            >
              <option value="pov">POV Analysis</option>
              <option value="trr">TRR Analysis</option>
              <option value="scenario">Scenario Optimization</option>
              <option value="detection">Detection Rules</option>
            </select>
            <button 
              onClick={handleStartAnalysis}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-mono"
            >
              Analyze
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-indigo-500 border-opacity-20 hover:bg-opacity-70 transition-all">
            <h3 className="text-lg font-bold text-indigo-300 mb-2">Analyses Generated</h3>
            <div className="text-3xl font-mono text-indigo-400">89</div>
            <div className="text-sm text-gray-400 mt-2">This month</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-purple-500 border-opacity-20 hover:bg-opacity-70 transition-all">
            <h3 className="text-lg font-bold text-purple-300 mb-2">Optimizations</h3>
            <div className="text-3xl font-mono text-purple-400">34</div>
            <div className="text-sm text-gray-400 mt-2">Implemented</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-cyan-500 border-opacity-20 hover:bg-opacity-70 transition-all">
            <h3 className="text-lg font-bold text-cyan-300 mb-2">Chat Sessions</h3>
            <div className="text-3xl font-mono text-cyan-400">156</div>
            <div className="text-sm text-gray-400 mt-2">Active conversations</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendations */}
        <div className="lg:col-span-2 bg-gray-900 bg-opacity-50 p-6 rounded border border-gray-700">
          <h3 className="text-xl font-bold text-green-400 mb-4">💡 AI Recommendations</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 bg-gray-800 bg-opacity-30 rounded border border-gray-600 hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-mono text-white text-sm font-bold">{rec.title}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="text-green-400 text-xs font-mono">{rec.confidence}</div>
                    <div className="text-gray-500 text-xs">{rec.timestamp}</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">{rec.content}</p>
                <div className="flex justify-between items-center">
                  <div className={`text-xs inline-block px-2 py-1 rounded ${
                    rec.type === 'optimization' ? 'bg-blue-900 bg-opacity-30 text-blue-400' :
                    rec.type === 'detection' ? 'bg-cyan-900 bg-opacity-30 text-cyan-400' :
                    'bg-red-900 bg-opacity-30 text-red-400'
                  }`}>
                    {rec.type}
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors">
                      Apply
                    </button>
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* AI Chat Interface */}
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded border border-gray-700">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">💬 AI Chat</h3>
          
          {/* Chat Messages */}
          <div className="bg-gray-800 bg-opacity-50 rounded p-4 mb-4 h-48 overflow-y-auto">
            <div className="space-y-3">
              <div className="text-sm">
                <div className="text-cyan-400 font-mono">Gemini AI:</div>
                <div className="text-gray-300 mt-1">Hello! I'm ready to help with your POV analysis, TRR reviews, and security optimizations. What would you like to explore?</div>
              </div>
              <div className="text-sm">
                <div className="text-green-400 font-mono">You:</div>
                <div className="text-gray-300 mt-1">Analyze the current POV for banking client</div>
              </div>
              <div className="text-sm">
                <div className="text-cyan-400 font-mono">Gemini AI:</div>
                <div className="text-gray-300 mt-1">Based on the banking client's infrastructure, I recommend focusing on cloud-native security scenarios and zero-trust architecture validation...</div>
              </div>
            </div>
          </div>
          
          {/* Chat Input */}
          <form onSubmit={handleChatSubmit} className="flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Gemini AI..."
              className="flex-1 bg-gray-800 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-cyan-500 focus:outline-none"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors text-sm"
            >
              Send
            </button>
          </form>
          
          <div className="mt-4 pt-4 border-t border-gray-600">
            <h4 className="text-sm font-bold text-gray-300 mb-2">AI Tools</h4>
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white">
                🕰 Schedule Analysis
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white">
                📋 Export Insights
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white">
                ⚙️ AI Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const guiTabs: GUITab[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    component: POVDashboard,
    description: 'Overview of POVs, metrics, and activity'
  },
  {
    id: 'trr',
    name: 'TRR Management',
    icon: '📋',
    component: TRRManagement,
    description: 'Technical Requirements Review and blockchain validations'
  },
  {
    id: 'ai',
    name: 'AI Insights',
    icon: '🤖',
    component: AIInsights,
    description: 'Gemini AI analysis and recommendations'
  },
  {
    id: 'creator',
    name: 'Content Creator',
    icon: '🛠️',
    component: EnhancedManualCreationGUI,
    description: 'Create POVs, templates, and scenarios visually'
  }
];

export default function CortexGUIInterface() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const ActiveComponent = guiTabs.find(tab => tab.id === activeTab)?.component || POVDashboard;

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Tab Navigation (header handled globally) */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex space-x-1 overflow-x-auto">
          {guiTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors whitespace-nowrap flex items-center space-x-2 ${
                activeTab === tab.id 
                  ? 'text-cyan-400 border-cyan-500 bg-gray-800/50' 
                  : 'text-gray-400 border-gray-600 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Description */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center space-x-3 text-sm">
          <span className="text-cyan-400">
            {guiTabs.find(tab => tab.id === activeTab)?.icon} {guiTabs.find(tab => tab.id === activeTab)?.name}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">{guiTabs.find(tab => tab.id === activeTab)?.description}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <ActiveComponent />
      </div>
    </div>
  );
}
