# Scenario Lifecycle Flowcharts

## Complete Scenario Management Flow

```mermaid
graph TB
    %% Entry Point
    START([User Command]) --> PARSE[Parse Command Arguments]
    
    %% Command Validation
    PARSE --> VALIDATE{Valid Command?}
    VALIDATE -->|Invalid| ERROR[Display Error Message]
    VALIDATE -->|Valid| ROUTE{Route by Action}
    
    %% Route to Actions
    ROUTE -->|list| LIST[List Available Templates]
    ROUTE -->|generate| GEN_START[Start Generation Process]
    ROUTE -->|status| STATUS_CHECK[Check Deployment Status]
    ROUTE -->|validate| VALIDATE_START[Start Validation Process]
    ROUTE -->|destroy| DESTROY_START[Start Destruction Process]
    ROUTE -->|export| EXPORT_START[Start Export Process]
    
    %% Generation/Deployment Flow
    GEN_START --> GEN_VALIDATE[Validate Parameters]
    GEN_VALIDATE --> GEN_TEMPLATE[Select Template]
    GEN_TEMPLATE --> GEN_PLAN[Plan Resources]
    GEN_PLAN --> GEN_DEPLOY[Deploy Infrastructure]
    GEN_DEPLOY --> GEN_CONFIGURE[Configure Services]
    GEN_CONFIGURE --> GEN_STATUS[Update Status: Running]
    GEN_STATUS --> GEN_AUTO{Auto Validate?}
    GEN_AUTO -->|Yes| VALIDATE_START
    GEN_AUTO -->|No| GEN_READY[Ready for Testing]
    
    %% Validation Flow
    VALIDATE_START --> VAL_TESTS[Execute Test Suite]
    VAL_TESTS --> VAL_COLLECT[Collect Results]
    VAL_COLLECT --> VAL_ANALYZE[Analyze Outcomes]
    VAL_ANALYZE --> VAL_STATUS[Update Status: Complete]
    VAL_STATUS --> VAL_AUTO{Auto Destroy?}
    VAL_AUTO -->|Yes| DESTROY_START
    VAL_AUTO -->|No| VAL_COMPLETE[Validation Complete]
    
    %% Destruction Flow
    DESTROY_START --> DEST_PLAN[Plan Resource Cleanup]
    DEST_PLAN --> DEST_PRESERVE[Preserve Required Data]
    DEST_PRESERVE --> DEST_REMOVE[Remove Infrastructure]
    DEST_REMOVE --> DEST_CLEANUP[Clean Temporary Data]
    DEST_CLEANUP --> DEST_STATUS[Update Status: Destroyed]
    
    %% Export Flow
    EXPORT_START --> EXP_COLLECT[Collect Deployment Data]
    EXP_COLLECT --> EXP_FORMAT[Format Output]
    EXP_FORMAT --> EXP_GENERATE[Generate Download]
    
    %% Status Flow
    STATUS_CHECK --> STAT_QUERY[Query Deployment State]
    STAT_QUERY --> STAT_FORMAT[Format Response]
    
    %% Termination Points
    LIST --> END([Command Complete])
    GEN_READY --> END
    VAL_COMPLETE --> END
    DEST_STATUS --> END
    EXP_GENERATE --> END
    STAT_FORMAT --> END
    ERROR --> END
    
    %% Styling
    classDef startEnd fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef process fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef action fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class START,END startEnd
    class PARSE,GEN_TEMPLATE,GEN_PLAN,GEN_DEPLOY,GEN_CONFIGURE,VAL_TESTS,VAL_COLLECT,VAL_ANALYZE,DEST_PLAN,DEST_PRESERVE,DEST_REMOVE,DEST_CLEANUP,EXP_COLLECT,EXP_FORMAT,EXP_GENERATE,STAT_QUERY,STAT_FORMAT process
    class VALIDATE,ROUTE,GEN_AUTO,VAL_AUTO decision
    class LIST,GEN_START,STATUS_CHECK,VALIDATE_START,DESTROY_START,EXPORT_START,GEN_VALIDATE,GEN_STATUS,GEN_READY,VAL_STATUS,VAL_COMPLETE,DEST_STATUS action
    class ERROR error
```

## Detailed Generation (Deploy) Process

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant Parser
    participant API
    participant Cloud
    participant Monitor
    
    User->>CLI: scenario generate --scenario-type cloud-posture
    CLI->>Parser: Parse command arguments
    Parser->>Parser: Validate parameters
    Parser->>CLI: Return ScenarioCommand object
    
    CLI->>API: deployScenario(command)
    API->>API: Select template configuration
    API->>Cloud: Create deployment resources
    
    loop Infrastructure Provisioning
        Cloud->>Cloud: Provision compute resources
        Cloud->>Cloud: Configure storage
        Cloud->>Cloud: Setup networking
        Cloud->>API: Report progress
        API->>Monitor: Update deployment status
    end
    
    Cloud->>API: Deployment complete
    API->>CLI: Return deployment ID
    CLI->>User: Display success + deployment details
    
    opt Auto-validate enabled
        CLI->>API: validateScenario(deploymentId)
        API->>Cloud: Run validation tests
        Cloud->>API: Return test results
        API->>CLI: Validation results
        CLI->>User: Display validation outcome
    end
```

## Status Monitoring Flow

```mermaid
stateDiagram-v2
    [*] --> Pending
    
    Pending --> Deploying: Start deployment
    Deploying --> Running: Infrastructure ready
    Deploying --> Failed: Deployment error
    
    Running --> Validating: Start validation
    Running --> Destroying: Manual destroy
    
    Validating --> Complete: Tests passed
    Validating --> Failed: Tests failed
    
    Complete --> Destroying: Auto-destroy or manual
    Failed --> Destroying: Cleanup required
    
    Destroying --> Destroyed: Cleanup complete
    Destroyed --> [*]
    
    note right of Pending
        Queued for deployment
        Resources not yet allocated
    end note
    
    note right of Deploying
        Infrastructure provisioning
        Services being configured
    end note
    
    note right of Running
        Scenario active and ready
        Available for testing
    end note
    
    note right of Validating
        Automated tests running
        Results being collected
    end note
    
    note right of Complete
        All tests completed
        Results available for export
    end note
    
    note right of Failed
        Deployment or validation failed
        Manual intervention may be required
    end note
    
    note right of Destroying
        Resources being cleaned up
        Data being preserved/archived
    end note
```

## Command Processing Pipeline

```mermaid
flowchart LR
    subgraph Input Processing
        A[Raw Command String] --> B[Tokenize Arguments]
        B --> C[Parse Options]
        C --> D[Validate Syntax]
    end
    
    subgraph Command Routing
        D --> E{Command Type}
        E -->|list| F[Template Listing]
        E -->|generate| G[Deployment Pipeline]
        E -->|status| H[Status Query]
        E -->|validate| I[Validation Pipeline]
        E -->|destroy| J[Destruction Pipeline]
        E -->|export| K[Export Pipeline]
    end
    
    subgraph Template Listing
        F --> F1[Load Template Catalog]
        F1 --> F2[Apply Filters]
        F2 --> F3[Format Output]
    end
    
    subgraph Deployment Pipeline
        G --> G1[Parameter Validation]
        G1 --> G2[Template Selection]
        G2 --> G3[Resource Planning]
        G3 --> G4[Infrastructure Deployment]
        G4 --> G5[Service Configuration]
        G5 --> G6[Status Update]
    end
    
    subgraph Status Query
        H --> H1[Lookup Deployment]
        H1 --> H2[Query Cloud Status]
        H2 --> H3[Format Response]
    end
    
    subgraph Validation Pipeline
        I --> I1[Load Test Suite]
        I1 --> I2[Execute Tests]
        I2 --> I3[Collect Results]
        I3 --> I4[Generate Report]
    end
    
    subgraph Destruction Pipeline
        J --> J1[Validate Deployment ID]
        J1 --> J2[Plan Cleanup]
        J2 --> J3[Preserve Data]
        J3 --> J4[Remove Resources]
        J4 --> J5[Update Status]
    end
    
    subgraph Export Pipeline
        K --> K1[Gather Data]
        K1 --> K2[Apply Format]
        K2 --> K3[Generate Output]
        K3 --> K4[Create Download Link]
    end
    
    subgraph Output
        F3 --> OUTPUT[Display Results]
        G6 --> OUTPUT
        H3 --> OUTPUT
        I4 --> OUTPUT
        J5 --> OUTPUT
        K4 --> OUTPUT
    end
```

## Error Handling Flow

```mermaid
flowchart TD
    START[Command Execution] --> TRYCATCH{Try Block}
    
    TRYCATCH -->|Success| SUCCESS[Return Results]
    TRYCATCH -->|Error| CATCH[Catch Error]
    
    CATCH --> CLASSIFY{Error Type}
    
    CLASSIFY -->|Validation Error| VAL_ERROR[Parameter Validation Failed]
    CLASSIFY -->|Network Error| NET_ERROR[API Communication Failed]
    CLASSIFY -->|Resource Error| RES_ERROR[Infrastructure Issue]
    CLASSIFY -->|Timeout Error| TIME_ERROR[Operation Timeout]
    CLASSIFY -->|Permission Error| PERM_ERROR[Access Denied]
    CLASSIFY -->|Unknown Error| UNK_ERROR[Unexpected Error]
    
    VAL_ERROR --> VAL_HANDLE[Show Usage Help]
    NET_ERROR --> NET_HANDLE[Retry Logic]
    RES_ERROR --> RES_HANDLE[Check Resource Limits]
    TIME_ERROR --> TIME_HANDLE[Extend Timeout]
    PERM_ERROR --> PERM_HANDLE[Check Credentials]
    UNK_ERROR --> UNK_HANDLE[Log Error Details]
    
    VAL_HANDLE --> ERROR_DISPLAY[Display Error Message]
    NET_HANDLE --> RETRY{Retry Attempt}
    RES_HANDLE --> ERROR_DISPLAY
    TIME_HANDLE --> RETRY
    PERM_HANDLE --> ERROR_DISPLAY
    UNK_HANDLE --> ERROR_DISPLAY
    
    RETRY -->|Retry| TRYCATCH
    RETRY -->|Max Retries| ERROR_DISPLAY
    
    SUCCESS --> END[Command Complete]
    ERROR_DISPLAY --> END
```

## Resource Lifecycle Management

```mermaid
gantt
    title Scenario Resource Lifecycle
    dateFormat  HH:mm
    axisFormat %H:%M
    
    section Planning
    Parameter Validation    :milestone, m1, 00:00, 0m
    Template Selection      :active, plan1, after m1, 2m
    Resource Calculation    :active, plan2, after plan1, 1m
    
    section Deployment
    Infrastructure Start    :milestone, m2, after plan2, 0m
    Compute Provisioning    :active, deploy1, after m2, 5m
    Storage Configuration   :active, deploy2, after m2, 3m
    Network Setup          :active, deploy3, after deploy2, 2m
    Service Deployment     :active, deploy4, after deploy1, 4m
    
    section Testing
    Validation Start       :milestone, m3, after deploy4, 0m
    Security Tests         :active, test1, after m3, 8m
    Performance Tests      :active, test2, after m3, 6m
    Integration Tests      :active, test3, after test2, 4m
    
    section Cleanup
    Cleanup Start          :milestone, m4, after test1, 0m
    Data Preservation      :active, clean1, after m4, 2m
    Resource Removal       :active, clean2, after clean1, 5m
    Status Update          :active, clean3, after clean2, 1m
```

## Integration Architecture

```mermaid
graph TB
    subgraph Client Layer
        CLI[Command Line Interface]
        WEB[Web Terminal Interface]
    end
    
    subgraph Processing Layer
        PARSER[Command Parser]
        VALIDATOR[Parameter Validator]
        ROUTER[Action Router]
    end
    
    subgraph Business Logic
        TEMPLATE[Template Manager]
        DEPLOY[Deployment Manager]
        MONITOR[Status Monitor]
        VALIDATE[Validation Engine]
        CLEANUP[Cleanup Manager]
        EXPORT[Export Generator]
    end
    
    subgraph Cloud Integration
        GCP[Google Cloud Platform]
        AWS[Amazon Web Services]
        AZURE[Microsoft Azure]
        K8S[Kubernetes Clusters]
    end
    
    subgraph Storage Layer
        CONFIG[Configuration Store]
        STATE[State Management]
        LOGS[Logging System]
        METRICS[Metrics Collection]
    end
    
    subgraph External Services
        XSIAM[Cortex XSIAM]
        XSOAR[Cortex XSOAR]
        CICD[CI/CD Pipelines]
    end
    
    %% Connections
    CLI --> PARSER
    WEB --> PARSER
    PARSER --> VALIDATOR
    VALIDATOR --> ROUTER
    
    ROUTER --> TEMPLATE
    ROUTER --> DEPLOY
    ROUTER --> MONITOR
    ROUTER --> VALIDATE
    ROUTER --> CLEANUP
    ROUTER --> EXPORT
    
    DEPLOY --> GCP
    DEPLOY --> AWS
    DEPLOY --> AZURE
    DEPLOY --> K8S
    
    TEMPLATE --> CONFIG
    DEPLOY --> STATE
    MONITOR --> LOGS
    VALIDATE --> METRICS
    
    VALIDATE --> XSIAM
    DEPLOY --> XSOAR
    CLEANUP --> CICD
```

These flowcharts provide comprehensive visual documentation of the scenario management system's lifecycle, showing how commands flow through the system, how resources are managed, and how different components interact with each other.
