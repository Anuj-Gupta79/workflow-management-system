package com.workflow.backend.config;

import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.workflow.backend.organization.entity.Organization;
import com.workflow.backend.organization.entity.OrganizationMember;
import com.workflow.backend.organization.repository.OrganizationMemberRepository;
import com.workflow.backend.organization.repository.OrganizationRepository;
import com.workflow.backend.organization.utility.OrganizationRole;
import com.workflow.backend.task.entity.Task;
import com.workflow.backend.task.repository.TaskRepository;
import com.workflow.backend.task.utility.TaskPriority;
import com.workflow.backend.task.utility.TaskStatus;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;
import com.workflow.backend.user.utility.PlatformRole;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final OrganizationRepository organizationRepository;
        private final OrganizationMemberRepository organizationMemberRepository;
        private final TaskRepository taskRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {

                if (userRepository.count() > 0)
                        return;

                // ======================
                // 1️⃣ Create Users
                // ======================

                userRepository.save(User.builder()
                                .name("Master Admin")
                                .email("master@workflow.com")
                                .password(passwordEncoder.encode("admin123"))
                                .role(PlatformRole.MASTER_ADMIN)
                                .build());

                User owner = userRepository.save(User.builder()
                                .name("Org Owner")
                                .email("owner@workflow.com")
                                .password(passwordEncoder.encode("password"))
                                .role(PlatformRole.USER)
                                .build());

                User manager = userRepository.save(User.builder()
                                .name("Engineering Manager")
                                .email("manager@workflow.com")
                                .password(passwordEncoder.encode("password"))
                                .role(PlatformRole.USER)
                                .build());

                User employee1 = userRepository.save(User.builder()
                                .name("Developer One")
                                .email("dev1@workflow.com")
                                .password(passwordEncoder.encode("password"))
                                .role(PlatformRole.USER)
                                .build());

                User employee2 = userRepository.save(User.builder()
                                .name("Developer Two")
                                .email("dev2@workflow.com")
                                .password(passwordEncoder.encode("password"))
                                .role(PlatformRole.USER)
                                .build());

                // ======================
                // 2️⃣ Create Organization
                // ======================

                Organization organization = organizationRepository.save(
                                Organization.builder()
                                                .name("Tech Corp")
                                                .owner(owner)
                                                .build());

                // ======================
                // 3️⃣ Add Members
                // ======================

                organizationMemberRepository.save(
                                OrganizationMember.builder()
                                                .organization(organization)
                                                .user(owner)
                                                .role(OrganizationRole.OWNER)
                                                .build());

                organizationMemberRepository.save(
                                OrganizationMember.builder()
                                                .organization(organization)
                                                .user(manager)
                                                .role(OrganizationRole.MANAGER)
                                                .build());

                organizationMemberRepository.save(
                                OrganizationMember.builder()
                                                .organization(organization)
                                                .user(employee1)
                                                .role(OrganizationRole.EMPLOYEE)
                                                .build());

                organizationMemberRepository.save(
                                OrganizationMember.builder()
                                                .organization(organization)
                                                .user(employee2)
                                                .role(OrganizationRole.EMPLOYEE)
                                                .build());

                // ======================
                // 4️⃣ Create Tasks
                // ======================

                taskRepository.save(Task.builder()
                                .title("Setup Project Architecture")
                                .description("Design base project structure")
                                .organization(organization)
                                .createdBy(manager)
                                .assignedTo(employee1)
                                .status(TaskStatus.TO_DO)
                                .priority(TaskPriority.HIGH)
                                .dueDate(LocalDateTime.now().plusDays(5))
                                .build());

                taskRepository.save(Task.builder()
                                .title("Implement Authentication")
                                .description("Add JWT + security filters")
                                .organization(organization)
                                .createdBy(manager)
                                .assignedTo(employee2)
                                .status(TaskStatus.IN_PROGRESS)
                                .priority(TaskPriority.MEDIUM)
                                .dueDate(LocalDateTime.now().plusDays(7))
                                .build());

                System.out.println("✅ Development data seeded successfully");
        }
}