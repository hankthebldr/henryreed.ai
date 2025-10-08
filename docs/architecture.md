# Architecture Documentation - HenryReed.ai Cortex Domain Consultant Platform

**Date:** 2025-01-08  
**Version:** v2.6 Refactor  
**Purpose:** Complete architectural blueprint for scalable refactoring

## Executive Overview

The HenryReed.ai platform represents a sophisticated cybersecurity domain consultant system that uniquely combines terminal-first interfaces with modern GUI components. Built around security scenario management, POV (Proof of Value) demonstrations, and TRR (Technical Requirements Review) processes, it serves as a comprehensive platform for cybersecurity professionals and customer engagements.

## System Architecture

### Global System Architecture

```mermaid
graph TD
    U[User] --> B[Browser SPA - Next.js Static Export]
    B --> AL[App Layout.tsx - Root Provider]
    AL --> CC[ConditionalLayout.tsx - Route Guard]
    CC --> TH[TerminalHost.tsx - Terminal Manager]
    CC --> GUI[GUI Interface Components]
    
    TH --> IT[ImprovedTerminal.tsx - Single Canonical Terminal]
    IT --> CE[Command Engine Registry]
    
    CE -->|core| C0[lib/commands.tsx - Core Commands]
    CE -->|extended| C1[lib/commands-ext.tsx - Extended Features]
    CE -->|scenario| C2[lib/scenario-commands.tsx - Security Scenarios]
    CE -->|pov| C3[lib/pov-commands.tsx - POV Lifecycle]
    CE -->|detect| C4[lib/detect-commands.tsx - Detection Testing]
    CE -->|monitor| C5[lib/monitor-commands.tsx - Real-time Monitoring]
    CE -->|download| C6[lib/download-commands.tsx - Resource Management]

    subgraph "Feature Modules"
        DC[Domain Consultant Workspace]
        POV[POV Management System]
        TRR[TRR Management & Blockchain]
        SE[Scenario Engine]
        CH[Content Hub & Library]
    end

    C2 --> SE
    C3 --> POV
    C4 --> TRR
    C5 --> TRR
    C6 --> CH
    C0 --> DC

    GUI --> UCE[useCommandExecutor Hook]
    UCE --> CE

    B --> R[Routing Layer - SPA Rewrites]

    subgraph "Firebase Stack"
        H[Hosting CDN]
        FS[Firestore Client SDK]
        ST[Storage Client SDK]
        DC_CONN[DataConnect GraphQL]
    end

    subgraph "External Integrations"
        X[XSIAM API - Palo Alto Networks]
        BQ[BigQuery Export Pipeline]
        VAI[GenAI/Genkit Backend]
    end

    subgraph "CI/CD Pipeline"
        GH[GitHub Actions]
        FB_DEPLOY[Firebase Deploy]
        PREVIEW[Preview Channels]
    end

    H <-- deploy --> GH
    B -.optional.- VAI
    CE -.export.- BQ
    CE -.integrate.- X
    
    U -->|GUI Clicks/Buttons| UCE
    U -->|Direct Terminal Input| IT
```

### Terminal-First Command Flow Architecture

```mermaid
graph TD
    A[User Input - Terminal or GUI] --> B[Input Sanitization & Validation]
    B --> C[Command Resolution & Alias Lookup]
    C --> D[Argument Parsing & Validation]
    D --> E[Permission & Context Check]
    E --> F{Command Type Classification}
    
    F -->|Simple/Static| G[Direct Handler Execution]
    F -->|Complex/Integration| H[Integration Processing Pipeline]
    F -->|GUI-Triggered| UCE[useCommandExecutor Hook]
    
    H --> I{Mock vs Real Mode}
    I -->|Mock Mode| J[Simulation Layer]
    I -->|Real Mode| K[Backend API/Third-party Services]
    
    J --> L[Mock Data Generation]
    K --> M[Real API Response Processing]
    
    G --> N[Output Formatting & React Rendering]
    L --> N
    M --> N
    UCE --> N
    
    N --> O[Terminal Component Rendering]
    O --> P[Display in ImprovedTerminal.tsx]
    
    E --> Q{Validation Error?}
    Q -->|Yes| R[Error Handler]
    R --> S[Error Message Display]
    Q -->|No| N
    
    B --> T[Session Context Tracking]
    T --> U[User Activity Analytics]
    
    subgraph "Command Registry"
        CR0[Core Commands]
        CR1[POV Commands]
        CR2[Scenario Commands]
        CR3[Detection Commands]
        CR4[Monitoring Commands]
        CR5[Integration Commands]
    end
    
    C --> CR0
    C --> CR1
    C --> CR2
    C --> CR3
    C --> CR4
    C --> CR5
```

### Deployment and Routing Architecture

```mermaid
graph LR
    DEV[Developer] -->|git push| GH[GitHub Repository]
    GH --> CI[GitHub Actions CI/CD]
    
    CI -->|Build Process| BUILD[Next.js Build Pipeline]
    BUILD -->|Static Export| OUT[hosting/out Directory]
    
    OUT -->|firebase deploy --only hosting| CDN[Firebase Hosting CDN]
    CDN -->|Global Edge| EDGE[Edge Locations Worldwide]
    
    USER[End User] -->|HTTPS Request| EDGE
    EDGE -->|Route Match| REWRITE[Firebase Rewrites]
    REWRITE -->|** -> /index.html| SPA[Single Page Application]
    
    SPA --> ROUTER[Next.js Client Router]
    ROUTER --> PAGES[App Pages & Components]
    
    subgraph "Routing Strategy"
        STATIC[Static Routes: /, /gui, /terminal]
        DYNAMIC[Dynamic Routes: /pov/[id], /scenarios/[type]]
        CATCH_ALL[Catch-All: [...slug]]
    end
    
    ROUTER --> STATIC
    ROUTER --> DYNAMIC
    ROUTER --> CATCH_ALL
    
    subgraph "Preview Strategy"
        PR[Pull Request] --> PREVIEW_CH[Firebase Preview Channel]
        PREVIEW_CH --> STAGING[Staging Environment]
        STAGING -->|Approval| PROD[Production Deployment]
    end
```

## Feature Module Architecture

### Domain Consultant Module

```mermaid
graph TD
    DCW[DomainConsultantWorkspace.tsx] --> DCS[Domain Consultant Service]
    DCS --> GAI[GenAI Integration]
    DCS --> KB[Knowledge Base]
    
    GAI --> MOCK[Mock AI Responses]
    GAI --> REAL[Genkit/Vertex AI]
    
    DCW --> CMDS[Consulting Commands]
    CMDS --> RECOMMEND[consult recommend]
    CMDS --> ANALYZE[consult analyze]
    CMDS --> REPORT[consult report]
    
    KB --> TOPICS[Security Topics Database]
    KB --> PATTERNS[Best Practices Patterns]
    KB --> TEMPLATES[Response Templates]
```

### POV Management System

```mermaid
graph TD
    POV_UI[POV Management Components] --> POV_SVC[POV Service Layer]
    POV_SVC --> POV_STORE[POV Store - localStorage/Firestore]
    POV_SVC --> POV_TMPL[POV Templates Engine]
    
    POV_TMPL --> EXEC[Executive Overview Template]
    POV_TMPL --> TECH[Technical Deep-dive Template]
    POV_TMPL --> IND[Industry-specific Template]
    
    POV_SVC --> SCENARIO_MAP[Dynamic Scenario Mapping]
    SCENARIO_MAP --> POV_INT[POV Integration Commands]
    
    POV_INT --> CREATE[pov init]
    POV_INT --> ADD[pov add-scenario]
    POV_INT --> STATUS[pov status]
    POV_INT --> EXPORT[pov report]
    
    EXPORT --> PDF[PDF Generation]
    EXPORT --> MD[Markdown Export]
    EXPORT --> EXEC_SUMMARY[Executive Summary]
```

### Scenario Engine Architecture

```mermaid
graph TD
    SC_REG[Scenario Registry] --> SC_ENG[Scenario Engine]
    SC_ENG --> SC_PROVIDERS[Provider Adapters]
    
    SC_PROVIDERS --> GCP[GCP Provider]
    SC_PROVIDERS --> AWS[AWS Provider]
    SC_PROVIDERS --> AZURE[Azure Provider]
    SC_PROVIDERS --> K8S[Kubernetes Provider]
    SC_PROVIDERS --> LOCAL[Local Provider]
    
    SC_ENG --> LIFECYCLE[Scenario Lifecycle]
    LIFECYCLE --> GENERATE[Generate Phase]
    LIFECYCLE --> DEPLOY[Deploy Phase]
    LIFECYCLE --> VALIDATE[Validate Phase]
    LIFECYCLE --> EXPORT[Export Phase]
    LIFECYCLE --> DESTROY[Cleanup Phase]
    
    SC_REG --> SC_TYPES[Scenario Types]
    SC_TYPES --> CLOUD_POST[Cloud Posture]
    SC_TYPES --> CONTAINER[Container Security]
    SC_TYPES --> RANSOMWARE[Ransomware Simulation]
    SC_TYPES --> INSIDER[Insider Threat]
    SC_TYPES --> APT[APT Simulation]
    
    SC_TYPES --> MITRE[MITRE ATT&CK Mapping]
    MITRE --> TECHNIQUES[Attack Techniques]
    MITRE --> TACTICS[Attack Tactics]
```

### TRR Management with Blockchain

```mermaid
graph TD
    TRR_UI[TRR Management Interface] --> TRR_SVC[TRR Service Layer]
    TRR_SVC --> TRR_MATRIX[Validation Matrix]
    TRR_SVC --> TRR_BLOCKCHAIN[Blockchain Signoff]
    
    TRR_BLOCKCHAIN --> BC_SERVICE[Blockchain Service]
    BC_SERVICE --> IPFS[IPFS Document Storage]
    BC_SERVICE --> ETH[Ethereum/Cortex Network]
    BC_SERVICE --> VERIFY[Signature Verification]
    
    TRR_MATRIX --> DETECT_TESTS[Detection Testing]
    TRR_MATRIX --> MONITOR_KPI[Monitoring KPIs]
    TRR_MATRIX --> COMPLIANCE[Compliance Checks]
    
    DETECT_TESTS --> TEST_RESULTS[Test Results Database]
    MONITOR_KPI --> METRICS[Performance Metrics]
    COMPLIANCE --> AUDIT_TRAIL[Immutable Audit Trail]
    
    TRR_SVC --> TRR_EXPORT[Export Functions]
    TRR_EXPORT --> CSV[CSV Reports]
    TRR_EXPORT --> JSON[JSON Data Export]
    TRR_EXPORT --> PDF[PDF Documentation]
```

## Technology Stack Details

### Frontend Stack
```typescript
// Core Technologies
- React 18.2+ with Hooks and Context API
- Next.js 15+ with Static Export (output: 'export')
- TypeScript 5.3+ (strict mode to be re-enabled)
- TailwindCSS 3.4+ with custom Cortex theme

// State Management
- React Context API for app-wide state
- localStorage for persistent terminal/POV data
- Optional Firestore for cloud sync

// Build & Bundling
- Experimental Webpack features (feature-flagged)
- Turbopack for development (--turbo flag)
- Static site generation for CDN deployment
```

### Backend & Integration Stack
```typescript
// Firebase Services
- Firebase Hosting (CDN + rewrites)
- Firestore (client SDK, optional)
- Firebase Storage (client SDK, optional)
- Firebase Functions (Node.js 20, Genkit integration)
- Firebase DataConnect (GraphQL schema)

// External Integrations
- XSIAM API (Palo Alto Networks security platform)
- BigQuery Export (Google Cloud analytics)
- Genkit/Vertex AI (Google AI services)

// Mock/Real Mode Pattern
- All integrations support mock mode for offline development
- Feature flags control mock vs real behavior
- Graceful degradation when backends unavailable
```

### Command System Architecture
```typescript
interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  category?: 'pov' | 'trr' | 'scenario' | 'consultant' | 'system';
  handler: (args: string[]) => React.ReactNode | Promise<React.ReactNode>;
}

// Command Registration Pattern
export const commandConfigs: CommandConfig[] = [
  // Core commands, POV commands, scenario commands, etc.
];

// GUI Integration via Hook
const { run: executeCommand, isRunning } = useCommandExecutor();
executeCommand('pov init "Customer Name"', {
  trackActivity: { event: 'pov-init-click', source: 'gui' }
});
```

## Security and Performance Architecture

### Security Patterns
- **Content Security Policy:** Comprehensive CSP headers
- **Authentication:** Firebase Auth with role-based access
- **Data Privacy:** Client-side processing where possible
- **Audit Trails:** Blockchain-based immutable records for TRR
- **Input Validation:** Command argument sanitization

### Performance Optimizations
- **Code Splitting:** Webpack chunks for command modules
- **Static Export:** Zero server-side runtime dependencies  
- **CDN Distribution:** Global Firebase Hosting CDN
- **Lazy Loading:** Component-level dynamic imports
- **Caching Strategy:** Optimized cache headers for assets

### Scalability Patterns
- **Plugin Architecture:** Modular scenario and provider system
- **Mock-First Development:** Offline-capable development workflow
- **Progressive Enhancement:** Graceful degradation of integrations
- **Stateless Design:** Client-side state management with optional sync

## Integration Architecture

### XSIAM Integration Pattern
```typescript
// Dual-mode integration pattern
class XSIAMClient {
  private mockMode = process.env.NEXT_PUBLIC_USE_MOCK_XSIAM === 'true';
  
  async testEndpoint(endpoint: string): Promise<XSIAMResponse> {
    if (this.mockMode) {
      return this.generateMockResponse(endpoint);
    }
    return this.callRealXSIAMAPI(endpoint);
  }
  
  private generateMockResponse(endpoint: string): XSIAMResponse {
    // Deterministic mock responses for consistent testing
  }
}
```

### BigQuery Export Architecture
```typescript
class BigQueryExporter {
  async exportData(dataset: string, table: string, data: any[]): Promise<ExportResult> {
    if (this.isStaticMode()) {
      // Client-side CSV download
      return this.downloadAsCSV(data);
    }
    // Real mode: POST to Cloud Function/Run
    return this.postToBackend('/api/bigquery/export', { dataset, table, data });
  }
}
```

## Deployment Architecture

### Firebase Hosting Configuration
```json
{
  "hosting": {
    "public": "hosting/out",
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [
      {
        "source": "**/*.@(js|css|woff2|png|jpg)",
        "headers": [{ 
          "key": "Cache-Control", 
          "value": "public,max-age=31536000,immutable" 
        }]
      }
    ]
  }
}
```

### Build Pipeline
```bash
# Development
cd hosting && npm run dev  # Turbopack development server

# Production Build
cd hosting && npm run build  # Next.js build + static export

# Deployment
./deploy.sh  # Root deployment script
# OR
firebase deploy --only hosting
```

## Future Architecture Considerations

### Phase 1: Foundation (Current)
- ✅ Single terminal architecture
- ✅ Command system with GUI integration  
- ✅ Mock-first integration pattern
- 🔄 Firebase hosting-only deployment

### Phase 2: Modularity (Next)
- 📋 Plugin-based scenario system
- 📋 Unified state management
- 📋 Comprehensive test coverage
- 📋 TypeScript strict mode

### Phase 3: Scale (Future)
- 📋 Multi-tenant architecture
- 📋 Real-time collaboration features
- 📋 Advanced analytics pipeline
- 📋 Enterprise SSO integration

## Reference Documentation

- **WARP.md** - Terminal architecture and development workflows
- **CODEINDEX.md** - Complete file inventory and module mapping
- **INITIAL-AUDIT.md** - Current state analysis and technical debt
- **MODULE-*.md** - Individual feature module documentation (planned)

---

*This architecture document represents the current state and refactoring blueprint for the HenryReed.ai Cortex Domain Consultant Platform. For implementation details, refer to the specific module documentation and code index.*

**Last Updated:** 2025-01-08  
**Next Review:** After Phase 1 completion

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