package com.workflow.backend.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.workflow.backend.auth.dto.AuthResponse;
import com.workflow.backend.auth.dto.LoginRequest;
import com.workflow.backend.auth.dto.RegisterRequest;
import com.workflow.backend.department.entity.Department;
import com.workflow.backend.department.repository.DepartmentRepository;
import com.workflow.backend.security.JwtService;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;
import com.workflow.backend.user.utility.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final DepartmentRepository departmentRepository;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        Department defaultDepartment = departmentRepository
                .findByName("Engineering")
                .orElseThrow(() -> new RuntimeException("Default department not found"));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.EMPLOYEE)
                .department(defaultDepartment)
                .deleted(false)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (user.isDeleted()) {
            throw new IllegalStateException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

}
