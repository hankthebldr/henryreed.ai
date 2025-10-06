# Cortex DC Portal - Architecture Documentation

## 🏗️ System Architecture Overview

The Cortex DC Portal is built on a modern, scalable architecture using Firebase as the backend platform and Next.js as the frontend framework. The system is designed for high performance, security, and maintainability while providing both GUI and terminal interfaces for different user workflows.

---

## 📊 Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser] --> B[Next.js App]
        C[Mobile Browser] --> B
    end
    
    subgraph "Frontend Application"
        B --> D[GUI Interface]
        B --> E[Terminal Interface]
        B --> F[Authentication Layer]
        D --> G[React Components]
        E --> H[Command System]
    end
    
    subgraph "Firebase Platform"
        F --> I[Firebase Auth]
        G --> J[Firestore Database]
        H --> J
        G --> K[Cloud Storage]
        B --> L[Cloud Functions]
        L --> M[Data Connect]
        M --> N[Cloud SQL]
    end
    
    subgraph "External Integrations"
        L --> O[XSIAM API]
        L --> P[BigQuery]
        L --> Q[OpenAI API]
        L --> R[Vertex AI]
    end
    
    subgraph "Deployment"
        B --> S[Firebase Hosting]
        S --> T[CDN]
    end
```

---

## 🎯 Core Components

### 1. Frontend Architecture

#### Next.js Application Structure
```
hosting/
├── app/                    # Next.js 14 App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Landing page
│   ├── gui/              # GUI interface routes
│   ├── docs/             # Documentation routes
│   └── api/              # API routes (minimal, most logic in Cloud Functions)
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── terminal/         # Terminal-specific components
│   ├── dashboard/        # Dashboard components
│   └── forms/            # Form components
├── lib/                  # Utility libraries
│   ├── firebase-config.ts # Firebase configuration
│   ├── auth/             # Authentication utilities
│   ├── data/             # Data access layer
│   └── commands/         # Terminal command system
└── contexts/             # React contexts for state management
    ├── AuthContext.tsx   # Authentication state
    └── AppStateContext.tsx # Application state
```

#### Component Hierarchy
```
App
├── AuthProvider
│   ├── AppStateProvider
│   │   ├── AppHeader (navigation)
│   │   ├── BreadcrumbNavigation
│   │   ├── CortexGUIInterface (main dashboard)
│   │   │   ├── TerminalInterface
│   │   │   ├── DashboardTabs
│   │   │   └── UserContextHeader
│   │   └── NotificationSystem
│   └── Router (Next.js App Router)
```

### 2. Backend Architecture

#### Firebase Services Integration

**Authentication (Firebase Auth)**
- Email/password authentication
- Role-based access control (RBAC)
- Custom claims for user roles
- Session management with JWT tokens

**Database (Firestore)**
- Document-based NoSQL database
- Real-time synchronization
- Offline support
- Comprehensive security rules

**Storage (Cloud Storage)**
- File uploads and downloads
- Secure access with authentication
- Automatic file processing
- CDN distribution

**Functions (Cloud Functions)**
- Server-side business logic
- API integrations
- Background processing
- Scheduled tasks

**Data Connect (PostgreSQL)**
- Structured data for complex queries
- ACID compliance for critical data
- Integration with existing systems
- Advanced analytics support

### 3. State Management

#### Context-Based State Management
```typescript
// Authentication Context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

// Application State Context
interface AppStateContextType {
  currentView: string;
  userPreferences: UserPreferences;
  notifications: Notification[];
  isManagementMode: boolean;
  toggleManagementMode: () => void;
}
```

#### State Persistence
- Local storage for user preferences
- Session storage for temporary state
- Firestore for synchronized state
- IndexedDB for offline capabilities

---

## 🔒 Security Architecture

### Authentication & Authorization

#### Multi-Layer Security Model
1. **Frontend Authentication**
   - Firebase Auth SDK integration
   - Route protection with auth guards
   - Role-based component rendering

2. **Backend Authorization**
   - Firestore security rules
   - Cloud Function authentication
   - Custom claims validation

3. **API Security**
   - HTTPS-only communication
   - CORS configuration
   - Rate limiting and DDoS protection

#### Role-Based Access Control (RBAC)
```typescript
interface UserRoles {
  admin: boolean;           // Full system access
  manager: boolean;         // Management dashboard access  
  consultant: boolean;      // Standard consultant access
  readonly: boolean;        // Read-only access
}

interface Permissions {
  canCreateTRR: boolean;
  canEditScenarios: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
}
```

### Data Protection

#### Encryption
- Data in transit: TLS 1.3
- Data at rest: Firebase encryption
- Client-side: Sensitive data masking

#### Privacy Compliance
- GDPR compliance features
- Data retention policies
- User consent management
- Audit logging

---

## 🚀 Performance Architecture

### Frontend Optimization

#### Next.js Performance Features
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- Image optimization
- Code splitting and lazy loading

#### Caching Strategy
```typescript
// Cache hierarchy
Browser Cache (24h)
  ↓
CDN Cache (1h for HTML, 1y for assets)
  ↓
Firebase Hosting
  ↓
Application Cache (React Query)
  ↓
Firestore Cache
```

### Backend Optimization

#### Database Performance
- Firestore indexes for query optimization
- Connection pooling for Cloud SQL
- Read replicas for analytics queries
- Query optimization and monitoring

#### Function Performance
- Cold start optimization
- Connection reuse
- Memory optimization
- Regional deployment

---

## 🔌 Integration Architecture

### External API Integrations

#### XSIAM Integration
```typescript
interface XSIAMConnector {
  authenticate(): Promise<AuthToken>;
  fetchIncidents(filters: IncidentFilters): Promise<Incident[]>;
  createPlaybook(scenario: Scenario): Promise<Playbook>;
  executeAction(action: SecurityAction): Promise<ActionResult>;
}
```

#### AI Service Integration
```typescript
interface AIService {
  generateScenario(parameters: ScenarioParams): Promise<Scenario>;
  analyzeThreat(data: ThreatData): Promise<ThreatAnalysis>;
  recommendActions(context: SecurityContext): Promise<Recommendation[]>;
}
```

### Data Flow Architecture

#### Real-time Data Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Firebase Auth
    participant D as Firestore
    participant CF as Cloud Functions
    participant X as XSIAM

    U->>F: Authenticate
    F->>A: Login request
    A->>F: JWT token
    F->>D: Subscribe to data
    D->>F: Real-time updates
    F->>CF: API request
    CF->>X: External API call
    X->>CF: Response data
    CF->>D: Store data
    D->>F: Real-time update
    F->>U: UI update
```

---

## 📱 Terminal Interface Architecture

### Command System Design

#### Command Architecture
```typescript
interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  category: CommandCategory;
  permissions?: Permission[];
  handler: CommandHandler;
}

type CommandHandler = (args: string[], context: CommandContext) => Promise<CommandResult>;
```

#### Command Categories
- **Basic**: Navigation, help, system information
- **POV**: POV management, scenario creation
- **Analysis**: Data analysis, reporting
- **Management**: User management, system administration
- **AI**: AI-powered commands and insights

#### Terminal Features
- Command history and autocomplete
- Real-time command suggestions
- Multi-line command support
- Command chaining and pipes
- Output formatting and filtering

---

## 🌐 Deployment Architecture

### Firebase Hosting Configuration

#### Static Site Generation
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: { unoptimized: true },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}
```

#### Hosting Rules
```json
{
  "hosting": {
    "public": "hosting/out",
    "rewrites": [
      {"source": "/api/**", "function": "api"},
      {"source": "**", "destination": "/index.html"}
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {"key": "Cache-Control", "value": "public, max-age=31536000"}
        ]
      }
    ]
  }
}
```

### Multi-Environment Setup

#### Environment Configuration
```
environments/
├── development/
│   ├── firebase.json
│   └── .env.development
├── staging/
│   ├── firebase.json
│   └── .env.staging
└── production/
    ├── firebase.json
    └── .env.production
```

---

## 📊 Monitoring & Analytics Architecture

### Performance Monitoring

#### Client-Side Monitoring
- Web Vitals tracking
- Error boundary reporting
- User interaction analytics
- Performance metrics collection

#### Server-Side Monitoring
- Cloud Function metrics
- Database query performance
- API response times
- Error rate monitoring

### Business Intelligence

#### Analytics Pipeline
```mermaid
graph LR
    A[User Actions] --> B[Client Analytics]
    C[Server Events] --> D[Cloud Functions]
    B --> E[Firebase Analytics]
    D --> E
    E --> F[BigQuery Export]
    F --> G[Data Studio Dashboards]
    F --> H[Custom Reports]
```

---

## 🔄 Scalability Considerations

### Horizontal Scaling

#### Database Scaling
- Firestore auto-scaling
- Cloud SQL read replicas
- Data partitioning strategies
- Connection pooling

#### Application Scaling
- CDN distribution
- Multi-region deployment
- Load balancing
- Auto-scaling functions

### Performance Optimization

#### Frontend Optimization
- Bundle size optimization
- Tree shaking
- Lazy loading
- Service worker caching

#### Backend Optimization
- Query optimization
- Index management
- Connection reuse
- Memory management

---

## 🛡️ Disaster Recovery

### Backup Strategy

#### Data Backup
- Firestore automated backups
- Cloud SQL point-in-time recovery
- Storage redundancy
- Cross-region replication

#### Application Recovery
- Version control with Git
- Automated deployment pipelines
- Configuration management
- Infrastructure as Code

### Monitoring & Alerting

#### Alert Configuration
- Error rate thresholds
- Performance degradation
- Security incident detection
- Resource utilization monitoring

---

This architecture documentation provides a comprehensive overview of the Cortex DC Portal's technical foundation. For implementation details, refer to the specific component documentation in the respective sections.