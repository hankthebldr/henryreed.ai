# Route Mapping & URL Hierarchy

## Overview

This document maps all Next.js routes, URL patterns, and navigation logic for the Cortex DC Portal, showing the complete hierarchical structure from root paths to deeply nested entity-specific routes.

**Framework**: Next.js App Router  
**Base URL**: `/gui` (application root)  
**Reference**: [Navigation Structure](01-navigation-structure.md) | [Portal UI Map](../docs/portal-ui-map.md)

## Route Hierarchy Structure

### Level 1: Application Root Routes

```
/ (root)
├── /                           → Landing/auth page
├── /gui                        → Main application (default tab: dashboard)
├── /terminal                   → Terminal interface (separate from GUI)
├── /docs                       → Documentation viewer (optional)
├── /api/[...routes]           → API endpoints (serverless functions)
└── /[...legacy]               → Catch-all for legacy route redirects
```

### Level 2: Primary Tab Routes

```
/gui (Main Application Shell)
├── /gui                        → Dashboard (default)
├── /gui/dashboard             → Dashboard (explicit)
├── /gui/pov                   → POV Management
├── /gui/trr                   → TRR & Requirements  
├── /gui/xsiam                 → Platform Health
├── /gui/ai                    → AI Assistant
├── /gui/data                  → Customer Analytics
├── /gui/creator               → Demo Builder
├── /gui/scenarios             → Content Library
└── /gui/admin                 → DC Management (admin only)
```

### Level 3: Sub-Tab & Action Routes

#### POV Management Routes (`/gui/pov`)
```
/gui/pov
├── /gui/pov                    → POV Overview (default)
├── /gui/pov?tab=create        → POV Creation Form
├── /gui/pov?tab=templates     → Template Gallery
├── /gui/pov?tab=analytics     → POV Analytics Dashboard
├── /gui/pov?tab=archive       → Archived POVs
├── /gui/pov?action=create     → Direct to creation (from quick actions)
├── /gui/pov?filter=active     → Filtered POV list
├── /gui/pov?sort=date&order=desc → Sorted POV list
└── /gui/pov/[povId]           → Individual POV Detail
```

#### TRR Management Routes (`/gui/trr`)
```
/gui/trr
├── /gui/trr                    → TRR Dashboard (default)
├── /gui/trr?tab=create        → TRR Creation Form
├── /gui/trr?tab=validate      → Bulk Validation Interface
├── /gui/trr?tab=import        → CSV Import Workflow
├── /gui/trr?tab=reports       → Quality Reports
├── /gui/trr?filter=pending    → Pending validation filter
├── /gui/trr?status=completed  → Completed TRRs filter
├── /gui/trr?action=review     → Direct to review mode
└── /gui/trr/[trrId]           → Individual TRR Detail
```

#### AI Assistant Routes (`/gui/ai`)
```
/gui/ai
├── /gui/ai                     → Chat Interface (default)
├── /gui/ai?tab=insights       → AI Insights Dashboard
├── /gui/ai?tab=templates      → Prompt Templates Library
├── /gui/ai?tab=history        → Session History
├── /gui/ai?context=global     → Global context mode
├── /gui/ai?context=customer&id=[customerId] → Customer context
├── /gui/ai?context=pov&id=[povId] → POV context
├── /gui/ai?context=trr&id=[trrId] → TRR context
├── /gui/ai?action=analyze     → Auto-start analysis
├── /gui/ai?source=dashboard   → Track entry point
└── /gui/ai/sessions/[sessionId] → Individual session detail
```

### Level 4: Entity-Specific Detail Routes

#### POV Detail Routes (`/gui/pov/[povId]`)
```
/gui/pov/[povId]
├── /gui/pov/[povId]                    → POV Overview (default)
├── /gui/pov/[povId]/requirements       → Requirements Management
├── /gui/pov/[povId]/scenarios          → Scenario Configuration
├── /gui/pov/[povId]/timeline           → Timeline & Milestones
├── /gui/pov/[povId]/team              → Team & Stakeholders
├── /gui/pov/[povId]/analytics         → POV Performance Analytics
├── /gui/pov/[povId]/documents         → Associated Documents
├── /gui/pov/[povId]/history           → Change History & Audit
├── /gui/pov/[povId]/edit              → Edit POV Configuration
├── /gui/pov/[povId]/clone             → Clone POV to New
├── /gui/pov/[povId]/archive           → Archive POV
└── /gui/pov/[povId]/share             → Share POV Externally
```

#### TRR Detail Routes (`/gui/trr/[trrId]`)
```
/gui/trr/[trrId]
├── /gui/trr/[trrId]                    → TRR Overview (default)
├── /gui/trr/[trrId]/requirements       → Detailed Requirements View
├── /gui/trr/[trrId]/validation         → Validation Details & Results
├── /gui/trr/[trrId]/history           → Validation History Timeline
├── /gui/trr/[trrId]/review            → Customer Review Interface
├── /gui/trr/[trrId]/export            → Export TRR in Multiple Formats
├── /gui/trr/[trrId]/edit              → Edit TRR Details
├── /gui/trr/[trrId]/clone             → Clone TRR
├── /gui/trr/[trrId]/archive           → Archive TRR
└── /gui/trr/[trrId]/approve           → Approval Workflow
```

#### Platform Health Detail Routes (`/gui/xsiam`)
```
/gui/xsiam
├── /gui/xsiam                          → Connection Setup (default)
├── /gui/xsiam?tab=health              → Health Dashboard
├── /gui/xsiam?tab=analytics           → Security Analytics
├── /gui/xsiam?tab=query               → XQL Query Interface
├── /gui/xsiam?view=incidents          → Incident Management View
├── /gui/xsiam/incidents/[incidentId]  → Individual Incident Details
├── /gui/xsiam/queries/[queryId]       → Saved Query Details
├── /gui/xsiam/alerts/[alertId]        → Alert Investigation
└── /gui/xsiam/reports/[reportId]      → Generated Reports
```

### Level 5: Deep Nested & Modal Routes

#### POV Requirements Deep Routes
```
/gui/pov/[povId]/requirements
├── /gui/pov/[povId]/requirements?category=security    → Security Requirements
├── /gui/pov/[povId]/requirements?category=compliance → Compliance Requirements
├── /gui/pov/[povId]/requirements?view=edit           → Edit Mode
├── /gui/pov/[povId]/requirements?action=add          → Add New Requirement
├── /gui/pov/[povId]/requirements?action=bulk         → Bulk Operations
├── /gui/pov/[povId]/requirements?export=trr          → Export to TRR
└── /gui/pov/[povId]/requirements/[requirementId]     → Individual Requirement Detail
```

#### AI Session Deep Routes
```
/gui/ai/sessions/[sessionId]
├── /gui/ai/sessions/[sessionId]                       → Session Replay (default)
├── /gui/ai/sessions/[sessionId]/transcript            → Full Transcript
├── /gui/ai/sessions/[sessionId]/actions               → Actions Taken
├── /gui/ai/sessions/[sessionId]/insights              → Generated Insights
├── /gui/ai/sessions/[sessionId]/export                → Export Session
├── /gui/ai/sessions/[sessionId]/continue              → Continue Session
└── /gui/ai/sessions/[sessionId]/share                 → Share Session
```

#### Demo Builder Deep Routes
```
/gui/creator
├── /gui/creator                                       → Creator Overview (default)
├── /gui/creator?mode=pov                             → POV Creation Mode
├── /gui/creator?mode=scenario                        → Scenario Builder
├── /gui/creator?mode=template                        → Template Builder
├── /gui/creator?mode=detection                       → Detection Engine Mode
├── /gui/creator/projects/[projectId]                 → Project Editor
├── /gui/creator/projects/[projectId]/preview         → Preview Mode
├── /gui/creator/projects/[projectId]/publish         → Publish Configuration
├── /gui/creator/templates/[templateId]               → Template Editor
└── /gui/creator/scenarios/[scenarioId]               → Scenario Configuration
```

## Query Parameter Patterns

### Standard Parameters
```
Navigation Parameters:
├── ?tab=<tabName>              → Sub-tab selection within pages
├── ?view=<viewName>            → Different views of same data
├── ?mode=<modeName>            → Operational mode (create, edit, view)
├── ?action=<actionName>        → Direct action execution
└── ?source=<sourceName>        → Track navigation origin

Filter Parameters:
├── ?filter=<filterValue>       → Single filter application
├── ?status=<statusValue>       → Status-based filtering
├── ?type=<typeValue>           → Type-based filtering
├── ?category=<categoryValue>   → Category filtering
├── ?customer=<customerId>      → Customer-specific filtering
├── ?user=<userId>              → User-specific filtering
└── ?date=<dateRange>           → Date range filtering

Sorting & Pagination:
├── ?sort=<fieldName>           → Sort field
├── ?order=<asc|desc>           → Sort direction
├── ?page=<pageNumber>          → Pagination
├── ?limit=<itemsPerPage>       → Items per page
└── ?search=<searchTerm>        → Search query

Context Parameters:
├── ?context=<contextType>      → AI context switching
├── ?id=<entityId>              → Context entity ID
├── ?scope=<scopeValue>         → Operational scope
└── ?theme=<themeValue>         → UI theme selection
```

### Complex Query Combinations
```
Multi-Parameter Examples:
├── /gui/pov?tab=create&template=financial&customer=123
├── /gui/trr?filter=pending&sort=priority&order=desc&page=2
├── /gui/ai?context=pov&id=POV-2024-001&action=analyze
├── /gui/data?customer=456&date=last30days&export=csv
├── /gui/xsiam?tab=health&view=incidents&severity=high
└── /gui/admin?tab=users&filter=active&role=dc&sort=lastLogin
```

## Route Guards & Middleware

### Authentication Guards
```
Route Protection Levels:
├── Public Routes:
│   ├── / (landing page)
│   ├── /login
│   ├── /register
│   └── /docs (if public documentation)
├── Authenticated Routes:
│   ├── /gui/** (all application routes)
│   ├── /terminal
│   └── /api/protected/**
├── Role-Based Routes:
│   ├── /gui/admin/** (admin role required)
│   ├── /gui/data/** (analytics role required)
│   └── /api/admin/** (admin API endpoints)
└── Feature-Flagged Routes:
    ├── Routes enabled/disabled by feature flags
    ├── Beta feature access control
    └── Customer tier-based access
```

### Route Middleware Chain
```typescript
// Next.js middleware execution order
export const config = {
  matcher: [
    '/gui/:path*',     // All GUI routes
    '/api/protected/:path*',  // Protected API routes
    '/admin/:path*',   // Admin routes
  ]
}

// Middleware chain:
1. Authentication check
2. Role validation
3. Feature flag evaluation  
4. Rate limiting
5. Request logging
6. Route rewriting/redirection
```

## API Route Structure

### REST API Endpoints
```
/api (Serverless Functions)
├── /api/auth
│   ├── /api/auth/login         → POST: User authentication
│   ├── /api/auth/logout        → POST: Session termination
│   ├── /api/auth/refresh       → POST: Token refresh
│   └── /api/auth/profile       → GET: User profile
├── /api/pov
│   ├── /api/pov                → GET: List POVs, POST: Create POV
│   ├── /api/pov/[id]          → GET: POV detail, PUT: Update, DELETE: Delete
│   ├── /api/pov/[id]/scenarios → GET: POV scenarios, POST: Add scenario
│   ├── /api/pov/[id]/team     → GET: Team members, PUT: Update team
│   └── /api/pov/templates     → GET: Available templates
├── /api/trr
│   ├── /api/trr               → GET: List TRRs, POST: Create TRR
│   ├── /api/trr/[id]          → GET: TRR detail, PUT: Update, DELETE: Delete
│   ├── /api/trr/[id]/validate → POST: Validate TRR
│   ├── /api/trr/bulk-validate → POST: Bulk validation
│   └── /api/trr/import        → POST: CSV import
├── /api/ai
│   ├── /api/ai/chat           → POST: Chat completion
│   ├── /api/ai/insights       → GET: Generated insights
│   ├── /api/ai/sessions       → GET: Session history
│   ├── /api/ai/sessions/[id]  → GET: Session detail
│   └── /api/ai/analyze        → POST: Content analysis
├── /api/analytics
│   ├── /api/analytics/dashboard → GET: Dashboard metrics
│   ├── /api/analytics/export   → POST: Data export
│   ├── /api/analytics/customers → GET: Customer analytics
│   └── /api/analytics/reports  → GET: Generated reports
├── /api/xsiam
│   ├── /api/xsiam/health      → GET: Health status
│   ├── /api/xsiam/query       → POST: Execute XQL query
│   ├── /api/xsiam/alerts      → GET: Alert data
│   └── /api/xsiam/incidents   → GET: Incident data
└── /api/admin
    ├── /api/admin/users       → GET: User list, POST: Create user
    ├── /api/admin/users/[id]  → GET: User detail, PUT: Update, DELETE: Delete
    ├── /api/admin/audit       → GET: Audit logs
    └── /api/admin/config      → GET: System config, PUT: Update config
```

## Deep Linking & State Preservation

### URL State Mapping
```typescript
// URL to Application State Mapping
interface URLStateMapping {
  // Tab and sub-tab state
  currentTab: string              // From pathname: /gui/{tab}
  subTab?: string                // From query: ?tab={subTab}
  
  // Entity context
  entityType?: string            // From pathname structure
  entityId?: string              // From dynamic route: [id]
  
  // View state
  view?: string                  // From query: ?view={view}
  mode?: string                  // From query: ?mode={mode}
  
  // Filters and search
  filters: FilterState           // From query parameters
  search?: string                // From query: ?search={term}
  sort: SortState               // From query: ?sort={field}&order={dir}
  pagination: PaginationState    // From query: ?page={n}&limit={n}
  
  // Context preservation
  source?: string                // From query: ?source={source}
  context?: AIContext           // From query: ?context={type}&id={id}
}
```

### Bookmarkable URLs
```
Deep Link Examples:
├── Direct Entity Access:
│   ├── /gui/pov/POV-2024-001 → Opens specific POV
│   ├── /gui/trr/TRR-2024-045/history → TRR validation history
│   └── /gui/ai/sessions/sess-123 → Specific AI session
├── Filtered Views:
│   ├── /gui/pov?filter=active&customer=123 → Customer's active POVs
│   ├── /gui/trr?status=pending&sort=priority → Pending TRRs by priority
│   └── /gui/data?export=true&date=last30days → Export setup
├── Contextual Deep Links:
│   ├── /gui/ai?context=pov&id=POV-2024-001 → AI with POV context
│   ├── /gui/creator?mode=scenario&template=ransomware → Scenario builder
│   └── /gui/admin?tab=users&filter=inactive → Inactive users
└── Workflow Continuation:
    ├── /gui/pov?tab=create&template=financial&step=3 → Resume creation
    ├── /gui/trr?tab=validate&selected=1,2,3 → Resume validation
    └── /gui/ai?session=continue&last=sess-123 → Continue AI session
```

## Route Performance & Optimization

### Code Splitting Strategy
```typescript
// Page-level code splitting
const Dashboard = lazy(() => import('../components/POVDashboard'))
const POVManagement = lazy(() => import('../components/POVProjectManagement'))
const TRRManagement = lazy(() => import('../components/ProductionTRRManagement'))

// Route-based chunking
// /gui/pov → pov-management.chunk.js
// /gui/trr → trr-management.chunk.js  
// /gui/ai → ai-assistant.chunk.js
```

### Caching Strategy
```
Route Caching Rules:
├── Static Routes (1 year):
│   ├── / → Landing page cache
│   └── /docs → Documentation cache
├── Dynamic Content (5 minutes):
│   ├── /gui/dashboard → Dashboard metrics
│   ├── /gui/pov → POV list data
│   └── /gui/trr → TRR dashboard
├── User-Specific (No cache):
│   ├── /gui/ai → AI conversations
│   ├── /api/auth/** → Authentication
│   └── /gui/admin → Admin interfaces
└── API Responses:
    ├── GET requests → 5 minute cache
    ├── POST requests → No cache
    └── Authenticated → User-specific cache
```

## Error Handling & Fallbacks

### Route Error States
```typescript
// Error boundary per route level
interface RouteErrorState {
  // 404 Not Found
  entityNotFound: '/gui/pov/INVALID-ID' → POV not found page
  
  // 403 Forbidden  
  accessDenied: '/gui/admin' → Insufficient permissions page
  
  // 500 Server Error
  serverError: '/gui/data' → Data service unavailable
  
  // Network errors
  offline: 'All routes' → Offline mode with cached data
  
  // Fallback routing
  fallback: 'Unknown routes' → Redirect to dashboard
}
```

### Fallback Routes
```
Error Fallbacks:
├── Unknown routes → Redirect to /gui (dashboard)
├── Invalid entity IDs → Return to entity list page
├── Unauthorized access → Redirect to /login with return URL
├── Network failures → Show cached data with offline indicator
└── API failures → Show error state with retry option
```

---

**Last Updated**: 2025-01-07  
**Total Routes**: 50+ unique patterns, 200+ possible URL combinations  
**Cross-References**: [Navigation Structure](01-navigation-structure.md) | [Component Architecture](02-component-architecture.md)