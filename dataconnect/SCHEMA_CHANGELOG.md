# Schema Changelog

## Overview
This file tracks all modifications to the Data Connect schema for the Cortex DC Portal project.

## Schema Files
- **Primary Schema**: `dataconnect/schema/schema.gql`
- **Backup**: `dataconnect/schema/schema.gql.bak`
- **Connector Config**: `dataconnect/example/connector.yaml`

## Naming Convention Changes

### 2025-10-07 - PascalCase Compliance
**Issue**: Firebase Data Connect linter requires type names to be in PascalCase
**Changes**:
- `POV` → `Pov` (type name change)
- `TRR` → `Trr` (type name change)

**Impact**:
- All generated types will use new naming
- Generated SDK operations will change from `pOV_insert` to `pov_insert`
- Auto-generated Query/Mutation fields will be lowercase

**Files Modified**:
- [x] `dataconnect/schema/schema.gql` - Type names updated to Pov and Trr
- [ ] All generated SDK files will be updated automatically

## Field Mapping Documentation

### User Type Fields (Current)
```graphql
type User @table {
  id: String! @default(expr: "auth.uid")
  email: String! @col(dataType: "varchar(255)")
  displayName: String @col(dataType: "varchar(100)")
  role: String @col(dataType: "varchar(50)") @default(expr: "'user'")
  organization: String @col(dataType: "varchar(100)")
  createdAt: Date! @default(expr: "request.time")
  lastLoginAt: Date
  isActive: Boolean! @default(expr: "true")
}
```

### Pov Type Fields (Current)
```graphql
type Pov @table {
  id: UUID! @default(expr: "uuidV4()")
  name: String! @col(dataType: "varchar(200)")
  customer: String! @col(dataType: "varchar(100)")
  # ... (see schema.gql for complete definition)
}
```

### Trr Type Fields (Current)
```graphql
type Trr @table {
  id: UUID! @default(expr: "uuidV4()")
  title: String! @col(dataType: "varchar(200)")
  description: String! @col(dataType: "text")
  # ... (see schema.gql for complete definition)
}
```

## Deprecated Fields/Types

### Legacy Movie Schema (Removed)
The following were part of an outdated movie example and are no longer supported:
- `movie`, `movies` queries
- `review_insert`, `review_upsert`, `review_delete` mutations
- `username` field on User type (was never implemented)
- `reviews_on_user` relationship (was never implemented)

## Migration Notes

### For Developers
1. Update all imports using old type names
2. Replace hardcoded field references with current schema fields
3. Use the auto-generated SDK types for type safety

### For Generated Examples
Example queries and mutations are now auto-generated to prevent drift from the schema.