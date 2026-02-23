package com.workflow.backend.department.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.workflow.backend.department.entity.Department;
import com.workflow.backend.department.repository.DepartmentRepository;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id).orElse(null);
    }

    @Override
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Override
    public Department createDepartment(String name, String description) {
        departmentRepository.findByName(name).ifPresent(existing -> {
            throw new RuntimeException("Department already exists");
        });
        
        Department department = new Department();
        department.setName(name);
        department.setDescription(description);

        return departmentRepository.save(department);
    }
}