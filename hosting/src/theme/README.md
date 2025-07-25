# Theme System

A comprehensive theming solution built on GitHub's dark theme palette with accessible contrast ratios and full light/dark mode support.

## Overview

This theme system provides:
- **Semantic color tokens** based on GitHub-dark palette
- **CSS Custom Properties** for runtime theme switching
- **localStorage persistence** with system preference detection
- **TypeScript support** with full type safety
- **Tailwind CSS integration** via CSS variables
- **Storybook documentation** for all components

## Quick Start

### 1. Setup Theme Provider

Wrap your app with the ThemeProvider:

```tsx
import { ThemeProvider } from './components/theme/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <YourAppContent />
    </ThemeProvider>
  );
}
```

### 2. Add Theme Toggle

```tsx
import { ThemeToggle } from './components/theme/ThemeToggle';

function Header() {
  return (
    <header className=\"flex justify-between items-center p-4\">
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  );
}
```

### 3. Use Theme Colors

```tsx
function MyComponent() {
  return (
    <div className=\"bg-canvas-default text-fg-default p-4 border border-border-default\">
      <h2 className=\"text-accent-fg\">Hello World</h2>
      <p className=\"text-fg-muted\">This adapts to light/dark mode automatically.</p>
    </div>
  );
}
```

## Color System

### Canvas (Backgrounds)
- `canvas-default` - Main background color
- `canvas-overlay` - Modal/dropdown backgrounds
- `canvas-inset` - Recessed areas (code blocks, inputs)
- `canvas-subtle` - Subtle background variations

### Foreground (Text)
- `fg-default` - Primary text color
- `fg-muted` - Secondary text (descriptions, labels)
- `fg-subtle` - Tertiary text (very subtle)
- `fg-on-emphasis` - Text on emphasized backgrounds

### Borders
- `border-default` - Standard border color
- `border-muted` - Subtle borders
- `border-subtle` - Very subtle borders

### Semantic Colors
Each semantic color has four variants:
- `{color}-fg` - Foreground/text color
- `{color}-emphasis` - Emphasized backgrounds
- `{color}-muted` - Muted backgrounds with some transparency
- `{color}-subtle` - Very subtle backgrounds with low transparency

Available semantic colors:
- `accent` - Primary actions (blue)
- `success` - Success states (green)
- `attention` - Warnings (yellow/orange)
- `danger` - Errors/destructive actions (red)

### Terminal Colors
Legacy terminal colors (maintained for compatibility):
- `terminal-green`, `terminal-amber`, `terminal-cyan`
- `terminal-red`, `terminal-blue`, `terminal-purple`

## Typography Scale

- **Font Families**: `font-sans`, `font-mono`, `font-terminal`
- **Sizes**: `text-xs` (12px) through `text-6xl` (60px)
- **Weights**: `font-thin` (100) through `font-black` (900)
- **Line Heights**: `leading-none` (1) through `leading-loose` (2)

## Spacing Scale

Based on 4px increments:
- `space-0.5` (2px) through `space-96` (384px)
- `rounded-none` through `rounded-3xl`
- Special shadows: `shadow-terminal`, `shadow-accent`

## Hooks

### useTheme

```tsx
import { useTheme } from './theme/useTheme';

function MyComponent() {
  const { 
    theme,           // 'light' | 'dark'
    systemTheme,     // System preference
    mounted,         // Hydration safe flag
    setTheme,        // Set theme manually
    toggleTheme,     // Toggle between light/dark
    resetToSystemTheme, // Reset to system preference
    isSystemTheme    // Whether using system preference
  } = useTheme();
  
  // Don't render theme-dependent content until mounted
  if (!mounted) return <LoadingSpinner />;
  
  return (
    <div>
      Current theme: {theme}
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}
```

### useThemeContext

Access theme from React Context (requires ThemeProvider):

```tsx
import { useThemeContext } from './components/theme/ThemeProvider';

function MyComponent() {
  const { theme, toggleTheme } = useThemeContext();
  // ... same API as useTheme
}
```

## Implementation Details

### CSS Custom Properties

The theme system uses CSS custom properties that are updated at runtime:

```css
:root {
  --color-canvas-default: #0d1117;
  --color-fg-default: #f0f6fc;
  /* ... etc */
}
```

These are referenced in Tailwind config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: {
          default: 'var(--color-canvas-default)',
          // ...
        }
      }
    }
  }
}
```

### System Preference Detection

Automatically detects and responds to system theme changes:

```tsx
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', handleSystemThemeChange);
```

### localStorage Persistence

User preferences are persisted across sessions:

```tsx
localStorage.setItem('theme-preference', 'dark');
```

### Accessibility

- All color combinations meet WCAG AA contrast requirements
- Keyboard navigation support
- Screen reader friendly
- Respects user's system preferences
- No flash of incorrect theme (FOIT prevention)

## Storybook Integration

Run Storybook to explore the theme system:

```bash
npm run storybook
```

Available stories:
- `Design System/Theme` - Complete documentation
- `Theme/ColorPalette` - Interactive color showcase
- `Theme/ThemeToggle` - Toggle component variants
- `Theme/ExampleComponent` - Integration examples

## Migration Guide

### From Existing Components

1. Replace hardcoded colors with semantic tokens:
   ```tsx
   // Before
   <div className=\"bg-gray-900 text-white border-gray-700\">
   
   // After
   <div className=\"bg-canvas-default text-fg-default border-border-default\">
   ```

2. Use appropriate semantic colors:
   ```tsx
   // Before
   <button className=\"bg-blue-600 text-white\">Submit</button>
   
   // After
   <button className=\"bg-accent-emphasis text-fg-on-emphasis\">Submit</button>
   ```

3. Consider theme-aware variations:
   ```tsx
   // Before
   <div className=\"bg-red-100 text-red-800\">Error</div>
   
   // After
   <div className=\"bg-danger-subtle text-danger-fg\">Error</div>
   ```

## Best Practices

1. **Use semantic tokens** instead of raw colors
2. **Test in both themes** during development
3. **Avoid hardcoded colors** in CSS/styles
4. **Use the provided hooks** for theme-dependent logic
5. **Follow the spacing scale** for consistency
6. **Leverage Storybook** for component development

## Browser Support

- Modern browsers with CSS Custom Properties support
- Graceful fallback to dark theme for older browsers
- No JavaScript required for basic theming (CSS-only fallback available)

## Performance

- Minimal runtime overhead (CSS custom properties only)
- No theme-dependent bundle splitting
- Efficient localStorage operations
- Optimized for server-side rendering
