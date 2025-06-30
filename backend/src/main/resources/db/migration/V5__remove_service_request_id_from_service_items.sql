-- Remove service_request_id column from service_items table
-- This column should not exist as service items are linked to invoices, not directly to service requests

-- Drop the column if it exists
ALTER TABLE service_items DROP COLUMN IF EXISTS service_request_id;

-- Verify the table structure
-- service_items should only have: id, invoice_id, name, description, price, quantity, type, part_number, warranty_info 