package com.workflow.backend.config;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.workflow.backend.task.entity.Task;
import com.workflow.backend.task.repository.TaskRepository;
import com.workflow.backend.task.utility.TaskPriority;
import com.workflow.backend.task.utility.TaskStatus;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;
import com.workflow.backend.user.utility.Role;

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
                .role(Role.ADMIN)
                .build());

        // Managers
        userRepository.save(User.builder()
                .name("Engineering Manager")
                .email("eng.manager@example.com")
                .password(passwordEncoder.encode("manager123"))
                .role(Role.MANAGER)
                .build());

        userRepository.save(User.builder()
                .name("HR Manager")
                .email("hr.manager@example.com")
                .password(passwordEncoder.encode("manager123"))
                .role(Role.MANAGER)
                .build());

        // Employees
        userRepository.save(User.builder()
                .name("Dev Employee 1")
                .email("dev1@example.com")
                .password(passwordEncoder.encode("employee123"))
                .role(Role.EMPLOYEE)
                .build());

        userRepository.save(User.builder()
                .name("Dev Employee 2")
                .email("dev2@example.com")
                .password(passwordEncoder.encode("employee123"))
                .role(Role.EMPLOYEE)
                .build());

        userRepository.save(User.builder()
                .name("HR Executive")
                .email("hr1@example.com")
                .password(passwordEncoder.encode("employee123"))
                .role(Role.EMPLOYEE)
                .build());

        userRepository.save(User.builder()
                .name("Operations Executive")
                .email("ops1@example.com")
                .password(passwordEncoder.encode("employee123"))
                .role(Role.EMPLOYEE)
                .build());

        System.out.println("✅ Users seeded");
    }

    // =======================
    // 3️⃣ Seed Tasks
    // =======================

    private void seedTasks() {

        List<User> managers = userRepository.findByRole(Role.MANAGER);
        List<User> employees = userRepository.findByRole(Role.EMPLOYEE);

        if (managers.isEmpty() || employees.isEmpty()) {
            System.out.println("⚠ Cannot seed tasks — Users missing");
            return;
        }

        TaskStatus[] statuses = TaskStatus.values();
        TaskPriority[] priorities = TaskPriority.values();

        User creator = employees.get(0);
        User assignee = managers.get(0);

        for (int i = 0; i < statuses.length; i++) {

            taskRepository.save(Task.builder()
                    .title("Sample Task - " + statuses[i])
                    .description("This is a " + statuses[i] + " task for testing workflow")
                    .status(statuses[i])
                    .priority(priorities[i % priorities.length])
                    .createdBy(creator)
                    .assignedTo(assignee)
                    .dueDate(LocalDateTime.now().plusDays(7)) // ✅ If nullable = false
                    .deleted(false)
                    .build());
        }

        System.out.println("✅ Tasks seeded");
    }
}