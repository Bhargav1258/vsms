package com.vehicleservice.controller;

import com.vehicleservice.dto.InvoiceDTO;
import com.vehicleservice.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<InvoiceDTO> createInvoice(@RequestBody InvoiceDTO invoiceDTO) {
        return ResponseEntity.ok(invoiceService.createInvoice(invoiceDTO));
    }

    @GetMapping
    public ResponseEntity<List<InvoiceDTO>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceDTO> updateInvoice(
            @PathVariable Long id,
            @RequestBody InvoiceDTO invoiceDTO) {
        return ResponseEntity.ok(invoiceService.updateInvoice(id, invoiceDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/process-payment")
    public ResponseEntity<InvoiceDTO> processPayment(
            @PathVariable Long id,
            @RequestParam String paymentMethod,
            @RequestParam String cardLastFour) {
        return ResponseEntity.ok(invoiceService.processPayment(id, paymentMethod, cardLastFour));
    }

    @GetMapping("/service-request/{serviceRequestId}")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByServiceRequestId(@PathVariable Long serviceRequestId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByServiceRequestId(serviceRequestId));
    }
} 