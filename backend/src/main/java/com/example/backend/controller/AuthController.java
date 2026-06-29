package com.example.backend.controller;

import com.example.backend.security.JwtUtil; 

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest req) {
        return JwtUtil.generateToken(req.username);
        //return "dummy-jwt-token";
    }

    public static class LoginRequest {
        public String username;
        public String password;
    }
}