# GUI User Flow Documentation

This document outlines all the user flows and button interactions in the Cortex DC Portal's GUI interface. Every button has been designed with intuitive navigation and clear next actions.

## Main Navigation Tabs

The GUI interface has 6 main tabs, each with comprehensive user flows:

### 1. 📊 Dashboard (Default)
**Entry Point:** Main GUI landing page
**User Flow:**
- **Overview Cards** → Click any stat card to open the related GUI panel
- **Quick Actions** → 6 action buttons that switch to related sections or perform in-app actions
- **Recent Activity** → Click activity items to see detailed command results
- **Context Help** → View inline help or open documentation

**Button Flows:**
- New POV → Opens POV creation flow
- Run Analytics → Opens analytics dashboard
- Generate Report → Opens report builder
- Deploy Scenario → Opens scenario deploy wizard
- AI Analysis → Opens AI insights panel
- Badass Blueprint → Opens blueprint overview

### 2. 📋 TRR Management
**Entry Point:** TRR Management tab
**User Flow:** Dashboard → Create/Upload/Validate → Back to Dashboard

**Sub-Views:**
1. **Dashboard View** (Default)
   - TRR statistics overview (4 clickable cards)
   - Active TRR list with individual action buttons
   - Quick action buttons: `New TRR`, `Upload CSV`, `Analytics`

2. **Create TRR View**
   - Form-based TRR creation
   - Required fields validation
   - `Create TRR` → Executes command and returns to dashboard
   - `Cancel` → Returns to dashboard

3. **Upload CSV View**
   - Drag & drop or browse interface
   - CSV format requirements display
   - `Browse Files` → Executes `trr import --file sample.csv`
   - `Back to Dashboard` → Returns to main view

4. **Bulk Validate View**
   - Validation actions (left column)
   - Quality checks (right column)
   - All buttons execute specific TRR commands
   - `Back to Dashboard` → Returns to main view

**Button Flows:**
- All TRR action buttons trigger in-app workflows (create, upload, validate)
- Navigation is circular: Dashboard ↔ Sub-views

### 3. 🤖 AI Insights
**Entry Point:** AI Insights tab
**User Flow:** Dashboard → Chat/Analysis/Recommendations → Back to Dashboard

**Sub-Views:**
1. **AI Dashboard** (Default)
   - AI metrics overview (4 clickable insight cards)
   - Quick AI actions (4 buttons)
   - Live recommendations with Apply/Optimize buttons

2. **AI Chat**
   - Interactive chat interface with AI assistant
   - Message history and suggested prompts
   - Real-time AI responses

3. **Deep Analysis**
   - Analysis types (left column): POV, Customer Fit, Risk Assessment, etc.
   - Predictive insights (right column): Success Modeling, Timeline Optimization, etc.
   - All buttons execute `gemini` commands

4. **Recommendations**
   - Priority-based recommendation cards (High/Medium/Low)
   - Each recommendation has action buttons
   - Actions execute relevant commands or dismiss recommendations

**Button Flows:**
- AI buttons trigger in-app AI workflows (dashboard, chat, analysis, recommendations)
- Navigation: Dashboard ↔ Sub-views with "Back to Dashboard" buttons

### 4. 🛠️ Content Creator
**Entry Point:** Content Creator tab
**User Flow:** Overview → Creation Form → Back to Overview

**Sub-Views:**
1. **Creator Overview** (Default)
   - 3 main creation options: POV, Template, Scenario
   - Quick creation tools section
   - Each option leads to creation interface

2. **Creation Interface**
   - Notion-inspired block-based editor
   - Context-aware form fields
   - Save/Cancel options return to overview

**Button Flows:**
- `Create POV` → Opens POV creation form
- `Create Template` → Opens Template creation form
- `Create Scenario` → Opens Scenario creation form
- All creation buttons lead to `EnhancedManualCreationGUI`

### 5. 🔗 XSIAM Integration
**Entry Point:** XSIAM Integration tab
**User Flow:** Setup → Health/Analytics/Query tabs

**Sub-Views:**
1. **Setup Tab** (Default for new connections)
   - Credential input form (API Address, ID, Key)
   - Optional fields (Tenant Name, Region)
   - Connection testing and status display

2. **Health Tab** (Available after connection)
   - Tenant health overview cards
   - System components status
   - Key metrics display
   - Refresh buttons

3. **Analytics Tab**
   - Security analytics summary
   - Top threats analysis
   - MITRE detection coverage
   - Time range selection

4. **Query Tab**
   - XQL query editor
   - Execute/Clear buttons
   - Query results display

**Button Flows:**
- `Connect to XSIAM` → Tests connection and stores credentials
- `Disconnect` → Clears credentials and returns to setup
- All data buttons execute `xsiam-*` commands
- Tab navigation is persistent once connected

### 6. 📊 BigQuery Export
**Entry Point:** BigQuery Export tab
**User Flow:** Configuration → Export Actions → Status Monitoring

**Features:**
- Export status and queue management
- Configuration controls for data sources
- Quick and custom export options
- Export history and results

**Button Flows:**
- `Quick Export` → Executes `bq-export --quick`
- `Custom Export` → Opens configuration options
- `Clear Queue` → Executes `bq-export --clear-queue`
- Export buttons run in-app export flows

## Navigation Patterns

### Primary Navigation
- **Tab Switching:** All main tabs are accessible from any view
- **Breadcrumb Navigation:** Shows current location and path
- **Mode Switching:** Single GUI mode; no terminal switching

### Secondary Navigation
- **Back Buttons:** Every sub-view has a "← Back to [Parent]" button
- **Context Actions:** Relevant action buttons appear based on current context
- **Quick Actions:** Direct command execution buttons in each section

### Button States and Feedback
- **Loading States:** Commands show loading indicators during execution
- **Success/Error Feedback:** Toast notifications for command results
- **Disabled States:** Buttons are disabled when actions are not available
- **Hover Effects:** Visual feedback for interactive elements

## Command Integration

### Execution and Feedback
- Loading indicators for async processes
- Success/error notifications
- Data refresh after operations

### Single-Mode UX
- The app runs in GUI-only mode. Legacy terminal commands are not used in the GUI.

### Examples
- Deploy Scenario → Scenario Deploy Wizard (GUI)
- Validate TRRs → Bulk Validate View (GUI)
- Run Analytics → Analytics Dashboard (GUI)
trr-signoff create --batch

# AI Insights Commands
gemini analyze --current-pov --recommendations
gemini predict --timeline --risks
gemini generate --executive-summary
gemini deep-analysis --pov --performance

# XSIAM Integration Commands
xsiam-connect --api-address [url] --api-id [id] --api-key [key]
xsiam-health --json
xsiam-analytics --time-range 7d
xsiam-query "dataset = xdr_data | limit 10"

# BigQuery Export Commands
bq-export --quick
bq-export --time-range 7d --type povs
bq-config --show
bq-track gui_interaction dashboard_click
```

## User Experience Principles

### Intuitive Navigation
- **Clear Entry Points:** Each section has obvious starting points
- **Logical Progression:** User flows follow natural task sequences
- **Easy Return:** Users can always return to previous states
- **Context Preservation:** System remembers user's place in workflows

### Consistent Patterns
- **Button Styling:** Similar actions use consistent visual styles
- **Navigation Structure:** All sections follow similar layout patterns
- **Feedback Systems:** Consistent loading, success, and error indicators
- **Command Integration:** Uniform approach to terminal command execution

### Accessibility Features
- **Keyboard Navigation:** All interactive elements are keyboard accessible
- **Clear Labels:** Buttons have descriptive text and hover tooltips
- **Status Indicators:** Visual and text status information
- **Help Integration:** Context-sensitive help and documentation links

### Error Handling
- **Graceful Degradation:** Features work even when some services are unavailable
- **Clear Error Messages:** Specific, actionable error descriptions
- **Recovery Options:** Users can retry failed actions or return to safe states
- **Validation Feedback:** Form validation with helpful guidance

## Implementation Details

### State Management
- **Global State:** Shared application state across all components
- **Component State:** Local state for component-specific interactions  
- **Persistent State:** User preferences and connection states are preserved
- **Command Bridge:** Seamless communication between GUI and terminal modes

### Performance Optimization
- **Lazy Loading:** Heavy components load on demand
- **Command Caching:** Frequently used command results are cached
- **Async Operations:** Long-running commands don't block the UI
- **Optimistic Updates:** UI updates immediately while commands execute

### Security Considerations
- **Credential Encryption:** XSIAM credentials are encrypted in local storage
- **Command Validation:** All user inputs are validated before command execution
- **Safe Defaults:** Destructive actions require confirmation
- **Audit Logging:** All command executions are logged for security

This comprehensive user flow documentation ensures that every button and interaction in the GUI has a clear purpose and intuitive navigation path, making the Cortex DC Portal easy to use for domain consultants while maintaining full functionality and command integration.