package com.workflow.backend.security;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.workflow.backend.user.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final Key key;
    private final long expirationTime;

    public JwtService(@Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationTime) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationTime = expirationTime;
    }

    public String generateToken(User user) {
        long now = System.currentTimeMillis();
        return io.jsonwebtoken.Jwts.builder()
                .setSubject(user.getEmail())
                .claim("platformRole", user.getRole().name())
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return parse(token).getSubject();
    }

    public Claims parse(String token) {
        return io.jsonwebtoken.Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isValidToken(String token, UserDetails userDetails) {
        try {
            Claims claims = parse(token);
            String email = claims.getSubject();
            return email.equals(userDetails.getUsername()) && claims.getExpiration().after(new java.util.Date());
        } catch (Exception e) {
            return false;
        }
    }

}
