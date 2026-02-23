package com.workflow.backend.department.service;

import java.util.List;

import com.workflow.backend.department.entity.Department;

public interface DepartmentService {
    
    Department createDepartment(String name, String description);

    Department getDepartmentById(Long id);

    List<Department> getAllDepartments();
}
