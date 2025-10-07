# Branding Components API Documentation

This document provides comprehensive API documentation for all Palo Alto Networks and Cortex branding components.

## Table of Contents

1. [Import Structure](#import-structure)
2. [PaloAltoLogo Component](#paloaltologo-component)
3. [CortexIcon Component](#cortexicon-component)
4. [BrandedButton Component](#brandedbutton-component)
5. [Supporting Components](#supporting-components)
6. [Type Definitions](#type-definitions)
7. [Usage Patterns](#usage-patterns)

---

## Import Structure

### Basic Import
```typescript
import { PaloAltoLogo, CortexIcon, BrandedButton } from '@/components/branding';
```

### Individual Component Import
```typescript
import { PaloAltoLogo } from '@/components/branding/PaloAltoLogo';
import { CortexIcon } from '@/components/branding/CortexIcon';
import { BrandedButton } from '@/components/branding/BrandedButton';
```

### Type Imports
```typescript
import type { 
  PaloAltoLogoProps, 
  CortexIconProps, 
  BrandedButtonProps,
  LogoSize,
  IconSize,
  ButtonSize 
} from '@/components/branding';
```

---

## PaloAltoLogo Component

### Interface
```typescript
interface PaloAltoLogoProps {
  size?: LogoSize;                                          // 'sm' | 'md' | 'lg' | 'xl'
  className?: string;                                       // Additional CSS classes
  alt?: string;                                             // Alt text for accessibility
  onClick?: (event: React.MouseEvent<HTMLImageElement>) => void;  // Click handler
  clickable?: boolean;                                      // Adds hover effects
  priority?: boolean;                                       // Next.js Image priority
}
```

### Basic Usage
```tsx
// Default medium logo
<PaloAltoLogo />

// Large logo with custom styling
<PaloAltoLogo 
  size="lg" 
  className="my-4 drop-shadow-lg" 
/>

// Clickable logo with handler
<PaloAltoLogo 
  size="md" 
  clickable
  onClick={() => router.push('/')}
  priority
/>
```

### Size Specifications
| Size | Width | Height | Use Case |
|------|-------|--------|----------|
| sm   | 80px  | 15px   | Compact headers, mobile |
| md   | 120px | 23px   | Standard navigation |
| lg   | 160px | 31px   | Prominent placement |
| xl   | 200px | 38px   | Hero sections, marketing |

### PaloAltoLogoText Variant

For text-only scenarios:

```typescript
interface PaloAltoLogoTextProps {
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  size?: 'sm' | 'md' | 'lg';
}
```

```tsx
<PaloAltoLogoText 
  size="lg" 
  className="font-bold"
  onClick={handleLogoClick} 
/>
```

---

## CortexIcon Component

### Interface
```typescript
interface CortexIconProps {
  variant?: CortexVariant;                                  // 'xsiam' | 'xdr' | 'xsoar' | 'generic'
  size?: IconSize;                                          // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string;                                       // Additional CSS classes
  alt?: string;                                             // Custom alt text
  onClick?: (event: React.MouseEvent<HTMLImageElement>) => void;  // Click handler
  clickable?: boolean;                                      // Adds hover effects
  priority?: boolean;                                       // Next.js Image priority
}
```

### Basic Usage
```tsx
// Generic Cortex icon
<CortexIcon />

// XSIAM-specific icon
<CortexIcon 
  variant="xsiam" 
  size="lg" 
  clickable
/>

// Custom styling with click handler
<CortexIcon 
  variant="xdr" 
  size="md"
  className="transition-transform hover:scale-110"
  onClick={handleIconClick}
/>
```

### Icon Size Specifications
| Size | Dimensions | Use Case |
|------|------------|----------|
| xs   | 16x16px    | Inline icons |
| sm   | 20x20px    | List items |
| md   | 24x24px    | Standard UI |
| lg   | 32x32px    | Cards, buttons |
| xl   | 40x40px    | Prominent display |
| 2xl  | 48x48px    | Feature highlights |

### CortexBadge Variant

Combined icon and text component:

```typescript
interface CortexBadgeProps {
  variant?: CortexVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  iconOnly?: boolean;
}
```

```tsx
// Full badge with text
<CortexBadge variant="xsiam" size="md" />

// Icon-only badge
<CortexBadge 
  variant="xdr" 
  size="lg" 
  iconOnly
  onClick={handleBadgeClick}
/>
```

---

## BrandedButton Component

### Interface
```typescript
interface BrandedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;                                  // 'primary' | 'secondary' | 'outline' | 'cortex' | 'ghost'
  size?: ButtonSize;                                        // 'sm' | 'md' | 'lg'
  loading?: boolean;                                        // Shows loading spinner
  loadingText?: string;                                     // Text during loading
  leftIcon?: React.ReactNode;                               // Icon before text
  rightIcon?: React.ReactNode;                              // Icon after text
  fullWidth?: boolean;                                      // Full width button
  className?: string;                                       // Additional CSS classes
  children: React.ReactNode;                                // Button content
}
```

### Basic Usage
```tsx
// Primary button
<BrandedButton variant="primary" size="lg">
  Get Started
</BrandedButton>

// Secondary button with icon
<BrandedButton 
  variant="secondary" 
  size="md"
  leftIcon={<ChevronRightIcon />}
>
  Learn More
</BrandedButton>

// Loading state
<BrandedButton 
  variant="primary" 
  loading 
  loadingText="Processing..."
>
  Submit Form
</BrandedButton>
```

### Button Variants

#### Visual Examples
```tsx
// Primary CTA (Palo Alto Orange)
<BrandedButton variant="primary">Primary Action</BrandedButton>

// Secondary action (Cortex Teal)
<BrandedButton variant="secondary">Secondary Action</BrandedButton>

// Outlined style
<BrandedButton variant="outline">Outline Style</BrandedButton>

// Cortex-specific styling
<BrandedButton variant="cortex">Cortex Action</BrandedButton>

// Ghost/text-only button
<BrandedButton variant="ghost">Ghost Button</BrandedButton>
```

### Button Size Specifications
| Size | Font Size | Padding | Height | Use Case |
|------|-----------|---------|--------|----------|
| sm   | 0.875rem  | 0.5rem 0.75rem | 2rem | Compact spaces |
| md   | 1rem      | 0.625rem 1rem | 2.5rem | Standard UI |
| lg   | 1.125rem  | 0.75rem 1.25rem | 3rem | Prominent CTAs |

### Advanced Button Usage
```tsx
// Full-width button with icons
<BrandedButton 
  variant="primary"
  size="lg"
  fullWidth
  leftIcon={<PlayIcon />}
  rightIcon={<ArrowRightIcon />}
  onClick={handleSubmit}
  disabled={isSubmitting}
>
  Start Demo
</BrandedButton>

// Button with loading state
const [loading, setLoading] = useState(false);

<BrandedButton 
  variant="primary"
  loading={loading}
  loadingText="Saving..."
  onClick={async () => {
    setLoading(true);
    await saveData();
    setLoading(false);
  }}
>
  Save Changes
</BrandedButton>
```

---

## Supporting Components

### ButtonGroup Component

Groups related buttons with consistent spacing:

```typescript
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: ButtonSize;
}
```

```tsx
<ButtonGroup orientation="horizontal" size="md">
  <BrandedButton variant="outline">Cancel</BrandedButton>
  <BrandedButton variant="primary">Confirm</BrandedButton>
</ButtonGroup>

<ButtonGroup orientation="vertical" className="w-full">
  <BrandedButton variant="primary" fullWidth>Option 1</BrandedButton>
  <BrandedButton variant="secondary" fullWidth>Option 2</BrandedButton>
  <BrandedButton variant="outline" fullWidth>Option 3</BrandedButton>
</ButtonGroup>
```

---

## Type Definitions

### Core Types
```typescript
// Size types
type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type ButtonSize = 'sm' | 'md' | 'lg';

// Variant types
type CortexVariant = 'xsiam' | 'xdr' | 'xsoar' | 'generic';
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'cortex' | 'ghost';

// Brand configuration types
type BrandColorKey = keyof typeof brandColors;
type PaloAltoColorKey = keyof typeof brandColors.paloAlto;
type CortexColorKey = keyof typeof brandColors.cortex;
```

### Configuration Types
```typescript
// Brand configuration access
import { brandConfig, brandColors, brandAssets } from '@/components/branding';

// Access brand values
const primaryColor = brandColors.paloAlto.orange;        // '#FA582D'
const logoPath = brandAssets.logos.paloAlto;             // '/assets/branding/logos/pan-logo-dark.svg'
const logoSize = brandConfig.sizes.logo.md;             // { width: 120, height: 23 }
```

---

## Usage Patterns

### Common Layouts

#### Header with Navigation
```tsx
import { PaloAltoLogo, BrandedButton } from '@/components/branding';

const Header = () => (
  <header className="flex items-center justify-between p-4 bg-white border-b">
    <PaloAltoLogo size="md" clickable onClick={() => router.push('/')} />
    <nav className="flex space-x-4">
      <BrandedButton variant="ghost" size="sm">Products</BrandedButton>
      <BrandedButton variant="ghost" size="sm">Solutions</BrandedButton>
      <BrandedButton variant="primary" size="sm">Get Started</BrandedButton>
    </nav>
  </header>
);
```

#### Product Feature Card
```tsx
import { CortexBadge, BrandedButton } from '@/components/branding';

const FeatureCard = ({ title, description, productType }) => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-cortex-dark">{title}</h3>
      <CortexBadge variant={productType} size="sm" />
    </div>
    <p className="text-gray-600 mb-4">{description}</p>
    <BrandedButton variant="outline" size="sm" fullWidth>
      Learn More
    </BrandedButton>
  </div>
);
```

#### Call-to-Action Section
```tsx
import { PaloAltoLogo, BrandedButton, ButtonGroup } from '@/components/branding';

const CTASection = () => (
  <section className="bg-pan-gradient text-white p-12 text-center">
    <div className="max-w-4xl mx-auto">
      <PaloAltoLogo size="lg" className="mb-6 brightness-0 invert" />
      <h2 className="text-3xl font-bold mb-4">
        Experience Next-Generation Security
      </h2>
      <p className="text-xl mb-8 opacity-90">
        Discover how Cortex XSIAM transforms your security operations
      </p>
      <ButtonGroup orientation="horizontal">
        <BrandedButton variant="secondary" size="lg">
          Watch Demo
        </BrandedButton>
        <BrandedButton variant="outline" size="lg">
          Contact Sales
        </BrandedButton>
      </ButtonGroup>
    </div>
  </section>
);
```

### Responsive Patterns

#### Mobile-First Logo
```tsx
const ResponsiveLogo = () => {
  const logoSize = useMediaQuery('(min-width: 768px)') ? 'lg' : 'sm';
  
  return (
    <PaloAltoLogo 
      size={logoSize}
      className="transition-all duration-200"
      priority
    />
  );
};
```

#### Adaptive Button Groups
```tsx
const AdaptiveActions = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  return (
    <ButtonGroup 
      orientation={isMobile ? 'vertical' : 'horizontal'}
      size={isMobile ? 'md' : 'lg'}
    >
      <BrandedButton variant="primary" fullWidth={isMobile}>
        Primary Action
      </BrandedButton>
      <BrandedButton variant="secondary" fullWidth={isMobile}>
        Secondary Action
      </BrandedButton>
    </ButtonGroup>
  );
};
```

### Accessibility Best Practices

#### Screen Reader Support
```tsx
// Always provide meaningful alt text
<PaloAltoLogo 
  alt="Palo Alto Networks - Return to homepage"
  onClick={() => router.push('/')}
/>

// Use proper button labeling
<BrandedButton 
  aria-label="Start free trial of Cortex XSIAM"
  variant="primary"
>
  Start Free Trial
</BrandedButton>
```

#### Keyboard Navigation
```tsx
// Ensure focusable elements
<CortexBadge 
  variant="xsiam"
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
  role="button"
  aria-label="View Cortex XSIAM details"
/>
```

---

## Error Handling

### Component Error Boundaries
```tsx
// Fallback for logo loading errors
const LogoWithFallback = (props) => (
  <ErrorBoundary fallback={<PaloAltoLogoText {...props} />}>
    <PaloAltoLogo {...props} />
  </ErrorBoundary>
);
```

### Loading States
```tsx
// Handle loading states gracefully
const [logoLoaded, setLogoLoaded] = useState(false);

<div className="flex items-center">
  {!logoLoaded && (
    <div className="w-32 h-6 bg-gray-200 animate-pulse rounded" />
  )}
  <PaloAltoLogo 
    size="md"
    onLoad={() => setLogoLoaded(true)}
    className={logoLoaded ? 'opacity-100' : 'opacity-0'}
  />
</div>
```

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Maintained by**: henryreed.ai Development Team