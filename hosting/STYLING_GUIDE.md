# Cortex DC Portal - Styling System Guide

## Overview
The Cortex Domain Consultant Portal uses a comprehensive styling system built on Tailwind CSS with custom Cortex color palette and theme integration.

## Color System

### Primary Cortex Colors
- `cortex-primary`: #00CC66 (Cortex primary green)
- `cortex-primary-light`: #36E795 (Hover states)
- `cortex-primary-dark`: #009C4E (Active states)
- `cortex-teal`: #15BDB2 (Teal accent)
- `cortex-blue`: #00C0E8 (Neon blue accent)
- `cortex-cyan`: #00D6FF (Electric cyan highlight)
- `cortex-purple`: #827DFF (Signal purple accent)
- `cortex-accent`: #78DCFF (Soft glow overlay)

### Background Hierarchy
- `cortex-bg-primary`: #050C11 (Main background)
- `cortex-bg-secondary`: #081118 (Content areas)
- `cortex-bg-tertiary`: #0E1A22 (Cards & modals)
- `cortex-bg-quaternary`: #13232D (Elevated elements)
- `cortex-bg-hover`: #1A303C (Interactive states)

### Text Hierarchy
- `cortex-text-primary`: #F0F6FC (Main text)
- `cortex-text-secondary`: #C9D1D9 (Secondary text)
- `cortex-text-muted`: #8B949E (Muted text)
- `cortex-text-disabled`: #6E7681 (Disabled states)

### Status Colors
- `status-success`: #00CC8C (Success states)
- `status-error`: #EF5350 (Error states)
- `status-warning`: #FFAB26 (Warning states)
- `status-info`: #20C4FF (Information states)

## Component Classes

### Interactive Elements
```css
.cortex-interactive {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.cortex-interactive:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}
```

### Animation Classes
- `.cortex-fade-in` - Smooth fade in animation
- `.cortex-scale-in` - Scale in with bounce
- `.cortex-slide-up` - Slide up from bottom
- `.cortex-glow-pulse` - Pulsing glow effect

### Button Variants
- Primary: `bg-gradient-to-r from-cortex-primary to-cortex-blue`
- Secondary: `bg-cortex-bg-quaternary/80 hover:bg-cortex-bg-hover border border-cortex-border`
- Success: `bg-gradient-to-r from-cortex-primary to-cortex-teal`
- Error: `bg-status-error hover:bg-status-error/90`

## Usage Examples

### Login Form
```jsx
<div className="bg-cortex-bg-tertiary/80 backdrop-blur-xl border border-cortex-border-secondary rounded-2xl">
  <input className="bg-cortex-bg-primary/50 border border-cortex-border-muted text-cortex-text-primary" />
  <button className="bg-gradient-to-r from-cortex-primary to-cortex-blue text-white">
    Submit
  </button>
</div>
```

### Status Indicators
```jsx
<div className="flex items-center space-x-2">
  <div className="w-2 h-2 bg-status-success rounded-full animate-pulse"></div>
  <span className="text-cortex-text-muted">System Online</span>
</div>
```

### Loading States
```jsx
<div className="animate-spin border-4 border-cortex-border-muted border-t-cortex-primary"></div>
```

## CSS Custom Properties
All colors are also available as CSS custom properties:
- `--cortex-primary`, `--cortex-primary-light`, `--cortex-primary-dark`
- `--cortex-teal`, `--cortex-blue`, `--cortex-cyan`, `--cortex-purple`
- `--cortex-border`, `--cortex-border-secondary`, `--cortex-border-muted`
- `--cortex-bg-primary`, `--cortex-bg-secondary`, `--cortex-bg-tertiary`, `--cortex-bg-hover`
- `--cortex-text-primary`, `--cortex-text-secondary`, `--cortex-text-muted`, `--cortex-text-disabled`

## Development Commands

### Build with Styling
```bash
npm run build:exp  # With experimental webpack
npm run dev:exp    # Development with experimental features
```

### Testing
```bash
npm run firebase:serve  # Local Firebase emulator
```

## Theme Integration
The system uses ThemeProvider for consistent theming across all components:

```jsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

## Best Practices

1. **Always use Cortex color classes** instead of generic colors
2. **Leverage backdrop-blur** for modern glass effects
3. **Apply consistent spacing** using Tailwind's space-* utilities
4. **Use semantic color names** (success, error, warning, info)
5. **Implement smooth transitions** on interactive elements
6. **Maintain visual hierarchy** with proper text color usage

## Responsive Design
The system includes comprehensive responsive utilities:
- Mobile-first approach
- Consistent breakpoints (sm, md, lg, xl, 2xl)
- Touch-friendly sizing for interactive elements

## Performance Optimizations
- Purged CSS for production builds
- Efficient color palette (minimal duplicates)
- Optimized animation performance
- Lazy loading of dynamic components