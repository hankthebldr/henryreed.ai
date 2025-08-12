# POV-CLI Command Parameters and Flags Schema Documentation

## Overview

This document provides comprehensive documentation for all command parameters, flags, data types, validation rules, and parsing logic for the POV-CLI (Point-of-View Command Line Interface) terminal system.

---

## 1. Parameter Type System

### 1.1 Data Types

The command system uses the following data types for parameters:

```typescript
// Core parameter types
type FlagType = 'boolean' | 'string' | 'string[]' | 'enum' | 'number';
type ParameterValue = string | boolean | string[] | number;

// Parameter validation rules
interface ParameterRule {
  required: boolean;
  dataType: FlagType;
  allowedValues?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  dependsOn?: string[];
  mutuallyExclusive?: string[];
}
```

### 1.2 Flag Notation Conventions

- **Boolean flags**: `--flag` (presence indicates true, absence indicates false)
- **String parameters**: `--param value` or `--param="value"`
- **Quoted strings**: `"quoted value with spaces"`
- **Multiple values**: `--flags value1 value2 value3`
- **Enum values**: Predefined set of allowed values

---

## 2. Core System Commands

### 2.1 `help` Command

```yaml
name: help
aliases: ['?', 'man']
usage: help [command]
parameters:
  command:
    type: string
    required: false
    description: "Specific command to get help for"
    validation:
      - Must match existing command name or alias
    examples:
      - "help ls"
      - "help cortex-questions"
      - "? scenario"
```

### 2.2 `clear` Command

```yaml
name: clear
aliases: ['cls']
usage: clear
parameters: none
special_behavior: "Intercepted by main component, clears terminal state"
```

### 2.3 `ls` Command

```yaml
name: ls
aliases: ['list', 'dir']
usage: ls [ctx|projects|services] [--all-products] [--skills] [--recent]
parameters:
  context:
    type: enum
    required: false
    allowed_values: ['ctx', 'projects', 'services']
    description: "Context area to explore"
    
  --all-products:
    type: boolean
    required: false
    description: "Show complete service portfolio"
    combines_with: ['ctx']
    
  --skills:
    type: boolean
    required: false
    description: "Display technical expertise matrix"
    combines_with: ['ctx']
    
  --recent:
    type: boolean
    required: false
    description: "Show recent project activity"
    combines_with: ['ctx', 'projects']

flag_combinations:
  - "ctx --all-products": "Comprehensive service overview"
  - "ctx --skills": "Technical skills breakdown"
  - "projects --recent": "Recent project showcase"
  - "services": "Service exploration (redirects to ctx --all-products)"

validation_rules:
  - Context parameter must be first if provided
  - Flags only apply to specific contexts
  - Invalid combinations ignored gracefully
```

---

## 3. Information Commands

### 3.1 `status` Command

```yaml
name: status
aliases: ['info', 'stats']
usage: status [--detailed] [--analytics] [--performance]
parameters:
  --detailed:
    type: boolean
    required: false
    description: "Show comprehensive system status dashboard"
    
  --analytics:
    type: boolean
    required: false
    description: "Display usage analytics and metrics"
    metrics:
      - commands_executed: number
      - questions_processed: number
      - insights_generated: number
    
  --performance:
    type: boolean
    required: false
    description: "Show performance metrics and uptime"
    metrics:
      - avg_response_time: string (ms)
      - success_rate: string (%)
      - uptime: string (%)

flag_combinations:
  - "status": "Basic online status"
  - "status --detailed": "Full system dashboard"
  - "status --analytics --performance": "Combined metrics view"
  - All flags can be combined for comprehensive view
```

---

## 4. Service Commands

### 4.1 `services` Command

```yaml
name: services
aliases: ['offerings', 'solutions']
usage: services [--all] [--consulting] [--development] [--training]
parameters:
  --all:
    type: boolean
    required: false
    description: "Show all available services"
    
  --consulting:
    type: boolean
    required: false
    description: "AI strategy and consulting services"
    status: "planned_feature"
    
  --development:
    type: boolean
    required: false
    description: "Custom AI development services"
    status: "planned_feature"
    
  --training:
    type: boolean
    required: false
    description: "Training and education services"
    status: "planned_feature"

redirect_behavior: "Currently redirects to 'ls ctx --all-products'"
```

---

## 5. Cloud Detection Commands

### 5.1 `cloud-detect` Command

```yaml
name: cloud-detect
usage: cloud-detect [--egg]
parameters:
  --egg:
    type: boolean
    required: false
    description: "Reveal hidden message"
source: another/cdr.yaml
```

---

## 6. AI-Powered Commands

### 6.1 `cortex-questions` Command

```yaml
name: cortex-questions
aliases: ['cq', 'ask-cortex', 'genai']
usage: cortex-questions "your question here"
parameters:
  question:
    type: string
    required: true
    description: "Question text for AI analysis"
    validation:
      - Must be enclosed in quotes if contains spaces
      - Minimum length: 10 characters
      - Maximum length: 500 characters
      - No special characters that could break parsing
    parsing_rules:
      - Quotes removed during processing
      - Multiple arguments joined with spaces
      - Empty strings rejected

ai_processing:
  question_id: "Generated 8-character random string"
  timestamp: "ISO 8601 format"
  analysis_components:
    - summary: "Analysis overview"
    - key_points: "Array of strategic considerations"
    - recommendations: "Array of AI-generated suggestions"
    - next_actions: "Array of suggested next steps"

special_parsing:
  - Input: 'cortex-questions "How can AI improve customer service?"'
  - Parsed: question = "How can AI improve customer service?"
  - Generated ID: "abc12def"
  - Timestamp: "2024-01-15T10:30:00.000Z"
```

### 6.2 `ai` Command

```yaml
name: ai
aliases: ['ask', 'chat']
usage: ai [prompt]
parameters:
  prompt:
    type: string
    required: false
    description: "Question or prompt for AI assistant"
    validation:
      - Joined from all arguments with spaces
      - No length restrictions
      - Special character handling for natural language

response_patterns:
  llm_queries:
    triggers: ['llm', 'language model', 'large language']
    response_type: "specialized_llm_information"
    
  business_queries:
    triggers: ['business', 'company', 'organization']
    response_type: "business_ai_applications"
    
  service_queries:
    triggers: ['service', 'offer', 'help', 'consulting']
    response_type: "service_portfolio_overview"
    
  default_response:
    fallback: "General AI assistant with consultation prompt"

parsing_logic:
  - All arguments joined with spaces
  - Case-insensitive keyword matching
  - Pattern matching for response selection
```

### 6.3 `search` Command

```yaml
name: search
aliases: ['find', 'lookup']
usage: search "query" [--docs] [--projects] [--insights]
parameters:
  query:
    type: string
    required: true
    description: "Search query text"
    validation:
      - Must be provided (non-empty after quote removal)
      - Quotes optional but recommended for multi-word queries
      - Case-insensitive matching
    parsing_rules:
      - Quotes removed from query string
      - Non-flag arguments joined with spaces
      - Empty queries trigger usage help
      
  --docs:
    type: boolean
    required: false
    description: "Search documentation only"
    scope: "documentation, guides, frameworks"
    
  --projects:
    type: boolean
    required: false
    description: "Search projects only"
    scope: "case studies, implementations, education materials"
    
  --insights:
    type: boolean
    required: false
    description: "Search insights only"
    scope: "analysis, metrics, strategies"

search_behavior:
  no_flags: "Search all categories"
  single_flag: "Search specified category only"
  multiple_flags: "Search specified categories only"
  
special_parsing_examples:
  - 'search "machine learning deployment"' -> query="machine learning deployment"
  - 'search AI strategy --docs' -> query="AI strategy", scope="docs"
  - 'find computer vision --projects --insights' -> query="computer vision", scope=["projects","insights"]
```

---

## 6. Context Point-of-View Commands

### 6.1 `ctxpov` Command

```yaml
name: ctxpov
aliases: ['ctx-pov', 'perspective']
usage: ctxpov [--cloud] [--c1] [--enterprise] [--startups] [--all]
parameters:
  --cloud:
    type: boolean
    required: false
    description: "Cloud AI strategy resources"
    generates: "Cloud migration, multi-cloud AI, cost optimization URLs"
    
  --c1:
    type: boolean
    required: false
    description: "C-level executive resources"
    generates: "AI strategy briefing, executive dashboard, risk assessment URLs"
    
  --enterprise:
    type: boolean
    required: false
    description: "Enterprise-focused AI solutions"
    generates: "Enterprise platform, scalability assessment URLs"
    
  --startups:
    type: boolean
    required: false
    description: "Startup and scale-up resources" 
    generates: "AI MVP development, funding pitch deck URLs"
    
  --all:
    type: boolean
    required: false
    description: "All available context URLs"
    overrides: "All other flags when present"

flag_combinations:
  special_combinations:
    "--cloud --c1":
      description: "Executive cloud strategy resources"
      generates: "Combined cloud + C1 executive URLs"
      unique_urls:
        - "Enterprise Cloud Strategy"
        - "Multi-Cloud AI Architecture" 
        - "Cloud ROI Calculator"
        - "Executive Dashboard"

url_generation_logic:
  base_url: "https://henryreed.ai"
  session_tracking: "Random 15-character session ID"
  timestamp: "Unix timestamp for personalization"
  format: "${base_url}/${service}/${context}?session=${sessionId}&t=${timestamp}"

validation_rules:
  - At least one flag required for meaningful output
  - All flags are optional and combinable
  - --all overrides other flags
  - Unknown flags ignored
```

---

## 7. Download Management Commands

### 7.1 `download` Command

```yaml
name: download
aliases: ['dl', 'get']
usage: download [terraform|detection|cdr] [flags]
parameters:
  module:
    type: enum
    required: false
    allowed_values: ['terraform', 'detection', 'cdr']
    description: "Download module type"
    default_behavior: "Show download center overview"

delegation_logic:
  - No args: Show download center with all options
  - With module: Delegate to specific module handler
  - Invalid module: Show error with available options

integration: "Google Cloud Platform backend schema for downloads"
```

### 7.2 `terraform` Command

```yaml
name: terraform
aliases: ['tf', 'infra']
usage: terraform [--aws] [--gcp] [--azure] [--kubernetes] [--all]
parameters:
  --aws:
    type: boolean
    required: false
    description: "Include AWS infrastructure templates"
    resources: "EC2, ECS, Lambda, SageMaker configurations"
    
  --gcp:
    type: boolean
    required: false
    description: "Include Google Cloud Platform templates"
    resources: "GKE, Cloud Run, AI Platform, IAM policies"
    
  --azure:
    type: boolean
    required: false
    description: "Include Microsoft Azure templates"
    resources: "AKS, Container Instances, Cognitive Services"
    
  --kubernetes:
    type: boolean
    required: false
    description: "Include Kubernetes deployment manifests"
    resources: "Pod definitions, services, ingress configurations"
    
  --all:
    type: boolean
    required: false
    description: "Include all provider templates"
    overrides: ['--aws', '--gcp', '--azure']
    auto_includes: ['--kubernetes']

backend_integration:
  service: 'terraform-templates'
  method: 'GET'
  authentication: 'service_account'
  storage_bucket: 'henryreed-ai-downloads'
  storage_path: 'terraform-templates'
  
validation_rules:
  - At least one provider flag or --all required
  - Multiple provider flags combinable
  - --all overrides individual provider flags
  - --kubernetes can combine with any provider combination
```

### 7.3 `detection` Command

```yaml
name: detection
aliases: ['detect', 'security']
usage: detection [--malware] [--network] [--anomaly] [--compliance] [--all]
parameters:
  --malware:
    type: boolean
    required: false
    description: "Include malware detection scripts"
    resources: "YARA rules, behavioral analysis, signature detection"
    
  --network:
    type: boolean
    required: false
    description: "Include network security monitoring"
    resources: "Intrusion detection, traffic analysis, anomaly detection"
    
  --anomaly:
    type: boolean
    required: false
    description: "Include anomaly detection algorithms"
    resources: "ML-based behavioral analysis, statistical anomaly detection"
    
  --compliance:
    type: boolean
    required: false
    description: "Include compliance monitoring tools"
    resources: "SOC 2, GDPR, PCI-DSS monitoring scripts"
    
  --all:
    type: boolean
    required: false
    description: "Include all detection modules"
    overrides: ['--malware', '--network', '--anomaly', '--compliance']

security_modules:
  malware:
    file_types: ['.yar', '.py', '.sh']
    categories: ['signature-based', 'heuristic', 'behavioral']
  network:
    protocols: ['tcp', 'udp', 'icmp', 'http', 'https']
    detection_methods: ['pattern-matching', 'statistical-analysis']
  anomaly:
    algorithms: ['isolation-forest', 'one-class-svm', 'autoencoders']
  compliance:
    frameworks: ['SOC2', 'GDPR', 'PCI-DSS', 'HIPAA']
```

### 7.4 `cdr` Command

```yaml
name: cdr
aliases: ['cloud-detection', 'detection-box']
usage: cdr [--full] [--lite] [--custom] [--config]
parameters:
  --full:
    type: boolean
    required: false
    description: "Complete CDR platform installation"
    includes: "All detection modules, full dashboard, advanced analytics"
    
  --lite:
    type: boolean
    required: false
    description: "Lightweight CDR installation"
    includes: "Core detection, basic dashboard, essential monitoring"
    
  --custom:
    type: boolean
    required: false
    description: "Customizable CDR configuration"
    includes: "Modular components, configuration templates"
    
  --config:
    type: boolean
    required: false
    description: "Download configuration files only"
    includes: "YAML configs, environment templates, documentation"

external_integration:
  repository: "GitHub - hankthebldr/CDR"
  url: "https://raw.githubusercontent.com/hankthebldr/CDR/refs/heads/master/cdr.yml"
  direct_access: true

validation_rules:
  - Mutually exclusive: only one of --full, --lite, --custom allowed
  - --config can combine with other flags
  - No flags defaults to --full
```

---

## 8. Advanced Scenario Management Commands

### 8.1 `scenario` Command

```yaml
name: scenario
aliases: ['deploy', 'pov']
usage: scenario <action> [options]
parameters:
  action:
    type: enum
    required: true
    allowed_values: ['list', 'generate', 'status', 'validate', 'destroy', 'export']
    description: "Scenario management action"
    
actions:
  list:
    usage: "scenario list [--scenario-type <type>]"
    parameters:
      --scenario-type:
        type: enum
        required: false
        allowed_values: ['cloud-posture', 'container-vuln', 'code-vuln', 'insider-threat', 'ransomware', 'waas-exploit', 'ai-threat', 'pipeline-breach']
        description: "Filter by specific scenario type"
        
  generate:
    usage: "scenario generate --scenario-type <type> [options]"
    parameters:
      --scenario-type:
        type: enum
        required: true
        allowed_values: ['cloud-posture', 'container-vuln', 'code-vuln', 'insider-threat', 'ransomware', 'waas-exploit', 'ai-threat', 'pipeline-breach']
        description: "Type of scenario to deploy"
        
      --provider:
        type: enum
        required: false
        allowed_values: ['aws', 'gcp', 'azure', 'k8s', 'local']
        default: 'gcp'
        description: "Cloud provider for deployment"
        
      --region:
        type: string
        required: false
        default: 'us-central1'
        description: "Deployment region"
        validation:
          - Must match provider-specific region format
          
      --template:
        type: string
        required: false
        description: "Specific template ID to use"
        validation:
          - Must exist in scenario templates
          
      --auto-validate:
        type: boolean
        required: false
        description: "Automatically run validation after deployment"
        
      --destroy-after:
        type: string
        required: false
        description: "Auto-destroy resources after specified duration"
        format: "1h, 2d, 1w"
        validation:
          - Must match duration pattern: /^\d+[hdw]$/
          
  status:
    usage: "scenario status [deployment-id]"
    parameters:
      deployment-id:
        type: string
        required: false
        description: "Specific deployment to check (or all if omitted)"
        validation:
          - Must be valid deployment ID
          - 8-character alphanumeric string
          
  validate:
    usage: "scenario validate <deployment-id>"
    parameters:
      deployment-id:
        type: string
        required: true
        description: "Deployment ID to validate"
        
  destroy:
    usage: "scenario destroy <deployment-id>"
    parameters:
      deployment-id:
        type: string
        required: true
        description: "Deployment ID to destroy"
        
  export:
    usage: "scenario export <deployment-id> [--format <format>]"
    parameters:
      deployment-id:
        type: string
        required: true
        description: "Deployment ID to export"
      --format:
        type: enum
        required: false
        allowed_values: ['json', 'yaml', 'csv']
        default: 'json'
        description: "Export format"

scenario_types:
  cloud-posture:
    description: "Cloud security posture assessment scenarios"
    difficulty_levels: ['beginner', 'intermediate', 'advanced']
    
  container-vuln:
    description: "Container vulnerability testing scenarios"
    includes: "Docker, Kubernetes security testing"
    
  code-vuln:
    description: "Code vulnerability assessment scenarios"
    languages: ['python', 'javascript', 'java', 'go']
    
  insider-threat:
    description: "Insider threat simulation scenarios"
    simulation_types: ['privilege-escalation', 'data-exfiltration', 'lateral-movement']
    
  ransomware:
    description: "Ransomware attack pattern simulation"
    stages: ['initial-access', 'persistence', 'encryption-simulation']
    
  waas-exploit:
    description: "Web application security testing"
    owasp_categories: ['injection', 'authentication', 'sensitive-data']
    
  ai-threat:
    description: "AI/LLM security assessment scenarios"
    attack_vectors: ['prompt-injection', 'model-inversion', 'data-poisoning']
    
  pipeline-breach:
    description: "CI/CD pipeline security testing"
    pipeline_types: ['github-actions', 'jenkins', 'gitlab-ci', 'azure-devops']

cloud_integration:
  api: "Google Cloud Functions API"
  deployment_tracking: "In-memory storage (development), database (production)"
  session_management: "8-character alphanumeric deployment IDs"
  
validation_rules:
  - Action parameter is required
  - Generate action requires --scenario-type
  - Provider-specific regions validated against cloud provider APIs
  - Deployment IDs generated as 8-character random strings
  - Auto-destroy duration must match pattern /^\d+[hdw]$/
```

---

## 9. Special Parsing Rules

### 9.1 Quoted String Handling

```typescript
// Special parsing for commands with quoted arguments
const parseQuotedArguments = (args: string[]): { query: string; flags: string[] } => {
  const quotedPattern = /"([^"]+)"/g;
  const input = args.join(' ');
  const matches = input.match(quotedPattern);
  
  if (matches) {
    const query = matches[0].replace(/"/g, '');
    const flags = input.replace(quotedPattern, '').split(' ').filter(arg => arg.startsWith('--'));
    return { query, flags };
  }
  
  // Fallback: non-flag args as query, flag args as flags
  const query = args.filter(arg => !arg.startsWith('--')).join(' ');
  const flags = args.filter(arg => arg.startsWith('--'));
  return { query, flags };
};
```

Examples:
- `search "machine learning deployment" --docs` → query: "machine learning deployment", flags: ["--docs"]
- `cortex-questions "How can AI help my business?"` → question: "How can AI help my business?"
- `ai What is the future of LLMs?` → prompt: "What is the future of LLMs?"

### 9.2 Flag Combination Logic

```typescript
// Flag combination validation and processing
const processFlagCombinations = (args: string[], flagRules: FlagRule[]): ProcessedFlags => {
  const flags = args.filter(arg => arg.startsWith('--'));
  const processed: ProcessedFlags = {};
  
  // Handle overriding flags (e.g., --all overrides others)
  const overridingFlags = flagRules.filter(rule => rule.overrides);
  for (const flag of overridingFlags) {
    if (flags.includes(`--${flag.name}`) && flag.overrides) {
      // Remove overridden flags
      flags = flags.filter(f => !flag.overrides.includes(f.replace('--', '')));
      processed[flag.name] = true;
    }
  }
  
  // Process remaining flags
  flags.forEach(flag => {
    const flagName = flag.replace('--', '');
    const rule = flagRules.find(r => r.name === flagName);
    if (rule) {
      processed[flagName] = true;
    }
  });
  
  return processed;
};
```

### 9.3 Command Alias Resolution

```typescript
// Command alias resolution with priority
const resolveCommand = (input: string, commandConfigs: CommandConfig[]): CommandConfig | null => {
  const command = input.toLowerCase();
  
  // Direct name match (highest priority)
  let config = commandConfigs.find(c => c.name === command);
  if (config) return config;
  
  // Alias match (secondary priority)
  config = commandConfigs.find(c => c.aliases?.includes(command));
  if (config) return config;
  
  return null;
};
```

---

## 10. Validation Rules and Constraints

### 10.1 Parameter Validation Schema

```typescript
interface ValidationRule {
  required: boolean;
  dataType: 'boolean' | 'string' | 'enum' | 'number';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: string[];
  dependsOn?: string[];
  mutuallyExclusive?: string[];
  customValidator?: (value: any) => boolean | string;
}

// Example validation rules
const validationRules: Record<string, ValidationRule> = {
  'search.query': {
    required: true,
    dataType: 'string',
    minLength: 1,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-_.]+$/,
    customValidator: (value: string) => 
      value.trim().length > 0 || "Query cannot be empty"
  },
  
  'scenario.deploymentId': {
    required: true,
    dataType: 'string',
    pattern: /^[a-zA-Z0-9]{8}$/,
    customValidator: (value: string) => 
      activeDeployments.has(value) || "Deployment ID not found"
  },
  
  'scenario.destroyAfter': {
    required: false,
    dataType: 'string',
    pattern: /^\d+[hdw]$/,
    customValidator: (value: string) => {
      const match = value.match(/^(\d+)([hdw])$/);
      if (!match) return "Invalid duration format";
      
      const [, num, unit] = match;
      const number = parseInt(num);
      if (number <= 0) return "Duration must be positive";
      if (unit === 'h' && number > 24) return "Hours cannot exceed 24";
      if (unit === 'd' && number > 30) return "Days cannot exceed 30";
      if (unit === 'w' && number > 4) return "Weeks cannot exceed 4";
      
      return true;
    }
  }
};
```

### 10.2 Flag Dependency Rules

```typescript
// Flag dependency validation
interface FlagDependency {
  flag: string;
  dependsOn?: string[];      // Requires these flags to be present
  mutuallyExclusive?: string[]; // Cannot be used with these flags
  implies?: string[];        // Automatically enables these flags
  context?: string[];        // Only valid with these context arguments
}

const flagDependencies: FlagDependency[] = [
  {
    flag: '--all-products',
    context: ['ctx'],
    mutuallyExclusive: ['--skills', '--recent']
  },
  {
    flag: '--skills',
    context: ['ctx'],
    mutuallyExclusive: ['--all-products']
  },
  {
    flag: '--auto-validate',
    dependsOn: ['--scenario-type'],
    context: ['scenario', 'generate']
  },
  {
    flag: '--all',
    implies: ['--aws', '--gcp', '--azure'],
    mutuallyExclusive: []
  }
];
```

### 10.3 Input Sanitization

```typescript
// Input sanitization for security
const sanitizeInput = (input: string, type: 'command' | 'argument' | 'query'): string => {
  // Remove potentially harmful characters
  let sanitized = input.replace(/[<>;&|`$(){}[\]]/g, '');
  
  // Handle different input types
  switch (type) {
    case 'command':
      // Only allow alphanumeric, hyphens, and underscores
      sanitized = sanitized.replace(/[^a-zA-Z0-9\-_]/g, '');
      break;
      
    case 'argument':
      // Allow common argument characters
      sanitized = sanitized.replace(/[^a-zA-Z0-9\-_. ]/g, '');
      break;
      
    case 'query':
      // Allow natural language characters
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.?!]/g, '');
      break;
  }
  
  // Limit length
  return sanitized.substring(0, 500);
};
```

---

## 11. Error Handling and User Feedback

### 11.1 Error Types and Messages

```typescript
enum CommandErrorType {
  COMMAND_NOT_FOUND = 'COMMAND_NOT_FOUND',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  MISSING_REQUIRED_PARAMETER = 'MISSING_REQUIRED_PARAMETER',
  INVALID_FLAG_COMBINATION = 'INVALID_FLAG_COMBINATION',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  ASYNC_ERROR = 'ASYNC_ERROR'
}

const errorMessages: Record<CommandErrorType, (context: any) => React.ReactNode> = {
  COMMAND_NOT_FOUND: (context) => (
    <div className="text-red-400">
      <div className="font-bold mb-2">❌ Command Not Found</div>
      <div>Command '{context.command}' not found. Type 'help' for available commands.</div>
      {context.suggestions && (
        <div className="mt-2 text-yellow-400">Did you mean: {context.suggestions.join(', ')}?</div>
      )}
    </div>
  ),
  
  MISSING_REQUIRED_PARAMETER: (context) => (
    <div className="text-red-400">
      <div className="font-bold mb-2">❌ Missing Required Parameter</div>
      <div>The parameter '{context.parameter}' is required for this command.</div>
      <div className="mt-2 font-mono text-yellow-400">Usage: {context.usage}</div>
    </div>
  )
};
```

### 11.2 Progressive Disclosure

Commands use progressive disclosure to guide users:

1. **No parameters**: Show usage examples and available options
2. **Partial parameters**: Show relevant flag combinations
3. **Invalid combinations**: Show error with suggested corrections
4. **Valid execution**: Show results with next step suggestions

---

## 12. Performance and Optimization

### 12.1 Command Processing Optimization

- **Synchronous commands**: Direct React component return for immediate rendering
- **Asynchronous commands**: Loading state → Promise resolution → Result update
- **Command validation**: Early validation before handler execution
- **Flag processing**: Optimized flag combination logic with short-circuit evaluation

### 12.2 Memory Management

- **Command history**: Limited to last 100 commands with automatic cleanup
- **Deployment tracking**: In-memory Map for active deployments with TTL
- **Large results**: Pagination for scenario lists and search results

---

## 13. Extension Points

### 13.1 Adding New Commands

To add a new command:

1. Define the command configuration with proper TypeScript typing
2. Implement parameter validation rules
3. Add flag combinations and dependencies
4. Implement handler with error boundaries
5. Update help system and documentation

### 13.2 Adding New Parameters

To add parameters to existing commands:

1. Add parameter definition to command usage string
2. Implement validation rules in parameter schema
3. Update flag combination logic if needed
4. Test backward compatibility
5. Update documentation

---

This comprehensive schema documentation provides the foundation for understanding, maintaining, and extending the POV-CLI command parameter system. Each command is designed with user experience in mind, providing clear feedback, progressive disclosure, and intelligent defaults while maintaining the flexibility of a powerful command-line interface.
