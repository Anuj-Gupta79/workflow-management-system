package com.workflow.backend.Config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.workflow.backend.user.Role;
import com.workflow.backend.user.User;
import com.workflow.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {

        if (!userRepository.existsByRole(Role.ADMIN)) {
            createAdmin();
        }

        if (!userRepository.existsByRole(Role.MANAGER)) {
            createManager();
        }

        if (!userRepository.existsByRole(Role.EMPLOYEE)) {
            createEmployee();
        }

        System.out.println("✅ Default users seeded");

    }
    
    void createAdmin() {
        // Create default admin user
        User admin = User.builder()
                .name("Admin User")
                .email("admin@example.com")
                .password("admin123")
                .role(Role.ADMIN)
                .build();

        userRepository.save(admin);
    }

    void createManager() {
        // create default manager user
        User manager = User.builder()
                .name("Manager User")
                .email("manager@example.com")
                .password("manager123")
                .role(Role.MANAGER)
                .build();

        userRepository.save(manager);
    }

    void createEmployee() {
        // create default employee user
        User employee = User.builder()
                .name("Employee User")
                .email("employee@example.com")
                .password("employee123")
                .role(Role.EMPLOYEE)
                .build();

        userRepository.save(employee);
    }
}
