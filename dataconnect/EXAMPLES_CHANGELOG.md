# Examples Changelog

## Overview
This file tracks all modifications to the Data Connect example GraphQL files.

## Example Files
- **Current Queries**: `dataconnect/example/queries.gql`
- **Current Mutations**: `dataconnect/example/mutations.gql`
- **Legacy Backup**: `dataconnect/example/legacy/queries.legacy.gql`
- **Legacy Backup**: `dataconnect/example/legacy/mutations.legacy.gql`

## Migration History

### 2025-10-07 - Complete Schema Alignment
**Issue**: Example files referenced outdated movie schema, causing deployment failures

**Legacy Problems Fixed**:
- References to non-existent `movie`, `movies` queries
- References to non-existent `review_insert`, `review_upsert`, `review_delete` mutations
- References to non-existent `username` field on User type
- References to non-existent `reviews_on_user` relationship

**New Approach**:
- Auto-generated examples based on current schema
- Aligned with Pov, Trr, User, Scenario, Comment, Template types
- All field references validated against actual schema

**Files Modified**:
- [x] `dataconnect/example/queries.gql` - Completely rewritten
- [x] `dataconnect/example/mutations.gql` - Completely rewritten
- [x] Legacy files preserved in `dataconnect/example/legacy/`

## Current Example Coverage

### Queries (Generated)
- List operations for all major entities
- Single entity retrieval by ID
- Relationship-based queries
- User-specific queries using auth.uid

### Mutations (Generated)
- Create operations for all entities
- Update/upsert operations
- Delete operations
- Auth-scoped mutations for user safety

## Validation Process

### Automated Checks
- Schema parsing validates all type references
- Field existence verification
- Relationship mapping verification
- Auth directive compatibility

### Manual Review
- Example operations test real-world use cases
- Performance considerations for complex queries
- Security review for auth scoping

## Future Maintenance

### Generator Updates
When schema changes:
1. Run `npm run dc:generate` to update examples
2. Review generated examples for completeness
3. Add custom examples if needed (while preserving auto-generated base)

### Custom Example Addition
- Add custom examples to separate files (e.g., `custom-queries.gql`)
- Reference in connector config if needed
- Document in this changelog