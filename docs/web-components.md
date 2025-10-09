# Web Components Architecture - henryreed.ai

## 🧩 Overview

The henryreed.ai application features a sophisticated component architecture built with Next.js 15 App Router, React 18, TypeScript, and Tailwind CSS. This document provides comprehensive mapping of the component hierarchy, routing structure, and data flow patterns.

## 🏗️ Next.js Application Structure

```mermaid
graph TD
    Root[App Router Root] --> Login[app/page.tsx - Login/Landing]
    Root --> NotFound[app/_not-found.tsx]
    Root --> Layout[app/layout.tsx - Root Layout]
    
    Root --> GUI[app/gui/page.tsx - Main Application]
    GUI --> GUILayout[app/gui/layout.tsx - GUI Layout]
    
    Root --> Terminal[app/terminal/page.tsx]
    Root --> Content[app/content/page.tsx]
    Root --> Creator[app/creator/page.tsx]
    Root --> Docs[app/docs/page.tsx]
    Root --> AlignmentGuide[app/alignment-guide/page.tsx]
    
    Layout --> Providers[contexts/AppStateContext]
    Layout --> AuthProvider[contexts/AuthContext]
```

## 🎨 Component Hierarchy & Relationships

### **Core Application Components**

```mermaid
graph TD
    GUI[app/gui/page.tsx] --> AppShell[components/AppShell.tsx]
    AppShell --> Header[components/AppHeader.tsx]
    AppShell --> Sidebar[components/AppSidebar.tsx]
    AppShell --> MainContent[Main Content Area]
    
    MainContent --> Dashboard[components/EnhancedGUIInterface.tsx]
    MainContent --> POVMgmt[components/POVManagement.tsx]
    MainContent --> TRRMgmt[components/TRRManagement.tsx]
    MainContent --> AIAssistant[components/EnhancedAIAssistant.tsx]
    MainContent --> Terminal[components/UnifiedTerminal.tsx]
    
    Dashboard --> ModuleCards[Module Selection Cards]
    Dashboard --> QuickActions[Quick Action Buttons]
    Dashboard --> StatusIndicators[Status & Health Indicators]
```

### **POV Management Module**

```mermaid
graph TD
    POVMgmt[POVManagement.tsx] --> POVCreator[POV Creation Wizard]
    POVMgmt --> POVList[POV List View]
    POVMgmt --> POVDetails[POV Detail View]
    
    POVCreator --> StepWizard[Multi-step Wizard]
    POVCreator --> TemplateSelect[Template Selector]
    POVCreator --> Validation[Form Validation]
    
    POVList --> FilterBar[Filter & Search]
    POVList --> POVCards[POV Cards Grid]
    POVList --> Pagination[Pagination Controls]
    
    POVDetails --> Overview[POV Overview]
    POVDetails --> Timeline[Project Timeline]
    POVDetails --> Stakeholders[Stakeholder Management]
    POVDetails --> Documents[Document Library]
```

### **TRR Management Module**

```mermaid
graph TD
    TRRMgmt[TRRManagement.tsx] --> TRRCreator[components/ProductionTRRManagement.tsx]
    TRRMgmt --> TRRList[TRR List & Filter]
    TRRMgmt --> TRRProgress[components/TRRProgressChart.tsx]
    
    TRRCreator --> RequirementsForms[Requirements Forms]
    TRRCreator --> ValidationRules[Business Logic Validation]
    TRRCreator --> ExportOptions[Export Capabilities]
    
    TRRList --> SearchFilter[Search & Filter Bar]
    TRRList --> StatusColumns[Kanban-style Status Columns]
    TRRList --> BulkActions[Bulk Operations]
    
    TRRProgress --> ChartComponents[Progress Visualization]
    TRRProgress --> MetricsDisplay[KPI Metrics]
    TRRProgress --> TimelineView[Timeline Analysis]
```

### **AI Assistant Module**

```mermaid
graph TD
    AIAssistant[EnhancedAIAssistant.tsx] --> ChatInterface[Chat UI Components]
    AIAssistant --> AnalysisTools[Analysis Tools]
    AIAssistant --> RecommendationEngine[Recommendation System]
    
    ChatInterface --> MessageList[Message Thread]
    ChatInterface --> InputArea[Message Input & Controls]
    ChatInterface --> FileUpload[File Upload Handler]
    
    AnalysisTools --> POVAnalysis[POV Analysis Tool]
    AnalysisTools --> RiskAssessment[Risk Assessment Tool]
    AnalysisTools --> CompetitiveAnalysis[Competitive Analysis]
    
    RecommendationEngine --> Suggestions[Smart Suggestions]
    RecommendationEngine --> AutoComplete[Auto-completion]
    RecommendationEngine --> ContextualHelp[Contextual Help]
```

### **Terminal & Command System**

```mermaid
graph TD
    Terminal[UnifiedTerminal.tsx] --> CommandProcessor[Command Processing Engine]
    Terminal --> Display[Terminal Display]
    Terminal --> InputHandler[Input & Keyboard Handler]
    
    CommandProcessor --> Registry[lib/command-registry.ts]
    CommandProcessor --> Executor[lib/cloud-command-executor.ts]
    CommandProcessor --> Parser[Command Parser]
    
    Registry --> ScenarioCommands[lib/scenario-commands.tsx]
    Registry --> DownloadCommands[lib/download-commands.tsx]
    Registry --> GeminiCommands[lib/gemini-commands.tsx]
    Registry --> SystemCommands[System Commands]
    
    Display --> OutputRenderer[Output Rendering]
    Display --> Syntax[Syntax Highlighting]
    Display --> Scrolling[Virtual Scrolling]
```

### **Content Management System**

```mermaid
graph TD
    ContentMgmt[ContentCreatorManager.tsx] --> Editor[Content Editor]
    ContentMgmt --> Library[Content Library]
    ContentMgmt --> Templates[Template Management]
    
    Editor --> RichTextEditor[Rich Text Editor]
    Editor --> MarkdownEditor[Markdown Editor]
    Editor --> PreviewMode[Live Preview]
    
    Library --> FileManager[File Management]
    Library --> AssetBrowser[Asset Browser]
    Library --> VersionControl[Version Control]
    
    Templates --> TemplateGallery[Template Gallery]
    Templates --> CustomTemplates[Custom Templates]
    Templates --> TemplateEditor[Template Editor]
```

## 🔄 Data Flow & State Management

### **Global State Architecture**

```mermaid
graph TD
    AppStateContext[contexts/AppStateContext.tsx] --> GlobalState[Global Application State]
    AuthContext[contexts/AuthContext.tsx] --> AuthState[Authentication State]
    
    GlobalState --> POVState[POV Management State]
    GlobalState --> TRRState[TRR Management State]
    GlobalState --> UIState[UI State & Preferences]
    GlobalState --> TerminalState[Terminal Session State]
    
    AuthState --> UserProfile[User Profile Data]
    AuthState --> Permissions[Role-based Permissions]
    AuthState --> SessionManagement[Session Management]
```

### **Component Communication Patterns**

```mermaid
sequenceDiagram
    participant U as User Interaction
    participant C as Component
    participant S as State Manager
    participant A as API Service
    participant F as Firebase
    
    U->>C: User Action
    C->>S: Update State
    S->>A: API Call
    A->>F: Firebase Request
    F->>A: Response Data
    A->>S: Update State
    S->>C: Re-render
    C->>U: UI Update
```

## 🎯 Specialized Components

### **Scenario Management**

```mermaid
graph TD
    ScenarioEngine[components/EnhancedScenarioCreator.tsx] --> ScenarioWizard[Scenario Creation Wizard]
    ScenarioEngine --> ScenarioLibrary[Scenario Library]
    ScenarioEngine --> ConfigManager[Configuration Manager]
    
    ScenarioWizard --> StepByStep[Step-by-step Creator]
    ScenarioWizard --> TemplateImport[Template Import]
    ScenarioWizard --> Validation[Scenario Validation]
    
    ScenarioLibrary --> CategoryFilter[Category Filtering]
    ScenarioLibrary --> SearchEngine[Search Capabilities]
    ScenarioLibrary --> FavoriteSystem[Favorites System]
```

### **Dashboard & Monitoring**

```mermaid
graph TD
    Dashboard[components/ManagementDashboard.tsx] --> MetricCards[Metric Cards]
    Dashboard --> ChartsGraphs[Charts & Graphs]
    Dashboard --> ActivityFeed[Activity Feed]
    
    MetricCards --> KPIDisplay[KPI Displays]
    MetricCards --> Alerts[Alert System]
    MetricCards --> Trends[Trend Analysis]
    
    ChartsGraphs --> TimeSeriesCharts[Time Series Charts]
    ChartsGraphs --> PieCharts[Distribution Charts]
    ChartsGraphs --> ProgressBars[Progress Indicators]
```

### **XSIAM Integration Components**

```mermaid
graph TD
    XSIAMPanel[components/XSIAMIntegrationPanel.tsx] --> HealthMonitor[XSIAMHealthMonitor.tsx]
    XSIAMPanel --> APIConnector[API Connection Manager]
    XSIAMPanel --> ConfigPanel[Configuration Panel]
    
    HealthMonitor --> StatusIndicators[Status Indicators]
    HealthMonitor --> MetricsDisplay[Metrics Display]
    HealthMonitor --> AlertSystem[Alert System]
    
    APIConnector --> AuthHandler[Authentication Handler]
    APIConnector --> RequestManager[Request Management]
    APIConnector --> ResponseProcessor[Response Processing]
```

## 🎨 UI/UX Component Library

### **Cortex Design System**

```mermaid
graph TD
    DesignSystem[Cortex Design System] --> Buttons[CortexButton.tsx]
    DesignSystem --> Forms[Form Components]
    DesignSystem --> Layouts[Layout Components]
    DesignSystem --> Modals[Modal System]
    
    Buttons --> PrimaryButton[Primary Actions]
    Buttons --> SecondaryButton[Secondary Actions]
    Buttons --> IconButton[Icon Buttons]
    
    Forms --> InputFields[Input Components]
    Forms --> SelectDropdowns[Select Components]
    Forms --> FileUploads[File Upload Components]
    Forms --> ValidationDisplay[Validation Display]
```

### **Terminal UI Components**

```mermaid
graph TD
    TerminalUI[Terminal UI System] --> TerminalHost[components/terminal/TerminalHost.tsx]
    TerminalUI --> CleanPopout[components/ui/CleanTerminalPopout.tsx]
    TerminalUI --> ImprovedTerminal[components/ImprovedTerminal.tsx]
    
    TerminalHost --> CommandLine[Command Line Interface]
    TerminalHost --> OutputDisplay[Output Display]
    TerminalHost --> CommandHistory[Command History]
    
    CleanPopout --> PopoutWindow[Popout Window Manager]
    CleanPopout --> WindowControls[Window Controls]
    CleanPopout --> ResizeHandler[Resize Handling]
```

## 📱 Responsive Design Architecture

### **Breakpoint Strategy**

```mermaid
graph LR
    Mobile[Mobile < 768px] --> Tablet[Tablet 768px - 1024px]
    Tablet --> Desktop[Desktop 1024px - 1440px]
    Desktop --> LargeDesktop[Large Desktop > 1440px]
    
    Mobile --> MobileComponents[Mobile-optimized Components]
    Tablet --> TabletLayouts[Tablet Layouts]
    Desktop --> DesktopFeatures[Full Feature Set]
    LargeDesktop --> EnhancedUI[Enhanced UI Features]
```

### **Component Adaptivity**

```mermaid
graph TD
    ResponsiveComponent[Responsive Component] --> BreakpointDetection[Breakpoint Detection]
    ResponsiveComponent --> ConditionalRendering[Conditional Rendering]
    ResponsiveComponent --> AdaptiveLayouts[Adaptive Layouts]
    
    BreakpointDetection --> TailwindBreakpoints[Tailwind Breakpoints]
    BreakpointDetection --> CustomHooks[Custom Responsive Hooks]
    
    ConditionalRendering --> ShowHide[Show/Hide Elements]
    ConditionalRendering --> ComponentSwapping[Component Swapping]
    
    AdaptiveLayouts --> FlexGrids[Flexible Grids]
    AdaptiveLayouts --> StackedLayouts[Stacked Mobile Layouts]
```

## 🔧 Development Tools & Utilities

### **Custom Hooks & Utilities**

```mermaid
graph TD
    CustomHooks[Custom Hooks] --> AuthHooks[Authentication Hooks]
    CustomHooks --> DataHooks[Data Fetching Hooks]
    CustomHooks --> UIHooks[UI State Hooks]
    
    AuthHooks --> useAuth[useAuth Hook]
    AuthHooks --> usePermissions[usePermissions Hook]
    
    DataHooks --> usePOVData[usePOVData Hook]
    DataHooks --> useTRRData[useTRRData Hook]
    DataHooks --> useScenarios[useScenarios Hook]
    
    UIHooks --> useModal[useModal Hook]
    UIHooks --> useToast[useToast Hook]
    UIHooks --> useTheme[useTheme Hook]
```

### **Service Layer Architecture**

```mermaid
graph TD
    Services[Service Layer] --> AuthService[lib/auth-service.ts]
    Services --> FirebaseService[lib/firebase-config.ts]
    Services --> AIService[lib/gemini-ai-service.ts]
    Services --> XSIAMService[lib/xsiam-api-service.ts]
    
    AuthService --> LoginLogic[Login Logic]
    AuthService --> RoleManagement[Role Management]
    AuthService --> SessionHandling[Session Handling]
    
    FirebaseService --> DatabaseOps[Database Operations]
    FirebaseService --> StorageOps[Storage Operations]
    FirebaseService --> AuthConfig[Auth Configuration]
    
    AIService --> LLMIntegration[LLM Integration]
    AIService --> PromptEngineering[Prompt Engineering]
    AIService --> ResponseProcessing[Response Processing]
```

## 📊 Performance Optimization Strategies

### **Component Optimization**

```mermaid
graph TD
    Optimization[Component Optimization] --> LazyLoading[Lazy Loading]
    Optimization --> Memoization[React.memo & useMemo]
    Optimization --> VirtualScrolling[Virtual Scrolling]
    Optimization --> CodeSplitting[Code Splitting]
    
    LazyLoading --> RouteBasedSplitting[Route-based Splitting]
    LazyLoading --> ComponentBasedSplitting[Component-based Splitting]
    
    Memoization --> PropComparisons[Prop Comparisons]
    Memoization --> ExpensiveCalculations[Expensive Calculations]
    
    VirtualScrolling --> LargeListHandling[Large List Handling]
    VirtualScrolling --> MemoryManagement[Memory Management]
```

### **Bundle Optimization**

```mermaid
graph TD
    BundleOpt[Bundle Optimization] --> ChunkStrategy[Chunk Strategy]
    BundleOpt --> TreeShaking[Tree Shaking]
    BundleOpt --> CompressionOpt[Compression Optimization]
    
    ChunkStrategy --> VendorChunk[Vendor Chunk]
    ChunkStrategy --> CommonChunk[Common Chunk]
    ChunkStrategy --> CommandsChunk[Commands Chunk]
    
    TreeShaking --> UnusedCodeElimination[Unused Code Elimination]
    TreeShaking --> SideEffectOptimization[Side Effect Optimization]
    
    CompressionOpt --> GzipCompression[Gzip Compression]
    CompressionOpt --> BrotliCompression[Brotli Compression]
```

---

*This component architecture provides a scalable, maintainable, and performant foundation for the henryreed.ai platform while ensuring excellent developer experience and user interface quality.*