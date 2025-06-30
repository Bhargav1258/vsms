package com.vehicleservice.controller;

import com.vehicleservice.dto.ServiceItemDTO;
import com.vehicleservice.service.ServiceItemService;
import com.vehicleservice.repository.ServiceItemRepository;
import com.vehicleservice.repository.InvoiceRepository;
import com.vehicleservice.model.Invoice;
import com.vehicleservice.model.ServiceItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-items")
@CrossOrigin(origins = "*")
public class ServiceItemController {

    @Autowired
    private ServiceItemService serviceItemService;

    @Autowired
    private ServiceItemRepository serviceItemRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @PostMapping
    public ResponseEntity<ServiceItemDTO> createServiceItem(@RequestBody ServiceItemDTO serviceItemDTO) {
        return ResponseEntity.ok(serviceItemService.createServiceItem(serviceItemDTO));
    }

    @GetMapping
    public ResponseEntity<List<ServiceItemDTO>> getAllServiceItems() {
        return ResponseEntity.ok(serviceItemService.getAllServiceItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceItemDTO> getServiceItemById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceItemService.getServiceItemById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceItemDTO> updateServiceItem(
            @PathVariable Long id,
            @RequestBody ServiceItemDTO serviceItemDTO) {
        return ResponseEntity.ok(serviceItemService.updateServiceItem(id, serviceItemDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceItem(@PathVariable Long id) {
        serviceItemService.deleteServiceItem(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<ServiceItemDTO>> getServiceItemsByInvoiceId(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(serviceItemService.getServiceItemsByInvoiceId(invoiceId));
    }

    @PostMapping("/by-service-request/{serviceRequestId}")
    public ResponseEntity<ServiceItemDTO> addServiceItemToServiceRequest(
            @PathVariable Long serviceRequestId,
            @RequestBody ServiceItemDTO serviceItemDTO) {
        ServiceItemDTO created = serviceItemService.addServiceItemToServiceRequest(serviceRequestId, serviceItemDTO);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/test")
    public ResponseEntity<String> testServiceItemCreation() {
        try {
            System.out.println("=== TESTING SERVICE ITEM CREATION ===");
            
            // First, try to get an existing invoice to link to
            List<Invoice> existingInvoices = invoiceRepository.findAll();
            if (existingInvoices.isEmpty()) {
                return ResponseEntity.status(400).body("No invoices found. Please create an invoice first.");
            }
            
            Invoice testInvoice = existingInvoices.get(0);
            System.out.println("Using existing invoice ID: " + testInvoice.getId());
            
            // Create a test service item
            ServiceItem testItem = new ServiceItem();
            testItem.setInvoice(testInvoice); // Set the invoice
            testItem.setName("Test Service Item");
            testItem.setDescription("Test description");
            testItem.setPrice(50.0);
            testItem.setQuantity(1);
            testItem.setType("TEST");
            testItem.setPartNumber("TEST-001");
            testItem.setWarrantyInfo("Test warranty");
            
            System.out.println("About to save test service item with invoice ID: " + testInvoice.getId());
            ServiceItem savedItem = serviceItemRepository.save(testItem);
            System.out.println("✓ Test service item saved with ID: " + savedItem.getId());
            
            return ResponseEntity.ok("Test service item created successfully with ID: " + savedItem.getId());
        } catch (Exception e) {
            System.err.println("✗ Error in test service item creation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/diagnose")
    public ResponseEntity<String> diagnoseServiceItemTable() {
        try {
            System.out.println("=== DIAGNOSING SERVICE ITEMS TABLE ===");
            
            // Check if we can connect to the database
            System.out.println("1. Testing database connection...");
            long invoiceCount = invoiceRepository.count();
            System.out.println("✓ Database connection OK. Found " + invoiceCount + " invoices");
            
            // Check if we can access the service items repository
            System.out.println("2. Testing service items repository...");
            long serviceItemCount = serviceItemRepository.count();
            System.out.println("✓ Service items repository OK. Found " + serviceItemCount + " existing service items");
            
            // Try to find existing invoices
            List<Invoice> existingInvoices = invoiceRepository.findAll();
            System.out.println("3. Found " + existingInvoices.size() + " invoices in database");
            
            if (existingInvoices.isEmpty()) {
                return ResponseEntity.ok("Diagnosis: No invoices found. Please create an invoice first through the normal flow.");
            }
            
            Invoice testInvoice = existingInvoices.get(0);
            System.out.println("4. Using invoice ID: " + testInvoice.getId() + " for testing");
            
            // Try to create a service item object (without saving)
            System.out.println("5. Testing service item object creation...");
            ServiceItem testItem = new ServiceItem();
            testItem.setInvoice(testInvoice);
            testItem.setName("Diagnostic Test");
            testItem.setDescription("Test description");
            testItem.setPrice(50.0);
            testItem.setQuantity(1);
            testItem.setType("TEST");
            
            System.out.println("✓ Service item object created successfully");
            System.out.println("6. About to attempt save...");
            
            // Try to save
            ServiceItem savedItem = serviceItemRepository.save(testItem);
            System.out.println("✓ Service item saved successfully with ID: " + savedItem.getId());
            
            return ResponseEntity.ok("Diagnosis: Everything working correctly! Test service item saved with ID: " + savedItem.getId());
            
        } catch (Exception e) {
            System.err.println("✗ DIAGNOSIS FAILED: " + e.getMessage());
            e.printStackTrace();
            
            String errorDetails = "Error Type: " + e.getClass().getSimpleName() + "\n";
            errorDetails += "Error Message: " + e.getMessage() + "\n";
            
            if (e.getCause() != null) {
                errorDetails += "Root Cause: " + e.getCause().getMessage() + "\n";
            }
            
            return ResponseEntity.status(500).body("Diagnosis Failed:\n" + errorDetails);
        }
    }

    @GetMapping("/check-parameters")
    public ResponseEntity<String> checkServiceItemParameters() {
        try {
            StringBuilder response = new StringBuilder();
            response.append("=== SERVICE ITEM PARAMETER CHECK ===\n\n");
            
            response.append("Backend Entity Fields:\n");
            response.append("- id (Long, Primary Key)\n");
            response.append("- invoice (Invoice, Foreign Key to invoice_id)\n");
            response.append("- name (String, NOT NULL)\n");
            response.append("- description (String, NOT NULL)\n");
            response.append("- price (Double, NOT NULL)\n");
            response.append("- quantity (Integer, NOT NULL)\n");
            response.append("- type (String, NOT NULL)\n");
            response.append("- partNumber (String, maps to part_number)\n");
            response.append("- warrantyInfo (String, maps to warranty_info)\n");
            response.append("- serviceRequestId (Long, maps to service_request_id)\n\n");
            
            response.append("Database Table Columns:\n");
            response.append("- id BIGINT AUTO_INCREMENT PRIMARY KEY\n");
            response.append("- invoice_id BIGINT NOT NULL (Foreign Key)\n");
            response.append("- name VARCHAR(255) NOT NULL\n");
            response.append("- description VARCHAR(500) NOT NULL\n");
            response.append("- price DOUBLE NOT NULL\n");
            response.append("- quantity INT NOT NULL\n");
            response.append("- type VARCHAR(50) NOT NULL\n");
            response.append("- part_number VARCHAR(100)\n");
            response.append("- warranty_info VARCHAR(255)\n");
            response.append("- service_request_id BIGINT\n\n");
            
            response.append("Repository Methods:\n");
            response.append("- findByInvoiceId(Long invoiceId)\n");
            response.append("- findByType(String type)\n");
            response.append("- findByPartNumber(String partNumber)\n");
            response.append("- findByInvoice(Invoice invoice)\n\n");
            
            // Test database connection
            try {
                long count = serviceItemRepository.count();
                response.append("Database Connection: ✓ OK\n");
                response.append("Current service_items count: ").append(count).append("\n");
            } catch (Exception e) {
                response.append("Database Connection: ✗ FAILED - ").append(e.getMessage()).append("\n");
            }
            
            return ResponseEntity.ok(response.toString());
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Parameter check failed: " + e.getMessage());
        }
    }
} 