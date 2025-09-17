import React from 'react';
import { CommandConfig } from './commands';

// Resource Data Models
interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'documentation' | 'template' | 'tool' | 'video' | 'competitive' | 'datasheet';
  type: 'pdf' | 'pptx' | 'docx' | 'xlsx' | 'mp4' | 'url' | 'tool';
  url: string;
  tags: string[];
  lastUpdated: Date;
  downloadCount: number;
  rating: number;
  fileSize?: string;
}

interface DemoEnvironment {
  id: string;
  name: string;
  customer: string;
  useCase: string;
  status: 'active' | 'stopped' | 'provisioning' | 'failed';
  createdAt: Date;
  expiresAt: Date;
  resources: {
    cpu: number;
    memory: string;
    storage: string;
  };
  scenarios: string[];
  accessUrl: string;
}

// Mock resource library
const resourceLibrary: Resource[] = [
  {
    id: 'xsiam-overview-exec',
    title: 'XSIAM Executive Overview',
    description: 'High-level presentation for C-suite stakeholders highlighting business value and ROI',
    category: 'template',
    type: 'pptx',
    url: '/resources/presentations/xsiam-executive-overview.pptx',
    tags: ['executive', 'business-value', 'roi', 'c-suite'],
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    downloadCount: 156,
    rating: 4.8,
    fileSize: '12.4 MB'
  },
  {
    id: 'technical-deep-dive',
    title: 'XSIAM Technical Architecture Deep Dive',
    description: 'Comprehensive technical presentation covering data lake, AI/ML engine, and automation capabilities',
    category: 'template',
    type: 'pptx',
    url: '/resources/presentations/xsiam-technical-deep-dive.pptx',
    tags: ['technical', 'architecture', 'data-lake', 'ai-ml', 'automation'],
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    downloadCount: 89,
    rating: 4.9,
    fileSize: '18.7 MB'
  },
  {
    id: 'roi-calculator',
    title: 'XSIAM ROI Calculator',
    description: 'Interactive spreadsheet for calculating customer-specific return on investment',
    category: 'tool',
    type: 'xlsx',
    url: '/resources/tools/xsiam-roi-calculator.xlsx',
    tags: ['roi', 'calculator', 'business-case', 'cost-analysis'],
    lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    downloadCount: 234,
    rating: 4.7,
    fileSize: '2.1 MB'
  },
  {
    id: 'competitive-splunk',
    title: 'XSIAM vs Splunk Competitive Analysis',
    description: 'Detailed feature comparison, pricing analysis, and positioning guide',
    category: 'competitive',
    type: 'pdf',
    url: '/resources/competitive/xsiam-vs-splunk-analysis.pdf',
    tags: ['competitive', 'splunk', 'comparison', 'positioning'],
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    downloadCount: 67,
    rating: 4.6,
    fileSize: '3.8 MB'
  },
  {
    id: 'deployment-guide',
    title: 'XSIAM Deployment Best Practices',
    description: 'Comprehensive guide for successful XSIAM deployments with common pitfalls and solutions',
    category: 'documentation',
    type: 'pdf',
    url: '/resources/documentation/xsiam-deployment-guide.pdf',
    tags: ['deployment', 'best-practices', 'implementation', 'troubleshooting'],
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    downloadCount: 123,
    rating: 4.5,
    fileSize: '8.2 MB'
  },
  {
    id: 'demo-walkthrough-video',
    title: 'XSIAM Demo Walkthrough - Insider Threat',
    description: 'Video walkthrough of insider threat detection demo scenario with commentary',
    category: 'video',
    type: 'mp4',
    url: '/resources/videos/xsiam-insider-threat-demo.mp4',
    tags: ['demo', 'video', 'insider-threat', 'walkthrough'],
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    downloadCount: 45,
    rating: 4.8,
    fileSize: '245 MB'
  }
];

// Mock demo environments
const demoEnvironments: DemoEnvironment[] = [
  {
    id: 'acme-corp-demo',
    name: 'Acme Corporation Demo Environment',
    customer: 'Acme Corporation',
    useCase: 'SIEM Migration',
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    resources: {
      cpu: 8,
      memory: '32 GB',
      storage: '500 GB'
    },
    scenarios: ['ransomware-detection', 'insider-threat', 'cloud-security'],
    accessUrl: 'https://demo-acme.cortex-dc.com'
  },
  {
    id: 'techstart-pilot',
    name: 'TechStart Pilot Environment',
    customer: 'TechStart Inc',
    useCase: 'XDR Implementation',
    status: 'active',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    resources: {
      cpu: 4,
      memory: '16 GB',
      storage: '250 GB'
    },
    scenarios: ['endpoint-protection', 'network-analysis'],
    accessUrl: 'https://pilot-techstart.cortex-dc.com'
  }
];

export const resourceCommands: CommandConfig[] = [
  {
    name: 'resources',
    description: 'Access documentation, templates, and technical assets',
    usage: 'resources <command> [options]',
    aliases: ['docs', 'assets'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">📚 Resource Management Center</div>
            <div className="text-gray-300 mb-4">
              Access comprehensive library of documentation, templates, tools, and competitive intelligence.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-green-600 p-3 rounded">
                <div className="text-green-400 font-bold mb-2">📄 Documentation & Templates</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-green-300">resources search --category template --tag executive</div>
                  <div className="font-mono text-blue-300">resources download "XSIAM Executive Overview"</div>
                  <div className="font-mono text-purple-300">resources list --recent --popular</div>
                </div>
              </div>
              <div className="border border-orange-600 p-3 rounded">
                <div className="text-orange-400 font-bold mb-2">⚔️ Competitive Intelligence</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-cyan-300">resources competitive --vs splunk --feature-comparison</div>
                  <div className="font-mono text-yellow-300">resources battle-card --competitor qradar</div>
                  <div className="font-mono text-pink-300">resources pricing-guide --scenario enterprise</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-purple-600 p-3 rounded">
                <div className="text-purple-400 font-bold mb-2">🔧 Tools & Calculators</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-green-300">resources tool "ROI Calculator" --customer-size enterprise</div>
                  <div className="font-mono text-blue-300">resources sizing-calculator --data-volume 1TB/day</div>
                </div>
              </div>
              <div className="border border-blue-600 p-3 rounded">
                <div className="text-blue-400 font-bold mb-2">🎬 Videos & Demos</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-cyan-300">resources video --scenario insider-threat</div>
                  <div className="font-mono text-yellow-300">resources demo-library --use-case siem-migration</div>
                </div>
              </div>
            </div>

            <div className="mt-6 border border-yellow-600 p-4 rounded">
              <div className="text-yellow-400 font-bold mb-2">🔥 Popular This Week</div>
              <div className="space-y-1 text-sm">
                <div>📊 XSIAM ROI Calculator - <span className="text-green-400">234 downloads</span></div>
                <div>🎯 Executive Overview Template - <span className="text-blue-400">156 downloads</span></div>
                <div>📚 Deployment Best Practices - <span className="text-purple-400">123 downloads</span></div>
              </div>
            </div>
          </div>
        );
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case 'search':
          return handleResourceSearch(subArgs);
        case 'list':
          return handleResourceList(subArgs);
        case 'download':
          return handleResourceDownload(subArgs);
        case 'competitive':
          return handleResourceCompetitive(subArgs);
        case 'demo':
          return handleDemoEnvironments(subArgs);
        default:
          return (
            <div className="text-red-400">
              Unknown resources command: {subcommand}
              <div className="mt-2 text-gray-300 text-sm">
                Run <span className="font-mono">resources</span> to see available commands.
              </div>
            </div>
          );
      }
    }
  },

  {
    name: 'demo',
    description: 'Manage demonstration environments and scenarios',
    usage: 'demo <command> [options]',
    aliases: ['environment', 'env'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">🎬 Demo Environment Management</div>
            <div className="text-gray-300 mb-4">
              Create, manage, and monitor customer demonstration environments.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-cyan-600 p-3 rounded">
                <div className="text-cyan-400 font-bold mb-2">🚀 Environment Management</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-green-300">demo create --customer "Acme Corp" --use-case siem</div>
                  <div className="font-mono text-blue-300">demo list --active --expiring-soon</div>
                  <div className="font-mono text-purple-300">demo extend --environment acme-demo --days 7</div>
                </div>
              </div>
              <div className="border border-green-600 p-3 rounded">
                <div className="text-green-400 font-bold mb-2">📊 Monitoring & Analytics</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-cyan-300">demo status --environment acme-demo</div>
                  <div className="font-mono text-yellow-300">demo analytics --usage --performance</div>
                  <div className="font-mono text-orange-300">demo feedback --collect --post-demo</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-800 rounded border border-blue-600">
              <div className="text-blue-400 font-bold mb-2">📈 Active Environments</div>
              <div className="text-sm text-gray-300">
                Currently running: <span className="text-green-400">{demoEnvironments.filter(e => e.status === 'active').length}</span> | 
                Expiring soon: <span className="text-yellow-400">1</span> | 
                Total usage: <span className="text-purple-400">156 hours this month</span>
              </div>
            </div>
          </div>
        );
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case 'list':
          return handleDemoList(subArgs);
        case 'create':
          return handleDemoCreate(subArgs);
        case 'status':
          return handleDemoStatus(subArgs);
        case 'analytics':
          return handleDemoAnalytics(subArgs);
        default:
          return (
            <div className="text-red-400">
              Unknown demo command: {subcommand}
            </div>
          );
      }
    }
  }
];

// Resource Command Handlers
const handleResourceSearch = (args: string[]) => {
  const query = args.find(arg => !arg.startsWith('--')) || '';
  const category = args.includes('--category') ? args[args.indexOf('--category') + 1] : null;
  const tag = args.includes('--tag') ? args[args.indexOf('--tag') + 1] : null;

  let filteredResources = resourceLibrary;

  if (category) {
    filteredResources = filteredResources.filter(r => r.category === category);
  }

  if (tag) {
    filteredResources = filteredResources.filter(r => r.tags.includes(tag));
  }

  if (query) {
    filteredResources = filteredResources.filter(r => 
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.description.toLowerCase().includes(query.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
    );
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">
        🔍 Resource Search Results ({filteredResources.length})
      </div>
      
      {filteredResources.length === 0 ? (
        <div className="text-yellow-400">
          No resources found matching your criteria. Try different search terms or categories.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResources.map(resource => (
            <div key={resource.id} className="border border-gray-600 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-green-400">{resource.title}</div>
                <div className="flex gap-2">
                  <div className="text-xs bg-blue-800 text-blue-200 px-2 py-1 rounded">
                    {resource.category}
                  </div>
                  <div className="text-xs bg-purple-800 text-purple-200 px-2 py-1 rounded">
                    {resource.type.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-300 mb-3">{resource.description}</div>
              
              <div className="flex justify-between items-center text-xs">
                <div className="space-x-4">
                  <span className="text-gray-500">
                    Downloads: <span className="text-blue-400">{resource.downloadCount}</span>
                  </span>
                  <span className="text-gray-500">
                    Rating: <span className="text-yellow-400">{resource.rating}/5</span>
                  </span>
                  {resource.fileSize && (
                    <span className="text-gray-500">
                      Size: <span className="text-purple-400">{resource.fileSize}</span>
                    </span>
                  )}
                </div>
                <div className="text-green-400 font-mono">
                  resources download "{resource.title}"
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const handleResourceList = (args: string[]) => {
  const recent = args.includes('--recent');
  const popular = args.includes('--popular');

  let displayResources = [...resourceLibrary];

  if (recent) {
    displayResources = displayResources
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, 10);
  } else if (popular) {
    displayResources = displayResources
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 10);
  }

  const title = recent ? '📅 Recently Updated Resources' : 
                popular ? '🔥 Most Popular Resources' : 
                '📚 All Resources';

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">{title} ({displayResources.length})</div>
      
      <div className="space-y-3">
        {displayResources.map(resource => (
          <div key={resource.id} className="border border-gray-600 p-3 rounded">
            <div className="flex justify-between items-start mb-1">
              <div className="font-bold text-white">{resource.title}</div>
              <div className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                {resource.category}
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-2">{resource.description}</div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex gap-1">
                {resource.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-blue-800 text-blue-200 px-1 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-gray-500">
                {resource.downloadCount} downloads • {resource.rating}/5 ⭐
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const handleResourceDownload = (args: string[]) => {
  const resourceName = args.join(' ').replace(/"/g, '');
  
  if (!resourceName) {
    return (
      <div className="text-red-400">
        Please specify a resource name: <span className="font-mono">resources download "Resource Name"</span>
      </div>
    );
  }

  const resource = resourceLibrary.find(r => 
    r.title.toLowerCase().includes(resourceName.toLowerCase())
  );

  if (!resource) {
    return (
      <div className="text-red-400">
        Resource not found: {resourceName}
        <div className="mt-2 text-gray-300 text-sm">
          Use <span className="font-mono">resources search "{resourceName}"</span> to find similar resources.
        </div>
      </div>
    );
  }

  // Simulate download process
  return (
    <div className="text-green-300">
      <div className="font-bold mb-3 text-lg">📥 Downloading Resource</div>
      
      <div className="border border-green-600 p-4 rounded mb-4">
        <div className="font-bold text-white mb-2">{resource.title}</div>
        <div className="text-sm text-gray-300 mb-3">{resource.description}</div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Category:</strong> {resource.category}</div>
          <div><strong>Type:</strong> {resource.type.toUpperCase()}</div>
          <div><strong>File Size:</strong> {resource.fileSize || 'Unknown'}</div>
          <div><strong>Rating:</strong> {resource.rating}/5 ⭐</div>
        </div>
      </div>

      <div className="bg-green-800 p-3 rounded">
        <div className="text-green-200 font-bold">✅ Download Complete</div>
        <div className="text-sm mt-1">
          Resource saved to downloads folder. Use for your next customer engagement!
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded border border-blue-600">
        <div className="text-blue-400 font-bold">💡 Pro Tip</div>
        <div className="text-sm text-gray-300">
          Customize templates with customer-specific information before presenting.
        </div>
      </div>
    </div>
  );
};

const handleResourceCompetitive = (args: string[]) => {
  const competitor = args.includes('--vs') ? args[args.indexOf('--vs') + 1] : 'splunk';
  
  const competitiveResources = resourceLibrary.filter(r => 
    r.category === 'competitive' && 
    r.tags.includes(competitor.toLowerCase())
  );

  return (
    <div className="text-orange-300">
      <div className="font-bold mb-4 text-xl">⚔️ Competitive Intelligence: XSIAM vs {competitor.charAt(0).toUpperCase() + competitor.slice(1)}</div>
      
      {competitiveResources.length > 0 ? (
        <div className="space-y-4">
          {competitiveResources.map(resource => (
            <div key={resource.id} className="border border-orange-600 p-4 rounded">
              <div className="font-bold text-white mb-2">{resource.title}</div>
              <div className="text-sm text-gray-300 mb-3">{resource.description}</div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {resource.tags.map(tag => (
                    <span key={tag} className="bg-orange-800 text-orange-200 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-green-400 font-mono text-sm">
                  resources download "{resource.title}"
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-yellow-400">
          No competitive resources found for {competitor}. 
          <div className="mt-2 text-sm">Available competitors: Splunk, QRadar, Sentinel, Elastic</div>
        </div>
      )}
    </div>
  );
};

// Demo Environment Handlers
const handleDemoEnvironments = (args: string[]) => {
  return handleDemoList(args);
};

const handleDemoList = (args: string[]) => {
  const active = args.includes('--active');
  const expiringSoon = args.includes('--expiring-soon');

  let environments = [...demoEnvironments];

  if (active) {
    environments = environments.filter(e => e.status === 'active');
  }

  if (expiringSoon) {
    const soonThreshold = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
    environments = environments.filter(e => e.expiresAt <= soonThreshold);
  }

  return (
    <div className="text-cyan-300">
      <div className="font-bold mb-4 text-xl">🎬 Demo Environments ({environments.length})</div>
      
      {environments.length === 0 ? (
        <div className="text-yellow-400">
          No demo environments found matching your criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {environments.map(env => {
            const isExpiringSoon = env.expiresAt <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            
            return (
              <div key={env.id} className="border border-gray-600 p-4 rounded">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-green-400">{env.name}</div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    env.status === 'active' ? 'bg-green-800 text-green-200' :
                    env.status === 'stopped' ? 'bg-gray-800 text-gray-200' :
                    env.status === 'provisioning' ? 'bg-blue-800 text-blue-200' :
                    'bg-red-800 text-red-200'
                  }`}>
                    {env.status.toUpperCase()}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div><strong>Customer:</strong> {env.customer}</div>
                    <div><strong>Use Case:</strong> {env.useCase}</div>
                    <div><strong>Created:</strong> {env.createdAt.toLocaleDateString()}</div>
                    <div className={isExpiringSoon ? 'text-red-400' : ''}>
                      <strong>Expires:</strong> {env.expiresAt.toLocaleDateString()}
                      {isExpiringSoon && ' ⚠️'}
                    </div>
                  </div>
                  <div>
                    <div><strong>CPU:</strong> {env.resources.cpu} cores</div>
                    <div><strong>Memory:</strong> {env.resources.memory}</div>
                    <div><strong>Storage:</strong> {env.resources.storage}</div>
                    <div><strong>Scenarios:</strong> {env.scenarios.length}</div>
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <div className="text-blue-400 font-mono text-sm">
                    {env.accessUrl}
                  </div>
                  <div className="text-green-400 font-mono text-sm">
                    demo status --environment {env.id}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const handleDemoCreate = (args: string[]) => {
  const customer = args.includes('--customer') ? args[args.indexOf('--customer') + 1] : '';
  const useCase = args.includes('--use-case') ? args[args.indexOf('--use-case') + 1] : '';
  
  if (!customer || !useCase) {
    return (
      <div className="text-red-400">
        Missing required parameters.
        <div className="mt-2 text-sm">
          Usage: <span className="font-mono">demo create --customer "Customer Name" --use-case "Use Case"</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-green-300">
      <div className="font-bold mb-3 text-lg">🚀 Creating Demo Environment</div>
      
      <div className="border border-green-600 p-4 rounded mb-4">
        <div className="font-bold text-white mb-2">Environment Configuration</div>
        <div className="space-y-1 text-sm">
          <div><strong>Customer:</strong> {customer.replace(/"/g, '')}</div>
          <div><strong>Use Case:</strong> {useCase.replace(/"/g, '')}</div>
          <div><strong>Resources:</strong> 4 CPU cores, 16 GB RAM, 250 GB storage</div>
          <div><strong>Duration:</strong> 7 days (extendable)</div>
        </div>
      </div>

      <div className="bg-blue-800 p-3 rounded mb-4">
        <div className="text-blue-200 font-bold">⏳ Provisioning in Progress...</div>
        <div className="text-sm mt-1">
          Environment setup typically takes 5-10 minutes. You'll receive access details once complete.
        </div>
      </div>

      <div className="p-3 bg-gray-800 rounded border border-yellow-600">
        <div className="text-yellow-400 font-bold">💡 Next Steps</div>
        <div className="text-sm text-gray-300 mt-1">
          1. Environment will be available at: demo-{customer.toLowerCase().replace(/\s+/g, '-')}.cortex-dc.com<br/>
          2. Load sample data relevant to {useCase}<br/>
          3. Configure scenarios for customer demonstration<br/>
          4. Test all demo paths before customer session
        </div>
      </div>
    </div>
  );
};

const handleDemoStatus = (args: string[]) => {
  const envId = args.includes('--environment') ? args[args.indexOf('--environment') + 1] : '';
  
  if (!envId) {
    return (
      <div className="text-red-400">
        Please specify environment: <span className="font-mono">demo status --environment env-id</span>
      </div>
    );
  }

  const environment = demoEnvironments.find(e => e.id === envId);
  if (!environment) {
    return (
      <div className="text-red-400">Environment not found: {envId}</div>
    );
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📊 Environment Status: {environment.name}</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div><strong>Status:</strong> 
            <span className={`ml-2 ${
              environment.status === 'active' ? 'text-green-400' :
              environment.status === 'stopped' ? 'text-gray-400' :
              'text-yellow-400'
            }`}>
              {environment.status.toUpperCase()}
            </span>
          </div>
          <div><strong>Customer:</strong> {environment.customer}</div>
          <div><strong>Use Case:</strong> {environment.useCase}</div>
          <div><strong>Access URL:</strong> 
            <a href={environment.accessUrl} className="text-blue-400 ml-2 hover:underline">
              {environment.accessUrl}
            </a>
          </div>
        </div>
        <div className="space-y-3">
          <div><strong>Created:</strong> {environment.createdAt.toLocaleDateString()}</div>
          <div><strong>Expires:</strong> 
            <span className="text-yellow-400 ml-2">
              {environment.expiresAt.toLocaleDateString()}
            </span>
          </div>
          <div><strong>CPU Usage:</strong> <span className="text-green-400">45%</span></div>
          <div><strong>Memory Usage:</strong> <span className="text-blue-400">12.8 GB / 16 GB</span></div>
        </div>
      </div>

      <div className="border border-gray-600 p-4 rounded mb-4">
        <div className="text-purple-400 font-bold mb-2">🎯 Loaded Scenarios</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {environment.scenarios.map(scenario => (
            <div key={scenario} className="bg-purple-800 text-purple-200 px-3 py-1 rounded text-sm text-center">
              {scenario.replace(/-/g, ' ')}
            </div>
          ))}
        </div>
      </div>

      <div className="border border-green-600 p-3 rounded">
        <div className="text-green-400 font-bold">✅ Health Check: All Systems Operational</div>
        <div className="text-sm text-gray-300 mt-1">
          • Data ingestion: Active • Analytics engine: Running • Demo scenarios: Ready
        </div>
      </div>
    </div>
  );
};

const handleDemoAnalytics = (args: string[]) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📈 Demo Environment Analytics</div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border border-green-600 p-3 rounded text-center">
          <div className="text-2xl font-bold text-green-400">12</div>
          <div className="text-sm text-gray-300">Active Environments</div>
        </div>
        <div className="border border-blue-600 p-3 rounded text-center">
          <div className="text-2xl font-bold text-blue-400">156</div>
          <div className="text-sm text-gray-300">Hours This Month</div>
        </div>
        <div className="border border-purple-600 p-3 rounded text-center">
          <div className="text-2xl font-bold text-purple-400">89%</div>
          <div className="text-sm text-gray-300">Success Rate</div>
        </div>
        <div className="border border-yellow-600 p-3 rounded text-center">
          <div className="text-2xl font-bold text-yellow-400">4.6</div>
          <div className="text-sm text-gray-300">Avg Rating</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-600 p-4 rounded">
          <div className="text-cyan-400 font-bold mb-3">📊 Usage Patterns</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Peak Usage:</span>
              <span className="text-green-400">2-4 PM EST</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Session:</span>
              <span className="text-blue-400">2.3 hours</span>
            </div>
            <div className="flex justify-between">
              <span>Most Popular Scenario:</span>
              <span className="text-purple-400">Ransomware Detection</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-600 p-4 rounded">
          <div className="text-orange-400 font-bold mb-3">🎯 Performance Metrics</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Avg Response Time:</span>
              <span className="text-green-400">340ms</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="text-blue-400">99.8%</span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate:</span>
              <span className="text-yellow-400">0.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
