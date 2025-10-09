# Component Relationship Architecture

## React Component Hierarchy

This document outlines the component relationships and data flow patterns in the HenryReed.ai application, with special focus on the UserManagementPortal and other critical UI components.

```mermaid
graph TD
    A[App Root - layout.tsx] --> B[ConditionalLayout.tsx]
    B --> C[TerminalHost.tsx]
    B --> D[GUI Interface Components]
    
    C --> E[ImprovedTerminal.tsx]
    E --> F[Command Executor Engine]
    
    D --> G[AppHeader.tsx]
    D --> H[AppShell.tsx]
    D --> I[Main Content Components]
    
    I --> J[UserManagementPortal.tsx]
    I --> K[DomainConsultantWorkspace.tsx]
    I --> L[TRRManagement.tsx]
    I --> M[EnhancedContentCreator.tsx]
    I --> N[XSIAMIntegrationPanel.tsx]
    
    subgraph "User Management Hierarchy"
        J --> O[UserList Component]
        J --> P[RoleEditor Component]
        J --> Q[InviteUserForm Component]
        J --> R[UserTimelineView.tsx]
        J --> S[ManagementDashboard.tsx]
    end
    
    subgraph "Terminal Components"
        E --> T[UnifiedTerminal.tsx]
        E --> U[CleanTerminalPopout.tsx]
        T --> V[TerminalIntegrationSettings.tsx]
    end
    
    subgraph "Content Management"
        M --> W[ContentCreatorManager.tsx]
        M --> X[EnhancedManualCreationGUI.tsx]
        M --> Y[ManualCreationGUI.tsx]
    end
    
    subgraph "Scenario & TRR Components"
        L --> Z[ProductionTRRManagement.tsx]
        L --> AA[TRRProgressChart.tsx]
        L --> BB[EnhancedScenarioCreator.tsx]
        L --> CC[SDWWorkflow.tsx]
    end
```

## Component Data Flow Architecture

```mermaid
graph TD
    A[Firebase Auth State] --> B[App Context Provider]
    B --> C[User Session Management]
    C --> D[Role-Based Access Control]
    
    D --> E[Component Authorization]
    E --> F[UserManagementPortal]
    E --> G[DomainConsultantWorkspace]
    E --> H[TRRManagement]
    
    subgraph "UserManagementPortal Data Flow"
        F --> I[useEffect Hooks]
        I --> J[Firebase Functions Calls]
        J --> K[createUserProfileFn]
        J --> L[updateUserProfileFn]
        
        F --> M[Firebase Firestore Subscriptions]
        M --> N[onSnapshot users collection]
        M --> O[onSnapshot activityLogs collection]
        
        N --> P[Users State Update]
        O --> Q[Activities State Update]
        
        P --> R[User List Rendering]
        Q --> S[Activity Timeline Rendering]
    end
    
    subgraph "Cross-Component Communication"
        T[Command Executor Hook] --> U[useCommandExecutor]
        U --> V[Terminal Command Integration]
        V --> W[GUI Component Actions]
        
        X[Firebase Client Services] --> Y[Shared Service Layer]
        Y --> Z[Component Service Calls]
    end
```

## UserManagementPortal Component Breakdown

```mermaid
graph TD
    A[UserManagementPortal.tsx] --> B[Component State Management]
    B --> C[users: UserProfile[]]
    B --> D[activities: ActivityLog[]]
    B --> E[loading: boolean]
    B --> F[filters: FilterState]
    B --> G[selectedUser: UserProfile | null]
    
    A --> H[Firebase Integration]
    H --> I[functions import from ../src/lib/firebase]
    H --> J[db import from ../src/lib/firebase]
    H --> K[Firebase Functions]
    K --> L[createUserProfileFn]
    K --> M[updateUserProfileFn]
    
    A --> N[Event Handlers]
    N --> O[handleCreateUser]
    N --> P[handleUpdateUser]
    N --> Q[Search/Filter Handlers]
    
    A --> R[UI Rendering Components]
    R --> S[Header Section]
    R --> T[Stats Cards Grid]
    R --> U[Search & Filter Controls]
    R --> V[User List Table]
    R --> W[Activity Timeline]
    
    S --> X[Create User Button]
    X --> Y[UserPlus Icon]
    
    V --> Z[Status Badges]
    Z --> AA[getStatusBadge Function]
    V --> BB[Role Badges]
    BB --> CC[getRoleBadge Function]
    
    W --> DD[Activity Items]
    DD --> EE[Timestamp Formatting]
    DD --> FF[Action Icons]
```

## Shared Service Layer Architecture

```mermaid
graph TD
    A[hosting/src/lib/firebase.ts] --> B[Firebase App Initialization]
    B --> C[getApps().length ? getApp() : initializeApp()]
    
    A --> D[Service Exports]
    D --> E[auth: Auth]
    D --> F[db: Firestore]
    D --> G[functions: Functions]
    D --> H[storage: FirebaseStorage]
    
    I[Component Imports] --> J[UserManagementPortal]
    I --> K[user-management-service.ts]
    I --> L[auth-service.ts]
    I --> M[Other Service Files]
    
    J --> N[Firebase Functions Integration]
    N --> O[httpsCallable(functions, 'createUserProfile')]
    N --> P[httpsCallable(functions, 'updateUserProfile')]
    
    J --> Q[Firestore Integration]
    Q --> R[collection(db, 'users')]
    Q --> S[collection(db, 'activityLogs')]
    Q --> T[onSnapshot Subscriptions]
    
    subgraph "Service Dependencies Fixed"
        U[OLD: ../lib/firebase/client] --> V[FIXED: ../src/lib/firebase]
        W[Import Error Resolution] --> X[Unified Firebase Client]
        X --> Y[Single Source of Truth]
    end
```

## Terminal-GUI Integration Pattern

```mermaid
graph TD
    A[GUI Component Action] --> B[useCommandExecutor Hook]
    B --> C[Command String Generation]
    C --> D[Terminal Command Execution]
    D --> E[Command Registry Resolution]
    E --> F[Command Handler Execution]
    F --> G[Result Processing]
    G --> H[GUI State Update]
    
    I[Direct Terminal Input] --> J[ImprovedTerminal.tsx]
    J --> K[Command Parser]
    K --> E
    
    subgraph "Bidirectional Integration"
        L[GUI Button Click] --> M[Generate Terminal Command]
        M --> N[Execute via useCommandExecutor]
        N --> O[Update Both GUI and Terminal]
        
        P[Terminal Command] --> Q[Parse Command Type]
        Q --> R[Update Related GUI Components]
    end
    
    subgraph "Command Categories"
        S[User Commands: user list, user create]
        T[TRR Commands: trr generate, trr export]
        U[Scenario Commands: scenario run, scenario stop]
        V[POV Commands: pov create, pov demo]
    end
    
    E --> S
    E --> T
    E --> U
    E --> V
```

## State Management Patterns

```mermaid
graph TD
    A[Component Level State] --> B[useState Hooks]
    B --> C[Local Component Data]
    
    D[Firebase Real-time State] --> E[onSnapshot Listeners]
    E --> F[Firestore Document/Collection Updates]
    F --> G[Automatic Component Re-render]
    
    H[Cross-Component Communication] --> I[Context Providers]
    I --> J[Auth Context]
    I --> K[Theme Context]
    I --> L[Terminal Context]
    
    M[External API State] --> N[Firebase Functions]
    N --> O[Callable Functions]
    O --> P[Promise-based Updates]
    P --> Q[Component State Sync]
    
    subgraph "UserManagementPortal State Flow"
        R[Component Mount] --> S[useEffect Initialization]
        S --> T[Subscribe to users collection]
        S --> U[Subscribe to activityLogs collection]
        T --> V[Real-time User Updates]
        U --> W[Real-time Activity Updates]
        V --> X[Automatic List Refresh]
        W --> Y[Automatic Timeline Refresh]
    end
```

## Error Handling and Loading States

```mermaid
graph TD
    A[Component Loading States] --> B[loading: boolean]
    B --> C[Conditional Rendering]
    C --> D[Spinner Component]
    C --> E[Skeleton Loaders]
    
    F[Error Handling] --> G[Try-Catch Blocks]
    G --> H[console.error Logging]
    G --> I[User-Friendly Messages]
    
    J[Firebase Error Handling] --> K[getFirebaseErrorMessage]
    K --> L[Error Code Translation]
    L --> M[User-Readable Error Messages]
    
    subgraph "UserManagementPortal Error Patterns"
        N[Firebase Connection Errors] --> O[Show Offline Message]
        P[Permission Errors] --> Q[Show Access Denied]
        R[Data Loading Errors] --> S[Show Retry Button]
        T[Function Call Errors] --> U[Show Operation Failed]
    end
    
    V[Network Resilience] --> W[Automatic Retry Logic]
    W --> X[Exponential Backoff]
    X --> Y[Graceful Degradation]
```

This component architecture ensures maintainable, scalable code with clear separation of concerns and robust error handling throughout the application.