# Dashboard Page Layout

## Overview

The Dashboard serves as the primary entry point and navigation hub for the Cortex DC Portal. It provides an at-a-glance view of engagement metrics, recent activity, and quick access to key workflows across all portal functions.

**Component**: `POVDashboard`  
**Route**: `/gui` (default) | `/gui/dashboard`  
**Access**: All authenticated users  
**Reference**: [Portal UI Map - Dashboard](../../docs/portal-ui-map.md#1--dashboard-dashboard)

## Page Wireframe

### Full Page Layout
```
┌─ Application Header ────────────────────────────────────────────────┐
│ [🏠 Cortex] [User: John Smith ▼] [🔔 3] [⚙️ Settings] [❓ Help] [🚪] │
├─ Primary Tab Navigation ──────────────────────────────────────────┤
│ [📊 Dashboard]* [🎯 POV] [📋 TRR] [🔍 Health] [🤖 AI] [📈 Data] [🔧] [🚀] [⚙️] │
├─ Breadcrumb Navigation ───────────────────────────────────────────┤
│ Home › Dashboard                                                   │
├─ Hero Section ────────────────────────────────────────────────────┤
│ Welcome back, John! Your POV win rate: 89% ⬆ (+5% this month)      │
│ ┌─ Quick Stats Carousel ──────────────────────────────────────────┐ │
│ │ 🎯 12 Active POVs | 📊 47 Scripts | ✅ 89% TRR Success | 💰 54% │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─ Main Content Area ────────────────────────────────────────────────┤
│ ┌─ Metrics Grid (2x2) ──────────┐ ┌─ Activity & Actions Panel ───┐ │
│ │ ┌─ Active POVs ─────┐ ┌─ Det─┐ │ │ ┌─ Recent Activity ────────┐ │ │
│ │ │ 12 POVs           │ │ 47   │ │ │ │ 📋 TRR-2024-045         │ │ │
│ │ │ ↗ +15% this month │ │ New  │ │ │ │    Validated (2h ago)   │ │ │
│ │ │ [View All POVs]   │ │ [↗]  │ │ │ │ 🎯 POV-2024-001         │ │ │
│ │ └───────────────────┘ └──────┘ │ │ │    Completed (4h ago)   │ │ │
│ │ ┌─ TRR Success ─────┐ ┌─ Cost─┐ │ │ │ 🔧 Detection Script     │ │ │
│ │ │ 89% Success       │ │ 54%  │ │ │ │    Deployed (1d ago)    │ │ │
│ │ │ 23 pending review │ │ vs   │ │ │ │ [View All Activity →]   │ │ │
│ │ │ [Review Pending]  │ │ comp │ │ │ └─────────────────────────┘ │ │
│ │ └───────────────────┘ └──────┘ │ │ ┌─ Quick Actions ─────────┐ │ │
│ └───────────────────────────────┘ │ │ [🎯 New POV]            │ │ │
│                                   │ │ [📄 Upload CSV]         │ │ │
│                                   │ │ [📝 Generate Report]    │ │ │
│                                   │ │ [🤖 AI Analysis]        │ │ │
│                                   │ │ [🔧 Detection Engine]   │ │ │
│                                   │ │ [🧭 Badass Blueprint]   │ │ │
│                                   │ └─────────────────────────┘ │
│                                   └───────────────────────────────┘
├─ Status Bar ──────────────────────────────────────────────────────┤
│ ✅ XSIAM Connected | 🔄 Syncing (3 pending) | 💾 Last saved: 2m ago │
└─ Footer ─────────────────────────────────────────────────────────┘
│ © 2024 Cortex | [Documentation] | [Privacy] | [Terms]            │
└───────────────────────────────────────────────────────────────────┘
```

## Hierarchical Click-Through Flows

### Level 2: Metrics Grid → Detailed Views

#### Active POVs Card Click Flow
```
Active POVs Card
├── Click "[View All POVs]" → /gui/pov (POV Management tab)
├── Click "↗ +15%" → /gui/pov?tab=analytics&metric=growth
├── Click "12 POVs" → /gui/pov?filter=active&view=list
└── Hover for tooltip → "12 active POVs across 8 customers"

Auto-navigation Result:
Dashboard → POV Management Tab
├── POV Overview sub-tab loads with active filter applied
├── Breadcrumb: Home › Dashboard › POV Management
├── Focus on Active POVs table with 12 items highlighted
└── [← Back to Dashboard] button in header
```

#### TRR Success Card Click Flow  
```
TRR Success Card
├── Click "[Review Pending]" → /gui/trr?filter=pending&action=review
├── Click "89% Success" → /gui/trr?tab=reports&metric=success_rate
├── Click "23 pending" → /gui/trr?tab=validate&status=pending
└── Hover → "23 TRRs awaiting validation by team leads"

Auto-navigation Result:
Dashboard → TRR Management Tab
├── Bulk Validate sub-tab opens with pending TRRs filtered
├── 23 TRRs pre-selected for batch validation
├── Validation controls activated and ready
└── Context preserved: "From Dashboard - Pending Review"
```

### Level 3: Activity Feed → Entity Details

#### Activity Item Deep Dive
```
Activity Item: "POV-2024-001 Completed (4h ago)"
├── Click Activity Item → Activity Detail Modal opens
│   ├── Modal Content:
│   │   ├── POV Title: "Financial Services Security Assessment"
│   │   ├── Customer: "First National Bank"
│   │   ├── Completion Details: "All objectives met, 95% customer satisfaction"
│   │   ├── Key Metrics: "6 scenarios completed, 2 week timeline"
│   │   └── Next Steps: "Customer review scheduled for tomorrow"
│   ├── Modal Actions:
│   │   ├── [View POV Details] → /gui/pov/POV-2024-001
│   │   ├── [Generate Report] → /gui/data?filter=POV-2024-001&action=report
│   │   ├── [Create Follow-up] → /gui/pov?action=create&template=follow-up&customer=first-national
│   │   ├── [AI Analysis] → /gui/ai?context=pov&id=POV-2024-001&action=completion-analysis
│   │   └── [Share Success] → Email/Slack integration modal
│   └── [Close Modal] | [Next Activity] | [Previous Activity]
└── Modal Actions Navigation:
    ├── [View POV Details] → Closes modal → Navigates to POV detail page
    ├── [Generate Report] → Closes modal → Opens Customer Analytics with filters
    ├── [Create Follow-up] → Closes modal → POV creation form with customer pre-filled
    └── [AI Analysis] → Closes modal → AI Assistant with POV context loaded
```

### Level 4: Quick Actions → Cross-Tab Workflows

#### New POV Quick Action Flow
```
[🎯 New POV] Button Click:
├── Immediate Navigation → /gui/pov?tab=create&source=dashboard
├── POV Management Tab Loads:
│   ├── Create POV sub-tab auto-selected
│   ├── Template selection interface displayed
│   ├── Breadcrumb: Home › Dashboard › POV Management › Create POV
│   └── Context indicator: "Started from Dashboard quick action"
├── Template Selection (Level 5):
│   ├── [Financial Services POV] → Pre-configured template form
│   ├── [Healthcare POV] → HIPAA-focused template form  
│   ├── [Manufacturing POV] → Industrial security template form
│   └── [Custom POV] → Blank creation form
└── Form Completion Flow (Level 6):
    ├── Template loads → Form fields auto-populated
    ├── Required fields highlighted: POV Name, Customer, Timeline
    ├── Optional sections: Objectives, Success Criteria, Team Members
    ├── Submit Actions:
    │   ├── [Save Draft] → Saves and returns to POV overview
    │   ├── [Create & Start] → Creates POV and opens POV detail page
    │   └── [Create & New] → Creates POV and resets form for another
    └── Success Flow:
        ├── POV created with ID: POV-2024-xyz
        ├── Success notification: "POV created successfully"
        ├── Options: [View POV] | [Back to Dashboard] | [Create Another]
        └── Dashboard updated with new POV in Active list
```

#### AI Analysis Quick Action Flow
```
[🤖 AI Analysis] Button Click:
├── Context Detection → Dashboard state analyzed
├── Navigation → /gui/ai?action=analyze&source=dashboard&context=global
├── AI Assistant Tab Loads:
│   ├── Chat interface opens with system message
│   ├── Context set to "Global Dashboard Analysis"
│   ├── Pre-populated prompt suggestions based on current metrics:
│   │   ├── "Analyze POV performance trends and recommend improvements"
│   │   ├── "Review pending TRRs and identify bottlenecks" 
│   │   ├── "Generate customer engagement strategy recommendations"
│   │   └── "Assess current portfolio risk and opportunities"
│   └── Auto-initiated analysis (if configured):
│       ├── AI immediately processes dashboard metrics
│       ├── Generates summary of current status
│       ├── Provides 3-5 actionable recommendations
│       └── Offers execution buttons for each recommendation
├── AI Response Structure:
│   ├── Summary: "Based on your current dashboard metrics..."
│   ├── Key Insights:
│   │   ├── "POV win rate trending up (+5% this month)"
│   │   ├── "TRR validation queue growing (23 pending items)"
│   │   └── "Detection script deployment acceleration opportunity"
│   ├── Recommendations:
│   │   ├── [Execute: Schedule TRR review session] → Calendar integration
│   │   ├── [Navigate: Review high-priority POVs] → /gui/pov?priority=high
│   │   └── [Create: Customer expansion proposal] → /gui/pov?action=expansion
│   └── Follow-up: "Would you like me to set up monitoring for any of these metrics?"
└── Action Execution Examples:
    ├── [Execute: Schedule TRR review] → Calendar modal opens with suggested times
    ├── [Navigate: Review POVs] → POV Management opens with priority filter
    └── [Create: Expansion proposal] → POV creation form with expansion template
```

### Level 5: Activity Feed Filters & Views

#### "View All Activity" Deep Dive
```
[View All Activity →] Click:
├── Navigation → /gui/dashboard?view=activity&expanded=true
├── Dashboard Layout Changes:
│   ├── Activity Feed expands to full-width
│   ├── Quick Actions panel minimizes to sidebar
│   ├── Metrics grid moves to header summary bar
│   └── Activity-focused interface loads
├── Extended Activity Interface:
│   ├── Activity Filters:
│   │   ├── Type: {All | POV | TRR | Detection | Platform | User}
│   │   ├── Time Range: {Last Hour | Today | Week | Month | Custom}
│   │   ├── User: {All Users | My Activity | Team Activity}
│   │   └── Customer: {All Customers | Select Customer}
│   ├── Activity List (Paginated):
│   │   ├── Enhanced activity cards with more details
│   │   ├── Grouping options: By time, by type, by customer
│   │   ├── Bulk actions: Export selected, Mark reviewed
│   │   └── Real-time updates with notification badges
│   ├── Activity Detail Panel:
│   │   ├── Selected activity details on right side
│   │   ├── Related activities timeline
│   │   ├── Affected entities and relationships
│   │   └── Available actions for the selected activity
│   └── Activity Analytics:
│       ├── Activity volume trends (chart)
│       ├── Most active users and customers
│       ├── Activity types distribution
│       └── Performance metrics per activity type
└── Return Navigation:
    ├── [← Back to Dashboard] → /gui/dashboard (standard view)
    ├── URL breadcrumb shows: Home › Dashboard › Activity Feed
    └── State preservation: filters and selections maintained
```

## Component Hierarchy

### Primary Components
```
POVDashboard
├── DashboardHeader
│   ├── WelcomeMessage
│   │   ├── Props: { userName, successRate, trend }
│   │   └── Events: { onStatsClick }
│   └── QuickStatsCarousel
│       ├── Props: { stats: StatsItem[] }
│       └── State: { currentSlide, autoRotate }
├── MetricsGrid
│   ├── MetricCard (Active POVs)
│   │   ├── Props: { title, value, trend, actions }
│   │   ├── State: { loading, data }
│   │   └── Events: { onCardClick, onActionClick }
│   ├── MetricCard (Detection Scripts)
│   ├── MetricCard (TRR Success)
│   └── MetricCard (Cost Savings)
├── ContentArea
│   ├── ActivityFeed
│   │   ├── Props: { activities, filters, pagination }
│   │   ├── State: { loading, selectedActivity, expandedView }
│   │   ├── Components:
│   │   │   ├── ActivityFilters
│   │   │   ├── ActivityList
│   │   │   ├── ActivityItem
│   │   │   └── ActivityDetailModal
│   │   └── Events: { onActivityClick, onFilterChange, onViewAll }
│   └── QuickActionsPanel
│       ├── Props: { actions: ActionItem[], userRole }
│       ├── Components:
│       │   ├── ActionButton (6 quick actions)
│       │   └── AdvancedActionsDropdown
│       └── Events: { onActionClick, onAdvancedAction }
└── DashboardFooter
    ├── StatusBar
    │   ├── Props: { connectionStatus, syncStatus, lastSaved }
    │   └── State: { realTimeUpdates }
    └── AppFooter
        ├── Props: { links, version }
        └── Events: { onLinkClick }
```

### State Management
```
DashboardState
├── metrics: MetricsData
│   ├── povs: { total: 12, trend: '+15%' }
│   ├── scripts: { total: 47, new: 3 }
│   ├── trrSuccess: { rate: 89, pending: 23 }
│   └── costSavings: { percentage: 54, comparison: 'vs competitors' }
├── activities: ActivityData
│   ├── recentActivities: Activity[]
│   ├── filters: ActivityFilters
│   ├── pagination: PaginationState
│   └── expandedView: boolean
├── quickActions: ActionData
│   ├── availableActions: QuickAction[]
│   ├── userPermissions: Permission[]
│   └── actionHistory: ActionHistory[]
└── ui: UIState
    ├── loading: { metrics: boolean, activities: boolean }
    ├── errors: { [key: string]: Error }
    └── notifications: Notification[]
```

## Responsive Behavior

### Desktop (> 1024px)
- Full two-column layout with metrics grid and activity panel
- All quick actions visible
- Expanded activity feed shows 8-10 items
- Hover states and tooltips fully functional

### Tablet (768px - 1024px)
- Metrics grid stacks to 2x1 layout
- Activity panel moves below metrics
- Quick actions in horizontal scroll
- Activity feed shows 5-6 items

### Mobile (< 768px)  
- Single column layout
- Metrics cards stack vertically
- Activity feed becomes primary content
- Quick actions in collapsible drawer
- Simplified activity items with tap targets

## Loading States

### Initial Page Load
```
Dashboard Loading Sequence:
├── 1. App shell loads (header, navigation, footer)
├── 2. Metrics placeholders with skeleton animation
├── 3. Activity feed shows "Loading recent activity..."
├── 4. Quick actions load based on user permissions
├── 5. Metrics data loads and populates cards
├── 6. Activity data loads and populates feed
└── 7. Real-time updates initialize
```

### Partial Loading States
```
Metric Card Loading:
├── Skeleton animation for numbers
├── Placeholder text for trends
└── Disabled state for action buttons

Activity Feed Loading:
├── "Loading activities..." message
├── Shimmer effect on activity items
└── Pagination controls disabled

Quick Action Loading:
├── Button shows spinner icon
├── "Processing..." tooltip
└── Other actions remain enabled
```

## Error States

### Data Fetch Errors
```
Metrics Load Error:
├── Error card: "Unable to load metrics"
├── Retry button: [Try Again]
├── Fallback: Show cached data with timestamp
└── User action: Refresh page or contact support

Activity Feed Error:
├── Error message: "Activity feed unavailable"  
├── Partial data: Show cached activities
├── Retry mechanism: Auto-retry every 30 seconds
└── Manual refresh: [Refresh Activity Feed]

Cross-Tab Navigation Error:
├── Error notification: "Navigation failed"
├── Fallback: Stay on current tab
├── Context preservation: Maintain user's work
└── Alternative: Direct URL navigation option
```

## Performance Considerations

### Data Loading Strategy
- Metrics cached for 5 minutes with auto-refresh
- Activity feed real-time updates via WebSocket
- Quick actions permissions cached per session
- Lazy loading for expanded activity view

### Optimization Patterns
- Virtual scrolling for large activity lists
- Debounced search and filter inputs
- Memoized metric calculations
- Background prefetch of commonly accessed pages

---

**Last Updated**: 2025-01-07  
**Component File**: [POVDashboard.tsx](../../components/POVDashboard.tsx)  
**Related**: [Navigation Structure](../01-navigation-structure.md) | [Workflow Maps](../04-workflows/)