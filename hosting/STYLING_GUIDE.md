# Cortex DC Portal - Styling System Guide

## Overview
The Cortex Domain Consultant Portal uses a comprehensive styling system built on Tailwind CSS with custom Cortex color palette and theme integration.

## Color System

### Primary Cortex Colors
- `cortex-orange`: #FF6900 (Primary accent)
- `cortex-orange-light`: #FF8533 (Hover states)
- `cortex-orange-dark`: #E55A00 (Active states)
- `cortex-green`: #00CC66 (Success states)
- `cortex-green-light`: #33D580 (Success hover)
- `cortex-green-dark`: #00B359 (Success active)

### Background Hierarchy
- `cortex-bg-primary`: #000000 (Main background)
- `cortex-bg-secondary`: #0D1117 (Content areas)
- `cortex-bg-tertiary`: #161B22 (Cards/modals)
- `cortex-bg-quaternary`: #21262D (Elevated elements)
- `cortex-bg-hover`: #30363D (Interactive states)

### Text Hierarchy
- `cortex-text-primary`: #F0F6FC (Main text)
- `cortex-text-secondary`: #C9D1D9 (Secondary text)
- `cortex-text-muted`: #8B949E (Muted text)
- `cortex-text-disabled`: #6E7681 (Disabled states)

### Status Colors
- `cortex-success`: #00CC66 (Success states)
- `cortex-error`: #F85149 (Error states)
- `cortex-warning`: #F1C40F (Warning states)
- `cortex-info`: #58A6FF (Information states)

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
- Primary: `bg-gradient-to-r from-cortex-orange to-cortex-green`
- Secondary: `bg-cortex-bg-quaternary hover:bg-cortex-bg-hover`
- Success: `bg-cortex-success hover:bg-cortex-success-light`
- Error: `bg-cortex-error hover:bg-cortex-error-light`

## Usage Examples

### Login Form
```jsx
<div className="bg-cortex-bg-tertiary/80 backdrop-blur-xl border border-cortex-border-secondary rounded-2xl">
  <input className="bg-cortex-bg-primary/50 border border-cortex-border-muted text-cortex-text-primary" />
  <button className="bg-gradient-to-r from-cortex-orange to-cortex-green text-cortex-text-primary">
    Submit
  </button>
</div>
```

### Status Indicators
```jsx
<div className="flex items-center space-x-2">
  <div className="w-2 h-2 bg-cortex-success rounded-full animate-pulse"></div>
  <span className="text-cortex-text-muted">System Online</span>
</div>
```

### Loading States
```jsx
<div className="animate-spin border-4 border-cortex-border-muted border-t-cortex-orange"></div>
```

## CSS Custom Properties
All colors are also available as CSS custom properties:
- `--cortex-orange`
- `--cortex-green`
- `--cortex-bg-primary`
- `--cortex-text-primary`
- etc.

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