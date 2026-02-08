package com.workflow.backend.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.workflow.backend.task.Task;
import com.workflow.backend.task.TaskRepository;
import com.workflow.backend.task.TaskStatus;
import com.workflow.backend.user.Role;
import com.workflow.backend.user.User;
import com.workflow.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

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

        List<User> manager = userRepository.findByRole(Role.MANAGER);
        List<User> employee = userRepository.findByRole(Role.EMPLOYEE);
        
        if(taskRepository.count() > 0) {
            System.out.println("✅ Demo tasks already exist, skipping seeding demo tasks");
            return;
        }

        for (TaskStatus status : TaskStatus.values()) {
            taskRepository.save(Task.builder()
                    .title("Demo Task - " + status)
                    .description("This is a demo task with status " + status)
                    .status(status)
                    .createdBy(employee.get(0))
                    .assignedTo(manager.get(0))
                    .build());
        }

        System.out.println("✅ Demo tasks seeded");

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
