'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Terminal, Play, BarChart3, Settings } from 'lucide-react';
import { CleanTerminalPopout, useTerminalPopout } from './ui/CleanTerminalPopout';
import { CleanScenarioCard, ScenarioGrid } from '../lib/scenario/ui/CleanScenarioCard';
import { 
  scenarioRegistry, 
  filterScenarios, 
  EnhancedScenarioConfig, 
  PANWProduct, 
  BusinessValueTag 
} from '../lib/scenario/registry';
import { ImprovedTerminal } from './ImprovedTerminal';

interface FilterState {
  search: string;
  category: string;
  product: PANWProduct | '';
  businessValue: BusinessValueTag | '';
  complexity: string;
  provider: string;
}

export function ScenarioManagementInterface() {
  const [scenarios, setScenarios] = useState<EnhancedScenarioConfig[]>([]);
  const [filteredScenarios, setFilteredScenarios] = useState<EnhancedScenarioConfig[]>([]);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed' | 'minimal'>('compact');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<EnhancedScenarioConfig | null>(null);
  
  const terminalPopout = useTerminalPopout(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    product: '',
    businessValue: '',
    complexity: '',
    provider: ''
  });

  // Load scenarios on component mount
  useEffect(() => {
    const allScenarios = scenarioRegistry.getAll();
    setScenarios(allScenarios);
    setFilteredScenarios(allScenarios);
  }, []);

  // Apply filters whenever filter state changes
  useEffect(() => {
    let filtered = scenarios;

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(scenario =>
        scenario.name.toLowerCase().includes(searchLower) ||
        scenario.description.toLowerCase().includes(searchLower) ||
        scenario.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        scenario.panwProducts.some(product => 
          product.product.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply advanced filters
    if (filters.category || filters.product || filters.businessValue || filters.complexity || filters.provider) {
      filtered = filterScenarios({
        category: filters.category || undefined,
        products: filters.product ? [filters.product] : undefined,
        businessValue: filters.businessValue ? [filters.businessValue] : undefined,
        complexity: (filters.complexity as any) || undefined,
        provider: filters.provider || undefined
      });
    }

    setFilteredScenarios(filtered);
  }, [filters, scenarios]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      product: '',
      businessValue: '',
      complexity: '',
      provider: ''
    });
  };

  const handleScenarioClick = (scenario: EnhancedScenarioConfig) => {
    setSelectedScenario(scenario);
    // You could show a detailed view or execute a command here
  };

  const handleDeployScenario = (scenario: EnhancedScenarioConfig) => {
    terminalPopout.open();
    // Execute scenario deploy command in terminal
    // This would integrate with the ImprovedTerminal component
  };

  const stats = scenarioRegistry.getBusinessImpactSummary();
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Scenario Management</h1>
              <p className="text-sm text-gray-400 mt-1">
                Enterprise security scenario orchestration with PANW integration
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => terminalPopout.toggle()}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Terminal className="w-4 h-4" />
                <span className="text-sm">Terminal</span>
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  showFilters || activeFiltersCount > 0 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-blue-400">{scenarios.length}</div>
            <div className="text-sm text-gray-400">Total Scenarios</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-green-400">{stats.highImpact}</div>
            <div className="text-sm text-gray-400">High Impact</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-purple-400">
              {new Set(scenarios.flatMap(s => s.panwProducts.map(p => p.product))).size}
            </div>
            <div className="text-sm text-gray-400">PANW Products</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-orange-400">{filteredScenarios.length}</div>
            <div className="text-sm text-gray-400">Filtered Results</div>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">View:</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-700">
              {(['minimal', 'compact', 'detailed'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs capitalize transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-800/30 rounded-lg p-6 mb-6 border border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="cloud-security">Cloud Security</option>
                  <option value="endpoint-security">Endpoint Security</option>
                  <option value="network-security">Network Security</option>
                  <option value="data-security">Data Security</option>
                  <option value="identity-security">Identity Security</option>
                  <option value="application-security">Application Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">PANW Product</label>
                <select
                  value={filters.product}
                  onChange={(e) => handleFilterChange('product', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Products</option>
                  <option value="cortex-xsiam">Cortex XSIAM</option>
                  <option value="prisma-cloud">Prisma Cloud</option>
                  <option value="cortex-xdr">Cortex XDR</option>
                  <option value="next-gen-firewall">Next-Gen Firewall</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Business Value</label>
                <select
                  value={filters.businessValue}
                  onChange={(e) => handleFilterChange('businessValue', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Values</option>
                  <option value="risk-mitigation">Risk Mitigation</option>
                  <option value="compliance-automation">Compliance Automation</option>
                  <option value="cost-reduction">Cost Reduction</option>
                  <option value="operational-efficiency">Operational Efficiency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Complexity</label>
                <select
                  value={filters.complexity}
                  onChange={(e) => handleFilterChange('complexity', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
                <select
                  value={filters.provider}
                  onChange={(e) => handleFilterChange('provider', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Providers</option>
                  <option value="gcp">Google Cloud</option>
                  <option value="aws">Amazon AWS</option>
                  <option value="azure">Microsoft Azure</option>
                  <option value="local">Local</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Scenarios Grid */}
        <ScenarioGrid
          scenarios={filteredScenarios}
          variant={viewMode}
          onScenarioClick={handleScenarioClick}
          showActions={true}
          emptyState={
            <div className="text-center py-16">
              <div className="text-gray-400 text-xl mb-4">No scenarios match your criteria</div>
              <div className="text-gray-500 mb-6">
                Try adjusting your filters or search terms
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          }
        />
      </div>

      {/* Terminal Popout */}
      <CleanTerminalPopout
        isOpen={terminalPopout.isOpen}
        onClose={terminalPopout.close}
        onMinimize={terminalPopout.minimize}
        title="Enhanced Scenario Terminal"
        initialPosition={{ x: 150, y: 150 }}
        initialSize={{ width: 900, height: 700 }}
      >
        <div className="h-full">
          <ImprovedTerminal />
        </div>
      </CleanTerminalPopout>
    </div>
  );
}