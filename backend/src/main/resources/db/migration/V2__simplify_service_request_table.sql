-- Drop foreign key constraints first
ALTER TABLE service_request DROP CONSTRAINT IF EXISTS fk_service_request_mechanic;
ALTER TABLE service_request DROP CONSTRAINT IF EXISTS fk_service_request_invoice;

-- Drop columns that are no longer needed
ALTER TABLE service_request DROP COLUMN IF EXISTS mechanic_id;
ALTER TABLE service_request DROP COLUMN IF EXISTS invoice_id;
ALTER TABLE service_request DROP COLUMN IF EXISTS status;
ALTER TABLE service_request DROP COLUMN IF EXISTS mechanic_notes;
ALTER TABLE service_request DROP COLUMN IF EXISTS mechanic_name;
ALTER TABLE service_request DROP COLUMN IF EXISTS estimated_cost;
ALTER TABLE service_request DROP COLUMN IF EXISTS final_cost;
ALTER TABLE service_request DROP COLUMN IF EXISTS updated_at;
ALTER TABLE service_request DROP COLUMN IF EXISTS completed_at;

-- Make required fields NOT NULL
ALTER TABLE service_request ALTER COLUMN service_type SET NOT NULL;
ALTER TABLE service_request ALTER COLUMN priority SET NOT NULL;
ALTER TABLE service_request ALTER COLUMN preferred_date SET NOT NULL; 