package com.vehicleservice.repository;

import com.vehicleservice.model.Vehicle;
import com.vehicleservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByUser(User user);
    boolean existsByLicensePlate(String licensePlate);
    List<Vehicle> findByUser_Id(Long userId);
    List<Vehicle> findByMake(String make);
    List<Vehicle> findByModel(String model);
    List<Vehicle> findByYear(Integer year);
    List<Vehicle> findByLicensePlate(String licensePlate);
} 