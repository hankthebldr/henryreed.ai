#!/usr/bin/env node

/**
 * Code Audit Runner
 *
 * Executes UI/TS audit framework on changed files using Claude API.
 * Generates audit results for GitHub Actions workflow.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MAX_FILE_SIZE = 50000; // 50KB per file
const MAX_TOTAL_SIZE = 200000; // 200KB total
const AUDIT_PROMPT_PATH = path.join(__dirname, '..', '.github', 'audit-prompt-template.md');

// Severity thresholds
const FAIL_ON_ERROR = true; // Exit 1 if errors found
const MAX_WARNINGS = 10; // Fail if > 10 warnings

/**
 * Read audit prompt template
 */
function readAuditPrompt() {
  try {
    return fs.readFileSync(AUDIT_PROMPT_PATH, 'utf8');
  } catch (err) {
    console.error('Failed to read audit prompt template:', err.message);
    process.exit(1);
  }
}

/**
 * Get changed files from environment
 */
function getChangedFiles() {
  const changedFiles = process.env.CHANGED_FILES || '';
  const files = changedFiles.split(' ').filter(f =>
    f.endsWith('.ts') || f.endsWith('.tsx')
  );

  if (files.length === 0) {
    console.log('No TypeScript files changed. Skipping audit.');
    return [];
  }

  return files;
}

/**
 * Read file contents with size validation
 */
function readFileContents(files) {
  const fileContents = [];
  let totalSize = 0;

  for (const file of files) {
    const filePath = path.join(__dirname, '..', file);

    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${file}`);
      continue;
    }

    const stats = fs.statSync(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      console.warn(`File too large (${stats.size} bytes), skipping: ${file}`);
      continue;
    }

    if (totalSize + stats.size > MAX_TOTAL_SIZE) {
      console.warn(`Total size limit reached, stopping at ${files.indexOf(file)} files`);
      break;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    fileContents.push({
      path: file,
      content: content,
      size: stats.size
    });

    totalSize += stats.size;
  }

  return fileContents;
}

/**
 * Format files for prompt
 */
function formatFilesForPrompt(fileContents) {
  return fileContents.map(f => `
## File: ${f.path}

\`\`\`typescript
${f.content}
\`\`\`
`).join('\n');
}

/**
 * Call Claude API for audit
 */
async function callClaudeAPI(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);

          if (response.error) {
            reject(new Error(response.error.message));
            return;
          }

          // Extract JSON from response
          const content = response.content[0].text;
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

          if (jsonMatch) {
            resolve(JSON.parse(jsonMatch[1]));
          } else {
            // Try to parse entire response as JSON
            resolve(JSON.parse(content));
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Generate audit results file
 */
function writeAuditResults(results) {
  const outputPath = path.join(__dirname, '..', 'hosting', 'audit-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Audit results written to: ${outputPath}`);
}

/**
 * Print audit summary
 */
function printSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('CODE AUDIT RESULTS');
  console.log('='.repeat(60));
  console.log(`Status: ${results.status.toUpperCase()}`);
  console.log(`Files Audited: ${results.filesAudited}`);
  console.log(`\nSummary:\n${results.summary}`);

  if (results.issues && results.issues.length > 0) {
    console.log(`\nIssues Found: ${results.issues.length}`);
    console.log('─'.repeat(60));

    const errors = results.issues.filter(i => i.severity === 'error');
    const warnings = results.issues.filter(i => i.severity === 'warning');
    const info = results.issues.filter(i => i.severity === 'info');

    if (errors.length > 0) {
      console.log(`\n❌ ERRORS (${errors.length}):`);
      errors.forEach(e => {
        console.log(`  ${e.file}:${e.line} - ${e.message}`);
        if (e.suggestion) console.log(`    → ${e.suggestion}`);
      });
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
      warnings.forEach(w => {
        console.log(`  ${w.file}:${w.line} - ${w.message}`);
      });
    }

    if (info.length > 0) {
      console.log(`\nℹ️  INFO (${info.length}):`);
      info.forEach(i => {
        console.log(`  ${i.file}:${i.line} - ${i.message}`);
      });
    }
  }

  if (results.recommendations && results.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    results.recommendations.forEach(r => console.log(`  - ${r}`));
  }

  console.log('\n' + '='.repeat(60));
}

/**
 * Determine exit code
 */
function getExitCode(results) {
  if (!results.issues || results.issues.length === 0) {
    return 0; // Success
  }

  const errors = results.issues.filter(i => i.severity === 'error');
  const warnings = results.issues.filter(i => i.severity === 'warning');

  if (FAIL_ON_ERROR && errors.length > 0) {
    console.error(`\n❌ AUDIT FAILED: ${errors.length} error(s) found`);
    return 1;
  }

  if (warnings.length > MAX_WARNINGS) {
    console.error(`\n❌ AUDIT FAILED: ${warnings.length} warnings exceed threshold of ${MAX_WARNINGS}`);
    return 1;
  }

  return 0; // Success with warnings
}

/**
 * Main execution
 */
async function main() {
  console.log('Starting Code Audit...\n');

  // Validate API key
  if (!ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY environment variable not set');
    console.log('Set it in your GitHub repository secrets:');
    console.log('Settings → Secrets and variables → Actions → New repository secret');
    process.exit(1);
  }

  // Get changed files
  const changedFiles = getChangedFiles();
  if (changedFiles.length === 0) {
    console.log('✅ No files to audit. Exiting.');
    writeAuditResults({
      status: 'pass',
      filesAudited: 0,
      summary: 'No TypeScript files changed',
      issues: [],
      recommendations: []
    });
    process.exit(0);
  }

  console.log(`Found ${changedFiles.length} file(s) to audit:`);
  changedFiles.forEach(f => console.log(`  - ${f}`));

  // Read file contents
  console.log('\nReading file contents...');
  const fileContents = readFileContents(changedFiles);
  console.log(`Read ${fileContents.length} file(s) (${fileContents.reduce((sum, f) => sum + f.size, 0)} bytes total)`);

  // Prepare audit prompt
  console.log('\nPreparing audit prompt...');
  const promptTemplate = readAuditPrompt();
  const fileList = fileContents.map(f => f.path).join('\n- ');
  const fileCode = formatFilesForPrompt(fileContents);

  const auditPrompt = promptTemplate
    .replace('{{CHANGED_FILES}}', `- ${fileList}`)
    .replace('{{FILE_CONTENTS}}', fileCode);

  // Call Claude API
  console.log('\nCalling Claude API for audit analysis...');
  try {
    const results = await callClaudeAPI(auditPrompt);

    // Add metadata
    results.filesAudited = fileContents.length;
    results.auditTimestamp = new Date().toISOString();

    // Write results
    writeAuditResults(results);

    // Print summary
    printSummary(results);

    // Exit with appropriate code
    const exitCode = getExitCode(results);
    process.exit(exitCode);

  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err.message);

    writeAuditResults({
      status: 'error',
      filesAudited: fileContents.length,
      summary: `Audit execution failed: ${err.message}`,
      issues: [],
      recommendations: ['Check ANTHROPIC_API_KEY is valid', 'Verify network connectivity'],
      error: err.message
    });

    process.exit(1);
  }
}

// Run audit
main();
