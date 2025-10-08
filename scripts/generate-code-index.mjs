#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';

console.log('🔍 Generating comprehensive code index...');

const files = execSync('git ls-files', { encoding: 'utf8' }).trim().split('\n');
const sections = {
  'Core Command System': [],
  'GUI Components': [],
  'Feature Modules': [],
  'Pages & Routing': [],
  'Services & Utilities': [],
  'Firebase & Config': [],
  'Documentation': [],
  'Scripts & Tools': [],
  'Root Files': []
};

// Enhanced categorization logic
for (const f of files) {
  if (f.startsWith('hosting/lib/commands') || f.includes('command') && f.includes('.tsx')) {
    sections['Core Command System'].push(f);
  } else if (f.startsWith('hosting/components/')) {
    sections['GUI Components'].push(f);
  } else if (f.startsWith('hosting/pages/') || f.startsWith('hosting/app/')) {
    sections['Pages & Routing'].push(f);
  } else if (f.startsWith('hosting/lib/')) {
    sections['Feature Modules'].push(f);
  } else if (f.startsWith('hosting/hooks/') || f.startsWith('hosting/contexts/')) {
    sections['Services & Utilities'].push(f);
  } else if (f.startsWith('scripts/') || f.includes('deploy') || f.includes('.sh')) {
    sections['Scripts & Tools'].push(f);
  } else if (f.startsWith('DOCS/') || f.toLowerCase().includes('readme') || f.includes('.md')) {
    sections['Documentation'].push(f);
  } else if (f.includes('firebase') || f.includes('package.json') || f.includes('config') || f.includes('.json')) {
    sections['Firebase & Config'].push(f);
  } else if (!f.includes('/') || f.split('/').length === 1) {
    sections['Root Files'].push(f);
  } else {
    // Catch remaining files in appropriate categories
    if (f.startsWith('hosting/')) {
      sections['Services & Utilities'].push(f);
    } else {
      sections['Root Files'].push(f);
    }
  }
}

let md = `# Code Index - HenryReed.ai Cortex Domain Consultant Platform

**Generated:** ${new Date().toISOString()}  
**Purpose:** Complete inventory for scalable refactoring

## Overview

This codebase implements a sophisticated cybersecurity domain consultant platform with:
- **Terminal-first Interface:** Single canonical terminal with GUI integration
- **Security Scenario Engine:** Comprehensive security testing and validation
- **POV Management System:** Customer proof-of-value lifecycle management  
- **TRR Management:** Technical requirements review with blockchain signoff
- **Domain Consultant AI:** GenAI-powered security consulting workflows

## Architecture Highlights

- **Frontend:** Next.js static export with React 18 + TypeScript
- **Deployment:** Firebase Hosting with experimental webpack
- **Command System:** Modular command architecture with mock/real mode switching
- **State Management:** Hybrid localStorage + optional Firestore sync
- **Integration Ready:** XSIAM, BigQuery, Genkit AI with graceful degradation

`;

// Add feature module mapping
md += `## Key Feature Modules

### Domain Consultant
- **Components:** DomainConsultantWorkspace.tsx, EnhancedAIAssistant.tsx
- **Commands:** Core consulting commands in commands.tsx
- **AI Integration:** Genkit-powered recommendations and analysis

### POV Management  
- **Components:** POVManagement.tsx, POVProjectManagement.tsx
- **Commands:** pov-commands.tsx with full lifecycle support
- **Integration:** Dynamic scenario-to-POV mapping

### TRR Management
- **Components:** TRRManagement.tsx, ProductionTRRManagement.tsx  
- **Commands:** detect-commands.tsx, monitor-commands.tsx
- **Blockchain:** trr-blockchain-signoff.tsx for immutable audit trails

### Scenario Engine
- **Commands:** scenario-commands.tsx with 20+ scenario types
- **Types:** scenario-types.ts with MITRE ATT&CK mappings
- **Providers:** GCP, AWS, Azure, Kubernetes, local support

### Content Hub
- **Components:** ConsolidatedContentLibrary.tsx, ContentCreatorManager.tsx
- **Service:** content-library-service.ts for resource management
- **Search:** Client-side search with content-index.json

---

`;

for (const [category, fileList] of Object.entries(sections)) {
  md += `## ${category}\n\n`;
  
  if (fileList.length === 0) {
    md += `*No files found in this category*\n\n`;
    continue;
  }
  
  // Sort files for better organization
  const sortedFiles = fileList.sort();
  
  for (const file of sortedFiles) {
    md += `- \`${file}\``;
    
    // Add context clues for important files
    if (file.includes('ImprovedTerminal.tsx')) {
      md += ' - 🔥 **Single Canonical Terminal**';
    } else if (file.includes('useCommandExecutor')) {
      md += ' - ⚡ **GUI-to-Terminal Bridge**';
    } else if (file.includes('pov-commands')) {
      md += ' - 🎯 **POV Lifecycle Management**';
    } else if (file.includes('scenario-commands')) {
      md += ' - 🛡️ **Security Scenario Engine**';
    } else if (file.includes('firebase.json')) {
      md += ' - ⚙️ **Firebase Deployment Config**';
    } else if (file.includes('next.config')) {
      md += ' - 📦 **Next.js Build Configuration**';
    } else if (file.includes('WARP.md')) {
      md += ' - 📋 **Terminal Architecture Guide**';
    }
    
    md += '\n';
  }
  md += '\n';
}

md += `## Refactoring Priorities

### Phase 1: Foundation
1. **Firebase Config Cleanup** - Hosting-only configuration
2. **TypeScript Strict Mode** - Re-enable strict type checking  
3. **Module Boundaries** - Clear separation of feature modules

### Phase 2: Architecture  
1. **Plugin System** - Pluggable scenario and provider architecture
2. **State Management** - Unified state management strategy
3. **Test Coverage** - Comprehensive test suite for command system

### Phase 3: Optimization
1. **Performance** - Bundle optimization and lazy loading
2. **CI/CD Pipeline** - Automated testing and deployment
3. **Production Readiness** - Monitoring and error handling

## Integration Strategy

### Mock-First Approach
All external integrations (XSIAM, BigQuery, GenAI) support mock mode for:
- **Offline Development** - Full functionality without external dependencies
- **Demo Environments** - Consistent demo behavior  
- **Testing** - Predictable test scenarios
- **Graceful Degradation** - Automatic fallback when backends unavailable

### External Services
- **XSIAM API** - Palo Alto Networks security platform
- **BigQuery Export** - Google Cloud data analytics
- **Genkit/Vertex AI** - Google AI services for domain consulting
- **Firebase Services** - Hosting, Firestore, Storage, Functions

---

*Generated by scripts/generate-code-index.mjs*  
*Last updated: ${new Date().toISOString()}*
`;

writeFileSync('DOCS/CODEINDEX.md', md);
console.log('✅ Generated DOCS/CODEINDEX.md');

// Generate module-specific counts for reporting
const stats = {
  totalFiles: files.length,
  commandModules: sections['Core Command System'].length,
  components: sections['GUI Components'].length,  
  featureModules: sections['Feature Modules'].length,
  configFiles: sections['Firebase & Config'].length
};

console.log('\n📊 Code Index Statistics:');
console.log(`   Total Files: ${stats.totalFiles}`);
console.log(`   Command Modules: ${stats.commandModules}`);
console.log(`   GUI Components: ${stats.components}`);
console.log(`   Feature Modules: ${stats.featureModules}`);
console.log(`   Config Files: ${stats.configFiles}`);
console.log('\n🎉 Code index generation complete!');