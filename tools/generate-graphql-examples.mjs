#!/usr/bin/env node

/**
 * GraphQL Example Generator
 * 
 * Generates example queries and mutations based on the Firebase Data Connect schema.
 * This prevents drift between the schema and example files.
 */

import fs from 'fs/promises';
import { parse } from 'graphql';

const SCHEMA_PATH = 'dataconnect/schema/schema.gql';
const QUERIES_OUTPUT_PATH = 'dataconnect/example/queries.gql';
const MUTATIONS_OUTPUT_PATH = 'dataconnect/example/mutations.gql';

// Firebase Data Connect auto-generates these operations for @table types
const AUTO_GENERATED_OPERATIONS = {
  queries: ['user', 'users', 'pov', 'povs', 'trr', 'trrs', 'scenario', 'scenarios', 'activityLog', 'activityLogs', 'comment', 'comments', 'template', 'templates'],
  mutations: ['user_insert', 'user_upsert', 'user_update', 'user_delete',
             'pov_insert', 'pov_upsert', 'pov_update', 'pov_delete',
             'trr_insert', 'trr_upsert', 'trr_update', 'trr_delete',
             'scenario_insert', 'scenario_upsert', 'scenario_update', 'scenario_delete',
             'activityLog_insert', 'comment_insert', 'comment_upsert', 'comment_update', 'comment_delete',
             'template_insert', 'template_upsert', 'template_update', 'template_delete']
};

function extractTypesFromSchema(document) {
  const types = {};
  
  document.definitions.forEach(definition => {
    if (definition.kind === 'ObjectTypeDefinition') {
      const typeName = definition.name.value;
      const fields = {};
      
      definition.fields?.forEach(field => {
        const fieldName = field.name.value;
        const fieldType = extractFieldType(field.type);
        
        // Skip fields with Firebase Data Connect directives for complex types
        const isScalar = ['String', 'Int', 'Float', 'Boolean', 'ID', 'Date', 'UUID'].includes(fieldType.baseType);
        const isRequired = fieldType.isRequired;
        
        fields[fieldName] = {
          type: fieldType,
          isScalar,
          isRequired
        };
      });
      
      types[typeName] = {
        name: typeName,
        fields,
        hasTableDirective: definition.directives?.some(d => d.name.value === 'table')
      };
    }
  });
  
  return types;
}

function extractFieldType(type) {
  if (type.kind === 'NonNullType') {
    const innerType = extractFieldType(type.type);
    return { ...innerType, isRequired: true };
  }
  
  if (type.kind === 'ListType') {
    const innerType = extractFieldType(type.type);
    return { ...innerType, isList: true };
  }
  
  return {
    baseType: type.name.value,
    isRequired: false,
    isList: false
  };
}

function generateQueries(types) {
  const queries = [];
  
  // Header comment
  queries.push('# Generated example queries for Cortex DC Portal');
  queries.push('# This file is auto-generated based on the current schema');
  queries.push('# Edit tools/generate-graphql-examples.mjs to modify generation logic');
  queries.push('');
  
  const tableTypes = Object.values(types).filter(type => type.hasTableDirective);
  
  // List all entities (plural queries) - skip User to avoid duplicates
  tableTypes.filter(type => type.name !== 'User').forEach(type => {
    const typeName = type.name;
    // Firebase Data Connect uses camelCase for operations
    const pluralName = typeName === 'ActivityLog' ? 'activityLogs' : typeName.toLowerCase() + 's';
    const scalarFields = Object.entries(type.fields)
      .filter(([name, field]) => field.isScalar)
      .map(([name]) => name)
      .slice(0, 5); // Limit to first 5 scalar fields
    
    queries.push(`# List all ${typeName} entities`);
    queries.push(`query List${typeName}s @auth(level: USER) {`);
    queries.push(`  ${pluralName} {`);
    scalarFields.forEach(fieldName => {
      queries.push(`    ${fieldName}`);
    });
    queries.push(`  }`);
    queries.push(`}`);
    queries.push('');
  });
  
  // Get single entity by ID
  tableTypes.forEach(type => {
    const typeName = type.name;
    // Firebase Data Connect uses camelCase for operations
    const entityName = typeName === 'ActivityLog' ? 'activityLog' : typeName.toLowerCase();
    const scalarFields = Object.entries(type.fields)
      .filter(([name, field]) => field.isScalar)
      .map(([name]) => name)
      .slice(0, 8); // More fields for single entity
    
    // Skip User GetById query to avoid duplicate and type issues
    if (typeName === 'User') {
      return; // User queries are handled separately with correct String type
    }
    
    queries.push(`# Get single ${typeName} by ID`);
    queries.push(`query Get${typeName}ById($id: UUID!) @auth(level: USER) {`);
    queries.push(`  ${entityName}(id: $id) {`);
    scalarFields.forEach(fieldName => {
      queries.push(`    ${fieldName}`);
    });
    queries.push(`  }`);
    queries.push(`}`);
    queries.push('');
  });
  
  // User-specific queries using auth.uid
  queries.push('# Get current user profile');
  queries.push('query GetCurrentUser @auth(level: USER) {');
  queries.push('  user(key: { id_expr: "auth.uid" }) {');
  queries.push('    id');
  queries.push('    email');
  queries.push('    displayName');
  queries.push('    role');
  queries.push('    organization');
  queries.push('    createdAt');
  queries.push('    isActive');
  queries.push('  }');
  queries.push('}');
  queries.push('');
  
  // Get specific user by ID (String type for User)
  queries.push('# Get user by ID');
  queries.push('query GetUserById($id: String!) @auth(level: USER) {');
  queries.push('  user(id: $id) {');
  queries.push('    id');
  queries.push('    email');
  queries.push('    displayName');
  queries.push('    role');
  queries.push('    organization');
  queries.push('    createdAt');
  queries.push('    isActive');
  queries.push('  }');
  queries.push('}');
  queries.push('');
  
  // List user's POVs
  queries.push('# List POVs created by current user');
  queries.push('query ListMyPovs @auth(level: USER) {');
  queries.push('  povs(where: { createdBy: { id: { eq_expr: "auth.uid" } } }) {');
  queries.push('    id');
  queries.push('    name');
  queries.push('    customer');
  queries.push('    status');
  queries.push('    priority');
  queries.push('    createdAt');
  queries.push('  }');
  queries.push('}');
  queries.push('');
  
  return queries.join('\n');
}

function generateMutations(types) {
  const mutations = [];
  
  // Header comment
  mutations.push('# Generated example mutations for Cortex DC Portal');
  mutations.push('# This file is auto-generated based on the current schema');
  mutations.push('# Edit tools/generate-graphql-examples.mjs to modify generation logic');
  mutations.push('');
  
  const tableTypes = Object.values(types).filter(type => type.hasTableDirective);
  
  // Create mutations for each entity
  tableTypes.forEach(type => {
    const typeName = type.name;
    // Firebase Data Connect uses camelCase for mutation operations
    const entityName = typeName === 'ActivityLog' ? 'activityLog' : typeName.toLowerCase();
    
    // Get required fields (excluding auto-generated ones like id, createdAt, updatedAt)
    const inputFields = Object.entries(type.fields)
      .filter(([name, field]) => {
        return field.isRequired && 
               !['id', 'createdAt', 'updatedAt', 'createdBy', 'assignedTo', 'approvedBy', 'author', 'userId'].includes(name) &&
               field.isScalar;
      })
      .map(([name, field]) => ({ name, type: field.type }));
    
    // Handle foreign key requirements
    const foreignKeyFields = [];
    if (type.fields.createdBy && type.fields.createdBy.isRequired) {
      // createdBy will be set via _expr, don't add to inputFields
    }
    if (type.fields.author && type.fields.author.isRequired) {
      foreignKeyFields.push('authorId_expr: "auth.uid"');
    }
    if (type.fields.userId && type.fields.userId.isRequired) {
      foreignKeyFields.push('userIdId_expr: "auth.uid"');
    }
    
    if (inputFields.length > 0) {
      // Generate parameter list
      const paramsList = inputFields.map(field => {
        const typeName = field.type.isList ? `[${field.type.baseType}!]` : field.type.baseType;
        const required = field.type.isRequired ? '!' : '';
        return `$${field.name}: ${typeName}${required}`;
      }).join(', ');
      
      // Generate data object
      const dataFields = inputFields.map(field => `    ${field.name}: $${field.name}`).join(',\n');
      
      mutations.push(`# Create a new ${typeName}`);
      mutations.push(`mutation Create${typeName}(${paramsList}) @auth(level: USER) {`);
      mutations.push(`  ${entityName}_insert(data: {`);
      if (dataFields) {
        mutations.push(dataFields);
      }
      
      // Add foreign key fields
      foreignKeyFields.forEach(fkField => {
        mutations.push('    ' + fkField);
      });
      
      // Add createdBy for entities that have it (using correct field name)
      if (type.fields.createdBy && type.fields.createdBy.isRequired) {
        mutations.push('    createdById_expr: "auth.uid"');
      }
      
      mutations.push('  })');
      mutations.push('}');
      mutations.push('');
      
      // Add variable examples in comments
      mutations.push('# Example variables:');
      mutations.push('# {');
      inputFields.forEach(field => {
        const example = getExampleValue(field.type.baseType, field.name);
        mutations.push(`#   "${field.name}": ${example}`);
      });
      mutations.push('# }');
      mutations.push('');
    }
  });
  
  // Update mutations for common entities
  mutations.push('# Update current user profile');
  mutations.push('mutation UpdateUserProfile($email: String!, $displayName: String, $organization: String) @auth(level: USER) {');
  mutations.push('  user_upsert(data: {');
  mutations.push('    id_expr: "auth.uid"');
  mutations.push('    email: $email');
  mutations.push('    displayName: $displayName');
  mutations.push('    organization: $organization');
  mutations.push('  })');
  mutations.push('}');
  mutations.push('');
  
  // Delete mutations (user-scoped for safety)
  mutations.push('# Delete POV (only by creator)');
  mutations.push('mutation DeletePov($povId: UUID!) @auth(level: USER) {');
  mutations.push('  pov_delete(key: { id: $povId })');
  mutations.push('  # Note: Add additional authorization checks in production');
  mutations.push('}');
  mutations.push('');
  
  return mutations.join('\n');
}

function getExampleValue(typeName, fieldName) {
  switch (typeName) {
    case 'String':
      if (fieldName.includes('email')) return '"user@example.com"';
      if (fieldName.includes('name') || fieldName.includes('title')) return '"Example " + fieldName';
      if (fieldName.includes('customer')) return '"Acme Corp"';
      if (fieldName.includes('industry')) return '"Technology"';
      if (fieldName.includes('status')) return '"active"';
      if (fieldName.includes('priority')) return '"high"';
      if (fieldName.includes('category')) return '"security"';
      return '"Example value"';
    case 'Int':
      return '1';
    case 'Float':
      return '1.0';
    case 'Boolean':
      return 'true';
    case 'UUID':
      return '"550e8400-e29b-41d4-a716-446655440000"';
    case 'Date':
      return '"2024-01-01"';
    default:
      return '"example"';
  }
}

async function main() {
  console.log('🔧 Generating GraphQL Examples from Schema');
  console.log('==========================================');
  
  try {
    // Read and parse schema
    const schemaContent = await fs.readFile(SCHEMA_PATH, 'utf8');
    const document = parse(schemaContent);
    
    console.log('✅ Schema parsed successfully');
    
    // Extract types from schema
    const types = extractTypesFromSchema(document);
    const tableTypes = Object.values(types).filter(type => type.hasTableDirective);
    
    console.log(`📊 Found ${tableTypes.length} table types:`, tableTypes.map(t => t.name).join(', '));
    
    // Generate queries
    console.log('🔍 Generating queries...');
    const queriesContent = generateQueries(types);
    await fs.writeFile(QUERIES_OUTPUT_PATH, queriesContent);
    console.log(`✅ Queries written to ${QUERIES_OUTPUT_PATH}`);
    
    // Generate mutations
    console.log('🔄 Generating mutations...');
    const mutationsContent = generateMutations(types);
    await fs.writeFile(MUTATIONS_OUTPUT_PATH, mutationsContent);
    console.log(`✅ Mutations written to ${MUTATIONS_OUTPUT_PATH}`);
    
    console.log('\n🎉 GraphQL examples generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated files');
    console.log('2. Run: node tools/validate-schema.mjs');
    console.log('3. Test deployment: firebase deploy --only dataconnect');
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateQueries, generateMutations, extractTypesFromSchema };