import React, { useState } from 'react';
import { 
  EnhancedCommandConfig, 
  CommandCategory, 
  HelpContext, 
  OptionSpec,
  ExampleSpec,
  SubcommandSpec 
} from './types';
import { commandRegistry, CATEGORY_INFO } from './command-registry';

// Utility functions for help formatting
function formatUsageFromOptions(baseUsage: string, options?: OptionSpec[]): string {
  if (!options || options.length === 0) return baseUsage;
  
  const requiredFlags = options.filter(opt => opt.required).map(opt => opt.flag);
  const optionalFlags = options.filter(opt => !opt.required).map(opt => opt.flag);
  
  let usage = baseUsage;
  
  if (requiredFlags.length > 0) {
    usage += ' ' + requiredFlags.join(' ');
  }
  
  if (optionalFlags.length > 0) {
    usage += ' [' + optionalFlags.join('] [') + ']';
  }
  
  return usage;
}

function copyToClipboard(text: string): void {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  }
}

// Interactive button component
interface ActionButtonProps {
  variant: 'run' | 'insert' | 'copy';
  command: string;
  helpContext?: HelpContext;
  size?: 'sm' | 'md';
  className?: string;
}

function ActionButton({ variant, command, helpContext, size = 'sm', className = '' }: ActionButtonProps) {
  const [clicked, setClicked] = useState(false);
  
  const handleClick = async () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 1000);
    
    switch (variant) {
      case 'run':
        if (helpContext?.terminalActions?.executeCommand) {
          await helpContext.terminalActions.executeCommand(command);
        }
        break;
      case 'insert':
        if (helpContext?.terminalActions?.setInput) {
          helpContext.terminalActions.setInput(command);
        }
        break;
      case 'copy':
        copyToClipboard(command);
        break;
    }
  };
  
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const baseClasses = `${sizeClasses} rounded border font-mono transition-all duration-200 ${className}`;
  
  const variants = {
    run: `${baseClasses} bg-green-800 border-green-600 text-green-200 hover:bg-green-700 active:bg-green-900`,
    insert: `${baseClasses} bg-blue-800 border-blue-600 text-blue-200 hover:bg-blue-700 active:bg-blue-900`,
    copy: `${baseClasses} bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 active:bg-gray-900`
  };
  
  const labels = {
    run: clicked ? '✓ Run' : '▶ Run',
    insert: clicked ? '✓ Insert' : '📝 Insert', 
    copy: clicked ? '✓ Copied' : '📋 Copy'
  };
  
  return (
    <button
      className={variants[variant]}
      onClick={handleClick}
      title={`${variant.charAt(0).toUpperCase() + variant.slice(1)} command`}
    >
      {labels[variant]}
    </button>
  );
}

// Option specification renderer
function OptionsTable({ options }: { options: OptionSpec[] }) {
  if (!options || options.length === 0) return null;
  
  return (
    <div className="mt-4">
      <div className="text-blue-400 font-bold mb-3">🏁 Options & Flags</div>
      <div className="space-y-3">
        {options.map((option, idx) => (
          <div key={idx} className="border-l-2 border-gray-600 pl-4">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-green-400">{option.flag}</span>
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                {option.type}
                {option.required && <span className="text-red-400"> required</span>}
              </span>
              {option.deprecated && (
                <span className="text-xs bg-red-800 text-red-200 px-2 py-0.5 rounded">deprecated</span>
              )}
            </div>
            <div className="text-gray-300 text-sm mb-1">{option.description}</div>
            {option.enumValues && (
              <div className="text-xs text-gray-500">
                Values: {option.enumValues.map(val => (
                  <span key={val} className="font-mono bg-gray-900 px-1 rounded mr-1">{val}</span>
                ))}
              </div>
            )}
            {option.default !== undefined && (
              <div className="text-xs text-gray-500">
                Default: <span className="font-mono bg-gray-900 px-1 rounded">{String(option.default)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Example renderer with interactive buttons
function ExamplesSection({ examples, helpContext }: { examples: ExampleSpec[], helpContext?: HelpContext }) {
  if (!examples || examples.length === 0) return null;
  
  return (
    <div className="mt-4">
      <div className="text-green-400 font-bold mb-3">💡 Examples</div>
      <div className="space-y-3">
        {examples.map((example, idx) => (
          <div key={idx} className="border border-gray-600 rounded p-3 bg-gray-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-cyan-400 text-sm">{example.cmd}</span>
              <div className="flex space-x-2">
                {helpContext?.terminalActions && (
                  <>
                    <ActionButton variant="run" command={example.cmd} helpContext={helpContext} />
                    <ActionButton variant="insert" command={example.cmd} helpContext={helpContext} />
                  </>
                )}
                <ActionButton variant="copy" command={example.cmd} />
              </div>
            </div>
            {example.description && (
              <div className="text-gray-400 text-sm">{example.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Subcommands renderer
function SubcommandsSection({ subcommands, helpContext }: { subcommands: SubcommandSpec[], helpContext?: HelpContext }) {
  if (!subcommands || subcommands.length === 0) return null;
  
  return (
    <div className="mt-4">
      <div className="text-purple-400 font-bold mb-3">🔧 Subcommands</div>
      <div className="space-y-4">
        {subcommands.map((sub, idx) => (
          <div key={idx} className="border border-purple-600/30 rounded p-4 bg-purple-900/10">
            <div className="text-purple-300 font-bold font-mono text-lg mb-2">{sub.name}</div>
            <div className="text-gray-300 text-sm mb-3">{sub.description}</div>
            
            {sub.options && sub.options.length > 0 && (
              <OptionsTable options={sub.options} />
            )}
            
            {sub.examples && sub.examples.length > 0 && (
              <ExamplesSection examples={sub.examples} helpContext={helpContext} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Related commands renderer
function SeeAlsoSection({ seeAlso }: { seeAlso: string[] }) {
  if (!seeAlso || seeAlso.length === 0) return null;
  
  return (
    <div className="mt-4">
      <div className="text-cyan-400 font-bold mb-3">🔗 Related Commands</div>
      <div className="flex flex-wrap gap-2">
        {seeAlso.map(cmdName => (
          <span key={cmdName} className="font-mono text-cyan-300 bg-cyan-900/20 px-3 py-1 rounded border border-cyan-600/30 hover:bg-cyan-800/20 cursor-pointer">
            {cmdName}
          </span>
        ))}
      </div>
    </div>
  );
}

// Multi-word command and aliases section
function AliasesSection({ command }: { command: EnhancedCommandConfig }) {
  if (!command.aliases || command.aliases.length === 0) return null;
  
  const isMultiWord = command.name.includes(' ');
  
  return (
    <div className="mt-4">
      <div className="text-yellow-400 font-bold mb-3">🏷️ Aliases & Usage Patterns</div>
      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-400 mb-2">Available aliases:</div>
          <div className="flex flex-wrap gap-2">
            {command.aliases.map(alias => (
              <ActionButton key={alias} variant="copy" command={alias} size="sm" className="mr-1 mb-1" />
            ))}
          </div>
        </div>
        
        {isMultiWord && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded">
            <div className="text-yellow-300 font-bold text-sm mb-1">💡 Multi-word Command Tips</div>
            <div className="text-xs text-gray-300 space-y-1">
              <div>• Use quotes in scripts: <span className="font-mono">"{command.name}"</span></div>
              <div>• Prefer aliases for quick typing: <span className="font-mono">{command.aliases[0] || command.name}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Context-aware recommendations
function RecommendationsSection({ command, helpContext }: { command: EnhancedCommandConfig, helpContext?: HelpContext }) {
  if (!helpContext?.commandHistory || helpContext.commandHistory.length === 0) return null;
  
  const recentCommands = helpContext.commandHistory.slice(-5);
  const recommendations: string[] = [];
  
  // Simple recommendation logic based on recent commands
  if (recentCommands.some(cmd => cmd.startsWith('download'))) {
    if (command.name === 'scenario') {
      recommendations.push('Try generating a scenario with your downloaded templates');
    }
  }
  
  if (recentCommands.some(cmd => cmd.startsWith('scenario generate'))) {
    if (command.name === 'status') {
      recommendations.push('Check your scenario deployment status');
    }
  }
  
  if (recommendations.length === 0) return null;
  
  return (
    <div className="mt-4">
      <div className="text-orange-400 font-bold mb-3">🎯 Based on your recent activity</div>
      <div className="space-y-2">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="p-3 bg-orange-900/20 border border-orange-600/30 rounded text-sm text-gray-300">
            {rec}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main renderers
export function renderCommandHelp(command: EnhancedCommandConfig, helpContext?: HelpContext): React.ReactNode {
  const usage = formatUsageFromOptions(command.usage, command.help?.options);
  
  return (
    <div className="text-blue-300 max-w-6xl">
      {/* Header */}
      <div className="border-b border-gray-600 pb-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-cyan-300">{command.name}</h1>
          {command.help?.category && (
            <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
              {CATEGORY_INFO[command.help.category]?.icon} {CATEGORY_INFO[command.help.category]?.displayName}
            </span>
          )}
        </div>
        <p className="text-gray-300 text-lg">{command.description}</p>
      </div>
      
      {/* Long description */}
      {command.help?.longDescription && (
        <div className="mb-6 p-4 bg-gray-900/40 border border-gray-600 rounded">
          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {command.help.longDescription}
          </div>
        </div>
      )}
      
      {/* Usage */}
      <div className="mb-6">
        <div className="text-blue-400 font-bold mb-3">📖 Usage</div>
        <div className="p-3 bg-black border border-gray-600 rounded font-mono text-green-400 flex items-center justify-between">
          <span>{usage}</span>
          <ActionButton variant="copy" command={usage} />
        </div>
      </div>
      
      {/* Aliases */}
      <AliasesSection command={command} />
      
      {/* Options */}
      {command.help?.options && <OptionsTable options={command.help.options} />}
      
      {/* Subcommands */}
      {command.help?.subcommands && <SubcommandsSection subcommands={command.help.subcommands} helpContext={helpContext} />}
      
      {/* Examples */}
      {command.help?.examples && <ExamplesSection examples={command.help.examples} helpContext={helpContext} />}
      
      {/* See also */}
      {command.help?.seeAlso && <SeeAlsoSection seeAlso={command.help.seeAlso} />}
      
      {/* Recommendations */}
      <RecommendationsSection command={command} helpContext={helpContext} />
      
      {/* Interactive features notice */}
      {command.help?.isInteractive && (
        <div className="mt-6 p-4 bg-purple-900/20 border border-purple-600/30 rounded">
          <div className="text-purple-400 font-bold mb-2">✨ Interactive Command</div>
          <div className="text-sm text-gray-300">
            This command supports interactive features and guided workflows. 
            Look for prompts and follow-up suggestions when you run it.
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-600 text-xs text-gray-500">
        Need more help? Try <span className="font-mono text-green-400">help search "{command.name}"</span> or 
        visit the <span className="font-mono text-blue-400">contact</span> command for support options.
      </div>
    </div>
  );
}

export function renderHelpOverview(helpContext?: HelpContext): React.ReactNode {
  const categories = commandRegistry.getCategories().filter(cat => cat.count > 0);
  const stats = commandRegistry.getStatistics();
  const featuredCommands = [
    'getting started',
    'ls ctx --all-products',
    'scenario generate',
    'download terraform',
    'cortex-questions'
  ].map(name => commandRegistry.getCommandByNameOrAlias(name.split(' ')[0])).filter(Boolean);
  
  return (
    <div className="text-blue-300 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">🤖 Henry Reed AI Terminal Help</h1>
        <p className="text-gray-300 text-lg">Professional AI consulting and development services</p>
        <div className="text-sm text-gray-500 mt-2">
          {stats.totalCommands} commands • {stats.totalAliases} aliases • Interactive help system
        </div>
      </div>
      
      {/* Quick search */}
      <div className="mb-8 p-4 bg-gray-900/40 border border-gray-600 rounded">
        <div className="text-yellow-400 font-bold mb-3">🔍 Quick Discovery</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-mono text-green-400">help search "query"</div>
            <div className="text-gray-400">Find commands by topic</div>
          </div>
          <div>
            <div className="font-mono text-blue-400">command --help</div>
            <div className="text-gray-400">Detailed command help</div>
          </div>
          <div>
            <div className="font-mono text-purple-400">help --tour</div>
            <div className="text-gray-400">Interactive guided tour</div>
          </div>
        </div>
      </div>
      
      {/* Featured commands */}
      <div className="mb-8">
        <div className="text-green-400 font-bold mb-4 text-xl">⭐ Getting Started</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCommands.map(cmd => cmd && (
            <div key={cmd.name} className="border border-green-500/30 p-4 rounded bg-green-900/10 hover:bg-green-900/20 cursor-pointer">
              <div className="text-green-300 font-bold font-mono mb-2">{cmd.name}</div>
              <div className="text-sm text-gray-300 mb-3">{cmd.description}</div>
              <div className="flex space-x-2">
                {helpContext?.terminalActions && (
                  <ActionButton variant="run" command={cmd.name} helpContext={helpContext} size="sm" />
                )}
                <ActionButton variant="copy" command={cmd.name} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Categories */}
      <div className="mb-8">
        <div className="text-blue-400 font-bold mb-4 text-xl">📚 Command Categories</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(category => (
            <div key={category.name} className="border border-gray-600 p-4 rounded hover:bg-gray-900/50 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{category.icon}</span>
                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{category.count}</span>
              </div>
              <div className="font-bold text-blue-300 mb-1">{category.displayName}</div>
              <div className="text-xs text-gray-400">{category.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tips */}
      <div className="mb-8 p-4 bg-blue-900/20 border border-blue-600/30 rounded">
        <div className="text-blue-400 font-bold mb-3">💡 Pro Tips</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div>• Use <span className="font-mono text-green-400">↑/↓</span> arrows for command history</div>
            <div>• Press <span className="font-mono text-blue-400">Tab</span> for command completion</div>
            <div>• Try <span className="font-mono text-purple-400">F1</span> key for quick help</div>
          </div>
          <div className="space-y-2">
            <div>• Commands are organized by categories and topics</div>
            <div>• Many examples have "Run" and "Insert" buttons</div>
            <div>• Use quotes for multi-word commands in scripts</div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center pt-6 border-t border-gray-600 text-sm text-gray-400">
        <div className="mb-2">
          Ready to explore? Start with <span className="font-mono text-green-400">getting started</span> or 
          dive into <span className="font-mono text-blue-400">ls ctx --all-products</span>
        </div>
        <div>
          Need personalized help? Use <span className="font-mono text-purple-400">contact --schedule</span> to book a consultation
        </div>
      </div>
    </div>
  );
}

export function renderCategoryHelp(category: CommandCategory): React.ReactNode {
  const commands = commandRegistry.getCommandsByCategory(category);
  const categoryInfo = CATEGORY_INFO[category];
  
  if (commands.length === 0) {
    return (
      <div className="text-red-400">
        No commands found in category '{category}'
      </div>
    );
  }
  
  return (
    <div className="text-blue-300 max-w-4xl">
      <div className="border-b border-gray-600 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-cyan-300 mb-2">
          {categoryInfo.icon} {categoryInfo.displayName}
        </h1>
        <p className="text-gray-300">{categoryInfo.description}</p>
        <div className="text-sm text-gray-500 mt-2">
          {commands.length} command{commands.length !== 1 ? 's' : ''} available
        </div>
      </div>
      
      <div className="space-y-4">
        {commands.map(cmd => (
          <div key={cmd.name} className="border border-gray-600 p-4 rounded bg-gray-900/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-400 font-bold font-mono text-lg">{cmd.name}</div>
              {cmd.aliases && cmd.aliases.length > 0 && (
                <div className="text-xs text-gray-500">
                  Aliases: {cmd.aliases.join(', ')}
                </div>
              )}
            </div>
            <div className="text-gray-300 mb-3">{cmd.description}</div>
            {cmd.help?.examples && cmd.help.examples.length > 0 && (
              <div className="text-xs text-gray-400 font-mono">
                Example: {cmd.help.examples[0].cmd}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function renderHelpSearch(query: string): React.ReactNode {
  const results = commandRegistry.searchCommandsByTopic(query);
  
  if (results.length === 0) {
    return (
      <div className="text-yellow-400">
        <div className="font-bold mb-2">🔍 No Results Found</div>
        <div className="text-sm text-gray-300 mb-4">
          No commands found matching "{query}". Try different keywords or browse by category.
        </div>
        <div className="text-sm">
          <div className="text-blue-400 font-bold mb-2">Suggestions:</div>
          <div className="space-y-1 text-gray-300">
            <div>• Use <span className="font-mono text-green-400">help</span> to see all categories</div>
            <div>• Try broader terms like "deploy", "security", "ai"</div>
            <div>• Browse <span className="font-mono text-blue-400">topics</span> command for available keywords</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="text-blue-300 max-w-4xl">
      <div className="border-b border-gray-600 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-cyan-300">🔍 Search Results for "{query}"</h1>
        <div className="text-sm text-gray-500 mt-2">
          Found {results.length} relevant command{results.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-4">
        {results.map((result, idx) => (
          <div key={idx} className="border border-gray-600 p-4 rounded bg-gray-900/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-400 font-bold font-mono text-lg">{result.command.name}</div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                  {Math.round(result.relevance * 10)}% match
                </span>
                <span className="text-xs bg-purple-800 text-purple-200 px-2 py-1 rounded">
                  {result.matchType}
                </span>
              </div>
            </div>
            <div className="text-gray-300 mb-2">{result.command.description}</div>
            {result.matchText && (
              <div className="text-xs text-yellow-300 bg-yellow-900/20 px-2 py-1 rounded">
                Matched: "{result.matchText}"
              </div>
            )}
            {result.command.help?.category && (
              <div className="text-xs text-gray-500 mt-2">
                Category: {CATEGORY_INFO[result.command.help.category]?.displayName}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
