import { storage } from "./storage";
import * as fs from "fs";
import * as path from "path";

export interface ExportData {
  metadata: {
    exportDate: string;
    version: string;
    totalRecords: number;
  };
  users: any[];
  tenders: any[];
  workflowSteps: any[];
  tenderStepHistory: any[];
  tenderComments: any[];
  tenderDocuments: any[];
  contracts: any[];
  invoices: any[];
  orders: any[];
  receptions: any[];
  payments: any[];
}

export async function exportAllData(): Promise<ExportData> {
  console.log("Starting comprehensive data export...");

  try {
    // Export all data from each table
    const [
      users,
      tenders,
      workflowSteps,
      contracts,
      invoices,
      orders,
      receptions,
      payments
    ] = await Promise.all([
      storage.getAllUsers(),
      storage.getAllTenders(),
      storage.getWorkflowSteps(),
      storage.getAllContracts(),
      storage.getAllInvoices(),
      storage.getAllOrders(),
      storage.getAllReceptions(),
      storage.getAllPayments()
    ]);

    // Get tender-related data
    const tenderStepHistory: any[] = [];
    const tenderComments: any[] = [];
    const tenderDocuments: any[] = [];

    for (const tender of tenders) {
      try {
        const history = await storage.getTenderStepHistory(tender.id);
        const comments = await storage.getTenderComments(tender.id);
        const documents = await storage.getTenderDocuments(tender.id);
        
        tenderStepHistory.push(...history);
        tenderComments.push(...comments);
        tenderDocuments.push(...documents);
      } catch (error) {
        console.warn(`Failed to export data for tender ${tender.id}:`, error);
      }
    }

    const totalRecords = users.length + tenders.length + workflowSteps.length + 
                        tenderStepHistory.length + tenderComments.length + 
                        tenderDocuments.length + contracts.length + invoices.length + 
                        orders.length + receptions.length + payments.length;

    const exportData: ExportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0",
        totalRecords
      },
      users,
      tenders,
      workflowSteps,
      tenderStepHistory,
      tenderComments,
      tenderDocuments,
      contracts,
      invoices,
      orders,
      receptions,
      payments
    };

    console.log(`Data export completed. Total records: ${totalRecords}`);
    return exportData;

  } catch (error) {
    console.error("Error during data export:", error);
    throw new Error(`Data export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function exportToFile(format: 'json' | 'csv' = 'json'): Promise<string> {
  const data = await exportAllData();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  if (format === 'json') {
    const filename = `tender_system_export_${timestamp}.json`;
    const filepath = path.join(process.cwd(), 'exports', filename);
    
    // Ensure exports directory exists
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`Data exported to: ${filepath}`);
    return filepath;
  }
  
  // CSV export (simplified version)
  if (format === 'csv') {
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Export each table as separate CSV
    const files: string[] = [];
    
    const tables = [
      { name: 'users', data: data.users },
      { name: 'tenders', data: data.tenders },
      { name: 'contracts', data: data.contracts },
      { name: 'invoices', data: data.invoices },
      { name: 'orders', data: data.orders },
      { name: 'receptions', data: data.receptions },
      { name: 'payments', data: data.payments }
    ];

    for (const table of tables) {
      if (table.data.length > 0) {
        const filename = `${table.name}_export_${timestamp}.csv`;
        const filepath = path.join(exportsDir, filename);
        
        const headers = Object.keys(table.data[0]);
        const csvContent = [
          headers.join(','),
          ...table.data.map(row => 
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
        
        fs.writeFileSync(filepath, csvContent);
        files.push(filepath);
      }
    }
    
    console.log(`CSV files exported: ${files.length} files`);
    return exportsDir;
  }
  
  throw new Error(`Unsupported export format: ${format}`);
}

export function generateExportSummary(data: ExportData): string {
  return `
=== Tender Management System - Data Export Summary ===
Export Date: ${data.metadata.exportDate}
Total Records: ${data.metadata.totalRecords}

Data Breakdown:
- Users: ${data.users.length}
- Tenders: ${data.tenders.length}
- Workflow Steps: ${data.workflowSteps.length}
- Step History: ${data.tenderStepHistory.length}
- Comments: ${data.tenderComments.length}
- Documents: ${data.tenderDocuments.length}
- Contracts: ${data.contracts.length}
- Invoices: ${data.invoices.length}
- Orders: ${data.orders.length}
- Receptions: ${data.receptions.length}
- Payments: ${data.payments.length}

=== End Summary ===
  `.trim();
}