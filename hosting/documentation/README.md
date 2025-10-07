# Cortex DC Portal - UI Documentation

## Overview

This documentation provides comprehensive wireframes, component architecture diagrams, and user workflow maps for the Cortex Domain Consultant Portal. The portal is a 9-tab React/Next.js application serving as the primary interface for domain consultants managing POVs, TRRs, and customer engagements.

**Purpose**: Document UI structure, navigation patterns, and component relationships to support development, design, and product decisions.

**Related Documentation**: See [Portal UI Map](../docs/portal-ui-map.md) for complete workflow definitions and AI enhancement opportunities.

## Architecture Overview

- **Framework**: Next.js with React, TypeScript
- **Authentication**: Context-based auth with role-based permissions  
- **State Management**: React Context API + local component state
- **Styling**: Tailwind CSS with custom Cortex theme
- **AI Integration**: Google Gemini for enhanced insights and automation

## Portal Structure

### 9 Primary Navigation Tabs

1. **📊 Dashboard** - DC engagement overview and metrics
2. **🎯 POV Management** - Complete POV lifecycle management
3. **📋 TRR & Requirements** - Technical requirements documentation
4. **🔍 Platform Health** - Cortex platform monitoring
5. **🤖 AI Assistant** - AI-powered insights and recommendations
6. **📈 Customer Analytics** - Customer data analysis platform
7. **🔧 Demo Builder** - Custom demo scenario creation
8. **🚀 Content Library** - Pre-built scenarios and battlecards
9. **⚙️ DC Management** - Team management and oversight (Admin only)

## Documentation Structure

### Core Documentation

| Document | Purpose | Status |
|----------|---------|---------|
| [00-conventions.md](00-conventions.md) | Wireframe legends, diagramming standards, and naming conventions | ✅ |
| [01-navigation-structure.md](01-navigation-structure.md) | Global navigation, tab structure, and routing patterns | ✅ |
| [02-component-architecture.md](02-component-architecture.md) | Component hierarchy, relationships, and interaction patterns | ✅ |
| [05-component-inventory.md](05-component-inventory.md) | Complete catalog of React components with props and usage | ✅ |
| [06-route-mapping.md](06-route-mapping.md) | Next.js routes, URL patterns, and navigation logic | ✅ |

### Page Layout Wireframes

| Page | Component | Route | Status |
|------|-----------|-------|--------|
| [Dashboard](03-page-layouts/dashboard.md) | POVDashboard | `/gui` | ✅ |
| [POV Management](03-page-layouts/pov-management.md) | POVProjectManagement | `/gui/pov` | ✅ |
| [TRR & Requirements](03-page-layouts/trr-and-requirements.md) | ProductionTRRManagement | `/gui/trr` | ✅ |
| [Platform Health](03-page-layouts/platform-health.md) | XSIAMHealthMonitor | `/gui/xsiam` | ✅ |
| [AI Assistant](03-page-layouts/ai-assistant.md) | EnhancedAIAssistant | `/gui/ai` | ✅ |
| [Customer Analytics](03-page-layouts/customer-analytics.md) | BigQueryExplorer | `/gui/data` | ✅ |
| [Demo Builder](03-page-layouts/demo-builder.md) | EnhancedManualCreationGUI | `/gui/creator` | ✅ |
| [Content Library](03-page-layouts/content-library.md) | UnifiedContentCreator | `/gui/scenarios` | ✅ |
| [DC Management](03-page-layouts/dc-management.md) | ManagementDashboard | `/gui/admin` | ✅ |

### User Workflow Maps

| Workflow | Description | Status |
|----------|-------------|--------|
| [Overview](04-workflows/overview.md) | All workflow patterns and cross-references | ✅ |
| [New POV Creation](04-workflows/new-pov-creation.md) | Template selection to POV creation | ✅ |
| [TRR Gate Review](04-workflows/trr-gate-review.md) | Bulk validation to customer signoff | ✅ |
| [Platform Incident Investigation](04-workflows/platform-incident-investigation.md) | Alert to root cause resolution | ✅ |
| [AI Assistant Query to Action](04-workflows/ai-assistant-query-to-action.md) | Natural language to executed recommendations | ✅ |
| [Customer Analytics Deep Dive](04-workflows/customer-analytics-deep-dive.md) | Data exploration to segment insights | ✅ |
| [Demo Builder Publish](04-workflows/demo-builder-publish.md) | Content creation to deployment | ✅ |
| [Content Asset Lifecycle](04-workflows/content-asset-lifecycle.md) | Draft to archived content management | ✅ |
| [DC Management User Roles](04-workflows/dc-management-user-roles.md) | User provisioning and role assignment | ✅ |

### Reference Documents

| Document | Purpose |
|----------|---------|
| [99-changelog.md](99-changelog.md) | Version history and change tracking |
| [index.json](index.json) | TOC metadata for docs viewer integration |

## Key Features Documented

### Navigation Patterns
- 9-tab horizontal navigation with role-based access
- Sub-tab navigation within primary tabs
- Breadcrumb trails and "Back to Dashboard" patterns
- Deep linking and context preservation

### Component Architecture  
- Global shell components (AppShell, AppHeader, ConditionalLayout)
- Tab-specific page components and their hierarchies
- Shared utility components and hooks
- AI integration patterns and action execution

### User Experience Flows
- Cross-tab navigation with action context
- Form wizards and multi-step processes  
- Modal overlays and drawer panels
- Loading states and error handling

### AI Augmentation
- AIAction execution patterns (execute, navigate, create, export)
- Context-aware recommendations and insights
- Gemini integration for natural language processing
- Confidence scoring and impact assessment

## Conventions

### Wireframe Elements
```
┌─ Header ─────────────────────────┐
│ [Logo] [Navigation] [User Menu]  │
├─ Tabs ──────────────────────────┤
│ [Dashboard] [POV] [TRR] ...      │
├─ Content ───────────────────────┤
│ ┌─ Sidebar ─┐ ┌─ Main Content ─┐ │
│ │ Filters   │ │ Tables/Charts │ │
│ │ Actions   │ │ Details       │ │
│ └───────────┘ └───────────────┘ │
├─ Footer ────────────────────────┤
│ Status | Help | Documentation   │
└─────────────────────────────────┘
```

### State Representations
- `[Loading...]` - Async operations in progress
- `[Empty State]` - No data available with call-to-action
- `[Error State]` - Error condition with recovery options  
- `[Success State]` - Completed operation with next steps

### Component Naming
- Page components: `{Domain}{Action}` (e.g., POVProjectManagement)
- Layout components: `{Purpose}{Type}` (e.g., AppHeader, AppShell)
- UI components: `Cortex{Element}` (e.g., CortexButton, CortexCommandButton)

## Development Integration

### Viewing Documentation
- **In Repository**: Browse markdown files directly in GitHub/IDE
- **Local Development**: Use markdown preview or documentation viewer
- **Hosted Docs** (Optional): Navigate to `/docs` route if integrated

### Maintenance Process
1. Update documentation alongside UI changes
2. Maintain cross-references between portal-ui-map.md and wireframes
3. Track changes in changelog with dated entries
4. Review for accuracy during design/product reviews

### Firebase Integration
- Documentation files are source-controlled in `hosting/documentation/`
- Optional docs viewer served via Next.js route without affecting main app
- Static assets and metadata cached appropriately per firebase.json

## Quick Start

1. **Browse Components**: Start with [Component Architecture](02-component-architecture.md)
2. **Review Layouts**: Examine [Page Layout Wireframes](03-page-layouts/) for specific tabs
3. **Understand Flows**: Study [Workflow Maps](04-workflows/) for user journeys  
4. **Reference Details**: Use [Component Inventory](05-component-inventory.md) and [Route Mapping](06-route-mapping.md) for implementation details

## Related Resources

- **[Complete Portal UI Map](../docs/portal-ui-map.md)** - Comprehensive workflow and AI enhancement documentation
- **[Component Source Code](../components/)** - React component implementations  
- **[Firebase Configuration](../../firebase.json)** - Hosting and deployment settings
- **[Project README](../../README.md)** - Overall project documentation

---

*Last Updated: 2025-01-07*  
*This documentation is maintained alongside the codebase and should be updated when UI changes occur.*