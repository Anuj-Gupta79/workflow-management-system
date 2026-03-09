package com.workflow.backend.user.service;

import java.util.List;

import org.springframework.security.core.Authentication;

import com.workflow.backend.user.dto.ChangePasswordRequest;
import com.workflow.backend.user.dto.UserRequest;
import com.workflow.backend.user.dto.UserResponse;
import com.workflow.backend.user.entity.User;

public interface UserService {

    List<User> getAllUsers();

    User getUserById(Long id);

    User getUserByEmail(String email);

    void deleteUser(Long id, Authentication authentication);

    long countUsers();

    User saveUser(User user);

    UserResponse getCurrentUser(Authentication authentication);

    UserResponse updateProfile(Authentication authentication, UserRequest request);

    void changePassword(Authentication authentication, ChangePasswordRequest request);
}
