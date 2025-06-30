package com.vehicleservice.dto;

public class RegisterRequest {
    private String name;
    private String email;
    private String phone;
    private String vehicleDetails;
    private String password;
    private String address;
    private String role;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getVehicleDetails() {
        return vehicleDetails;
    }

    public void setVehicleDetails(String vehicleDetails) {
        this.vehicleDetails = vehicleDetails;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    // Constructor
    public RegisterRequest() {
    }

    public RegisterRequest(String name, String email, String phone, String vehicleDetails, String password, String address, String role) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.vehicleDetails = vehicleDetails;
        this.password = password;
        this.address = address;
        this.role = role;
    }
} 