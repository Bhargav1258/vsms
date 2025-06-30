package com.vehicleservice.repository;

import com.vehicleservice.model.Invoice;
import com.vehicleservice.model.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByServiceRequest(ServiceRequest serviceRequest);
} 