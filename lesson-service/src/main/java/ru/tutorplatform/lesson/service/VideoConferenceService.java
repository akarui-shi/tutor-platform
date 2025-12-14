package ru.tutorplatform.lesson.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoConferenceService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${video.zoom.account-id}")
    private String zoomAccountId;

    @Value("${video.zoom.client-id}")
    private String zoomClientId;

    @Value("${video.zoom.client-secret}")
    private String zoomClientSecret;

    @Value("${video.zoom.base-url:https://api.zoom.us/v2}")
    private String zoomBaseUrl;

    @Value("${video.zoom.oauth-url:https://zoom.us/oauth/token}")
    private String zoomOAuthUrl;

    private String cachedAccessToken;
    private long tokenExpirationTime;

    public String createMeeting(Long lessonId, LocalDateTime startTime, Integer duration) {
        try {
            // Проверяем, настроен ли Zoom
            if (zoomAccountId != null && !zoomAccountId.isEmpty() &&
                    zoomClientId != null && !zoomClientId.isEmpty()) {
                return createZoomMeeting(lessonId, startTime, duration);
            }

            log.warn("Zoom не настроен, используется заглушка");
            return generateGenericMeetingUrl(lessonId);

        } catch (Exception e) {
            log.error("Не удалось создать видеоконференцию для урока {}", lessonId, e);
            return generateGenericMeetingUrl(lessonId);
        }
    }

    private String createZoomMeeting(Long lessonId, LocalDateTime startTime, Integer duration) {
        try {
            String accessToken = getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Форматируем время для Zoom API (ISO 8601)
            String formattedStartTime = startTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("topic", "Урок #" + lessonId);
            requestBody.put("type", 2); // Запланированная встреча
            requestBody.put("start_time", formattedStartTime);
            requestBody.put("duration", duration);
            requestBody.put("timezone", "Europe/Moscow");

            Map<String, Object> settings = new HashMap<>();
            settings.put("host_video", true);
            settings.put("participant_video", true);
            settings.put("join_before_host", false);
            settings.put("mute_upon_entry", true);
            settings.put("waiting_room", true);
            settings.put("auto_recording", "none");
            requestBody.put("settings", settings);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            log.info("Создание Zoom встречи для урока {}", lessonId);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    zoomBaseUrl + "/users/me/meetings",
                    request,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                String joinUrl = (String) responseBody.get("join_url");
                log.info("Zoom встреча создана успешно: {}", joinUrl);
                return joinUrl;
            }

            throw new RuntimeException("Не удалось создать Zoom встречу");

        } catch (Exception e) {
            log.error("Ошибка при создании Zoom встречи", e);
            throw new RuntimeException("Ошибка создания Zoom встречи: " + e.getMessage(), e);
        }
    }

    private String getAccessToken() {
        // Проверяем кэшированный токен
        if (cachedAccessToken != null && System.currentTimeMillis() < tokenExpirationTime) {
            return cachedAccessToken;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            // Базовая аутентификация
            String auth = zoomClientId + ":" + zoomClientSecret;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            headers.set("Authorization", "Basic " + encodedAuth);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "account_credentials");
            body.add("account_id", zoomAccountId);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            log.info("Получение Zoom access token");

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    zoomOAuthUrl,
                    request,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                cachedAccessToken = (String) responseBody.get("access_token");
                Integer expiresIn = (Integer) responseBody.get("expires_in");

                // Кэшируем токен на 90% от времени жизни
                tokenExpirationTime = System.currentTimeMillis() + (expiresIn * 900L);

                log.info("Zoom access token получен успешно");
                return cachedAccessToken;
            }

            throw new RuntimeException("Не удалось получить access token");

        } catch (Exception e) {
            log.error("Ошибка при получении Zoom access token", e);
            throw new RuntimeException("Ошибка получения Zoom токена: " + e.getMessage(), e);
        }
    }

    private String generateGenericMeetingUrl(Long lessonId) {
        // Заглушка для тестирования без настроенного Zoom
        return "https://meet.jit.si/tutor-lesson-" + lessonId;
    }
}
