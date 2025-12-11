package ru.tutorplatform.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import ru.tutorplatform.auth.dto.CreateUserRequest;
import ru.tutorplatform.auth.dto.UserDto;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceClient {

    private final RestTemplate restTemplate;
    private static final String USER_SERVICE_URL = "http://user-service:8081/api/users";

    public Optional<UserDto> getUserByEmail(String email) {
        try {
            String url = USER_SERVICE_URL + "/by-email?email=" + email;
            UserDto user = restTemplate.getForObject(url, UserDto.class);
            return Optional.ofNullable(user);
        } catch (RestClientException e) {
            log.warn("Ошибка при получении пользователя из user-service: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public UserDto createUser(String email, String encodedPassword) {
        try {
            CreateUserRequest request = CreateUserRequest.builder()
                    .email(email)
                    .password(encodedPassword)
                    .role("STUDENT")
                    .build();
            return restTemplate.postForObject(USER_SERVICE_URL, request, UserDto.class);
        } catch (RestClientException e) {
            log.error("Ошибка при создании пользователя: {}", e.getMessage());
            throw new RuntimeException("Ошибка при регистрации пользователя", e);
        }
    }
}