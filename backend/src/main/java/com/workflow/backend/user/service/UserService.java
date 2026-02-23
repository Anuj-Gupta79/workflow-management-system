package com.workflow.backend.user.service;

import java.util.List;

import com.workflow.backend.user.entity.User;

public interface UserService {

    public List<User> getAllUsers();

    public User getUserById(Long id);

    public User getUserByEmail(String email);

    public void deleteUser(Long id);

    public long countUsers();

    public User saveUser(User user);
}
