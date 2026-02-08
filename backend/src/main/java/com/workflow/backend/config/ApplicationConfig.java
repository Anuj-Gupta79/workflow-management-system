package com.workflow.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.workflow.backend.auth.UserDetailServiceImpl;

@Configuration
public class ApplicationConfig {

    @Bean
    AuthenticationProvider authenticationProvider(UserDetailServiceImpl userDetailServiceImpl,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailServiceImpl);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

}
