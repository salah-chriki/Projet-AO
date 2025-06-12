import { Pool } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// Direct database export without application dependencies
export async function directDatabaseExport(): Promise<void> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Starting direct database export...");
    
    // Check if exports directory exists, create if not
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Get list of all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportData: any = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0",
        tables: tablesResult.rows.map(r => r.table_name)
      }
    };

    // Export each table
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      console.log(`Exporting table: ${tableName}`);
      
      try {
        const tableData = await pool.query(`SELECT * FROM "${tableName}"`);
        exportData[tableName] = tableData.rows;
        console.log(`  - ${tableData.rows.length} records exported from ${tableName}`);
      } catch (error) {
        console.warn(`Failed to export table ${tableName}:`, error);
        exportData[tableName] = [];
      }
    }

    // Calculate total records
    const totalRecords = Object.keys(exportData)
      .filter(key => key !== 'metadata')
      .reduce((sum, tableName) => sum + exportData[tableName].length, 0);

    exportData.metadata.totalRecords = totalRecords;

    // Save complete JSON export
    const jsonFilename = `database_export_${timestamp}.json`;
    const jsonFilepath = path.join(exportsDir, jsonFilename);
    fs.writeFileSync(jsonFilepath, JSON.stringify(exportData, null, 2));

    // Save individual CSV files
    for (const tableName of exportData.metadata.tables) {
      const tableData = exportData[tableName];
      if (tableData.length > 0) {
        const csvFilename = `${tableName}_${timestamp}.csv`;
        const csvFilepath = path.join(exportsDir, csvFilename);
        
        const headers = Object.keys(tableData[0]);
        const csvContent = [
          headers.join(','),
          ...tableData.map((row: any) => 
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
        
        fs.writeFileSync(csvFilepath, csvContent);
      }
    }

    // Save summary
    const summary = `
=== Database Export Summary ===
Export Date: ${exportData.metadata.exportDate}
Total Tables: ${exportData.metadata.tables.length}
Total Records: ${totalRecords}

Table Breakdown:
${exportData.metadata.tables.map((table: string) => 
  `- ${table}: ${exportData[table].length} records`
).join('\n')}

Files Created:
- ${jsonFilename} (Complete JSON export)
${exportData.metadata.tables.map((table: string) => 
  exportData[table].length > 0 ? `- ${table}_${timestamp}.csv` : null
).filter(Boolean).join('\n')}

Export Location: ${exportsDir}
`;

    const summaryFilepath = path.join(exportsDir, `export_summary_${timestamp}.txt`);
    fs.writeFileSync(summaryFilepath, summary);

    console.log("Direct database export completed successfully!");
    console.log(`Files saved in: ${exportsDir}`);
    console.log(`Total records exported: ${totalRecords}`);

  } catch (error) {
    console.error("Direct database export failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// CLI export function
export async function runDirectExport(): Promise<void> {
  try {
    await directDatabaseExport();
    process.exit(0);
  } catch (error) {
    console.error("Export failed:", error);
    process.exit(1);
  }
}

// Run export if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDirectExport();
}