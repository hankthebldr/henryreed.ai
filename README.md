# Cortex DC Portal - Domain Consultant Hub

> **Professional XSIAM POV Management & Security Demonstration Platform for Domain Consultants**

[![Deploy to Firebase](https://img.shields.io/badge/deploy-Firebase-orange)](https://henryreedai.web.app)
[![Built with Next.js](https://img.shields.io/badge/built%20with-Next.js-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A modern, GUI-first web application designed for Domain Consultants to manage POVs (Proof of Value), TRRs (Technical Requirements Review), and security scenarios. Built with Next.js 15 and deployed on Google Cloud Platform using Firebase services.

![Cortex DC Portal Interface](https://via.placeholder.com/800x400/1a1a1a/00ff00?text=Cortex+DC+Portal+Interface)

---

## 🚀 Features & Capabilities

### 📊 **Core Modules**
- **🎯 POV Management** - Complete POV project lifecycle with timeline tracking and stakeholder communication
- **📋 TRR Management** - Technical Requirements Review tracking and automation
- **🤖 AI Insights** - AI-powered analysis, recommendations, and chat assistance
- **🛠️ Content Creator** - Unified creation flows for POVs, templates, and scenarios
- **🔗 XSIAM Integration** - Real-time XSIAM connectivity, health monitoring, and analytics
- **📊 BigQuery Export** - Data export and analytics pipeline integration
- **🔧 Scenario Engine** - Security scenario deployment and management

### ⚙️ **Technical Stack**
- **Frontend**: Next.js 15 with Turbopack, TypeScript, Tailwind CSS
- **Backend**: Google Cloud Functions (Node.js 18/20), Firebase services
- **Database**: Firebase Firestore + PostgreSQL Data Connect
- **Authentication**: Firebase Authentication with role-based access control
- **Hosting**: Firebase Hosting with global CDN
- **AI/ML**: Google Genkit integration for advanced AI capabilities

---

## 🏧 Current Deployment Architecture

### **Google Cloud Platform Services**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase Hosting (Global CDN)                │
│                  https://henryreedai.web.app                    │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────────┐
│                 Next.js Static Export                           │
│              (Client-side React App)                            │
└─────────────────┬───────────────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
┌─────────────────┐ ┌─────────────────┐
│ Cloud Functions │ │ Firebase        │
│                 │ │ Services        │
│ • Default       │ │                 │
│   (Node.js 18)  │ │ • Firestore     │
│ • Genkit AI     │ │ • Authentication│
│   (Node.js 20)  │ │ • Storage       │
│                 │ │ • Data Connect  │
└─────────────────┘ └─────────────────┘
         │                 │
         └────────┬────────┘
                  │
┌─────────────────────────────────────────────────────────────────┐
│              PostgreSQL (Data Connect)                          │
│          Enhanced schema for POV/TRR management                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Key GCP Integrations**

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Firebase Hosting** | Static site delivery with global CDN | `firebase.json` - rewrites, caching headers |
| **Cloud Functions** | Dual codebase serverless backend | Default + Genkit AI functions |
| **Firebase Firestore** | Real-time document database | Role-based security rules |
| **Firebase Storage** | File uploads and document storage | Secure bucket policies |
| **Firebase Authentication** | User management and RBAC | Email/password + future OKTA SSO |
| **Data Connect** | PostgreSQL integration | GraphQL schema with audit trails |
| **Remote Config** | Feature flags and user settings | Role-based feature enablement |

---

## 📁 Project Structure

```
henryreed.ai/
├── hosting/                    # Next.js Application
│   ├── app/                   # App Router (Next.js 15)
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Landing/auth page
│   │   └── gui/               # Main application routes
│   ├── components/            # React Components
│   │   ├── POVManagement.tsx  # POV project management
│   │   ├── TRRManagement.tsx  # Technical requirements tracking
│   │   ├── EnhancedGUIInterface.tsx # Main dashboard interface
│   │   ├── terminal/          # Terminal components
│   │   └── auth/              # Authentication components
│   ├── lib/                   # Core Libraries
│   │   ├── scenario-commands.tsx    # Security scenario management
│   │   ├── cloud-functions-api.ts   # GCP integration layer
│   │   ├── scenario-types.ts        # TypeScript definitions
│   │   └── auth/                    # Authentication providers
│   ├── contexts/              # React Context Providers
│   │   ├── AppStateContext.tsx      # Global app state
│   │   └── AuthContext.tsx          # Authentication context
│   ├── hooks/                 # Custom React Hooks
│   ├── next.config.ts         # Next.js configuration (static export)
│   └── package.json           # Dependencies and scripts
├── functions/                 # Default Cloud Functions (Node.js 18)
│   ├── src/                   # TRR management, analytics, exports
│   └── package.json           
├── henryreedai/              # Genkit AI Functions (Node.js 20)
│   ├── src/                   # AI-powered analysis and chat
│   └── package.json
├── dataconnect/              # PostgreSQL Data Connect
│   ├── schema/               # Database schema definitions
│   └── dataconnect.yaml      # Configuration
├── firebase.json             # Firebase project configuration
└── deploy.sh                # Automated deployment script
```

---

## 🚐 Getting Started

### **Prerequisites**
- **Node.js** 18+ (LTS recommended)
- **Firebase CLI**: `npm install -g firebase-tools`
- **Git** for version control

### **Local Development**

1. **Clone and setup:**
   ```bash
   git clone https://github.com/henryreed/henryreed.ai.git
   cd henryreed.ai/hosting
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   # Runs on http://localhost:3000 with Turbopack
   ```

3. **Firebase emulation (optional):**
   ```bash
   npm run firebase:emulators
   # Starts local Firebase services
   ```

### **Production Build & Test**

```bash
# Build static export
cd hosting
npm run build

# Test locally with Firebase emulator
npm run firebase:serve
```

---

## 🚀 Deployment

### **Automated Deployment**
```bash
# From project root
./deploy.sh
```

### **Manual Deployment**
```bash
# Build application
cd hosting && npm run build && cd ..

# Deploy to Firebase Hosting  
firebase deploy --only hosting

# Deploy functions (if changed)
firebase deploy --only functions
```

### **Preview Channel Deployment**
```bash
cd hosting
npm run deploy:preview
# Creates temporary URL for testing
```

---

## 🔧 Configuration & Environment

### **Firebase Configuration**
```json
{
  "hosting": {
    "public": "hosting/out",
    "rewrites": [{"source": "**", "destination": "/index.html"}],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [{"key": "Cache-Control", "value": "max-age=31536000"}]
      }
    ]
  }
}
```

### **Next.js Static Export**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',              // Static site generation
  trailingSlash: true,          // Firebase compatibility
  distDir: 'out',               // Build directory
  images: { unoptimized: true }, // Required for static hosting
  experimental: {
    turbo: { rules: {} }         // Turbopack configuration
  }
}
```

### **Environment Variables**
```env
# Firebase configuration (auto-configured)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Feature flags
NEXT_PUBLIC_USE_FUNCTIONS=1
NEXT_PUBLIC_AI_ENABLED=true
NEXT_PUBLIC_AUTH_PROVIDER=local

# Optional: OKTA integration
NEXT_PUBLIC_OKTA_DOMAIN=
NEXT_PUBLIC_OKTA_CLIENT_ID=
```

---

## 🔐 Security & Authentication

### **Role-Based Access Control**
- **Admin**: Full system access, user management, advanced features
- **User**: POV/TRR creation and management, basic analytics
- **Viewer**: Read-only access to assigned projects

### **Security Features**
- Firebase Authentication with email validation
- Firestore security rules with domain restrictions (`@henryreed.ai`, `@paloaltonetworks.com`)
- Role-based feature gating throughout the application
- Secure file upload/download with user isolation
- Audit trails for all critical operations

---

## 🤖 AI & Advanced Features

### **Google Genkit AI Integration**
The application leverages Google's Genkit framework for advanced AI capabilities:

- **POV Analysis**: Risk assessment, strategic recommendations, success factors
- **TRR Automation**: Implementation guidance, technical validation
- **Detection Generation**: Security rules, MITRE ATT&CK mapping
- **Scenario Optimization**: Performance tuning recommendations
- **Chat Assistant**: Domain expert AI for real-time assistance
- **Competitive Analysis**: Strategic positioning insights

### **Scenario Management**
Comprehensive security scenario framework supporting:
- **Providers**: GCP, AWS, Azure, local environments
- **Scenario Types**: cloud-posture, insider-threat, ransomware, container-vuln, etc.
- **Lifecycle**: generate → deploy → validate → export → destroy
- **Integration**: Direct XSIAM/Cortex platform connectivity

---

## 📊 Performance & Monitoring

### **Build Performance**
- **Turbopack**: Next.js 15 with experimental bundler for fast development
- **Static Export**: Optimized for global CDN delivery
- **Bundle Analysis**: Automated optimization and tree-shaking

### **Runtime Performance**
- **CDN Caching**: 1-year cache for static assets, 1-hour for HTML
- **Client-side Routing**: SPA behavior with Firebase rewrites
- **Lazy Loading**: Component-level code splitting

### **Monitoring**
- Firebase Analytics integration
- Cloud Functions logging and monitoring
- User activity tracking and audit trails
- Performance metrics dashboard

---

## 🔗 External Integrations

### **Current Integrations**
- **XSIAM/Cortex**: Real-time platform connectivity and health monitoring
- **BigQuery**: Data export and analytics pipeline
- **Calendar Systems**: Meeting scheduling (cal.com)
- **GitHub**: Repository integration for CDR platform

### **Planned Integrations**
- **OKTA SSO**: Enterprise authentication
- **Slack**: POV communication and notifications  
- **Salesforce/HubSpot**: CRM integration hooks
- **ServiceNow/Jira**: TRR workflow integration

---

## 📚 Additional Documentation

- [`WARP.md`](WARP.md) - Development workflows and terminal integration
- [`FIREBASE_CONFIGURATION_SUMMARY.md`](FIREBASE_CONFIGURATION_SUMMARY.md) - Detailed GCP service configuration
- [`docs/architecture.md`](docs/architecture.md) - Detailed system architecture
- [`hosting/WARP.md`](hosting/WARP.md) - Component architecture and command system

---

## 🚨 Production Notes

### **Current Status**
✅ **Production Ready** - Deployed at [henryreedai.web.app](https://henryreedai.web.app)

### **Known Limitations**
- Terminal interface is legacy (GUI-first approach)
- OKTA SSO integration in development
- Some AI features require function deployment

### **Performance Characteristics**
- **Build Time**: ~30 seconds (with Turbopack)
- **Deployment Time**: ~2 minutes (Firebase Hosting)
- **Cold Start**: <1 second (static site)
- **Function Latency**: 200-500ms (Cloud Functions)

---

## 📞 Support & Contributions

- **Issues**: GitHub Issues for bug reports and feature requests
- **Development**: Follow the WARP.md development workflows
- **Deployment**: Use automated `./deploy.sh` script for consistency

**Deployed Version**: https://henryreedai.web.app
**Repository**: https://github.com/henryreed/henryreed.ai
