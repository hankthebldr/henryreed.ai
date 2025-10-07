# Palo Alto Networks & Cortex Branding Assets

This document outlines the Palo Alto Networks and Cortex branding assets integrated into the henryreed.ai project.

## Asset Directory Structure

```
public/
├── assets/
│   └── branding/
│       ├── logos/
│       │   └── pan-logo-dark.svg            # Main Palo Alto Networks logo
│       ├── icons/
│       │   ├── cortex-32x32.png            # Cortex favicon (32x32)
│       │   └── cortex-192x192.png          # Cortex large icon (192x192)
│       └── favicons/
│           └── favicon-32x32.png           # Standard Palo Alto favicon
├── favicon.ico                             # Site favicon (Cortex branded)
└── apple-touch-icon-180x180.png           # Apple touch icon
```

## Logo Assets

### Primary Logo
- **File**: `/public/assets/branding/logos/pan-logo-dark.svg`
- **Format**: SVG (scalable vector)
- **Usage**: Main branding, headers, navigation
- **Colors**: Orange (#FA582D), Dark Gray (#141414)
- **Dimensions**: 348x65 viewBox, scalable

## Icon Assets

### Cortex Icons
- **32x32**: `/public/assets/branding/icons/cortex-32x32.png`
- **192x192**: `/public/assets/branding/icons/cortex-192x192.png`
- **Usage**: Product-specific branding, Cortex XSIAM features

### Favicons
- **Standard**: `/public/assets/branding/favicons/favicon-32x32.png`
- **Apple Touch**: `/public/apple-touch-icon-180x180.png`
- **Active Favicon**: `/public/favicon.ico` (Cortex branded)

## Brand Colors

### Palo Alto Networks Primary
- **Primary Orange**: `#FA582D`
- **Dark Orange**: `#da532c` 
- **Dark Gray**: `#141414`

### Cortex/Secondary Colors
- **Teal**: `#8ad3de`
- **Light Blue**: `#00c0e8`

### Gradients
- **Branded Gradient**: `linear-gradient(45deg, #FA582D, #8ad3de)`

## Usage Guidelines

1. **Logo Usage**:
   - Use SVG format for scalability
   - Maintain aspect ratio (348:65)
   - Ensure adequate white space around logo

2. **Color Consistency**:
   - Primary orange (#FA582D) for CTAs and emphasis
   - Dark gray (#141414) for text content
   - Teal accent (#8ad3de) for highlights

3. **Icon Usage**:
   - Use Cortex icons for product-specific features
   - Maintain consistent sizing across the application

## Component Integration

Brand assets are integrated through reusable TypeScript components:

- `PaloAltoLogo` - Main logo component
- `CortexIcon` - Product-specific icons
- `BrandedButton` - Consistently styled buttons

See component documentation in `/src/components/branding/` for detailed API usage.

## Legal Notice

These assets are derived from Palo Alto Networks' publicly available brand materials and are used in accordance with their trademark guidelines. All trademarks are property of Palo Alto Networks, Inc.

---

**Last Updated**: October 2025  
**Assets Source**: Palo Alto Networks Official Website  
**Integration**: henryreed.ai TypeScript/Next.js Application