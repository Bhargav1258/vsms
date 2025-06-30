package com.vehicleservice.controller;

import com.vehicleservice.model.User;
import com.vehicleservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getUsersByRole(@RequestParam(required = false) String role) {
        if (role != null) {
            return ResponseEntity.ok(userRepository.findByRole(role.toUpperCase()));
        } else {
            return ResponseEntity.ok(userRepository.findAll());
        }
    }
} 