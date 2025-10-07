# Color Reference Guide

This document provides a comprehensive reference for all brand colors, Tailwind CSS mappings, and accessibility guidelines for the Palo Alto Networks branding system.

## Table of Contents

1. [Brand Color Palette](#brand-color-palette)
2. [Tailwind CSS Classes](#tailwind-css-classes)
3. [Accessibility Guidelines](#accessibility-guidelines)
4. [Color Usage Examples](#color-usage-examples)
5. [Semantic Color System](#semantic-color-system)
6. [Gradient Definitions](#gradient-definitions)
7. [Implementation Reference](#implementation-reference)

---

## Brand Color Palette

### Palo Alto Networks Primary Colors

| Color Name | Hex Value | RGB | HSL | Usage |
|------------|-----------|-----|-----|--------|
| **Primary Orange** | `#FA582D` | rgb(250, 88, 45) | hsl(12, 95%, 58%) | Primary CTAs, brand emphasis |
| **Dark Orange** | `#da532c` | rgb(218, 83, 44) | hsl(13, 71%, 51%) | Hover states, darker variants |
| **Dark Gray** | `#141414` | rgb(20, 20, 20) | hsl(0, 0%, 8%) | Primary text, headers |

### Cortex Product Colors

| Color Name | Hex Value | RGB | HSL | Usage |
|------------|-----------|-----|-----|--------|
| **Cortex Primary** | `#FA582D` | rgb(250, 88, 45) | hsl(12, 95%, 58%) | Consistent with Palo Alto primary |
| **Cortex Teal** | `#8ad3de` | rgb(138, 211, 222) | hsl(188, 54%, 71%) | Accent colors, highlights |
| **Cortex Blue** | `#00c0e8` | rgb(0, 192, 232) | hsl(190, 100%, 45%) | Interactive elements |
| **Cortex Dark** | `#141414` | rgb(20, 20, 20) | hsl(0, 0%, 8%) | Text consistency |

### Semantic Colors

| Purpose | Color Name | Hex Value | RGB | Usage |
|---------|------------|-----------|-----|--------|
| **Success** | Success Green | `#10B981` | rgb(16, 185, 129) | Success states, confirmations |
| **Warning** | Warning Amber | `#F59E0B` | rgb(245, 158, 11) | Warnings, cautions |
| **Danger** | Danger Red | `#EF4444` | rgb(239, 68, 68) | Errors, destructive actions |
| **Info** | Info Teal | `#8ad3de` | rgb(138, 211, 222) | Information, neutral alerts |

### Neutral Color Scale

| Shade | Hex Value | RGB | Usage |
|-------|-----------|-----|--------|
| **White** | `#FFFFFF` | rgb(255, 255, 255) | Backgrounds, inverted text |
| **Gray 50** | `#F9FAFB` | rgb(249, 250, 251) | Light backgrounds |
| **Gray 100** | `#F3F4F6` | rgb(243, 244, 246) | Card backgrounds |
| **Gray 200** | `#E5E7EB` | rgb(229, 231, 235) | Borders, dividers |
| **Gray 300** | `#D1D5DB` | rgb(209, 213, 219) | Disabled elements |
| **Gray 400** | `#9CA3AF` | rgb(156, 163, 175) | Placeholder text |
| **Gray 500** | `#6B7280` | rgb(107, 114, 128) | Secondary text |
| **Gray 600** | `#4B5563` | rgb(75, 85, 99) | Body text |
| **Gray 700** | `#374151` | rgb(55, 65, 81) | Emphasized text |
| **Gray 800** | `#1F2937` | rgb(31, 41, 55) | Headers |
| **Gray 900** | `#111827` | rgb(17, 24, 39) | High contrast text |
| **Black** | `#000000` | rgb(0, 0, 0) | Maximum contrast |

---

## Tailwind CSS Classes

### Background Colors

#### Brand Backgrounds
```css
/* Palo Alto Networks */
.bg-pan-orange           /* #FA582D */
.bg-pan-orange-dark      /* #da532c */
.bg-pan-gray            /* #141414 */

/* Cortex Colors */
.bg-cortex-primary      /* #FA582D */
.bg-cortex-teal         /* #8ad3de */
.bg-cortex-blue         /* #00c0e8 */
.bg-cortex-dark         /* #141414 */
```

#### Semantic Backgrounds
```css
.bg-success             /* #10B981 */
.bg-warning             /* #F59E0B */
.bg-danger              /* #EF4444 */
.bg-info                /* #8ad3de */
```

### Text Colors

#### Brand Text
```css
/* Palo Alto Networks */
.text-pan-orange        /* #FA582D */
.text-pan-orange-dark   /* #da532c */
.text-pan-gray          /* #141414 */

/* Cortex Colors */
.text-cortex-primary    /* #FA582D */
.text-cortex-teal       /* #8ad3de */
.text-cortex-blue       /* #00c0e8 */
.text-cortex-dark       /* #141414 */
```

#### Semantic Text
```css
.text-success           /* #10B981 */
.text-warning           /* #F59E0B */
.text-danger            /* #EF4444 */
.text-info              /* #8ad3de */
```

### Border Colors

```css
/* Brand Borders */
.border-pan-orange      /* #FA582D */
.border-cortex-teal     /* #8ad3de */
.border-cortex-primary  /* #FA582D */

/* Semantic Borders */
.border-success         /* #10B981 */
.border-warning         /* #F59E0B */
.border-danger          /* #EF4444 */
.border-info            /* #8ad3de */
```

### Ring Colors (Focus States)

```css
/* Focus rings for accessibility */
.ring-pan-orange        /* #FA582D with opacity */
.ring-cortex-teal       /* #8ad3de with opacity */
.ring-cortex-primary    /* #FA582D with opacity */
```

---

## Accessibility Guidelines

### Contrast Ratios

#### WCAG AA Compliance (Minimum 4.5:1 for normal text, 3:1 for large text)

| Background | Text Color | Contrast Ratio | Status | Use Case |
|------------|------------|----------------|--------|----------|
| White (#FFFFFF) | Pan Orange (#FA582D) | 4.52:1 | ✅ PASS | Links, emphasis |
| White (#FFFFFF) | Cortex Dark (#141414) | 15.3:1 | ✅ PASS | Body text |
| Pan Orange (#FA582D) | White (#FFFFFF) | 4.52:1 | ✅ PASS | Primary buttons |
| Pan Orange (#FA582D) | Black (#000000) | 3.49:1 | ⚠️ Large text only | Large headings |
| Cortex Teal (#8ad3de) | Cortex Dark (#141414) | 8.2:1 | ✅ PASS | Accent elements |
| Cortex Teal (#8ad3de) | White (#FFFFFF) | 1.86:1 | ❌ FAIL | Avoid this combination |

#### WCAG AAA Compliance (Minimum 7:1 for normal text, 4.5:1 for large text)

| Background | Text Color | Contrast Ratio | Status | Use Case |
|------------|------------|----------------|--------|----------|
| White (#FFFFFF) | Cortex Dark (#141414) | 15.3:1 | ✅ PASS | Critical content |
| Pan Orange (#DA532C) | White (#FFFFFF) | 5.12:1 | ⚠️ Large text only | Enhanced buttons |
| Gray 100 (#F3F4F6) | Cortex Dark (#141414) | 14.1:1 | ✅ PASS | Card content |

### Color Accessibility Best Practices

1. **Never rely on color alone** to convey information
2. **Test with color blindness simulators** to ensure usability
3. **Provide alternative indicators** (icons, patterns, text)
4. **Use sufficient contrast** for all text elements
5. **Consider dark mode** implementations

### Color Blindness Considerations

#### Protanopia (Red-Green Colorblind)
- **Safe**: Cortex Teal (#8ad3de), Cortex Blue (#00c0e8)
- **Problematic**: Pan Orange (#FA582D) may appear brownish
- **Solution**: Use patterns or icons alongside orange elements

#### Deuteranopia (Red-Green Colorblind)
- **Safe**: Cortex Blue (#00c0e8), neutral grays
- **Problematic**: Pan Orange (#FA582D), Cortex Teal (#8ad3de)
- **Solution**: Ensure sufficient brightness contrast

#### Tritanopia (Blue-Yellow Colorblind)
- **Safe**: Pan Orange (#FA582D), neutral grays
- **Problematic**: Cortex Blue (#00c0e8), Cortex Teal (#8ad3de)
- **Solution**: Use high contrast combinations

---

## Color Usage Examples

### Primary Actions

```css
/* Primary CTA Button */
.btn-primary {
  background-color: #FA582D;  /* Pan Orange */
  color: #FFFFFF;             /* White text */
  border: 2px solid #FA582D;  /* Matching border */
}

.btn-primary:hover {
  background-color: #da532c;  /* Dark Orange */
  border-color: #da532c;     /* Matching border */
}
```

### Secondary Actions

```css
/* Secondary Button */
.btn-secondary {
  background-color: #8ad3de;  /* Cortex Teal */
  color: #141414;             /* Dark text */
  border: 2px solid #8ad3de;  /* Matching border */
}

.btn-secondary:hover {
  background-color: #6bc4d1;  /* Darker teal (80% opacity) */
}
```

### Status Indicators

```css
/* Success State */
.status-success {
  background-color: #10B981;  /* Success Green */
  color: #FFFFFF;             /* White text */
}

/* Warning State */
.status-warning {
  background-color: #F59E0B;  /* Warning Amber */
  color: #FFFFFF;             /* White text */
}

/* Error State */
.status-error {
  background-color: #EF4444;  /* Danger Red */
  color: #FFFFFF;             /* White text */
}

/* Info State */
.status-info {
  background-color: #8ad3de;  /* Info Teal */
  color: #141414;             /* Dark text */
}
```

---

## Semantic Color System

### State-Based Colors

#### Interactive States
```css
/* Default state */
.interactive-default {
  color: #00c0e8;            /* Cortex Blue */
}

/* Hover state */
.interactive-hover {
  color: #0099cc;            /* Darker blue */
}

/* Active/pressed state */
.interactive-active {
  color: #FA582D;            /* Pan Orange */
}

/* Focus state */
.interactive-focus {
  outline: 2px solid #FA582D; /* Pan Orange outline */
  outline-offset: 2px;
}

/* Disabled state */
.interactive-disabled {
  color: #9CA3AF;            /* Gray 400 */
  cursor: not-allowed;
}
```

#### Form States
```css
/* Valid input */
.form-valid {
  border-color: #10B981;     /* Success Green */
  background-color: #F0FDF4; /* Light green background */
}

/* Invalid input */
.form-invalid {
  border-color: #EF4444;     /* Danger Red */
  background-color: #FEF2F2; /* Light red background */
}

/* Warning input */
.form-warning {
  border-color: #F59E0B;     /* Warning Amber */
  background-color: #FFFBEB; /* Light yellow background */
}
```

---

## Gradient Definitions

### Brand Gradients

#### Primary Brand Gradient
```css
.bg-pan-gradient {
  background: linear-gradient(135deg, #FA582D 0%, #8ad3de 100%);
}
```

#### Reverse Brand Gradient
```css
.bg-pan-gradient-reverse {
  background: linear-gradient(135deg, #8ad3de 0%, #FA582D 100%);
}
```

#### Cortex Theme Gradient
```css
.bg-cortex-gradient {
  background: linear-gradient(135deg, #00c0e8 0%, #8ad3de 100%);
}
```

#### Subtle Brand Gradient
```css
.bg-pan-subtle {
  background: linear-gradient(135deg, #FA582D 0%, #da532c 100%);
}
```

### Gradient Usage Examples

```css
/* Hero section background */
.hero-bg {
  background: linear-gradient(135deg, #FA582D 0%, #8ad3de 100%);
  color: white;
}

/* Card accent gradient */
.card-accent {
  background: linear-gradient(90deg, #00c0e8 0%, #8ad3de 100%);
  height: 4px;
}

/* Button gradient hover effect */
.btn-gradient:hover {
  background: linear-gradient(135deg, #da532c 0%, #6bc4d1 100%);
  transition: background 0.3s ease;
}
```

---

## Implementation Reference

### CSS Custom Properties

Define colors as CSS custom properties for easier maintenance:

```css
:root {
  /* Palo Alto Networks Colors */
  --color-pan-orange: #FA582D;
  --color-pan-orange-dark: #da532c;
  --color-pan-gray: #141414;
  
  /* Cortex Colors */
  --color-cortex-primary: #FA582D;
  --color-cortex-teal: #8ad3de;
  --color-cortex-blue: #00c0e8;
  --color-cortex-dark: #141414;
  
  /* Semantic Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #8ad3de;
  
  /* Gradients */
  --gradient-pan-primary: linear-gradient(135deg, #FA582D 0%, #8ad3de 100%);
  --gradient-cortex-theme: linear-gradient(135deg, #00c0e8 0%, #8ad3de 100%);
}
```

### TypeScript Color Definitions

Access colors programmatically:

```typescript
import { brandColors } from '@/config/brand';

// Usage in components
const primaryColor = brandColors.paloAlto.orange;        // '#FA582D'
const accentColor = brandColors.cortex.teal;            // '#8ad3de'
const textColor = brandColors.cortex.dark;              // '#141414'

// Dynamic styling
const buttonStyle = {
  backgroundColor: brandColors.paloAlto.orange,
  color: 'white',
  borderColor: brandColors.paloAlto.orange,
};
```

### Responsive Color Usage

```css
/* Light mode (default) */
.theme-light {
  --bg-primary: #FFFFFF;
  --text-primary: #141414;
  --accent-color: #FA582D;
}

/* Dark mode */
.theme-dark {
  --bg-primary: #141414;
  --text-primary: #FFFFFF;
  --accent-color: #8ad3de;
}

/* High contrast mode */
.theme-high-contrast {
  --bg-primary: #000000;
  --text-primary: #FFFFFF;
  --accent-color: #FFFF00;
}
```

### Color Testing Utilities

```css
/* Development helper classes */
.debug-contrast-aa {
  position: relative;
}

.debug-contrast-aa::after {
  content: attr(data-contrast-ratio);
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 4px;
  font-size: 10px;
}

/* Usage: <div class="debug-contrast-aa" data-contrast-ratio="4.5:1">Content</div> */
```

---

## Color Tools and Resources

### Recommended Tools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser**: Free desktop application
- **Stark (Figma/Sketch Plugin)**: Design accessibility checker
- **Chrome DevTools**: Built-in contrast ratio checker

### Color Picker Values

For design tools, use these exact values:

```
Palo Alto Orange: #FA582D (RGB: 250, 88, 45)
Dark Orange: #da532c (RGB: 218, 83, 44)
Cortex Teal: #8ad3de (RGB: 138, 211, 222)
Cortex Blue: #00c0e8 (RGB: 0, 192, 232)
Cortex Dark: #141414 (RGB: 20, 20, 20)
```

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Maintained by**: henryreed.ai Development Team