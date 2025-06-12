-- Manual export queries for data extraction
-- Run these queries individually to export specific data

-- Export all users
COPY (SELECT * FROM users) TO '/tmp/users_export.csv' WITH CSV HEADER;

-- Export all tenders
COPY (SELECT * FROM tenders) TO '/tmp/tenders_export.csv' WITH CSV HEADER;

-- Export all contracts
COPY (SELECT * FROM contracts) TO '/tmp/contracts_export.csv' WITH CSV HEADER;

-- Export all invoices
COPY (SELECT * FROM invoices) TO '/tmp/invoices_export.csv' WITH CSV HEADER;

-- Export all orders
COPY (SELECT * FROM orders) TO '/tmp/orders_export.csv' WITH CSV HEADER;

-- Export all receptions
COPY (SELECT * FROM receptions) TO '/tmp/receptions_export.csv' WITH CSV HEADER;

-- Export all payments
COPY (SELECT * FROM payments) TO '/tmp/payments_export.csv' WITH CSV HEADER;

-- Export workflow steps
COPY (SELECT * FROM workflow_steps) TO '/tmp/workflow_steps_export.csv' WITH CSV HEADER;

-- Export tender step history
COPY (SELECT * FROM tender_step_history) TO '/tmp/tender_step_history_export.csv' WITH CSV HEADER;

-- Export tender comments
COPY (SELECT * FROM tender_comments) TO '/tmp/tender_comments_export.csv' WITH CSV HEADER;

-- Export tender documents
COPY (SELECT * FROM tender_documents) TO '/tmp/tender_documents_export.csv' WITH CSV HEADER;

-- Export tender workflow summary
COPY (
  SELECT 
    t.reference,
    t.title,
    t.direction,
    t.currentPhase,
    t.currentStep,
    t.status,
    t.amount,
    u.username as current_actor,
    t.createdAt
  FROM tenders t
  LEFT JOIN users u ON t.currentActorId = u.id
  ORDER BY t.createdAt DESC
) TO '/tmp/tender_summary.csv' WITH CSV HEADER;

-- Export complete workflow history
COPY (
  SELECT 
    t.reference as tender_ref,
    h.stepNumber,
    h.phase,
    h.action,
    h.status,
    u.username as actor,
    h.comments,
    h.createdAt
  FROM tender_step_history h
  JOIN tenders t ON h.tenderId = t.id
  JOIN users u ON h.actorId = u.id
  ORDER BY t.reference, h.phase, h.stepNumber
) TO '/tmp/workflow_history.csv' WITH CSV HEADER;

-- Export contract lifecycle summary
COPY (
  SELECT 
    c.reference as contract_ref,
    t.reference as tender_ref,
    c.contractorName,
    c.amount,
    c.status as contract_status,
    COUNT(i.id) as invoice_count,
    COUNT(o.id) as order_count,
    COUNT(r.id) as reception_count,
    COUNT(p.id) as payment_count,
    c.createdAt,
    c.signedAt
  FROM contracts c
  JOIN tenders t ON c.tenderId = t.id
  LEFT JOIN invoices i ON i.contractId = c.id
  LEFT JOIN orders o ON o.contractId = c.id
  LEFT JOIN receptions r ON r.contractId = c.id
  LEFT JOIN payments p ON p.invoiceId = i.id
  GROUP BY c.id, t.reference
  ORDER BY c.createdAt DESC
) TO '/tmp/contract_lifecycle.csv' WITH CSV HEADER;

-- Export financial summary
COPY (
  SELECT 
    t.direction,
    COUNT(t.id) as tender_count,
    COUNT(c.id) as contract_count,
    SUM(CAST(c.amount AS DECIMAL)) as total_contract_value,
    COUNT(i.id) as invoice_count,
    SUM(CAST(i.amount AS DECIMAL)) as total_invoice_value,
    COUNT(p.id) as payment_count,
    SUM(CAST(p.amount AS DECIMAL)) as total_paid_amount
  FROM tenders t
  LEFT JOIN contracts c ON c.tenderId = t.id
  LEFT JOIN invoices i ON i.contractId = c.id
  LEFT JOIN payments p ON p.invoiceId = i.id
  GROUP BY t.direction
  ORDER BY total_contract_value DESC
) TO '/tmp/financial_summary.csv' WITH CSV HEADER;