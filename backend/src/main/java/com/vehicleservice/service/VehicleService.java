package com.vehicleservice.service;

import com.vehicleservice.model.Vehicle;
import com.vehicleservice.model.User;
import com.vehicleservice.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class VehicleService {
    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public Vehicle addVehicle(Vehicle vehicle, Long userId) {
        System.out.println("VehicleService.addVehicle called with userId: " + userId);
        
        // Validate required fields
        if (vehicle.getMake() == null || vehicle.getMake().trim().isEmpty()) {
            throw new RuntimeException("Make is required");
        }
        if (vehicle.getModel() == null || vehicle.getModel().trim().isEmpty()) {
            throw new RuntimeException("Model is required");
        }
        if (vehicle.getYear() == null || vehicle.getYear() < 1900 || vehicle.getYear() > LocalDateTime.now().getYear() + 1) {
            throw new RuntimeException("Invalid year");
        }
        if (vehicle.getLicensePlate() == null || vehicle.getLicensePlate().trim().isEmpty()) {
            throw new RuntimeException("License plate is required");
        }

        // Check for duplicate license plate
        if (vehicleRepository.existsByLicensePlate(vehicle.getLicensePlate())) {
            throw new RuntimeException("Vehicle with this license plate already exists");
        }

        // Get user and set relationships
        User user = userService.findById(userId);
        System.out.println("Found user: " + user.getName() + " (ID: " + user.getId() + ")");
        vehicle.setUser(user);
        
        // Set current timestamp
        LocalDateTime now = LocalDateTime.now();
        vehicle.setCreatedAt(now);
        vehicle.setUpdatedAt(now);

        // Set optional fields to null if empty
        if (vehicle.getVinNumber() != null && vehicle.getVinNumber().trim().isEmpty()) {
            vehicle.setVinNumber(null);
        }
        if (vehicle.getMileage() != null && vehicle.getMileage() <= 0) {
            vehicle.setMileage(null);
        }

        System.out.println("Saving vehicle: " + vehicle.getMake() + " " + vehicle.getModel() + " " + vehicle.getLicensePlate());
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        System.out.println("Vehicle saved with ID: " + savedVehicle.getId());
        
        return savedVehicle;
    }

    @Transactional(readOnly = true)
    public List<Vehicle> getVehiclesByUser(Long userId) {
        System.out.println("VehicleService.getVehiclesByUser called with userId: " + userId);
        User user = userService.findById(userId);
        System.out.println("Found user: " + user.getName() + " (ID: " + user.getId() + ")");
        List<Vehicle> vehicles = vehicleRepository.findByUser(user);
        System.out.println("Found " + vehicles.size() + " vehicles for user " + userId);
        for (Vehicle vehicle : vehicles) {
            System.out.println("Vehicle: " + vehicle.getMake() + " " + vehicle.getModel() + " (ID: " + vehicle.getId() + ")");
        }
        return vehicles;
    }

    @Transactional(readOnly = true)
    public List<Vehicle> getAllVehicles() {
        System.out.println("VehicleService.getAllVehicles called");
        List<Vehicle> vehicles = vehicleRepository.findAll();
        System.out.println("Found " + vehicles.size() + " total vehicles in database");
        for (Vehicle vehicle : vehicles) {
            System.out.println("Vehicle: " + vehicle.getMake() + " " + vehicle.getModel() + 
                             " (ID: " + vehicle.getId() + ", User: " + 
                             (vehicle.getUser() != null ? vehicle.getUser().getName() : "null") + ")");
        }
        return vehicles;
    }

    @Transactional(readOnly = true)
    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    @Transactional
    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setMake(vehicleDetails.getMake());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setYear(vehicleDetails.getYear());
        vehicle.setUpdatedAt(LocalDateTime.now());
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicleById(id);
        vehicleRepository.delete(vehicle);
    }
} 