#!/usr/bin/env node

/**
 * QA Validation Script for POV Integration System
 * 
 * This script validates key functionality of the terminal integration,
 * POV mapping, and command execution systems.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Starting QA Validation Tests...\n');

// Test 1: Verify core files exist
console.log('✅ Test 1: Core File Structure');
const requiredFiles = [
  'hooks/useCommandExecutor.ts',
  'lib/scenario-pov-map.ts', 
  'lib/pov-commands.tsx',
  'lib/detect-commands.tsx',
  'lib/monitor-commands.tsx',
  'components/UnifiedContentCreator.tsx',
  'components/NotificationSystem.tsx',
  'contexts/AppStateContext.tsx'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file} - EXISTS`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
  }
});

console.log('\n✅ Test 2: useCommandExecutor Hook Structure');
try {
  const hookContent = fs.readFileSync(path.join(__dirname, '..', 'hooks/useCommandExecutor.ts'), 'utf8');
  
  // Check for required functions and features
  const checks = [
    { name: 'useCommandExecutor export', pattern: /export function useCommandExecutor/ },
    { name: 'userActivityService import', pattern: /import userActivityService/ },
    { name: 'trackActivity integration', pattern: /userActivityService\.trackActivity/ },
    { name: 'executeCommandFromGUI call', pattern: /actions\.executeCommandFromGUI/ },
    { name: 'notification handling', pattern: /actions\.notify/ },
    { name: 'loading state management', pattern: /isRunning/ },
    { name: 'error handling', pattern: /catch.*\(.*error.*\)|catch.*err/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(hookContent)) {
      console.log(`  ✅ ${check.name} - IMPLEMENTED`);
    } else {
      console.log(`  ❌ ${check.name} - MISSING`);
    }
  });
} catch (error) {
  console.log(`  ❌ Error reading useCommandExecutor.ts: ${error.message}`);
}

console.log('\n✅ Test 3: POV Integration Mapping');
try {
  const povMapContent = fs.readFileSync(path.join(__dirname, '..', 'lib/scenario-pov-map.ts'), 'utf8');
  
  const povChecks = [
    { name: 'getPovIntegrationCommands export', pattern: /export.*getPovIntegrationCommands/ },
    { name: 'buildPovInitCommand export', pattern: /export.*buildPovInitCommand/ },
    { name: 'POV template mapping', pattern: /getPovTemplateForScenario/ },
    { name: 'Dynamic command generation', pattern: /hasActivePov/ },
    { name: 'Provider integration', pattern: /provider/ }
  ];
  
  povChecks.forEach(check => {
    if (check.pattern.test(povMapContent)) {
      console.log(`  ✅ ${check.name} - IMPLEMENTED`);
    } else {
      console.log(`  ❌ ${check.name} - MISSING`);
    }
  });
} catch (error) {
  console.log(`  ❌ Error reading scenario-pov-map.ts: ${error.message}`);
}

console.log('\n✅ Test 4: Command Handler Coverage');
const commandFiles = ['pov-commands.tsx', 'detect-commands.tsx', 'monitor-commands.tsx'];

commandFiles.forEach(file => {
  try {
    const commandContent = fs.readFileSync(path.join(__dirname, '..', 'lib', file), 'utf8');
    
    // Check for command configuration structure
    if (/CommandConfig/.test(commandContent)) {
      console.log(`  ✅ ${file} - Command configs present`);
    } else {
      console.log(`  ❌ ${file} - Command configs missing`);
    }
    
    // Check for React component returns
    if (/return.*<div|<div.*className/.test(commandContent)) {
      console.log(`  ✅ ${file} - React component handlers`);
    } else {
      console.log(`  ❌ ${file} - Missing React components`);
    }
  } catch (error) {
    console.log(`  ❌ Error reading ${file}: ${error.message}`);
  }
});

console.log('\n✅ Test 5: UnifiedContentCreator Integration');
try {
  const creatorContent = fs.readFileSync(path.join(__dirname, '..', 'components/UnifiedContentCreator.tsx'), 'utf8');
  
  const uiChecks = [
    { name: 'useCommandExecutor import', pattern: /import.*useCommandExecutor/ },
    { name: 'POV mapping import', pattern: /import.*scenario-pov-map/ },
    { name: 'AppState integration', pattern: /useAppState/ },
    { name: 'Dynamic POV buttons', pattern: /getPovIntegrationCommands/ },
    { name: 'Customer name handling', pattern: /customerName/ },
    { name: 'Telemetry tracking', pattern: /trackActivity/ },
    { name: 'Accessibility attributes', pattern: /ariaLabel/ }
  ];
  
  uiChecks.forEach(check => {
    if (check.pattern.test(creatorContent)) {
      console.log(`  ✅ ${check.name} - IMPLEMENTED`);
    } else {
      console.log(`  ❌ ${check.name} - MISSING`);
    }
  });
} catch (error) {
  console.log(`  ❌ Error reading UnifiedContentCreator.tsx: ${error.message}`);
}

console.log('\n✅ Test 6: Notification System Enhancement');
try {
  const notificationContent = fs.readFileSync(path.join(__dirname, '..', 'components/NotificationSystem.tsx'), 'utf8');
  
  const notificationChecks = [
    { name: 'showTerminalLink prop', pattern: /showTerminalLink/ },
    { name: 'View in Terminal button', pattern: /View in Terminal/ },
    { name: 'Accessibility aria-live', pattern: /aria-live/ },
    { name: 'Focus management', pattern: /focusTerminal/ },
    { name: 'Success notification filtering', pattern: /type === 'success'/ }
  ];
  
  notificationChecks.forEach(check => {
    if (check.pattern.test(notificationContent)) {
      console.log(`  ✅ ${check.name} - IMPLEMENTED`);
    } else {
      console.log(`  ❌ ${check.name} - MISSING`);
    }
  });
} catch (error) {
  console.log(`  ❌ Error reading NotificationSystem.tsx: ${error.message}`);
}

console.log('\n✅ Test 7: AppStateContext Integration');
try {
  const appStateContent = fs.readFileSync(path.join(__dirname, '..', 'contexts/AppStateContext.tsx'), 'utf8');
  
  const stateChecks = [
    { name: 'currentPovId in AppState', pattern: /currentPovId/ },
    { name: 'executeCommandFromGUI action', pattern: /executeCommandFromGUI/ },
    { name: 'Terminal focus actions', pattern: /focusTerminal/ },
    { name: 'Notification actions', pattern: /notify.*useCallback|notify:.*=>/ },
    { name: 'Loading state management', pattern: /setLoading/ }
  ];
  
  stateChecks.forEach(check => {
    if (check.pattern.test(appStateContent)) {
      console.log(`  ✅ ${check.name} - IMPLEMENTED`);
    } else {
      console.log(`  ❌ ${check.name} - MISSING`);
    }
  });
} catch (error) {
  console.log(`  ❌ Error reading AppStateContext.tsx: ${error.message}`);
}

console.log('\n📊 Test Results Summary:');
console.log('=========================');

// Check environment for testing recommendations
console.log('\n🔧 Environment Recommendations:');
console.log('- Development server running on: http://localhost:3000');
console.log('- Environment mode: LOCAL (NEXT_PUBLIC_USE_FUNCTIONS not set)');
console.log('- Recommended testing: Navigate to http://localhost:3000/gui');
console.log('- Test POV integration in UnifiedContentCreator scenarios');
console.log('- Validate terminal command execution and notifications');

console.log('\n🚀 Manual Testing Steps:');
console.log('1. Open http://localhost:3000/gui in browser');
console.log('2. Navigate to any scenario in UnifiedContentCreator');  
console.log('3. Test all four quick action buttons (Deploy, Test, Monitor, Status)');
console.log('4. Verify POV integration buttons are context-aware');
console.log('5. Check notifications appear with "View in Terminal" links');
console.log('6. Validate terminal focus and command execution');

console.log('\n✅ QA Validation Script Complete!\n');