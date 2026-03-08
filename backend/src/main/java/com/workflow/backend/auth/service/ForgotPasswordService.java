package com.workflow.backend.auth.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workflow.backend.auth.entity.PasswordResetToken;
import com.workflow.backend.auth.repository.PasswordResetTokenRepository;
import com.workflow.backend.shared.service.EmailService;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {

    private final EmailService emailService;
    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void sendResetLink(String email) {
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Delete existing tokens for the user
        tokenRepository.deleteByUser(user);

        // Generate a new token and save it to the database
        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setExpiryTime(LocalDateTime.now().plusMinutes(15));
        resetToken.setUser(user);

        tokenRepository.save(resetToken);

        String resetLink = "http://localhost:4200/reset-password?token=" + token;

        emailService.sendPasswordResetEmail(email, resetLink);
    }
    
    public void resetPassword(String token, String newPassword) {

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token expired");
        }

        User user = resetToken.getUser();
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // delete token after successful reset
        tokenRepository.delete(resetToken);
    }
}
