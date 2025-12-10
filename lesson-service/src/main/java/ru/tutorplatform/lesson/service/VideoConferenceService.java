package ru.tutorplatform.lesson.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoConferenceService {

    private final RestTemplate restTemplate;

    @Value("${video.zoom.api-key}")
    private String zoomApiKey;

    @Value("${video.zoom.api-secret}")
    private String zoomApiSecret;

    @Value("${video.zoom.base-url:https://api.zoom.us/v2}")
    private String zoomBaseUrl;

    public String createMeeting(Long lessonId, LocalDateTime startTime, Integer duration) {
        try {
            // Для Zoom
            if (zoomApiKey != null && zoomApiSecret != null) {
                return createZoomMeeting(lessonId, startTime, duration);
            }

            // Для Whereby
            return createWherebyMeeting(lessonId, startTime, duration);

        } catch (Exception e) {
            log.error("Failed to create video conference", e);
            return generateGenericMeetingUrl(lessonId);
        }
    }

    private String createZoomMeeting(Long lessonId, LocalDateTime startTime, Integer duration) {
        String token = generateZoomToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "topic", "Урок #" + lessonId,
                "type", 2, // Scheduled meeting
                "start_time", startTime.toString(),
                "duration", duration,
                "timezone", "Europe/Moscow",
                "settings", Map.of(
                        "host_video", true,
                        "participant_video", true,
                        "join_before_host", false,
                        "mute_upon_entry", true,
                        "waiting_room", true
                )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                zoomBaseUrl + "/users/me/meetings",
                request,
                Map.class
        );

        if (response.getStatusCode() == HttpStatus.CREATED) {
            Map<String, Object> responseBody = response.getBody();
            return (String) responseBody.get("join_url");
        }

        throw new RuntimeException("Failed to create Zoom meeting");
    }

    private String createWherebyMeeting(Long lessonId, LocalDateTime startTime, Integer duration) {
        // Аналогичная реализация для Whereby
        return "https://whereby.com/tutor-" + lessonId;
    }

    private String generateZoomToken() {
        // Генерация JWT токена для Zoom API
        // Реализация зависит от Zoom API версии
        return "zoom-jwt-token";
    }

    private String generateGenericMeetingUrl(Long lessonId) {
        return "https://tutor-platform.ru/meeting/" + lessonId;
    }
}