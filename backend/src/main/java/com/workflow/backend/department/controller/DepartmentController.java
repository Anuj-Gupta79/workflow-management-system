package com.workflow.backend.department.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workflow.backend.department.entity.Department;
import com.workflow.backend.department.service.DepartmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Department createDepartment(@RequestParam String name, @RequestParam String description) {
        return departmentService.createDepartment(name, description);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Department> getAllDepartments() {
        return departmentService.getAllDepartments();
    }
}
