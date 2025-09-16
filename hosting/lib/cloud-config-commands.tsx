import React, { useState } from 'react';
import { CommandConfig } from './commands';

// Cloud provider types and configurations
type CloudProvider = 'aws' | 'gcp' | 'azure';

interface CloudCredentials {
  provider: CloudProvider;
  profileName: string;
  region: string;
  accountId?: string;
  projectId?: string;
  subscriptionId?: string;
  credentials: {
    // AWS
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
    // GCP
    serviceAccountKey?: string;
    // Azure
    clientId?: string;
    clientSecret?: string;
    tenantId?: string;
  };
  metadata: {
    createdAt: Date;
    lastValidated?: Date;
    environment: 'dev' | 'staging' | 'prod' | 'lab';
    owner: string;
    description?: string;
  };
  security: {
    encrypted: boolean;
    expiresAt?: Date;
    maxResources: number;
    allowedRegions: string[];
    allowedServices: string[];
  };
}

interface CloudProfile {
  name: string;
  provider: CloudProvider;
  status: 'active' | 'inactive' | 'expired' | 'invalid';
  lastUsed?: Date;
  resourceCount: number;
  credentials: CloudCredentials;
}

// Mock storage for cloud profiles (in production, this would be encrypted)
const cloudProfiles = new Map<string, CloudProfile>();

// Add sample profiles for demonstration
cloudProfiles.set('aws-dev', {
  name: 'aws-dev',
  provider: 'aws',
  status: 'active',
  lastUsed: new Date(),
  resourceCount: 12,
  credentials: {
    provider: 'aws',
    profileName: 'aws-dev',
    region: 'us-west-2',
    accountId: '123456789012',
    credentials: {
      accessKeyId: '***REDACTED***',
      secretAccessKey: '***REDACTED***'
    },
    metadata: {
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      lastValidated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      environment: 'dev',
      owner: 'cdr-lab-admin',
      description: 'Development AWS account for security lab scenarios'
    },
    security: {
      encrypted: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxResources: 50,
      allowedRegions: ['us-west-2', 'us-east-1'],
      allowedServices: ['ec2', 's3', 'iam', 'lambda', 'cloudtrail']
    }
  }
});

cloudProfiles.set('gcp-lab', {
  name: 'gcp-lab',
  provider: 'gcp',
  status: 'active',
  lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  resourceCount: 8,
  credentials: {
    provider: 'gcp',
    profileName: 'gcp-lab',
    region: 'us-central1',
    projectId: 'cdr-lab-project-dev',
    credentials: {
      serviceAccountKey: '***REDACTED***'
    },
    metadata: {
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      lastValidated: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      environment: 'lab',
      owner: 'security-team',
      description: 'GCP project for container security training'
    },
    security: {
      encrypted: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      maxResources: 30,
      allowedRegions: ['us-central1', 'us-west1'],
      allowedServices: ['compute', 'storage', 'container', 'logging']
    }
  }
});

export const cloudConfigCommands: CommandConfig[] = [
  {
    name: 'cloud',
    description: 'Manage cloud provider configurations and credentials',
    usage: 'cloud <command> [options]',
    aliases: ['provider', 'cred'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">☁️ Cloud Provider Management</div>
            <div className="text-gray-300 mb-4">
              Configure and manage cloud provider credentials for CDR Lab scenarios.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-green-600 p-3 rounded">
                <div className="text-green-400 font-bold mb-2">📋 Profile Management</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-green-300">cloud list</div>
                  <div className="font-mono text-blue-300">cloud add --provider aws</div>
                  <div className="font-mono text-purple-300">cloud validate aws-dev</div>
                  <div className="font-mono text-red-300">cloud remove aws-dev</div>
                </div>
              </div>
              <div className="border border-blue-600 p-3 rounded">
                <div className="text-blue-400 font-bold mb-2">🔧 Configuration</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-cyan-300">cloud set-default aws-dev</div>
                  <div className="font-mono text-yellow-300">cloud test-connection aws-dev</div>
                  <div className="font-mono text-purple-300">cloud usage aws-dev</div>
                  <div className="font-mono text-gray-300">cloud export aws-dev</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-800 rounded border border-yellow-600">
              <div className="text-yellow-400 font-bold mb-2">🔒 Security Notice</div>
              <div className="text-sm text-gray-300">
                All credentials are encrypted at rest and in transit. Use dedicated lab accounts 
                with minimal required permissions. Never use production credentials.
              </div>
            </div>
          </div>
        );
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case 'list':
          return handleCloudList(subArgs);
        case 'add':
          return handleCloudAdd(subArgs);
        case 'validate':
          return handleCloudValidate(subArgs);
        case 'remove':
          return handleCloudRemove(subArgs);
        case 'test-connection':
          return handleCloudTest(subArgs);
        case 'usage':
          return handleCloudUsage(subArgs);
        case 'set-default':
          return handleCloudSetDefault(subArgs);
        case 'export':
          return handleCloudExport(subArgs);
        default:
          return (
            <div className="text-red-400">
              Unknown subcommand: {subcommand}
              <div className="mt-2 text-gray-300 text-sm">
                Run <span className="font-mono">cloud</span> to see available commands.
              </div>
            </div>
          );
      }
    }
  }
];

// List all configured cloud profiles
const handleCloudList = (args: string[]) => {
  const showDetails = args.includes('--detailed');
  const provider = args.find(arg => ['aws', 'gcp', 'azure'].includes(arg)) as CloudProvider;
  
  const profiles = Array.from(cloudProfiles.values());
  const filteredProfiles = provider ? profiles.filter(p => p.provider === provider) : profiles;

  if (filteredProfiles.length === 0) {
    return (
      <div className="text-yellow-400">
        <div className="font-bold mb-2">📋 No Cloud Profiles Found</div>
        <div className="text-gray-300 text-sm">
          Add a cloud profile: <span className="font-mono text-green-400">cloud add --provider aws</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">☁️ Cloud Profiles</div>
      <div className="space-y-3">
        {filteredProfiles.map(profile => (
          <div key={profile.name} className="border border-gray-600 p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <div className="font-mono text-yellow-400 text-lg">{profile.name}</div>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  profile.status === 'active' ? 'bg-green-800 text-green-200' :
                  profile.status === 'expired' ? 'bg-red-800 text-red-200' :
                  profile.status === 'invalid' ? 'bg-orange-800 text-orange-200' :
                  'bg-gray-800 text-gray-200'
                }`}>
                  {profile.status.toUpperCase()}
                </span>
                <span className="text-xs bg-blue-800 text-blue-200 px-2 py-1 rounded">
                  {profile.provider.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 text-sm">
                <div><strong>Region:</strong> <span className="text-cyan-400">{profile.credentials.region}</span></div>
                <div><strong>Environment:</strong> <span className="text-purple-400">{profile.credentials.metadata.environment}</span></div>
                <div><strong>Owner:</strong> <span className="text-gray-300">{profile.credentials.metadata.owner}</span></div>
                {profile.credentials.accountId && (
                  <div><strong>Account:</strong> <span className="text-gray-300">{profile.credentials.accountId}</span></div>
                )}
                {profile.credentials.projectId && (
                  <div><strong>Project:</strong> <span className="text-gray-300">{profile.credentials.projectId}</span></div>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <div><strong>Resources:</strong> <span className="text-blue-400">{profile.resourceCount} active</span></div>
                <div><strong>Created:</strong> <span className="text-gray-400">{profile.credentials.metadata.createdAt.toLocaleDateString()}</span></div>
                {profile.lastUsed && (
                  <div><strong>Last Used:</strong> <span className="text-green-400">{profile.lastUsed.toLocaleDateString()}</span></div>
                )}
                {profile.credentials.security.expiresAt && (
                  <div><strong>Expires:</strong> <span className="text-yellow-400">{profile.credentials.security.expiresAt.toLocaleDateString()}</span></div>
                )}
              </div>
            </div>

            {showDetails && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-cyan-400 font-bold mb-2">🔒 Security Settings</div>
                <div className="text-xs space-y-1">
                  <div><strong>Max Resources:</strong> {profile.credentials.security.maxResources}</div>
                  <div><strong>Allowed Regions:</strong> {profile.credentials.security.allowedRegions.join(', ')}</div>
                  <div><strong>Allowed Services:</strong> {profile.credentials.security.allowedServices.join(', ')}</div>
                  <div><strong>Encrypted:</strong> {profile.credentials.security.encrypted ? '✅ Yes' : '❌ No'}</div>
                </div>
              </div>
            )}

            {profile.credentials.metadata.description && (
              <div className="mt-2 text-xs text-gray-400 italic">
                "{profile.credentials.metadata.description}"
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded">
        <div className="text-cyan-400 font-bold mb-2">💡 Quick Actions</div>
        <div className="space-y-1 text-sm">
          <div className="font-mono text-green-400">cloud add --provider gcp --name my-gcp-lab</div>
          <div className="font-mono text-blue-400">cloud validate {filteredProfiles[0]?.name || 'profile-name'}</div>
          <div className="font-mono text-purple-400">cloud usage {filteredProfiles[0]?.name || 'profile-name'}</div>
        </div>
      </div>
    </div>
  );
};

// Add new cloud provider configuration
const handleCloudAdd = (args: string[]) => {
  const providerIndex = args.indexOf('--provider');
  const nameIndex = args.indexOf('--name');
  const interactiveMode = args.includes('--interactive') || args.includes('-i');
  
  const provider = providerIndex >= 0 ? args[providerIndex + 1] as CloudProvider : null;
  const name = nameIndex >= 0 ? args[nameIndex + 1] : null;

  if (!provider || !['aws', 'gcp', 'azure'].includes(provider)) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Invalid Provider</div>
        <div className="text-sm">
          Usage: <span className="font-mono text-yellow-400">cloud add --provider &lt;aws|gcp|azure&gt; --name profile-name</span>
        </div>
        <div className="mt-2 text-gray-300">
          Supported providers: AWS, GCP, Azure
        </div>
      </div>
    );
  }

  if (interactiveMode) {
    return <CloudProfileSetupWizard provider={provider} name={name} />;
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">➕ Add Cloud Profile: {provider.toUpperCase()}</div>
      
      <div className="space-y-4">
        <div className="border border-blue-600 p-4 rounded">
          <div className="text-blue-400 font-bold mb-3">📝 Configuration Steps</div>
          <div className="space-y-2 text-sm">
            {provider === 'aws' && (
              <>
                <div className="text-green-400">1. Create IAM User with programmatic access</div>
                <div className="text-gray-300 ml-4">• Required permissions: EC2, S3, IAM (limited), Lambda</div>
                <div className="text-green-400">2. Generate Access Key and Secret</div>
                <div className="text-green-400">3. Configure profile with credentials</div>
              </>
            )}
            {provider === 'gcp' && (
              <>
                <div className="text-green-400">1. Create Service Account in GCP Console</div>
                <div className="text-gray-300 ml-4">• Required roles: Compute Admin, Storage Admin, Project Viewer</div>
                <div className="text-green-400">2. Generate and download Service Account Key (JSON)</div>
                <div className="text-green-400">3. Configure profile with key file</div>
              </>
            )}
            {provider === 'azure' && (
              <>
                <div className="text-green-400">1. Register Application in Azure AD</div>
                <div className="text-gray-300 ml-4">• Required permissions: VM Contributor, Storage Account Contributor</div>
                <div className="text-green-400">2. Create Client Secret</div>
                <div className="text-green-400">3. Configure profile with App ID and Secret</div>
              </>
            )}
          </div>
        </div>

        <div className="border border-yellow-600 p-4 rounded">
          <div className="text-yellow-400 font-bold mb-2">⚠️ Security Best Practices</div>
          <div className="text-sm text-gray-300 space-y-1">
            <div>• Use dedicated lab accounts separate from production</div>
            <div>• Apply principle of least privilege</div>
            <div>• Set resource limits and spending alerts</div>
            <div>• Enable CloudTrail/Audit logging</div>
            <div>• Rotate credentials regularly</div>
          </div>
        </div>

        <div className="p-3 bg-green-800 rounded">
          <div className="text-green-200 font-bold mb-2">🚀 Interactive Setup</div>
          <div className="text-sm">
            For guided setup: <span className="font-mono text-yellow-400">cloud add --provider {provider} --interactive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Validate cloud provider credentials
const handleCloudValidate = (args: string[]) => {
  const profileName = args[0];
  
  if (!profileName) {
    return (
      <div className="text-red-400">
        Please specify a profile name: <span className="font-mono">cloud validate &lt;profile-name&gt;</span>
      </div>
    );
  }

  const profile = cloudProfiles.get(profileName);
  if (!profile) {
    return (
      <div className="text-red-400">
        Profile '{profileName}' not found. Use <span className="font-mono">cloud list</span> to see available profiles.
      </div>
    );
  }

  // Simulate validation process
  const validationResults = {
    connectivity: true,
    permissions: true,
    quotas: true,
    regions: true,
    services: profile.provider === 'aws' ? ['EC2', 'S3', 'IAM'] : profile.provider === 'gcp' ? ['Compute', 'Storage', 'IAM'] : ['Virtual Machines', 'Storage', 'AD']
  };

  return (
    <div className="text-green-300">
      <div className="font-bold mb-4 text-xl">🔍 Validation Results: {profileName}</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="border border-green-600 p-3 rounded">
            <div className="text-green-400 font-bold">✅ Connectivity</div>
            <div className="text-sm text-gray-300 mt-1">Successfully connected to {profile.provider.toUpperCase()} APIs</div>
          </div>
          
          <div className="border border-green-600 p-3 rounded">
            <div className="text-green-400 font-bold">✅ Permissions</div>
            <div className="text-sm text-gray-300 mt-1">All required permissions validated</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="border border-green-600 p-3 rounded">
            <div className="text-green-400 font-bold">✅ Quotas & Limits</div>
            <div className="text-sm text-gray-300 mt-1">Sufficient quota for lab scenarios</div>
          </div>
          
          <div className="border border-blue-600 p-3 rounded">
            <div className="text-blue-400 font-bold">📍 Available Services</div>
            <div className="text-sm text-gray-300 mt-1 space-y-1">
              {validationResults.services.map(service => (
                <div key={service}>• {service} ✓</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-800 rounded">
        <div className="text-green-200 font-bold">🎉 Profile Valid</div>
        <div className="text-sm mt-1">
          Profile '{profileName}' is ready for CDR Lab scenarios. 
          Last validated: {new Date().toLocaleString()}
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded">
        <div className="text-cyan-400 font-bold mb-2">🚀 Next Steps</div>
        <div className="space-y-1 text-sm">
          <div className="font-mono text-green-400">cdrlab deploy --scenario cryptominer --profile {profileName}</div>
          <div className="font-mono text-blue-400">cdrlab list scenarios --provider {profile.provider}</div>
          <div className="font-mono text-purple-400">cloud usage {profileName}</div>
        </div>
      </div>
    </div>
  );
};

// Test cloud provider connection
const handleCloudTest = async (args: string[]) => {
  const profileName = args[0];
  
  if (!profileName) {
    return (
      <div className="text-red-400">
        Please specify a profile name: <span className="font-mono">cloud test-connection &lt;profile-name&gt;</span>
      </div>
    );
  }

  const profile = cloudProfiles.get(profileName);
  if (!profile) {
    return (
      <div className="text-red-400">
        Profile '{profileName}' not found.
      </div>
    );
  }

  // Simulate connection test
  await new Promise(resolve => setTimeout(resolve, 1500));

  const testResults = [
    { test: 'API Endpoint Connectivity', status: 'passed', latency: '145ms' },
    { test: 'Authentication', status: 'passed', latency: '89ms' },
    { test: 'Service Availability', status: 'passed', latency: '203ms' },
    { test: 'Permission Validation', status: 'passed', latency: '156ms' }
  ];

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">🔗 Connection Test: {profileName}</div>
      
      <div className="space-y-3">
        {testResults.map((test, index) => (
          <div key={index} className="flex justify-between items-center p-3 border border-gray-600 rounded">
            <div className="text-gray-300">{test.test}</div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm">{test.latency}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                test.status === 'passed' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
              }`}>
                {test.status === 'passed' ? '✅ PASS' : '❌ FAIL'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-green-600 p-3 rounded text-center">
          <div className="text-green-400 font-bold">Overall Status</div>
          <div className="text-green-300 text-lg">HEALTHY</div>
        </div>
        <div className="border border-blue-600 p-3 rounded text-center">
          <div className="text-blue-400 font-bold">Avg Latency</div>
          <div className="text-blue-300 text-lg">148ms</div>
        </div>
        <div className="border border-purple-600 p-3 rounded text-center">
          <div className="text-purple-400 font-bold">Uptime</div>
          <div className="text-purple-300 text-lg">99.9%</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-800 rounded">
        <div className="text-green-200 font-bold">✅ Connection Successful</div>
        <div className="text-sm mt-1">
          Profile '{profileName}' is ready for deployment. All connectivity tests passed.
        </div>
      </div>
    </div>
  );
};

// Show cloud resource usage for a profile
const handleCloudUsage = (args: string[]) => {
  const profileName = args[0];
  
  if (!profileName) {
    return (
      <div className="text-red-400">
        Please specify a profile name: <span className="font-mono">cloud usage &lt;profile-name&gt;</span>
      </div>
    );
  }

  const profile = cloudProfiles.get(profileName);
  if (!profile) {
    return (
      <div className="text-red-400">
        Profile '{profileName}' not found.
      </div>
    );
  }

  // Mock usage data
  const usageData = {
    compute: { used: 8, limit: 20, cost: '$45.67' },
    storage: { used: 125, limit: 500, unit: 'GB', cost: '$12.34' },
    network: { used: 245, limit: 1000, unit: 'GB', cost: '$5.89' },
    scenarios: {
      active: 3,
      total: 12,
      recent: ['cryptominer-demo', 'container-escape', 'privilege-escalation']
    }
  };

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📊 Resource Usage: {profileName}</div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="border border-blue-600 p-3 rounded">
          <div className="text-blue-400 font-bold">💻 Compute</div>
          <div className="text-sm mt-2">
            <div>{usageData.compute.used} / {usageData.compute.limit} instances</div>
            <div className="text-green-400">{usageData.compute.cost} this month</div>
          </div>
          <div className="mt-2 bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(usageData.compute.used / usageData.compute.limit) * 100}%`}}></div>
          </div>
        </div>

        <div className="border border-green-600 p-3 rounded">
          <div className="text-green-400 font-bold">💾 Storage</div>
          <div className="text-sm mt-2">
            <div>{usageData.storage.used} / {usageData.storage.limit} {usageData.storage.unit}</div>
            <div className="text-green-400">{usageData.storage.cost} this month</div>
          </div>
          <div className="mt-2 bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{width: `${(usageData.storage.used / usageData.storage.limit) * 100}%`}}></div>
          </div>
        </div>

        <div className="border border-purple-600 p-3 rounded">
          <div className="text-purple-400 font-bold">🌐 Network</div>
          <div className="text-sm mt-2">
            <div>{usageData.network.used} / {usageData.network.limit} {usageData.network.unit}</div>
            <div className="text-green-400">{usageData.network.cost} this month</div>
          </div>
          <div className="mt-2 bg-gray-700 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(usageData.network.used / usageData.network.limit) * 100}%`}}></div>
          </div>
        </div>
      </div>

      <div className="border border-cyan-600 p-4 rounded">
        <div className="text-cyan-400 font-bold mb-3">🎯 Active Scenarios</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm space-y-1">
              <div><strong>Active:</strong> <span className="text-green-400">{usageData.scenarios.active}</span></div>
              <div><strong>Total Run:</strong> <span className="text-blue-400">{usageData.scenarios.total}</span></div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Recent Scenarios:</div>
            <div className="space-y-1">
              {usageData.scenarios.recent.map(scenario => (
                <div key={scenario} className="text-xs bg-gray-800 px-2 py-1 rounded font-mono">
                  {scenario}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded">
        <div className="text-yellow-400 font-bold mb-2">💰 Cost Summary</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div><strong>This Month:</strong> <span className="text-green-400">$63.90</span></div>
            <div><strong>Last Month:</strong> <span className="text-gray-400">$48.23</span></div>
          </div>
          <div>
            <div><strong>Projected:</strong> <span className="text-yellow-400">$85.20</span></div>
            <div><strong>Budget Alert:</strong> <span className="text-green-400">Under limit</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Remove cloud profile
const handleCloudRemove = (args: string[]) => {
  const profileName = args[0];
  const force = args.includes('--force');
  
  if (!profileName) {
    return (
      <div className="text-red-400">
        Please specify a profile name: <span className="font-mono">cloud remove &lt;profile-name&gt;</span>
      </div>
    );
  }

  const profile = cloudProfiles.get(profileName);
  if (!profile) {
    return (
      <div className="text-red-400">
        Profile '{profileName}' not found.
      </div>
    );
  }

  if (profile.resourceCount > 0 && !force) {
    return (
      <div className="text-yellow-400">
        <div className="font-bold mb-2">⚠️ Active Resources Found</div>
        <div className="text-gray-300 mb-3">
          Profile '{profileName}' has {profile.resourceCount} active resources.
        </div>
        <div className="text-sm space-y-1">
          <div>Clean up resources first:</div>
          <div className="font-mono text-red-400">cdrlab cleanup-orphans --scope cloud --profile {profileName}</div>
          <div>Or force removal:</div>
          <div className="font-mono text-orange-400">cloud remove {profileName} --force</div>
        </div>
      </div>
    );
  }

  // Simulate removal
  cloudProfiles.delete(profileName);

  return (
    <div className="text-green-300">
      <div className="font-bold mb-3">🗑️ Profile Removed</div>
      <div className="space-y-2 text-sm">
        <div><strong>Profile:</strong> {profileName}</div>
        <div><strong>Provider:</strong> {profile.provider.toUpperCase()}</div>
        <div><strong>Status:</strong> <span className="text-green-400">Successfully removed</span></div>
      </div>
      
      <div className="mt-4 p-3 bg-green-800 rounded">
        <div className="text-green-200 font-bold">✅ Cleanup Complete</div>
        <div className="text-sm mt-1">
          Profile and all associated configuration removed. Credentials securely wiped.
        </div>
      </div>
    </div>
  );
};

// Set default cloud profile
const handleCloudSetDefault = (args: string[]) => {
  const profileName = args[0];
  
  if (!profileName) {
    return (
      <div className="text-red-400">
        Please specify a profile name: <span className="font-mono">cloud set-default &lt;profile-name&gt;</span>
      </div>
    );
  }

  const profile = cloudProfiles.get(profileName);
  if (!profile) {
    return (
      <div className="text-red-400">
        Profile '{profileName}' not found.
      </div>
    );
  }

  return (
    <div className="text-green-300">
      <div className="font-bold mb-3">🎯 Default Profile Updated</div>
      <div className="space-y-2 text-sm">
        <div><strong>Default Profile:</strong> {profileName}</div>
        <div><strong>Provider:</strong> {profile.provider.toUpperCase()}</div>
        <div><strong>Region:</strong> {profile.credentials.region}</div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-800 rounded">
        <div className="text-blue-200 font-bold">ℹ️ Usage</div>
        <div className="text-sm mt-1">
          This profile will be used automatically when no --profile flag is specified.
        </div>
      </div>
    </div>
  );
};

// Export cloud profile configuration
const handleCloudExport = (args: string[]) => {
  const profileName = args[0];
  const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'yaml';
  
  if (!profileName) {
    return (
      <div className="text-red-400">
        Please specify a profile name: <span className="font-mono">cloud export &lt;profile-name&gt;</span>
      </div>
    );
  }

  const profile = cloudProfiles.get(profileName);
  if (!profile) {
    return (
      <div className="text-red-400">
        Profile '{profileName}' not found.
      </div>
    );
  }

  // Create exportable configuration (without sensitive data)
  const exportConfig = {
    name: profile.name,
    provider: profile.provider,
    region: profile.credentials.region,
    environment: profile.credentials.metadata.environment,
    security: {
      maxResources: profile.credentials.security.maxResources,
      allowedRegions: profile.credentials.security.allowedRegions,
      allowedServices: profile.credentials.security.allowedServices
    },
    metadata: {
      description: profile.credentials.metadata.description,
      owner: profile.credentials.metadata.owner
    }
  };

  const exportData = format === 'json' ? 
    JSON.stringify(exportConfig, null, 2) :
    `# Cloud Profile Export: ${profileName}
name: ${exportConfig.name}
provider: ${exportConfig.provider}
region: ${exportConfig.region}
environment: ${exportConfig.environment}
security:
  maxResources: ${exportConfig.security.maxResources}
  allowedRegions: [${exportConfig.security.allowedRegions.join(', ')}]
  allowedServices: [${exportConfig.security.allowedServices.join(', ')}]
metadata:
  description: "${exportConfig.metadata.description}"
  owner: ${exportConfig.metadata.owner}`;

  return (
    <div className="text-green-300">
      <div className="font-bold mb-4 text-xl">📦 Profile Export: {profileName}</div>
      
      <div className="mb-4">
        <div><strong>Format:</strong> {format.toUpperCase()}</div>
        <div><strong>Generated:</strong> {new Date().toLocaleString()}</div>
      </div>

      <div className="border border-gray-600 p-4 rounded bg-black">
        <div className="text-yellow-400 font-bold mb-2">📄 Configuration</div>
        <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
{exportData}
        </pre>
      </div>

      <div className="mt-4 p-3 bg-yellow-800 rounded">
        <div className="text-yellow-200 font-bold">⚠️ Security Note</div>
        <div className="text-sm mt-1">
          Credentials are not included in exports for security. Re-configure credentials when importing.
        </div>
      </div>
    </div>
  );
};

// Interactive cloud profile setup wizard
const CloudProfileSetupWizard = ({ provider, name }: { provider: CloudProvider; name: string | null }) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">🧙‍♂️ Cloud Profile Setup Wizard</div>
      <div className="text-gray-300 mb-4">
        Setting up {provider.toUpperCase()} profile{name ? ` "${name}"` : ''}
      </div>
      
      <div className="space-y-4">
        <div className="border border-blue-600 p-4 rounded">
          <div className="text-blue-400 font-bold mb-2">Step 1: Basic Information</div>
          <div className="space-y-2 text-sm">
            <div>📝 Profile Name: {name || 'Enter profile name'}</div>
            <div>☁️ Provider: {provider.toUpperCase()}</div>
            <div>🌍 Region: Select your preferred region</div>
            <div>🏷️ Environment: lab | dev | staging</div>
          </div>
        </div>

        <div className="border border-yellow-600 p-4 rounded">
          <div className="text-yellow-400 font-bold mb-2">Step 2: Credentials</div>
          <div className="text-sm text-gray-300">
            {provider === 'aws' && (
              <div className="space-y-1">
                <div>🔑 Access Key ID: Enter your AWS access key</div>
                <div>🔐 Secret Access Key: Enter your AWS secret key</div>
                <div>🎫 Session Token: (Optional for temporary credentials)</div>
              </div>
            )}
            {provider === 'gcp' && (
              <div className="space-y-1">
                <div>📁 Service Account Key: Upload JSON key file</div>
                <div>🏗️ Project ID: Enter your GCP project ID</div>
              </div>
            )}
            {provider === 'azure' && (
              <div className="space-y-1">
                <div>🆔 Client ID: Enter application client ID</div>
                <div>🔐 Client Secret: Enter application secret</div>
                <div>🏢 Tenant ID: Enter your Azure tenant ID</div>
                <div>📋 Subscription ID: Enter subscription ID</div>
              </div>
            )}
          </div>
        </div>

        <div className="border border-green-600 p-4 rounded">
          <div className="text-green-400 font-bold mb-2">Step 3: Security Configuration</div>
          <div className="text-sm text-gray-300 space-y-1">
            <div>🛡️ Maximum Resources: 50 (recommended for lab)</div>
            <div>📍 Allowed Regions: Restrict to specific regions</div>
            <div>⚙️ Allowed Services: Limit to required services only</div>
            <div>⏰ Credential Expiration: Set expiration date</div>
          </div>
        </div>

        <div className="p-3 bg-blue-800 rounded">
          <div className="text-blue-200 font-bold mb-2">🚀 Complete Setup</div>
          <div className="text-sm">
            This is a demonstration of the interactive setup flow. In the full implementation,
            this would collect and validate your credentials securely.
          </div>
        </div>
      </div>
    </div>
  );
};
