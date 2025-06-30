package com.vehicleservice.service;

import com.vehicleservice.dto.ServiceItemDTO;
import com.vehicleservice.dto.InvoiceDTO;
import com.vehicleservice.model.Invoice;
import com.vehicleservice.model.ServiceItem;
import com.vehicleservice.model.ServiceRequest;
import com.vehicleservice.repository.InvoiceRepository;
import com.vehicleservice.repository.ServiceItemRepository;
import com.vehicleservice.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceItemService {

    @Autowired
    private ServiceItemRepository serviceItemRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Transactional
    public ServiceItemDTO createServiceItem(ServiceItemDTO dto) {
        ServiceItem serviceItem = new ServiceItem();
        updateServiceItemFromDTO(serviceItem, dto);
        serviceItem = serviceItemRepository.save(serviceItem);
        return convertToDTO(serviceItem);
    }

    @Transactional(readOnly = true)
    public List<ServiceItemDTO> getAllServiceItems() {
        return serviceItemRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceItemDTO getServiceItemById(Long id) {
        ServiceItem serviceItem = serviceItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service item not found"));
        return convertToDTO(serviceItem);
    }

    @Transactional
    public ServiceItemDTO updateServiceItem(Long id, ServiceItemDTO dto) {
        ServiceItem serviceItem = serviceItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service item not found"));
        updateServiceItemFromDTO(serviceItem, dto);
        serviceItem = serviceItemRepository.save(serviceItem);
        return convertToDTO(serviceItem);
    }

    @Transactional
    public void deleteServiceItem(Long id) {
        serviceItemRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ServiceItemDTO> getServiceItemsByInvoiceId(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return serviceItemRepository.findByInvoice(invoice).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceItemDTO addServiceItemToServiceRequest(Long serviceRequestId, ServiceItemDTO dto) {
        var serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));
        var invoice = invoiceRepository.findByServiceRequest(serviceRequest)
                .orElseThrow(() -> new RuntimeException("Invoice not found for this service request"));
        ServiceItem serviceItem = new ServiceItem();
        updateServiceItemFromDTO(serviceItem, dto);
        serviceItem.setInvoice(invoice);
        serviceItem = serviceItemRepository.save(serviceItem);
        return convertToDTO(serviceItem);
    }

    @Transactional
    public Invoice createInvoice(Long serviceRequestId, InvoiceDTO invoiceDTO) {
        ServiceRequest sr = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));
        
        Invoice invoice = new Invoice();
        invoice.setServiceRequest(sr);
        invoice.setTotalAmount(invoiceDTO.getTotalAmount());
        invoice.setStatus(invoiceDTO.getStatus());
        invoice.setBillingAddress(invoiceDTO.getBillingAddress());
        invoice.setBillingCity(invoiceDTO.getBillingCity());
        invoice.setBillingZip(invoiceDTO.getBillingZip());
        
        // Save the invoice first
        invoice = invoiceRepository.save(invoice);
        
        // Add service items
        if (invoiceDTO.getServiceItems() != null) {
            for (ServiceItemDTO itemDTO : invoiceDTO.getServiceItems()) {
                ServiceItem item = new ServiceItem();
                item.setName(itemDTO.getName());
                item.setDescription(itemDTO.getDescription());
                item.setPrice(itemDTO.getPrice());
                item.setQuantity(itemDTO.getQuantity());
                item.setType(itemDTO.getType());
                item.setPartNumber(itemDTO.getPartNumber());
                item.setWarrantyInfo(itemDTO.getWarrantyInfo());
                item.setInvoice(invoice);
                item.setServiceRequestId(serviceRequestId);
                serviceItemRepository.save(item);
            }
        }
        
        return invoice;
    }

    private void updateServiceItemFromDTO(ServiceItem serviceItem, ServiceItemDTO dto) {
        if (dto.getInvoiceId() != null) {
            Invoice invoice = invoiceRepository.findById(dto.getInvoiceId())
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));
            serviceItem.setInvoice(invoice);
        }

        serviceItem.setName(dto.getName());
        serviceItem.setDescription(dto.getDescription());
        serviceItem.setPrice(dto.getPrice());
        serviceItem.setQuantity(dto.getQuantity());
        serviceItem.setType(dto.getType());
        serviceItem.setPartNumber(dto.getPartNumber());
        serviceItem.setWarrantyInfo(dto.getWarrantyInfo());
    }

    private ServiceItemDTO convertToDTO(ServiceItem serviceItem) {
        ServiceItemDTO dto = new ServiceItemDTO();
        dto.setId(serviceItem.getId());
        dto.setInvoiceId(serviceItem.getInvoice().getId());
        dto.setName(serviceItem.getName());
        dto.setDescription(serviceItem.getDescription());
        dto.setPrice(serviceItem.getPrice());
        dto.setQuantity(serviceItem.getQuantity());
        dto.setType(serviceItem.getType());
        dto.setPartNumber(serviceItem.getPartNumber());
        dto.setWarrantyInfo(serviceItem.getWarrantyInfo());
        return dto;
    }
} 