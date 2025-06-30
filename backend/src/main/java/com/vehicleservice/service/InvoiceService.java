package com.vehicleservice.service;

import com.vehicleservice.dto.InvoiceDTO;
import com.vehicleservice.dto.ServiceItemDTO;
import com.vehicleservice.model.Invoice;
import com.vehicleservice.model.ServiceItem;
import com.vehicleservice.model.ServiceRequest;
import com.vehicleservice.repository.InvoiceRepository;
import com.vehicleservice.repository.ServiceItemRepository;
import com.vehicleservice.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private ServiceItemRepository serviceItemRepository;

    @Transactional
    public InvoiceDTO createInvoice(InvoiceDTO dto) {
        System.out.println("=== INVOICE CREATION START ===");
        System.out.println("Creating invoice with service request ID: " + dto.getServiceRequestId());
        System.out.println("Service items count: " + (dto.getServiceItems() != null ? dto.getServiceItems().size() : 0));
        
        if (dto.getServiceItems() != null) {
            for (int i = 0; i < dto.getServiceItems().size(); i++) {
                ServiceItemDTO item = dto.getServiceItems().get(i);
                System.out.println("Service Item " + (i+1) + ": " + item.getName() + " - $" + item.getPrice() + " x" + item.getQuantity());
            }
        }
        
        Invoice invoice = new Invoice();
        updateInvoiceFromDTO(invoice, dto);
        invoice = invoiceRepository.save(invoice);
        System.out.println("Invoice saved with ID: " + invoice.getId());
        
        // Explicitly save service items to ensure they are stored in the database
        if (invoice.getServiceItems() != null && !invoice.getServiceItems().isEmpty()) {
            System.out.println("Saving " + invoice.getServiceItems().size() + " service items to service_items table");
            for (ServiceItem item : invoice.getServiceItems()) {
                try {
                    item.setInvoice(invoice);
                    System.out.println("About to save service item: " + item.getName() + " with invoice ID: " + invoice.getId());
                    ServiceItem savedItem = serviceItemRepository.save(item);
                    System.out.println("✓ Service item saved successfully with ID: " + savedItem.getId() + ", Name: " + savedItem.getName());
                } catch (Exception e) {
                    System.err.println("✗ Error saving service item: " + item.getName());
                    System.err.println("Error details: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        } else {
            System.out.println("No service items to save - invoice.getServiceItems() is null or empty");
        }
        
        System.out.println("=== INVOICE CREATION END ===");
        return convertToDTO(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return convertToDTO(invoice);
    }

    @Transactional
    public InvoiceDTO updateInvoice(Long id, InvoiceDTO dto) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        updateInvoiceFromDTO(invoice, dto);
        invoice = invoiceRepository.save(invoice);
        return convertToDTO(invoice);
    }

    @Transactional
    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }

    @Transactional
    public InvoiceDTO processPayment(Long id, String paymentMethod, String cardLastFour) {
        System.out.println("=== PAYMENT PROCESSING START ===");
        System.out.println("Processing payment for invoice ID: " + id);
        System.out.println("Payment method: " + paymentMethod);
        System.out.println("Card last four: " + cardLastFour);
        
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        System.out.println("Found invoice with status: " + invoice.getStatus());
        
        invoice.setStatus("COMPLETED");
        invoice.setPaidAt(LocalDateTime.now());
        invoice.setPaymentMethod(paymentMethod);
        invoice.setCardLastFour(cardLastFour);
        
        System.out.println("Updated invoice status to: " + invoice.getStatus());
        
        invoice = invoiceRepository.save(invoice);
        System.out.println("Invoice saved successfully with ID: " + invoice.getId());
        
        InvoiceDTO result = convertToDTO(invoice);
        System.out.println("Converted to DTO successfully");
        System.out.println("=== PAYMENT PROCESSING END ===");
        
        return result;
    }

    @Transactional(readOnly = true)
    public List<InvoiceDTO> getInvoicesByServiceRequestId(Long serviceRequestId) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));
        return invoiceRepository.findByServiceRequest(serviceRequest).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private void updateInvoiceFromDTO(Invoice invoice, InvoiceDTO dto) {
        if (dto.getServiceRequestId() != null) {
            ServiceRequest serviceRequest = serviceRequestRepository.findById(dto.getServiceRequestId())
                    .orElseThrow(() -> new RuntimeException("Service request not found"));
            invoice.setServiceRequest(serviceRequest);
        }

        invoice.setTotalAmount(dto.getTotalAmount());
        invoice.setStatus(dto.getStatus());
        invoice.setPaymentMethod(dto.getPaymentMethod());
        invoice.setCardLastFour(dto.getCardLastFour());
        invoice.setBillingAddress(dto.getBillingAddress());
        invoice.setBillingCity(dto.getBillingCity());
        invoice.setBillingZip(dto.getBillingZip());

        if (invoice.getServiceItems() != null) {
            invoice.getServiceItems().clear();
        }

        if (dto.getServiceItems() != null) {
            for (ServiceItemDTO itemDTO : dto.getServiceItems()) {
                ServiceItem item = new ServiceItem();
                item.setInvoice(invoice);
                item.setName(itemDTO.getName());
                item.setDescription(itemDTO.getDescription());
                item.setPrice(itemDTO.getPrice());
                item.setQuantity(itemDTO.getQuantity());
                item.setType(itemDTO.getType());
                item.setPartNumber(itemDTO.getPartNumber());
                item.setWarrantyInfo(itemDTO.getWarrantyInfo());
                invoice.getServiceItems().add(item);
            }
        }
    }

    private InvoiceDTO convertToDTO(Invoice invoice) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setId(invoice.getId());
        
        // Add null check for service request
        if (invoice.getServiceRequest() != null) {
            dto.setServiceRequestId(invoice.getServiceRequest().getId());
        } else {
            System.out.println("Warning: Invoice " + invoice.getId() + " has no service request");
            dto.setServiceRequestId(null);
        }
        
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setStatus(invoice.getStatus());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setPaidAt(invoice.getPaidAt());
        dto.setPaymentMethod(invoice.getPaymentMethod());
        dto.setCardLastFour(invoice.getCardLastFour());
        dto.setBillingAddress(invoice.getBillingAddress());
        dto.setBillingCity(invoice.getBillingCity());
        dto.setBillingZip(invoice.getBillingZip());

        List<ServiceItemDTO> serviceItemDTOs = invoice.getServiceItems().stream()
                .map(item -> {
                    ServiceItemDTO itemDTO = new ServiceItemDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setInvoiceId(item.getInvoice().getId());
                    itemDTO.setName(item.getName());
                    itemDTO.setDescription(item.getDescription());
                    itemDTO.setPrice(item.getPrice());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setType(item.getType());
                    itemDTO.setPartNumber(item.getPartNumber());
                    itemDTO.setWarrantyInfo(item.getWarrantyInfo());
                    return itemDTO;
                })
                .collect(Collectors.toList());
        dto.setServiceItems(serviceItemDTOs);

        return dto;
    }
} 