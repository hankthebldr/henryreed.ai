export type CommandCategory =
  | 'core'
  | 'context'
  | 'ai'
  | 'downloads'
  | 'scenarios'
  | 'search'
  | 'utilities'
  | 'theming';

export interface OptionSpec {
  flag: string;            // e.g. --all, -a
  type: 'boolean' | 'string' | 'number' | 'enum';
  enumValues?: string[];
  default?: any;
  required?: boolean;
  description: string;
  deprecated?: boolean;
}

export interface ExampleSpec {
  cmd: string;
  description?: string;
}

export interface SubcommandSpec {
  name: string;
  description: string;
  examples?: ExampleSpec[];
  options?: OptionSpec[];
}

export interface HelpMeta {
  category: CommandCategory;
  longDescription?: string;
  options?: OptionSpec[];
  examples?: ExampleSpec[];
  subcommands?: SubcommandSpec[];
  topics?: string[];       // keywords for apropos/help search
  seeAlso?: string[];      // related commands
  isInteractive?: boolean; // supports interactive walkthrough
}

export interface EnhancedCommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  help?: HelpMeta;
  handler: (args: string[]) => React.ReactNode | Promise<React.ReactNode>;
}

// For backward compatibility with existing CommandConfig
export interface LegacyCommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  handler: (args: string[]) => React.ReactNode | Promise<React.ReactNode>;
}

// Terminal action context for interactive help features
export interface TerminalActions {
  setInput: (input: string) => void;
  executeCommand: (command: string) => Promise<void>;
  addToHistory: (command: string) => void;
}

// Help rendering context
export interface HelpContext {
  terminalActions?: TerminalActions;
  currentCommand?: string;
  commandHistory?: string[];
  userContext?: any; // from context-storage
}

// Search and discovery types
export interface SearchResult {
  command: EnhancedCommandConfig;
  relevance: number;
  matchType: 'name' | 'alias' | 'description' | 'topic' | 'example';
  matchText?: string;
}

export interface CategoryInfo {
  name: CommandCategory;
  displayName: string;
  description: string;
  icon: string;
}

// Tutorial system types
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  command?: string;
  autoExecute?: boolean;
  validation?: (output: any) => boolean;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: CommandCategory;
  steps: TutorialStep[];
  estimatedDuration: string;
}
