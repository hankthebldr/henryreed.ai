# TypeScript Structure Analysis: Command System Architecture

## Table of Contents
1. [CommandConfig Interface](#commandconfig-interface)
2. [Handler Function Signatures](#handler-function-signatures)
3. [Return Type Patterns](#return-type-patterns)
4. [Command Execution Flow](#command-execution-flow)
5. [Special Handlers: Async Scenario Commands](#special-handlers-async-scenario-commands)
6. [Type System Overview](#type-system-overview)

---

## CommandConfig Interface

The core interface that defines the structure for all terminal commands:

```typescript
interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  handler: (args: string[]) => React.ReactNode | Promise<React.ReactNode>;
}
```

### Properties Analysis

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | ✅ | Primary command identifier (e.g., "help", "scenario") |
| `description` | `string` | ✅ | Human-readable description shown in help |
| `usage` | `string` | ✅ | Usage syntax with parameters and flags |
| `aliases` | `string[]` | ❌ | Alternative command names for user convenience |
| `handler` | `Function` | ✅ | Command execution function (sync/async) |

### Usage Examples

```typescript
// Basic synchronous command
{
  name: 'whoami',
  description: 'Display information about Henry Reed',
  usage: 'whoami [--detailed]',
  aliases: ['me', 'info'],
  handler: (args) => <div>Henry Reed - AI Engineer</div>
}

// Complex asynchronous command
{
  name: 'scenario',
  description: 'Deploy and manage security assessment scenarios',
  usage: 'scenario <action> [options]',
  aliases: ['deploy', 'pov'],
  handler: async (args) => { /* async implementation */ }
}
```

---

## Handler Function Signatures

### Standard Signature
```typescript
(args: string[]) => React.ReactNode | Promise<React.ReactNode>
```

### Input Parameters
- **`args: string[]`**: Command-line arguments parsed from user input
  - Excludes the command name itself
  - Includes flags, options, and positional arguments
  - Example: `scenario deploy --type cloud` → `['deploy', '--type', 'cloud']`

### Return Types
Handlers support both synchronous and asynchronous patterns:

```typescript
// Synchronous handler
handler: (args: string[]) => React.ReactNode

// Asynchronous handler
handler: async (args: string[]) => Promise<React.ReactNode>
```

### Parameter Processing Patterns

#### 1. Flag Detection
```typescript
handler: (args) => {
  const detailed = args.includes('--detailed');
  const email = args.includes('--email');
  // ...
}
```

#### 2. Positional Arguments
```typescript
handler: (args) => {
  const action = args[0]?.toLowerCase();
  const target = args[1];
  // ...
}
```

#### 3. Complex Parsing
```typescript
handler: async (args) => {
  const command = parseScenarioCommand(['generate', ...args]);
  if (!command?.scenarioType) {
    return <ErrorComponent />;
  }
  // ...
}
```

---

## Return Type Patterns

### 1. JSX Elements (Most Common)
```typescript
// Simple content
return <div className="text-blue-300">Hello World</div>;

// Complex layouts
return (
  <div className="text-blue-300">
    <div className="font-bold mb-4 text-xl">🚀 All Products & Services</div>
    <div className="space-y-4">
      {/* nested content */}
    </div>
  </div>
);
```

### 2. Null Returns
```typescript
// Special handling (e.g., clear command)
handler: () => {
  // This will be handled in the main component
  return null;
}
```

### 3. Conditional Returns
```typescript
handler: (args) => {
  if (args.includes('--help')) {
    return <HelpComponent />;
  }
  
  if (args.length === 0) {
    return <DefaultView />;
  }
  
  return <ProcessedView args={args} />;
}
```

### 4. Async Responses
```typescript
handler: async (args) => {
  try {
    const result = await apiCall(args);
    return <SuccessComponent data={result} />;
  } catch (error) {
    return <ErrorComponent error={error} />;
  }
}
```

### 5. Error Handling Patterns
```typescript
// Validation errors
return (
  <div className="text-red-400">
    <div className="font-bold mb-2">❌ Invalid Command</div>
    <div>Required parameters missing.</div>
  </div>
);

// Runtime errors
return (
  <div className="text-red-400">
    <div className="font-bold mb-2">❌ Command Error</div>
    <div>Failed to execute: {error.message}</div>
  </div>
);
```

---

## Command Execution Flow

### 1. Input Parsing
```typescript
const executeCommand = async (inputStr: string) => {
  const trimmed = inputStr.trim();
  if (!trimmed) return;

  const parts = trimmed.split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
```

### 2. Command Resolution
```typescript
  const config = commandConfigs.find(c => 
    c.name === command || c.aliases?.includes(command)
  );
```

### 3. Handler Execution Detection
```typescript
  // Handle both sync and async handlers
  const result = config.handler(args);
  
  // Async detection using duck typing
  if (result && typeof result === 'object' && 'then' in result) {
    // Async path
  } else {
    // Sync path
  }
```

### 4. Async Handler Flow
```typescript
  // Show loading state
  const loadingCommand: Command = {
    input: trimmed,
    output: (
      <div className="text-blue-300">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-3"></div>
          <span>Processing command...</span>
        </div>
      </div>
    ),
    timestamp: new Date()
  };

  // Update with loading state
  setCommands(prev => [...prev, loadingCommand]);

  // Wait for result and update
  const asyncOutput = await (result as Promise<React.ReactNode>);
  setCommands(prev => {
    const newCommands = [...prev];
    newCommands[newCommands.length - 1] = {
      input: trimmed,
      output: asyncOutput,
      timestamp: new Date()
    };
    return newCommands;
  });
```

### 5. Error Handling
```typescript
  try {
    const result = config.handler(args);
    // ...
  } catch (error) {
    output = (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Command Error</div>
        <div>Failed to execute: {error.message}</div>
      </div>
    );
  }
```

### 6. Output Rendering
```typescript
  const newCommand: Command = {
    input: trimmed,
    output,
    timestamp: new Date()
  };

  setCommands(prev => [...prev, newCommand]);
  setHistory(prev => [...prev, trimmed]);
```

---

## Special Handlers: Async Scenario Commands

### Cloud Functions Integration
```typescript
import { cloudFunctionsAPI } from './cloud-functions-api';

export const scenarioCommands = {
  generate: async (args: string[]) => {
    const command = parseScenarioCommand(['generate', ...args]);
    
    // Validation
    if (!command || !command.scenarioType) {
      return <ValidationError />;
    }

    try {
      // Async API call with simulation
      const result = await cloudFunctionsAPI.simulateDeployment(command);
      
      if (result.success) {
        // Store deployment state
        activeDeployments.set(result.deploymentId!, {
          command,
          startTime: new Date(),
          status: 'deploying'
        });
        
        return <DeploymentSuccess result={result} />;
      } else {
        return <DeploymentFailure result={result} />;
      }
    } catch (error) {
      return <AsyncError error={error} />;
    }
  }
};
```

### Async Command Types
```typescript
interface CloudFunctionsAPI {
  deployScenario(command: ScenarioCommand): Promise<{
    success: boolean;
    deploymentId?: string;
    message: string;
    estimatedCompletion?: string;
  }>;
  
  getDeploymentStatus(deploymentId: string): Promise<{
    success: boolean;
    deployment?: ScenarioDeployment;
    message: string;
  }>;
  
  // ... other async methods
}
```

### Loading State Management
```typescript
// Loading indicator component
const LoadingIndicator = () => (
  <div className="text-blue-300">
    <div className="font-bold mb-2">🚀 Deploying Scenario</div>
    <div className="flex items-center">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-3"></div>
      <span>Initiating scenario deployment...</span>
    </div>
  </div>
);
```

### State Persistence
```typescript
// In-memory storage for demo (would be database in production)
const activeDeployments = new Map<string, any>();

// State management
activeDeployments.set(deploymentId, {
  command,
  startTime: new Date(),
  status: 'deploying'
});
```

---

## Type System Overview

### Core Types
```typescript
// Command structure
interface Command {
  input: string;
  output: React.ReactNode;
  timestamp: Date;
}

// Scenario-specific types
type ScenarioType = 
  | 'cloud-posture' 
  | 'container-vuln' 
  | 'code-vuln' 
  | 'insider-threat' 
  | 'ransomware' 
  | 'waas-exploit' 
  | 'ai-threat' 
  | 'pipeline-breach' 
  | 'custom';

interface ScenarioDeployment {
  id: string;
  scenarioId: string;
  status: 'pending' | 'deploying' | 'running' | 'validating' | 'complete' | 'failed' | 'destroying';
  startTime: Date;
  endTime?: Date;
  provider: Provider;
  region: string;
  resources: {
    cloudFunctionUrl?: string;
    storageUrl?: string;
    logs?: string[];
  };
  results?: {
    validationPassed: boolean;
    detectionAlerts: any[];
    telemetryData: any[];
    performanceMetrics: any;
  };
}
```

### Handler Type Variations
```typescript
// Basic handler
type BasicHandler = (args: string[]) => React.ReactNode;

// Async handler
type AsyncHandler = (args: string[]) => Promise<React.ReactNode>;

// Union type (actual implementation)
type CommandHandler = (args: string[]) => React.ReactNode | Promise<React.ReactNode>;
```

### Return Type Union
```typescript
type CommandReturn = 
  | React.ReactElement
  | React.ReactFragment
  | string
  | number
  | null
  | undefined
  | Promise<React.ReactNode>;
```

---

## Key Architectural Decisions

### 1. **Type Safety**: Full TypeScript coverage with strict typing
### 2. **Async Support**: Native Promise support with loading states
### 3. **Error Boundaries**: Comprehensive error handling at multiple levels
### 4. **Extensibility**: Plugin-like command structure for easy extension
### 5. **User Experience**: Loading indicators, tab completion, command history
### 6. **State Management**: React hooks with proper async state handling

This architecture enables a robust, type-safe terminal interface that supports both simple synchronous commands and complex asynchronous operations while maintaining excellent developer experience and user interaction patterns.
