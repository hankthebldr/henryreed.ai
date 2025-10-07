# UI Modernization Archive

This document tracks all legacy code that has been commented out during the UI modernization process, ensuring we can easily revert or reference original implementations.

## Feature Flag Usage

The modernization is gated behind `NEXT_PUBLIC_UI_V2` environment variable:
- `true` = New Chakra UI + Tremor components
- `false` = Legacy components (fallback)

## Component Migration Tracking

### Files Modified
- [ ] `components/POVProjectManagement.tsx` - Dashboard stats and progress bars
- [ ] `components/CortexDCTerminal.tsx` - Terminal interface styling
- [ ] `app/layout.tsx` - Provider integration
- [ ] New: `components/layout/AppShell.tsx` - Modern navigation
- [ ] New: `app/admin/page.tsx` - React Admin portal

### Legacy Code References

#### POVProjectManagement.tsx
- **Location**: Dashboard stats cards (lines TBD)
- **Replacement**: Chakra Card components with glass variant
- **V1 Code**: Wrapped in `{/* V1_LEGACY: ... */}` comments
- **V2 Reference**: See chakra-based implementation below

#### Terminal Components  
- **Location**: Terminal container styling
- **Replacement**: Chakra Card with responsive toolbar
- **V1 Code**: Preserved in comments with V1_LEGACY marker

## Rollback Instructions

1. Set `NEXT_PUBLIC_UI_V2=false` in `.env.local`
2. Restart development server
3. All legacy components will be active immediately

## Notes

- Never delete original code during modernization
- All legacy JSX is commented with `V1_LEGACY:` prefix
- New components reference legacy versions in file headers