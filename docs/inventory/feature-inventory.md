# Feature Inventory - henryreed.ai Platform

## Overview
This document provides a comprehensive inventory of all features, capabilities, and user stories discovered in the henryreed.ai codebase. The platform is a sophisticated Domain Consultant (DC) engagement portal focused on proving XSIAM platform value to customers.

## Core Platform Architecture
- **Framework**: Next.js 15 with static export
- **Backend**: Firebase (Functions, Firestore, Storage, Pub/Sub)
- **Authentication**: Firebase Auth with role-based access
- **Deployment**: Firebase Hosting with CDN
- **AI Integration**: OpenAI GPT-4 for scenario generation

## User Personas

### Primary Users
1. **Domain Consultant (DC)** - Primary user managing customer POVs
2. **Security Analyst** - Technical specialist executing scenarios
3. **Manager** - Oversight and reporting across engagements

### User Roles in System
- `admin` - Full system access and configuration
- `manager` - Team oversight and reporting
- `senior_dc` - Advanced DC capabilities and mentoring
- `dc` - Standard DC workflow access
- `analyst` - Technical analysis and scenario execution

## Feature Categories

### 1. GUI Interface System

#### Components Discovered
- **CortexGUIInterface** (`hosting/components/CortexGUIInterface.tsx`)
  - Main GUI container with tab-based navigation
  - Quick action buttons for common workflows
  - Activity tracking and analytics integration

- **EnhancedGUIInterface** (`hosting/components/EnhancedGUIInterface.tsx`)
  - Enhanced version with improved PANW Cortex branding
  - Command integration from GUI actions
  - Advanced breadcrumb navigation

#### Core GUI Features
- **Tab-based Navigation**: Dashboard, AI Insights, TRR Management, POV Management, XSIAM Health, BigQuery Explorer, Content Creator, Scenario Engine
- **Quick Actions**: New POV creation, CSV upload, report generation, AI analysis, detection engine access
- **Activity Streams**: Real-time activity feed with status tracking
- **Responsive Design**: Mobile-first approach with desktop enhancements

### 2. Terminal Command System (Legacy Support)

#### Command Registry Files
- **commands.tsx** - Core system commands (help, ls, whoami, contact)
- **commands-ext.tsx** - Extended functionality (AI, search, status)
- **download-commands.tsx** - Resource download management
- **scenario-commands.tsx** - Scenario deployment and management
- **bigquery-commands.tsx** - Data export commands

#### Command Inventory (20+ Primary Commands)
```
Core Commands:
- help/? - Command reference and usage
- clear - Terminal screen management
- ls/list/dir - Context exploration and listing
- whoami/me/info - User identity and profile
- status/info/stats - System health and analytics

AI-Powered Commands:
- cortex-questions/cq/ask-cortex/genai - AI question processing
- ai/ask/chat - Interactive AI assistant
- search/find/lookup - Knowledge base search

Management Commands:
- contact/reach/connect - Contact information and scheduling
- services/offerings/solutions - Service portfolio
- ctxpov/ctx-pov/perspective - Context point-of-view URLs

Download Commands:
- download/dl/get - Resource management system
- terraform/tf/infra - Infrastructure templates
- detection/detect/security - Security detection scripts
- cdr/cloud-detection - CDR platform access

Scenario Commands:
- scenario/deploy/pov - Scenario lifecycle management
  - Actions: list, generate, status, validate, destroy, export
  - Types: cloud-posture, container-vuln, code-vuln, insider-threat, ransomware, waas-exploit, ai-threat, pipeline-breach
  - Providers: aws, gcp, azure, k8s, local
```

### 3. Scenario Engine System

#### Core Components
- **ScenarioEngine** (`hosting/components/ScenarioEngine.tsx`)
  - Real-time scenario execution monitoring
  - AI-driven threat actor scenario generation
  - Multi-view dashboard (dashboard, execution monitor, blueprint designer)
  
- **scenario-engine.ts** (`hosting/lib/scenario-engine.ts`)
  - Client-side scenario management wrapper
  - Blueprint creation and execution control
  - Real-time status tracking

#### AI-Powered Features
- **Threat Actor Profiling**: Generate scenarios based on APT groups (APT29, Lazarus Group, FIN7)
- **Dynamic Blueprint Creation**: AI-enhanced scenarios with MITRE ATT&CK mapping
- **Detection Query Generation**: Automatic KQL, SPL, SQL query creation
- **Adaptive Execution**: Real-time scenario modification based on results

#### Scenario Types Supported
- Cloud security posture assessment
- Container vulnerability testing
- Code vulnerability assessment
- Insider threat simulation
- Ransomware pattern simulation
- Web application security testing
- AI/LLM security assessment
- CI/CD pipeline security testing

### 4. TRR (Technical Risk Review) Management

#### Components
- **TRRManagement** (`hosting/components/TRRManagement.tsx`)
- **ProductionTRRManagement** (`hosting/components/ProductionTRRManagement.tsx`)
- **TRRProgressChart** (`hosting/components/TRRProgressChart.tsx`)

#### Features
- **Complete TRR Lifecycle**: Creation, assignment, validation, approval
- **Evidence Management**: Collection, validation, documentation
- **Reviewer Assignment**: Automated assignment and progress tracking
- **Customer Integration**: Direct linkage to POVs and customer data
- **Bulk Operations**: Multi-TRR validation, export, reporting
- **CSV Import/Export**: Bulk TRR data management

#### TRR Data Model
```typescript
interface TRR {
  id: string;
  title: string;
  description: string;
  category: 'integration' | 'performance' | 'security' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'in-progress' | 'under-review' | 'completed' | 'cancelled';
  assignedTo: string;
  customer: string;
  project: string;
  scenario: string;
  validationMethod: 'manual' | 'automated' | 'hybrid';
  expectedOutcome: string;
  acceptanceCriteria: string[];
  // Additional fields for evidence, timeline, approvals
}
```

### 5. POV (Proof of Value) Management

#### Components
- **POVProjectManagement** (`hosting/components/POVProjectManagement.tsx`)
- **ManagementDashboard** (`hosting/components/ManagementDashboard.tsx`)

#### Features
- **POV Lifecycle Management**: Creation, execution, tracking, closing
- **Scenario Integration**: Seamless connection with scenario engine
- **Timeline Management**: Milestone tracking and deadline management
- **Success Metrics**: KPI tracking and outcome analysis
- **Customer Alignment**: Stakeholder mapping and communication tracking
- **Executive Reporting**: Automated report generation and export

#### POV Workflow States
- Discovery → Demo → Pilot → Decision → Closed

### 6. XSIAM Health Monitoring

#### Components
- **XSIAMHealthMonitor** (`hosting/components/XSIAMHealthMonitor.tsx`)
- **XSIAMIntegrationPanel** (`hosting/components/XSIAMIntegrationPanel.tsx`)

#### Features
- **Real-time Health Dashboards**: System component status monitoring
- **Performance Analytics**: EPS tracking, correlation engine metrics
- **Automated Health Checks**: Proactive monitoring with intelligent alerting
- **Troubleshooting Workflows**: Guided resolution procedures
- **Multi-tenant Monitoring**: Customer environment health tracking
- **API Integration**: Direct XSIAM API connectivity for live data

#### Monitoring Metrics
- Events Per Second (EPS)
- Correlation Engine CPU/Memory usage
- API Response times
- Error rates and alert volumes
- Data ingestion rates

### 7. BigQuery Data Explorer

#### Components
- **BigQueryExplorer** (`hosting/components/BigQueryExplorer.tsx`)
- **BigQueryExportPanel** (`hosting/components/BigQueryExportPanel.tsx`)

#### Features
- **Export Builder**: Configurable data exports with filtering
- **Query Templates**: Pre-built analytics queries for DC insights
- **Export History**: Job tracking and download management
- **Multiple Formats**: JSON, CSV, Excel export options
- **Analytics Dashboard**: Usage metrics and data volume tracking
- **Scoped Exports**: Customer-specific or time-based filtering

#### Export Capabilities
- Full data dumps
- Customer-specific exports
- Time-range filtered data
- TRR analytics exports
- POV performance data

### 8. Content Creation and Management

#### Components
- **EnhancedContentCreator** (`hosting/components/EnhancedContentCreator.tsx`)
- **ContentCreatorManager** (`hosting/components/ContentCreatorManager.tsx`)
- **UnifiedContentCreator** (`hosting/components/UnifiedContentCreator.tsx`)
- **ConsolidatedContentLibrary** (`hosting/components/ConsolidatedContentLibrary.tsx`)

#### Features
- **Unified Content Generation**: POVs, TRR reports, presentations
- **Template Management**: Version control and collaborative editing
- **Dynamic Content**: AI-powered content generation based on scenario outcomes
- **Multi-format Export**: PDF, DOCX, HTML, Markdown
- **Content Analytics**: Usage tracking and performance metrics
- **Asset Management**: Document versioning and approval workflows

### 9. AI Assistant and Insights

#### Components
- **EnhancedAIAssistant** (`hosting/components/EnhancedAIAssistant.tsx`)
- **ai-insights-client.ts** (`hosting/lib/ai-insights-client.ts`)

#### Features
- **Context-aware Recommendations**: Based on customer profile and engagement history
- **Interactive Chat Interface**: Real-time AI conversations for DC guidance
- **Predictive Analytics**: Engagement success probability and risk assessment
- **Workflow Optimization**: Automated task prioritization and resource allocation
- **Knowledge Integration**: Real-time access to best practices and documentation

### 10. Authentication and User Management

#### Components
- **AuthContext** (`hosting/contexts/AuthContext.tsx`)
- **useAuthGuard** (`hosting/hooks/useAuthGuard.ts`)
- **LoginForm** (`hosting/components/LoginForm.tsx`)

#### Features
- **Multi-tenant Organization Support**: User authentication with org isolation
- **Role-based Access Control**: Fine-grained permissions system
- **Session Management**: Secure session tracking and timeout handling
- **Activity Tracking**: User action logging and audit trails

## Backend Services Architecture

### Firebase Cloud Functions
- **generateThreatActorScenarioFunction** - AI scenario generation
- **executeScenarioFunction** - Scenario execution initiation
- **controlScenarioExecutionFunction** - Runtime control (pause/resume/cancel)
- **generateDetectionQueriesFunction** - AI-powered query generation
- **processScenarioExecution** - Background execution orchestration
- **monitorExecutionStatusChanges** - Real-time status monitoring
- **cleanupOldExecutions** - Automated data cleanup

### Data Storage

#### Firestore Collections
- **scenarioBlueprints** - Scenario templates and configurations
- **scenarioExecutions** - Runtime execution state and results
- **aiPredictions** - AI model predictions and confidence data
- **activityLogs** - User actions and system events
- **customers** - Customer profile and engagement data
- **povs** - POV lifecycle and outcome tracking
- **trrs** - TRR validation and approval workflows

#### Cloud Storage Buckets
- Evidence storage for TRRs
- Generated reports and exports
- Template and asset management
- Backup and archive storage

### External Integrations

#### APIs and Services
- **XSIAM API** - Health monitoring and performance data
- **BigQuery** - Data warehousing and analytics
- **GitHub** - Content management and CI/CD integration
- **cal.com** - Meeting scheduling and calendar integration
- **Multi-cloud APIs** - AWS, GCP, Azure connector abstractions

## User Stories by Feature

### Domain Consultant Stories

#### POV Management
- **As a DC**, I want to create a new POV with customer context so I can track engagement progress
- **As a DC**, I want to link scenarios to my POV so I can demonstrate specific security capabilities
- **As a DC**, I want to generate executive reports so I can communicate value to customer leadership
- **As a DC**, I want to track POV milestones so I can ensure timely completion and avoid delays

#### Scenario Engine
- **As a DC**, I want to generate scenarios based on threat actors so I can create relevant demonstrations for customers
- **As a DC**, I want to execute scenarios in real-time so I can show live security capabilities during demos
- **As a DC**, I want to pause and control scenario execution so I can adapt demos to customer questions
- **As a DC**, I want to generate detection queries automatically so I can show customer-specific security rules

#### TRR Management
- **As a DC**, I want to create TRRs linked to my POV so I can validate technical risks before deployment
- **As a DC**, I want to assign TRRs to technical specialists so I can ensure expert validation
- **As a DC**, I want to track TRR progress so I can report validation status to customers
- **As a DC**, I want to export TRR reports so I can provide documentation to customer technical teams

### Security Analyst Stories

#### Scenario Execution
- **As a Security Analyst**, I want to monitor scenario execution in real-time so I can ensure accurate demonstrations
- **As a Security Analyst**, I want to validate detection coverage so I can confirm security rule effectiveness
- **As a Security Analyst**, I want to generate custom detection queries so I can adapt to customer environments
- **As a Security Analyst**, I want to troubleshoot failed scenarios so I can quickly resolve demo issues

#### Technical Validation
- **As a Security Analyst**, I want to validate TRR technical requirements so I can ensure deployment readiness
- **As a Security Analyst**, I want to document evidence for TRRs so I can support validation decisions
- **As a Security Analyst**, I want to review XSIAM health metrics so I can optimize platform performance

### Manager Stories

#### Portfolio Management
- **As a Manager**, I want to view all active POVs so I can track team performance and resource allocation
- **As a Manager**, I want to see TRR validation metrics so I can ensure quality and compliance
- **As a Manager**, I want to export analytics data so I can report to leadership on team effectiveness
- **As a Manager**, I want to approve high-priority TRRs so I can maintain quality control

#### Analytics and Reporting
- **As a Manager**, I want to view success rates across different scenario types so I can optimize our approach
- **As a Manager**, I want to track customer engagement patterns so I can improve our methodology
- **As a Manager**, I want to monitor resource utilization so I can optimize team assignments

## Technical Architecture Patterns

### Frontend Architecture
- **Component-based**: Modular React components with clear separation of concerns
- **Context Management**: Global state management with React Context
- **Real-time Updates**: WebSocket connections for live data synchronization
- **Responsive Design**: Mobile-first with progressive enhancement

### Backend Architecture
- **Serverless Functions**: Auto-scaling Firebase Functions for business logic
- **Event-driven**: Pub/Sub messaging for asynchronous processing
- **Real-time Database**: Firestore for synchronized data updates
- **Background Processing**: Scheduled functions for cleanup and maintenance

### Integration Patterns
- **API Gateway**: Centralized API management with authentication
- **Circuit Breaker**: Fault tolerance for external service calls
- **Rate Limiting**: Protection against abuse and resource exhaustion
- **Caching**: Multi-layer caching for performance optimization

## Deployment and Infrastructure

### Firebase Configuration
- **Hosting**: Static site hosting with CDN caching
- **Functions**: Node.js runtime with environment-specific configurations
- **Firestore**: Multi-region deployment with security rules
- **Storage**: Secure file storage with access controls
- **Authentication**: OAuth2 and email/password authentication

### Development Workflow
- **Local Development**: Firebase emulators for full-stack development
- **CI/CD Pipeline**: GitHub Actions with automated testing and deployment
- **Environment Management**: Dev, staging, and production environments
- **Monitoring**: Comprehensive logging and error tracking

This feature inventory represents the comprehensive capabilities discovered in the henryreed.ai platform, serving as the foundation for detailed wireframes and user experience design.