# Component Map - henryreed.ai Application

## Web Component Architecture

### Modern UI Component Hierarchy

```mermaid
graph TD
    A[ModernDashboard] --> B[MetricCard]
    A --> C[ModernActivityFeed]
    A --> D[ModernQuickActions]
    
    B --> E[ModernCard]
    C --> E
    D --> F[ModernBadge]
    D --> G[ModernButton]
    D --> E
    
    H[ModernInput] --> I[ModernForm]
    J[ModernProgressBar] --> K[ModernToast]
    L[ModernLoadingSpinner] --> M[AsyncComponent]
    
    N[ThemeProvider] --> A
    N --> H
    N --> J
    N --> L
```

### Core Application Components

```mermaid
graph TD
    A[App Layout] --> B[ConditionalLayout]
    B --> C[AppShell]
    B --> D[AuthLanding]
    
    C --> E[AppHeader]
    C --> F[UnifiedTerminal]
    C --> G[CortexGUIInterface]
    
    E --> H[NavigationMenu]
    E --> I[UserProfile]
    
    F --> J[TerminalHost]
    F --> K[ImprovedTerminal]
    
    G --> L[DomainConsultantWorkspace]
    G --> M[ManagementDashboard]
    G --> N[ContentCreatorManager]
```

### Data Flow Architecture

```mermaid
graph TD
    UI[Next.js Client Components] --> FX[HTTPS Functions]
    FX --> AI[Genkit Pipeline]
    FX --> FS[Firestore]
    FX --> ST[Cloud Storage]
    AI --> VX[Vertex AI]
    
    subgraph "Client State Management"
        CTX[React Contexts]
        HOOKS[Custom Hooks]
        STATE[Component State]
    end
    
    UI --> CTX
    CTX --> HOOKS
    HOOKS --> STATE
    
    subgraph "Authentication Flow"
        AUTH[Firebase Auth]
        GUARD[Route Guards]
        RBAC[Role-Based Access]
    end
    
    UI --> AUTH
    AUTH --> GUARD
    GUARD --> RBAC
```

### Terminal Command System

```mermaid
graph TD
    A[Terminal Input] --> B[Command Parser]
    B --> C[Command Registry]
    C --> D{Command Type}
    
    D -->|Core| E[Basic Commands]
    D -->|POV| F[POV Commands]
    D -->|Scenario| G[Scenario Commands]
    D -->|Detection| H[Detection Commands]
    D -->|AI| I[AI Commands]
    
    E --> J[Output Formatter]
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> K[React Component]
    K --> L[Terminal Display]
```

### Component File Structure

```
hosting/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Login/landing page
│   ├── gui/                     # GUI interface routes
│   ├── terminal/                # Terminal-focused routes
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   │   ├── modern/              # Modern design system
│   │   │   ├── index.tsx        # Modern component exports
│   │   │   └── Dashboard.tsx    # Dashboard components
│   │   └── CleanTerminalPopout.tsx
│   │
│   ├── AppShell.tsx             # Main application shell
│   ├── ConditionalLayout.tsx    # Route-based layout logic
│   ├── UnifiedTerminal.tsx      # Terminal interface
│   ├── CortexGUIInterface.tsx   # Main GUI interface
│   └── DomainConsultantWorkspace.tsx
│
├── contexts/                     # React context providers
│   ├── AuthContext.tsx          # Authentication state
│   └── AppStateContext.tsx      # Global application state
│
├── providers/                    # Higher-order providers
│   └── ThemeProvider.tsx        # Theme management
│
├── lib/                         # Utility libraries
│   ├── auth-service.ts          # Authentication logic
│   ├── firebase-config.ts       # Firebase configuration
│   ├── command-registry.ts      # Terminal commands
│   └── utils.ts                 # Helper functions
│
└── hooks/                       # Custom React hooks
    ├── useAuth.ts               # Authentication hook
    └── useCommand.ts            # Command execution hook
```

## Component Relationships

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as Login Page
    participant A as AuthContext
    participant F as Firebase Auth
    participant G as GUI Interface
    
    U->>L: Enter credentials
    L->>A: signIn(username, password)
    A->>F: signInWithEmailAndPassword()
    F-->>A: User object
    A-->>L: Success
    L->>G: Redirect to /gui
    G->>A: Check auth state
    A-->>G: Authenticated user
```

### Command Execution Flow

```mermaid
sequenceDiagram
    participant U as User
    participant T as Terminal
    participant C as Command Registry
    participant S as Service Layer
    participant R as React Renderer
    
    U->>T: Type command
    T->>C: Parse & resolve command
    C->>S: Execute command logic
    S-->>C: Return result
    C->>R: Format as React component
    R-->>T: Render output
    T-->>U: Display result
```

### State Management Architecture

```mermaid
graph TD
    A[User Action] --> B[Component Event]
    B --> C{Local or Global State?}
    
    C -->|Local| D[Component useState/useReducer]
    C -->|Global| E[React Context]
    
    E --> F[Context Provider]
    F --> G[Context Consumer]
    G --> H[State Update]
    
    D --> I[Component Re-render]
    H --> I
    
    I --> J[UI Update]
```

## Key Component APIs

### ModernCard Component
```typescript
interface CardProps {
  variant?: 'glass' | 'solid' | 'outline' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

### ModernButton Component
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}
```

### AuthContext API
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
```

### Command Registry API
```typescript
interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  category: string;
  handler: (args: string[]) => Promise<React.ReactNode>;
  permissions?: string[];
  aliases?: string[];
}
```

## Design System Integration

### Color System
- Primary: Cortex accent colors
- Semantic: Success, warning, error, info variants
- Neutral: Background and text color scales

### Typography Scale
- Headings: h1-h6 with responsive sizing
- Body: Regular and emphasized text
- Code: Monospace for terminal output

### Spacing System
- Base unit: 0.25rem (4px)
- Scale: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64

### Component Variants
Each component supports multiple visual variants for different use cases and contexts within the application.