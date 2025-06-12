#!/bin/bash
# Database backup script for tender management system
# Usage: ./backup.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="tender_system_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Export database schema and data
echo "Creating database backup..."
pg_dump $DATABASE_URL --clean --if-exists --no-owner --no-privileges > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_DIR/$BACKUP_FILE"
    
    # Compress the backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "Backup compressed: $BACKUP_DIR/$BACKUP_FILE.gz"
    
    # Keep only last 10 backups
    cd $BACKUP_DIR
    ls -t tender_system_backup_*.sql.gz | tail -n +11 | xargs -r rm
    echo "Old backups cleaned up"
else
    echo "Backup failed"
    exit 1
fi