package com.workflow.backend.user.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.workflow.backend.user.dto.ChangePasswordRequest;
import com.workflow.backend.user.dto.UserRequest;
import com.workflow.backend.user.dto.UserResponse;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;
import com.workflow.backend.user.utility.PlatformRole;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findByDeletedFalse();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public void deleteUser(Long id, Authentication authentication) {

        User currentUser = getUserByEmail(authentication.getName());
        User targetUser = getUserById(id);

        // Prevent self-deletion
        if (currentUser.getId().equals(targetUser.getId())) {
            throw new RuntimeException("You cannot delete yourself");
        }

        // Optional: Prevent deleting MASTER_ADMIN
        if (targetUser.getRole() == PlatformRole.MASTER_ADMIN) {
            throw new RuntimeException("Cannot delete MASTER_ADMIN");
        }

        targetUser.setDeleted(true);
        userRepository.save(targetUser);
    }

    @Override
    public long countUsers() {
        return userRepository.countByDeletedFalse();
    }

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public UserResponse getCurrentUser(Authentication authentication) {

        User user = getUserByEmail(authentication.getName());
        return new UserResponse(user);
    }

    @Override
    public UserResponse updateProfile(Authentication authentication, UserRequest request) {

        User user = getUserByEmail(authentication.getName());

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        return new UserResponse(userRepository.save(user));
    }

    @Override
    public void changePassword(Authentication authentication, ChangePasswordRequest request) {

        User user = getUserByEmail(authentication.getName());

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Prevent same password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}