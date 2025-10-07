# Terminal Architecture Deprecation Record

**Phase 12 Recovery Action**: Terminal architecture unification completed.

## Background
During the recovery audit (Phase 4), we identified **5 different terminal implementations** that were causing confusion and maintenance overhead. Per WARP.md guidance, `ImprovedTerminal.tsx` was identified as the canonical terminal implementation.

## Canonical Terminal
**✅ ACTIVE: `components/ImprovedTerminal.tsx`**
- **Focus**: Cortex DC Engagement Portal with comprehensive POV features
- **Features**: VFS filesystem, persistence, context storage, command history
- **Architecture**: Advanced command handling with async support
- **Status**: **Production ready and actively maintained**

## Deprecated Terminal Implementations

### 1. Basic Terminal (`components/Terminal.tsx`)
- **Original Path**: `hosting/components/Terminal.tsx`
- **Focus**: Basic XSIAM/Cortex terminal with simple commands
- **Features**: Basic command system, no persistence
- **Reason for Deprecation**: Superseded by ImprovedTerminal's comprehensive feature set
- **Migration Path**: All functionality merged into ImprovedTerminal
- **Status**: **Commented out exports, kept for reference**

### 2. Enhanced Terminal (`components/EnhancedTerminal.tsx`)  
- **Original Path**: `hosting/components/EnhancedTerminal.tsx`
- **Focus**: Security operations focused XSIAM terminal
- **Features**: Security scenario focus, MITRE mappings, Palo Alto branding
- **Reason for Deprecation**: Functional overlap with ImprovedTerminal scenario commands
- **Migration Path**: Security commands integrated into ImprovedTerminal via command modules
- **Status**: **Commented out exports, kept for reference**

### 3. Unified Terminal (`components/UnifiedTerminal.tsx`)
- **Original Path**: `hosting/components/UnifiedTerminal.tsx`
- **Focus**: Attempted unification of terminal features
- **Features**: Permissions system, cross-interface communication
- **Reason for Deprecation**: ImprovedTerminal provides cleaner architecture
- **Migration Path**: Permission concepts integrated into ImprovedTerminal context
- **Status**: **Commented out exports, kept for reference**

### 4. Cortex DC Terminal (`components/CortexDCTerminal.tsx`)
- **Original Path**: `hosting/components/CortexDCTerminal.tsx`
- **Focus**: Domain Consultant specific terminal
- **Features**: DC workflow integration
- **Reason for Deprecation**: ImprovedTerminal already serves DC Portal needs
- **Migration Path**: DC-specific commands available in ImprovedTerminal
- **Status**: **Commented out exports, kept for reference**

## Migration Summary

### Commands Preserved
All unique commands from deprecated terminals were analyzed and either:
1. **Already available** in ImprovedTerminal via command modules
2. **Integrated** into the comprehensive command system
3. **Enhanced** with ImprovedTerminal's advanced features (aliases, help, async support)

### Features Preserved  
- ✅ **Command History & Persistence** (ImprovedTerminal native)
- ✅ **VFS Filesystem** (ImprovedTerminal native)
- ✅ **Security Scenarios** (via lib/scenario-commands.tsx)
- ✅ **MITRE Mappings** (via scenario system)
- ✅ **POV Workflows** (ImprovedTerminal focus)
- ✅ **Context Storage** (ImprovedTerminal native)

### Architecture Benefits Post-Unification
- **Single source of truth** for terminal interface
- **Consistent UX** across the entire application  
- **Reduced bundle size** by eliminating redundant code
- **Easier maintenance** with centralized command system
- **Better testing** with single terminal implementation

## Rollback Information
If rollback is needed, the original terminal files are preserved with commented exports. To reactivate:
1. Uncomment the export in the desired terminal file
2. Update import statements in pages that use terminals
3. Restart development server

## Implementation Details
- **Date**: Recovery Phase 12
- **Method**: Comment out exports (per Rule: Never delete code)  
- **Preservation**: All original files kept in place with detailed comments
- **Documentation**: This file serves as the definitive migration record

---
*This deprecation follows the established guardrails: no code deletion, comprehensive documentation, and full rollback capability.*