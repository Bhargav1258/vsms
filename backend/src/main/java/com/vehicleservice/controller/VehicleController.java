package com.vehicleservice.controller;

import com.vehicleservice.model.Vehicle;
import com.vehicleservice.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataIntegrityViolationException;
import com.vehicleservice.dto.VehicleDTO;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5177", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"})
public class VehicleController {
    private static final Logger logger = LoggerFactory.getLogger(VehicleController.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private VehicleService vehicleService;

    @PostMapping(value = "/user/{userId}", 
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addVehicle(@PathVariable Long userId, @RequestBody VehicleDTO vehicleDTO) {
        try {
            logger.info("Received request to add vehicle for user {}: {}", userId, objectMapper.writeValueAsString(vehicleDTO));
            
            // Validate required fields
            if (vehicleDTO.getMake() == null || vehicleDTO.getMake().trim().isEmpty()) {
                logger.error("Make is required");
                return ResponseEntity.badRequest().body("Make is required");
            }
            if (vehicleDTO.getModel() == null || vehicleDTO.getModel().trim().isEmpty()) {
                logger.error("Model is required");
                return ResponseEntity.badRequest().body("Model is required");
            }
            if (vehicleDTO.getYear() == null) {
                logger.error("Year is required");
                return ResponseEntity.badRequest().body("Year is required");
            }
            if (vehicleDTO.getLicensePlate() == null || vehicleDTO.getLicensePlate().trim().isEmpty()) {
                logger.error("License plate is required");
                return ResponseEntity.badRequest().body("License plate is required");
            }

            // Convert DTO to Vehicle
            Vehicle vehicle = new Vehicle();
            vehicle.setMake(vehicleDTO.getMake());
            vehicle.setModel(vehicleDTO.getModel());
            vehicle.setYear(vehicleDTO.getYear());
            vehicle.setLicensePlate(vehicleDTO.getLicensePlate());
            vehicle.setVinNumber(vehicleDTO.getVinNumber());
            vehicle.setMileage(vehicleDTO.getMileage());

            logger.info("Validation passed, calling vehicleService.addVehicle");
            Vehicle savedVehicle = vehicleService.addVehicle(vehicle, userId);
            logger.info("Successfully added vehicle with ID: {}", savedVehicle.getId());
            logger.info("Vehicle details: {}", objectMapper.writeValueAsString(savedVehicle));
            return ResponseEntity.ok(savedVehicle);
        } catch (DataIntegrityViolationException e) {
            logger.error("Duplicate license plate error: {}", e.getMessage());
            return ResponseEntity.badRequest().body("A vehicle with this license plate already exists.");
        } catch (Exception e) {
            logger.error("Error adding vehicle: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Failed to add vehicle: " + e.getMessage()));
        }
    }

    @PostMapping(value = "", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addVehicleWithBody(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Object vehicleObj = payload.get("vehicle");
            VehicleDTO vehicleDTO = objectMapper.convertValue(vehicleObj, VehicleDTO.class);
            return addVehicle(userId, vehicleDTO);
        } catch (Exception e) {
            logger.error("Error in addVehicleWithBody: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Failed to add vehicle: " + e.getMessage()));
        }
    }

    @GetMapping(value = "/user/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getVehiclesByUser(@PathVariable Long userId) {
        try {
            List<Vehicle> vehicles = vehicleService.getVehiclesByUser(userId);
            List<VehicleDTO> vehicleDTOs = vehicles.stream()
                .map(VehicleDTO::fromEntity)
                .toList();
            return ResponseEntity.ok(vehicleDTOs);
        } catch (RuntimeException e) {
            logger.error("Error getting vehicles for user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllVehicles() {
        try {
            logger.info("Received request to get all vehicles");
            List<Vehicle> vehicles = vehicleService.getAllVehicles();
            List<VehicleDTO> vehicleDTOs = vehicles.stream()
                .map(VehicleDTO::fromEntity)
                .toList();
            logger.info("Returning {} vehicles", vehicleDTOs.size());
            return ResponseEntity.ok(vehicleDTOs);
        } catch (RuntimeException e) {
            logger.error("Error getting all vehicles: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getVehicle(@PathVariable Long id) {
        try {
            Vehicle vehicle = vehicleService.getVehicleById(id);
            return ResponseEntity.ok(vehicle);
        } catch (RuntimeException e) {
            logger.error("Error getting vehicle {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", 
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        try {
            Vehicle updatedVehicle = vehicleService.updateVehicle(id, vehicle);
            return ResponseEntity.ok(updatedVehicle);
        } catch (RuntimeException e) {
            logger.error("Error updating vehicle {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        try {
            vehicleService.deleteVehicle(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            logger.error("Error deleting vehicle {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping(value = "/test", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> testDatabase() {
        try {
            logger.info("Testing database connectivity...");
            
            // Test database connection by trying to get all vehicles
            List<Vehicle> allVehicles = vehicleService.getAllVehicles();
            logger.info("Database test successful. Found {} vehicles", allVehicles.size());
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Database connection working",
                "vehicleCount", allVehicles.size(),
                "timestamp", LocalDateTime.now()
            ));
        } catch (Exception e) {
            logger.error("Database test failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Database connection failed: " + e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }
} 