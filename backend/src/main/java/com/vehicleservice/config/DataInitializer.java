package com.vehicleservice.config;

import com.vehicleservice.model.User;
import com.vehicleservice.model.Vehicle;
import com.vehicleservice.model.ServiceRequest;
import com.vehicleservice.model.Invoice;
import com.vehicleservice.model.ServiceItem;
import com.vehicleservice.repository.UserRepository;
import com.vehicleservice.repository.VehicleRepository;
import com.vehicleservice.repository.ServiceRequestRepository;
import com.vehicleservice.repository.InvoiceRepository;
import com.vehicleservice.repository.ServiceItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ServiceItemRepository serviceItemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Clean up orphaned service_items to prevent foreign key errors
        serviceItemRepository.deleteAll(
            serviceItemRepository.findAll().stream()
                .filter(item -> item.getInvoice() == null ||
                    (item.getInvoice().getId() == null || !invoiceRepository.existsById(item.getInvoice().getId())))
                .toList()
        );
        // Demo data creation is disabled to preserve existing data and prevent duplicate key errors.
        // User admin = createUserIfNotExists(...);
        // User mechanic = createUserIfNotExists(...);
        // User user = createUserIfNotExists(...);
        // List<Vehicle> vehicles = createVehicles(admin, mechanic, user);
        // List<ServiceRequest> serviceRequests = createServiceRequests(vehicles, mechanic);
        // createInvoicesAndServiceItems(serviceRequests);
        // ... any other demo data code ...
    }

    private User createUserIfNotExists(String email, String name, String password, String role, String phone, String address) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setPhone(phone);
            user.setAddress(address);
            if (role.equals("USER")) {
                user.setVehicleDetails("Toyota Camry 2020");
            }
            return userRepository.save(user);
        }
        return userRepository.findByEmail(email).orElse(null);
    }

    private List<Vehicle> createVehicles(User admin, User mechanic, User user) {
        List<Vehicle> vehicles = Arrays.asList(
            // Admin's vehicles
            createVehicle(admin, "Toyota", "Camry", 2020, "ADMIN001", "1HGBH41JXMN109186", 45000),
            createVehicle(admin, "Honda", "Civic", 2019, "XYZ789", "2T1BURHE0JC123456", 38000),
            
            // Mechanic's vehicles
            createVehicle(mechanic, "Ford", "F-150", 2021, "MECH001", "1FTEW1EG0JFA12345", 25000),
            createVehicle(mechanic, "Chevrolet", "Silverado", 2020, "MECH002", "1GCUYDEF0LZ123456", 32000),
            
            // User's vehicles
            createVehicle(user, "Toyota", "Camry", 2020, "USER001", "4T1B11HK5JU123456", 42000),
            createVehicle(user, "Nissan", "Altima", 2021, "USER002", "1N4AL3AP4JC123456", 28000),
            createVehicle(user, "Honda", "Accord", 2019, "USER003", "1HGCV1F30LA123456", 55000)
        );

        return vehicles;
    }

    private Vehicle createVehicle(User user, String make, String model, int year, String licensePlate, String vinNumber, int mileage) {
        Vehicle vehicle = new Vehicle();
        vehicle.setUser(user);
        vehicle.setMake(make);
        vehicle.setModel(model);
        vehicle.setYear(year);
        vehicle.setLicensePlate(licensePlate);
        vehicle.setVinNumber(vinNumber);
        vehicle.setMileage(mileage);
        vehicle.setLastServiceDate(LocalDateTime.now().minusMonths(3));
        vehicle.setCreatedAt(LocalDateTime.now().minusMonths(6));
        vehicle.setUpdatedAt(LocalDateTime.now().minusMonths(6));
        return vehicleRepository.save(vehicle);
    }

    private List<ServiceRequest> createServiceRequests(List<Vehicle> vehicles, User mechanic) {
        List<ServiceRequest> requests = Arrays.asList(
            // High priority requests
            createServiceRequest(vehicles.get(4), mechanic, "Engine making strange noises", "ENGINE_REPAIR", "HIGH", LocalDateTime.now().plusDays(1)),
            createServiceRequest(vehicles.get(5), null, "Brake pedal feels soft", "BRAKE_SERVICE", "HIGH", LocalDateTime.now().plusDays(2)),
            
            // Medium priority requests
            createServiceRequest(vehicles.get(6), mechanic, "Oil change and filter replacement", "OIL_CHANGE", "MEDIUM", LocalDateTime.now().plusDays(3)),
            createServiceRequest(vehicles.get(0), null, "AC not cooling properly", "AC_SERVICE", "MEDIUM", LocalDateTime.now().plusDays(4)),
            createServiceRequest(vehicles.get(1), mechanic, "Tire rotation and alignment", "TIRE_SERVICE", "MEDIUM", LocalDateTime.now().plusDays(5)),
            
            // Low priority requests
            createServiceRequest(vehicles.get(2), null, "Windshield wiper replacement", "WIPER_REPLACEMENT", "LOW", LocalDateTime.now().plusDays(7)),
            createServiceRequest(vehicles.get(3), mechanic, "Headlight bulb replacement", "LIGHT_REPLACEMENT", "LOW", LocalDateTime.now().plusDays(8)),
            
            // Completed requests
            createCompletedServiceRequest(vehicles.get(4), mechanic, "Regular maintenance service", "MAINTENANCE", "MEDIUM", LocalDateTime.now().minusDays(30)),
            createCompletedServiceRequest(vehicles.get(5), mechanic, "Battery replacement", "BATTERY_REPLACEMENT", "HIGH", LocalDateTime.now().minusDays(15))
        );

        return requests;
    }

    private ServiceRequest createServiceRequest(Vehicle vehicle, User mechanic, String description, String serviceType, String priority, LocalDateTime preferredDate) {
        ServiceRequest request = new ServiceRequest();
        request.setVehicle(vehicle);
        request.setMechanic(mechanic);
        request.setDescription(description);
        request.setServiceType(serviceType);
        request.setPriority(priority);
        request.setPreferredDate(preferredDate);
        request.setStatus(mechanic != null ? "ASSIGNED" : "PENDING");
        request.setCreatedAt(LocalDateTime.now().minusDays((int)(Math.random() * 30)));
        if (mechanic != null) {
            request.setAssignedAt(LocalDateTime.now().minusDays((int)(Math.random() * 7)));
            request.setMechanicNotes("Work in progress");
        }
        return serviceRequestRepository.save(request);
    }

    private ServiceRequest createCompletedServiceRequest(Vehicle vehicle, User mechanic, String description, String serviceType, String priority, LocalDateTime preferredDate) {
        ServiceRequest request = new ServiceRequest();
        request.setVehicle(vehicle);
        request.setMechanic(mechanic);
        request.setDescription(description);
        request.setServiceType(serviceType);
        request.setPriority(priority);
        request.setPreferredDate(preferredDate);
        request.setStatus("COMPLETED");
        request.setCreatedAt(LocalDateTime.now().minusDays(45));
        request.setAssignedAt(LocalDateTime.now().minusDays(40));
        request.setMechanicNotes("Service completed successfully. All systems working properly.");
        return serviceRequestRepository.save(request);
    }

    private void createInvoicesAndServiceItems(List<ServiceRequest> serviceRequests) {
        // Create invoices for completed service requests
        for (ServiceRequest request : serviceRequests) {
            if ("COMPLETED".equals(request.getStatus())) {
                Invoice invoice = createInvoice(request);
                createServiceItemsForInvoice(invoice, request.getServiceType());
            }
        }
    }

    private Invoice createInvoice(ServiceRequest serviceRequest) {
        Invoice invoice = new Invoice();
        invoice.setServiceRequest(serviceRequest);
        invoice.setTotalAmount(0.0); // Will be calculated from service items
        invoice.setStatus("PENDING");
        invoice.setBillingAddress(serviceRequest.getVehicle().getUser().getAddress());
        invoice.setBillingCity("Sample City");
        invoice.setBillingZip("12345");
        invoice.setCreatedAt(LocalDateTime.now().minusDays(10));
        return invoiceRepository.save(invoice);
    }

    private void createServiceItemsForInvoice(Invoice invoice, String serviceType) {
        List<ServiceItem> items = Arrays.asList();
        double totalAmount = 0.0;

        switch (serviceType) {
            case "MAINTENANCE":
                items = Arrays.asList(
                    createServiceItem(invoice, "Oil Change", "Synthetic oil change with filter", 45.00, 1, "SERVICE"),
                    createServiceItem(invoice, "Air Filter", "Engine air filter replacement", 25.00, 1, "PART"),
                    createServiceItem(invoice, "Cabin Filter", "Cabin air filter replacement", 30.00, 1, "PART"),
                    createServiceItem(invoice, "Labor", "Maintenance service labor", 60.00, 1, "LABOR")
                );
                break;
            case "BATTERY_REPLACEMENT":
                items = Arrays.asList(
                    createServiceItem(invoice, "Car Battery", "12V automotive battery", 120.00, 1, "PART"),
                    createServiceItem(invoice, "Labor", "Battery installation labor", 30.00, 1, "LABOR")
                );
                break;
            case "ENGINE_REPAIR":
                items = Arrays.asList(
                    createServiceItem(invoice, "Engine Diagnostic", "Computer diagnostic service", 80.00, 1, "SERVICE"),
                    createServiceItem(invoice, "Labor", "Engine repair labor", 150.00, 2, "LABOR")
                );
                break;
            case "BRAKE_SERVICE":
                items = Arrays.asList(
                    createServiceItem(invoice, "Brake Pads", "Front brake pads replacement", 80.00, 1, "PART"),
                    createServiceItem(invoice, "Brake Fluid", "Brake fluid replacement", 25.00, 1, "PART"),
                    createServiceItem(invoice, "Labor", "Brake service labor", 90.00, 1, "LABOR")
                );
                break;
            default:
                items = Arrays.asList(
                    createServiceItem(invoice, "General Service", "General vehicle service", 75.00, 1, "SERVICE"),
                    createServiceItem(invoice, "Labor", "Service labor", 50.00, 1, "LABOR")
                );
        }

        // Save service items and calculate total
        for (ServiceItem item : items) {
            serviceItemRepository.save(item);
            totalAmount += item.getPrice() * item.getQuantity();
        }

        // Update invoice with total amount
        invoice.setTotalAmount(totalAmount);
        invoiceRepository.save(invoice);
    }

    private ServiceItem createServiceItem(Invoice invoice, String name, String description, double price, int quantity, String type) {
        ServiceItem item = new ServiceItem();
        item.setInvoice(invoice);
        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setQuantity(quantity);
        item.setType(type);
        if ("PART".equals(type)) {
            item.setPartNumber("PART-" + (int)(Math.random() * 10000));
            item.setWarrantyInfo("12 months warranty");
        }
        return item;
    }
} 