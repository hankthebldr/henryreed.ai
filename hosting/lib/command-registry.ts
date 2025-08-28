import React from 'react';
import { 
  EnhancedCommandConfig, 
  LegacyCommandConfig,
  CommandCategory, 
  SearchResult, 
  CategoryInfo 
} from './types';

// Import existing command sets
import { commands as baseCommands } from './commands';
import { allCommands as extendedCommands } from './commands-ext';
import { downloadCommands } from './download-commands';
import { scenarioCommandConfig } from './scenario-command-wrapper';

// Category metadata for better organization
export const CATEGORY_INFO: Record<CommandCategory, CategoryInfo> = {
  core: {
    name: 'core',
    displayName: 'Core Commands',
    description: 'Essential terminal commands for navigation and basic operations',
    icon: '🔧'
  },
  context: {
    name: 'context',
    displayName: 'Context & Information',
    description: 'Learn about XSIAM and Cortex capabilities and features',
    icon: '👤'
  },
  ai: {
    name: 'ai',
    displayName: 'AI & Intelligence',
    description: 'Interact with AI assistants and generate insights',
    icon: '🤖'
  },
  search: {
    name: 'search',
    displayName: 'Search & Discovery',
    description: 'Find information and explore knowledge base',
    icon: '🔍'
  },
  downloads: {
    name: 'downloads',
    displayName: 'Downloads & Resources',
    description: 'Download tools, templates, and infrastructure code',
    icon: '📥'
  },
  scenarios: {
    name: 'scenarios',
    displayName: 'Security Scenarios',
    description: 'Deploy and manage security assessment environments',
    icon: '🎯'
  },
  utilities: {
    name: 'utilities',
    displayName: 'Utilities',
    description: 'System status, configuration, and helper tools',
    icon: '⚙️'
  },
  theming: {
    name: 'theming',
    displayName: 'Appearance',
    description: 'Customize terminal appearance and themes',
    icon: '🎨'
  }
};

// Convert legacy CommandConfig to EnhancedCommandConfig with categorization
function enhanceCommand(cmd: LegacyCommandConfig, defaultCategory: CommandCategory): EnhancedCommandConfig {
  return {
    ...cmd,
    help: {
      category: defaultCategory,
      topics: [cmd.name, ...(cmd.aliases || [])],
      examples: []
    }
  };
}

// Categorize existing commands
const enhancedBaseCommands: EnhancedCommandConfig[] = baseCommands.map(cmd => {
  const category = cmd.name === 'help' ? 'core' 
    : cmd.name === 'ls' ? 'core'
    : 'context'; // Most base commands are context-related
  
  return enhanceCommand(cmd, category);
});

const enhancedExtendedCommands: EnhancedCommandConfig[] = extendedCommands
  .filter(cmd => !enhancedBaseCommands.some(base => base.name === cmd.name))
  .map(cmd => {
    const category = cmd.name === 'whoami' || cmd.name === 'contact' || cmd.name === 'services' ? 'context'
      : cmd.name === 'ai' || cmd.name === 'cortex-questions' ? 'ai'
      : cmd.name === 'search' ? 'search'
      : cmd.name === 'status' || cmd.name === 'ctxpov' ? 'utilities'
      : cmd.name === 'theme' ? 'theming'
      : cmd.name === 'clear' ? 'core'
      : 'utilities';
    
    return enhanceCommand(cmd, category);
  });

const enhancedDownloadCommands: EnhancedCommandConfig[] = downloadCommands
  .filter(cmd => 
    !enhancedBaseCommands.some(base => base.name === cmd.name) &&
    !enhancedExtendedCommands.some(ext => ext.name === cmd.name)
  )
  .map(cmd => enhanceCommand(cmd, 'downloads'));

// Merge all command sources
const allEnhancedCommands: EnhancedCommandConfig[] = [
  ...enhancedBaseCommands,
  ...enhancedExtendedCommands,
  ...enhancedDownloadCommands,
  scenarioCommandConfig
];

// Build alias index for fast lookup
const aliasIndex = new Map<string, string>();
const commandIndex = new Map<string, EnhancedCommandConfig>();

allEnhancedCommands.forEach(cmd => {
  // Index primary name
  commandIndex.set(cmd.name.toLowerCase(), cmd);
  aliasIndex.set(cmd.name.toLowerCase(), cmd.name);
  
  // Index aliases
  if (cmd.aliases) {
    cmd.aliases.forEach(alias => {
      if (!aliasIndex.has(alias.toLowerCase())) {
        aliasIndex.set(alias.toLowerCase(), cmd.name);
      } else {
        console.warn(`Duplicate alias detected: ${alias} for command ${cmd.name}`);
      }
    });
  }
});

// Registry API
export const commandRegistry = {
  /**
   * Get all registered commands
   */
  getAllCommands(): EnhancedCommandConfig[] {
    return [...allEnhancedCommands];
  },

  /**
   * Find a command by name or alias
   */
  getCommandByNameOrAlias(name: string): EnhancedCommandConfig | undefined {
    const normalizedName = name.toLowerCase();
    
    // Try direct lookup first
    if (commandIndex.has(normalizedName)) {
      return commandIndex.get(normalizedName);
    }
    
    // Try alias lookup
    const primaryName = aliasIndex.get(normalizedName);
    if (primaryName) {
      return commandIndex.get(primaryName.toLowerCase());
    }
    
    return undefined;
  },

  /**
   * Get commands by category
   */
  getCommandsByCategory(category: CommandCategory): EnhancedCommandConfig[] {
    return allEnhancedCommands.filter(cmd => 
      cmd.help?.category === category
    );
  },

  /**
   * Get all available categories with command counts
   */
  getCategories(): Array<CategoryInfo & { count: number }> {
    const categoryCounts = new Map<CommandCategory, number>();
    
    allEnhancedCommands.forEach(cmd => {
      const category = cmd.help?.category || 'utilities';
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });
    
    return Object.values(CATEGORY_INFO).map(info => ({
      ...info,
      count: categoryCounts.get(info.name) || 0
    }));
  },

  /**
   * Search commands by topics, descriptions, examples, etc.
   */
  searchCommandsByTopic(query: string): SearchResult[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];
    
    const results: SearchResult[] = [];
    const queryWords = normalizedQuery.split(/\s+/);
    
    allEnhancedCommands.forEach(cmd => {
      let relevance = 0;
      const matches: Array<{ type: SearchResult['matchType']; text: string; score: number }> = [];
      
      // Name match (highest priority)
      if (cmd.name.toLowerCase().includes(normalizedQuery)) {
        relevance += 10;
        matches.push({ type: 'name', text: cmd.name, score: 10 });
      }
      
      // Alias match
      if (cmd.aliases) {
        for (const alias of cmd.aliases) {
          if (alias.toLowerCase().includes(normalizedQuery)) {
            relevance += 8;
            matches.push({ type: 'alias', text: alias, score: 8 });
            break;
          }
        }
      }
      
      // Description match
      if (cmd.description.toLowerCase().includes(normalizedQuery)) {
        relevance += 5;
        matches.push({ type: 'description', text: cmd.description, score: 5 });
      }
      
      // Long description match
      if (cmd.help?.longDescription?.toLowerCase().includes(normalizedQuery)) {
        relevance += 4;
        matches.push({ type: 'description', text: cmd.help.longDescription, score: 4 });
      }
      
      // Topics match
      if (cmd.help?.topics) {
        for (const topic of cmd.help.topics) {
          if (topic.toLowerCase().includes(normalizedQuery)) {
            relevance += 6;
            matches.push({ type: 'topic', text: topic, score: 6 });
          }
        }
      }
      
      // Example match
      if (cmd.help?.examples) {
        for (const example of cmd.help.examples) {
          if (example.cmd.toLowerCase().includes(normalizedQuery) ||
              example.description?.toLowerCase().includes(normalizedQuery)) {
            relevance += 3;
            matches.push({ type: 'example', text: example.cmd, score: 3 });
          }
        }
      }
      
      // Fuzzy matching for individual words
      queryWords.forEach(word => {
        if (word.length > 2) { // Skip very short words
          [cmd.name, cmd.description, ...(cmd.help?.topics || [])].forEach(text => {
            if (text.toLowerCase().includes(word)) {
              relevance += 1;
            }
          });
        }
      });
      
      if (relevance > 0) {
        const bestMatch = matches.reduce((best, current) => 
          current.score > best.score ? current : best, 
          matches[0]
        );
        
        results.push({
          command: cmd,
          relevance,
          matchType: bestMatch?.type || 'description',
          matchText: bestMatch?.text
        });
      }
    });
    
    // Sort by relevance, then by name
    return results
      .sort((a, b) => {
        if (b.relevance !== a.relevance) {
          return b.relevance - a.relevance;
        }
        return a.command.name.localeCompare(b.command.name);
      })
      .slice(0, 20); // Limit results
  },

  /**
   * Get all unique topics for discovery
   */
  getAllTopics(): string[] {
    const topicsSet = new Set<string>();
    
    allEnhancedCommands.forEach(cmd => {
      if (cmd.help?.topics) {
        cmd.help.topics.forEach(topic => topicsSet.add(topic));
      }
    });
    
    return Array.from(topicsSet).sort();
  },

  /**
   * Get commands that reference this command in seeAlso
   */
  getRelatedCommands(commandName: string): EnhancedCommandConfig[] {
    return allEnhancedCommands.filter(cmd => 
      cmd.help?.seeAlso?.includes(commandName)
    );
  },

  /**
   * Validate registry integrity
   */
  validateRegistry(): { 
    isValid: boolean; 
    duplicateNames: string[]; 
    duplicateAliases: string[]; 
    missingCategories: string[];
  } {
    const nameSet = new Set<string>();
    const aliasSet = new Set<string>();
    const duplicateNames: string[] = [];
    const duplicateAliases: string[] = [];
    const missingCategories: string[] = [];
    
    allEnhancedCommands.forEach(cmd => {
      // Check for duplicate names
      if (nameSet.has(cmd.name)) {
        duplicateNames.push(cmd.name);
      } else {
        nameSet.add(cmd.name);
      }
      
      // Check for duplicate aliases
      if (cmd.aliases) {
        cmd.aliases.forEach(alias => {
          if (aliasSet.has(alias) || nameSet.has(alias)) {
            duplicateAliases.push(alias);
          } else {
            aliasSet.add(alias);
          }
        });
      }
      
      // Check for missing categories
      if (!cmd.help?.category || !CATEGORY_INFO[cmd.help.category]) {
        missingCategories.push(cmd.name);
      }
    });
    
    return {
      isValid: duplicateNames.length === 0 && duplicateAliases.length === 0 && missingCategories.length === 0,
      duplicateNames,
      duplicateAliases,
      missingCategories
    };
  },

  /**
   * Get command statistics
   */
  getStatistics() {
    const stats = {
      totalCommands: allEnhancedCommands.length,
      totalAliases: 0,
      commandsWithHelp: 0,
      commandsWithExamples: 0,
      commandsWithOptions: 0,
      categoryCounts: new Map<CommandCategory, number>()
    };
    
    allEnhancedCommands.forEach(cmd => {
      if (cmd.aliases) stats.totalAliases += cmd.aliases.length;
      if (cmd.help) stats.commandsWithHelp++;
      if (cmd.help?.examples?.length) stats.commandsWithExamples++;
      if (cmd.help?.options?.length) stats.commandsWithOptions++;
      
      const category = cmd.help?.category || 'utilities';
      stats.categoryCounts.set(category, (stats.categoryCounts.get(category) || 0) + 1);
    });
    
    return stats;
  }
};

// Validate on module load in development
if (process.env.NODE_ENV === 'development') {
  const validation = commandRegistry.validateRegistry();
  if (!validation.isValid) {
    console.error('Command registry validation failed:', validation);
  }
}

export default commandRegistry;
