// Context storage for user variables and session data
interface UserContext {
  // User profile information
  name?: string;
  company?: string;
  role?: string;
  email?: string;
  
  // Project requirements
  industry?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  techStack?: string[];
  
  // AI/ML specific
  useCase?: string;
  dataSize?: string;
  currentSolution?: string;
  challenges?: string[];
  
  // Scenario tracking
  activeScenarios?: string[];
  completedAssessments?: string[];
  
  // Session metadata
  sessionStartTime?: Date;
  lastActivity?: Date;
  commandHistory?: string[];
}

class ContextStorage {
  private context: UserContext = {};
  private storageKey = 'pov-cli-context';

  constructor() {
    this.loadFromStorage();
  }

  // Store a key-value pair
  set(key: keyof UserContext, value: any): void {
    this.context[key] = value;
    this.saveToStorage();
  }

  // Retrieve a value by key
  get(key: keyof UserContext): any {
    return this.context[key];
  }

  // Get all context data
  getAll(): UserContext {
    return { ...this.context };
  }

  // Update multiple values at once
  update(updates: Partial<UserContext>): void {
    this.context = { ...this.context, ...updates };
    this.saveToStorage();
  }

  // Clear specific key
  remove(key: keyof UserContext): void {
    delete this.context[key];
    this.saveToStorage();
  }

  // Clear all context data
  clear(): void {
    this.context = {};
    this.saveToStorage();
  }

  // Check if a key exists
  has(key: keyof UserContext): boolean {
    return key in this.context && this.context[key] !== undefined;
  }

  // Get user profile summary
  getProfile(): { name?: string; company?: string; role?: string; email?: string } {
    return {
      name: this.context.name,
      company: this.context.company,
      role: this.context.role,
      email: this.context.email
    };
  }

  // Get project context summary
  getProjectContext(): {
    industry?: string;
    projectType?: string;
    budget?: string;
    timeline?: string;
    useCase?: string;
  } {
    return {
      industry: this.context.industry,
      projectType: this.context.projectType,
      budget: this.context.budget,
      timeline: this.context.timeline,
      useCase: this.context.useCase
    };
  }

  // Add to array fields
  addToArray(key: 'techStack' | 'challenges' | 'activeScenarios' | 'completedAssessments' | 'commandHistory', value: string): void {
    const currentArray = this.context[key] || [];
    if (!currentArray.includes(value)) {
      currentArray.push(value);
      this.set(key, currentArray);
    }
  }

  // Remove from array fields
  removeFromArray(key: 'techStack' | 'challenges' | 'activeScenarios' | 'completedAssessments' | 'commandHistory', value: string): void {
    const currentArray = this.context[key] || [];
    const filtered = currentArray.filter(item => item !== value);
    this.set(key, filtered);
  }

  // Session management
  startSession(): void {
    this.set('sessionStartTime', new Date());
    this.updateActivity();
  }

  updateActivity(): void {
    this.set('lastActivity', new Date());
  }

  getSessionDuration(): string {
    const start = this.context.sessionStartTime;
    if (!start) return 'Unknown';
    
    const duration = Date.now() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  }

  // Persistence
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.context));
      } catch (error) {
        console.warn('Failed to save context to localStorage:', error);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          this.context = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to load context from localStorage:', error);
      }
    }
  }

  // Export context for sharing/debugging
  exportContext(): string {
    return JSON.stringify(this.context, null, 2);
  }

  // Import context from JSON string
  importContext(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);
      this.context = { ...imported };
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Failed to import context:', error);
      return false;
    }
  }
}

// Singleton instance
export const contextStorage = new ContextStorage();
export type { UserContext };
