# UI/TS Code Audit Framework

## Audit Scope

You are auditing React/TypeScript code for the Cortex DC Platform. Review the provided files against the following standards:

## 1. TypeScript Type Safety

### Required Standards
- [ ] All function parameters have explicit types
- [ ] All function return types are declared
- [ ] No usage of `any` type (use `unknown` if needed)
- [ ] Proper interface/type definitions for all props
- [ ] Generic types used appropriately
- [ ] No type assertions (`as Type`) without justification
- [ ] Discriminated unions for variant props

### Example Violations
```typescript
// ❌ BAD
function handleSubmit(data) { ... }
const user = data as User;

// ✅ GOOD
function handleSubmit(data: FormData): Promise<void> { ... }
const user: User | null = validateUser(data);
```

## 2. React Best Practices

### Required Standards
- [ ] Functional components with proper TypeScript interfaces
- [ ] Hooks rules followed (no conditional hooks)
- [ ] `useCallback` for functions passed as props
- [ ] `useMemo` for expensive computations
- [ ] `React.memo` for components that re-render frequently
- [ ] Proper key props in lists (no array indexes)
- [ ] No direct state mutation
- [ ] Cleanup in `useEffect` (abort signals, timers, subscriptions)

### Example Violations
```typescript
// ❌ BAD
export default function MyComponent(props: any) {
  if (condition) {
    const [value, setValue] = useState(0); // Conditional hook!
  }
  return items.map((item, idx) => <Item key={idx} {...item} />); // Index as key
}

// ✅ GOOD
export const MyComponent = React.memo<MyComponentProps>(({ items }) => {
  const [value, setValue] = useState(0);

  const handleClick = useCallback(() => {
    setValue(v => v + 1);
  }, []);

  return items.map(item => <Item key={item.id} onClick={handleClick} />);
});
```

## 3. Error Handling

### Required Standards
- [ ] All async operations wrapped in try-catch
- [ ] User-facing error messages (no raw error objects)
- [ ] Proper error boundaries for component trees
- [ ] Loading states for async operations
- [ ] Network error handling with retry logic
- [ ] Form validation error display

### Example Violations
```typescript
// ❌ BAD
const fetchData = async () => {
  const data = await api.get('/data'); // No error handling
  setData(data);
};

// ✅ GOOD
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await api.get('/data');
    setData(data);
  } catch (err) {
    console.error('Failed to fetch data:', err);
    setError('Unable to load data. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

## 4. Accessibility (a11y)

### Required Standards
- [ ] All interactive elements have accessible labels
- [ ] Proper semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- [ ] `aria-label` or `aria-labelledby` for icon-only buttons
- [ ] Keyboard navigation support (Enter, Space, Arrow keys)
- [ ] Focus management (tab order, focus trapping in modals)
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader text for visual-only information

### Example Violations
```typescript
// ❌ BAD
<div onClick={handleClick}>Submit</div>
<button><Icon /></button>

// ✅ GOOD
<button onClick={handleClick} type="submit">Submit</button>
<button aria-label="Close dialog" onClick={handleClose}>
  <XIcon />
</button>
```

## 5. Performance Considerations

### Required Standards
- [ ] Large lists use virtualization or pagination
- [ ] Images use proper loading strategies (lazy, eager)
- [ ] Expensive computations memoized
- [ ] Debounced/throttled event handlers (scroll, resize, input)
- [ ] Code splitting for large routes/components
- [ ] Avoid unnecessary re-renders (React.memo, useMemo)

## 6. Naming Conventions

### Required Standards
- [ ] Components: PascalCase (`UserProfile.tsx`)
- [ ] Hooks: camelCase with `use` prefix (`useAuth.ts`)
- [ ] Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- [ ] Functions: camelCase, descriptive verbs (`handleSubmit`, `fetchUserData`)
- [ ] Props interfaces: `ComponentNameProps`
- [ ] Boolean props: `is`, `has`, `should` prefix (`isLoading`, `hasError`)

## 7. Code Organization

### Required Standards
- [ ] One component per file (except tightly coupled helpers)
- [ ] Hooks in separate `hooks/` directory
- [ ] Shared types in `types/` directory
- [ ] Utils in `lib/` or `utils/` directory
- [ ] Contexts in `contexts/` directory
- [ ] Imports organized: React → Third-party → Local
- [ ] Max file length: 300 lines (split if larger)

## Audit Output Format

Provide your audit results in the following JSON format:

```json
{
  "status": "pass" | "warning" | "fail",
  "filesAudited": 5,
  "summary": "Brief summary of audit findings",
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "category": "type-safety" | "react-best-practices" | "error-handling" | "accessibility" | "performance" | "naming" | "organization",
      "message": "Description of the issue",
      "file": "path/to/file.tsx",
      "line": 42,
      "code": "const user = data as User;",
      "suggestion": "Use type guard: const user: User | null = validateUser(data);"
    }
  ],
  "recommendations": [
    "Consider extracting handleSubmit into a custom hook",
    "Add error boundary around async component tree"
  ],
  "metrics": {
    "typeErrors": 0,
    "a11yIssues": 2,
    "performanceWarnings": 1,
    "totalIssues": 3
  }
}
```

## Severity Levels

- **error**: Must be fixed before merge (type errors, critical a11y issues, unhandled async errors)
- **warning**: Should be fixed (missing memoization, non-semantic HTML, index keys)
- **info**: Nice to have (naming suggestions, file organization recommendations)

## Files to Audit

{{CHANGED_FILES}}

## Code to Review

{{FILE_CONTENTS}}
