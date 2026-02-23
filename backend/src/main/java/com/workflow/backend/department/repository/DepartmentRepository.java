package com.workflow.backend.department.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workflow.backend.department.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    Optional<Department> findByName(String name);
}
