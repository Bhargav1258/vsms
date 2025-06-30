package com.vehicleservice.service;

import com.vehicleservice.dto.ServiceRequestDTO;
import com.vehicleservice.dto.CreateServiceRequestDTO;
import com.vehicleservice.model.ServiceRequest;
import com.vehicleservice.model.Vehicle;
import com.vehicleservice.model.User;
import com.vehicleservice.repository.ServiceRequestRepository;
import com.vehicleservice.repository.VehicleRepository;
import com.vehicleservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ServiceRequestService {

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    public ServiceRequestDTO createServiceRequest(CreateServiceRequestDTO dto) {
        try {
            if (dto.getVehicleId() == null) {
                throw new RuntimeException("Vehicle ID is required");
            }

            Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + dto.getVehicleId()));
            
            ServiceRequest serviceRequest = new ServiceRequest();
            serviceRequest.setVehicle(vehicle);
            serviceRequest.setDescription(dto.getDescription());
            serviceRequest.setServiceType(dto.getServiceType());
            serviceRequest.setPriority(dto.getPriority());
            serviceRequest.setPreferredDate(dto.getPreferredDate());
            serviceRequest.setStatus("PENDING");
            
            // Log the service request details
            System.out.println("Creating service request with details:");
            System.out.println("Vehicle ID: " + dto.getVehicleId());
            System.out.println("Description: " + dto.getDescription());
            System.out.println("Service Type: " + dto.getServiceType());
            System.out.println("Priority: " + dto.getPriority());
            System.out.println("Preferred Date: " + dto.getPreferredDate());
            
            ServiceRequest savedRequest = serviceRequestRepository.save(serviceRequest);
            System.out.println("Service request saved with ID: " + savedRequest.getId());
            
            return convertToDTO(savedRequest);
        } catch (Exception e) {
            System.err.println("Error creating service request: " + e.getMessage());
            throw new RuntimeException("Failed to create service request: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getAllServiceRequests() {
        return serviceRequestRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceRequestDTO getServiceRequestById(Long id) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service request not found"));
        return convertToDTO(serviceRequest);
    }

    public List<ServiceRequestDTO> getServiceRequestsByUserId(Long userId) {
        return serviceRequestRepository.findByVehicle_User_Id(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ServiceRequestDTO assignMechanic(Long requestId, Long mechanicId, String notes) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));

        User mechanic = userRepository.findById(mechanicId)
                .orElseThrow(() -> new RuntimeException("Mechanic not found"));

        if (!mechanic.getRole().equals("MECHANIC")) {
            throw new RuntimeException("User is not a mechanic");
        }

        serviceRequest.setMechanic(mechanic);
        serviceRequest.setStatus("ASSIGNED");
        serviceRequest.setMechanicNotes(notes);
        serviceRequest.setAssignedAt(LocalDateTime.now());

        ServiceRequest updatedRequest = serviceRequestRepository.save(serviceRequest);
        return convertToDTO(updatedRequest);
    }

    public ServiceRequestDTO updateServiceRequestStatus(Long requestId, String status, String notes) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));

        serviceRequest.setStatus(status);
        if (notes != null) {
            serviceRequest.setMechanicNotes(notes);
        }

        ServiceRequest updatedRequest = serviceRequestRepository.save(serviceRequest);
        return convertToDTO(updatedRequest);
    }

    private ServiceRequestDTO convertToDTO(ServiceRequest serviceRequest) {
        ServiceRequestDTO dto = new ServiceRequestDTO();
        dto.setId(serviceRequest.getId());
        dto.setDescription(serviceRequest.getDescription());
        dto.setServiceType(serviceRequest.getServiceType());
        dto.setPriority(serviceRequest.getPriority());
        dto.setPreferredDate(serviceRequest.getPreferredDate());
        dto.setCreatedAt(serviceRequest.getCreatedAt());
        dto.setStatus(serviceRequest.getStatus());
        dto.setMechanicNotes(serviceRequest.getMechanicNotes());
        dto.setAssignedAt(serviceRequest.getAssignedAt());

        if (serviceRequest.getVehicle() != null) {
            dto.setVehicleId(serviceRequest.getVehicle().getId());
        }

        if (serviceRequest.getMechanic() != null) {
            dto.setMechanicId(serviceRequest.getMechanic().getId());
            dto.setMechanicName(serviceRequest.getMechanic().getName());
        }

        return dto;
    }
} 