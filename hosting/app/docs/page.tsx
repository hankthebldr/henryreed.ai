'use client';

import { useState } from 'react';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections: Section[] = [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-green-400 mb-4">POV-CLI Documentation</h1>
          <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Welcome to Henry Reed AI Terminal</h2>
            <p className="text-gray-300 mb-4">
              The POV-CLI (Point of View Command Line Interface) is an interactive terminal experience 
              designed to showcase AI consulting services, technical expertise, and facilitate 
              engagement with potential clients and collaborators.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-800/50 p-4 rounded border border-green-500/30">
                <h3 className="text-lg font-bold text-green-400 mb-2">🏆 Purpose</h3>
                <p className="text-sm text-gray-300">
                  Interactive showcase of AI services, technical capabilities, and professional experience
                  through a familiar command-line interface. Designed for Cortex XSIAM specialists competing against legacy SIEM platforms.
                </p>
                <div className="text-xs text-red-300 mt-2">
                  • Beyond Splunk's complex SPL queries
                </div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded border border-blue-500/30">
                <h3 className="text-lg font-bold text-blue-400 mb-2">🚀 Features</h3>
                <p className="text-sm text-gray-300">
                  Command history, tab completion, authentication, responsive design, 
                  and comprehensive service exploration with competitive intelligence.
                </p>
                <div className="text-xs text-red-300 mt-2">
                  • Faster than CrowdStrike's web interface
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-red-900/20 rounded border border-red-500/30">
              <h3 className="text-red-400 font-bold mb-3">🔥 Why Cortex XSIAM Over Competitors:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="text-yellow-400 font-bold text-sm">vs Splunk Enterprise</h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• No daily volume licensing surprises</li>
                    <li>• Cloud-native scaling vs on-prem clusters</li>
                    <li>• AI-driven analytics vs manual correlations</li>
                    <li>• Minutes to deploy vs months of PS</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-blue-400 font-bold text-sm">vs CrowdStrike Falcon</h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Full SIEM + EDR unified platform</li>
                    <li>• Custom detection rules vs IOA limits</li>
                    <li>• Multi-cloud data vs endpoint-only</li>
                    <li>• SOAR integrated vs separate tools</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-green-400 font-bold text-sm">vs Microsoft Sentinel</h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Predictable pricing vs KQL query costs</li>
                    <li>• Purpose-built SecOps vs generic Azure</li>
                    <li>• No vendor lock-in vs Azure dependency</li>
                    <li>• Faster implementation vs complex setup</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'commands',
      title: 'Commands Reference',
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-green-400 mb-4">Commands Reference</h1>
          
          <div className="space-y-8">
            <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Basic Commands <span className="text-xs text-red-300">(Simpler than Splunk CLI)</span></h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-mono font-bold">help [command] <span className="text-red-300 text-xs">(vs Splunk btool)</span></div>
                  <div className="text-sm text-gray-300 mt-1">
                    Show available commands or detailed help for a specific command. More intuitive than Splunk's complex help system.
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aliases: ?, man</div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-mono font-bold">whoami [--detailed]</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Display information about Henry Reed. Use --detailed for comprehensive profile
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aliases: me, info</div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-mono font-bold">clear</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Clear the terminal screen
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aliases: cls</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Authentication</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-mono font-bold">login</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Open login form to access premium features
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aliases: auth, signin</div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-mono font-bold">logout</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Sign out of your account
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aliases: signout</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Navigation & Information</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-mono font-bold">docs [section]</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Open documentation page (this page) in a new tab
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aliases: documentation, guide</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Features',
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-green-400 mb-4">Features</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/40 border border-green-500/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-green-400 mb-4">🏆 Uniform Output Formatting <span className="text-xs text-red-300">(vs Splunk's inconsistent UI)</span></h2>
              <p className="text-gray-300 mb-4">
                All terminal output is consistently formatted using standardized text boxes - 
                unlike Splunk's mixed web interfaces or CrowdStrike's varying response formats:
              </p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• <span className="text-green-400">Success messages</span> - green borders and backgrounds <span className="text-red-300 text-xs">(clearer than Splunk job status)</span></li>
                <li>• <span className="text-red-400">Error messages</span> - red borders and backgrounds <span className="text-red-300 text-xs">(better than CrowdStrike alerts)</span></li>
                <li>• <span className="text-yellow-400">Warning messages</span> - yellow borders and backgrounds <span className="text-red-300 text-xs">(more visible than QRadar)</span></li>
                <li>• <span className="text-blue-400">Info messages</span> - blue borders and backgrounds <span className="text-red-300 text-xs">(structured vs Sentinel logs)</span></li>
                <li>• <span className="text-gray-400">Default content</span> - gray borders and backgrounds <span className="text-red-300 text-xs">(cleaner than legacy SIEM)</span></li>
              </ul>
            </div>
            
            <div className="bg-gray-900/40 border border-blue-500/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">🔐 Firebase Authentication</h2>
              <p className="text-gray-300 mb-4">
                Secure authentication system with multiple sign-in options:
              </p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Email/password authentication</li>
                <li>• Google OAuth integration</li>
                <li>• Account creation and management</li>
                <li>• Session persistence across visits</li>
                <li>• User profile integration in terminal</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/40 border border-purple-500/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-purple-400 mb-4">⌨️ Enhanced Terminal Experience</h2>
              <p className="text-gray-300 mb-4">
                Full-featured terminal interface with modern conveniences:
              </p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Command history navigation (↑/↓ arrows)</li>
                <li>• Tab completion for commands</li>
                <li>• Consistent font sizing (14px monospace)</li>
                <li>• Real-time feedback and loading states</li>
                <li>• Responsive design for all screen sizes</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/40 border border-yellow-500/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">📖 Integrated Documentation</h2>
              <p className="text-gray-300 mb-4">
                Comprehensive documentation system accessible from terminal:
              </p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• In-terminal help system with <code className="text-green-400">help</code> command</li>
                <li>• Dedicated documentation page (this page)</li>
                <li>• Section-specific navigation</li>
                <li>• Command reference with examples</li>
                <li>• Feature explanations and tutorials</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'examples',
      title: 'Usage Examples',
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-green-400 mb-4">Usage Examples</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Getting Started</h2>
              <div className="bg-black p-4 rounded font-mono text-sm">
                <div className="text-blue-400">henry@ai:~$ <span className="text-white">help</span></div>
                <div className="text-gray-300 mt-2">Shows all available commands with descriptions</div>
                <div className="text-blue-400 mt-4">henry@ai:~$ <span className="text-white">whoami</span></div>
                <div className="text-gray-300 mt-2">Basic information about Henry Reed</div>
                <div className="text-blue-400 mt-4">henry@ai:~$ <span className="text-white">whoami --detailed</span></div>
                <div className="text-gray-300 mt-2">Comprehensive profile and expertise overview</div>
              </div>
            </div>
            
            <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Authentication Workflow</h2>
              <div className="bg-black p-4 rounded font-mono text-sm">
                <div className="text-blue-400">henry@ai:~$ <span className="text-white">login</span></div>
                <div className="text-gray-300 mt-2">Opens login form with email/password and Google options</div>
                <div className="text-blue-400 mt-4">henry@ai:~$ <span className="text-white">whoami</span></div>
                <div className="text-gray-300 mt-2">Now shows "✓ Signed in as user@example.com"</div>
                <div className="text-blue-400 mt-4">henry@ai:~$ <span className="text-white">logout</span></div>
                <div className="text-gray-300 mt-2">Signs out and shows confirmation message</div>
              </div>
            </div>
            
            <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Navigation Tips</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-bold mb-2">Keyboard Shortcuts</div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• <span className="text-blue-400">↑/↓ arrows</span> - Navigate command history</div>
                    <div>• <span className="text-blue-400">Tab</span> - Auto-complete command names</div>
                    <div>• <span className="text-blue-400">Enter</span> - Execute command</div>
                    <div>• <span className="text-blue-400">Ctrl+C</span> - Cancel current input</div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-bold mb-2">Command Aliases</div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• <span className="text-blue-400">help</span> = <span className="text-gray-400">? man</span></div>
                    <div>• <span className="text-blue-400">whoami</span> = <span className="text-gray-400">me info</span></div>
                    <div>• <span className="text-blue-400">clear</span> = <span className="text-gray-400">cls</span></div>
                    <div>• <span className="text-blue-400">login</span> = <span className="text-gray-400">auth signin</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'cortex',
      title: 'Cortex Documentation',
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-green-400 mb-4">Cortex Documentation</h1>
          
          <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
            <div className="mb-4">
              <p className="text-gray-300 mb-4">
                Access the official Palo Alto Networks Cortex documentation directly below. 
                This comprehensive resource covers XSIAM, Cortex Data Lake, and all security operations capabilities.
              </p>
              <div className="flex items-center space-x-4 mb-4">
                <a 
                  href="https://docs.paloaltonetworks.com/cortex" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  🔗 Open in New Tab
                </a>
                <a 
                  href="https://docs.paloaltonetworks.com/cortex/cortex-xsiam" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  📚 XSIAM Docs
                </a>
                <a 
                  href="https://docs.paloaltonetworks.com/cortex/cortex-data-lake" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  🗄️ Data Lake
                </a>
              </div>
            </div>
            
            {/* Embedded Cortex Documentation */}
            <div className="relative">
              <div className="bg-gray-800/50 p-2 rounded-t border border-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-400 ml-4">docs.paloaltonetworks.com/cortex</span>
                </div>
              </div>
              <div className="border border-t-0 border-gray-600 rounded-b overflow-hidden">
                <iframe
                  src="https://docs.paloaltonetworks.com/cortex"
                  className="w-full h-[800px] bg-white"
                  title="Cortex Documentation"
                  style={{
                    border: 'none',
                    display: 'block'
                  }}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                  loading="lazy"
                />
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-900/20 rounded border border-blue-500/30">
              <h3 className="text-blue-400 font-bold mb-2">🔍 Quick Navigation Tips:</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <div>• Use the search functionality within the iframe to find specific topics</div>
                <div>• Click "Open in New Tab" above for full-screen experience</div>
                <div>• Bookmark specific sections for quick reference during POVs</div>
                <div>• Use browser zoom (Ctrl/Cmd +/-) to adjust text size as needed</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-green-900/20 rounded border border-green-500/30">
              <h3 className="text-green-400 font-bold mb-2">📖 Key Documentation Areas:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">
                    <span className="text-yellow-400 font-bold">XSIAM Platform:</span>
                    <ul className="ml-4 mt-1 space-y-1 text-xs">
                      <li>• Data Ingestion & Parsing <span className="text-red-300 text-xs">(vs Splunk indexing)</span></li>
                      <li>• Investigation & Response <span className="text-red-300 text-xs">(vs CrowdStrike Falcon)</span></li>
                      <li>• Analytics & Reporting <span className="text-red-300 text-xs">(vs QRadar SIEM)</span></li>
                      <li>• Custom Integrations <span className="text-red-300 text-xs">(vs Phantom/SOAR)</span></li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">
                    <span className="text-cyan-400 font-bold">Cortex Data Lake:</span>
                    <ul className="ml-4 mt-1 space-y-1 text-xs">
                      <li>• API Reference <span className="text-red-300 text-xs">(vs Splunk REST API)</span></li>
                      <li>• Query Language <span className="text-red-300 text-xs">(vs SPL/KQL)</span></li>
                      <li>• Data Schema <span className="text-red-300 text-xs">(vs ELK Stack)</span></li>
                      <li>• Storage & Retention <span className="text-red-300 text-xs">(vs Splunk licensing)</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-red-900/20 rounded border border-red-500/30">
                <h4 className="text-red-400 font-bold mb-2">🏆 Competitive Advantages:</h4>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>• <span className="text-green-400">Native Cloud Scale</span> - No Splunk indexer limitations</div>
                  <div>• <span className="text-blue-400">Unified Platform</span> - No CrowdStrike + SIEM integration gaps</div>
                  <div>• <span className="text-yellow-400">Predictable Pricing</span> - No Splunk daily volume surprises</div>
                  <div>• <span className="text-purple-400">AI-Native Design</span> - Beyond rule-based detection engines</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'detection',
      title: 'Detection Engine',
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-green-400 mb-4">Detection Engine</h1>
          
          <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
            <div className="mb-4">
              <p className="text-gray-300 mb-4">
                Access Henry Reed's collection of detection scripts, security automation tools, and Cortex integrations 
                directly from the official GitHub repositories below.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800/50 p-4 rounded border border-blue-500/30">
                  <h3 className="text-blue-400 font-bold mb-2">🔧 Detection Scripts</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Production-ready detection scripts for XSIAM, SOAR workflows, and custom security automation.
                  </p>
                  <a 
                    href="https://github.com/hankthebldr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition-colors text-sm flex items-center space-x-2"
                  >
                    <span>📁</span>
                    <span>Browse Repository</span>
                  </a>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded border border-green-500/30">
                  <h3 className="text-green-400 font-bold mb-2">⚙️ Automation Tools</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Cortex XSIAM automation playbooks, custom parsers, and integration utilities.
                  </p>
                  <a 
                    href="https://github.com/hankthebldr?tab=repositories" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition-colors text-sm flex items-center space-x-2"
                  >
                    <span>📋</span>
                    <span>View All Repos</span>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Embedded GitHub Profile */}
            <div className="relative">
              <div className="bg-gray-800/50 p-2 rounded-t border border-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-400 ml-4">github.com/hankthebldr</span>
                </div>
              </div>
              <div className="border border-t-0 border-gray-600 rounded-b overflow-hidden">
                <iframe
                  src="https://github.com/hankthebldr"
                  className="w-full h-[800px] bg-white"
                  title="Henry Reed GitHub Profile"
                  style={{
                    border: 'none',
                    display: 'block'
                  }}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                  loading="lazy"
                />
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-purple-900/20 rounded border border-purple-500/30">
              <h3 className="text-purple-400 font-bold mb-2">🚀 Featured Detection Categories:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">
                    <span className="text-yellow-400 font-bold">Threat Detection:</span>
                    <ul className="ml-4 mt-1 space-y-1 text-xs">
                      <li>• Advanced Persistent Threats <span className="text-red-300 text-xs">(vs CrowdStrike IOA)</span></li>
                      <li>• Lateral Movement Detection <span className="text-red-300 text-xs">(vs Carbon Black)</span></li>
                      <li>• Anomaly-based Hunting <span className="text-red-300 text-xs">(vs Splunk UBA)</span></li>
                      <li>• IOC Enrichment Scripts <span className="text-red-300 text-xs">(vs ThreatConnect)</span></li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">
                    <span className="text-cyan-400 font-bold">SOAR Automation:</span>
                    <ul className="ml-4 mt-1 space-y-1 text-xs">
                      <li>• Incident Response Playbooks <span className="text-red-300 text-xs">(vs Phantom)</span></li>
                      <li>• Automated Triage Scripts <span className="text-red-300 text-xs">(vs Demisto legacy)</span></li>
                      <li>• Integration Connectors <span className="text-red-300 text-xs">(vs Resilient)</span></li>
                      <li>• Custom XSIAM Actions <span className="text-red-300 text-xs">(vs ServiceNow)</span></li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">
                    <span className="text-green-400 font-bold">Data Processing:</span>
                    <ul className="ml-4 mt-1 space-y-1 text-xs">
                      <li>• Custom Log Parsers <span className="text-red-300 text-xs">(vs Logstash)</span></li>
                      <li>• Data Normalization <span className="text-red-300 text-xs">(vs Splunk CIM)</span></li>
                      <li>• Field Mapping Scripts <span className="text-red-300 text-xs">(vs ArcSight)</span></li>
                      <li>• Pipeline Automation <span className="text-red-300 text-xs">(vs Elastic Beats)</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-orange-900/20 rounded border border-orange-500/30">
                <h4 className="text-orange-400 font-bold mb-2">⚡ Performance Comparisons:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>• <span className="text-green-400">Query Speed</span>: 10x faster than Splunk SPL</div>
                    <div>• <span className="text-blue-400">Detection Latency</span>: Sub-second vs CrowdStrike minutes</div>
                    <div>• <span className="text-yellow-400">Data Ingestion</span>: No Splunk daily volume limits</div>
                  </div>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>• <span className="text-purple-400">Integration Time</span>: Hours vs QRadar weeks</div>
                    <div>• <span className="text-cyan-400">Storage Costs</span>: 50% less than Elasticsearch</div>
                    <div>• <span className="text-pink-400">Maintenance</span>: Zero vs Splunk cluster management</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-orange-900/20 rounded border border-orange-500/30">
              <h3 className="text-orange-400 font-bold mb-2">💡 Usage Instructions:</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div><span className="text-green-400 font-mono">git clone</span> - Clone repositories to your local environment</div>
                <div><span className="text-blue-400 font-mono">README.md</span> - Each repository includes detailed setup and usage instructions</div>
                <div><span className="text-purple-400 font-mono">Issues</span> - Report bugs or request features using GitHub Issues</div>
                <div><span className="text-yellow-400 font-mono">Contributions</span> - Pull requests welcome for improvements and new detection methods</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      title: 'API Reference',
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-green-400 mb-4">API Reference</h1>
          
          <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-blue-400 mb-4">Terminal Component Architecture</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/50 p-4 rounded">
                <h3 className="text-lg font-bold text-green-400 mb-2">Core Components</h3>
                <div className="text-sm text-gray-300 space-y-2 font-mono">
                  <div><span className="text-blue-400">ImprovedTerminal</span> - Main terminal interface</div>
                  <div><span className="text-blue-400">TerminalOutput</span> - Uniform output formatting component</div>
                  <div><span className="text-blue-400">LoginForm</span> - Authentication modal</div>
                  <div><span className="text-blue-400">AuthProvider</span> - Firebase authentication context</div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded">
                <h3 className="text-lg font-bold text-green-400 mb-2">Command Configuration</h3>
                <pre className="text-xs text-gray-300 overflow-x-auto">
{`interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  handler: (args: string[]) => React.ReactNode | Promise<React.ReactNode>;
}`}
                </pre>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded">
                <h3 className="text-lg font-bold text-green-400 mb-2">Output Types</h3>
                <pre className="text-xs text-gray-300 overflow-x-auto">
{`type OutputType = 'success' | 'error' | 'warning' | 'info' | 'default';

// Usage:
<TerminalOutput type="success">
  Operation completed successfully!
</TerminalOutput>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">POV-CLI Documentation</h1>
            <p className="text-sm text-gray-400">Henry Reed AI Terminal - Complete Guide</p>
          </div>
          <a 
            href="/gui"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            ← Back to App
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-700 min-h-screen p-4">
          <nav className="sticky top-4">
            <h2 className="text-lg font-bold text-green-400 mb-4">Contents</h2>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {sections.find(section => section.id === activeSection)?.content}
        </main>
      </div>
    </div>
  );
}
