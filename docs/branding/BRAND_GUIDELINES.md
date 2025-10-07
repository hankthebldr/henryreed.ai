# Palo Alto Networks & Cortex Brand Guidelines

This document outlines the official brand guidelines for integrating Palo Alto Networks and Cortex branding into the henryreed.ai application.

## Table of Contents

1. [Brand Overview](#brand-overview)
2. [Color Usage Guidelines](#color-usage-guidelines)
3. [Logo Usage Guidelines](#logo-usage-guidelines)
4. [Typography Guidelines](#typography-guidelines)
5. [Iconography Guidelines](#iconography-guidelines)
6. [Do's and Don'ts](#dos-and-donts)
7. [Implementation Examples](#implementation-examples)

---

## Brand Overview

### Palo Alto Networks Brand Identity
Palo Alto Networks is a leading cybersecurity company focused on preventing cyberattacks. The brand represents innovation, reliability, and cutting-edge security technology.

**Core Brand Values:**
- **Innovation**: Leading the industry with groundbreaking security solutions
- **Trust**: Providing reliable protection for organizations worldwide  
- **Expertise**: Deep cybersecurity knowledge and industry leadership
- **Partnership**: Collaborative approach to security challenges

### Cortex Product Line
Cortex represents Palo Alto Networks' AI-driven security operations platform, including:
- **Cortex XSIAM**: Extended Security Intelligence and Automation Management
- **Cortex XDR**: Extended Detection and Response
- **Cortex XSOAR**: Security Orchestration, Automation and Response

---

## Color Usage Guidelines

### Primary Brand Colors

#### Palo Alto Networks Orange
- **Primary Orange**: `#FA582D`
- **Dark Orange**: `#da532c`
- **Usage**: Primary CTAs, emphasis, brand recognition
- **Accessibility**: Ensure sufficient contrast (4.5:1 minimum) when used with text

#### Cortex Color Palette
- **Cortex Primary**: `#FA582D` (consistent with Palo Alto primary)
- **Cortex Teal**: `#8ad3de` (theme accent color)
- **Cortex Blue**: `#00c0e8` (interactive elements)
- **Cortex Dark**: `#141414` (text and dark elements)

### Color Application Rules

1. **Primary Actions**: Use Palo Alto Orange (`#FA582D`) for:
   - Primary buttons and CTAs
   - Important links and navigation
   - Form focus states
   - Brand emphasis

2. **Secondary Actions**: Use Cortex Teal (`#8ad3de`) for:
   - Secondary buttons
   - Information highlights
   - Accent colors
   - Status indicators

3. **Interactive Elements**: Use Cortex Blue (`#00c0e8`) for:
   - Hover states
   - Active states
   - Interactive feedback
   - Link colors

4. **Text and Content**: Use Cortex Dark (`#141414`) for:
   - Primary text content
   - Headings and labels
   - Navigation text
   - Form labels

### Color Combinations

#### Recommended Combinations
- **Orange on White**: High contrast, excellent readability
- **White on Orange**: Primary button styling
- **Teal on Dark**: Accent highlighting
- **Dark on Light Gray**: Body text

#### Avoid These Combinations
- Orange on Teal (poor contrast)
- Light colors on light backgrounds
- Dark colors on dark backgrounds without sufficient contrast

---

## Logo Usage Guidelines

### Palo Alto Networks Logo

#### Logo Specifications
- **File Format**: SVG (preferred), PNG for raster needs
- **Aspect Ratio**: 348:65 (maintain at all sizes)
- **Minimum Size**: 80px width for digital applications
- **Clear Space**: Minimum 1/2 logo height on all sides

#### Logo Placement
1. **Headers/Navigation**: 
   - Use medium size (120px width)
   - Left-aligned in navigation bars
   - Maintain consistent positioning

2. **Footers**: 
   - Use small to medium size
   - Center or left-aligned
   - Include trademark notice if required

3. **Marketing Materials**: 
   - Use large size (160px+ width)
   - Prominent placement
   - Ensure high visibility

#### Logo Variants
- **Primary Logo**: Full color on light backgrounds
- **Monochrome**: When color reproduction is limited
- **Reverse**: White logo on dark backgrounds (create as needed)

### Logo Don'ts
- ❌ Don't stretch or skew the logo
- ❌ Don't change logo colors
- ❌ Don't add effects (shadows, gradients, etc.)
- ❌ Don't place logo on busy backgrounds
- ❌ Don't use logo smaller than minimum size
- ❌ Don't rotate the logo

---

## Typography Guidelines

### Font Hierarchy

#### Primary Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

#### Font Weights
- **Light (300)**: Subtle text, disclaimers
- **Normal (400)**: Body text, descriptions
- **Medium (500)**: Subheadings, emphasized text
- **Semibold (600)**: Section headers, navigation
- **Bold (700)**: Main headings, CTAs
- **Extrabold (800)**: Display text, hero headings

#### Font Sizes
- **Display**: 3rem+ (48px+) - Hero headings
- **H1**: 2.25rem (36px) - Page titles
- **H2**: 1.875rem (30px) - Section headings
- **H3**: 1.5rem (24px) - Subsection headings
- **H4**: 1.25rem (20px) - Component headings
- **Body**: 1rem (16px) - Primary text
- **Small**: 0.875rem (14px) - Secondary text, captions

### Typography Best Practices

1. **Hierarchy**: Establish clear visual hierarchy using size, weight, and color
2. **Line Height**: Use 1.5x font size for body text readability
3. **Letter Spacing**: Minimal adjustments, rely on font's natural spacing
4. **Contrast**: Maintain 4.5:1 contrast ratio for normal text, 3:1 for large text

---

## Iconography Guidelines

### Cortex Icons

#### Icon Usage
- Use Cortex-specific icons for product features
- 32x32px for standard UI elements
- 192x192px for cards and prominent displays
- Maintain square aspect ratio

#### Icon Placement
- **Navigation**: 24px icons with 8px spacing
- **Buttons**: 20px icons with 8px margin from text
- **Cards**: 48px+ icons centered or left-aligned
- **Lists**: 16px-20px icons aligned with first line of text

#### Icon Colors
- Use brand colors for accent icons
- Use neutral colors for functional icons
- Maintain sufficient contrast with backgrounds

---

## Do's and Don'ts

### Do's ✅

#### Brand Implementation
- **Do** use official brand colors and assets
- **Do** maintain consistent logo placement and sizing
- **Do** ensure proper contrast ratios for accessibility
- **Do** follow the established component hierarchy
- **Do** test branding across different devices and screen sizes
- **Do** document any brand variations for team consistency

#### Technical Implementation
- **Do** use the provided TypeScript components
- **Do** leverage Tailwind CSS brand classes
- **Do** optimize assets for web performance
- **Do** implement proper alt text for accessibility
- **Do** use Next.js Image component for logo assets

### Don'ts ❌

#### Brand Violations
- **Don't** modify official brand colors or logos
- **Don't** use outdated or unofficial brand assets
- **Don't** place logos on backgrounds with insufficient contrast
- **Don't** stretch, skew, or distort brand elements
- **Don't** create custom variations of official logos

#### Technical Violations
- **Don't** hardcode brand values outside the brand system
- **Don't** use raster images when vectors are available
- **Don't** ignore accessibility guidelines
- **Don't** implement brand elements without proper responsive behavior

---

## Implementation Examples

### Component Usage

#### Basic Logo Implementation
```tsx
import { PaloAltoLogo } from '@/components/branding';

// Header usage
<PaloAltoLogo size="md" className="navbar-logo" priority />

// Footer usage
<PaloAltoLogo size="sm" className="footer-logo" />
```

#### Button Implementation
```tsx
import { BrandedButton } from '@/components/branding';

// Primary CTA
<BrandedButton variant="primary" size="lg">
  Get Started with XSIAM
</BrandedButton>

// Secondary action
<BrandedButton variant="secondary" size="md">
  Learn More
</BrandedButton>
```

#### Product Badge Implementation
```tsx
import { CortexBadge } from '@/components/branding';

// Product highlighting
<CortexBadge variant="xsiam" size="lg" />
<CortexBadge variant="xdr" size="md" />
```

### CSS Class Usage

#### Tailwind Brand Classes
```css
/* Primary orange backgrounds */
.bg-pan-orange
.bg-pan-orange-dark

/* Text colors */
.text-pan-orange
.text-cortex-dark

/* Accent colors */
.bg-cortex-teal
.text-cortex-blue

/* Gradients */
.bg-pan-gradient
.bg-cortex-gradient
```

---

## Legal and Compliance

### Trademark Usage
- Palo Alto Networks and Cortex are registered trademarks of Palo Alto Networks, Inc.
- Use official brand assets only as provided
- Do not modify trademark elements
- Include proper attribution when required

### Asset Sources
All brand assets in this implementation are derived from publicly available Palo Alto Networks brand materials and are used in accordance with their trademark guidelines.

---

## Support and Updates

### Brand System Maintenance
- **Updates**: Check for brand guideline updates quarterly
- **Assets**: Refresh assets from official sources annually
- **Compliance**: Review implementation against guidelines before major releases

### Contact
For questions about brand implementation or guideline interpretation, refer to:
- Palo Alto Networks official brand guidelines
- Internal brand compliance team
- Development team lead

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Maintained by**: henryreed.ai Development Team