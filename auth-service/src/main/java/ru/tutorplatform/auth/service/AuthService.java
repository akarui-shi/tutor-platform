package ru.tutorplatform.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.tutorplatform.auth.dto.AuthResponse;
import ru.tutorplatform.auth.dto.LoginRequest;
import ru.tutorplatform.auth.exception.AuthenticationException;
import ru.tutorplatform.auth.exception.UserAlreadyExistsException;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserServiceClient userServiceClient;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Попытка входа для пользователя: {}", request.getEmail());

        // Получаем пользователя из user-service
        Optional<UserDto> userOptional = userServiceClient.getUserByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            log.warn("Пользователь не найден: {}", request.getEmail());
            throw new AuthenticationException("Неверные учетные данные");
        }

        UserDto user = userOptional.get();

        // Проверяем пароль
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Неверный пароль для пользователя: {}", request.getEmail());
            throw new AuthenticationException("Неверные учетные данные");
        }

        // Генерируем JWT токен
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        log.info("Успешный вход для пользователя: {}", request.getEmail());

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .token(token)
                .role(user.getRole())
                .expiresIn(jwtExpiration / 1000) // в секундах
                .build();
    }

    @Transactional
    public AuthResponse register(LoginRequest request) {
        log.info("Попытка регистрации для пользователя: {}", request.getEmail());

        // Проверяем существование пользователя
        Optional<UserDto> existingUser = userServiceClient.getUserByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            log.warn("Пользователь уже существует: {}", request.getEmail());
            throw new UserAlreadyExistsException("Пользователь с таким email уже существует");
        }

        // Создаем нового пользователя через user-service
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        UserDto newUser = userServiceClient.createUser(request.getEmail(), encodedPassword);

        // Генерируем JWT токен
        String token = jwtTokenProvider.generateToken(newUser.getId(), newUser.getEmail(), newUser.getRole());

        log.info("Успешная регистрация пользователя: {}", request.getEmail());

        return AuthResponse.builder()
                .userId(newUser.getId())
                .email(newUser.getEmail())
                .token(token)
                .role(newUser.getRole())
                .expiresIn(jwtExpiration / 1000)
                .build();
    }

    public boolean validateToken(String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            return jwtTokenProvider.validateToken(token);
        } catch (Exception e) {
            log.warn("Ошибка валидации токена: {}", e.getMessage());
            return false;
        }
    }
}