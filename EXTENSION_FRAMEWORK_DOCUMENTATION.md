# Extension Framework Documentation

## Overview

This document provides comprehensive guidance for extending the modular command system used in the POV-CLI (Point-of-View Command Line Interface). The system is designed to be highly extensible, allowing developers to add new commands, categories, and functionality while maintaining consistency and best practices.

## Table of Contents

1. [Command Registration Pattern](#command-registration-pattern)
2. [Adding New Commands to Existing Categories](#adding-new-commands-to-existing-categories)
3. [Command Handler Templates](#command-handler-templates)
4. [Best Practices for Command Naming and Aliasing](#best-practices-for-command-naming-and-aliasing)
5. [Testing Patterns for New Commands](#testing-patterns-for-new-commands)
6. [Contribution Guidelines](#contribution-guidelines)
7. [Extending vs Creating New Categories](#extending-vs-creating-new-categories)
8. [Examples and Use Cases](#examples-and-use-cases)

## Command Registration Pattern

The command system follows a consistent registration pattern based on the `CommandConfig` interface:

### Core Interface

```typescript
export interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  handler: (args: string[]) => React.ReactNode;
}
```

### Registration Architecture

Commands are organized into separate modules for maintainability:

1. **Base Commands** (`lib/commands.tsx`) - Core system commands
2. **Extended Commands** (`lib/commands-ext.tsx`) - Additional functionality
3. **Specialized Commands** (`lib/scenario-commands.tsx`, `lib/download-commands.tsx`) - Domain-specific functionality

### Command Export Pattern

```typescript
// In your command module
export const myCommands: CommandConfig[] = [
  {
    name: 'example',
    description: 'An example command',
    usage: 'example [--flag]',
    aliases: ['ex', 'demo'],
    handler: (args) => {
      // Command implementation
      return <div>Command output</div>;
    }
  }
];
```

### Integration Pattern

Commands from different modules are combined in the main terminal component:

```typescript
// In terminal component
import { commands as baseCommands } from './lib/commands';
import { extendedCommands } from './lib/commands-ext';
import { downloadCommands } from './lib/download-commands';

const allCommands = [...baseCommands, ...extendedCommands, ...downloadCommands];
```

## Adding New Commands to Existing Categories

### Step 1: Identify the Appropriate Module

- **Core Commands** (`commands.tsx`): System utilities, help, basic navigation
- **Extended Commands** (`commands-ext.tsx`): User interaction, AI features, utilities
- **Download Commands** (`download-commands.tsx`): File download and distribution
- **Scenario Commands** (`scenario-commands.tsx`): Deployment and testing scenarios

### Step 2: Follow the Module Pattern

```typescript
// Example: Adding to commands-ext.tsx
import React from 'react';
import { commands as baseCommands, CommandConfig } from './commands';

const extendedCommands: CommandConfig[] = [
  // Existing commands...
  
  // Your new command
  {
    name: 'new-feature',
    description: 'Description of your new feature',
    usage: 'new-feature [options]',
    aliases: ['nf', 'feature'],
    handler: (args) => {
      // Implementation
      return (
        <div className="text-blue-300">
          <div className="font-bold">New Feature Output</div>
          <div>Feature functionality here</div>
        </div>
      );
    }
  }
];

export default extendedCommands;
```

### Step 3: Handle Command Arguments

```typescript
handler: (args) => {
  // Parse flags
  const verbose = args.includes('--verbose');
  const format = args.includes('--format') 
    ? args[args.indexOf('--format') + 1] 
    : 'default';
  
  // Parse positional arguments
  const target = args.find(arg => !arg.startsWith('--'));
  
  // Validation
  if (!target) {
    return (
      <div className="text-red-400">
        Error: Target required. Usage: {command.usage}
      </div>
    );
  }
  
  // Implementation
  return <div>Command output</div>;
}
```

## Command Handler Templates

### Basic Command Template

```typescript
{
  name: 'template-basic',
  description: 'A basic command template',
  usage: 'template-basic [arg]',
  aliases: ['tb'],
  handler: (args) => {
    const arg = args[0];
    
    return (
      <div className="text-blue-300">
        <div className="font-bold">Command Result</div>
        <div>Processed: {arg || 'No argument provided'}</div>
      </div>
    );
  }
}
```

### Interactive Command Template

```typescript
{
  name: 'template-interactive',
  description: 'An interactive command with multiple options',
  usage: 'template-interactive [--option1] [--option2] [value]',
  aliases: ['ti', 'interactive'],
  handler: (args) => {
    const option1 = args.includes('--option1');
    const option2 = args.includes('--option2');
    const value = args.find(arg => !arg.startsWith('--'));
    
    // Show help if no args
    if (args.length === 0) {
      return (
        <div className="text-yellow-400">
          <div className="font-bold">Interactive Command</div>
          <div className="text-gray-300 mt-2">Available options:</div>
          <div className="text-sm space-y-1 mt-2">
            <div className="font-mono text-green-400">--option1</div>
            <div className="font-mono text-blue-400">--option2</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-cyan-400">
        <div className="font-bold mb-3">Interactive Results</div>
        <div className="space-y-2">
          <div>Option 1: {option1 ? 'Enabled' : 'Disabled'}</div>
          <div>Option 2: {option2 ? 'Enabled' : 'Disabled'}</div>
          {value && <div>Value: {value}</div>}
        </div>
      </div>
    );
  }
}
```

### Async Command Template

```typescript
{
  name: 'template-async',
  description: 'An asynchronous command template',
  usage: 'template-async [--timeout=5000]',
  aliases: ['ta', 'async'],
  handler: async (args) => {
    const timeout = parseInt(
      args.find(arg => arg.startsWith('--timeout='))?.split('=')[1] || '3000'
    );
    
    // Loading state
    const LoadingComponent = () => (
      <div className="text-yellow-400">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-3"></div>
          <span>Processing...</span>
        </div>
      </div>
    );
    
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, timeout));
      
      return (
        <div className="text-green-400">
          <div className="font-bold">Async Operation Complete</div>
          <div>Completed in {timeout}ms</div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-red-400">
          <div className="font-bold">Error</div>
          <div>Operation failed: {error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      );
    }
  }
}
```

### Data Processing Template

```typescript
{
  name: 'template-data',
  description: 'A data processing command template',
  usage: 'template-data [--format=json|table|csv] [--filter=value]',
  aliases: ['td', 'data'],
  handler: (args) => {
    const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'table';
    const filter = args.find(arg => arg.startsWith('--filter='))?.split('=')[1];
    
    // Mock data
    const data = [
      { id: 1, name: 'Item 1', status: 'active' },
      { id: 2, name: 'Item 2', status: 'inactive' },
      { id: 3, name: 'Item 3', status: 'active' }
    ];
    
    // Apply filter
    const filteredData = filter 
      ? data.filter(item => item.status === filter)
      : data;
    
    // Render based on format
    switch (format) {
      case 'json':
        return (
          <div className="text-green-400">
            <div className="font-bold mb-2">JSON Output</div>
            <pre className="text-sm bg-black p-3 rounded">
              {JSON.stringify(filteredData, null, 2)}
            </pre>
          </div>
        );
      
      case 'table':
        return (
          <div className="text-blue-400">
            <div className="font-bold mb-2">Table Output</div>
            <div className="space-y-1 font-mono text-sm">
              <div className="text-gray-400 border-b border-gray-600 pb-1">
                ID    Name      Status
              </div>
              {filteredData.map(item => (
                <div key={item.id}>
                  {item.id.toString().padEnd(5)} 
                  {item.name.padEnd(9)} 
                  {item.status}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'csv':
        const csv = [
          'id,name,status',
          ...filteredData.map(item => `${item.id},${item.name},${item.status}`)
        ].join('\n');
        
        return (
          <div className="text-purple-400">
            <div className="font-bold mb-2">CSV Output</div>
            <pre className="text-sm bg-black p-3 rounded">{csv}</pre>
          </div>
        );
      
      default:
        return <div className="text-red-400">Unknown format: {format}</div>;
    }
  }
}
```

## Best Practices for Command Naming and Aliasing

### Naming Conventions

1. **Use lowercase with hyphens** for multi-word commands
   - ✅ `user-profile`
   - ❌ `userProfile`, `user_profile`

2. **Be descriptive but concise**
   - ✅ `search`, `download`, `status`
   - ❌ `s`, `dl`, `st` (as primary names)

3. **Use domain-specific prefixes for specialized commands**
   - ✅ `scenario-list`, `cortex-questions`
   - ❌ Generic names that could conflict

### Aliasing Strategy

1. **Provide 2-3 meaningful aliases**
   ```typescript
   aliases: ['short', 'alternative', 'common-variant']
   ```

2. **Include abbreviations and common alternatives**
   ```typescript
   // Good alias examples
   aliases: ['ls', 'list', 'dir']        // ls command
   aliases: ['?', 'man']                 // help command
   aliases: ['cq', 'ask-cortex', 'genai'] // cortex-questions
   ```

3. **Avoid single-letter aliases for non-standard commands**
   - ✅ Single letters for standard commands (`ls`, `cd`)
   - ❌ Single letters for custom commands (conflicts)

### Usage String Guidelines

1. **Follow standard CLI conventions**
   ```typescript
   usage: 'command [options] [arguments]'
   usage: 'command <required> [optional]'
   usage: 'command [--flag] [--option=value]'
   ```

2. **Be specific about required vs optional parameters**
   ```typescript
   // Good examples
   usage: 'search "query" [--docs] [--projects]'
   usage: 'scenario generate --scenario-type <type> --provider <provider>'
   usage: 'download [terraform|detection|cdr] [flags]'
   ```

3. **Include common flag patterns**
   ```typescript
   usage: 'status [--detailed] [--analytics] [--performance]'
   ```

## Testing Patterns for New Commands

### Unit Testing Template

```typescript
// tests/commands.test.ts
import { describe, it, expect, jest } from '@jest/globals';
import { render } from '@testing-library/react';
import { myCommand } from '../lib/my-commands';

describe('myCommand', () => {
  it('should handle basic execution', () => {
    const result = myCommand.handler([]);
    expect(result).toBeDefined();
  });
  
  it('should handle arguments correctly', () => {
    const result = myCommand.handler(['arg1', '--flag']);
    // Test specific behavior
  });
  
  it('should validate required parameters', () => {
    const result = myCommand.handler([]);
    // Test error handling
  });
  
  it('should process flags correctly', () => {
    const result = myCommand.handler(['--verbose', '--format=json']);
    // Test flag processing
  });
});
```

### Integration Testing

```typescript
// tests/integration/command-integration.test.ts
import { describe, it, expect } from '@jest/globals';
import { getAllCommands, findCommand } from '../lib/command-registry';

describe('Command Integration', () => {
  it('should register all commands without conflicts', () => {
    const commands = getAllCommands();
    const names = commands.map(cmd => cmd.name);
    const uniqueNames = new Set(names);
    
    expect(names.length).toBe(uniqueNames.size);
  });
  
  it('should handle alias resolution', () => {
    const command = findCommand('alias-name');
    expect(command).toBeDefined();
    expect(command?.name).toBe('actual-command-name');
  });
  
  it('should validate all command configurations', () => {
    const commands = getAllCommands();
    
    commands.forEach(cmd => {
      expect(cmd.name).toBeTruthy();
      expect(cmd.description).toBeTruthy();
      expect(cmd.usage).toBeTruthy();
      expect(typeof cmd.handler).toBe('function');
    });
  });
});
```

### Manual Testing Checklist

1. **Basic Functionality**
   - [ ] Command executes without errors
   - [ ] Help text displays correctly
   - [ ] Aliases work as expected

2. **Argument Handling**
   - [ ] Required arguments are validated
   - [ ] Optional arguments have defaults
   - [ ] Flags are processed correctly
   - [ ] Invalid arguments show appropriate errors

3. **Output Formatting**
   - [ ] Colors and styling are consistent
   - [ ] Text is readable and well-formatted
   - [ ] Long output doesn't break layout

4. **Error Handling**
   - [ ] Invalid arguments show helpful messages
   - [ ] Async operations handle failures gracefully
   - [ ] Network errors are handled appropriately

## Contribution Guidelines

### Code Standards

1. **TypeScript Strict Mode**
   - All commands must be properly typed
   - No `any` types allowed
   - Use proper React component types

2. **Styling Consistency**
   ```typescript
   // Use consistent Tailwind classes
   <div className="text-blue-300">        // Info
   <div className="text-green-400">       // Success
   <div className="text-red-400">         // Error
   <div className="text-yellow-400">      // Warning
   <div className="text-purple-400">      // Special
   <div className="text-cyan-400">        // Highlight
   ```

3. **Component Structure**
   ```typescript
   return (
     <div className="text-[color]">
       <div className="font-bold mb-[spacing]">[Title]</div>
       <div className="space-y-[spacing]">
         {/* Content */}
       </div>
       {/* Optional action section */}
       <div className="mt-[spacing] p-[spacing] bg-gray-800 rounded border border-[color]">
         {/* Actions or additional info */}
       </div>
     </div>
   );
   ```

### Documentation Requirements

1. **Command Documentation**
   - Clear description of command purpose
   - Complete usage examples
   - Flag and option documentation
   - Common use cases

2. **Code Comments**
   ```typescript
   {
     name: 'example',
     description: 'Clear, concise description',
     usage: 'example [options]',
     aliases: ['ex'],
     handler: (args) => {
       // Parse arguments with comments
       const verbose = args.includes('--verbose');
       
       // Validation with clear error messages
       if (requiredCondition) {
         return <ErrorComponent message="Clear error description" />;
       }
       
       // Main logic with comments
       const result = processCommand(args);
       
       // Consistent return format
       return <ResultComponent data={result} />;
     }
   }
   ```

### Pull Request Process

1. **Branch Naming**
   - `feature/command-name` for new commands
   - `enhancement/command-name` for improvements
   - `fix/command-name` for bug fixes

2. **Commit Messages**
   ```
   feat(commands): add new search functionality
   
   - Implement search across documentation and projects
   - Add filtering by category
   - Include relevance scoring
   ```

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] New command
   - [ ] Enhancement to existing command
   - [ ] Bug fix
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Manual testing completed
   - [ ] Integration tests pass
   
   ## Screenshots/Examples
   [Include command output examples]
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No breaking changes (or properly documented)
   ```

## Extending vs Creating New Categories

### When to Extend Existing Categories

**Extend existing categories when:**

1. **Functionality is closely related** to existing commands
   ```typescript
   // Extend commands-ext.tsx for user interaction features
   // Extend download-commands.tsx for new download types
   ```

2. **Command fits the module's theme**
   ```typescript
   // AI-related commands -> commands-ext.tsx
   // System utilities -> commands.tsx
   // Deployment/testing -> scenario-commands.tsx
   ```

3. **Dependencies align** with existing module dependencies
   ```typescript
   // Uses same external APIs or libraries
   // Shares similar error handling patterns
   ```

### When to Create New Categories

**Create new categories when:**

1. **Distinct domain or functionality**
   ```typescript
   // Example: analytics-commands.tsx for data analysis
   // Example: integration-commands.tsx for third-party services
   ```

2. **Significant number of related commands** (5+ commands)

3. **Different dependencies or patterns**
   ```typescript
   // Different external APIs
   // Different authentication requirements
   // Different data processing patterns
   ```

4. **Team ownership or maintenance** boundaries

### New Category Template

```typescript
// lib/new-category-commands.tsx
import React from 'react';
import { CommandConfig } from './commands';

// Type definitions specific to this category
export interface CategorySpecificType {
  // Category-specific types
}

// Utility functions for the category
const categoryHelper = (param: string) => {
  // Category-specific logic
};

export const newCategoryCommands: CommandConfig[] = [
  {
    name: 'category-command-1',
    description: 'First command in new category',
    usage: 'category-command-1 [options]',
    aliases: ['cc1'],
    handler: (args) => {
      return (
        <div className="text-blue-300">
          <div className="font-bold">Category Command 1</div>
          <div>Implementation here</div>
        </div>
      );
    }
  },
  // Additional commands...
];

export default newCategoryCommands;
```

## Examples and Use Cases

### Example 1: Adding a Simple Utility Command

```typescript
// Adding to commands-ext.tsx
{
  name: 'timestamp',
  description: 'Display current timestamp in various formats',
  usage: 'timestamp [--unix] [--iso] [--readable]',
  aliases: ['time', 'ts'],
  handler: (args) => {
    const now = new Date();
    const unix = args.includes('--unix');
    const iso = args.includes('--iso');
    const readable = args.includes('--readable');
    
    if (unix) {
      return (
        <div className="text-green-400">
          <div className="font-bold">Unix Timestamp</div>
          <div className="font-mono">{Math.floor(now.getTime() / 1000)}</div>
        </div>
      );
    }
    
    if (iso) {
      return (
        <div className="text-blue-400">
          <div className="font-bold">ISO 8601</div>
          <div className="font-mono">{now.toISOString()}</div>
        </div>
      );
    }
    
    if (readable) {
      return (
        <div className="text-purple-400">
          <div className="font-bold">Readable Format</div>
          <div className="font-mono">{now.toLocaleString()}</div>
        </div>
      );
    }
    
    // Default: show all formats
    return (
      <div className="text-cyan-400">
        <div className="font-bold mb-3">Current Timestamp</div>
        <div className="space-y-2 font-mono text-sm">
          <div><span className="text-gray-400">Unix:</span> {Math.floor(now.getTime() / 1000)}</div>
          <div><span className="text-gray-400">ISO:</span> {now.toISOString()}</div>
          <div><span className="text-gray-400">Local:</span> {now.toLocaleString()}</div>
        </div>
      </div>
    );
  }
}
```

### Example 2: Creating a New Analytics Category

```typescript
// lib/analytics-commands.tsx
import React from 'react';
import { CommandConfig } from './commands';

export interface AnalyticsData {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

const mockAnalytics: AnalyticsData[] = [
  { metric: 'Page Views', value: 15420, trend: 'up' },
  { metric: 'Unique Visitors', value: 8732, trend: 'up' },
  { metric: 'Bounce Rate', value: 23.4, trend: 'down' },
  { metric: 'Session Duration', value: 245, trend: 'stable' }
];

export const analyticsCommands: CommandConfig[] = [
  {
    name: 'analytics',
    description: 'View website and application analytics',
    usage: 'analytics [--summary] [--detailed] [--export]',
    aliases: ['stats', 'metrics'],
    handler: (args) => {
      const summary = args.includes('--summary');
      const detailed = args.includes('--detailed');
      const exportData = args.includes('--export');
      
      if (exportData) {
        const csv = [
          'metric,value,trend',
          ...mockAnalytics.map(item => `${item.metric},${item.value},${item.trend}`)
        ].join('\n');
        
        return (
          <div className="text-green-400">
            <div className="font-bold mb-2">Analytics Export</div>
            <pre className="text-sm bg-black p-3 rounded border border-green-600">
              {csv}
            </pre>
            <div className="text-xs text-gray-400 mt-2">
              Copy the above data to save as CSV
            </div>
          </div>
        );
      }
      
      return (
        <div className="text-blue-300">
          <div className="font-bold mb-4 text-xl">📊 Analytics Dashboard</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockAnalytics.map((item, idx) => (
              <div key={idx} className="border border-gray-600 p-3 rounded">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold">{item.metric}</div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    item.trend === 'up' ? 'bg-green-800 text-green-200' :
                    item.trend === 'down' ? 'bg-red-800 text-red-200' :
                    'bg-gray-800 text-gray-200'
                  }`}>
                    {item.trend === 'up' ? '↗️' : item.trend === 'down' ? '↘️' : '→'} {item.trend}
                  </div>
                </div>
                <div className="text-2xl font-mono">
                  {typeof item.value === 'number' && item.value > 1000 
                    ? `${(item.value / 1000).toFixed(1)}k` 
                    : item.value
                  }
                </div>
                {detailed && (
                  <div className="text-xs text-gray-400 mt-1">
                    Last 30 days
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-gray-800 rounded border border-blue-600">
            <div className="text-blue-400 font-bold mb-1">💡 Available Options</div>
            <div className="text-sm space-y-1">
              <div className="font-mono text-green-400">analytics --export</div>
              <div className="text-gray-400 ml-4">Export data as CSV format</div>
            </div>
          </div>
        </div>
      );
    }
  },
  
  {
    name: 'performance',
    description: 'View performance metrics and optimization suggestions',
    usage: 'performance [--detailed] [--suggestions]',
    aliases: ['perf'],
    handler: (args) => {
      const detailed = args.includes('--detailed');
      const suggestions = args.includes('--suggestions');
      
      const metrics = {
        loadTime: 2.3,
        firstPaint: 1.1,
        interactive: 3.2,
        cumulativeShift: 0.05
      };
      
      return (
        <div className="text-yellow-400">
          <div className="font-bold mb-4 text-xl">⚡ Performance Metrics</div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-l-4 border-green-500 pl-3">
                <div className="text-green-400 font-bold">Load Time</div>
                <div className="text-2xl font-mono">{metrics.loadTime}s</div>
                <div className="text-xs text-gray-400">Target: &lt;3s</div>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-3">
                <div className="text-blue-400 font-bold">First Paint</div>
                <div className="text-2xl font-mono">{metrics.firstPaint}s</div>
                <div className="text-xs text-gray-400">Target: &lt;1.5s</div>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-3">
                <div className="text-purple-400 font-bold">Time to Interactive</div>
                <div className="text-2xl font-mono">{metrics.interactive}s</div>
                <div className="text-xs text-gray-400">Target: &lt;5s</div>
              </div>
              
              <div className="border-l-4 border-green-500 pl-3">
                <div className="text-green-400 font-bold">Cumulative Layout Shift</div>
                <div className="text-2xl font-mono">{metrics.cumulativeShift}</div>
                <div className="text-xs text-gray-400">Target: &lt;0.1</div>
              </div>
            </div>
            
            {suggestions && (
              <div className="mt-6 p-4 bg-gray-800 rounded border border-yellow-600">
                <div className="text-yellow-400 font-bold mb-2">🚀 Optimization Suggestions</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <div className="text-green-400 mr-2">✓</div>
                    <div>Images are properly optimized</div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-blue-400 mr-2">→</div>
                    <div>Consider implementing service worker caching</div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-yellow-400 mr-2">!</div>
                    <div>Some CSS could be inlined for critical path</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  }
];

export default analyticsCommands;
```

### Example 3: Extending Download Commands

```typescript
// Adding to download-commands.tsx
{
  name: 'docs',
  description: 'Download documentation and guides',
  usage: 'docs [--api] [--tutorials] [--examples] [--all]',
  aliases: ['documentation', 'guides'],
  handler: async (args) => {
    const api = args.includes('--api');
    const tutorials = args.includes('--tutorials');
    const examples = args.includes('--examples');
    const all = args.includes('--all');
    
    if (!api && !tutorials && !examples && !all) {
      return (
        <div className="text-cyan-400">
          <div className="font-bold mb-4 text-xl">📚 Documentation Downloads</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-blue-500 bg-gray-900 p-4 rounded hover:bg-gray-800 cursor-pointer">
              <div className="text-blue-400 font-bold text-lg mb-2">📖 API Documentation</div>
              <div className="text-gray-300 text-sm mb-3">
                Complete API reference and integration guides
              </div>
              <div className="font-mono text-xs bg-black p-2 rounded">
                docs --api
              </div>
            </div>
            
            <div className="border border-green-500 bg-gray-900 p-4 rounded hover:bg-gray-800 cursor-pointer">
              <div className="text-green-400 font-bold text-lg mb-2">🎓 Tutorials</div>
              <div className="text-gray-300 text-sm mb-3">
                Step-by-step tutorials and learning materials
              </div>
              <div className="font-mono text-xs bg-black p-2 rounded">
                docs --tutorials
              </div>
            </div>
            
            <div className="border border-purple-500 bg-gray-900 p-4 rounded hover:bg-gray-800 cursor-pointer">
              <div className="text-purple-400 font-bold text-lg mb-2">💻 Code Examples</div>
              <div className="text-gray-300 text-sm mb-3">
                Ready-to-use code examples and templates
              </div>
              <div className="font-mono text-xs bg-black p-2 rounded">
                docs --examples
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-800 rounded border border-cyan-600">
            <div className="text-cyan-400 font-bold mb-2">🚀 Quick Download</div>
            <div className="font-mono text-sm text-green-400">docs --all</div>
            <div className="text-xs text-gray-300 mt-1">
              Download complete documentation package
            </div>
          </div>
        </div>
      );
    }
    
    // Generate download based on selection
    const backendSchema = {
      service: 'documentation-service',
      method: 'GET' as const,
      endpoint: '/api/v1/docs/download',
      parameters: {
        types: all ? ['api', 'tutorials', 'examples'] : 
               [api && 'api', tutorials && 'tutorials', examples && 'examples'].filter(Boolean)
      },
      authentication: {
        type: 'service_account' as const,
        credentials: '{{GCP_SERVICE_ACCOUNT_KEY}}'
      },
      storage: {
        bucket: 'henryreed-ai-docs',
        path: 'documentation'
      },
      metadata: {
        category: 'documentation',
        type: 'docs-package',
        version: '1.0.0'
      }
    };
    
    // Simulate download initiation
    const downloadInfo = await initiateDownload('docs', args, backendSchema);
    
    return (
      <div className="text-blue-400">
        <div className="font-bold mb-4 text-xl">📚 Documentation Download</div>
        
        <div className="mb-4 p-4 bg-gray-900 rounded border border-blue-500">
          <div className="text-green-400 font-bold mb-2">✅ Download Initiated</div>
          <div className="space-y-2 text-sm">
            <div>Session ID: <span className="font-mono text-cyan-400">{downloadInfo.sessionId}</span></div>
            <div>Timestamp: <span className="font-mono text-gray-300">{downloadInfo.timestamp}</span></div>
          </div>
        </div>
        
        <div className="space-y-3">
          {(api || all) && (
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="text-blue-400 font-bold">📖 API Documentation</div>
              <div className="text-sm text-gray-300 mt-1">
                • REST API endpoints and authentication<br/>
                • GraphQL schema and queries<br/>
                • SDK documentation and examples<br/>
                • Rate limiting and best practices
              </div>
            </div>
          )}
          
          {(tutorials || all) && (
            <div className="border-l-4 border-green-500 pl-4">
              <div className="text-green-400 font-bold">🎓 Tutorials</div>
              <div className="text-sm text-gray-300 mt-1">
                • Getting started guides<br/>
                • Advanced implementation tutorials<br/>
                • Best practices and patterns<br/>
                • Troubleshooting guides
              </div>
            </div>
          )}
          
          {(examples || all) && (
            <div className="border-l-4 border-purple-500 pl-4">
              <div className="text-purple-400 font-bold">💻 Code Examples</div>
              <div className="text-sm text-gray-300 mt-1">
                • Complete application examples<br/>
                • Code snippets and utilities<br/>
                • Integration templates<br/>
                • Testing and deployment scripts
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-gray-800 rounded border border-blue-600">
          <div className="text-blue-400 font-bold mb-2">📦 Package Contents</div>
          <div className="text-sm text-gray-300 space-y-1">
            <div>• Markdown documentation files</div>
            <div>• Interactive HTML documentation</div>
            <div>• Code examples in multiple languages</div>
            <div>• Configuration templates</div>
            <div>• Video tutorials and screencasts</div>
          </div>
          <div className="mt-3 font-mono text-xs bg-black p-2 rounded">
            Download URL: <span className="text-green-400">{downloadInfo.downloadUrl}</span>
          </div>
        </div>
      </div>
    );
  }
}
```

## Conclusion

This extension framework provides a robust foundation for building and maintaining a modular command system. By following these patterns and guidelines, developers can:

1. **Create consistent, maintainable commands** that integrate seamlessly
2. **Follow established patterns** for argument parsing and output formatting  
3. **Maintain high code quality** through testing and documentation standards
4. **Scale the system effectively** by choosing appropriate extension strategies

The modular architecture supports both incremental enhancement of existing categories and creation of entirely new command domains, ensuring the system can grow to meet evolving requirements while maintaining consistency and usability.

Remember to:
- Test thoroughly before submitting changes
- Document new commands and features completely
- Follow the established styling and interaction patterns
- Consider the user experience and discoverability of new commands
- Maintain backward compatibility when possible

For questions or support with extending the command system, refer to the existing command implementations as examples and consult the development team for architectural decisions.
