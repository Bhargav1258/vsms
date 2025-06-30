package com.vehicleservice.repository;

import com.vehicleservice.model.ServiceItem;
import com.vehicleservice.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findByInvoiceId(Long invoiceId);
    List<ServiceItem> findByType(String type);
    List<ServiceItem> findByPartNumber(String partNumber);
    List<ServiceItem> findByInvoice(Invoice invoice);
} 