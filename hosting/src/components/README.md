# UI Component Library

A comprehensive, accessible, and type-safe React component library built with TypeScript and Tailwind CSS.

## Features

- 🎨 **Theming Support**: Built-in dark/light theme system with CSS custom properties
- ♿ **Full Accessibility**: WCAG 2.1 AA compliant with proper ARIA attributes
- ⌨️ **Keyboard Navigation**: Complete keyboard support for all interactive components
- 🎭 **Motion-Safe Animations**: Respects `prefers-reduced-motion` user preferences
- 📱 **Responsive Design**: Mobile-first responsive components
- 🎯 **TypeScript**: Fully typed with comprehensive interfaces
- 🧪 **Testing Ready**: Built with testability in mind (data-testid support)

## Component Categories

### Layout Primitives
- `Container` - Responsive container with configurable max-width and spacing
- `Grid` - Flexible grid system with responsive column support
- `Section` - Semantic section wrapper with customizable spacing

### Navigation
- `Navbar` - Responsive navigation bar with mobile menu support
- `MobileDrawer` - Accessible slide-out drawer for mobile navigation
- `Breadcrumb` - Breadcrumb navigation with overflow handling
- `Footer` - Footer component with links and social media support

### Form Components
- `Button` - Versatile button with variants, sizes, and loading states
- `Input` - Text input with validation states, icons, and accessibility
- `Textarea` - Textarea with resize options and validation
- `Select` - Dropdown select with custom styling
- `Modal` - Accessible modal with focus management
- `Toast` - Notification toast with auto-dismiss and actions

### Content Components
- `Tag` - Closable tags with variants and icons
- `Badge` - Status badges with dot and pill variants
- `CodeBlock` - Syntax-highlighted code blocks with copy functionality
- `MarkdownRenderer` - Basic markdown renderer with custom styling

## Quick Start

```tsx
import {
  Container,
  Grid,
  Button,
  Input,
  Modal,
  Toast,
  Navbar,
  Footer
} from '@/components';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Navbar
        brand={<Logo />}
        items={[
          { label: 'Home', href: '/', isActive: true },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' }
        ]}
      />
      
      <Container maxWidth="lg" py="xl">
        <Grid columns={{ sm: 1, md: 2 }} gap="lg">
          <div>
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              isRequired
            />
          </div>
          <div>
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Open Modal
            </Button>
          </div>
        </Grid>
      </Container>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
      >
        <p>This is a modal with proper focus management!</p>
      </Modal>

      <Footer
        copyright="© 2024 Your Company"
        links={[
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' }
        ]}
      />
    </div>
  );
}
```

## Accessibility Features

### Focus Management
- Automatic focus management in modals and drawers
- Focus trapping within modal dialogs
- Proper focus restoration when closing overlays
- Visible focus indicators on all interactive elements

### Keyboard Navigation
- Full keyboard navigation support
- Arrow key navigation where appropriate
- Escape key handling for closing overlays
- Tab/Shift+Tab for sequential navigation

### Screen Reader Support
- Proper ARIA labels and descriptions
- Live regions for dynamic content updates
- Semantic HTML structure
- Hidden decorative elements from screen readers

### Color and Contrast
- WCAG AA compliant color contrast ratios
- Theme-aware color system
- Support for high contrast modes

## Theming

The component library uses CSS custom properties for theming:

```css
:root {
  /* Background colors */
  --color-canvas-default: #0d1117;
  --color-canvas-overlay: #161b22;
  --color-canvas-inset: #010409;
  --color-canvas-subtle: #21262d;
  
  /* Foreground colors */
  --color-fg-default: #f0f6fc;
  --color-fg-muted: #8b949e;
  --color-fg-subtle: #6e7681;
  --color-fg-on-emphasis: #ffffff;
  
  /* Status colors */
  --color-accent-fg: #58a6ff;
  --color-success-fg: #3fb950;
  --color-attention-fg: #d29922;
  --color-danger-fg: #f85149;
}
```

## Component Props

### Common Props
All components support these common props:

```tsx
interface BaseProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}
```

### Size Variants
Most components support standardized size variants:

```tsx
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
```

### Color Variants
Components with color variants support:

```tsx
type ColorVariant = 'default' | 'accent' | 'success' | 'attention' | 'danger';
```

## Motion and Animation

Components respect the user's motion preferences:

```tsx
// Motion-safe animations (default)
<Button respectMotionPreference={true}>
  Animate on motion-safe
</Button>

// Always animate
<Button respectMotionPreference={false}>
  Always animate
</Button>
```

## Testing

All components include `data-testid` props for reliable testing:

```tsx
<Button data-testid="submit-button">Submit</Button>
```

```tsx
// In your tests
const submitButton = screen.getByTestId('submit-button');
expect(submitButton).toBeInTheDocument();
```

## Customization

### Extending Components
Components can be easily extended with additional props:

```tsx
interface CustomButtonProps extends ButtonProps {
  customProp?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  customProp,
  ...buttonProps
}) => {
  return <Button {...buttonProps} className={`custom-class ${buttonProps.className}`} />;
};
```

### CSS Customization
Override component styles using Tailwind utilities:

```tsx
<Button className="!bg-purple-600 hover:!bg-purple-700">
  Custom Purple Button
</Button>
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

When adding new components:

1. Follow the established patterns for props and styling
2. Include proper TypeScript interfaces
3. Add accessibility attributes and keyboard handling
4. Support motion-safe animations
5. Include comprehensive JSDoc comments
6. Add to the appropriate index file

## Performance

- Components are built with performance in mind
- Minimal re-renders through proper React patterns
- CSS-in-JS is avoided in favor of Tailwind classes
- Lazy loading support for modal and drawer components
