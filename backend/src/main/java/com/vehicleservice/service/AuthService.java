package com.vehicleservice.service;

import com.vehicleservice.dto.AuthResponse;
import com.vehicleservice.dto.LoginRequest;
import com.vehicleservice.dto.RegisterRequest;
import com.vehicleservice.model.User;
import com.vehicleservice.model.Vehicle;
import com.vehicleservice.repository.UserRepository;
import com.vehicleservice.repository.VehicleRepository;
import com.vehicleservice.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        logger.debug("Attempting to register user with email: {}", request.getEmail());
        
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            logger.warn("Registration failed: Email {} already exists", request.getEmail());
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone() != null ? request.getPhone() : "");
        user.setVehicleDetails(request.getVehicleDetails() != null ? request.getVehicleDetails() : "");
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Set role from request, default to "USER" if not provided
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            user.setRole(request.getRole().toUpperCase());
        } else {
        user.setRole("USER");
        }
        
        user.setAddress(request.getAddress() != null ? request.getAddress() : "");

        // Save user
        User savedUser = userRepository.save(user);
        logger.debug("User registered successfully with email: {} and role: {}", savedUser.getEmail(), savedUser.getRole());

        // Create vehicle for the user
        Vehicle vehicle = new Vehicle();
        vehicle.setUser(savedUser);
        vehicle.setMake("Toyota"); // Default make
        vehicle.setModel("Camry"); // Default model
        vehicle.setYear(2020); // Default year
        vehicle.setLicensePlate("TEMP" + savedUser.getId()); // Temporary license plate
        vehicle.setCreatedAt(LocalDateTime.now());
        vehicleRepository.save(vehicle);
        logger.debug("Vehicle created for user with email: {}", savedUser.getEmail());

        // Generate token
        String token = jwtTokenProvider.generateToken(savedUser);

        return new AuthResponse(savedUser, token);
    }

    public AuthResponse login(LoginRequest request) {
        logger.debug("Attempting to login user with email: {}", request.getEmail());
        
        try {
            // Get user first to check role
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    logger.warn("Login failed: User not found with email: {}", request.getEmail());
                    return new RuntimeException("User not found");
                });

            // Authenticate user first
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            logger.debug("User authenticated successfully: {}", request.getEmail());

            // Generate token
            String token = jwtTokenProvider.generateToken(user);

            return new AuthResponse(user, token);
        } catch (BadCredentialsException e) {
            logger.warn("Login failed: Invalid credentials for user: {}", request.getEmail());
            throw new RuntimeException("Invalid credentials");
        } catch (Exception e) {
            logger.error("Login failed: Unexpected error for user: {}", request.getEmail(), e);
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    public void logout() {
        SecurityContextHolder.clearContext();
        logger.debug("User logged out successfully");
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("getCurrentUser failed: User not authenticated");
            throw new RuntimeException("User not authenticated");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> {
                logger.warn("getCurrentUser failed: User not found with email: {}", email);
                return new RuntimeException("User not found");
            });
    }

    public AuthResponse refreshToken() {
        User user = getCurrentUser();
        String token = jwtTokenProvider.generateToken(user);
        logger.debug("Token refreshed for user: {}", user.getEmail());
        return new AuthResponse(user, token);
    }
} 