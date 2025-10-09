/**
 * Enhanced Scenario Commands using Registry and Engine Architecture
 * Modern implementation with PANW product integration and business value alignment
 */

import React from 'react';
import { CommandConfig } from './commands';
import { 
  scenarioRegistry, 
  filterScenarios,
  PANWProduct,
  BusinessValueTag,
  EnhancedScenarioConfig
} from './scenario/registry';
import { 
  Provider, 
  DeploymentState, 
  ScenarioDeployment,
  scenarioEngine,
  getActiveDeployments,
  deployScenario,
  validateDeployment,
  exportDeployment,
  destroyDeployment
} from './scenario/engine';

// Enhanced scenario commands with registry integration
export const enhancedScenarioCommands: CommandConfig[] = [
  {
    name: 'scenario',
    description: 'Enhanced security scenario management with PANW product integration',
    usage: 'scenario <command> [options]',
    aliases: ['scenarios', 'sc'],
    handler: (args: string[]): React.ReactNode => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="text-2xl font-bold mb-4">🎯 Enhanced Scenario Management</div>
            <div className="text-gray-300 mb-6">
              Enterprise-grade security scenario orchestration with PANW product integration and business value alignment.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-green-300">Core Commands</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-yellow-300 font-mono">scenario list</span> - Browse scenario registry</div>
                  <div><span className="text-yellow-300 font-mono">scenario generate</span> - Deploy new scenario</div>
                  <div><span className="text-yellow-300 font-mono">scenario status</span> - View deployment status</div>
                  <div><span className="text-yellow-300 font-mono">scenario validate</span> - Run validation tests</div>
                  <div><span className="text-yellow-300 font-mono">scenario export</span> - Generate reports</div>
                  <div><span className="text-yellow-300 font-mono">scenario destroy</span> - Clean up resources</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-purple-300">Advanced Features</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>✨ PANW product integration mapping</div>
                  <div>📊 Business value quantification</div>
                  <div>🔄 Complete lifecycle management</div>
                  <div>📋 MITRE ATT&CK framework alignment</div>
                  <div>💰 Cost tracking and optimization</div>
                  <div>📈 Executive reporting capabilities</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="text-green-300 font-semibold mb-2">🚀 Quick Start</h4>
              <div className="space-y-2 text-sm font-mono">
                <div><span className="text-blue-300">scenario list --detailed</span> <span className="text-cortex-text-secondary"># Browse available scenarios</span></div>
                <div><span className="text-green-300">scenario generate --id cloud-posture-misconfigured-s3</span> <span className="text-cortex-text-secondary"># Deploy scenario</span></div>
                <div><span className="text-purple-300">scenario validate [deployment-id]</span> <span className="text-cortex-text-secondary"># Run validation tests</span></div>
              </div>
            </div>
          </div>
        );
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case 'list':
        case 'ls':
          return listScenariosCommand(subArgs);
        case 'generate':
        case 'deploy':
          return generateScenarioCommand(subArgs);
        case 'status':
        case 'st':
          return statusCommand(subArgs);
        case 'validate':
        case 'val':
          return validateCommand(subArgs);
        case 'export':
        case 'report':
          return exportCommand(subArgs);
        case 'destroy':
        case 'cleanup':
          return destroyCommand(subArgs);
        case 'registry':
        case 'reg':
          return registryCommand(subArgs);
        case 'stats':
        case 'metrics':
          return statsCommand(subArgs);
        default:
          return (
            <div className="text-red-400">
              <div className="font-bold mb-2">❌ Unknown Command</div>
              <div>Unknown subcommand: {subcommand}</div>
              <div className="mt-2 text-gray-300">
                Run <span className="text-blue-300 font-mono">scenario</span> to see available commands.
              </div>
            </div>
          );
      }
    }
  }
];

function listScenariosCommand(args: string[]): React.ReactNode {
  const showDetails = args.includes('--detailed') || args.includes('-d');
  const categoryFilter = extractParam(args, '--category');
  const businessValueFilter = extractParam(args, '--business-value') as BusinessValueTag;
  const productFilter = extractParam(args, '--product') as PANWProduct;
  const complexityFilter = extractParam(args, '--complexity');
  
  // Filter scenarios using registry
  let scenarios: EnhancedScenarioConfig[];
  
  if (categoryFilter || businessValueFilter || productFilter || complexityFilter) {
    scenarios = filterScenarios({
      category: categoryFilter,
      businessValue: businessValueFilter ? [businessValueFilter] : undefined,
      products: productFilter ? [productFilter] : undefined,
      complexity: complexityFilter as any
    });
  } else {
    scenarios = scenarioRegistry.getAll();
  }

  if (scenarios.length === 0) {
    return (
      <div className="text-yellow-300">
        <div className="text-lg font-semibold mb-2">⚠️ No Scenarios Found</div>
        <div>No scenarios match the specified criteria.</div>
        <div className="mt-2">Try different filter options or run <span className="text-blue-300 font-mono">scenario list</span> to see all scenarios.</div>
      </div>
    );
  }

  const stats = scenarioRegistry.getBusinessImpactSummary();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-300">
          🎯 Enhanced Scenario Registry ({scenarios.length} scenarios)
        </div>
        <div className="text-sm text-cortex-text-secondary">
          High Impact: {stats.highImpact} | Medium: {stats.mediumImpact} | Low: {stats.lowImpact}
        </div>
      </div>

      {/* Filter indicators */}
      {(categoryFilter || businessValueFilter || productFilter || complexityFilter) && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-yellow-300 text-sm">Active Filters:</span>
          {categoryFilter && <span className="px-2 py-1 bg-blue-700 rounded text-xs">category: {categoryFilter}</span>}
          {businessValueFilter && <span className="px-2 py-1 bg-green-700 rounded text-xs">value: {businessValueFilter}</span>}
          {productFilter && <span className="px-2 py-1 bg-purple-700 rounded text-xs">product: {productFilter}</span>}
          {complexityFilter && <span className="px-2 py-1 bg-orange-700 rounded text-xs">complexity: {complexityFilter}</span>}
        </div>
      )}
      
      {showDetails ? (
        <div className="space-y-6">
          {scenarios.map((scenario) => renderDetailedScenario(scenario))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => renderCompactScenario(scenario))}
        </div>
      )}

      {/* Usage examples */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-600">
        <h4 className="text-yellow-300 font-bold mb-3">💡 Advanced Filtering Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-mono text-green-400">scenario list --product prisma-cloud</div>
            <div className="text-cortex-text-secondary ml-4">Show Prisma Cloud scenarios</div>
            <div className="font-mono text-blue-400">scenario list --business-value risk-mitigation</div>
            <div className="text-cortex-text-secondary ml-4">Show risk mitigation scenarios</div>
          </div>
          <div className="space-y-2">
            <div className="font-mono text-purple-400">scenario list --category cloud-security --detailed</div>
            <div className="text-cortex-text-secondary ml-4">Detailed cloud security scenarios</div>
            <div className="font-mono text-orange-400">scenario list --complexity beginner</div>
            <div className="text-cortex-text-secondary ml-4">Show beginner-friendly scenarios</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderDetailedScenario(scenario: EnhancedScenarioConfig): React.ReactNode {
  return (
    <div key={scenario.id} className="border border-gray-700 rounded-lg p-6 bg-gray-800">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-semibold text-green-300">{scenario.name}</h3>
          <span className="px-2 py-1 bg-blue-600 rounded text-xs">{scenario.category}</span>
          <span className="px-2 py-1 bg-purple-600 rounded text-xs">{scenario.complexity}</span>
          <span className="px-2 py-1 bg-orange-600 rounded text-xs">v{scenario.version}</span>
        </div>
        <div className="text-right text-sm text-cortex-text-secondary">
          <div>Total: {scenario.estimatedDuration.setup + scenario.estimatedDuration.execution + scenario.estimatedDuration.analysis} min</div>
          <div>Impact: {scenario.businessValue.businessImpact}/5</div>
        </div>
      </div>
      
      <p className="text-gray-300 mb-4">{scenario.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <h4 className="text-blue-300 font-medium mb-2">Business Value</h4>
          <div className="space-y-1 text-sm">
            <div className="text-green-300">{scenario.businessValue.primaryValue.replace('-', ' ')}</div>
            <div className="text-cortex-text-secondary">ROI: {scenario.businessValue.roiTimeframe}</div>
            <div className="text-xs text-yellow-300">
              {scenario.businessValue.quantifiableMetrics.slice(0, 2).map((metric, i) => (
                <div key={i}>• {metric}</div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-purple-300 font-medium mb-2">PANW Products</h4>
          <div className="space-y-1 text-sm">
            {scenario.panwProducts.map((product, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-300">{product.product}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  product.role === 'primary' ? 'bg-green-700 text-green-200' :
                  product.role === 'secondary' ? 'bg-blue-700 text-blue-200' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {product.role}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-red-300 font-medium mb-2">MITRE Techniques</h4>
          <div className="space-y-1 text-sm">
            {scenario.mitreTechniques.map((technique, i) => (
              <div key={i} className="text-gray-300">
                <div className="font-mono text-xs text-yellow-400">{technique.id}</div>
                <div className="text-xs">{technique.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-blue-300 font-medium">Providers:</span>
          <div className="text-gray-300">{scenario.providers.join(', ')}</div>
        </div>
        <div>
          <span className="text-blue-300 font-medium">Use Cases:</span>
          <div className="text-gray-300">{scenario.useCases.slice(0, 3).join(', ')}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {scenario.tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
            {tag}
          </span>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="text-green-300 font-medium">Deploy:</span>
            <span className="text-blue-300 font-mono ml-2">scenario generate --id {scenario.id}</span>
          </div>
          <div className="text-xs text-cortex-text-secondary">
            Last updated: {new Date(scenario.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCompactScenario(scenario: EnhancedScenarioConfig): React.ReactNode {
  return (
    <div key={scenario.id} className="border border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-green-300 font-medium text-sm leading-tight">{scenario.name}</h4>
        <div className="flex gap-1">
          <span className="text-xs text-orange-300 px-1.5 py-0.5 bg-orange-900 rounded">v{scenario.version}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            scenario.businessValue.businessImpact >= 4 ? 'bg-red-700 text-red-200' :
            scenario.businessValue.businessImpact >= 3 ? 'bg-yellow-700 text-yellow-200' :
            'bg-green-700 text-green-200'
          }`}>
            {scenario.businessValue.businessImpact}/5
          </span>
        </div>
      </div>
      
      <p className="text-cortex-text-secondary text-xs mb-3 line-clamp-2">{scenario.description}</p>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-blue-300">{scenario.category}</span>
          <span className="text-purple-300">{scenario.complexity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cortex-text-muted">
            {scenario.estimatedDuration.setup + scenario.estimatedDuration.execution}m
          </span>
          <span className="text-yellow-300">
            {scenario.panwProducts.length} products
          </span>
        </div>
        <div className="text-cortex-text-secondary truncate">
          {scenario.businessValue.primaryValue.replace('-', ' ')}
        </div>
      </div>
    </div>
  );
}

function generateScenarioCommand(args: string[]): React.ReactNode {
  const scenarioId = extractParam(args, '--id');
  const provider = (extractParam(args, '--provider') || 'local') as Provider;
  const region = extractParam(args, '--region');
  const purpose = extractParam(args, '--purpose') || 'technical-validation';
  const customerContext = extractParam(args, '--customer');
  const povId = extractParam(args, '--pov-id');

  if (!scenarioId) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Missing Required Parameter</div>
        <div>Please specify a scenario ID using --id parameter.</div>
        <div className="mt-3 text-gray-300">
          <div>Usage: <span className="text-yellow-300 font-mono">scenario generate --id [scenario-id] --provider [provider]</span></div>
          <div className="mt-2">Run <span className="text-blue-300 font-mono">scenario list</span> to see available scenarios.</div>
        </div>
      </div>
    );
  }

  const scenario = scenarioRegistry.getById(scenarioId);
  if (!scenario) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Scenario Not Found</div>
        <div>Scenario ID '{scenarioId}' not found in registry.</div>
        <div className="mt-2 text-gray-300">
          Run <span className="text-blue-300 font-mono">scenario list</span> to see available scenarios.
        </div>
      </div>
    );
  }

  if (!scenario.providers.includes(provider)) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Provider Not Supported</div>
        <div>Scenario '{scenarioId}' does not support provider '{provider}'.</div>
        <div className="mt-2 text-gray-300">
          Supported providers: {scenario.providers.join(', ')}
        </div>
      </div>
    );
  }

  // Simulate deployment initiation
  return (
    <DeploymentInitiator
      scenario={scenario}
      provider={provider}
      config={{
        region,
        deployedBy: 'current-user',
        purpose,
        customerContext,
        povId
      }}
    />
  );
}

interface DeploymentInitiatorProps {
  scenario: EnhancedScenarioConfig;
  provider: Provider;
  config: {
    region?: string;
    deployedBy: string;
    purpose: string;
    customerContext?: string;
    povId?: string;
  };
}

function DeploymentInitiator({ scenario, provider, config }: DeploymentInitiatorProps): React.ReactNode {
  const [deploymentState, setDeploymentState] = React.useState<'initiating' | 'success' | 'error'>('initiating');
  const [deployment, setDeployment] = React.useState<ScenarioDeployment | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const deploy = async () => {
      try {
        const result = await deployScenario(scenario.id, provider, config);
        setDeployment(result);
        setDeploymentState('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown deployment error');
        setDeploymentState('error');
      }
    };

    const timer = setTimeout(deploy, 2000); // Simulate deployment delay
    return () => clearTimeout(timer);
  }, [scenario.id, provider, config]);

  if (deploymentState === 'initiating') {
    return (
      <div className="text-blue-300">
        <div className="font-bold mb-3">🚀 Initiating Scenario Deployment</div>
        <div className="flex items-center mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400 mr-3"></div>
          <span>Deploying {scenario.name}...</span>
        </div>
        <div className="space-y-2 text-sm text-gray-300">
          <div><strong>Scenario:</strong> {scenario.name}</div>
          <div><strong>Provider:</strong> {provider}</div>
          <div><strong>Estimated Duration:</strong> {scenario.estimatedDuration.setup + scenario.estimatedDuration.execution} minutes</div>
          <div><strong>Business Impact:</strong> {scenario.businessValue.businessImpact}/5</div>
        </div>
      </div>
    );
  }

  if (deploymentState === 'error') {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Deployment Failed</div>
        <div>{error}</div>
      </div>
    );
  }

  if (!deployment) return null;

  return (
    <div className="text-green-300">
      <div className="font-bold mb-4">✅ Scenario Deployment Initiated</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <div><strong>Deployment ID:</strong> <span className="font-mono text-yellow-400">{deployment.id}</span></div>
          <div><strong>Scenario:</strong> {deployment.scenario.name}</div>
          <div><strong>Provider:</strong> {deployment.provider}</div>
          <div><strong>Status:</strong> 
            <span className="ml-2 px-2 py-1 bg-blue-700 rounded text-xs">{deployment.state}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div><strong>Business Value:</strong> {deployment.scenario.businessValue.primaryValue}</div>
          <div><strong>Complexity:</strong> {deployment.scenario.complexity}</div>
          <div><strong>PANW Products:</strong> {deployment.scenario.panwProducts.length}</div>
          <div><strong>MITRE Techniques:</strong> {deployment.scenario.mitreTechniques.length}</div>
        </div>
      </div>

      <div className="p-4 bg-gray-800 rounded-lg border border-blue-600">
        <div className="text-blue-400 font-bold mb-3">📊 Next Steps</div>
        <div className="space-y-2 text-sm">
          <div className="font-mono text-green-400">scenario status {deployment.id}</div>
          <div className="text-cortex-text-secondary ml-4">→ Monitor deployment progress</div>
          <div className="font-mono text-purple-400">scenario validate {deployment.id}</div>
          <div className="text-cortex-text-secondary ml-4">→ Run validation tests when ready</div>
          <div className="font-mono text-blue-400">scenario export {deployment.id} --format pdf</div>
          <div className="text-cortex-text-secondary ml-4">→ Generate executive report</div>
          <div className="font-mono text-red-400">scenario destroy {deployment.id}</div>
          <div className="text-cortex-text-secondary ml-4">→ Clean up resources</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-900 rounded text-green-200 text-sm">
        <strong>Deployment Ready!</strong> Resources are being provisioned. You can begin monitoring the deployment status immediately.
      </div>
    </div>
  );
}

function statusCommand(args: string[]): React.ReactNode {
  if (args.length === 0) {
    const activeDeployments = getActiveDeployments();
    
    if (activeDeployments.length === 0) {
      return (
        <div className="text-yellow-400">
          <div className="font-bold mb-2">📊 No Active Deployments</div>
          <div className="text-gray-300 text-sm">
            Use <span className="font-mono text-green-400">scenario generate</span> to create a new deployment.
          </div>
        </div>
      );
    }

    return (
      <div className="text-blue-300">
        <div className="font-bold mb-4 text-xl">📊 Active Deployments ({activeDeployments.length})</div>
        <div className="space-y-4">
          {activeDeployments.map(deployment => (
            <div key={deployment.id} className="border border-gray-600 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div className="font-mono text-yellow-400">{deployment.id}</div>
                <div className={`px-2 py-1 rounded text-xs ${getStateColor(deployment.state)}`}>
                  {deployment.state}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <div><strong>Scenario:</strong> {deployment.scenario.name}</div>
                  <div><strong>Provider:</strong> {deployment.provider}</div>
                </div>
                <div>
                  <div><strong>Started:</strong> {deployment.startTime.toLocaleString()}</div>
                  <div><strong>Resources:</strong> {deployment.resources.length}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const deploymentId = args[0];
  const deployment = scenarioEngine.getDeployment(deploymentId);
  
  if (!deployment) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Deployment Not Found</div>
        <div>No deployment found with ID: {deploymentId}</div>
      </div>
    );
  }

  return renderDeploymentStatus(deployment);
}

function validateCommand(args: string[]): React.ReactNode {
  if (args.length === 0) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Missing Deployment ID</div>
        <div>Please specify a deployment ID to validate.</div>
        <div className="mt-2 text-gray-300">
          Usage: <span className="text-yellow-300 font-mono">scenario validate [deployment-id]</span>
        </div>
      </div>
    );
  }

  const deploymentId = args[0];
  
  return (
    <ValidationRunner deploymentId={deploymentId} />
  );
}

function exportCommand(args: string[]): React.ReactNode {
  if (args.length === 0) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Missing Deployment ID</div>
        <div>Please specify a deployment ID to export.</div>
        <div className="mt-2 text-gray-300">
          Usage: <span className="text-yellow-300 font-mono">scenario export [deployment-id] --format [pdf|json|csv|markdown]</span>
        </div>
      </div>
    );
  }

  const deploymentId = args[0];
  const format = (extractParam(args, '--format') || 'pdf') as 'pdf' | 'json' | 'csv' | 'markdown';
  
  return (
    <ExportRunner deploymentId={deploymentId} format={format} />
  );
}

function destroyCommand(args: string[]): React.ReactNode {
  if (args.length === 0) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Missing Deployment ID</div>
        <div>Please specify a deployment ID to destroy.</div>
        <div className="mt-2 text-gray-300">
          Usage: <span className="text-yellow-300 font-mono">scenario destroy [deployment-id]</span>
        </div>
      </div>
    );
  }

  const deploymentId = args[0];
  
  return (
    <DestroyRunner deploymentId={deploymentId} />
  );
}

function registryCommand(args: string[]): React.ReactNode {
  const stats = scenarioRegistry.getBusinessImpactSummary();
  const allScenarios = scenarioRegistry.getAll();
  
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📚 Scenario Registry Overview</div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="border border-blue-600 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-300">{allScenarios.length}</div>
          <div className="text-gray-300">Total Scenarios</div>
        </div>
        <div className="border border-green-600 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-300">{stats.highImpact}</div>
          <div className="text-gray-300">High Impact</div>
        </div>
        <div className="border border-purple-600 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-300">
            {new Set(allScenarios.flatMap(s => s.panwProducts.map(p => p.product))).size}
          </div>
          <div className="text-gray-300">PANW Products</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-green-300 font-semibold mb-3">Business Value Distribution</h3>
          <div className="space-y-2">
            {Object.entries(stats.byValue).map(([value, count]) => (
              <div key={value} className="flex justify-between text-sm">
                <span className="text-gray-300">{value.replace('-', ' ')}</span>
                <span className="text-blue-300">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-purple-300 font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2 text-sm">
            <div className="font-mono text-green-400">scenario list --business-value risk-mitigation</div>
            <div className="font-mono text-blue-400">scenario list --product prisma-cloud</div>
            <div className="font-mono text-purple-400">scenario stats</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function statsCommand(args: string[]): React.ReactNode {
  const engineStats = scenarioEngine.getDeploymentStats();
  const registryStats = scenarioRegistry.getBusinessImpactSummary();
  
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📈 Scenario Engine Statistics</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border border-blue-600 p-3 rounded">
          <div className="text-xl font-bold text-blue-300">{engineStats.total}</div>
          <div className="text-sm text-gray-300">Total Deployments</div>
        </div>
        <div className="border border-green-600 p-3 rounded">
          <div className="text-xl font-bold text-green-300">${engineStats.totalCosts.toFixed(2)}</div>
          <div className="text-sm text-gray-300">Total Costs</div>
        </div>
        <div className="border border-purple-600 p-3 rounded">
          <div className="text-xl font-bold text-purple-300">{engineStats.averageDuration}m</div>
          <div className="text-sm text-gray-300">Avg Duration</div>
        </div>
        <div className="border border-yellow-600 p-3 rounded">
          <div className="text-xl font-bold text-yellow-300">{registryStats.highImpact}</div>
          <div className="text-sm text-gray-300">High Impact</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-green-300 font-semibold mb-3">Deployment States</h3>
          <div className="space-y-2">
            {Object.entries(engineStats.byState).map(([state, count]) => (
              <div key={state} className="flex justify-between text-sm">
                <span className="text-gray-300">{state}</span>
                <span className="text-blue-300">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-purple-300 font-semibold mb-3">Provider Usage</h3>
          <div className="space-y-2">
            {Object.entries(engineStats.byProvider).map(([provider, count]) => (
              <div key={provider} className="flex justify-between text-sm">
                <span className="text-gray-300">{provider}</span>
                <span className="text-blue-300">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ValidationRunner({ deploymentId }: { deploymentId: string }): React.ReactNode {
  const [state, setState] = React.useState<'running' | 'success' | 'error'>('running');
  const [results, setResults] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const runValidation = async () => {
      try {
        const validationResults = await validateDeployment(deploymentId);
        setResults(validationResults);
        setState('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Validation failed');
        setState('error');
      }
    };

    const timer = setTimeout(runValidation, 1500);
    return () => clearTimeout(timer);
  }, [deploymentId]);

  if (state === 'running') {
    return (
      <div className="text-blue-300">
        <div className="font-bold mb-3">🔍 Running Validation Tests</div>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400 mr-3"></div>
          <span>Validating deployment {deploymentId}...</span>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Validation Failed</div>
        <div>{error}</div>
      </div>
    );
  }

  const passedTests = results.filter(r => r.status === 'passed').length;
  const failedTests = results.filter(r => r.status === 'failed').length;

  return (
    <div className="text-green-300">
      <div className="font-bold mb-4">✅ Validation Complete</div>
      <div className="mb-4">
        <span className="text-green-300">{passedTests} passed</span>
        {failedTests > 0 && <span className="text-red-300 ml-4">{failedTests} failed</span>}
      </div>
      <div className="space-y-3">
        {results.map((result, i) => (
          <div key={i} className={`p-3 rounded border ${
            result.status === 'passed' ? 'border-green-600 bg-green-900' :
            result.status === 'failed' ? 'border-red-600 bg-red-900' :
            'border-yellow-600 bg-yellow-900'
          }`}>
            <div className="flex justify-between items-start">
              <div className="font-medium">{result.name}</div>
              <div className={`px-2 py-1 rounded text-xs ${
                result.status === 'passed' ? 'bg-green-700 text-green-200' :
                result.status === 'failed' ? 'bg-red-700 text-red-200' :
                'bg-yellow-700 text-yellow-200'
              }`}>
                {result.status}
              </div>
            </div>
            <div className="text-sm text-gray-300 mt-1">{result.message}</div>
            {result.mitreTechnique && (
              <div className="text-xs text-blue-300 mt-1">MITRE: {result.mitreTechnique}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportRunner({ deploymentId, format }: { deploymentId: string; format: string }): React.ReactNode {
  const [state, setState] = React.useState<'generating' | 'success' | 'error'>('generating');
  const [exportData, setExportData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const runExport = async () => {
      try {
        const data = await exportDeployment(deploymentId, format as any);
        setExportData(data);
        setState('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Export failed');
        setState('error');
      }
    };

    const timer = setTimeout(runExport, 1000);
    return () => clearTimeout(timer);
  }, [deploymentId, format]);

  if (state === 'generating') {
    return (
      <div className="text-blue-300">
        <div className="font-bold mb-3">📄 Generating Report</div>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400 mr-3"></div>
          <span>Generating {format.toUpperCase()} report...</span>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Export Failed</div>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="text-green-300">
      <div className="font-bold mb-4">✅ Report Generated Successfully</div>
      <div className="space-y-3">
        <div><strong>Format:</strong> {exportData.format.toUpperCase()}</div>
        <div><strong>Generated:</strong> {exportData.metadata.generatedAt.toLocaleString()}</div>
        <div><strong>Deployment:</strong> {exportData.metadata.deploymentId}</div>
        <div><strong>Scenario:</strong> {exportData.metadata.scenario}</div>
      </div>
      <div className="mt-4 p-3 bg-blue-900 rounded text-blue-200 text-sm">
        <strong>Report Ready!</strong> The {format} report has been generated and is available for download.
      </div>
    </div>
  );
}

function DestroyRunner({ deploymentId }: { deploymentId: string }): React.ReactNode {
  const [state, setState] = React.useState<'destroying' | 'success' | 'error'>('destroying');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const runDestroy = async () => {
      try {
        await destroyDeployment(deploymentId);
        setState('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Destroy failed');
        setState('error');
      }
    };

    const timer = setTimeout(runDestroy, 1000);
    return () => clearTimeout(timer);
  }, [deploymentId]);

  if (state === 'destroying') {
    return (
      <div className="text-blue-300">
        <div className="font-bold mb-3">🗑️ Destroying Deployment</div>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400 mr-3"></div>
          <span>Cleaning up resources...</span>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Destroy Failed</div>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="text-green-300">
      <div className="font-bold mb-4">✅ Deployment Destroyed</div>
      <div className="text-gray-300">
        All resources for deployment {deploymentId} have been successfully cleaned up.
      </div>
    </div>
  );
}

function renderDeploymentStatus(deployment: ScenarioDeployment): React.ReactNode {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📊 Deployment Status</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <div><strong>ID:</strong> <span className="font-mono text-yellow-400">{deployment.id}</span></div>
          <div><strong>Scenario:</strong> {deployment.scenario.name}</div>
          <div><strong>Provider:</strong> {deployment.provider}</div>
          <div><strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${getStateColor(deployment.state)}`}>
              {deployment.state}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div><strong>Started:</strong> {deployment.startTime.toLocaleString()}</div>
          {deployment.endTime && <div><strong>Completed:</strong> {deployment.endTime.toLocaleString()}</div>}
          <div><strong>Resources:</strong> {deployment.resources.length}</div>
          <div><strong>Total Cost:</strong> ${deployment.costs?.totalCost.toFixed(2) || '0.00'}</div>
        </div>
      </div>

      {deployment.resources.length > 0 && (
        <div className="mb-6">
          <h3 className="text-green-300 font-semibold mb-3">🔗 Deployed Resources</h3>
          <div className="space-y-2">
            {deployment.resources.map((resource, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <div>
                  <span className="text-gray-300">{resource.name}</span>
                  <span className="text-xs text-cortex-text-secondary ml-2">({resource.type})</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  resource.status === 'active' ? 'bg-green-700 text-green-200' :
                  resource.status === 'creating' ? 'bg-blue-700 text-blue-200' :
                  resource.status === 'failed' ? 'bg-red-700 text-red-200' :
                  'bg-gray-700 text-gray-200'
                }`}>
                  {resource.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {deployment.validationResults && deployment.validationResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-purple-300 font-semibold mb-3">🧪 Validation Results</h3>
          <div className="text-sm">
            <span className="text-green-300">
              {deployment.validationResults.filter(r => r.status === 'passed').length} passed
            </span>
            <span className="text-red-300 ml-4">
              {deployment.validationResults.filter(r => r.status === 'failed').length} failed
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility Functions
function extractParam(args: string[], paramName: string): string | undefined {
  const param = args.find(arg => arg.startsWith(`${paramName}=`));
  return param ? param.split('=')[1] : undefined;
}

function getStateColor(state: DeploymentState): string {
  switch (state) {
    case 'active':
      return 'bg-green-700 text-green-200';
    case 'failed':
      return 'bg-red-700 text-red-200';
    case 'completed':
      return 'bg-blue-700 text-blue-200';
    case 'destroying':
      return 'bg-orange-700 text-orange-200';
    default:
      return 'bg-gray-700 text-gray-200';
  }
}

export default enhancedScenarioCommands;