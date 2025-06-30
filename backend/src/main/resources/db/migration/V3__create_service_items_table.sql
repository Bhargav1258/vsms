-- Create service_items table
CREATE TABLE IF NOT EXISTS service_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500) NOT NULL,
    price DOUBLE NOT NULL,
    quantity INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    part_number VARCHAR(100),
    warranty_info VARCHAR(255),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Add index for better performance
CREATE INDEX idx_service_items_invoice_id ON service_items(invoice_id);
CREATE INDEX idx_service_items_type ON service_items(type);
CREATE INDEX idx_service_items_part_number ON service_items(part_number); 