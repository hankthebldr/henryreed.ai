const { BigQuery } = require('@google-cloud/bigquery');
const functions = require('@google-cloud/functions-framework');

// Initialize BigQuery client
const bigquery = new BigQuery();

/**
 * Cloud Function to receive and export data to BigQuery
 * This function receives POST requests with analytics data and inserts it into BigQuery
 */
functions.http('exportToBigQuery', async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { 
      projectId = process.env.BIGQUERY_PROJECT_ID,
      dataset = process.env.BIGQUERY_DATASET || 'cortex_dc_analytics',
      table = process.env.BIGQUERY_TABLE || 'user_interactions',
      records = [],
      metadata = {}
    } = req.body;

    if (!projectId) {
      throw new Error('Project ID is required. Set BIGQUERY_PROJECT_ID environment variable or include in request body.');
    }

    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('Records array is required and must not be empty');
    }

    console.log(`Attempting to insert ${records.length} records into ${projectId}.${dataset}.${table}`);

    // Get dataset and table references
    const datasetRef = bigquery.dataset(dataset);
    const tableRef = datasetRef.table(table);

    // Check if table exists, create if not
    const [tableExists] = await tableRef.exists();
    
    if (!tableExists) {
      console.log(`Table ${dataset}.${table} does not exist, creating...`);
      
      // Define the schema for the analytics table
      const schema = [
        { name: 'id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
        { name: 'event_type', type: 'STRING', mode: 'REQUIRED' },
        { name: 'component', type: 'STRING', mode: 'NULLABLE' },
        { name: 'action', type: 'STRING', mode: 'NULLABLE' },
        { name: 'user_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'session_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'pov_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'trr_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'scenario_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'command', type: 'STRING', mode: 'NULLABLE' },
        { name: 'args', type: 'STRING', mode: 'NULLABLE' },
        { name: 'result', type: 'STRING', mode: 'NULLABLE' },
        { name: 'execution_time_ms', type: 'INTEGER', mode: 'NULLABLE' },
        { name: 'error_message', type: 'STRING', mode: 'NULLABLE' },
        { name: 'metadata', type: 'JSON', mode: 'NULLABLE' },
        { name: 'region', type: 'STRING', mode: 'NULLABLE' },
        { name: 'theatre', type: 'STRING', mode: 'NULLABLE' },
        { name: 'user_agent', type: 'STRING', mode: 'NULLABLE' },
        { name: 'ip_address', type: 'STRING', mode: 'NULLABLE' },
        { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' }
      ];

      await tableRef.create({ schema });
      console.log(`Table ${dataset}.${table} created successfully`);
    }

    // Process and validate records
    const processedRecords = records.map((record, index) => {
      // Ensure required fields
      if (!record.id) {
        record.id = `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      if (!record.timestamp) {
        record.timestamp = new Date().toISOString();
      }

      if (!record.event_type) {
        record.event_type = 'unknown';
      }

      // Add created_at timestamp
      record.created_at = new Date().toISOString();

      // Convert metadata to JSON string if it's an object
      if (record.metadata && typeof record.metadata === 'object') {
        record.metadata = JSON.stringify(record.metadata);
      }

      // Convert args array to string if it's an array
      if (record.args && Array.isArray(record.args)) {
        record.args = JSON.stringify(record.args);
      }

      return record;
    });

    // Insert records into BigQuery
    const [insertResponse] = await tableRef.insert(processedRecords, {
      skipInvalidRows: false,
      ignoreUnknownValues: true,
      raw: true
    });

    // Check for any insert errors
    let insertErrors = [];
    if (insertResponse && insertResponse.insertErrors && insertResponse.insertErrors.length > 0) {
      insertErrors = insertResponse.insertErrors;
      console.error('Insert errors:', insertErrors);
    }

    // Create job information
    const jobId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response = {
      success: insertErrors.length === 0,
      recordsExported: records.length - insertErrors.length,
      recordsWithErrors: insertErrors.length,
      bigqueryJobId: jobId,
      timestamp: Date.now(),
      metadata: {
        dataset,
        table,
        projectId,
        ...metadata
      }
    };

    if (insertErrors.length > 0) {
      response.errors = insertErrors;
      response.error = `${insertErrors.length} records failed to insert`;
    }

    console.log(`Export complete: ${response.recordsExported} records inserted, ${insertErrors.length} errors`);
    
    res.status(200).json(response);

  } catch (error) {
    console.error('BigQuery export error:', error);
    
    res.status(500).json({
      success: false,
      recordsExported: 0,
      error: error.message,
      timestamp: Date.now(),
      bigqueryJobId: null
    });
  }
});

/**
 * Health check endpoint
 */
functions.http('health', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'bigquery-export'
  });
});