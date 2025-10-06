# Cortex DC Portal - Development Guide

## 🛠️ Development Environment Setup

This guide covers the complete development setup, workflow, and best practices for contributing to the Cortex DC Portal.

---

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm 9+** (comes with Node.js)
- **Git** - Version control
- **Firebase CLI** - `npm install -g firebase-tools`
- **Modern IDE** - VSCode recommended with extensions

### Recommended VSCode Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright",
    "firebase.firebase-vscode",
    "ms-vscode.vscode-json"
  ]
}
```

### System Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **OS**: macOS 10.15+, Windows 10+, or Linux
- **Browser**: Chrome 90+ or Firefox 88+ for development

---

## 🚀 Initial Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/henryreed/henryreed.ai.git
cd henryreed.ai

# Navigate to the hosting directory
cd hosting

# Install dependencies
npm install

# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase (for deployment)
firebase login
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
# Add your Firebase configuration
vim .env.local
```

**Required Environment Variables:**
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234

# Development Environment
NODE_ENV=development
NEXT_PUBLIC_USE_EMULATOR=true
```

### 3. Firebase Setup
```bash
# Initialize Firebase project (if needed)
firebase projects:list
firebase use your-project-id

# Start Firebase emulators for development
firebase emulators:start
```

### 4. Start Development Server
```bash
# Start Next.js development server
npm run dev

# Application will be available at:
# http://localhost:3000
```

---

## 📁 Project Structure

### Directory Overview
```
henryreed.ai/
├── docs/                    # Documentation
├── hosting/                 # Next.js application
│   ├── app/                # Next.js 14 App Router
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Landing page
│   │   ├── gui/            # GUI routes
│   │   ├── docs/           # Documentation routes
│   │   └── api/            # API routes (minimal)
│   ├── components/         # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── terminal/       # Terminal interface
│   │   ├── dashboard/      # Dashboard components
│   │   └── forms/          # Form components
│   ├── lib/                # Utility libraries
│   │   ├── firebase-config.ts  # Firebase configuration
│   │   ├── auth/           # Authentication utilities
│   │   ├── data/           # Data access layer
│   │   ├── commands/       # Terminal command system
│   │   └── utils/          # General utilities
│   ├── contexts/           # React contexts
│   ├── types/              # TypeScript type definitions
│   ├── styles/             # Additional styles
│   └── public/             # Static assets
├── functions/              # Cloud Functions (Node.js)
├── henryreedai/            # Genkit functions (Node.js 20)
├── dataconnect/            # Firebase Data Connect
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
└── firebase.json           # Firebase configuration
```

### Key Files
- **`next.config.ts`** - Next.js configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration  
- **`tsconfig.json`** - TypeScript configuration
- **`package.json`** - Dependencies and scripts
- **`.env.local`** - Environment variables (not in git)

---

## 🎨 Component Development

### Component Structure
```tsx
// components/ui/Button.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
          // Size variants
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          // Color variants
          {
            'bg-cortex-green text-black hover:bg-cortex-green-light': variant === 'primary',
            'bg-cortex-bg-secondary text-cortex-text-primary hover:bg-cortex-bg-hover': variant === 'secondary',
            'bg-cortex-error text-white hover:bg-cortex-error-light': variant === 'danger',
          },
          // States
          {
            'opacity-50 cursor-not-allowed': disabled || isLoading,
          },
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Component Best Practices
1. **TypeScript First** - Always use TypeScript with proper interfaces
2. **Forward Refs** - Use `React.forwardRef` for reusable components
3. **Class Name Merging** - Use `cn` utility for conditional classes
4. **Accessibility** - Include proper ARIA attributes and keyboard navigation
5. **Loading States** - Handle loading and error states appropriately
6. **Responsive Design** - Use Tailwind responsive classes

---

## 🖥️ Terminal Command Development

### Command Architecture
```tsx
// lib/commands/command-types.ts
export interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  category: CommandCategory;
  permissions?: Permission[];
  handler: CommandHandler;
}

export type CommandHandler = (args: string[], context: CommandContext) => Promise<CommandResult>;

export interface CommandContext {
  user: User | null;
  currentPath: string;
  environment: 'development' | 'staging' | 'production';
  permissions: Permission[];
}

export interface CommandResult {
  success: boolean;
  output?: React.ReactNode;
  error?: string;
  data?: any;
}
```

### Creating a New Command
```tsx
// lib/commands/pov-commands.tsx
import { CommandConfig } from './command-types';

export const povCreateCommand: CommandConfig = {
  name: 'pov create',
  description: 'Create a new Proof of Value (POV)',
  usage: 'pov create --name "<name>" [--customer "<customer>"] [--duration "<duration>"]',
  aliases: [],
  category: 'pov',
  permissions: ['pov:create'],
  handler: async (args, context) => {
    try {
      // Parse arguments
      const options = parseCommandArgs(args);
      
      if (!options.name) {
        return {
          success: false,
          error: 'POV name is required. Usage: pov create --name "<name>"'
        };
      }

      // Create POV
      const pov = await povService.create({
        name: options.name,
        customer: options.customer || 'TBD',
        duration: options.duration || '2 weeks',
        createdBy: context.user?.id,
        status: 'draft'
      });

      return {
        success: true,
        output: (
          <div className="text-cortex-success">
            <p>✅ POV created successfully!</p>
            <div className="mt-2 pl-4 border-l-2 border-cortex-green">
              <p><strong>ID:</strong> {pov.id}</p>
              <p><strong>Name:</strong> {pov.name}</p>
              <p><strong>Customer:</strong> {pov.customer}</p>
              <p><strong>Duration:</strong> {pov.duration}</p>
            </div>
          </div>
        ),
        data: pov
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create POV: ${error.message}`
      };
    }
  }
};
```

### Command Registration
```tsx
// lib/commands/index.ts
export const allCommands: CommandConfig[] = [
  // Basic commands
  helpCommand,
  clearCommand,
  // POV commands
  povCreateCommand,
  povListCommand,
  // Add more commands...
];

export const getCommandByName = (name: string): CommandConfig | undefined => {
  return allCommands.find(cmd => 
    cmd.name === name || cmd.aliases?.includes(name)
  );
};
```

---

## 🔌 API Integration

### Firebase Service Integration
```tsx
// lib/services/pov-service.ts
import { db, auth } from '@/lib/firebase-config';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

export interface POV {
  id?: string;
  name: string;
  customer: string;
  duration: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

class POVService {
  private collectionRef = collection(db, 'pov');

  async create(povData: Omit<POV, 'id' | 'createdAt' | 'updatedAt'>): Promise<POV> {
    const now = new Date();
    const docRef = await addDoc(this.collectionRef, {
      ...povData,
      createdAt: now,
      updatedAt: now
    });

    return {
      id: docRef.id,
      ...povData,
      createdAt: now,
      updatedAt: now
    };
  }

  async list(filters?: Partial<POV>): Promise<POV[]> {
    let q = query(this.collectionRef, orderBy('createdAt', 'desc'));
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters?.createdBy) {
      q = query(q, where('createdBy', '==', filters.createdBy));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as POV));
  }

  // Add more methods as needed...
}

export const povService = new POVService();
```

### External API Integration
```tsx
// lib/services/xsiam-service.ts
export class XSIAMService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.XSIAM_API_URL || '';
    this.apiKey = process.env.XSIAM_API_KEY || '';
  }

  async fetchIncidents(filters: IncidentFilters): Promise<Incident[]> {
    try {
      const response = await fetch(`${this.baseUrl}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error(`XSIAM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.incidents || [];
    } catch (error) {
      console.error('XSIAM API error:', error);
      throw new Error('Failed to fetch incidents from XSIAM');
    }
  }
}

export const xsiamService = new XSIAMService();
```

---

## 🎨 Styling Guidelines

### Tailwind CSS Configuration
```tsx
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palo Alto Networks branding colors
        cortex: {
          green: '#00CC66',
          'green-light': '#00E673',
          'green-dark': '#00B359',
          blue: '#007ACC',
          'blue-light': '#0099FF',
          orange: '#FF6B35',
          'orange-light': '#FF8A5C',
          red: '#FF4444',
          'red-light': '#FF6B6B',
        },
        // System colors
        'cortex-bg': {
          primary: '#0A0A0A',
          secondary: '#1A1A1A',
          tertiary: '#2A2A2A',
          hover: '#333333',
        },
        'cortex-text': {
          primary: '#FFFFFF',
          secondary: '#CCCCCC',
          muted: '#999999',
          accent: '#00CC66',
        },
        'cortex-border': {
          primary: '#333333',
          secondary: '#444444',
          accent: '#00CC66',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-green': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      }
    },
  },
  plugins: [],
};

export default config;
```

### CSS Custom Properties
```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --cortex-green: #00CC66;
  --cortex-green-light: #00E673;
  --cortex-bg-primary: #0A0A0A;
  --cortex-bg-secondary: #1A1A1A;
  --cortex-text-primary: #FFFFFF;
  --cortex-text-secondary: #CCCCCC;
}

/* Custom component styles */
@layer components {
  .cortex-card {
    @apply bg-cortex-bg-secondary border border-cortex-border-secondary rounded-lg;
  }
  
  .cortex-card-elevated {
    @apply cortex-card shadow-lg shadow-cortex-green/10;
  }
  
  .btn-cortex-primary {
    @apply bg-cortex-green text-black px-4 py-2 rounded-lg font-medium hover:bg-cortex-green-light transition-colors;
  }
  
  .cortex-glow {
    box-shadow: 0 0 20px rgba(0, 204, 102, 0.3);
  }
}

/* Terminal-specific styles */
.terminal-output {
  font-family: 'JetBrains Mono', monospace;
  line-height: 1.5;
}

.terminal-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--cortex-text-primary);
  font-family: 'JetBrains Mono', monospace;
}
```

---

## 🧪 Testing Strategy

### Unit Testing with Jest
```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-cortex-error');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
```

### E2E Testing with Playwright
```typescript
// tests/e2e/pov-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('POV Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login helper
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@henryreed.ai');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/gui');
  });

  test('should create a new POV', async ({ page }) => {
    // Navigate to terminal
    await page.click('[data-testid="terminal-tab"]');
    
    // Create POV via command
    const terminal = page.locator('.terminal-input');
    await terminal.fill('pov create --name "E2E Test POV" --customer "Test Corp"');
    await terminal.press('Enter');
    
    // Verify success message
    await expect(page.locator('.terminal-output')).toContainText('POV created successfully!');
    
    // Verify POV appears in list
    await terminal.fill('pov list');
    await terminal.press('Enter');
    await expect(page.locator('.terminal-output')).toContainText('E2E Test POV');
  });

  test('should validate POV creation form', async ({ page }) => {
    await page.click('[data-testid="terminal-tab"]');
    
    const terminal = page.locator('.terminal-input');
    
    // Try to create POV without name
    await terminal.fill('pov create');
    await terminal.press('Enter');
    
    // Should show error
    await expect(page.locator('.terminal-output')).toContainText('POV name is required');
  });
});
```

### Test Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

---

## 🔐 Security Best Practices

### Authentication & Authorization
```tsx
// lib/auth/auth-guard.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
}

export function AuthGuard({ children, requiredRole, requiredPermissions }: AuthGuardProps) {
  const { user, isLoading, hasRole, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/unauthorized');
      return;
    }

    if (requiredPermissions && !requiredPermissions.every(hasPermission)) {
      router.push('/unauthorized');
      return;
    }
  }, [user, isLoading, requiredRole, requiredPermissions]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  if (requiredPermissions && !requiredPermissions.every(hasPermission)) {
    return null;
  }

  return <>{children}</>;
}
```

### Input Validation & Sanitization
```tsx
// lib/validation/schemas.ts
import { z } from 'zod';

export const povCreateSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name contains invalid characters'),
  
  customer: z.string()
    .min(2, 'Customer name must be at least 2 characters')
    .max(50, 'Customer name must be less than 50 characters')
    .optional(),
    
  duration: z.string()
    .regex(/^\d+\s+(days?|weeks?|months?)$/, 'Invalid duration format')
    .optional()
});

export const validatePOVCreation = (data: unknown) => {
  return povCreateSchema.safeParse(data);
};
```

### Error Boundaries
```tsx
// components/error-boundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send error to monitoring service
    if (typeof window !== 'undefined') {
      // Example: Send to Sentry or similar service
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-cortex-bg-secondary rounded-lg border border-cortex-error">
          <h2 className="text-xl font-bold text-cortex-error mb-4">
            Something went wrong
          </h2>
          <p className="text-cortex-text-secondary mb-4">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-cortex-primary"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 📦 Build & Deployment

### Build Scripts
```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "validate": "npm run type-check && npm run lint && npm run test",
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:preview": "npm run build && firebase hosting:channel:deploy preview",
    "firebase:serve": "firebase serve --only hosting",
    "firebase:emulators": "firebase emulators:start"
  }
}
```

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: hosting/package-lock.json
      
      - name: Install dependencies
        run: |
          cd hosting
          npm ci
      
      - name: Run type check
        run: |
          cd hosting
          npm run type-check
      
      - name: Run linting
        run: |
          cd hosting
          npm run lint
      
      - name: Run tests
        run: |
          cd hosting
          npm run test
      
      - name: Run E2E tests
        run: |
          cd hosting
          npx playwright install --with-deps
          npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: hosting/package-lock.json
      
      - name: Install dependencies
        run: |
          cd hosting
          npm ci
      
      - name: Build application
        run: |
          cd hosting
          npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: henryreedai
          channelId: live
          entryPoint: './hosting'
```

---

## 🐛 Debugging Guide

### Development Tools
```tsx
// lib/dev-tools.ts (development only)
if (process.env.NODE_ENV === 'development') {
  // React DevTools
  if (typeof window !== 'undefined') {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
  }
  
  // Debug utilities
  window.debugUtils = {
    auth: () => import('@/lib/firebase-config').then(m => m.auth),
    db: () => import('@/lib/firebase-config').then(m => m.db),
    commands: () => import('@/lib/commands').then(m => m.allCommands),
  };
}
```

### Logging Strategy
```tsx
// lib/logger.ts
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;

  debug(...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  }

  info(...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.info('[INFO]', ...args);
    }
  }

  warn(...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error('[ERROR]', ...args);
    }
  }
}

export const logger = new Logger();
```

---

## 📝 Documentation Guidelines

### Code Comments
```tsx
/**
 * POV management service for handling Proof of Value operations.
 * 
 * This service provides CRUD operations for POV records including:
 * - Creation with validation
 * - Listing with filtering and sorting
 * - Status updates and lifecycle management
 * - Analytics and reporting
 * 
 * @example
 * ```typescript
 * const pov = await povService.create({
 *   name: 'Customer Security Assessment',
 *   customer: 'Acme Corp',
 *   duration: '2 weeks'
 * });
 * ```
 */
export class POVService {
  /**
   * Creates a new POV with the provided data.
   * 
   * @param povData - The POV data excluding auto-generated fields
   * @returns Promise resolving to the created POV with ID
   * @throws ValidationError if the data is invalid
   * @throws FirestoreError if the database operation fails
   */
  async create(povData: Omit<POV, 'id' | 'createdAt' | 'updatedAt'>): Promise<POV> {
    // Implementation...
  }
}
```

### README Updates
When adding new features, update the appropriate README files:
- Main project README
- Component-specific documentation
- API documentation
- User guides

---

## 🤝 Contributing Guidelines

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-command-system

# Make changes and commit
git add .
git commit -m "feat: add new command system with validation"

# Push and create PR
git push origin feature/new-command-system
```

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Test additions/changes
- `chore` - Build process or auxiliary tool changes

### Code Review Checklist
- [ ] Code follows TypeScript and ESLint rules
- [ ] All tests pass (unit and E2E)
- [ ] Documentation updated if needed
- [ ] Security considerations addressed
- [ ] Performance impact considered
- [ ] Accessibility guidelines followed
- [ ] Mobile responsiveness maintained

---

This development guide provides the foundation for contributing to the Cortex DC Portal. For specific implementation details, refer to the individual component documentation and API references.