# Shared Component Library

A comprehensive library of reusable components for managing POV, TRR, Scenario, and Demo resources.

## Components

### StatusBadge

A reusable badge component for displaying status, priority, and risk levels with appropriate color coding.

```tsx
import { StatusBadge } from '@/components/shared';

// Status badge
<StatusBadge status="active" variant="status" />

// Priority badge
<StatusBadge status="high" variant="priority" />

// Risk level badge
<StatusBadge status="critical" variant="risk" />

// Custom color mapping
<StatusBadge
  status="custom-state"
  variant="custom"
  colorMap={{ 'custom-state': 'bg-purple-500/20 text-purple-400 border-purple-500/30' }}
/>
```

**Props:**
- `status: string` - The status to display
- `variant?: 'status' | 'priority' | 'risk' | 'custom'` - Badge type (default: 'status')
- `colorMap?: Record<string, string>` - Custom color mapping
- `className?: string` - Additional CSS classes

### ResourceCard

A versatile card component for displaying resource items (POV, TRR, Scenario, Demo) with metadata, tags, and actions.

```tsx
import { ResourceCard } from '@/components/shared';

<ResourceCard
  id="TRR-2024-001"
  title="SIEM Integration Validation"
  description="Validate integration with customer existing SIEM solution..."
  status="in-progress"
  priority="high"
  riskLevel="medium"
  tags={['integration', 'siem', 'high-priority']}
  metadata={[
    { label: 'Assigned', value: 'John Smith' },
    { label: 'Customer', value: 'Acme Corp' },
    { label: 'Due', value: '2024-01-25' },
  ]}
  actions={[
    { label: 'View', icon: '👁️', onClick: () => {}, variant: 'outline' },
    { label: 'Edit', icon: '✏️', onClick: () => {}, variant: 'outline' },
  ]}
  secondaryActions={[
    { label: 'Delete', icon: '🗑️', onClick: () => {}, variant: 'danger' },
  ]}
  onSelect={(id, selected) => console.log(id, selected)}
  selected={false}
  onClick={() => console.log('Card clicked')}
/>
```

**Props:**
- `id: string` - Resource ID
- `title: string` - Resource title
- `description?: string` - Resource description
- `status: string` - Current status
- `priority?: string` - Priority level
- `riskLevel?: string` - Risk level
- `tags?: string[]` - Tags (displays first 3)
- `metadata: ResourceCardMetadata[]` - Array of metadata items
- `actions: ResourceCardAction[]` - Primary action buttons
- `secondaryActions?: ResourceCardAction[]` - Secondary action buttons (right-aligned)
- `onSelect?: (id: string, selected: boolean) => void` - Selection handler
- `selected?: boolean` - Selection state
- `onClick?: () => void` - Card click handler
- `className?: string` - Additional CSS classes

### UnifiedFilterBar

A comprehensive filter bar with search, status, priority, category filters, and custom filter slots.

```tsx
import { UnifiedFilterBar } from '@/components/shared';

<UnifiedFilterBar
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Search TRRs..."
  statusOptions={[
    { label: 'Draft', value: 'draft' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
  ]}
  selectedStatus={statusFilter}
  onStatusChange={setStatusFilter}
  priorityOptions={[
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
  ]}
  selectedPriority={priorityFilter}
  onPriorityChange={setPriorityFilter}
  categoryOptions={[
    { label: 'Security', value: 'security' },
    { label: 'Performance', value: 'performance' },
    { label: 'Integration', value: 'integration' },
  ]}
  selectedCategory={categoryFilter}
  onCategoryChange={setCategoryFilter}
  onClearFilters={() => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
  }}
/>
```

**Props:**
- `searchValue?: string` - Search input value
- `onSearchChange?: (value: string) => void` - Search change handler
- `searchPlaceholder?: string` - Search placeholder text
- `statusOptions?: FilterOption[]` - Status filter options
- `selectedStatus?: string` - Selected status value
- `onStatusChange?: (value: string) => void` - Status change handler
- `priorityOptions?: FilterOption[]` - Priority filter options
- `selectedPriority?: string` - Selected priority value
- `onPriorityChange?: (value: string) => void` - Priority change handler
- `categoryOptions?: FilterOption[]` - Category filter options
- `selectedCategory?: string` - Selected category value
- `onCategoryChange?: (value: string) => void` - Category change handler
- `customFilters?: React.ReactNode` - Additional custom filter elements
- `onClearFilters?: () => void` - Clear all filters handler
- `className?: string` - Additional CSS classes

### ListLayout

A layout wrapper for list views with header, stats cards, filter bar, bulk selection, and empty states.

```tsx
import { ListLayout, ResourceCard } from '@/components/shared';

<ListLayout
  title="TRR Management"
  subtitle="Technical Requirements Review management and tracking"
  icon="📋"
  actions={[
    { label: 'Import CSV', icon: '📤', onClick: handleImport, variant: 'outline' },
    { label: 'Create TRR', icon: '📝', onClick: handleCreate, variant: 'primary' },
  ]}
  items={trrs}
  selectedIds={selectedIds}
  onSelectAll={handleSelectAll}
  bulkActions={[
    { label: 'Bulk Export', icon: '📥', onClick: handleBulkExport, variant: 'outline' },
    { label: 'Bulk Update', icon: '🔄', onClick: handleBulkUpdate, variant: 'outline' },
  ]}
  stats={[
    { label: 'Total TRRs', value: trrs.length, color: 'text-cortex-text-primary' },
    { label: 'In Progress', value: inProgressCount, color: 'text-status-info' },
    { label: 'Completed', value: completedCount, color: 'text-cortex-primary' },
  ]}
  filterBar={
    <UnifiedFilterBar
      searchValue={search}
      onSearchChange={setSearch}
      statusOptions={statusOptions}
      selectedStatus={statusFilter}
      onStatusChange={setStatusFilter}
    />
  }
  emptyState={{
    icon: '📋',
    title: 'No TRRs Found',
    message: 'Create your first Technical Requirements Review to get started.',
    action: { label: 'Create TRR', icon: '📝', onClick: handleCreate, variant: 'primary' },
  }}
>
  {trrs.map((trr) => (
    <ResourceCard
      key={trr.id}
      {...trr}
      // ... props
    />
  ))}
</ListLayout>
```

**Props:**
- `title: string` - Page title
- `subtitle?: string` - Page subtitle
- `icon?: string` - Title icon
- `actions?: ListLayoutAction[]` - Header action buttons
- `items: { id: string }[]` - Array of items (for count and selection)
- `selectedIds?: string[]` - Array of selected item IDs
- `onSelectAll?: (selected: boolean) => void` - Select all handler
- `bulkActions?: ListLayoutBulkAction[]` - Bulk action buttons
- `filterBar?: React.ReactNode` - Filter bar component
- `stats?: Array<{ label: string; value: string | number; color?: string }>` - Stats cards
- `children: React.ReactNode` - List content (ResourceCard components)
- `emptyState?: { icon?: string; title: string; message: string; action?: ListLayoutAction }` - Empty state config
- `className?: string` - Additional CSS classes

### DetailLayout

A layout wrapper for detail views with header, tabs, and actions.

```tsx
import { DetailLayout } from '@/components/shared';

<DetailLayout
  title="SIEM Integration Validation"
  id="TRR-2024-001"
  status="in-progress"
  priority="high"
  phase="validation"
  actions={[
    { label: 'Generate Report', icon: '📊', onClick: handleReport, variant: 'primary' },
    { label: 'Edit', icon: '✏️', onClick: handleEdit, variant: 'outline' },
  ]}
  onBack={() => router.back()}
  tabs={[
    { id: 'overview', label: 'Overview', content: <OverviewTab /> },
    { id: 'timeline', label: 'Timeline', content: <TimelineTab /> },
    { id: 'comments', label: 'Comments', content: <CommentsTab /> },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

**Props:**
- `title: string` - Resource title
- `id: string` - Resource ID
- `status: string` - Current status
- `priority?: string` - Priority level
- `phase?: string` - Current phase
- `actions?: DetailLayoutAction[]` - Action buttons
- `onBack?: () => void` - Back button handler
- `tabs: DetailLayoutTab[]` - Tab configuration
- `activeTab: string` - Active tab ID
- `onTabChange: (tabId: string) => void` - Tab change handler
- `headerContent?: React.ReactNode` - Additional header content
- `className?: string` - Additional CSS classes

## Usage Patterns

### Filtering and Search

```tsx
const [search, setSearch] = useState('');
const [statusFilter, setStatusFilter] = useState('');

const filteredItems = items.filter(item => {
  const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = !statusFilter || item.status === statusFilter;
  return matchesSearch && matchesStatus;
});
```

### Bulk Selection

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);

const handleSelectAll = (selected: boolean) => {
  setSelectedIds(selected ? items.map(item => item.id) : []);
};

const handleSelect = (id: string, selected: boolean) => {
  setSelectedIds(prev =>
    selected ? [...prev, id] : prev.filter(i => i !== id)
  );
};
```

### Mobile Responsiveness

All components are mobile-responsive by default:
- `ResourceCard` metadata grid adjusts from 4 columns to 2 on mobile
- `ListLayout` stats grid adjusts based on number of stats
- `UnifiedFilterBar` stacks filters vertically on mobile
- All components use Tailwind's responsive classes

## Best Practices

1. **Consistent Data Structure**: Use the same data shape across similar resources (POV, TRR, Scenario, Demo)
2. **Memoization**: Wrap expensive filter/map operations with `useMemo` for better performance
3. **Accessibility**: All components include proper ARIA labels and keyboard navigation
4. **Mobile-First**: Design for mobile first, then enhance for desktop
5. **Type Safety**: Use TypeScript interfaces for all props and data structures

## Performance Considerations

- Use `React.memo` for `ResourceCard` when rendering large lists
- Implement virtual scrolling for lists with 50+ items using `@tanstack/react-virtual`
- Use `useMemo` for filtered/sorted data
- Consider pagination for very large datasets

## Migration Guide

### Migrating Existing Components

1. **Replace custom list headers** with `ListLayout`
2. **Replace custom card components** with `ResourceCard`
3. **Replace custom filter UI** with `UnifiedFilterBar`
4. **Replace custom detail views** with `DetailLayout`
5. **Replace inline status badges** with `StatusBadge`

### Example Migration

**Before:**
```tsx
<div className="cortex-card">
  <div className="p-6 border-b">
    <h3>TRR List ({trrs.length})</h3>
  </div>
  {trrs.map(trr => (
    <div key={trr.id} className="p-6">
      {/* Custom card markup */}
    </div>
  ))}
</div>
```

**After:**
```tsx
<ListLayout
  title="TRR Management"
  items={trrs}
  stats={[{ label: 'Total TRRs', value: trrs.length }]}
>
  {trrs.map(trr => (
    <ResourceCard key={trr.id} {...convertTRRToCardProps(trr)} />
  ))}
</ListLayout>
```

## Future Enhancements

- [ ] Add drag-and-drop reordering support
- [ ] Implement keyboard shortcuts for bulk actions
- [ ] Add CSV/Excel export utilities
- [ ] Create virtual scrolling variant for large lists
- [ ] Add dark mode theme variants
- [ ] Implement customizable column layouts
