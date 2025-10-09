# UI Architecture & Component System

## Overview

This document outlines the architectural hierarchy and relationships within the Cortex Domain Consultant Platform's UI system, featuring a modern token-based design system with comprehensive component relationships.

## 🏗️ Component Hierarchy

### Main Dashboard Architecture

```mermaid
graph TD
    A[ModernDashboard] --> B[MetricCard]
    A --> C[ModernActivityFeed]
    A --> D[ModernQuickActions]

    B --> E[ModernCard]
    B --> F[ModernBadge]
    
    C --> E
    C --> G[ActivityItem]
    
    D --> H[QuickActionButton]
    D --> F

    subgraph "Core UI Primitives"
        E[ModernCard]
        I[ModernButton]
        F[ModernBadge]
        J[ModernInput]
        K[ModernProgressBar]
        L[ModernLoadingSpinner]
    end

    subgraph "Navigation Components"
        M[ModernSidebar]
        N[ModernBreadcrumbs]
        O[ModernCommandPalette]
    end

    H --> I
    G --> I

    style A fill:#fa582d,stroke:#141414,stroke-width:3px,color:#141414
    style E fill:#8ad3de,stroke:#141414,stroke-width:2px,color:#141414
    style I fill:#00c0e8,stroke:#141414,stroke-width:2px,color:#141414
```

### Design Token Flow

```mermaid
graph LR
    A[CSS Variables] --> B[Tailwind Config]
    B --> C[Token Functions]
    C --> D[Component Styles]
    
    subgraph "Token Categories"
        E[Brand Colors]
        F[Surface Colors]
        G[Status Colors]
        H[Text Colors]
        I[Focus Colors]
    end
    
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    
    D --> J[ModernCard]
    D --> K[ModernButton]
    D --> L[ModernBadge]
    D --> M[ModernInput]
    
    subgraph "Utility Classes"
        N[Glass Effects]
        O[Motion Classes]
        P[Focus States]
        Q[Gradients]
    end
    
    C --> N
    C --> O
    C --> P
    C --> Q

    style A fill:#141414,stroke:#fa582d,stroke-width:2px,color:#f5f5f5
    style B fill:#1a1a1a,stroke:#8ad3de,stroke-width:2px,color:#f5f5f5
    style D fill:#303030,stroke:#00c0e8,stroke-width:2px,color:#f5f5f5
```

### Component Inheritance & Composition

```mermaid
classDiagram
    class ModernCard {
        +variant: glass|solid|outline|elevated
        +padding: none|sm|md|lg|xl
        +hover: boolean
        +className: string
    }
    
    class ModernButton {
        +variant: primary|secondary|outline|ghost|danger|success
        +size: sm|md|lg|xl
        +isLoading: boolean
        +icon: ReactNode
        +disabled: boolean
    }
    
    class ModernBadge {
        +variant: default|success|warning|error|info
        +size: sm|md|lg
    }
    
    class ModernInput {
        +label: string
        +error: string
        +icon: ReactNode
        +iconPosition: left|right
    }
    
    class MetricCard {
        +metric: DashboardMetric
        +isHovered: boolean
        +animatedValue: number
    }
    
    class ActivityItem {
        +activity: ActivityItem
        +index: number
        +typeColors: object
    }
    
    MetricCard --|> ModernCard : extends
    ActivityItem --|> ModernCard : uses
    QuickActionButton --|> ModernButton : extends
    QuickActionButton --|> ModernBadge : uses
    
    ModernCard : +focus-visible states
    ModernButton : +motion-safe animations
    ModernBadge : +status-based variants
    ModernInput : +enhanced focus system
```

## 🎨 Design System Layers

### UI Layer Stack

```mermaid
graph TB
    subgraph "Visual Hierarchy"
        A[Surface Layer] --> B[Glass Layer] 
        B --> C[Content Layer]
        C --> D[Focus Ring]
    end
    
    subgraph "Surface Tokens"
        E[cortex-canvas<br/>#000000]
        F[cortex-surface<br/>#141414]
        G[cortex-elevated<br/>#1A1A1A]
    end
    
    subgraph "Glass Effects"
        H[ui-glass<br/>blur(10px)]
        I[ui-glass-panel<br/>blur(16px)]
        J[ui-glass-elevated<br/>blur(20px)]
    end
    
    subgraph "Focus System"
        K[focus-ring<br/>ring-brand]
        L[focus-brand<br/>outline style]
    end
    
    A --> E
    B --> H
    C --> F
    D --> K
    
    style A fill:#000000,stroke:#303030,color:#f5f5f5
    style B fill:#141414,stroke:#303030,color:#f5f5f5
    style C fill:#1a1a1a,stroke:#303030,color:#f5f5f5
    style D fill:#00c0e8,stroke:#fa582d,color:#141414
```

### Token Mapping System

```mermaid
graph TD
    subgraph "Brand Tokens"
        A[cortex-primary<br/>#FA582D]
        B[cortex-teal<br/>#8AD3DE]
        C[cortex-blue<br/>#00C0E8]
        D[cortex-dark<br/>#141414]
    end
    
    subgraph "Status Tokens"
        E[status-success<br/>#16A34A]
        F[status-warning<br/>#F59E0B]
        G[status-error<br/>#EF4444]
        H[status-info<br/>#00C0E8]
    end
    
    subgraph "Surface Tokens"
        I[cortex-canvas<br/>#000000]
        J[cortex-surface<br/>#141414]
        K[cortex-elevated<br/>#1A1A1A]
        L[cortex-border<br/>#303030]
    end
    
    subgraph "Text Tokens"
        M[cortex-text-primary<br/>#F5F5F5]
        N[cortex-text-secondary<br/>#C9C9C9]
        O[cortex-text-muted<br/>#9B9B9B]
    end
    
    subgraph "Utility Classes"
        P[.bg-cortex-primary]
        Q[.text-status-success]
        R[.border-cortex-border]
        S[.shadow-glass-md]
        T[.motion-safe-scale]
    end
    
    A --> P
    E --> Q
    L --> R
    K --> S
    
    P --> U[Component Styles]
    Q --> U
    R --> U
    S --> U
    T --> U

    style A fill:#fa582d,color:#141414
    style B fill:#8ad3de,color:#141414
    style C fill:#00c0e8,color:#141414
    style E fill:#16a34a,color:#ffffff
    style F fill:#f59e0b,color:#141414
    style G fill:#ef4444,color:#ffffff
```

## 🔄 State Management Flow

### Component State Flow

```mermaid
stateDiagram-v2
    [*] --> Default
    Default --> Hover : mouse enter
    Default --> Focus : keyboard navigation
    Default --> Active : click/tap
    Default --> Loading : async action
    Default --> Disabled : prop change
    
    Hover --> Default : mouse leave
    Hover --> Active : click during hover
    
    Focus --> Default : blur
    Focus --> Active : enter/space key
    
    Active --> Default : release
    Active --> Loading : submit action
    
    Loading --> Default : success
    Loading --> Error : failure
    
    Error --> Default : reset
    Error --> Loading : retry
    
    Disabled --> Default : enable
    
    note right of Focus : Uses focus-visible ring
    note right of Loading : Shows spinner/animation
    note right of Error : Status color feedback
```

### Animation State Machine

```mermaid
stateDiagram-v2
    [*] --> MotionCheck
    
    MotionCheck --> Reduced : prefers-reduced-motion
    MotionCheck --> Full : motion allowed
    
    Reduced --> StaticHover : hover
    Reduced --> StaticFocus : focus
    
    Full --> AnimatedHover : hover
    Full --> AnimatedFocus : focus
    Full --> AnimatedEnter : component mount
    
    StaticHover --> Reduced : mouse leave
    StaticFocus --> Reduced : blur
    
    AnimatedHover --> AnimatedActive : click
    AnimatedHover --> Full : mouse leave
    
    AnimatedFocus --> AnimatedActive : activate
    AnimatedFocus --> Full : blur
    
    AnimatedEnter --> Full : complete
    AnimatedActive --> Full : release
    
    note right of AnimatedHover : transform: scale(1.02)
    note right of AnimatedEnter : animate-fade-in-modern
    note right of StaticHover : No transform
```

## 🧩 Component Composition Patterns

### Card-Based Layouts

```mermaid
graph TD
    A[Dashboard Grid] --> B[MetricCard 1]
    A --> C[MetricCard 2]
    A --> D[MetricCard 3]
    A --> E[MetricCard 4]
    
    F[Activity Feed] --> G[ActivityItem 1]
    F --> H[ActivityItem 2]
    F --> I[ActivityItem 3]
    
    J[Quick Actions] --> K[Action Button 1]
    J --> L[Action Button 2]
    J --> M[Action Button 3]
    
    subgraph "MetricCard Composition"
        B --> N[ModernCard wrapper]
        N --> O[Icon + Colors]
        N --> P[Value Display]
        N --> Q[Change Indicator]
        N --> R[Description]
    end
    
    subgraph "ActivityItem Composition"
        G --> S[ModernCard base]
        S --> T[Status Icon]
        S --> U[Content]
        S --> V[Timestamp]
        S --> W[User Avatar]
    end

    style N fill:#141414,stroke:#8ad3de,color:#f5f5f5
    style S fill:#141414,stroke:#8ad3de,color:#f5f5f5
```

### Form Component Pattern

```mermaid
graph TB
    A[Form Container] --> B[ModernCard wrapper]
    B --> C[Form Fields]
    C --> D[ModernInput 1]
    C --> E[ModernInput 2]
    C --> F[ModernInput 3]
    
    B --> G[Form Actions]
    G --> H[ModernButton primary]
    G --> I[ModernButton secondary]
    
    subgraph "ModernInput Structure"
        D --> J[Label]
        D --> K[Input Element]
        D --> L[Icon Optional]
        D --> M[Error Message]
    end
    
    subgraph "Validation States"
        N[Valid State] --> O[border-cortex-border]
        P[Error State] --> Q[border-status-error]
        R[Focus State] --> S[focus-ring]
    end
    
    K --> N
    K --> P
    K --> R

    style B fill:#161b22,stroke:#303030,color:#f5f5f5
    style H fill:#fa582d,stroke:#141414,color:#141414
    style I fill:#1a1a1a,stroke:#303030,color:#f5f5f5
```

## 📱 Responsive Architecture

### Breakpoint System

```mermaid
graph LR
    A[Mobile<br/>< 768px] --> B[Tablet<br/>768px - 1024px]
    B --> C[Desktop<br/>1024px - 1440px]
    C --> D[Large<br/>> 1440px]
    
    subgraph "Mobile Layout"
        E[Single Column]
        F[Collapsed Nav]
        G[Stack Cards]
    end
    
    subgraph "Tablet Layout"
        H[Two Columns]
        I[Side Nav]
        J[Grid Cards]
    end
    
    subgraph "Desktop Layout"
        K[Multi Column]
        L[Full Nav]
        M[Complex Grid]
    end
    
    A --> E
    B --> H
    C --> K
    
    style A fill:#fa582d,color:#141414
    style B fill:#8ad3de,color:#141414
    style C fill:#00c0e8,color:#141414
    style D fill:#16a34a,color:#ffffff
```

## 🔧 Development Patterns

### Component Development Flow

```mermaid
flowchart TD
    A[New Component Need] --> B{Existing Primitive?}
    B -->|Yes| C[Extend Existing]
    B -->|No| D[Create New Primitive]
    
    C --> E[Add Variants]
    D --> F[Define Props Interface]
    F --> G[Implement Base Styles]
    G --> H[Add Token Integration]
    H --> I[Implement Variants]
    
    E --> J[Add Focus States]
    I --> J
    J --> K[Add Motion Support]
    K --> L[Add Accessibility]
    L --> M[Write Tests]
    M --> N[Update Documentation]
    
    N --> O[Code Review]
    O --> P{Approved?}
    P -->|No| Q[Address Feedback]
    Q --> O
    P -->|Yes| R[Deploy]
    
    style A fill:#fa582d,color:#141414
    style R fill:#16a34a,color:#ffffff
    style P fill:#f59e0b,color:#141414
```

### Token Integration Pattern

```mermaid
sequenceDiagram
    participant CSS as CSS Variables
    participant TW as Tailwind Config
    participant Comp as Component
    participant DOM as DOM Element
    
    CSS->>TW: Define withOpacity function
    TW->>TW: Generate utility classes
    TW->>Comp: Provide class names
    Comp->>Comp: Apply conditional styles
    Comp->>DOM: Render with classes
    DOM->>DOM: Apply computed styles
    
    Note over CSS,DOM: Token-based theming flow
    
    CSS->>CSS: :root { --cortex-primary: 250 88 45 }
    TW->>TW: .bg-cortex-primary { background: rgb(var(--cortex-primary)) }
    Comp->>Comp: className="bg-cortex-primary"
```

## 🎯 Performance Considerations

### Component Loading Strategy

```mermaid
graph TB
    A[App Load] --> B[Critical CSS]
    B --> C[Core Components]
    C --> D[Dashboard Layout]
    
    D --> E[Lazy Load Sections]
    E --> F[Activity Feed]
    E --> G[Quick Actions]
    E --> H[Settings Panel]
    
    subgraph "Code Splitting"
        I[ModernCard Bundle]
        J[Dashboard Bundle]
        K[Navigation Bundle]
        L[Form Bundle]
    end
    
    C --> I
    D --> J
    F --> K
    G --> L
    
    subgraph "CSS Loading"
        M[Critical Inline CSS]
        N[Component CSS]
        O[Utility CSS]
    end
    
    B --> M
    C --> N
    I --> O

    style A fill:#fa582d,color:#141414
    style M fill:#16a34a,color:#ffffff
    style N fill:#8ad3de,color:#141414
```

## 📋 Architecture Checklist

### Component Design Requirements
- [ ] Uses design tokens for all colors
- [ ] Implements proper focus states
- [ ] Supports motion preferences
- [ ] Follows accessibility guidelines
- [ ] Has TypeScript interfaces
- [ ] Includes proper documentation
- [ ] Tests all variants and states
- [ ] Optimizes for performance

### Token Integration Requirements
- [ ] All colors use CSS variables
- [ ] Opacity modifiers supported
- [ ] Legacy compatibility maintained
- [ ] Semantic naming conventions
- [ ] Proper contrast ratios
- [ ] Dark mode optimized
- [ ] High contrast support

### Animation Requirements
- [ ] Respects `prefers-reduced-motion`
- [ ] Uses `motion-safe:` prefixes
- [ ] Smooth transitions (200-300ms)
- [ ] Brand timing functions
- [ ] GPU-accelerated properties
- [ ] No layout thrashing

---

**Last Updated**: October 2025  
**Version**: 2.0 (Modern Architecture)  
**Maintained by**: henryreed.ai Development Team

*This architecture document serves as the blueprint for component development and system integration within the Cortex platform.*