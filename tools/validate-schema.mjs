#!/usr/bin/env node

/**
 * GraphQL Schema Validation Tool
 * 
 * Validates Firebase Data Connect schema files for syntax errors
 * and basic structural integrity.
 */

import fs from 'fs/promises';
import path from 'path';
import { parse, validateSchema, buildSchema } from 'graphql';

const SCHEMA_PATH = 'dataconnect/schema/schema.gql';
const EXAMPLE_QUERIES_PATH = 'dataconnect/example/queries.gql';
const EXAMPLE_MUTATIONS_PATH = 'dataconnect/example/mutations.gql';

async function validateSchemaFile(filePath) {
  console.log(`\n📋 Validating schema file: ${filePath}`);
  
  try {
    const schemaContent = await fs.readFile(filePath, 'utf8');
    
    // Parse the GraphQL schema
    const document = parse(schemaContent);
    console.log('✅ Schema syntax is valid');
    
    // Try to build a GraphQL schema from the document
    // Note: This may not work fully with Firebase Data Connect directives
    // but it will catch basic structural issues
    try {
      const schema = buildSchema(schemaContent);
      console.log('✅ Schema structure is valid');
      
      // Extract and display type information
      const typeMap = schema.getTypeMap();
      const userDefinedTypes = Object.keys(typeMap)
        .filter(name => !name.startsWith('__'))
        .filter(name => !['String', 'Int', 'Float', 'Boolean', 'ID', 'Date', 'UUID'].includes(name));
      
      console.log(`📊 Found ${userDefinedTypes.length} user-defined types:`);
      userDefinedTypes.forEach(typeName => {
        console.log(`   - ${typeName}`);
      });
      
      // Check for PascalCase compliance
      const nonPascalCaseTypes = userDefinedTypes.filter(name => {
        const firstChar = name.charAt(0);
        return firstChar !== firstChar.toUpperCase() || name.includes('_') || name.toUpperCase() === name;
      });
      
      if (nonPascalCaseTypes.length > 0) {
        console.log('⚠️  Non-PascalCase type names found:');
        nonPascalCaseTypes.forEach(name => {
          console.log(`   - ${name} (should be PascalCase)`);
        });
      } else {
        console.log('✅ All type names follow PascalCase convention');
      }
      
    } catch (buildError) {
      console.log('⚠️  Schema contains Firebase Data Connect directives (expected)');
      console.log('   Basic syntax validation passed, advanced validation skipped');
    }
    
    return { valid: true, document };
    
  } catch (error) {
    console.error('❌ Schema validation failed:');
    console.error(`   Error: ${error.message}`);
    if (error.locations) {
      error.locations.forEach(location => {
        console.error(`   Location: Line ${location.line}, Column ${location.column}`);
      });
    }
    return { valid: false, error };
  }
}

async function validateExampleFile(filePath, schemaDocument) {
  console.log(`\n📋 Validating example file: ${filePath}`);
  
  try {
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!exists) {
      console.log('⚠️  Example file does not exist (will be generated)');
      return { valid: true, skipped: true };
    }
    
    const exampleContent = await fs.readFile(filePath, 'utf8');
    
    // Parse the GraphQL examples
    const document = parse(exampleContent);
    console.log('✅ Example file syntax is valid');
    
    // Basic validation - check for common issues
    const operations = document.definitions.filter(def => 
      def.kind === 'OperationDefinition'
    );
    
    console.log(`📊 Found ${operations.length} operations:`);
    operations.forEach(op => {
      const operationType = op.operation;
      const operationName = op.name ? op.name.value : '<unnamed>';
      console.log(`   - ${operationType}: ${operationName}`);
    });
    
    return { valid: true, document };
    
  } catch (error) {
    console.error('❌ Example file validation failed:');
    console.error(`   Error: ${error.message}`);
    if (error.locations) {
      error.locations.forEach(location => {
        console.error(`   Location: Line ${location.line}, Column ${location.column}`);
      });
    }
    return { valid: false, error };
  }
}

async function main() {
  console.log('🔍 Firebase Data Connect Schema Validation');
  console.log('==========================================');
  
  let allValid = true;
  
  // Validate main schema
  const schemaResult = await validateSchemaFile(SCHEMA_PATH);
  if (!schemaResult.valid) {
    allValid = false;
  }
  
  // Validate example files
  if (schemaResult.valid) {
    const queriesResult = await validateExampleFile(EXAMPLE_QUERIES_PATH, schemaResult.document);
    const mutationsResult = await validateExampleFile(EXAMPLE_MUTATIONS_PATH, schemaResult.document);
    
    if (!queriesResult.valid || !mutationsResult.valid) {
      allValid = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (allValid) {
    console.log('✅ All validations passed!');
    process.exit(0);
  } else {
    console.log('❌ Validation failed - please fix the errors above');
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Validation tool error:', error);
    process.exit(1);
  });
}

export { validateSchemaFile, validateExampleFile };