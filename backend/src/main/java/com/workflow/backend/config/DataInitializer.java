package com.workflow.backend.config;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.workflow.backend.department.entity.Department;
import com.workflow.backend.department.repository.DepartmentRepository;
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

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (departmentRepository.count() == 0) {
            seedDepartments();
        }

        if (userRepository.count() == 0) {
            seedUsers();
        }

        if (taskRepository.count() == 0) {
            seedTasks();
        }

        System.out.println("✅ Development data seeded successfully");
    }

    // =======================
    // 1️⃣ Seed Departments
    // =======================

    private void seedDepartments() {

        departmentRepository.save(createDepartment("Engineering", "Handles product development"));
        departmentRepository.save(createDepartment("HR", "Handles recruitment and policies"));
        departmentRepository.save(createDepartment("Operations", "Handles workflow operations"));
        departmentRepository.save(createDepartment("Finance", "Handles finance & accounts"));

        System.out.println("✅ Departments seeded");
    }

    private Department createDepartment(String name, String description) {
        Department dept = new Department();
        dept.setName(name);
        dept.setDescription(description);
        return dept;
    }

    // =======================
    // 2️⃣ Seed Users
    // =======================

    private void seedUsers() {

        Department engineering = departmentRepository.findByName("Engineering")
                .orElseThrow(() -> new RuntimeException("Engineering department not found"));

        Department hr = departmentRepository.findByName("HR")
                .orElseThrow(() -> new RuntimeException("HR department not found"));

        Department operations = departmentRepository.findByName("Operations")
                .orElseThrow(() -> new RuntimeException("Operations department not found"));

        // Admin
        userRepository.save(User.builder()
                .name("Admin User")
                .email("admin@example.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .department(engineering)
                .build());

        // Managers
        userRepository.save(User.builder()
                .name("Engineering Manager")
                .email("eng.manager@example.com")
                .password(passwordEncoder.encode("manager123"))
                .role(Role.MANAGER)
                .department(engineering)
                .build());

        userRepository.save(User.builder()
                .name("HR Manager")
                .email("hr.manager@example.com")
                .password(passwordEncoder.encode("manager123"))
                .role(Role.MANAGER)
                .department(hr)
                .build());

        // Employees
        userRepository.save(User.builder()
                .name("Dev Employee 1")
                .email("dev1@example.com")
                .password(passwordEncoder.encode("employee123"))
                .role(Role.EMPLOYEE)
                .department(engineering)
                .build());

        userRepository.save(User.builder()
                .name("Dev Employee 2")
                .email("dev2@example.com")
                .password(passwordEncoder.encode("employee123"))
                .role(Role.EMPLOYEE)
                .department(engineering)
                .build());

        userRepository.save(User.builder()
                .name("HR Executive")
                .email("hr1@example.com")
                .password(passwordEncoder.encode("employee123"))
                .role(Role.EMPLOYEE)
                .department(hr)
                .build());

        userRepository.save(User.builder()
                .name("Operations Executive")
                .email("ops1@example.com")
                .password(passwordEncoder.encode("employee123"))
                .role(Role.EMPLOYEE)
                .department(operations)
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
                    .department(creator.getDepartment()) // ✅ FIXED (important)
                    .dueDate(LocalDateTime.now().plusDays(7)) // ✅ If nullable = false
                    .deleted(false)
                    .build());
        }

        System.out.println("✅ Tasks seeded");
    }
}