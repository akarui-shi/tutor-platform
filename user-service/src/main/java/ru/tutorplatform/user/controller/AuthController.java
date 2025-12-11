package ru.tutorplatform.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.tutorplatform.common.dto.ApiResponse;
import ru.tutorplatform.user.dto.LoginRequest;
import ru.tutorplatform.user.dto.LoginResponse;
import ru.tutorplatform.user.dto.RefreshTokenRequest;
import ru.tutorplatform.user.dto.UserDto;
import ru.tutorplatform.user.service.AuthService;
import ru.tutorplatform.user.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "UNAUTHORIZED"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            LoginResponse response = authService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "UNAUTHORIZED"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401)
                        .body(ApiResponse.error("Missing or invalid authorization header", "UNAUTHORIZED"));
            }

            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401)
                        .body(ApiResponse.error("Invalid or expired token", "UNAUTHORIZED"));
            }

            String email = jwtUtil.extractEmail(token);
            UserDto user = authService.getCurrentUser(email);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "UNAUTHORIZED"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        // В случае с JWT токенами, logout обычно обрабатывается на клиенте
        // путем удаления токена из хранилища
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}


