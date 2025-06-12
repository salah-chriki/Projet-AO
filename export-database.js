import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function exportDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Starting database export...");
    
    // Create exports directory
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0",
        tables: tablesResult.rows.map(r => r.table_name)
      }
    };

    console.log(`Found ${tablesResult.rows.length} tables to export`);

    // Export each table
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      console.log(`Exporting ${tableName}...`);
      
      try {
        const result = await pool.query(`SELECT * FROM "${tableName}"`);
        exportData[tableName] = result.rows;
        console.log(`  ✓ ${result.rows.length} records`);
      } catch (error) {
        console.log(`  ✗ Failed: ${error.message}`);
        exportData[tableName] = [];
      }
    }

    // Calculate totals
    const totalRecords = Object.keys(exportData)
      .filter(key => key !== 'metadata')
      .reduce((sum, tableName) => sum + exportData[tableName].length, 0);

    exportData.metadata.totalRecords = totalRecords;

    // Save JSON export
    const jsonFile = path.join(exportsDir, `complete_export_${timestamp}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(exportData, null, 2));

    // Save CSV files for each table
    const csvFiles = [];
    for (const tableName of exportData.metadata.tables) {
      const tableData = exportData[tableName];
      if (tableData.length > 0) {
        const csvFile = path.join(exportsDir, `${tableName}_${timestamp}.csv`);
        
        const headers = Object.keys(tableData[0]);
        const csvContent = [
          headers.join(','),
          ...tableData.map(row => 
            headers.map(header => {
              const value = row[header];
              if (value === null || value === undefined) return '';
              if (typeof value === 'string' && value.includes(',')) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            }).join(',')
          )
        ].join('\n');
        
        fs.writeFileSync(csvFile, csvContent);
        csvFiles.push(path.basename(csvFile));
      }
    }

    // Create summary
    const summary = `Database Export Summary
======================
Export Date: ${exportData.metadata.exportDate}
Total Tables: ${exportData.metadata.tables.length}
Total Records: ${totalRecords}

Table Details:
${exportData.metadata.tables.map(table => 
  `  ${table}: ${exportData[table].length} records`
).join('\n')}

Files Created:
  complete_export_${timestamp}.json (Full database)
${csvFiles.map(file => `  ${file}`).join('\n')}

Location: ${exportsDir}
`;

    const summaryFile = path.join(exportsDir, `export_summary_${timestamp}.txt`);
    fs.writeFileSync(summaryFile, summary);

    console.log("\n" + summary);
    console.log(`\nExport completed successfully!`);
    console.log(`Files saved in: ${exportsDir}`);

  } catch (error) {
    console.error("Export failed:", error.message);
    
    // Try to provide helpful information even if export fails
    if (error.message.includes('endpoint is disabled')) {
      console.log("\nDatabase endpoint appears to be disabled.");
      console.log("The database may need to be reactivated or recreated.");
    }
    
    throw error;
  } finally {
    await pool.end();
  }
}

exportDatabase().catch(console.error);