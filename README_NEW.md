# henryreed.ai - Domain Consultant Platform

**Production-Ready GUI Platform for Cortex & Cloud Security DCs**

A comprehensive Domain Consultant (DC) platform specifically designed for Palo Alto Networks Cortex and Cloud security solutions. This platform empowers DCs to achieve technical wins through intelligent workflow management, AI-powered insights, and seamless customer engagement tracking.

[![Deploy to Firebase](https://img.shields.io/badge/deploy-Firebase-orange)](https://henryreedai.web.app)
[![Built with Next.js](https://img.shields.io/badge/built%20with-Next.js-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen)]()

## 🚀 Quick Start (GUI-First Experience)

### Development Mode
```bash
cd hosting
npm run dev
```
Open [http://localhost:3000/gui](http://localhost:3000/gui) to access the main DC interface.

### Production Deployment
```bash
cd hosting
npm run build
npm run deploy
```

## 📊 Core GUI Components

### 🤖 AI Insights Dashboard (`/gui/ai`)
**Intelligent DC workflow acceleration with real-time insights**

- **Real-time DC Workload**: Active customers, POVs, pending TRRs, upcoming milestones
- **Customer Context Analysis**: Industry-specific insights and recommendations
- **POV & TRR Analytics**: Scenario completion rates, validation metrics, timeline tracking
- **AI-Powered Recommendations**: Next best actions, risk mitigation, workflow optimization
- **Recent Activity Stream**: Workflow history with AI suggestion indicators
- **Interactive Chat Assistant**: Context-aware AI conversations for DC guidance

**Key Features:**
- Context-aware AI recommendations based on real customer data
- Dynamic metrics reflecting actual DC workload and performance
- Predictive analytics for engagement success and timeline risks
- Integration with all DC workflows and data sources

### 📋 TRR Management System (`/gui/trr`)
**Complete Technical Risk Review workflow with AI acceleration**

- **Smart TRR Dashboard**: Real-time statistics, completion tracking, priority management
- **AI-Powered Generation**: Context-aware TRR creation based on customer profile
- **Evidence Management**: Collection, validation, and documentation workflows
- **Reviewer Assignment**: Automated assignment and progress tracking
- **Customer Integration**: Direct linkage to POVs and customer engagement data
- **Bulk Operations**: Multi-TRR validation, export, and reporting

**Production Features:**
- Real-time validation status with overdue alerts
- AI-accelerated validation using customer and scenario context
- Comprehensive workflow intelligence with bottleneck identification
- Export and reporting capabilities for stakeholder communication

### 🎯 POV Management Hub (`/gui/pov`)
**End-to-end Proof of Value lifecycle management**

- **POV Creation & Configuration**: Template-based POV setup with customer alignment
- **Scenario Planning**: AI-recommended scenarios based on customer profile
- **Timeline Management**: Milestone tracking, resource allocation, progress monitoring
- **Success Metrics**: Baseline establishment, progress tracking, outcome analysis
- **Customer Alignment**: Stakeholder mapping, decision process monitoring
- **Integration Workflows**: Seamless connection with TRR and customer data

### 🔍 XSIAM Health Monitor (`/gui/xsiam`)
**Real-time XSIAM system health and performance monitoring**

- **System Health Dashboard**: Component status, performance metrics, uptime tracking
- **Automated Health Checks**: Proactive monitoring with intelligent alerting
- **Performance Analytics**: EPS tracking, correlation engine efficiency, API responsiveness
- **Troubleshooting Workflows**: Guided resolution with escalation procedures
- **Customer Environment Monitoring**: Multi-tenant health tracking
- **Optimization Recommendations**: AI-driven performance tuning suggestions

### 📊 BigQuery Data Explorer (`/gui/bigquery`)
**Comprehensive data export and analytics platform**

- **Export Builder**: Configurable data exports with scope, format, and filter options
- **Export History**: Job tracking, download management, status monitoring
- **Query Templates**: Pre-built analytics queries for common DC insights
- **Analytics Dashboard**: Usage metrics, data volume tracking, success rates
- **Scoped Exports**: Customer-specific, time-based, or data-type filtered exports
- **Multiple Formats**: JSON, CSV, Excel, and direct BigQuery integration

### 🎨 Content Creator Studio (`/gui/content`)
**Unified content generation for DC workflows**

- **POV Documentation**: Automated generation based on scenario outcomes
- **TRR Report Templates**: Standardized reporting with evidence integration
- **Customer Presentations**: Dynamic presentation builders with real data
- **Technical Documentation**: Best practice guides and troubleshooting docs
- **Template Management**: Version control and collaborative editing
- **Export & Sharing**: Multi-format export with stakeholder sharing capabilities

## 🏗️ Technical Architecture

### Frontend Stack
- **Next.js 15** - React framework with static export configuration
- **TypeScript** - Full type safety throughout the application  
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Hooks** - Modern state management and lifecycle handling
- **Firebase Hosting** - Static site hosting with global CDN

### Data & API Layer
- **DC Context Store** - Centralized customer, POV, and TRR data management
- **DC API Client** - Comprehensive API layer for all DC operations
- **AI Integration** - Context-aware AI client for workflow acceleration
- **Knowledge Base** - Searchable repository of DC expertise and documentation
- **Feature Audit System** - Automated tracking of GUI/terminal feature parity

### Backend Integration
- **Google Cloud Functions** - Serverless backend for scenario deployment
- **Firebase Storage** - Secure asset and resource management
- **BigQuery** - Advanced analytics and data warehouse capabilities
- **XSIAM APIs** - Real-time health monitoring and performance tracking

## 🎯 DC Workflow Excellence

### Customer Engagement Lifecycle
1. **Customer Profiling**: Industry analysis, maturity assessment, stakeholder mapping
2. **POV Planning**: AI-recommended scenarios, timeline optimization, resource allocation  
3. **TRR Management**: Risk validation, evidence collection, cross-functional review
4. **XSIAM Monitoring**: Health checks, performance optimization, troubleshooting
5. **Analytics & Reporting**: Success metrics, ROI analysis, stakeholder communication

### AI-Powered Acceleration
- **Context-Aware Recommendations**: Based on customer profile, industry, and historical data
- **Predictive Analytics**: Engagement success probability, timeline risk assessment
- **Workflow Optimization**: Automated task prioritization and resource allocation
- **Knowledge Integration**: Real-time access to best practices and troubleshooting guides

### Production-Ready Features
- **Real-Time Data**: Live customer, POV, and TRR status across all interfaces
- **Scalable Architecture**: Multi-tenant support with customer data isolation
- **Security & Compliance**: Enterprise-grade security with audit logging
- **Mobile Responsive**: Full functionality across desktop, tablet, and mobile devices

## 📁 Project Structure

```
.
├── hosting/                    # Next.js application
│   ├── app/                   # App Router configuration
│   ├── components/            # Production GUI components
│   │   ├── EnhancedGUIInterface.tsx    # Main DC interface
│   │   ├── BigQueryExplorer.tsx        # Data export platform
│   │   ├── TRRManagement.tsx          # TRR workflow system
│   │   └── XSIAMMonitor.tsx           # Health monitoring
│   ├── lib/                   # Core library modules
│   │   ├── dc-context-store.ts        # DC data management
│   │   ├── dc-api-client.ts           # Comprehensive API layer
│   │   ├── dc-ai-client.ts            # AI workflow integration
│   │   ├── knowledge-base.ts          # Knowledge management
│   │   └── feature-parity-audit.ts   # GUI/terminal mapping
│   ├── docs/                  # Documentation
│   │   ├── README.md          # Documentation index
│   │   ├── gui-workflows.md   # GUI usage guides
│   │   └── api-reference.md   # API documentation
│   └── next.config.ts         # Next.js static export config
├── deploy.sh                  # Automated deployment
├── firebase.json              # Firebase hosting configuration
└── README.md                  # This file
```

## 🚦 Getting Started

### Prerequisites
- **Node.js** (Latest LTS - v18+)
- **npm** or **yarn** package manager
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git** for version control

### Local Development

1. **Clone and setup:**
   ```bash
   git clone https://github.com/henryreed/henryreed.ai.git
   cd henryreed.ai/hosting
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the platform:**
   - **Main GUI**: [http://localhost:3000/gui](http://localhost:3000/gui)
   - **AI Insights**: [http://localhost:3000/gui/ai](http://localhost:3000/gui/ai)
   - **TRR Management**: [http://localhost:3000/gui/trr](http://localhost:3000/gui/trr)
   - **BigQuery Explorer**: [http://localhost:3000/gui/bigquery](http://localhost:3000/gui/bigquery)

### Development Workflow

#### Auth Bypass for Development
The platform includes development mode auth bypass. In production, integrate with your SSO provider.

#### Sample Data Initialization
```bash
# Sample data is automatically loaded in development
# Real customer, POV, and TRR data for testing workflows
```

#### Hot Reload & Testing
```bash
npm run dev    # Development server with hot reload
npm run build  # Production build test
npm run start  # Test production build locally
```

## 🚀 Production Deployment

### Automated Deployment
```bash
# Quick deployment from root directory
./deploy.sh
```

### Manual Deployment
```bash
cd hosting
npm run build           # Build static export
npm run deploy         # Deploy to Firebase
```

### Environment Configuration
```bash
# Production environment variables
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_API_BASE_URL=https://api.henryreed.ai
```

### Performance Optimization
- **Static Export**: Pre-built static assets for optimal performance
- **CDN Caching**: Global Firebase Hosting CDN with edge caching
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Responsive images with lazy loading

## 🎯 Cortex DC Technical Wins

### Cortex XSOAR Technical Wins
- **Automation Value Demonstration**: MTTR reduction, analyst productivity gains
- **Integration Showcase**: Existing tool integration without replacement
- **Custom Playbooks**: Customer-specific workflow automation
- **ROI Quantification**: Cost savings through manual task elimination

### Cortex XSIAM Technical Wins  
- **Advanced Analytics**: ML-powered threat detection with reduced false positives
- **Scalability**: High-volume data ingestion and real-time analysis
- **Cloud-Native Architecture**: Cost optimization and multi-tenant flexibility
- **Behavioral Analytics**: Insider threat detection and advanced hunting

### Cortex XDR Technical Wins
- **Endpoint Protection Excellence**: Advanced malware and ransomware protection
- **Investigation & Response**: Timeline-based incident reconstruction
- **Cross-Platform Visibility**: Comprehensive security across environments
- **Automated Remediation**: Rapid containment and recovery capabilities

### Customer Value Positioning
- **Business Impact Quantification**: ROI calculations and risk reduction metrics
- **Operational Efficiency**: Process improvements and cost savings analysis
- **Strategic Security Enhancement**: Future readiness and competitive differentiation
- **Comprehensive Platform Benefits**: Unified security vs. fragmented point solutions

## 📚 Documentation

### User Guides
- [**GUI Workflows**](./hosting/docs/gui-workflows.md) - Complete GUI usage guide
- [**API Reference**](./hosting/docs/api-reference.md) - DC API documentation
- [**Knowledge Base**](./hosting/docs/knowledge-base.md) - DC best practices and troubleshooting

### Technical Documentation
- [**Architecture Guide**](./hosting/docs/architecture.md) - System design and components
- [**Development Setup**](./hosting/docs/development.md) - Local development configuration
- [**Deployment Guide**](./hosting/docs/deployment.md) - Production deployment procedures

### Legacy Reference
- [**Terminal Commands**](./hosting/docs/terminal-reference.md) - Legacy command reference (deprecated)
- [**Migration Guide**](./hosting/docs/gui-migration.md) - Terminal to GUI workflow migration

## 🔧 Configuration

### Firebase Hosting
```json
{
  "hosting": {
    "public": "hosting/out",
    "rewrites": [{"source": "**", "destination": "/index.html"}],
    "headers": [
      {"source": "**/*.@(js|css)", "headers": [{"key": "Cache-Control", "value": "max-age=31536000"}]},
      {"source": "**/*.@(html|json)", "headers": [{"key": "Cache-Control", "value": "max-age=3600"}]}
    ]
  }
}
```

### Next.js Static Export
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: { unoptimized: true }
};
```

## 🤝 Contributing

### Development Guidelines
1. **GUI-First**: All new features should prioritize GUI implementation
2. **TypeScript**: Full type safety required for all components
3. **Real Data**: Use DC Context Store for authentic workflow data
4. **AI Integration**: Leverage AI client for workflow acceleration
5. **Mobile Responsive**: Ensure functionality across all device types

### Feature Development Process
1. **Feature Audit**: Check feature parity system for GUI/terminal mapping
2. **Component Design**: Create reusable components with proper TypeScript typing
3. **Data Integration**: Use DC API Client and Context Store for data management
4. **AI Enhancement**: Add context-aware AI recommendations where applicable
5. **Documentation**: Update user guides and API documentation

## 📞 Support & Contact

### Production Support
- **Platform Issues**: File issues in the GitHub repository
- **Feature Requests**: Submit detailed feature requests with DC use cases
- **Technical Questions**: Consult the knowledge base and documentation

### DC Community
- **Best Practices**: Share successful customer engagement patterns
- **Technical Wins**: Document Cortex product technical win strategies
- **Workflow Optimization**: Contribute AI workflow improvements

---

**Built with ❤️ for Palo Alto Networks Domain Consultants**

*Empowering DC technical wins through intelligent workflow automation and AI-powered insights.*