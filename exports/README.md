# Database Export Guide

## Current Situation
The database endpoint appears to be disabled, preventing direct data access. This guide provides multiple methods to export and backup your tender management system data.

## Export Options

### 1. Complete Database Schema
The file `database_schema.sql` contains the complete PostgreSQL schema for recreating your database structure.

### 2. Sample Data Structure
The file `sample_data.sql` shows the data format and types stored in your system.

### 3. Manual Export Queries
The file `manual_queries.sql` contains SQL queries you can run to export specific data when the database is accessible.

### 4. Backup Scripts
- `backup.sh` - Automated backup script
- `restore.sh` - Database restoration script

## Data Structure Overview

Your tender management system contains:

### Core Tables
- **users**: System users with roles (ST, SM, CE, SB, SOR, TP, Admin)
- **tenders**: Main tender/procurement records
- **workflow_steps**: 59-step workflow definition
- **tender_step_history**: Workflow execution history

### Contract Management
- **contracts**: Contract records linked to tenders
- **invoices**: Invoice management
- **orders**: Purchase orders
- **receptions**: Delivery confirmations
- **payments**: Payment tracking

### Supporting Tables
- **tender_comments**: Communication history
- **tender_documents**: File attachments
- **sessions**: Authentication sessions

## Workflow System

Your system implements a 59-step French public procurement workflow:

### Phase 1: Preparation and Publication (Steps 1-23)
- Needs assessment and technical specifications
- Administrative document preparation
- Budget validation and engagement
- Market publication

### Phase 2: Execution and Control (Steps 24-42)
- Bid reception and evaluation
- Technical and financial analysis
- Contract award and signature

### Phase 3: Payment Processing (Steps 43-59)
- Delivery verification and reception
- Invoice certification and validation
- Payment authorization and execution

## Actor Roles
- **ST** (Service Technique): Technical specifications and evaluation
- **SM** (Service Marchés): Market procedures and management
- **CE** (Contrôle d'État): Regulatory compliance verification
- **SB** (Service Budgétaire): Budget management and engagement
- **SOR** (Service Ordonnancement): Payment ordering
- **TP** (Trésorier Payeur): Final payment execution
- **Admin**: System administration

## Sample Tender Data

Your system contains tender data for various procurement categories:
- IT Equipment (computers, printers, servers)
- Infrastructure projects
- Professional services
- Urban furniture and equipment
- Road maintenance and construction

## Accessing Your Data

### Option 1: Database Reactivation
Contact your database provider to reactivate the endpoint, then use the provided backup scripts.

### Option 2: Manual Export
If you have database access through another tool, use the queries in `manual_queries.sql`.

### Option 3: System Recreation
Use `database_schema.sql` to recreate the database structure on a new instance.

## Files in This Directory

1. `database_schema.sql` - Complete database structure
2. `sample_data.sql` - Example data inserts
3. `manual_queries.sql` - Export queries for direct database access
4. `backup.sh` - Automated backup script
5. `restore.sh` - Database restoration script
6. `README.md` - This documentation

## Next Steps

1. **Immediate**: Review the schema and sample data files to understand your data structure
2. **Short-term**: Reactivate your database endpoint to enable live exports
3. **Long-term**: Implement regular automated backups using the provided scripts

The application is currently running with limited functionality due to the database connection issue, but the complete system architecture and 59-step workflow implementation are ready to operate once database access is restored.