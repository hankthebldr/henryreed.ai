# Cortex DC Portal - Complete UI Structure & Workflow Map

## Overview

This document provides a comprehensive mapping of the Cortex Domain Consultant Portal, detailing every page, component, UI element, user workflow, and AI augmentation opportunity. The portal is a 9-tab application built with React/Next.js that serves as the primary interface for domain consultants managing POVs, TRRs, and customer engagements.

**Version**: 2.5.1  
**Last Updated**: [Current Date]  
**Source of Truth**: `hosting/components/CortexGUIInterface.tsx`  

## Application Architecture

### Core Structure
- **Framework**: Next.js with React, TypeScript
- **Authentication**: Context-based auth with role-based permissions
- **State Management**: React Context API + local component state
- **Styling**: Tailwind CSS with custom Cortex theme
- **Mode**: GUI-only (no terminal mode in production UI)

### Navigation Pattern
- **Primary**: 9-tab horizontal navigation bar
- **Secondary**: Sub-tabs within components, modal forms, wizard flows  
- **Back Navigation**: "Back to Dashboard" buttons in all sub-views
- **Breadcrumbs**: Dynamic breadcrumb trail via AppStateContext

## Naming & Aliases

### Current vs Legacy Naming
| Current Tab ID | Current Name | Legacy Name (docs/gui-user-flows.md) | Component |
|----------------|--------------|---------------------------------------|-----------|
| `dashboard` | Dashboard | Dashboard | POVDashboard |
| `pov` | POV Management | *(new)* | POVProjectManagement |  
| `trr` | TRR & Requirements | TRR Management | ProductionTRRManagement |
| `xsiam` | Platform Health | XSIAM Integration | XSIAMHealthMonitor |
| `ai` | AI Assistant | AI Insights | EnhancedAIAssistant |
| `data` | Customer Analytics | BigQuery Export | BigQueryExplorer |
| `creator` | Demo Builder | Content Creator | EnhancedManualCreationGUI |
| `scenarios` | Content Library | *(new)* | UnifiedContentCreator |
| `admin` | DC Management | *(new)* | ManagementDashboard |

### User Role Access Matrix
| Tab | Admin | Manager | Senior DC | DC | Guest |
|-----|-------|---------|-----------|----|----- |
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| POV Management | ✓ | ✓ | ✓ | ✓ | ✓ |
| TRR & Requirements | ✓ | ✓ | ✓ | ✓ | ✓ |
| Platform Health | ✓ | ✓ | ✓ | ✓ | ✓ |
| AI Assistant | ✓ | ✓ | ✓ | ✓ | ✓ |
| Customer Analytics | ✓ | ✓ | ✓ | ✗ | ✗ |
| Demo Builder | ✓ | ✓ | ✓ | ✓ | ✗ |
| Content Library | ✓ | ✓ | ✓ | ✓ | ✗ |
| DC Management | ✓ | ✗ | ✗ | ✗ | ✗ |

---

## Page Structure Map

### 1. 📊 Dashboard (`dashboard`)
**Component**: `POVDashboard`  
**Route**: `/gui` (default)  
**Description**: DC engagement overview, metrics, and activity tracking

#### Layout
- **Hero Section**: Welcome banner with success rate display
- **Stats Grid**: 4 metric cards (Active POVs, Detection Scripts, TRR Success, Cost Savings)
- **Two-Column Layout**: Recent Activity (left) + Quick Actions (right)

#### UI Elements

**Stats Cards**:
- Active POVs: `12` with `+15%` trend indicator
- Detection Scripts: `47` with `New` badge
- TRR Success: `89%` with `23` pending indicator
- Cost Savings: `54%` vs competitors with ROI badge

**Recent Activity Panel**:
- Live-updating activity list with status indicators
- Activity types: POV Completed, Detection Deployed, SOAR Playbook, TRR-SDW Linked
- Timestamps and status dots (success/warning/info)
- "View All Activity →" button

**Quick Actions (6 buttons)**:
1. **New POV** (`🎯`)
   - Handler: Navigate to POV Management → Create POV form
   - Expected Outcome: Open POV creation workflow
   
2. **Upload CSV** (`📄`) 
   - Handler: File input → Navigate to TRR tab with import mode
   - Expected Outcome: TRR CSV import wizard
   
3. **Generate Report** (`📝`)
   - Handler: Navigate to Customer Analytics → Report generation
   - Expected Outcome: Report builder interface

4. **AI Analysis** (`🤖`)
   - Handler: Navigate to AI Assistant → Start analysis mode
   - Expected Outcome: AI insights and recommendations

5. **Detection Engine** (`🔧`)
   - Handler: Navigate to Demo Builder → Detection engine mode
   - Expected Outcome: Competitive detection script builder

6. **Badass Blueprint** (`🧭`)
   - Handler: Execute PDF generation with customer prompt
   - Expected Outcome: Download transformation blueprint PDF

**Advanced Actions**:
- Sync demo environment
- Export current dashboard  
- View engagement metrics
- Create Solution Design Workbook
- Open Terminal Interface (new window)

#### Workflows
**Primary Entry Points**:
- Dashboard → Quick Action → Target Tab (with action context)
- Dashboard → Recent Activity Item → Detail View
- Dashboard → Stats Card → Related Tab

**Navigation Loops**:
- Dashboard ↔ Any Tab (via navigation bar)
- Quick Action → Target Tab → Back to Dashboard

#### AI Augmentation Opportunities
- **Live Recommendations Panel**: AIAction.execute/navigate buttons for suggested next actions
- **Predictive Analytics**: "POV Success Likelihood" scoring based on current portfolio
- **Smart Notifications**: Context-aware alerts for upcoming deadlines, risks, opportunities
- **Personalized Dashboard**: AI-curated metrics and activities based on user role and recent behavior

---

### 2. 🎯 POV Management (`pov`)
**Component**: `POVProjectManagement`  
**Route**: `/gui/pov`  
**Description**: Complete POV lifecycle management and customer engagement planning

#### Layout
- **Navigation Tabs**: Dashboard, Create POV, Manage, Templates, Analytics
- **Contextual Panels**: POV overview cards, active POVs list, creation forms

#### Sub-Views

**Dashboard Tab (Default)**:
- POV Portfolio Overview with create button
- Stats grid: Total POVs, Active, Completed, Successful
- Active POVs list with management actions

**Create POV Tab**:
- **Template Selection**: 3 industry templates (Financial Services, Healthcare, Manufacturing)
- **Custom Creation Form**: POV name, customer selection, timeline, objectives
- **Template Cards**: Name, industry, timeline, scenario count, "Use Template" button

**Manage Tab**:  
- **POV Details Panel**: Name, customer, status, progress metrics
- **Scenarios Management**: Scenario list with status tracking
- **Objectives List**: Bulleted objective list with completion tracking

#### UI Elements

**POV Templates**:
1. **Financial Services Security POV** (45 days, 4 scenarios)
2. **Healthcare Compliance POV** (30 days, HIPAA focus)  
3. **Manufacturing OT Security POV** (60 days, industrial controls)

**POV Creation Form Fields**:
- POV Name (required)
- Customer Selection dropdown
- Start/End Date pickers
- Objectives list with add/remove buttons
- Success Criteria checkboxes
- Resource allocation fields
- Stakeholder mapping
- Risk assessment matrix

**Action Buttons**:
- **Create POV** → Execute POV creation, return to dashboard
- **AI Optimize** → Generate AI recommendations for selected POV
- **Use Template** → Pre-fill form with template data
- **Manage** → Switch to manage tab for selected POV

#### Workflows

**POV Creation Flow**:
1. Dashboard → "New POV" Quick Action
2. POV Management Tab (Create POV)  
3. Select Template OR Custom Creation
4. Fill form → Create POV → Success notification
5. Return to Dashboard with new POV in Active list

**POV Management Flow**:
1. Dashboard → Active POV → "Manage" button
2. POV Management Tab (Manage tab)
3. View POV details, scenarios, objectives
4. Execute management actions (update status, add notes)
5. AI Optimize → Generate recommendations → Apply actions

#### AI Augmentation Opportunities
- **AI POV Planning**: Auto-generate milestones based on customer profile and industry
- **Stakeholder Mapping**: AI-suggested key stakeholders based on company size and structure  
- **Risk Prediction**: Proactive risk identification using historical POV data
- **Success Playbooks**: Context-aware recommendations based on similar successful POVs
- **Timeline Optimization**: AI-suggested timeline adjustments based on customer maturity and scope

---

### 3. 📋 TRR & Requirements (`trr`)
**Component**: `ProductionTRRManagement`  
**Route**: `/gui/trr`  
**Description**: Technical Requirements Review and customer requirement documentation

#### Layout
- **Dashboard View**: TRR statistics, active TRR list, quick actions
- **Sub-Views**: Create TRR, Upload CSV, Bulk Validate
- **Form-based**: Requirements capture, validation workflows

#### Sub-Views

**Dashboard View (Default)**:
- TRR statistics overview (4 clickable cards)
- Active TRR list with individual action buttons  
- Quick action buttons: New TRR, Upload CSV, Analytics

**Create TRR View**:
- Form-based TRR creation with required field validation
- Create TRR → Execute command, return to dashboard
- Cancel → Return to dashboard

**Upload CSV View**:
- Drag & drop or browse file interface
- CSV format requirements display
- Browse Files → Execute `trr import --file sample.csv`
- Back to Dashboard → Return to main view

**Bulk Validate View**:
- Validation actions (left column)
- Quality checks (right column)  
- All buttons execute specific TRR commands
- Back to Dashboard → Return to main view

#### UI Elements

**TRR Statistics Cards**:
- Total TRRs
- Pending Validation  
- Completed TRRs
- Success Rate

**Action Buttons**:
- **New TRR** → Create TRR form
- **Upload CSV** → CSV import wizard
- **Bulk Validate** → Validation dashboard  
- **Analytics** → TRR performance metrics

#### Workflows

**TRR Creation Flow**:
1. Dashboard → "New TRR" action
2. Create TRR form → Fill requirements
3. Submit → Validation → Success notification
4. Return to Dashboard

**CSV Import Flow**:  
1. Upload CSV action → File selection
2. Format validation → Import processing
3. Results summary → Return to Dashboard

**Validation Flow**:
1. Bulk Validate → Validation dashboard
2. Select TRRs → Execute validation checks
3. Review results → Apply fixes
4. Return to Dashboard

#### AI Augmentation Opportunities
- **Requirements Linting**: AI detection of ambiguous, duplicate, or incomplete requirements
- **Auto-Completion**: Smart suggestions for requirement text based on industry patterns
- **Validation Intelligence**: "Explain validation failures" with auto-fix recommendations
- **Quality Scoring**: AI assessment of requirement completeness and testability
- **Template Matching**: AI-suggested requirement templates based on customer profile

---

### 4. 🔍 Platform Health (`xsiam`)
**Component**: `XSIAMHealthMonitor`  
**Route**: `/gui/xsiam`  
**Description**: Cortex platform monitoring, demo environment health, and system status

#### Layout
- **Setup Tab**: Credential configuration (first-time connection)
- **Health Tab**: Platform health overview after connection  
- **Analytics Tab**: Security analytics and threat intelligence
- **Query Tab**: XQL query interface

#### Sub-Views

**Setup Tab (Default for new connections)**:
- Credential input form (API Address, ID, Key)
- Optional fields (Tenant Name, Region)
- Connection testing and status display

**Health Tab (Available after connection)**:
- Tenant health overview cards
- System components status
- Key metrics display with refresh buttons

**Analytics Tab**:
- Security analytics summary
- Top threats analysis  
- MITRE detection coverage
- Time range selection controls

**Query Tab**:
- XQL query editor with syntax highlighting
- Execute/Clear buttons
- Query results display with export options

#### UI Elements

**Connection Form**:
- API Address (URL input)
- API ID (text input)  
- API Key (password input with show/hide)
- Connect to XSIAM button

**Health Metrics**:
- System uptime percentage
- Active incidents count
- Data ingestion rate  
- Query performance metrics

**Action Buttons**:
- **Connect to XSIAM** → Test connection, store credentials
- **Disconnect** → Clear credentials, return to setup
- **Refresh Health** → Update health metrics
- **Execute Query** → Run XQL query, display results
- **Export Results** → Download query results

#### Workflows

**Initial Setup Flow**:
1. Platform Health Tab → Setup form
2. Enter credentials → Test connection
3. Success → Switch to Health tab
4. Failure → Error message, retry option

**Health Monitoring Flow**:
1. Health Tab → Review metrics  
2. Drill down into components → Detail views
3. Refresh data → Updated metrics
4. Navigate to Analytics/Query for deeper analysis

**Query Flow**:
1. Query Tab → Enter XQL query
2. Execute → Loading indicator → Results display
3. Export results OR modify query → Re-execute

#### AI Augmentation Opportunities
- **Anomaly Detection**: AI identification of unusual patterns in health metrics
- **Root Cause Analysis**: AI-generated summaries of health degradations
- **Query Optimization**: Smart XQL query suggestions and optimization recommendations
- **Proactive Alerts**: AI-predicted system issues before they impact operations
- **Remediation Playbooks**: One-click AI-generated remediation steps for common issues

---

### 5. 🤖 AI Assistant (`ai`)
**Component**: `EnhancedAIAssistant`  
**Route**: `/gui/ai`  
**Description**: AI-powered customer engagement and POV optimization assistant

#### Layout
- **Tab Navigation**: Chat, Insights, Templates, History
- **Chat Interface**: Conversation view with message history
- **Context Controls**: Customer/POV selection, context mode switching

#### Sub-Views

**Chat Tab (Default)**:
- Interactive chat interface with AI assistant
- Message history with timestamp and context
- Input field with send button and suggested prompts
- Context switcher (Global/Customer/POV)

**Insights Tab**:
- AI-generated insights cards with priority levels
- Insight types: Opportunity, Risk, Optimization, Next Action
- Action buttons per insight (Apply, Dismiss, Learn More)
- Confidence scores and impact ratings

**Templates Tab**:
- AI prompt templates by category
- Categories: Customer Analysis, POV Planning, TRR Validation, Health Check, Competitive
- Template cards with required context indicators
- Use Template → Pre-fill chat with template prompt

**History Tab**:
- Previous conversation history
- Search and filter by date, context, topics
- Export conversations
- Clear history options

#### UI Elements

**AI Message Types**:
- `user`: User input messages
- `assistant`: AI responses with formatting
- `system`: Status and context updates

**AI Actions** (embedded in messages):
- `execute`: Run commands or processes
- `navigate`: Switch to different tabs
- `create`: Generate new entities  
- `export`: Download or save artifacts

**AI Insights Structure**:
```typescript
interface AIInsight {
  type: 'opportunity' | 'risk' | 'optimization' | 'next_action'
  title: string
  confidence: number (0-100)
  impact: 'high' | 'medium' | 'low'  
  urgency: 'immediate' | 'this_week' | 'this_month'
  actionItems: string[]
  relatedCustomers?: string[]
  relatedPOVs?: string[]
}
```

**Context Modes**:
- **Global**: System-wide insights and recommendations
- **Customer**: Customer-specific analysis and suggestions  
- **POV**: POV-specific optimization and guidance

#### Workflows

**Chat Interaction Flow**:
1. AI Assistant Tab → Chat interface
2. Select context mode (Global/Customer/POV)
3. Type message OR select suggested prompt
4. Send → AI processing → Response with actions
5. Click action buttons → Execute/Navigate/Create/Export

**Insights Review Flow**:
1. Insights Tab → Review insight cards
2. Filter by priority/type → Focus on relevant insights
3. Click insight actions → Apply recommendations  
4. Navigate to related tabs → Execute suggested actions

**Template Usage Flow**:
1. Templates Tab → Browse categories
2. Select template → Review required context
3. Use Template → Pre-fill chat prompt
4. Modify prompt → Send → AI response

#### AI Augmentation Opportunities
- **Multi-Modal Input**: Voice commands, document upload, screenshot analysis
- **Proactive Insights**: Background processing to surface relevant insights
- **Learning Feedback**: AI model improvement based on user actions and outcomes
- **Integration Actions**: Direct integration with POV, TRR, and XSIAM workflows
- **Batch Operations**: AI-suggested bulk actions across multiple entities

---

### 6. 📈 Customer Analytics (`data`)
**Component**: `BigQueryExplorer`  
**Route**: `/gui/data`  
**Description**: Customer data analysis and engagement metrics platform

#### Layout
- **Export Controls**: Quick export, custom export configuration
- **Queue Management**: Export status and queue monitoring
- **Results Display**: Export history and downloadable artifacts

#### UI Elements

**Export Options**:
- **Quick Export**: Pre-configured standard export  
- **Custom Export**: Configurable data sources and time ranges
- **Scheduled Exports**: Automated recurring exports

**Queue Management**:
- Export status indicators (Pending, Processing, Complete, Failed)
- Queue position and estimated completion time
- Clear Queue button for failed/cancelled exports

**Export Configuration**:
- Data source selection checkboxes
- Time range picker (Last 7 days, 30 days, custom)
- Format selection (CSV, JSON, Excel)
- Delivery options (Download, Email, Cloud Storage)

#### Workflows

**Quick Export Flow**:
1. Customer Analytics Tab → Quick Export button
2. Processing indicator → Success notification  
3. Download link → File download

**Custom Export Flow**:
1. Custom Export → Configuration panel
2. Select data sources, time range, format
3. Execute export → Queue monitoring
4. Complete → Download results

**Queue Management Flow**:
1. Monitor export queue → Status updates
2. Clear failed exports → Queue cleanup
3. Retry failed exports → Re-queue processing

#### AI Augmentation Opportunities
- **Prompt-to-Query**: Natural language to SQL/XQL translation
- **Anomaly Detection**: AI identification of unusual patterns in customer data
- **Export Recommendations**: Smart suggestions for relevant data exports
- **Predictive Analytics**: Forecasting customer behavior and engagement trends
- **Automated Insights**: AI-generated summaries and insights from export data

---

### 7. 🔧 Demo Builder (`creator`)
**Component**: `EnhancedManualCreationGUI`  
**Route**: `/gui/creator`  
**Description**: Custom demo scenarios and competitive positioning content creation

#### Layout  
- **Creator Overview**: Main creation options (POV, Template, Scenario)
- **Creation Interface**: Notion-inspired block-based editor
- **Context Forms**: Customer-aware form fields and templates

#### Sub-Views

**Creator Overview (Default)**:
- 3 main creation options with descriptions
- Quick creation tools section
- Recent creations list

**Creation Interface**:
- Block-based editor with rich formatting
- Context-aware field suggestions
- Save/Cancel options return to overview
- Version control and collaboration features

#### UI Elements

**Creation Options**:
- **Create POV** → POV creation form with template options
- **Create Template** → Reusable template builder  
- **Create Scenario** → Custom scenario configuration

**Block Editor Components**:
- Text blocks with markdown support
- Image/video embed blocks
- Code snippet blocks
- Table/chart blocks
- Template variable blocks

#### Workflows

**Content Creation Flow**:
1. Demo Builder Tab → Creator overview
2. Select creation type → Block editor interface
3. Build content with blocks → Save/Preview
4. Publish → Return to overview

**Template Creation Flow**:
1. Create Template → Template builder
2. Define variables and placeholders
3. Set template metadata → Save template
4. Template available in other workflows

#### AI Augmentation Opportunities
- **Content Generation**: AI-generated scenario text based on customer profile
- **Competitive Intelligence**: AI-curated competitive positioning content
- **Block Suggestions**: Smart recommendations for next content blocks
- **Style Consistency**: AI enforcement of brand voice and tone guidelines
- **Content Optimization**: AI suggestions for improving engagement and clarity

---

### 8. 🚀 Content Library (`scenarios`)
**Component**: `UnifiedContentCreator` (mode="unified")  
**Route**: `/gui/scenarios`  
**Description**: Pre-built demo scenarios, competitive battlecards, and engagement content

#### Layout
- **Browse Interface**: Searchable grid of content cards
- **Filter Sidebar**: Category, industry, use case filters  
- **Content Preview**: Modal preview with metadata
- **Deploy Wizard**: Scenario deployment configuration

#### UI Elements

**Content Cards**:
- Scenario thumbnail and title
- Industry tags and difficulty indicators
- Usage metrics (views, deployments)
- Action buttons (Preview, Deploy, Customize)

**Search and Filter**:
- Global search bar with keyword highlighting
- Filter by industry, use case, complexity
- Sort by popularity, date, relevance

**Deployment Options**:
- Target environment selection
- Customer-specific customization
- Scheduling options
- Rollback configuration

#### Workflows

**Content Discovery Flow**:
1. Content Library Tab → Browse interface
2. Search/filter content → Review results
3. Preview content → Detailed view  
4. Deploy OR Customize → Configuration wizard

**Deployment Flow**:  
1. Select scenario → Deploy button
2. Configuration wizard → Target settings
3. Confirm deployment → Processing
4. Success notification → Monitor deployment

#### AI Augmentation Opportunities
- **Semantic Search**: AI-powered content discovery with embeddings
- **Similarity Clustering**: AI grouping of related content
- **Personalization**: AI-curated content recommendations per user
- **Customer Optimization**: "Optimize for this customer" tailoring
- **Content Insights**: AI analysis of content performance and engagement

---

### 9. ⚙️ DC Management (`admin`)
**Component**: `ManagementDashboard`  
**Route**: `/gui/admin`  
**Description**: Domain consultant team management and engagement oversight  
**Access**: Admin role only

#### Layout
- **Tab Navigation**: Overview, User Management, Analytics, Activity Feed, System Health, Settings
- **Metrics Dashboard**: System-wide performance indicators
- **Management Controls**: User administration and system configuration

#### Sub-Views

**Overview Tab (Default)**:
- Key metrics grid (Total Users, Active Users, TRR Volume, System Health)
- Feature adoption tracking
- Most active users leaderboard

**User Management Tab**:
- User list with roles and permissions
- Add/edit/deactivate user controls
- Role assignment and permission matrix

**Analytics Tab**:
- Detailed performance analytics
- User engagement metrics
- System utilization reports

**Activity Feed Tab**:
- Real-time user activity monitoring  
- Audit log with filtering options
- Security event tracking

**System Health Tab**:
- Infrastructure monitoring
- Performance metrics
- Error tracking and alerting

**Settings Tab**:
- System configuration options
- Feature flag management
- Integration settings

#### UI Elements

**System Metrics Cards**:
- Total Users with new user indicator
- Active Users with engagement rate
- TRR Volume with completion ratio
- System Health with uptime percentage

**User Management Table**:
- User profiles with photos and details
- Role badges and permission indicators  
- Action buttons (Edit, Deactivate, Impersonate)

**Feature Flags**:
- Toggle switches for system features
- Impact assessment indicators
- Rollout percentage controls

#### Workflows

**User Management Flow**:
1. DC Management Tab → User Management
2. Add User → User creation form
3. Set roles/permissions → Save user
4. Monitor user activity → Adjust permissions

**System Configuration Flow**:
1. Settings Tab → Feature flags
2. Toggle features → Impact review
3. Confirm changes → Apply settings
4. Monitor system performance

#### AI Augmentation Opportunities
- **Workload Balancing**: AI recommendations for optimal task distribution
- **Performance Prediction**: AI forecasting of user performance and capacity
- **Risk Assessment**: AI identification of potential team or system risks
- **Onboarding Optimization**: AI-personalized onboarding workflows
- **Capacity Planning**: AI analysis of team capacity vs. demand trends

---

## User Experience Flows

### End-to-End Workflow Examples

#### 1. New POV Creation Workflow
**Trigger**: Domain consultant needs to create a new POV for a customer

**Step-by-Step Flow**:
1. **Dashboard** → User clicks "New POV" quick action (`🎯`)
2. **Navigation Event** → `navigate-to-tab` event with `{ tabId: 'pov', action: 'create-pov' }`
3. **POV Management** → Tab switches, Create POV sub-tab activated
4. **Template Selection** → User browses 3 industry templates OR clicks "Create Custom POV"
5. **Form Completion** → User fills POV name, selects customer, sets timeline, adds objectives
6. **Validation** → Form validates required fields (name, customer)
7. **Creation** → `handleCreatePOV()` executes, calls `dcAPIClient.createPOV()`
8. **Success Response** → Success notification, form resets, returns to dashboard
9. **Dashboard Update** → New POV appears in Active POVs list with "planning" status

**Expected Outcomes**:
- POV created in system with structured metadata
- Customer engagement formally tracked
- Timeline and milestones established
- Success notification provides confidence
- User returned to familiar dashboard view

**AI Enhancement**: AI could suggest optimal timeline based on customer maturity, recommend relevant scenarios from successful POVs, and auto-populate stakeholder contacts.

#### 2. TRR Validation Workflow  
**Trigger**: Domain consultant needs to validate multiple TRRs before customer review

**Step-by-Step Flow**:
1. **Dashboard** → User sees TRR stats showing pending validations
2. **Navigation** → User clicks TRR & Requirements tab
3. **TRR Dashboard** → Shows pending TRR count, validation queue
4. **Bulk Validate** → User clicks "Bulk Validate" action
5. **Validation Interface** → Left column shows validation actions, right column shows quality checks
6. **Selection** → User selects TRRs for validation via checkboxes
7. **Execution** → User clicks validation buttons, executes TRR-specific commands
8. **Results Review** → System shows validation results, highlights issues
9. **Fix Application** → User applies suggested fixes or marks issues resolved
10. **Return** → "Back to Dashboard" returns to TRR main view with updated stats

**Expected Outcomes**:
- TRRs validated with clear pass/fail status
- Quality issues identified and resolved
- Customer-ready documentation produced
- Validation history tracked for audit

**AI Enhancement**: AI could explain validation failures in plain language, suggest auto-fixes for common issues, and predict which requirements are most likely to need revision.

#### 3. AI-Assisted Customer Analysis
**Trigger**: Domain consultant preparing for customer engagement needs insights

**Step-by-Step Flow**:
1. **Dashboard** → User clicks "AI Analysis" quick action (`🤖`) 
2. **AI Assistant** → Tab switches with `{ action: 'start-analysis' }` context
3. **Context Selection** → User switches to "Customer" mode, selects specific customer
4. **Analysis Request** → User types "Analyze customer fit and readiness for POV expansion"
5. **AI Processing** → Assistant processes customer profile from dcContextStore
6. **Insight Generation** → AI returns structured insights with confidence scores
7. **Action Items** → AI provides specific action buttons (AIAction.execute, AIAction.navigate)
8. **Action Execution** → User clicks "Schedule expansion discussion" → Creates calendar event
9. **Follow-up** → AI provides related recommendations and next steps

**Expected Outcomes**:
- Comprehensive customer analysis with actionable insights
- Specific next actions with clear business rationale  
- Context-aware recommendations based on customer data
- Seamless integration with other system workflows

**AI Enhancement**: Current AI features include confidence scoring, impact assessment, and actionable recommendations. Could be enhanced with predictive modeling and integration with external customer intelligence.

#### 4. Platform Health Monitoring
**Trigger**: System alerts indicate potential XSIAM performance issues

**Step-by-Step Flow**:
1. **Alert Reception** → Dashboard shows health indicator change
2. **Platform Health** → User navigates to XSIAM tab
3. **Health Overview** → Tenant health cards show degraded metrics
4. **Deep Dive** → User clicks Analytics tab for detailed analysis  
5. **Query Investigation** → User switches to Query tab, runs diagnostic XQL
6. **Root Cause** → Query results reveal high data ingestion rate causing latency
7. **Resolution** → User executes remediation playbook (could be AI-suggested)
8. **Monitoring** → User returns to Health tab to monitor recovery
9. **Documentation** → Incident logged for future reference

**Expected Outcomes**:
- Rapid identification of platform issues
- Data-driven root cause analysis
- Quick resolution with minimal customer impact
- Knowledge capture for prevention

**AI Enhancement**: AI could provide automatic root cause analysis, suggest optimal XQL queries for investigation, and recommend preventive measures based on historical patterns.

### Navigation Patterns

#### Primary Navigation
- **Tab Persistence**: Active tab state maintained across browser sessions
- **Deep Linking**: URLs reflect current tab and sub-view state
- **Role-Based Filtering**: Tabs automatically filtered based on user permissions
- **Context Preservation**: Sub-tab state maintained when switching between main tabs

#### Secondary Navigation  
- **Breadcrumb Trail**: Dynamic breadcrumbs show navigation path via AppStateContext
- **Back Buttons**: Every sub-view includes "← Back to [Parent]" button
- **Modal Navigation**: Forms and wizards use modal overlays to preserve context
- **Quick Actions**: Dashboard quick actions provide direct navigation to specific workflows

#### State Management
- **Loading States**: All async operations show loading indicators
- **Error Handling**: User-friendly error messages with recovery options
- **Success Feedback**: Toast notifications for completed actions
- **Optimistic Updates**: UI updates immediately while operations execute in background

---

## Command & API Integration

### GUI-Only Mode Enforcement
The production UI operates in GUI-only mode with no terminal interface exposure. All user actions map to internal APIs and command abstractions:

#### AI Commands
| UI Action | Internal Command | Expected Response |
|-----------|------------------|-------------------|
| AI Analysis | `gemini analyze --current-pov --recommendations` | Structured insights with actions |
| Timeline Prediction | `gemini predict --timeline --risks` | Timeline optimization suggestions |
| Executive Summary | `gemini generate --executive-summary` | Formatted executive report |
| Deep Analysis | `gemini deep-analysis --pov --performance` | Performance metrics and improvements |

#### XSIAM Integration
| UI Action | Internal Command | Expected Response |
|-----------|------------------|-------------------|
| Connect to XSIAM | `xsiam-connect --api-address [url] --api-id [id] --api-key [key]` | Connection status and tenant info |
| Health Check | `xsiam-health --json` | JSON health metrics |
| Analytics Query | `xsiam-analytics --time-range 7d` | Analytics dashboard data |
| XQL Execution | `xsiam-query "[XQL_QUERY]"` | Query results in structured format |

#### Analytics & Export
| UI Action | Internal Command | Expected Response |
|-----------|------------------|-------------------|
| Quick Export | `bq-export --quick` | Export job status and download link |
| Custom Export | `bq-export --time-range 7d --type povs` | Configured export execution |
| Clear Queue | `bq-export --clear-queue` | Queue cleanup confirmation |
| Track Interaction | `bq-track gui_interaction dashboard_click` | Analytics event recorded |

#### Response Handling
- **Loading States**: UI shows spinners/progress bars during command execution
- **Success Responses**: Toast notifications + data refresh + UI state updates
- **Error Responses**: User-friendly error messages + retry options + fallback states
- **Timeout Handling**: Graceful degradation with manual refresh options

---

## AI Augmentation Opportunities with Gemini

### Systematic Enhancement Strategy

#### 1. Dashboard Intelligence
**Current State**: Static metrics and manual quick actions
**AI Enhancement**:
- **Live Recommendations**: AI-generated action cards based on current portfolio state
- **Predictive Metrics**: "POV Success Likelihood" scores using historical data
- **Smart Notifications**: Context-aware alerts for deadlines, risks, opportunities
- **Personalized Views**: AI-curated dashboard based on user role and behavior patterns

**Implementation**:
```typescript
interface DashboardAI {
  liveRecommendations: AIAction[]  // execute/navigate actions
  successPredictions: { povId: string, likelihood: number, factors: string[] }[]  
  smartAlerts: { type: 'deadline' | 'risk' | 'opportunity', message: string, action: AIAction }[]
}
```

#### 2. POV Management Intelligence  
**Current State**: Template-based creation with manual optimization
**AI Enhancement**:
- **Auto-Planning**: AI milestone scheduling based on customer maturity and industry patterns
- **Stakeholder Mapping**: AI-suggested key contacts based on org charts and successful POVs
- **Risk Prediction**: Proactive identification of potential blockers using historical data
- **Success Playbooks**: Context-aware recommendations from similar successful engagements

**AITemplate Integration**:
```typescript
const povPlanningTemplate: AITemplate = {
  id: 'pov_planning_v2',
  category: 'pov_planning',
  requiredContext: ['customer_profile', 'industry_vertical', 'security_maturity'],
  prompt: "Generate optimal POV plan for {customer} in {industry} with {maturity} security maturity"
}
```

#### 3. TRR Intelligence
**Current State**: Manual requirement validation with basic checking
**AI Enhancement**:
- **Requirements Linting**: AI detection of ambiguous, duplicate, incomplete requirements
- **Auto-Completion**: Smart text suggestions based on industry requirement patterns
- **Validation Intelligence**: Plain-language explanations of failures + auto-fix suggestions
- **Quality Scoring**: AI assessment of requirement completeness and testability

**Validation Workflow**:
```typescript
interface TRRAIValidation {
  lintingResults: { requirement: string, issues: string[], confidence: number }[]
  autoFixes: { requirement: string, suggested: string, rationale: string }[]
  qualityScore: { overall: number, completeness: number, testability: number }
}
```

#### 4. Platform Health Intelligence
**Current State**: Raw metrics display with manual investigation  
**AI Enhancement**:
- **Anomaly Detection**: AI identification of unusual patterns in health metrics
- **Root Cause Analysis**: AI-generated summaries of system degradations
- **Query Optimization**: Smart XQL suggestions and performance optimization
- **Predictive Maintenance**: AI-predicted issues before they impact operations

**Health AI Integration**:
```typescript  
interface HealthAI {
  anomalies: { metric: string, severity: 'low' | 'medium' | 'high', description: string }[]
  rootCause: { issue: string, likelyCause: string, confidence: number, remediation: AIAction[] }
  queryOptimization: { original: string, optimized: string, performance_gain: string }
}
```

#### 5. Enhanced AI Assistant Capabilities
**Current State**: Basic chat with predefined insights and templates
**AI Enhancement**:
- **Multi-Modal Input**: Voice commands, document upload, screenshot analysis  
- **Proactive Insights**: Background AI processing to surface relevant recommendations
- **Learning Feedback**: Model improvement based on user actions and outcomes
- **Batch Operations**: AI-suggested bulk actions across multiple entities

**Extended AI Actions**:
```typescript
interface EnhancedAIAction extends AIAction {
  confidence: number
  impact: 'high' | 'medium' | 'low'
  urgency: 'immediate' | 'this_week' | 'this_month'
  prerequisites: string[]
  estimated_time: string
}
```

#### 6. Customer Analytics Intelligence
**Current State**: Manual export configuration and basic data analysis
**AI Enhancement**:
- **Prompt-to-Query**: Natural language to SQL/XQL translation for non-technical users
- **Insight Mining**: AI-generated summaries and insights from customer data
- **Export Optimization**: Smart recommendations for relevant data exports
- **Predictive Analytics**: Customer behavior forecasting and engagement trend analysis

#### 7. Content Intelligence
**Current State**: Static content library with manual curation
**AI Enhancement**:
- **Semantic Search**: AI-powered content discovery using embeddings
- **Content Generation**: AI-generated scenarios based on customer profiles
- **Competitive Intelligence**: AI-curated positioning content and battlecards
- **Performance Optimization**: AI analysis of content engagement and effectiveness

#### 8. Management Intelligence  
**Current State**: Basic user management and system monitoring
**AI Enhancement**:
- **Workload Optimization**: AI recommendations for task distribution and capacity planning
- **Performance Prediction**: AI forecasting of team performance and potential issues
- **Risk Assessment**: Proactive identification of team, project, or system risks
- **Resource Planning**: AI-driven capacity planning based on demand patterns

### Implementation Framework

#### AIAction Execution Pipeline
```typescript
interface AIActionPipeline {
  validate: (action: AIAction, context: DCWorkflowContext) => boolean
  execute: (action: AIAction) => Promise<AIActionResult>
  track: (action: AIAction, result: AIActionResult) => void
  learn: (feedback: UserFeedback) => void
}
```

#### Context Integration
All AI features integrate with existing context stores:
- **dcContextStore**: Customer engagements, POVs, TRRs
- **AppStateContext**: User permissions, navigation state  
- **userManagementService**: User profiles and activity tracking

#### Gemini Command Integration
AI features map to expanded gemini command set:
- `gemini analyze --context [customer|pov|trr] --type [fit|risk|opportunity]`
- `gemini generate --template [requirement|scenario|report] --context [customer_profile]`
- `gemini optimize --target [timeline|resources|content] --constraints [budget|timeline]`
- `gemini predict --metric [success|timeline|resource_needs] --horizon [30d|90d|1y]`

---

## Success Metrics & KPIs

### Workflow-Specific Outcomes

#### POV Management Success
**Business Outcomes**:
- Reduced POV creation time from hours to minutes
- Consistent milestone and success criteria definition
- Higher POV win rates through AI-optimized planning
- Improved customer engagement through structured communication

**Measurable KPIs**:  
- POV Creation Time: Target <30 minutes (vs. current 2+ hours)
- POV Win Rate: Target >85% (vs. current 70%)
- Stakeholder Engagement: Target >90% completion of planned touchpoints
- Timeline Adherence: Target >80% on-time milestone completion

**Definition of Done**:
- POV created with complete metadata (customer, timeline, objectives, success criteria)
- AI recommendations reviewed and applied where appropriate  
- Stakeholder mapping completed with engagement strategy
- Risk assessment documented with mitigation plans

#### TRR Management Success
**Business Outcomes**:
- Higher requirement validation pass rates through AI assistance
- Reduced customer review cycles through quality improvement
- Faster signoff process with clearer acceptance criteria
- Lower defect rates in delivered solutions

**Measurable KPIs**:
- First-Pass Validation Rate: Target >90% (vs. current 70%)
- Requirement Defect Rate: Target <5% (vs. current 15%)
- Customer Review Cycles: Target 1-2 cycles (vs. current 3-4)
- Time to Signoff: Target <5 days (vs. current 10+ days)

#### AI Assistant Success
**Business Outcomes**:
- Increased adoption of AI-driven recommendations
- Reduced manual research and analysis time
- Higher confidence in customer engagement strategies  
- Improved decision-making through data-driven insights

**Measurable KPIs**:
- AI Recommendation Acceptance Rate: Target >60%
- Time Saved per Analysis: Target 75% reduction
- User Satisfaction Score: Target >4.5/5.0
- Insight Actionability Rate: Target >80% of insights lead to actions

#### Platform Health Success  
**Business Outcomes**:
- Faster detection and resolution of platform issues
- Proactive problem prevention through predictive monitoring
- Reduced customer impact from system problems
- Improved confidence in demo environments

**Measurable KPIs**:
- Mean Time to Detection (MTTD): Target <15 minutes
- Mean Time to Resolution (MTTR): Target <1 hour
- Proactive Issue Prevention: Target 70% of issues caught before impact
- Customer Demo Success Rate: Target >95%

### User Experience Success

#### Usability Metrics
- **Task Completion Rate**: >95% for primary workflows
- **Error Rate**: <5% user errors in critical paths
- **Navigation Efficiency**: <3 clicks to reach any primary function
- **Learning Curve**: New users productive within 30 minutes

#### Engagement Metrics  
- **Feature Adoption**: >80% of users actively use AI features within 30 days
- **Session Duration**: Increased engagement without increased friction
- **Return Rate**: >90% of users return within 7 days of first use
- **Help/Support Requests**: <10% of users require support for basic workflows

#### Satisfaction Metrics
- **Net Promoter Score (NPS)**: Target >70 for overall application
- **User Satisfaction**: Target >4.5/5.0 for ease of use
- **AI Usefulness**: Target >4.0/5.0 for AI feature value
- **Workflow Efficiency**: Target >4.5/5.0 for time savings vs. manual processes

---

## Technical Architecture Notes

### Performance Requirements
- **Page Load Time**: <2 seconds for initial load, <1 second for tab switches
- **API Response Time**: <500ms for standard operations, <5 seconds for AI processing
- **Real-time Updates**: <100ms latency for live activity feeds
- **Offline Capability**: Basic read-only functionality when disconnected

### Security Requirements
- **Authentication**: Role-based access control with session management
- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **API Security**: All backend calls authenticated and authorized
- **Audit Logging**: Complete audit trail for all user actions and AI decisions

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Support**: Responsive design for tablet use (phone support limited)
- **Accessibility**: WCAG 2.1 AA compliance for screen readers and keyboard navigation

### Data Management
- **Context Store**: Local React context for session data
- **Persistence**: Browser localStorage for user preferences, sessionStorage for temp data
- **API Integration**: RESTful APIs for all backend operations
- **Real-time**: WebSocket connections for live updates where needed

---

## Integration Points

### External Services
- **Gemini AI**: All AI features via Google's Gemini API
- **XSIAM Platform**: Direct API integration for health monitoring and analytics
- **BigQuery**: Data export and analytics capabilities  
- **Firebase**: Authentication, hosting, and cloud storage

### Internal APIs
- **DC API Client** (`dcAPIClient`): Core business operations (POV, TRR management)
- **Context Store** (`dcContextStore`): Customer and engagement data
- **User Management** (`userManagementService`): User profiles and permissions
- **AI Client** (`dcAIClient`): AI workflow orchestration

### Event System
- **Custom Events**: Inter-component communication via browser events
- **Navigation Events**: `navigate-to-tab` for cross-tab navigation with context
- **Activity Tracking**: User action tracking for analytics and AI learning

---

## Maintenance & Evolution

### Documentation Updates
- **Component Changes**: Update page structure map when new components added
- **Workflow Changes**: Update user flows when navigation or processes change
- **AI Enhancement**: Update AI augmentation section as new capabilities added
- **API Changes**: Update command/API integration as backend evolves

### Version Control
- **Document Versioning**: Maintain version history of this mapping document
- **Change Tracking**: Track what changed, why, and impact on user experience
- **Legacy Compatibility**: Preserve links to legacy documentation during transitions

### Feedback Integration
- **User Research**: Regular user interviews to validate workflows and identify gaps
- **Usage Analytics**: Monitor actual user behavior vs. documented flows
- **Performance Monitoring**: Track KPIs and adjust workflows to improve outcomes
- **Continuous Improvement**: Regular review and enhancement of AI capabilities

---

## Related Documents

- **[GUI User Flows](./gui-user-flows.md)**: Legacy 6-tab documentation (preserved for reference)
- **[Dashboard User Stories](./user-stories/dashboard-user-stories.md)**: Detailed user stories and acceptance criteria
- **Component Documentation**: Individual component README files in `/hosting/components/`
- **API Documentation**: Backend API specifications and integration guides
- **AI Integration Guide**: Detailed Gemini AI integration patterns and best practices

---

## Appendix: Component Reference

### Core Components
- **CortexGUIInterface**: Main application shell with tab navigation
- **POVDashboard**: Dashboard overview with metrics and quick actions  
- **POVProjectManagement**: Complete POV lifecycle management
- **ProductionTRRManagement**: TRR creation, validation, and management
- **XSIAMHealthMonitor**: Platform health monitoring and analytics
- **EnhancedAIAssistant**: AI-powered insights and recommendations
- **BigQueryExplorer**: Customer analytics and data export
- **EnhancedManualCreationGUI**: Content creation and scenario building
- **UnifiedContentCreator**: Content library and scenario deployment
- **ManagementDashboard**: Admin interface for user and system management

### Utility Components  
- **AppStateContext**: Global application state management
- **AuthContext**: User authentication and permissions
- **ThemeProvider**: Cortex design system and styling
- **NotificationSystem**: Toast notifications and user feedback
- **Loading**: Loading states and progress indicators

### Service Layer
- **dcAPIClient**: Core business API operations
- **dcContextStore**: Customer and engagement data management
- **dcAIClient**: AI workflow orchestration and Gemini integration
- **userManagementService**: User management and activity tracking

---

*This document serves as the definitive guide to the Cortex DC Portal user interface, workflows, and AI enhancement opportunities. It should be updated whenever significant changes are made to the application structure or user experience.*