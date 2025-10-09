# Cortex UI Modernization - Color Usage Mapping

## Current Color System Analysis

### Existing Color Classes Found
Based on repository scan, the current system uses these patterns:

#### Brand Colors (Multiple Variants)
- **Cortex Primary/Accent**: `cortex-accent`, `cortex-primary` (#FA582D)
- **Cortex Teal**: `cortex-teal` (#8ad3de)  
- **Cortex Blue**: `cortex-blue`, `cortex-info` (#00c0e8)
- **Legacy Orange/Green**: `cortex-orange` (#FF6900), `cortex-green` (#00CC66)

#### Status Colors
- **Success**: `cortex-success`, `cortex-green` (#00CC66)
- **Warning**: `cortex-warning`, `cortex-orange` (#FF6900)
- **Error**: `cortex-error` (#F85149)
- **Info**: `cortex-info` (#58A6FF)

#### Text Hierarchy
- **Primary**: `cortex-text-primary` (#F0F6FC)
- **Secondary**: `cortex-text-secondary` (#C9D1D9)
- **Muted**: `cortex-text-muted` (#8B949E)
- **Disabled**: `cortex-text-disabled` (#6E7681)

#### Backgrounds
- **Primary**: `cortex-bg-primary` (#000000)
- **Secondary**: `cortex-bg-secondary` (#0D1117)
- **Tertiary**: `cortex-bg-tertiary` (#161B22)
- **Quaternary**: `cortex-bg-quaternary` (#21262D)
- **Hover**: `cortex-bg-hover` (#30363D)

#### Borders
- **Primary**: `cortex-border-primary` (#FF6900)
- **Secondary**: `cortex-border-secondary` (#30363D)
- **Muted**: `cortex-border-muted` (#21262D)

## Modernization Mapping

### 🎨 Official Cortex Color Consolidation

#### Old → New Brand Token Mapping
```
OLD                    → NEW SEMANTIC TOKEN
cortex-accent          → cortex-primary
cortex-orange          → cortex-primary (or status-warning for warnings)
cortex-green           → status-success  
cortex-info            → cortex-blue
cortex-text-accent     → cortex-text-primary
```

#### Component Usage Inventory

##### ModernCard (hosting/components/ui/modern/index.tsx)
```typescript
// BEFORE (preserve as comments)
variants = {
  glass: 'bg-cortex-bg-tertiary/60 backdrop-blur-xl border border-cortex-border-secondary/50 shadow-xl',
  solid: 'bg-cortex-bg-tertiary border border-cortex-border-secondary',
  outline: 'border border-cortex-border-secondary bg-transparent',
  elevated: 'bg-cortex-bg-tertiary border border-cortex-border-secondary shadow-2xl shadow-black/20'
};

// AFTER (new tokens)
variants = {
  glass: 'bg-cortex-elevated/60 backdrop-blur-xl border border-cortex-border/50 shadow-xl',
  solid: 'bg-cortex-elevated border border-cortex-border',
  outline: 'border border-cortex-border bg-transparent',
  elevated: 'bg-cortex-elevated border border-cortex-border shadow-2xl shadow-black/20'
};
```

##### ModernButton (hosting/components/ui/modern/index.tsx)
```typescript
// BEFORE
variants = {
  primary: 'bg-cortex-accent hover:bg-cortex-accent/90 text-white shadow-lg shadow-cortex-accent/25 hover:shadow-xl hover:shadow-cortex-accent/40 hover:scale-105',
  secondary: 'bg-cortex-bg-tertiary hover:bg-cortex-bg-hover text-cortex-text-primary border border-cortex-border-secondary hover:border-cortex-border-primary',
  outline: 'border border-cortex-accent text-cortex-accent hover:bg-cortex-accent hover:text-white',
  ghost: 'hover:bg-cortex-bg-tertiary text-cortex-text-secondary hover:text-cortex-text-primary',
  danger: 'bg-cortex-error hover:bg-cortex-error-dark text-white shadow-lg shadow-cortex-error/25',
  success: 'bg-cortex-success hover:bg-cortex-success-dark text-white shadow-lg shadow-cortex-success/25'
};

// AFTER
variants = {
  primary: 'bg-cortex-primary hover:bg-cortex-primary/90 text-cortex-dark shadow-lg shadow-cortex-primary/25 hover:shadow-xl hover:shadow-cortex-primary/40 hover:scale-105',
  secondary: 'bg-cortex-elevated hover:bg-cortex-elevated/80 text-cortex-text-primary border border-cortex-border hover:border-cortex-primary/60',
  outline: 'border border-cortex-primary text-cortex-primary hover:bg-cortex-primary hover:text-cortex-dark',
  ghost: 'hover:bg-cortex-elevated text-cortex-text-secondary hover:text-cortex-text-primary',
  danger: 'bg-status-error hover:bg-status-error/90 text-white shadow-lg shadow-status-error/25',
  success: 'bg-status-success hover:bg-status-success/90 text-white shadow-lg shadow-status-success/25'
};
```

##### Dashboard Components (hosting/components/ui/modern/Dashboard.tsx)
```typescript
// BEFORE
const colorClasses = {
  accent: 'border-cortex-accent/30 bg-gradient-to-br from-cortex-accent/5 to-cortex-accent/10',
  success: 'border-cortex-success/30 bg-gradient-to-br from-cortex-success/5 to-cortex-success/10',
  warning: 'border-cortex-warning/30 bg-gradient-to-br from-cortex-warning/5 to-cortex-warning/10',
  error: 'border-cortex-error/30 bg-gradient-to-br from-cortex-error/5 to-cortex-error/10',
  info: 'border-cortex-info/30 bg-gradient-to-br from-cortex-info/5 to-cortex-info/10'
};

// AFTER
const colorClasses = {
  accent: 'border-cortex-primary/30 bg-gradient-to-br from-cortex-primary/5 to-cortex-primary/10',
  success: 'border-status-success/30 bg-gradient-to-br from-status-success/5 to-status-success/10',
  warning: 'border-status-warning/30 bg-gradient-to-br from-status-warning/5 to-status-warning/10',
  error: 'border-status-error/30 bg-gradient-to-br from-status-error/5 to-status-error/10',
  info: 'border-cortex-blue/30 bg-gradient-to-br from-cortex-blue/5 to-cortex-blue/10'
};

const iconColors = {
  accent: 'text-cortex-primary',
  success: 'text-status-success',
  warning: 'text-status-warning',
  error: 'text-status-error',
  info: 'text-cortex-blue'
};
```

### 🏗️ Implementation Strategy

#### Phase 1: Token Definition & Alias Layer
1. **Define CSS Variables** in `hosting/app/globals.css`:
   ```css
   :root {
     /* Official Cortex Brand Colors */
     --cortex-primary: 250 88 45;     /* #FA582D */
     --cortex-teal: 138 211 222;      /* #8AD3DE */
     --cortex-blue: 0 192 232;        /* #00C0E8 */
     --cortex-dark: 20 20 20;         /* #141414 */
     
     /* Surface Tokens */
     --cortex-canvas: 0 0 0;          /* #000000 */
     --cortex-surface: 20 20 20;      /* #141414 */
     --cortex-elevated: 26 26 26;     /* #1A1A1A */
     --cortex-border: 48 48 48;       /* #303030 */
     
     /* Text Tokens */
     --cortex-text-primary: 245 245 245;   /* #F5F5F5 */
     --cortex-text-secondary: 201 201 201; /* #C9C9C9 */
     --cortex-text-muted: 155 155 155;     /* #9B9B9B */
     
     /* Status Colors */
     --status-success: 22 163 74;     /* #16A34A */
     --status-warning: 245 158 11;    /* #F59E0B */
     --status-error: 239 68 68;       /* #EF4444 */
     --status-info: 0 192 232;        /* #00C0E8 */
   }
   ```

2. **Tailwind Extension** in `hosting/tailwind.config.js`:
   ```javascript
   const withOpacity = (variable) => ({ opacityValue }) =>
     opacityValue !== undefined
       ? `rgb(var(${variable}) / ${opacityValue})`
       : `rgb(var(${variable}))`;

   module.exports = {
     theme: {
       extend: {
         colors: {
           cortex: {
             primary: withOpacity('--cortex-primary'),
             teal: withOpacity('--cortex-teal'),
             blue: withOpacity('--cortex-blue'),
             dark: withOpacity('--cortex-dark'),
             'text-primary': withOpacity('--cortex-text-primary'),
             'text-secondary': withOpacity('--cortex-text-secondary'),
             'text-muted': withOpacity('--cortex-text-muted'),
             canvas: withOpacity('--cortex-canvas'),
             surface: withOpacity('--cortex-surface'),
             elevated: withOpacity('--cortex-elevated'),
             border: withOpacity('--cortex-border'),
           },
           status: {
             success: withOpacity('--status-success'),
             warning: withOpacity('--status-warning'),
             error: withOpacity('--status-error'),
             info: withOpacity('--status-info'),
           },
         },
       },
     },
     plugins: [
       function({ addUtilities, theme }) {
         // Backward compatibility aliases (deprecated)
         addUtilities({
           '.text-cortex-accent': { color: theme('colors.cortex.primary') },
           '.bg-cortex-accent': { backgroundColor: theme('colors.cortex.primary') },
           '.text-cortex-success': { color: theme('colors.status.success') },
           '.bg-cortex-success': { backgroundColor: theme('colors.status.success') },
           '.text-cortex-info': { color: theme('colors.cortex.blue') },
           '.bg-cortex-info': { backgroundColor: theme('colors.cortex.blue') },
           // ... other aliases
         });
       }
     ]
   };
   ```

#### Phase 2: Component Modernization
1. **ModernCard**: Update to use `ui-glass` utility class
2. **ModernButton**: Consolidate variants with new tokens
3. **ModernBadge**: Status-based variants
4. **Navigation**: Focus rings and active states
5. **Dashboard**: Metric cards with proper contrast

#### Phase 3: Animation & Interaction
1. **Motion**: `motion-safe:animate-*` prefixes
2. **Focus**: `focus-visible:ring-brand` standardization
3. **Hover**: Consistent elevation changes

### 🎯 Priority Files for Update

#### High Priority (Core Components)
1. `hosting/components/ui/modern/index.tsx` - All primitives
2. `hosting/components/ui/modern/Dashboard.tsx` - Metric cards
3. `hosting/components/ui/modern/Navigation.tsx` - Sidebar & breadcrumbs
4. `hosting/tailwind.config.js` - Color system
5. `hosting/app/globals.css` - CSS variables and utilities

#### Medium Priority (Application Pages)
1. `hosting/app/page.tsx` - Landing/auth page
2. `hosting/components/ImprovedTerminal.tsx` - Terminal interface
3. `hosting/components/EnhancedGUIInterface.tsx` - GUI components

#### Low Priority (Specialized Components)
1. `hosting/components/BigQueryExplorer.tsx`
2. `hosting/components/ProductionTRRManagement.tsx`
3. `hosting/components/ContentCreatorManager.tsx`

### 📏 Design Tokens Reference

#### Color Usage Guidelines
```
PRIMARY ACTIONS:     bg-cortex-primary text-cortex-dark
SECONDARY ACTIONS:   bg-cortex-elevated text-cortex-text-primary
SUCCESS STATES:      bg-status-success text-white
WARNING STATES:      bg-status-warning text-white
ERROR STATES:        bg-status-error text-white
INFO/NEUTRAL:        bg-cortex-blue text-white

SURFACES:
- Canvas/App bg:     bg-cortex-canvas
- Cards/Panels:      bg-cortex-surface
- Elevated/Popups:   bg-cortex-elevated
- Interactive:       hover:bg-cortex-elevated

TEXT:
- Headings:          text-cortex-text-primary
- Body text:         text-cortex-text-secondary  
- Meta/Labels:       text-cortex-text-muted

BORDERS:
- Default:           border-cortex-border
- Interactive:       focus-visible:ring-2 ring-cortex-blue
- Accent:            border-cortex-primary
```

### 🔄 Migration Commands

#### Find/Replace Operations (Dry Run First)
```bash
# Count occurrences
rg -c "text-cortex-accent" hosting/
rg -c "bg-cortex-accent" hosting/
rg -c "border-cortex-accent" hosting/

# Preview changes (dry run)
rg -l "text-cortex-accent" hosting/ | xargs -I {} echo "sed -i.bak 's/text-cortex-accent/text-cortex-primary/g' {}"

# Apply changes (after verification)
rg -l "text-cortex-accent" hosting/ | xargs -I {} sed -i.bak 's/text-cortex-accent/text-cortex-primary/g' {}
```

#### Verification Steps
```bash
# Build check
npm run build

# Type check  
npm run typecheck

# Visual regression check
npm run dev
```

### 📊 Progress Tracking

#### Component Status
- [ ] ModernCard - Token migration
- [ ] ModernButton - Variant updates  
- [ ] ModernBadge - Status variants
- [ ] ModernInput - Focus states
- [ ] ModernDashboard - Color classes
- [ ] ModernNavigation - Active states
- [ ] Landing Page - Brand colors
- [ ] Terminal Interface - Theme consistency

#### Implementation Phases
- [ ] **Phase 1**: CSS variables & Tailwind config
- [ ] **Phase 2**: Core component updates
- [ ] **Phase 3**: Application-level updates  
- [ ] **Phase 4**: Specialized component updates
- [ ] **Phase 5**: Documentation & cleanup

---

**Next Steps**: Begin with Phase 1 implementation of CSS variables and Tailwind configuration updates.