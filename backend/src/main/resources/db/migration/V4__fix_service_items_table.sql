-- Fix service_items table by removing service_request_id column
-- This column was removed from the entity but still exists in the database

-- First, drop any foreign key constraints on service_request_id
ALTER TABLE service_items DROP FOREIGN KEY IF EXISTS fk_service_items_service_request;

-- Remove the service_request_id column
ALTER TABLE service_items DROP COLUMN IF EXISTS service_request_id;

-- Verify the table structure matches the entity
-- The table should now have: id, invoice_id, name, description, price, quantity, type, part_number, warranty_info 