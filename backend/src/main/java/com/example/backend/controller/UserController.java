package com.example.backend.controller;

import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping
    public String me(Authentication authentication) {
        return "hello " + authentication.getName();
    }
}