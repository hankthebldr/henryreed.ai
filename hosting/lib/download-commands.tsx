import React from 'react';
import { CommandConfig } from './commands';

// Schema for GCP backend calls
export interface GCPBackendSchema {
  service: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  parameters?: Record<string, any>;
  authentication: {
    type: 'service_account' | 'oauth2' | 'api_key';
    credentials: string;
  };
  storage: {
    bucket: string;
    path: string;
  };
  metadata?: Record<string, any>;
}

// Function to generate download URLs and trigger GCP backend calls
const initiateDownload = async (module: string, flags: string[], backendSchema: GCPBackendSchema) => {
  const timestamp = new Date().toISOString();
  const sessionId = Math.random().toString(36).substring(2, 15);
  
  // Simulate GCP backend call
  const gcpCall = {
    ...backendSchema,
    parameters: {
      ...backendSchema.parameters,
      module,
      flags,
      timestamp,
      sessionId
    }
  };
  
  console.log('GCP Backend Call:', gcpCall);
  
  return {
    downloadUrl: `${backendSchema.storage.bucket}/${backendSchema.storage.path}/${module}`,
    sessionId,
    timestamp,
    metadata: backendSchema.metadata
  };
};

export const downloadCommands: CommandConfig[] = [
  {
    name: 'download',
    description: 'Download various AI and security modules',
    usage: 'download [terraform|detection|cdr] [flags]',
    aliases: ['dl', 'get'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-cyan-400">
            <div className="font-bold mb-4 text-xl">📥 Download Center</div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-blue-500 bg-gray-900 p-4 rounded cursor-pointer hover:bg-gray-800">
                  <div className="text-blue-400 font-bold text-lg mb-2">🏗️ Terraform Files</div>
                  <div className="text-gray-300 text-sm mb-3">
                    Infrastructure as Code templates for AI deployments
                  </div>
                  <div className="text-xs text-gray-400 mb-2">Available flags:</div>
                  <div className="space-y-1 text-xs">
                    <div className="text-green-400">--aws</div>
                    <div className="text-blue-400">--gcp</div>
                    <div className="text-purple-400">--azure</div>
                    <div className="text-yellow-400">--kubernetes</div>
                  </div>
                  <div className="mt-3 font-mono text-xs bg-black p-2 rounded">
                    download terraform --gcp --kubernetes
                  </div>
                </div>

                <div className="border border-red-500 bg-gray-900 p-4 rounded cursor-pointer hover:bg-gray-800">
                  <div className="text-red-400 font-bold text-lg mb-2">🛡️ Detection Scripts</div>
                  <div className="text-gray-300 text-sm mb-3">
                    Security detection and monitoring scripts
                  </div>
                  <div className="text-xs text-gray-400 mb-2">Available flags:</div>
                  <div className="space-y-1 text-xs">
                    <div className="text-red-400">--malware</div>
                    <div className="text-orange-400">--network</div>
                    <div className="text-yellow-400">--anomaly</div>
                    <div className="text-green-400">--compliance</div>
                  </div>
                  <div className="mt-3 font-mono text-xs bg-black p-2 rounded">
                    download detection --malware --network
                  </div>
                </div>

                <div className="border border-green-500 bg-gray-900 p-4 rounded cursor-pointer hover:bg-gray-800">
                  <div className="text-green-400 font-bold text-lg mb-2">📦 Cloud Detection and Response (Cloud Detection in a Box)</div>
                  <div className="text-gray-300 text-sm mb-3">
                    Complete cloud detection and response platform
                  </div>
                  <div className="text-xs text-gray-400 mb-2">Available flags:</div>
                  <div className="space-y-1 text-xs">
                    <div className="text-cyan-400">--full</div>
                    <div className="text-blue-400">--lite</div>
                    <div className="text-purple-400">--custom</div>
                  </div>
                  <div className="mt-3 font-mono text-xs bg-black p-2 rounded">
                    download cdr --full
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-800 rounded border border-cyan-600">
                <div className="text-cyan-400 font-bold mb-2">🚀 Quick Start Commands</div>
                <div className="space-y-2 text-sm font-mono">
                  <div className="text-blue-400">download terraform --gcp --kubernetes</div>
                  <div className="text-red-400">download detection --malware --network --anomaly</div>
                  <div className="text-green-400">download cdr --full</div>
                </div>
                <div className="mt-3 text-xs text-gray-300">
                  All downloads include documentation, deployment guides, and support resources.
                </div>
              </div>
            </div>
          </div>
        );
      }

      const module = args[0]?.toLowerCase();
      const flags = args.slice(1);

      return downloadCommands.find(cmd => cmd.name === module)?.handler(flags) || (
        <div className="text-red-400">Unknown module: {module}. Use 'download' to see available options.</div>
      );
    }
  },
  {
    name: 'terraform',
    description: 'Download Terraform infrastructure templates',
    usage: 'terraform [--aws] [--gcp] [--azure] [--kubernetes] [--all]',
    aliases: ['tf', 'infra'],
    handler: async (args) => {
      const aws = args.includes('--aws');
      const gcp = args.includes('--gcp');
      const azure = args.includes('--azure');
      const kubernetes = args.includes('--kubernetes');
      const all = args.includes('--all');

      const backendSchema: GCPBackendSchema = {
        service: 'terraform-templates',
        method: 'GET',
        endpoint: '/api/v1/terraform/templates',
        parameters: {
          providers: all ? ['aws', 'gcp', 'azure'] : args.filter(arg => arg.startsWith('--')).map(arg => arg.slice(2)),
          includeKubernetes: kubernetes || all
        },
        authentication: {
          type: 'service_account',
          credentials: '{{GCP_SERVICE_ACCOUNT_KEY}}'
        },
        storage: {
          bucket: 'henryreed-ai-downloads',
          path: 'terraform-templates'
        },
        metadata: {
          category: 'infrastructure',
          type: 'terraform',
          version: '1.0.0'
        }
      };

      // Simulate the download initiation
      const downloadInfo = await initiateDownload('terraform', args, backendSchema);

      return (
        <div className="text-blue-400">
          <div className="font-bold mb-4 text-xl">🏗️ Terraform Templates Download</div>
          
          <div className="mb-4 p-4 bg-gray-900 rounded border border-blue-500">
            <div className="text-green-400 font-bold mb-2">✅ Download Initiated</div>
            <div className="space-y-2 text-sm">
              <div>Session ID: <span className="font-mono text-cyan-400">{downloadInfo.sessionId}</span></div>
              <div>Timestamp: <span className="font-mono text-gray-300">{downloadInfo.timestamp}</span></div>
            </div>
          </div>

          <div className="space-y-3">
            {(gcp || all) && (
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="text-blue-400 font-bold">🌐 Google Cloud Platform</div>
                <div className="text-sm text-gray-300 mt-1">
                  • GKE cluster configurations<br/>
                  • Cloud Run deployment templates<br/>
                  • AI Platform resource definitions<br/>
                  • IAM and security policies
                </div>
              </div>
            )}

            {(aws || all) && (
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="text-orange-400 font-bold">☁️ Amazon Web Services</div>
                <div className="text-sm text-gray-300 mt-1">
                  • EKS cluster templates<br/>
                  • SageMaker deployment configs<br/>
                  • Lambda function definitions<br/>
                  • VPC and networking setup
                </div>
              </div>
            )}

            {(azure || all) && (
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="text-purple-400 font-bold">⚡ Microsoft Azure</div>
                <div className="text-sm text-gray-300 mt-1">
                  • AKS cluster configurations<br/>
                  • Azure ML workspace setup<br/>
                  • Container Instance templates<br/>
                  • Resource group definitions
                </div>
              </div>
            )}

            {(kubernetes || all) && (
              <div className="border-l-4 border-green-500 pl-4">
                <div className="text-green-400 font-bold">⚙️ Kubernetes Resources</div>
                <div className="text-sm text-gray-300 mt-1">
                  • Deployment manifests<br/>
                  • Service configurations<br/>
                  • Ingress controllers<br/>
                  • Monitoring and logging setup
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-800 rounded border border-blue-600">
            <div className="text-blue-400 font-bold mb-2">📁 Download Package Includes:</div>
            <div className="text-sm text-gray-300 space-y-1">
              <div>• Complete Terraform modules and configurations</div>
              <div>• Deployment and setup documentation</div>
              <div>• Best practices and security guidelines</div>
              <div>• Example variable files and customization guides</div>
              <div>• CI/CD pipeline templates</div>
            </div>
            <div className="mt-3 font-mono text-xs bg-black p-2 rounded">
              Download URL: <span className="text-green-400">{downloadInfo.downloadUrl}</span>
            </div>
          </div>
        </div>
      );
    }
  },
  {
    name: 'detection',
    description: 'Download security detection and monitoring scripts',
    usage: 'detection [--malware] [--network] [--anomaly] [--compliance] [--all]',
    aliases: ['detect', 'security'],
    handler: async (args) => {
      const malware = args.includes('--malware');
      const network = args.includes('--network');
      const anomaly = args.includes('--anomaly');
      const compliance = args.includes('--compliance');
      const all = args.includes('--all');

      const backendSchema: GCPBackendSchema = {
        service: 'security-detection',
        method: 'GET',
        endpoint: '/api/v1/security/detection-scripts',
        parameters: {
          modules: all ? ['malware', 'network', 'anomaly', 'compliance'] : args.filter(arg => arg.startsWith('--')).map(arg => arg.slice(2))
        },
        authentication: {
          type: 'service_account',
          credentials: '{{GCP_SERVICE_ACCOUNT_KEY}}'
        },
        storage: {
          bucket: 'henryreed-ai-security',
          path: 'detection-scripts'
        },
        metadata: {
          category: 'security',
          type: 'detection-scripts',
          version: '2.1.0'
        }
      };

      const downloadInfo = await initiateDownload('detection', args, backendSchema);

      return (
        <div className="text-red-400">
          <div className="font-bold mb-4 text-xl">🛡️ Security Detection Scripts Download</div>
          
          <div className="mb-4 p-4 bg-gray-900 rounded border border-red-500">
            <div className="text-green-400 font-bold mb-2">✅ Download Initiated</div>
            <div className="space-y-2 text-sm">
              <div>Session ID: <span className="font-mono text-cyan-400">{downloadInfo.sessionId}</span></div>
              <div>Timestamp: <span className="font-mono text-gray-300">{downloadInfo.timestamp}</span></div>
            </div>
          </div>

          <div className="space-y-3">
            {(malware || all) && (
              <div className="border-l-4 border-red-500 pl-4">
                <div className="text-red-400 font-bold">🦠 Malware Detection</div>
                <div className="text-sm text-gray-300 mt-1">
                  • YARA rule signatures for advanced threats<br/>
                  • Machine learning-based behavioral analysis<br/>
                  • File hash and reputation checking<br/>
                  • Real-time scanning capabilities
                </div>
              </div>
            )}

            {(network || all) && (
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="text-orange-400 font-bold">🌐 Network Security</div>
                <div className="text-sm text-gray-300 mt-1">
                  • Deep packet inspection scripts<br/>
                  • Intrusion detection signatures<br/>
                  • Traffic flow analysis<br/>
                  • DNS and domain monitoring
                </div>
              </div>
            )}

            {(anomaly || all) && (
              <div className="border-l-4 border-yellow-500 pl-4">
                <div className="text-yellow-400 font-bold">🔍 Anomaly Detection</div>
                <div className="text-sm text-gray-300 mt-1">
                  • Statistical analysis algorithms<br/>
                  • Machine learning models for outlier detection<br/>
                  • User and entity behavior analytics (UEBA)<br/>
                  • Adaptive threshold monitoring
                </div>
              </div>
            )}

            {(compliance || all) && (
              <div className="border-l-4 border-green-500 pl-4">
                <div className="text-green-400 font-bold">📋 Compliance Monitoring</div>
                <div className="text-sm text-gray-300 mt-1">
                  • SOC 2 Type II compliance checks<br/>
                  • GDPR and data privacy monitoring<br/>
                  • PCI-DSS validation scripts<br/>
                  • ISO 27001 control assessments
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-800 rounded border border-red-600">
            <div className="text-red-400 font-bold mb-2">🛠️ Detection Package Includes:</div>
            <div className="text-sm text-gray-300 space-y-1">
              <div>• Production-ready detection scripts and rules</div>
              <div>• Integration guides for SIEM platforms</div>
              <div>• Configuration templates and examples</div>
              <div>• Performance tuning and optimization guides</div>
              <div>• Incident response playbooks</div>
            </div>
            <div className="mt-3 font-mono text-xs bg-black p-2 rounded">
              Download URL: <span className="text-green-400">{downloadInfo.downloadUrl}</span>
            </div>
          </div>
        </div>
      );
    }
  },
  {
    name: 'cdr',
    description: 'Download Cloud Detection and Response (CDR) platform',
    usage: 'cdr [--full] [--lite] [--custom] [--config]',
    aliases: ['cloud-detection', 'detection-box'],
    handler: async (args) => {
      const full = args.includes('--full');
      const lite = args.includes('--lite');
      const custom = args.includes('--custom');
      const config = args.includes('--config');

      // Special handling for Cloud Detection and Response - direct to the specified URL
      const cdrUrl = 'https://raw.githubusercontent.com/hankthebldr/CDR/refs/heads/master/cdr.yml';

      const backendSchema: GCPBackendSchema = {
        service: 'cdr-platform',
        method: 'GET',
        endpoint: '/api/v1/cdr/download',
        parameters: {
          package: full ? 'full' : lite ? 'lite' : custom ? 'custom' : 'standard',
          includeConfig: config || full
        },
        authentication: {
          type: 'service_account',
          credentials: '{{GCP_SERVICE_ACCOUNT_KEY}}'
        },
        storage: {
          bucket: 'henryreed-ai-cdr',
          path: 'cloud-detection-response'
        },
        metadata: {
          category: 'security',
          type: 'cdr-platform',
          version: '3.0.0',
          externalUrl: cdrUrl
        }
      };

      const downloadInfo = await initiateDownload('cdr', args, backendSchema);

      return (
        <div className="text-green-400">
          <div className="font-bold mb-4 text-xl">📦 Cloud Detection & Response (CDR) Download</div>
          
          <div className="mb-4 p-4 bg-gray-900 rounded border border-green-500">
            <div className="text-cyan-400 font-bold mb-2">🎯 Cloud Detection and Response Configuration Direct Access</div>
            <div className="text-sm text-gray-300 mb-2">
              Primary Cloud Detection and Response configuration and deployment files:
            </div>
            <div className="font-mono text-xs bg-black p-2 rounded border border-cyan-600">
              <a 
                href={cdrUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                {cdrUrl}
              </a>
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-900 rounded border border-green-500">
            <div className="text-green-400 font-bold mb-2">✅ Download Package Initiated</div>
            <div className="space-y-2 text-sm">
              <div>Session ID: <span className="font-mono text-cyan-400">{downloadInfo.sessionId}</span></div>
              <div>Timestamp: <span className="font-mono text-gray-300">{downloadInfo.timestamp}</span></div>
              <div>Package Type: <span className="font-mono text-yellow-400">{full ? 'Full' : lite ? 'Lite' : custom ? 'Custom' : 'Standard'}</span></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-green-500 bg-gray-900 p-4 rounded">
              <div className="text-green-400 font-bold text-lg mb-2">🛡️ Complete Detection Platform</div>
              <div className="text-gray-300 text-sm mb-3">
                Cloud Detection & Response provides comprehensive security monitoring and automated response capabilities.
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <div className="text-cyan-400 font-bold">🔍 Detection Capabilities:</div>
                  <div className="text-xs space-y-1">
                    <div className="text-gray-300">• Multi-cloud threat detection</div>
                    <div className="text-gray-300">• Real-time log analysis</div>
                    <div className="text-gray-300">• Behavioral anomaly detection</div>
                    <div className="text-gray-300">• Infrastructure monitoring</div>
                    <div className="text-gray-300">• Container security scanning</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-yellow-400 font-bold">⚡ Response Features:</div>
                  <div className="text-xs space-y-1">
                    <div className="text-gray-300">• Automated incident response</div>
                    <div className="text-gray-300">• Alert correlation and deduplication</div>
                    <div className="text-gray-300">• Threat intelligence integration</div>
                    <div className="text-gray-300">• Custom playbook execution</div>
                    <div className="text-gray-300">• Multi-channel notifications</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {full && (
                <div className="border-l-4 border-green-500 bg-gray-900 p-3 rounded-r">
                  <div className="text-green-400 font-bold">📦 Full Package</div>
                  <div className="text-xs text-gray-300 mt-1">
                    Complete platform with all modules, dashboards, and enterprise features
                  </div>
                </div>
              )}

              {lite && (
                <div className="border-l-4 border-blue-500 bg-gray-900 p-3 rounded-r">
                  <div className="text-blue-400 font-bold">⚡ Lite Package</div>
                  <div className="text-xs text-gray-300 mt-1">
                    Essential detection capabilities for smaller deployments
                  </div>
                </div>
              )}

              {custom && (
                <div className="border-l-4 border-purple-500 bg-gray-900 p-3 rounded-r">
                  <div className="text-purple-400 font-bold">🎛️ Custom Package</div>
                  <div className="text-xs text-gray-300 mt-1">
                    Configurable modules based on specific requirements
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-800 rounded border border-green-600">
            <div className="text-green-400 font-bold mb-2">📥 Cloud Detection and Response Package Contents:</div>
            <div className="text-sm text-gray-300 space-y-1">
              <div>• Docker Compose deployment configurations</div>
              <div>• Kubernetes manifests and Helm charts</div>
              <div>• Detection rule sets and signatures</div>
              <div>• Response playbooks and automation scripts</div>
              <div>• Monitoring dashboards and visualizations</div>
              <div>• Integration guides for cloud providers</div>
              <div>• Security best practices documentation</div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="font-mono text-xs bg-black p-2 rounded">
                Package URL: <span className="text-green-400">{downloadInfo.downloadUrl}</span>
              </div>
              <div className="font-mono text-xs bg-black p-2 rounded">
                Config URL: <span className="text-cyan-400">{cdrUrl}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-800 rounded border border-yellow-600">
            <div className="text-yellow-400 font-bold mb-1">🚀 Quick Start:</div>
            <div className="text-xs text-gray-300 font-mono space-y-1">
              <div>1. wget {cdrUrl}</div>
              <div>2. docker-compose -f cdr.yml up -d</div>
              <div>3. Access dashboard at http://localhost:8080</div>
            </div>
          </div>
        </div>
      );
    }
  }
];

// CLI schema for web-based backend calls
export interface WebCLISchema {
  command: string;
  module: string;
  flags: string[];
  backend: {
    service: string;
    endpoint: string;
    method: string;
    authentication: {
      type: string;
      token?: string;
    };
  };
  gcp: {
    project_id: string;
    region: string;
    service_account: string;
    apis: string[];
  };
  storage: {
    bucket: string;
    object: string;
    permissions: string[];
  };
  metadata: {
    user_session: string;
    timestamp: string;
    user_agent: string;
    ip_address: string;
  };
}

// Function to generate CLI schema for backend calls
export const generateCLISchema = (command: string, module: string, flags: string[]): WebCLISchema => {
  return {
    command,
    module,
    flags,
    backend: {
      service: 'henryreed-ai-api',
      endpoint: `/api/v1/downloads/${module}`,
      method: 'GET',
      authentication: {
        type: 'bearer_token',
        token: '{{API_TOKEN}}'
      }
    },
    gcp: {
      project_id: 'henryreed-ai-platform',
      region: 'us-central1',
      service_account: 'download-service@henryreed-ai-platform.iam.gserviceaccount.com',
      apis: [
        'storage.googleapis.com',
        'compute.googleapis.com',
        'container.googleapis.com',
        'logging.googleapis.com'
      ]
    },
    storage: {
      bucket: `henryreed-ai-${module}-downloads`,
      object: `${module}-${Date.now()}.tar.gz`,
      permissions: ['storage.objects.get', 'storage.objects.list']
    },
    metadata: {
      user_session: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      user_agent: 'POV-CLI/1.0.0',
      ip_address: '{{CLIENT_IP}}'
    }
  };
};

export default downloadCommands;
