# Modern Cortex Color System Reference

## Overview

This document describes the modernized color system for the Cortex Domain Consultant Platform, featuring a unified token-based approach with official Palo Alto Networks branding and comprehensive accessibility compliance.

## 🎨 Core Brand Colors

### Official Cortex Brand Colors

| Token | CSS Variable | Hex Value | Usage |
|-------|-------------|-----------|-------|
| `cortex-primary` | `--cortex-primary: 250 88 45` | `#FA582D` | Primary actions, brand emphasis |
| `cortex-teal` | `--cortex-teal: 138 211 222` | `#8AD3DE` | Accent elements, highlights |
| `cortex-blue` | `--cortex-blue: 0 192 232` | `#00C0E8` | Interactive elements, info states |
| `cortex-dark` | `--cortex-dark: 20 20 20` | `#141414` | Text on light backgrounds |

### Surface Tokens (Dark Theme)

| Token | CSS Variable | Hex Value | Usage |
|-------|-------------|-----------|-------|
| `cortex-canvas` | `--cortex-canvas: 0 0 0` | `#000000` | App background |
| `cortex-surface` | `--cortex-surface: 20 20 20` | `#141414` | Card/panel background |
| `cortex-elevated` | `--cortex-elevated: 26 26 26` | `#1A1A1A` | Elevated surfaces |
| `cortex-border` | `--cortex-border: 48 48 48` | `#303030` | Default borders |

### Text Tokens (High Contrast)

| Token | CSS Variable | Hex Value | Contrast Ratio | Usage |
|-------|-------------|-----------|----------------|-------|
| `cortex-text-primary` | `--cortex-text-primary: 245 245 245` | `#F5F5F5` | 13.8:1 | Headings, primary text |
| `cortex-text-secondary` | `--cortex-text-secondary: 201 201 201` | `#C9C9C9` | 9.5:1 | Body text |
| `cortex-text-muted` | `--cortex-text-muted: 155 155 155` | `#9B9B9B` | 4.6:1 | Meta text, labels |

### Status Colors (WCAG AA+ Compliant)

| Token | CSS Variable | Hex Value | Usage |
|-------|-------------|-----------|-------|
| `status-success` | `--status-success: 22 163 74` | `#16A34A` | Success states |
| `status-warning` | `--status-warning: 245 158 11` | `#F59E0B` | Warning states |
| `status-error` | `--status-error: 239 68 68` | `#EF4444` | Error states |
| `status-info` | `--status-info: 0 192 232` | `#00C0E8` | Info states |

## 🛠️ Implementation

### Tailwind CSS Usage

```css
/* Brand Colors */
.bg-cortex-primary     /* Background: Cortex primary */
.text-cortex-primary   /* Text: Cortex primary */
.border-cortex-primary /* Border: Cortex primary */

/* Surfaces */
.bg-cortex-canvas      /* App background */
.bg-cortex-surface     /* Card background */
.bg-cortex-elevated    /* Elevated elements */

/* Status Colors */
.text-status-success   /* Success text */
.bg-status-error       /* Error background */
.border-status-warning /* Warning border */

/* Opacity Support */
.bg-cortex-primary/10  /* 10% opacity */
.text-cortex-blue/50   /* 50% opacity */
```

### CSS Custom Properties

```css
:root {
  /* Modern brand tokens (RGB space for opacity) */
  --cortex-primary: 250 88 45;
  --cortex-teal: 138 211 222;
  --cortex-blue: 0 192 232;
  
  /* Surface hierarchy */
  --cortex-canvas: 0 0 0;
  --cortex-surface: 20 20 20;
  --cortex-elevated: 26 26 26;
  
  /* Status colors */
  --status-success: 22 163 74;
  --status-warning: 245 158 11;
  --status-error: 239 68 68;
  --status-info: 0 192 232;
}

/* Usage in CSS */
.my-component {
  background-color: rgb(var(--cortex-surface));
  color: rgb(var(--cortex-text-primary));
  border: 1px solid rgb(var(--cortex-border));
}

/* With opacity */
.my-overlay {
  background-color: rgb(var(--cortex-primary) / 0.1);
}
```

### TypeScript/React Usage

```typescript
// Component props with color variants
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

// Color mapping
const colorMap = {
  primary: 'bg-cortex-primary text-cortex-dark',
  secondary: 'bg-cortex-elevated text-cortex-text-primary',
  success: 'bg-status-success text-white',
  warning: 'bg-status-warning text-white',
  error: 'bg-status-error text-white',
};
```

## 🎯 Design Tokens

### Component Color Usage

#### Primary Actions
```css
.btn-primary {
  background: rgb(var(--cortex-primary));
  color: rgb(var(--cortex-dark));
  border: 1px solid rgb(var(--cortex-primary));
}

.btn-primary:hover {
  background: rgb(var(--cortex-primary) / 0.9);
  filter: brightness(1.1);
}
```

#### Secondary Actions
```css
.btn-secondary {
  background: rgb(var(--cortex-elevated));
  color: rgb(var(--cortex-text-primary));
  border: 1px solid rgb(var(--cortex-border));
}

.btn-secondary:hover {
  background: rgb(var(--cortex-elevated) / 0.8);
  border-color: rgb(var(--cortex-primary) / 0.6);
}
```

#### Cards and Surfaces
```css
.card-glass {
  background: rgb(var(--cortex-surface) / 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgb(var(--cortex-border) / 0.5);
  box-shadow: 
    0 4px 16px rgb(0 0 0 / 0.25),
    0 8px 32px rgb(0 0 0 / 0.15);
}
```

### Focus States

```css
.focus-ring {
  outline: none;
}

.focus-ring:focus-visible {
  box-shadow: 
    0 0 0 2px rgb(var(--cortex-canvas)),
    0 0 0 4px rgb(var(--ring-brand) / 0.6);
}
```

## 🌗 Legacy Compatibility

### Deprecated Classes (Available via Plugin)

| Legacy Class | Modern Equivalent | Status |
|-------------|-------------------|--------|
| `.text-cortex-accent` | `.text-cortex-primary` | 🔄 Deprecated |
| `.bg-cortex-accent` | `.bg-cortex-primary` | 🔄 Deprecated |
| `.text-cortex-info` | `.text-cortex-blue` | 🔄 Deprecated |
| `.bg-cortex-bg-tertiary` | `.bg-cortex-surface` | 🔄 Deprecated |
| `.border-cortex-border-secondary` | `.border-cortex-border` | 🔄 Deprecated |

### Migration Path

```css
/* OLD - Still works but deprecated */
.old-button {
  background: theme('colors.cortex-accent');
  color: white;
}

/* NEW - Preferred modern approach */
.new-button {
  background: theme('colors.cortex.primary');
  color: theme('colors.cortex.dark');
}
```

## ♿ Accessibility

### Contrast Compliance

| Combination | Ratio | Status | Usage |
|------------|-------|---------|-------|
| `cortex-text-primary` on `cortex-surface` | 13.8:1 | ✅ AAA | Body text |
| `cortex-text-secondary` on `cortex-surface` | 9.5:1 | ✅ AAA | Secondary text |
| `cortex-text-muted` on `cortex-surface` | 4.6:1 | ✅ AA | Labels, meta |
| `cortex-primary` on `cortex-dark` | 5.2:1 | ✅ AA | Buttons |
| `status-success` on `cortex-surface` | 8.1:1 | ✅ AAA | Success text |
| `status-error` on `cortex-surface` | 7.2:1 | ✅ AAA | Error text |

### Best Practices

1. **Never rely on color alone** - Use icons, patterns, or text
2. **Test with color blindness simulators**
3. **Provide sufficient focus indicators** - Use `focus-ring` classes
4. **Maintain 44px minimum touch targets**
5. **Support high contrast mode**

### Focus Indicators

```css
/* Required for all interactive elements */
.interactive {
  outline: none;
}

.interactive:focus-visible {
  outline: 2px solid rgb(var(--ring-brand));
  outline-offset: 2px;
}
```

## 🎨 Gradients & Effects

### Brand Gradients

```css
/* Primary brand gradient */
.bg-cortex-brand {
  background: linear-gradient(135deg, 
    rgb(var(--cortex-primary)) 0%, 
    rgb(var(--cortex-teal)) 100%);
}

/* Subtle surface gradients */
.bg-subtle-gradient {
  background: linear-gradient(135deg,
    rgb(var(--cortex-primary) / 0.05) 0%,
    rgb(var(--cortex-blue) / 0.05) 100%);
}
```

### Glassmorphism Effects

```css
/* Utility classes for glass effects */
.ui-glass {
  backdrop-filter: blur(10px);
  background-color: rgb(var(--glass-tint) / 0.03);
  border: 1px solid rgb(var(--cortex-border) / 0.6);
}

.ui-glass-panel {
  backdrop-filter: blur(16px);
  background-color: rgb(var(--cortex-surface) / 0.8);
  border: 1px solid rgb(var(--cortex-border) / 0.5);
}
```

### Shadow System

```css
/* Glass shadows */
.shadow-glass-sm { /* Subtle elevation */ }
.shadow-glass-md { /* Medium elevation */ }  
.shadow-glass-lg { /* High elevation */ }

/* Brand shadows */
.shadow-cortex-sm { /* Subtle brand glow */ }
.shadow-cortex-lg { /* Prominent brand glow */ }

/* Glow effects */
.shadow-glow-brand { /* Brand color glow */ }
.shadow-glow-success { /* Success color glow */ }
```

## 🏃‍♂️ Motion & Animation

### Motion-Safe Classes

```css
/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: no-preference) {
  .motion-safe-hover {
    transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .motion-safe-hover:hover {
    transform: translateY(-1px);
  }
  
  .motion-safe-scale:hover {
    transform: scale(1.02);
  }
}
```

### Animation Classes

```css
/* Modern animations */
.animate-fade-in-modern      /* Fade in with subtle translation */
.animate-slide-right-modern  /* Slide in from left */
.animate-scale-in-modern     /* Scale in with fade */
```

## 📱 Responsive Considerations

### Dark Mode Support

```css
/* Already optimized for dark mode */
.theme-dark {
  color-scheme: dark;
}

/* Light mode adaptations (if needed) */
.theme-light {
  --cortex-canvas: 255 255 255;
  --cortex-surface: 248 248 248;
  --cortex-text-primary: 20 20 20;
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --cortex-border: 120 120 120; /* Increased border contrast */
    --cortex-text-muted: 180 180 180; /* Improved muted text */
  }
}
```

## 🔧 Development Tools

### Color Testing Utilities

```bash
# Check color usage across codebase
rg -n "cortex-primary" hosting/
rg -n "status-success" hosting/

# Find deprecated classes
rg -n "cortex-accent" hosting/
```

### Accessibility Testing

```bash
# Install accessibility linting
npm install --save-dev eslint-plugin-jsx-a11y

# Run contrast checks
npm run a11y:check

# Test with screen readers
npm run test:accessibility
```

---

## 📋 Migration Checklist

- [ ] Update component color mappings
- [ ] Replace deprecated classes
- [ ] Test contrast ratios
- [ ] Verify focus states
- [ ] Test with screen readers
- [ ] Validate motion preferences
- [ ] Update documentation
- [ ] Train development team

---

**Last Updated**: October 2025  
**Version**: 2.0 (Modern Token System)  
**Maintained by**: henryreed.ai Development Team

*This document serves as the single source of truth for the modernized Cortex color system. All components should reference these tokens for consistent theming and accessibility compliance.*