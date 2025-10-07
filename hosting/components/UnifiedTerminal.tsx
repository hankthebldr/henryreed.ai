'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { userManagementService } from '../lib/user-management';
import { TerminalOutput } from './TerminalOutput';

// RBAC Permission System
export interface TerminalPermissions {
  canExecuteBasicCommands: boolean;
  canExecuteAdvancedCommands: boolean;
  canAccessSystemCommands: boolean;
  canAccessManagementCommands: boolean;
  canAccessScenarioCommands: boolean;
  canAccessAdminCommands: boolean;
  canViewUserData: boolean;
  canViewAggregatedData: boolean;
  canManageUsers: boolean;
  canDeployScenarios: boolean;
}

interface Command {
  input: string;
  output: React.ReactNode;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  requiredPermissions: (keyof TerminalPermissions)[];
  category: 'basic' | 'advanced' | 'system' | 'management' | 'scenario' | 'admin';
  handler: (args: string[], ctx: CommandContext) => React.ReactNode | Promise<React.ReactNode>;
}

interface CommandContext {
  user: any;
  permissions: TerminalPermissions;
  userRole: string;
  isManagementMode: boolean;
  sessionId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string; // Allow any role from UserRole enum
  permissions: TerminalPermissions;
}

// Role-based permission mapping
const getRolePermissions = (role: string): TerminalPermissions => {
  const basePermissions: TerminalPermissions = {
    canExecuteBasicCommands: true,
    canExecuteAdvancedCommands: false,
    canAccessSystemCommands: false,
    canAccessManagementCommands: false,
    canAccessScenarioCommands: false,
    canAccessAdminCommands: false,
    canViewUserData: true,
    canViewAggregatedData: false,
    canManageUsers: false,
    canDeployScenarios: false,
  };

  switch (role) {
    case 'admin':
      return {
        ...basePermissions,
        canExecuteAdvancedCommands: true,
        canAccessSystemCommands: true,
        canAccessManagementCommands: true,
        canAccessScenarioCommands: true,
        canAccessAdminCommands: true,
        canViewAggregatedData: true,
        canManageUsers: true,
        canDeployScenarios: true,
      };
    case 'manager':
      return {
        ...basePermissions,
        canExecuteAdvancedCommands: true,
        canAccessManagementCommands: true,
        canAccessScenarioCommands: true,
        canViewAggregatedData: true,
        canDeployScenarios: true,
      };
    case 'senior_dc':
      return {
        ...basePermissions,
        canExecuteAdvancedCommands: true,
        canAccessScenarioCommands: true,
        canDeployScenarios: true,
      };
    case 'dc':
      return {
        ...basePermissions,
        canAccessScenarioCommands: true,
      };
    case 'analyst':
    default:
      return basePermissions;
  }
};

// DEPRECATED: Replaced by ImprovedTerminal.tsx in Phase 12 recovery
// Original path: hosting/components/UnifiedTerminal.tsx
// Migration: Permission concepts integrated into ImprovedTerminal context system
// Rollback: Uncomment this line to restore unified terminal with RBAC
// export default function UnifiedTerminal() {
function UnifiedTerminal() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isManagementMode, setIsManagementMode] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { trackActivity } = useActivityTracking();

  // Load current user and permissions
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await userManagementService.getCurrentUser();
        if (user) {
          const permissions = getRolePermissions(user.role);
          const mappedUser = {
            ...user,
            name: `${user.firstName} ${user.lastName}`,
            permissions
          };
          setCurrentUser(mappedUser);
          
          // Set management mode based on role
          setIsManagementMode(['admin', 'manager'].includes(user.role));
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    
    loadUser();
  }, []);

  // Command definitions with RBAC
  const commandConfigs: CommandConfig[] = [
    {
      name: 'help',
      description: 'Show available commands based on your permissions',
      usage: 'help [command] [--category=<category>] [--detailed]',
      aliases: ['?', 'h'],
      requiredPermissions: ['canExecuteBasicCommands'],
      category: 'basic',
      handler: (args, ctx) => {
        const availableCommands = commandConfigs.filter(cmd =>
          cmd.requiredPermissions.every(perm => ctx.permissions[perm])
        );

        if (args.length > 0) {
          const cmdName = args[0].toLowerCase();
          const cmd = availableCommands.find(c => c.name === cmdName || c.aliases?.includes(cmdName));
          if (cmd) {
            return (
              <TerminalOutput type="info">
                <div className="font-bold text-lg text-blue-300">{cmd.name}</div>
                <div className="text-gray-300 mt-2">{cmd.description}</div>
                <div className="text-yellow-400 mt-3">
                  <strong>Usage:</strong> <span className="font-mono text-white">{cmd.usage}</span>
                </div>
                <div className="text-purple-400 mt-2">
                  <strong>Category:</strong> {cmd.category}
                </div>
                {cmd.aliases && (
                  <div className="text-gray-500 mt-2 text-sm">
                    <strong>Aliases:</strong> {cmd.aliases.join(', ')}
                  </div>
                )}
              </TerminalOutput>
            );
          }
          return (
            <TerminalOutput type="error">
              Command '{args[0]}' not found or you don't have permission to access it.
            </TerminalOutput>
          );
        }

        // Group commands by category
        const commandsByCategory = availableCommands.reduce((acc, cmd) => {
          if (!acc[cmd.category]) acc[cmd.category] = [];
          acc[cmd.category].push(cmd);
          return acc;
        }, {} as Record<string, CommandConfig[]>);

        return (
          <TerminalOutput type="info">
            <div className="font-bold mb-4 text-xl text-blue-300">
              🎯 Available Commands - {ctx.user?.name} ({ctx.user?.role})
              {ctx.isManagementMode && <span className="text-red-400 ml-2">[MANAGEMENT MODE]</span>}
            </div>
            
            {Object.entries(commandsByCategory).map(([category, cmds]) => (
              <div key={category} className="mb-4">
                <div className="text-green-400 font-bold mb-2 capitalize">{category} Commands:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                  {cmds.map(cmd => (
                    <div key={cmd.name} className="border border-gray-600 p-2 rounded bg-gray-800/50">
                      <div className="text-cyan-400 font-mono">{cmd.name}</div>
                      <div className="text-sm text-gray-300">{cmd.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-blue-900/20 rounded border border-blue-500/30">
              <div className="text-blue-400 font-bold mb-2">Permission Summary:</div>
              <div className="text-xs space-y-1">
                {Object.entries(ctx.permissions).map(([perm, hasPermission]) => (
                  <div key={perm} className={hasPermission ? 'text-green-400' : 'text-gray-500'}>
                    {hasPermission ? '✓' : '✗'} {perm}
                  </div>
                ))}
              </div>
            </div>
          </TerminalOutput>
        );
      }
    },
    {
      name: 'whoami',
      description: 'Display current user information and permissions',
      usage: 'whoami [--detailed]',
      aliases: ['me', 'user'],
      requiredPermissions: ['canExecuteBasicCommands'],
      category: 'basic',
      handler: (args, ctx) => {
        const detailed = args.includes('--detailed');
        
        if (detailed) {
          return (
            <TerminalOutput type="info">
              <div className="font-bold text-xl mb-3 text-blue-300">User Profile</div>
              <div className="space-y-2">
                <div><span className="text-green-400">Name:</span> {ctx.user?.name}</div>
                <div><span className="text-green-400">Email:</span> {ctx.user?.email}</div>
                <div><span className="text-green-400">Role:</span> {ctx.user?.role}</div>
                <div><span className="text-green-400">Session ID:</span> {ctx.sessionId}</div>
                <div><span className="text-green-400">Mode:</span> {ctx.isManagementMode ? 'Management' : 'User'}</div>
                <div className="mt-4">
                  <div className="text-green-400 font-bold">Permissions:</div>
                  <div className="ml-4 mt-2 space-y-1">
                    {Object.entries(ctx.permissions).map(([perm, hasPermission]) => (
                      <div key={perm} className={hasPermission ? 'text-green-400' : 'text-gray-500'}>
                        {hasPermission ? '✓' : '✗'} {perm.replace(/^can/, '').replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TerminalOutput>
          );
        }

        return (
          <TerminalOutput type="info">
            <div className="text-lg font-bold text-blue-300">{ctx.user?.name}</div>
            <div className="text-sm text-gray-300">{ctx.user?.role} - {ctx.user?.email}</div>
            <div className="text-xs text-gray-500 mt-1">
              Use --detailed for more info | Session: {ctx.sessionId}
            </div>
          </TerminalOutput>
        );
      }
    },
    {
      name: 'users',
      description: 'Manage users and view user statistics',
      usage: 'users [list|create|stats] [--role=<role>]',
      aliases: ['user'],
      requiredPermissions: ['canViewAggregatedData'],
      category: 'management',
      handler: async (args, ctx) => {
        const action = args[0]?.toLowerCase() || 'list';
        switch (action) {
          case 'list':
            if (!ctx.permissions.canViewAggregatedData) {
              return (
                <TerminalOutput type="error">
                  Permission denied. Management access required.
                </TerminalOutput>
              );
            }

            const users = await userManagementService.getUsers();
            return (
              <TerminalOutput type="info">
                <div className="font-bold mb-3 text-blue-300">User Directory</div>
                <div className="space-y-2">
                  {users.map(user => (
                    <div key={user.id} className="border border-gray-600 p-2 rounded">
                      <div className="flex justify-between">
                        <span className="text-green-400">{user.firstName} {user.lastName}</span>
                        <span className="text-yellow-400">{user.role}</span>
                      </div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                    </div>
                  ))}
                </div>
              </TerminalOutput>
            );

          case 'stats':
            const metrics = await userManagementService.getUserMetrics();
            return (
              <TerminalOutput type="info">
                <div className="font-bold mb-3 text-blue-300">User Statistics</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-yellow-400">Total Users:</div>
                    <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                  </div>
                  <div>
                    <div className="text-yellow-400">Active Sessions:</div>
                    <div className="text-2xl font-bold text-green-400">{metrics.activeSessions}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-yellow-400 mb-2">Role Distribution:</div>
                  {Object.entries(metrics.roleDistribution).map(([role, count]) => (
                    <div key={role} className="flex justify-between">
                      <span>{role}:</span>
                      <span>{String(count)}</span>
                    </div>
                  ))}
                </div>
              </TerminalOutput>
            );

          default:
            return (
              <TerminalOutput type="error">
                Unknown action: {action}. Use 'help users' for usage.
              </TerminalOutput>
            );
        }
      }
    },
    {
      name: 'mode',
      description: 'Switch between user and management modes',
      usage: 'mode [user|management]',
      aliases: ['switch'],
      requiredPermissions: ['canAccessManagementCommands'],
      category: 'management',
      handler: (args, ctx) => {
        const mode = args[0]?.toLowerCase();
        
        if (!mode) {
          return (
            <TerminalOutput type="info">
              <div>Current mode: <span className="text-green-400">{ctx.isManagementMode ? 'Management' : 'User'}</span></div>
              <div className="mt-2">Available modes:</div>
              <div className="ml-4">
                <div>• user - View only your data</div>
                <div>• management - View aggregated data across all users</div>
              </div>
            </TerminalOutput>
          );
        }

        if (mode === 'management' && !ctx.permissions.canAccessManagementCommands) {
          return (
            <TerminalOutput type="error">
              Access denied. Management mode requires elevated permissions.
            </TerminalOutput>
          );
        }

        return (
          <TerminalOutput type="success">
            Mode switched to: <span className="text-green-400">{mode}</span>
            <div className="text-sm text-gray-400 mt-1">
              {mode === 'management' 
                ? 'You now have access to aggregated data and management functions.'
                : 'You now see only your personal data and activities.'
              }
            </div>
          </TerminalOutput>
        );
      }
    },
    {
      name: 'compete',
      description: 'Show Cortex XSIAM competitive advantages vs other platforms',
      usage: 'compete [splunk|crowdstrike|sentinel|all] [--pricing] [--features]',
      aliases: ['vs', 'compare'],
      requiredPermissions: ['canExecuteAdvancedCommands'],
      category: 'advanced',
      handler: (args, ctx) => {
        const platform = args[0]?.toLowerCase();
        const showPricing = args.includes('--pricing');
        const showFeatures = args.includes('--features');

        const competitors = {
          splunk: {
            name: 'Splunk Enterprise',
            color: 'text-orange-400',
            advantages: [
              '🚫 No daily volume licensing surprises vs Splunk\'s unpredictable costs',
              '☁️ Cloud-native scaling vs on-premises cluster management',
              '🤖 AI-driven analytics vs manual correlation rules',
              '⚡ Minutes to deploy vs months of professional services',
              '🔍 Sub-second queries vs slow SPL searches',
              '💾 Predictable storage costs vs indexer limitations'
            ],
            pricing: [
              'Cortex: Predictable per-GB pricing',
              'Splunk: Unpredictable daily volume spikes',
              'Savings: 40-60% typical reduction in SIEM costs'
            ]
          },
          crowdstrike: {
            name: 'CrowdStrike Falcon',
            color: 'text-blue-400',
            advantages: [
              '🏢 Full SIEM + EDR unified platform vs endpoint-only focus',
              '📝 Custom detection rules vs limited IOA customization',
              '🌐 Multi-cloud data ingestion vs endpoint telemetry only',
              '🔧 Native SOAR integration vs separate tool requirements',
              '📊 Complete security analytics vs threat hunting gaps',
              '⚡ Real-time response vs agent-dependent actions'
            ],
            pricing: [
              'Cortex: All-in-one platform pricing',
              'CrowdStrike: Separate EDR + SIEM + SOAR costs',
              'Savings: 30-50% vs multi-tool stack'
            ]
          },
          sentinel: {
            name: 'Microsoft Sentinel',
            color: 'text-cyan-400',
            advantages: [
              '💰 Predictable pricing vs KQL query consumption costs',
              '🎯 Purpose-built for SecOps vs generic Azure analytics',
              '🔓 No vendor lock-in vs Azure ecosystem dependency',
              '🚀 Faster implementation vs complex Azure setup',
              '📈 Better scaling performance vs Log Analytics limits',
              '🛡️ Native threat intelligence vs third-party integrations'
            ],
            pricing: [
              'Cortex: Transparent data lake pricing',
              'Sentinel: Hidden KQL query and workspace costs',
              'Savings: 25-45% vs full Azure commitment'
            ]
          }
        };

        if (!platform || platform === 'all') {
          return (
            <TerminalOutput type="info">
              <div className="font-bold mb-4 text-xl text-green-400">
                🏆 Cortex XSIAM Competitive Advantages
              </div>
              
              {Object.entries(competitors).map(([key, comp]) => (
                <div key={key} className="mb-6 bg-gray-800/50 p-4 rounded border border-gray-600">
                  <h3 className={`font-bold text-lg ${comp.color} mb-3`}>
                    🆚 vs {comp.name}
                  </h3>
                  <div className="space-y-2">
                    {comp.advantages.map((advantage, idx) => (
                      <div key={idx} className="text-sm text-gray-300">
                        {advantage}
                      </div>
                    ))}
                  </div>
                  {showPricing && (
                    <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-500/30">
                      <h4 className="text-green-400 font-bold mb-2">💰 Pricing Comparison:</h4>
                      {comp.pricing.map((price, idx) => (
                        <div key={idx} className="text-xs text-gray-300">{price}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-red-900/20 rounded border border-red-500/30">
                <h3 className="text-red-400 font-bold mb-2">🔥 Key Differentiators:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• <span className="text-green-400">Native Cloud Architecture</span></div>
                    <div>• <span className="text-blue-400">AI/ML-Driven Detection</span></div>
                    <div>• <span className="text-yellow-400">Unified SecOps Platform</span></div>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• <span className="text-purple-400">Predictable Pricing Model</span></div>
                    <div>• <span className="text-cyan-400">Zero Infrastructure Overhead</span></div>
                    <div>• <span className="text-pink-400">Rapid Implementation</span></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                💡 Use: <span className="text-green-400">compete splunk --pricing</span> for detailed comparison
              </div>
            </TerminalOutput>
          );
        }

        const competitor = competitors[platform as keyof typeof competitors];
        if (!competitor) {
          return (
            <TerminalOutput type="error">
              Unknown platform: {platform}. Available: splunk, crowdstrike, sentinel, all
            </TerminalOutput>
          );
        }

        return (
          <TerminalOutput type="info">
            <div className="font-bold mb-4 text-xl text-green-400">
              🆚 Cortex XSIAM vs {competitor.name}
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded border border-gray-600 mb-4">
              <h3 className={`font-bold text-lg ${competitor.color} mb-3`}>
                🏆 Competitive Advantages:
              </h3>
              <div className="space-y-2">
                {competitor.advantages.map((advantage, idx) => (
                  <div key={idx} className="text-sm text-gray-300">
                    {advantage}
                  </div>
                ))}
              </div>
            </div>
            
            {showPricing && (
              <div className="p-4 bg-green-900/20 rounded border border-green-500/30 mb-4">
                <h4 className="text-green-400 font-bold mb-3">💰 Pricing Analysis:</h4>
                <div className="space-y-2">
                  {competitor.pricing.map((price, idx) => (
                    <div key={idx} className="text-sm text-gray-300">{price}</div>
                  ))}
                </div>
              </div>
            )}
            
            {showFeatures && (
              <div className="p-4 bg-blue-900/20 rounded border border-blue-500/30">
                <h4 className="text-blue-400 font-bold mb-3">🚀 Feature Comparison:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-green-400 font-bold mb-2">Cortex XSIAM:</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>✅ Native cloud architecture</li>
                      <li>✅ AI-powered analytics</li>
                      <li>✅ Unified SIEM + SOAR + XDR</li>
                      <li>✅ Predictable pricing</li>
                      <li>✅ Zero infrastructure management</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className={`${competitor.color} font-bold mb-2`}>{competitor.name}:</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>❌ Legacy architecture constraints</li>
                      <li>❌ Manual rule management</li>
                      <li>❌ Multi-tool complexity</li>
                      <li>❌ Unpredictable costs</li>
                      <li>❌ High operational overhead</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </TerminalOutput>
        );
      }
    },
    {
      name: 'clear',
      description: 'Clear the terminal screen',
      usage: 'clear',
      aliases: ['cls'],
      requiredPermissions: ['canExecuteBasicCommands'],
      category: 'basic',
      handler: () => null // Special case handled in executeCommand
    },
    {
      name: 'exit',
      description: 'Exit terminal and return to GUI',
      usage: 'exit',
      aliases: ['quit'],
      requiredPermissions: ['canExecuteBasicCommands'],
      category: 'basic',
      handler: (args, ctx) => {
        // This will be handled by the component
        return (
          <TerminalOutput type="info">
            Exiting terminal... Redirecting to GUI.
          </TerminalOutput>
        );
      }
    }
  ];

  // Check if user has permission to execute a command
  const hasCommandPermission = useCallback((cmd: CommandConfig): boolean => {
    if (!currentUser) return false;
    return cmd.requiredPermissions.every(perm => currentUser.permissions[perm]);
  }, [currentUser]);

  // Execute command with RBAC check
  const executeCommand = useCallback(async (inputStr: string) => {
    const trimmed = inputStr.trim();
    if (!trimmed || !currentUser) return;

    const args = trimmed.split(' ');
    const cmdName = args[0].toLowerCase();
    const cmdArgs = args.slice(1);

    // Track command execution
    if (trackActivity) {
      try {
        trackActivity({
          action: 'terminal_command_executed',
          feature: 'terminal',
          metadata: {
            component: cmdName,
            success: true
          }
        });
      } catch (error) {
        console.warn('Failed to track activity:', error);
      }
    }

    // Add to history
    setHistory(prev => [...prev.slice(-49), trimmed]);
    setHistoryIndex(-1);

    // Special handling for clear command
    if (cmdName === 'clear' || cmdName === 'cls') {
      setCommands([]);
      return;
    }

    // Special handling for exit command
    if (cmdName === 'exit' || cmdName === 'quit') {
      router.push('/gui');
      return;
    }

    // Find command
    const cmd = commandConfigs.find(c => 
      c.name === cmdName || c.aliases?.includes(cmdName)
    );

    const newCommand: Command = {
      input: trimmed,
      output: null,
      timestamp: new Date(),
      userId: currentUser.id,
      sessionId
    };

    if (!cmd) {
      newCommand.output = (
        <TerminalOutput type="error">
          Command '{cmdName}' not found. Type 'help' to see available commands.
        </TerminalOutput>
      );
    } else if (!hasCommandPermission(cmd)) {
      newCommand.output = (
        <TerminalOutput type="error">
          Access denied. You don't have permission to execute '{cmdName}'.
          <div className="text-sm text-gray-400 mt-2">
            Required permissions: {cmd.requiredPermissions.join(', ')}
          </div>
          <div className="text-sm text-gray-400">
            Your role: {currentUser.role} | Contact admin for access.
          </div>
        </TerminalOutput>
      );
    } else {
      // Show loading state for async commands
      setIsLoading(true);
      newCommand.output = (
        <div className="flex items-center text-yellow-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
          Executing {cmdName}...
        </div>
      );

      setCommands(prev => [...prev, newCommand]);

      try {
        const context: CommandContext = {
          user: currentUser,
          permissions: currentUser.permissions,
          userRole: currentUser.role,
          isManagementMode,
          sessionId
        };

        const result = await (cmd.handler as any)(cmdArgs, context);
        
        // Update the command with the actual result
        setCommands(prev => 
          prev.map(c => 
            c === newCommand ? { ...c, output: result } : c
          )
        );
      } catch (error) {
        console.error('Command execution error:', error);
        setCommands(prev => 
          prev.map(c => 
            c === newCommand 
              ? { 
                  ...c, 
                  output: (
                    <TerminalOutput type="error">
                      Error executing command: {error instanceof Error ? error.message : 'Unknown error'}
                    </TerminalOutput>
                  )
                } 
              : c
          )
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setCommands(prev => [...prev, newCommand]);
  }, [currentUser, hasCommandPermission, trackActivity, sessionId, isManagementMode, router]);

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput('');
    }
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  // Initialize with welcome message
  useEffect(() => {
    if (currentUser && commands.length === 0) {
      const welcomeCommand: Command = {
        input: '',
        output: (
          <TerminalOutput type="info">
            <div className="mb-4">
              <pre className="text-lg font-bold text-cyan-400 mb-2">
{`
 ██████╗ ██████╗ ██████╗ ████████╗███████╗██╗  ██╗    ████████╗███████╗██████╗ ███╗   ███╗
██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝╚██╗██╔╝    ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║
██║     ██║   ██║██████╔╝   ██║   █████╗   ╚███╔╝        ██║   █████╗  ██████╔╝██╔████╔██║
██║     ██║   ██║██╔══██╗   ██║   ██╔══╝   ██╔██╗        ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║
╚██████╗╚██████╔╝██║  ██║   ██║   ███████╗██╔╝ ██╗       ██║   ███████╗██║  ██║██║ ╚═╝ ██║
 ╚═════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝       ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
`}
              </pre>
            </div>
            <div className="mb-4">
              <div className="text-lg text-cyan-300 font-semibold">
                Welcome, {currentUser.name}! 
                <span className="ml-2 text-yellow-400">({currentUser.role})</span>
                {isManagementMode && <span className="ml-2 text-red-400">[MANAGEMENT MODE]</span>}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                RBAC-Protected Terminal Interface | Session: {sessionId}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div>• Type <span className="text-green-400 font-mono">help</span> to see available commands for your role</div>
              <div>• Use <span className="text-blue-400 font-mono">whoami --detailed</span> to view your permissions</div>
              <div>• Type <span className="text-purple-400 font-mono">mode</span> to switch between user and management views</div>
              <div>• Use <span className="text-red-400 font-mono">exit</span> to return to GUI interface</div>
            </div>
          </TerminalOutput>
        ),
        timestamp: new Date(),
        userId: currentUser.id,
        sessionId
      };
      setCommands([welcomeCommand]);
    }
  }, [currentUser, sessionId, isManagementMode]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-cyan-400 font-mono">Loading user permissions...</div>
        </div>
      </div>
    );
  }

  const prompt = `${currentUser.name}@cortex-dc${isManagementMode ? '-mgmt' : ''}:~$ `;

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="p-4 h-screen flex flex-col">
        {/* Terminal Header */}
        <div className="flex-shrink-0 border-b border-gray-700 pb-2 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-green-400 font-bold">Cortex DC Terminal</div>
              <div className="text-sm text-gray-400">
                {currentUser.name} ({currentUser.role})
                {isManagementMode && <span className="text-red-400 ml-2">[MGMT]</span>}
              </div>
            </div>
            <button
              onClick={() => router.push('/gui')}
              className="text-red-400 hover:text-red-300 text-sm border border-red-400/30 hover:border-red-400/50 px-2 py-1 rounded"
            >
              Exit to GUI
            </button>
          </div>
        </div>

        {/* Terminal Output */}
        <div 
          ref={terminalRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4"
        >
          {commands.map((command, index) => (
            <div key={index}>
              {command.input && (
                <div className="text-green-400">
                  <span className="text-cyan-400">{prompt}</span>
                  {command.input}
                </div>
              )}
              {command.output && <div className="ml-4">{command.output}</div>}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex-shrink-0">
          <div className="flex items-start space-x-2">
            <span className="text-cyan-400 pt-2">{prompt}</span>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none resize-none text-white font-mono"
              rows={1}
              placeholder="Enter command..."
              disabled={isLoading}
              style={{ minHeight: '1.5rem' }}
            />
          </div>
        </form>
      </div>
    </div>
  );
}