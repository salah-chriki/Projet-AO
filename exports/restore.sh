#!/bin/bash
# Database restore script for tender management system
# Usage: ./restore.sh backup_file.sql.gz

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Available backups:"
    ls -la ./backups/tender_system_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' not found"
    exit 1
fi

echo "Restoring database from: $BACKUP_FILE"

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "Decompressing backup..."
    gunzip -c "$BACKUP_FILE" | psql $DATABASE_URL
else
    psql $DATABASE_URL < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo "Database restored successfully"
else
    echo "Restore failed"
    exit 1
fi