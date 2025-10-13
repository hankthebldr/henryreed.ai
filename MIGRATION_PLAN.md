# Migration Plan: henryreed.ai → cortex-dc-web

## Executive Summary

This document outlines the migration strategy to consolidate application features from the `henryreed.ai` repository into the `cortex-dc-web` repository, allowing `henryreed.ai` to be maintained as a separate personal portfolio application.

**Target State:**
- `cortex-dc-web` (cortex-dc-portal Firebase project) → Will host all Cortex DC Portal features at cortex-dc.com
- `henryreed.ai` (henryreedai Firebase project) → Will remain as standalone personal portfolio/demo site

---

## Current State Analysis

### henryreed.ai Repository
**Firebase Configuration:**
- Project: `henryreedai`
- Structure: Monolithic Next.js app
- Components: 59 TSX components
- Services: 41 TypeScript service files
- Hosting: `hosting/out` directory

**Key Features:**
1. **Domain Consultant Workspace** - POV/TRR management system
2. **Badass Blueprint Workflow** - Recent addition for workflow management
3. **DOR SDW Form Capture** - Form capture system
4. **Knowledge Base Graph** - Large visualization component
5. **Streamlined Demo Builder** - Demo building interface
6. **Terminal/Command System** - Unified terminal with command execution
7. **Content Library Management** - Content creation and management
8. **XSIAM Integration** - External API integration
9. **BigQuery Integration** - Data export and analytics
10. **User Management Portal** - Authentication and user management
11. **AI Services** - Gemini AI integration for insights

**Technology Stack:**
- Next.js (latest)
- React 18
- Firebase SDK v12.3.0
- TypeScript 5.3.3
- Tailwind CSS
- Firebase Functions (2 codebases: default + genkit)
- Firebase Data Connect

### cortex-dc-web Repository
**Firebase Configuration:**
- Project: `cortex-dc-portal`
- Structure: Monorepo with pnpm workspaces
- Components: 13 TSX files (minimal)
- Hosting: `apps/web/out` directory

**Architecture:**
```
cortex-dc-web/
├── apps/
│   └── web/                    # Main Next.js application
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── ai/                     # AI service package
│   ├── db/                     # Database utilities
│   ├── utils/                  # Shared utilities
│   ├── admin-tools/           # Admin functionality
│   └── test-utils/            # Testing utilities
├── functions/                  # Firebase Functions
└── dataconnect/               # Firebase Data Connect
```

**Technology Stack:**
- Next.js 14.2.13
- React 18
- Firebase SDK v10.8.0
- TypeScript 5.3.3
- Tailwind CSS
- pnpm workspaces
- Turbo (build orchestration)

---

## Migration Strategy

### Phase 1: Foundation Setup (Week 1)
**Goal:** Ensure cortex-dc-web can accept migrated code

#### Tasks:
1. **Update Dependencies**
   - Upgrade Firebase SDK from v10.8.0 → v12.3.0
   - Update Next.js from 14.2.13 → latest
   - Sync all shared dependencies with henryreed.ai

2. **Create Package Structure**
   ```
   packages/
   ├── cortex-terminal/        # Terminal system
   ├── cortex-commands/        # Command execution
   ├── cortex-ai/              # AI services (extend existing)
   ├── cortex-content/         # Content management
   └── cortex-integrations/    # XSIAM, BigQuery
   ```

3. **Firebase Configuration Alignment**
   - Verify `cortex-dc-portal` project has required services enabled
   - Set up Firebase extensions (if needed)
   - Configure storage rules and firestore rules
   - Set up Data Connect schemas

### Phase 2: Service Layer Migration (Week 2-3)
**Goal:** Move business logic and services

#### Priority Order:
1. **Core Services** (migrate first)
   - `firebase-config.ts` → Update for cortex-dc-portal
   - `auth-service.ts` → Move to `packages/db/src/auth/`
   - `api-service.ts` → Move to `packages/utils/src/api/`
   - `data-service.ts` → Move to `packages/db/src/services/`

2. **AI & Integration Services**
   - `gemini-ai-service.ts` → Merge into `packages/ai/`
   - `dc-ai-client.ts` → Move to `packages/ai/src/clients/`
   - `xsiam-api-service.ts` → Move to `packages/cortex-integrations/`
   - `bigquery-service.ts` → Move to `packages/cortex-integrations/`

3. **Domain Services**
   - `content-library-service.ts` → Move to `packages/cortex-content/`
   - `knowledge-base.ts` → Move to `packages/cortex-content/`
   - `user-management-service.ts` → Move to `packages/db/src/users/`
   - `cloud-command-executor.ts` → Move to `packages/cortex-commands/`
   - `unified-command-service.ts` → Move to `packages/cortex-commands/`

4. **Supporting Services**
   - `cloud-store-service.ts` → Move to `packages/db/src/storage/`
   - `user-activity-service.ts` → Move to `packages/db/src/analytics/`
   - `rbac-middleware.ts` → Move to `packages/db/src/auth/`

### Phase 3: Component Migration (Week 3-4)
**Goal:** Move UI components in dependency order

#### Component Groups:

**Group A - Foundational Components** (migrate first)
```
- AppShell.tsx → apps/web/components/layout/
- AppHeader.tsx → apps/web/components/layout/
- BreadcrumbNavigation.tsx → apps/web/components/navigation/
- ConditionalLayout.tsx → apps/web/components/layout/
- LoginForm.tsx → apps/web/components/auth/
- AuthLanding.tsx → apps/web/components/auth/
- SettingsPanel.tsx → apps/web/components/settings/
- NotificationSystem.tsx → apps/web/components/common/
```

**Group B - Terminal System**
```
- Terminal.tsx → packages/cortex-terminal/components/
- EnhancedTerminal.tsx → packages/cortex-terminal/components/
- UnifiedTerminal.tsx → packages/cortex-terminal/components/
- ImprovedTerminal.tsx → packages/cortex-terminal/components/
- CortexDCTerminal.tsx → packages/cortex-terminal/components/
- TerminalWindow.tsx → packages/cortex-terminal/components/
- TerminalOutput.tsx → packages/cortex-terminal/components/
- TerminalOutputs.tsx → packages/cortex-terminal/components/
- EnhancedTerminalSidebar.tsx → packages/cortex-terminal/components/
- TerminalIntegrationSettings.tsx → packages/cortex-terminal/components/
```

**Group C - Command & Button Components**
```
- CortexButton.tsx → packages/ui/src/components/
- CortexCommandButton.tsx → packages/ui/src/components/
```

**Group D - Workflow & Management**
```
- BadassBlueprintWorkflow.tsx → apps/web/components/workflows/
- DORSDWFormCapture.tsx → apps/web/components/workflows/
- SDWWorkflow.tsx → apps/web/components/workflows/
- StreamlinedDemoBuilder.tsx → apps/web/components/demo/
- DomainConsultantWorkspace.tsx → apps/web/components/workspace/
- POVManagement.tsx → apps/web/components/pov/
- POVProjectManagement.tsx → apps/web/components/pov/
- TRRManagement.tsx → apps/web/components/trr/
- ProductionTRRManagement.tsx → apps/web/components/trr/
- TRRProgressChart.tsx → apps/web/components/trr/
```

**Group E - Content Management**
```
- ContentLibrary.tsx → packages/cortex-content/components/
- ConsolidatedContentLibrary.tsx → packages/cortex-content/components/
- ContentCreatorManager.tsx → packages/cortex-content/components/
- EnhancedContentCreator.tsx → packages/cortex-content/components/
- UnifiedContentCreator.tsx → packages/cortex-content/components/
- ContentAnalytics.tsx → packages/cortex-content/components/
- MetadataEditor.tsx → packages/cortex-content/components/
```

**Group F - Knowledge Base**
```
- KnowledgeBaseGraph.tsx → packages/cortex-content/components/
- KnowledgeBaseManager.tsx → packages/cortex-content/components/
- KnowledgeGraphVisualization.tsx → packages/cortex-content/components/
```

**Group G - Integration Panels**
```
- XSIAMIntegrationPanel.tsx → apps/web/components/integrations/
- XSIAMHealthMonitor.tsx → apps/web/components/integrations/
- BigQueryExportPanel.tsx → apps/web/components/integrations/
- BigQueryExplorer.tsx → apps/web/components/integrations/
```

**Group H - Management & Admin**
```
- UserManagementPortal.tsx → apps/web/components/admin/
- ManagementDashboard.tsx → apps/web/components/dashboard/
- UserTimelineView.tsx → apps/web/components/admin/
```

**Group I - Specialized Components**
```
- CortexGUIInterface.tsx → apps/web/components/gui/
- EnhancedGUIInterface.tsx → apps/web/components/gui/
- CortexCloudFrame.tsx → apps/web/components/cloud/
- ManualCreationGUI.tsx → apps/web/components/gui/
- EnhancedManualCreationGUI.tsx → apps/web/components/gui/
- ScenarioManagementInterface.tsx → apps/web/components/scenarios/
- EnhancedScenarioCreator.tsx → apps/web/components/scenarios/
- EnhancedAIAssistant.tsx → apps/web/components/ai/
- InteractiveCharts.tsx → apps/web/components/charts/
- OnboardingGuide.tsx → apps/web/components/onboarding/
- CommandAlignmentGuide.tsx → apps/web/components/guides/
- LegacyInterfaceWrapper.tsx → apps/web/components/legacy/
```

### Phase 4: Firebase Functions Migration (Week 4-5)
**Goal:** Move backend functions

#### Tasks:
1. **Analyze Functions**
   - Review `functions/` directory in henryreed.ai
   - Review `henryreedai/` (genkit codebase) directory
   - Identify function dependencies

2. **Migrate Functions**
   - Move functions to `cortex-dc-web/functions/`
   - Update imports to use new package structure
   - Update environment variables for `cortex-dc-portal`

3. **Update firebase.json**
   - Configure function codebases
   - Set up predeploy scripts
   - Configure regions and runtime

### Phase 5: Data Connect & Database (Week 5)
**Goal:** Migrate data schemas and connections

#### Tasks:
1. **Schema Migration**
   - Review `dataconnect/` schemas in henryreed.ai
   - Merge with cortex-dc-web schemas
   - Update connectors and queries

2. **Firestore Rules**
   - Migrate `firestore.rules` logic
   - Merge with existing cortex-dc-web rules
   - Test security rules

3. **Storage Rules**
   - Migrate `storage.rules`
   - Update bucket configurations

### Phase 6: Testing & Validation (Week 6)
**Goal:** Ensure everything works

#### Tasks:
1. **Local Testing**
   - Run Firebase emulators
   - Test all major workflows
   - Verify authentication flows
   - Test API integrations

2. **Build Validation**
   - Run `pnpm build` for all packages
   - Verify no circular dependencies
   - Check bundle sizes

3. **Type Checking**
   - Run `pnpm type-check` across workspace
   - Fix any TypeScript errors

### Phase 7: Deployment & Cutover (Week 7)
**Goal:** Go live with cortex-dc-web

#### Tasks:
1. **Staging Deployment**
   - Deploy to Firebase preview channel
   - Run smoke tests
   - Verify all integrations

2. **Domain Configuration**
   - Point cortex-dc.com to cortex-dc-portal hosting
   - Verify SSL certificates
   - Test DNS propagation

3. **Production Deployment**
   - Deploy to production
   - Monitor logs and errors
   - Be ready for rollback

4. **Post-Migration Cleanup**
   - Archive henryreed.ai components that were migrated
   - Update henryreed.ai to focus on portfolio features
   - Document what stays in henryreed.ai

---

## Risk Mitigation

### High-Risk Items
1. **Firebase SDK Version Jump (v10 → v12)**
   - **Risk:** Breaking API changes
   - **Mitigation:** Test thoroughly in emulators, review Firebase changelog

2. **Import Path Changes**
   - **Risk:** Broken imports across 59 components
   - **Mitigation:** Use find/replace carefully, automated testing

3. **Shared State Management**
   - **Risk:** Components may have tightly coupled state
   - **Mitigation:** Refactor to use proper state management (Context/Zustand)

4. **Firebase Functions Cold Starts**
   - **Risk:** Function initialization may break with new structure
   - **Mitigation:** Test in emulators, consider min instances

### Medium-Risk Items
1. **Monorepo Complexity**
   - **Risk:** Developers unfamiliar with pnpm workspaces
   - **Mitigation:** Document thoroughly, provide dev setup guide

2. **Type Definitions**
   - **Risk:** Shared types may conflict
   - **Mitigation:** Create `packages/types` for shared interfaces

---

## What Stays in henryreed.ai

After migration, henryreed.ai will focus on:
- Personal portfolio content
- Blog/articles
- Resume/CV functionality
- Personal project showcases
- Experimental features/demos not tied to Cortex DC

---

## Success Metrics

- [ ] All 59 components migrated and building successfully
- [ ] All 41 service files migrated and typed correctly
- [ ] Firebase Functions deployed and responding
- [ ] cortex-dc.com resolving to cortex-dc-portal
- [ ] All tests passing (unit + e2e)
- [ ] Zero production errors in first 48 hours
- [ ] henryreed.ai still deployable independently

---

## Timeline Summary

| Week | Phase | Deliverable |
|------|-------|------------|
| 1 | Foundation Setup | Dependencies updated, packages created |
| 2-3 | Service Migration | All services moved and typed |
| 3-4 | Component Migration | All components migrated in groups |
| 4-5 | Functions Migration | Backend functions operational |
| 5 | Database/Schema | Schemas and rules migrated |
| 6 | Testing | All tests passing, validation complete |
| 7 | Deployment | Live on cortex-dc.com |

**Total Estimated Duration:** 7 weeks

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Set up project tracking** (GitHub Projects/Jira)
3. **Create feature branch** in cortex-dc-web: `feature/henryreed-migration`
4. **Begin Phase 1** - Foundation Setup
5. **Schedule weekly sync meetings** to track progress

---

## Notes

- This migration preserves both repositories as standalone applications
- The monorepo approach in cortex-dc-web allows for better code organization
- Consider adding a `packages/migration-scripts/` for automated migration helpers
- Keep both repositories deployable throughout the migration process
- Use feature flags to gradually enable migrated features

---

**Document Version:** 1.0
**Last Updated:** 2025-10-13
**Author:** Claude Code Assistant
**Status:** Draft - Awaiting Review
