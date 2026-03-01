package com.workflow.backend.config;

import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.workflow.backend.task.entity.Task;
import com.workflow.backend.task.repository.TaskRepository;
import com.workflow.backend.task.utility.TaskPriority;
import com.workflow.backend.task.utility.TaskStatus;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            seedUsers();
        }

        if (taskRepository.count() == 0) {
            seedTasks();
        }

        System.out.println("✅ Development data seeded successfully");
    }

    // =======================
    // 2️⃣ Seed Users
    // =======================

    private void seedUsers() {
        // Admin
        userRepository.save(User.builder()
                .name("Admin User")
                .email("admin@example.com")
                .password(passwordEncoder.encode("admin123"))
                .build());

        // Managers
        userRepository.save(User.builder()
                .name("Engineering Manager")
                .email("eng.manager@example.com")
                .password(passwordEncoder.encode("manager123"))
                .build());

        userRepository.save(User.builder()
                .name("HR Manager")
                .email("hr.manager@example.com")
                .password(passwordEncoder.encode("manager123"))
                .build());

        // Employees
        userRepository.save(User.builder()
                .name("Dev Employee 1")
                .email("dev1@example.com")
                .password(passwordEncoder.encode("employee123"))
                .build());

        userRepository.save(User.builder()
                .name("Dev Employee 2")
                .email("dev2@example.com")
                .password(passwordEncoder.encode("employee123"))
                .build());

        userRepository.save(User.builder()
                .name("HR Executive")
                .email("hr1@example.com")
                .password(passwordEncoder.encode("employee123"))
                .build());

        userRepository.save(User.builder()
                .name("Operations Executive")
                .email("ops1@example.com")
                .password(passwordEncoder.encode("employee123"))
                .build());

        System.out.println("✅ Users seeded");
    }

    // =======================
    // 3️⃣ Seed Tasks
    // =======================

    private void seedTasks() {
        TaskStatus[] statuses = TaskStatus.values();
        TaskPriority[] priorities = TaskPriority.values();


        for (int i = 0; i < statuses.length; i++) {

            taskRepository.save(Task.builder()
                    .title("Sample Task - " + statuses[i])
                    .description("This is a " + statuses[i] + " task for testing workflow")
                    .status(statuses[i])
                    .priority(priorities[i % priorities.length])
                    .dueDate(LocalDateTime.now().plusDays(7)) // ✅ If nullable = false
                    .deleted(false)
                    .build());
        }

        System.out.println("✅ Tasks seeded");
    }
}