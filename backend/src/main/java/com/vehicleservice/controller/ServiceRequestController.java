package com.vehicleservice.controller;

import com.vehicleservice.dto.ServiceRequestDTO;
import com.vehicleservice.dto.CreateServiceRequestDTO;
import com.vehicleservice.dto.InvoiceDTO;
import com.vehicleservice.dto.ServiceItemDTO;
import com.vehicleservice.service.ServiceRequestService;
import com.vehicleservice.service.InvoiceService;
import com.vehicleservice.service.ServiceItemService;
import com.vehicleservice.repository.ServiceItemRepository;
import com.vehicleservice.repository.ServiceRequestRepository;
import com.vehicleservice.model.ServiceItem;
import com.vehicleservice.model.ServiceRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
@CrossOrigin(origins = "*")
public class ServiceRequestController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private ServiceItemService serviceItemService;

    @Autowired
    private ServiceItemRepository serviceItemRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @PostMapping
    public ResponseEntity<ServiceRequestDTO> createServiceRequest(@RequestBody CreateServiceRequestDTO createServiceRequestDTO) {
        System.out.println("Received service request creation request:");
        System.out.println("Vehicle ID: " + createServiceRequestDTO.getVehicleId());
        System.out.println("Description: " + createServiceRequestDTO.getDescription());
        System.out.println("Service Type: " + createServiceRequestDTO.getServiceType());
        System.out.println("Priority: " + createServiceRequestDTO.getPriority());
        System.out.println("Preferred Date: " + createServiceRequestDTO.getPreferredDate());
        
        try {
            ServiceRequestDTO createdRequest = serviceRequestService.createServiceRequest(createServiceRequestDTO);
            return ResponseEntity.ok(createdRequest);
        } catch (Exception e) {
            System.err.println("Error in controller: " + e.getMessage());
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequestDTO>> getAllServiceRequests() {
        return ResponseEntity.ok(serviceRequestService.getAllServiceRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO> getServiceRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ServiceRequestDTO>> getServiceRequestsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByUserId(userId));
    }

    @PostMapping("/{requestId}/assign-mechanic")
    public ResponseEntity<ServiceRequestDTO> assignMechanic(
            @PathVariable Long requestId,
            @RequestParam Long mechanicId,
            @RequestParam(required = false) String notes) {
        try {
            ServiceRequestDTO updatedRequest = serviceRequestService.assignMechanic(requestId, mechanicId, notes);
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{requestId}/status")
    public ResponseEntity<ServiceRequestDTO> updateServiceRequestStatus(
            @PathVariable Long requestId,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        try {
            ServiceRequestDTO updatedRequest = serviceRequestService.updateServiceRequestStatus(requestId, status, notes);
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/invoice")
    public ResponseEntity<InvoiceDTO> createInvoiceForServiceRequest(
            @PathVariable Long id,
            @RequestBody InvoiceDTO invoiceDTO) {
        System.out.println("=== CREATING INVOICE FOR SERVICE REQUEST ===");
        System.out.println("Service Request ID: " + id);
        System.out.println("Invoice DTO: " + invoiceDTO);
        
        try {
            // Use ServiceItemService to create invoice with service items
            var createdInvoice = serviceItemService.createInvoice(id, invoiceDTO);
            
            // Convert the Invoice entity back to DTO for response
            InvoiceDTO responseDTO = new InvoiceDTO();
            responseDTO.setId(createdInvoice.getId());
            responseDTO.setServiceRequestId(createdInvoice.getServiceRequest().getId());
            responseDTO.setTotalAmount(createdInvoice.getTotalAmount());
            responseDTO.setStatus(createdInvoice.getStatus());
            responseDTO.setBillingAddress(createdInvoice.getBillingAddress());
            responseDTO.setBillingCity(createdInvoice.getBillingCity());
            responseDTO.setBillingZip(createdInvoice.getBillingZip());
            responseDTO.setCreatedAt(createdInvoice.getCreatedAt());
            
            System.out.println("✓ Invoice created successfully with ID: " + createdInvoice.getId());
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            System.err.println("✗ Error creating invoice: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/{id}/service-items")
    public ResponseEntity<ServiceItemDTO> addServiceItemToRequest(@PathVariable Long id, @RequestBody ServiceItemDTO itemDTO) {
        // First, find the service request to verify it exists
        ServiceRequest request = serviceRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Service request not found"));
        
        // Create the service item
        ServiceItem item = new ServiceItem();
        item.setName(itemDTO.getName());
        item.setDescription(itemDTO.getDescription());
        item.setPrice(itemDTO.getPrice());
        item.setQuantity(itemDTO.getQuantity());
        item.setType(itemDTO.getType());
        item.setPartNumber(itemDTO.getPartNumber());
        item.setWarrantyInfo(itemDTO.getWarrantyInfo());
        
        // Note: ServiceItems are linked to invoices, not directly to service requests
        // For now, we'll save it without an invoice (it can be linked later when invoice is created)
        item.setInvoice(null);
        
        ServiceItem saved = serviceItemRepository.save(item);

        // Convert to DTO and return
        ServiceItemDTO responseDTO = new ServiceItemDTO();
        responseDTO.setId(saved.getId());
        responseDTO.setName(saved.getName());
        responseDTO.setDescription(saved.getDescription());
        responseDTO.setPrice(saved.getPrice());
        responseDTO.setQuantity(saved.getQuantity());
        responseDTO.setType(saved.getType());
        responseDTO.setPartNumber(saved.getPartNumber());
        responseDTO.setWarrantyInfo(saved.getWarrantyInfo());
        // Note: ServiceItemDTO doesn't have serviceRequestId field, only invoiceId

        return ResponseEntity.ok(responseDTO);
    }
} 