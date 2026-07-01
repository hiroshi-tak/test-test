package com.example.backend.controller;


import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.CustomUserDetailsService;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.security.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        @Value("${app.cookie.secure}")
        private boolean cookieSecure;

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final CustomUserDetailsService userDetailsService;

        public AuthController(
                UserRepository userRepository,
                PasswordEncoder passwordEncoder,
                CustomUserDetailsService userDetailsService
        ) {
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.userDetailsService = userDetailsService;
        }

        // 登録
        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

                if (userRepository.findByUsername(request.username()).isPresent()) {
                return ResponseEntity
                        .badRequest()
                        .body("ユーザーは既に存在します");
                }

                User user = new User();
                user.setUsername(request.username());
                user.setPassword(passwordEncoder.encode(request.password()));

                userRepository.save(user);

                return ResponseEntity.ok("登録完了");
        }

        @PostMapping("/login")
        public ResponseEntity<String> login(@RequestBody LoginRequest req,
                                                HttpServletResponse response) {

                UserDetails user = userDetailsService.loadUserByUsername(req.getUsername());

                if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
                        return ResponseEntity.status(401).body("ログイン失敗");
                }

                String username = user.getUsername();

                String accessToken = JwtUtil.generateToken(username);
                String refreshToken = JwtUtil.generateRefreshToken(username);

                ResponseCookie accessCookie = ResponseCookie.from("token", accessToken)
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .path("/")
                        .maxAge(60 * 15)
                        .sameSite("Lax")
                        .build();

                ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .path("/")
                        .maxAge(60 * 60 * 24 * 7)
                        .sameSite("Lax")
                        .build();

                response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
                response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

                return ResponseEntity.ok("ok");
        }

        public static class LoginRequest {
                private String username;
                private String password;

                public String getUsername() { return username; }
                public void setUsername(String username) { this.username = username; }

                public String getPassword() { return password; }
                public void setPassword(String password) { this.password = password; }
        }

        @PostMapping("/logout")
        public ResponseEntity<Void> logout(HttpServletResponse response) {

                ResponseCookie accessCookie = ResponseCookie.from("token", "")
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .path("/")
                        .sameSite("Lax")
                        .maxAge(0)
                        .build();

                ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", "")
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .path("/")
                        .sameSite("Lax")
                        .maxAge(0)
                        .build();

                response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
                response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

                return ResponseEntity.ok().build();
        }

        @PostMapping("/refresh")
        public ResponseEntity<?> refresh(@CookieValue("refresh_token") String refreshToken) {

                String username = JwtUtil.validateAndGetUsername(refreshToken);

                String newAccessToken = JwtUtil.generateToken(username);

                ResponseCookie cookie = ResponseCookie.from("token", newAccessToken)
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .path("/")
                        .sameSite("Lax")
                        .maxAge(60 * 15)
                        .build();

                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, cookie.toString())
                        .body("refreshed");
        }

        @GetMapping("/me")
        public ResponseEntity<?> me(Authentication auth) {

                if (auth == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("loggedIn", false));
                }

                return ResponseEntity.ok(
                        Map.of(
                                "loggedIn", true,
                                "username", auth.getName()
                        )
                );
        }

}

