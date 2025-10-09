#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for legacy orange branding references...\n');

// Define patterns to search for
const orangePatterns = [
  '#ff6900',    // Primary orange hex
  'FA582D',     // Secondary orange hex (uppercase)
  'fa582d',     // Secondary orange hex (lowercase) 
  'E55A00',     // Dark orange hex (uppercase)
  'e55a00',     // Dark orange hex (lowercase)
  'FF8533',     // Light orange hex (uppercase)
  'ff8533',     // Light orange hex (lowercase)
  'cortex-orange',  // CSS class/token references
  'brand-primary.*#ff6900',  // Brand primary with orange
  'from-cortex-orange',  // Gradient references
  'to-cortex-orange',
  'border-t-cortex-orange',
  'bg-cortex-orange',
  'text-cortex-orange'
];

// Files to ignore (commented code is OK in these files)
const ignoredFiles = [
  'tailwind.config.js',
  'globals.css',
  'check-no-orange.js',
  'replace-orange.js'
];

// Directories to exclude
const excludedDirs = [
  'node_modules',
  '.next',
  'out',
  '.git',
  'scripts'
];

let foundViolations = false;
let violationCount = 0;

try {
  // Build grep command with exclusions
  const excludeDirFlags = excludedDirs.map(dir => `--exclude-dir=${dir}`).join(' ');
  const patternGroup = orangePatterns.join('|');
  
  const grepCommand = `grep -RniE "(${patternGroup})" . ${excludeDirFlags} --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.css" --include="*.html" --include="*.json"`;
  
  console.log('Running command:', grepCommand.replace(/\s+/g, ' '));
  
  const output = execSync(grepCommand, { 
    stdio: 'pipe',
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 10 // 10MB buffer
  });

  if (output.trim()) {
    const lines = output.trim().split('\n');
    
    // Filter out ignored files and commented lines
    const violations = lines.filter(line => {
      const fileName = line.split(':')[0].replace('./', '');
      
      // Skip ignored files
      if (ignoredFiles.some(ignored => fileName.includes(ignored))) {
        return false;
      }
      
      // Skip commented lines (simple check)
      const content = line.split(':').slice(2).join(':').trim();
      if (content.startsWith('//') || content.startsWith('/*') || content.includes('* ')) {
        return false;
      }
      
      return true;
    });

    if (violations.length > 0) {
      foundViolations = true;
      violationCount = violations.length;
      
      console.error('❌ Found legacy orange references that need to be migrated:\n');
      
      // Group violations by file for better readability
      const violationsByFile = {};
      violations.forEach(line => {
        const [file, lineNum, ...contentParts] = line.split(':');
        const content = contentParts.join(':');
        const cleanFile = file.replace('./', '');
        
        if (!violationsByFile[cleanFile]) {
          violationsByFile[cleanFile] = [];
        }
        violationsByFile[cleanFile].push({
          lineNum: lineNum,
          content: content.trim()
        });
      });
      
      // Display violations grouped by file
      Object.entries(violationsByFile).forEach(([file, violations]) => {
        console.error(`📄 ${file}:`);
        violations.forEach(({ lineNum, content }) => {
          console.error(`   Line ${lineNum}: ${content}`);
        });
        console.error(''); // Empty line between files
      });
      
      console.error(`\n🚫 Total violations found: ${violationCount}`);
      console.error('\n💡 Run "npm run fix:branding" to automatically fix these issues.');
      console.error('💡 Or manually replace orange references with green equivalents.');
      
    } else {
      console.log('✅ No runtime orange references found in active code!');
      console.log('   (Commented legacy code is preserved for rollback capability)');
    }
  } else {
    console.log('✅ No orange branding violations found!');
    console.log('   All legacy orange references have been successfully migrated to green.');
  }
  
} catch (error) {
  if (error.status === 1) {
    // grep exit code 1 means no matches found - this is success for us
    console.log('✅ No orange branding violations found!');
    console.log('   All legacy orange references have been successfully migrated to green.');
  } else {
    console.error('❌ Error running branding check:', error.message);
    process.exit(1);
  }
}

// Additional checks
console.log('\n🔧 Additional checks:');

// Check for gradient classes that might contain orange
try {
  const gradientCheck = execSync('grep -RniE "(from-orange|to-orange|via-orange)" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=out --exclude-dir=.git --exclude-dir=scripts --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"', {
    stdio: 'pipe', 
    encoding: 'utf-8' 
  });
  
  if (gradientCheck.trim()) {
    console.log('⚠️  Found gradient classes that may need review:');
    console.log(gradientCheck.trim());
    foundViolations = true;
  } else {
    console.log('✅ No problematic gradient classes found');
  }
} catch (e) {
  console.log('✅ No problematic gradient classes found');
}

// Summary
if (foundViolations) {
  console.log('\n❌ BRANDING CHECK FAILED');
  console.log('   Please fix the violations above before deploying.');
  process.exit(1);
} else {
  console.log('\n✅ BRANDING CHECK PASSED');
  console.log('   Ready for deployment - no orange branding violations detected.');
  process.exit(0);
}