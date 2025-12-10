package ru.tutorplatform.lesson.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.tutorplatform.common.dto.ApiResponse;
import ru.tutorplatform.lesson.dto.CreateLessonRequest;
import ru.tutorplatform.lesson.dto.LessonDTO;
import ru.tutorplatform.lesson.dto.UpdateLessonRequest;
import ru.tutorplatform.lesson.service.LessonService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@Tag(name = "Уроки", description = "API для управления уроками")
public class LessonController {

    private final LessonService lessonService;

    @PostMapping
    @Operation(summary = "Создать новый урок")
    public ResponseEntity<ApiResponse<LessonDTO>> createLesson(
            @Valid @RequestBody CreateLessonRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        LessonDTO lesson = lessonService.createLesson(request, userId);
        return ResponseEntity.ok(ApiResponse.success(lesson));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить урок по ID")
    public ResponseEntity<ApiResponse<LessonDTO>> getLesson(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        LessonDTO lesson = lessonService.getLesson(id, userId);
        return ResponseEntity.ok(ApiResponse.success(lesson));
    }

    @GetMapping
    @Operation(summary = "Получить уроки по фильтрам")
    public ResponseEntity<ApiResponse<List<LessonDTO>>> getLessons(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long tutorId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role) {

        List<LessonDTO> lessons = lessonService.getLessons(
                studentId, tutorId, status, date, userId, role);
        return ResponseEntity.ok(ApiResponse.success(lessons));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить урок")
    public ResponseEntity<ApiResponse<LessonDTO>> updateLesson(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLessonRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        LessonDTO lesson = lessonService.updateLesson(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(lesson));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Завершить урок")
    public ResponseEntity<ApiResponse<LessonDTO>> completeLesson(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        LessonDTO lesson = lessonService.completeLesson(id, userId);
        return ResponseEntity.ok(ApiResponse.success(lesson));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Отменить урок")
    public ResponseEntity<ApiResponse<LessonDTO>> cancelLesson(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @RequestHeader("X-User-Id") Long userId) {
        LessonDTO lesson = lessonService.cancelLesson(id, reason, userId);
        return ResponseEntity.ok(ApiResponse.success(lesson));
    }

    @GetMapping("/{id}/join-url")
    @Operation(summary = "Получить ссылку для подключения к уроку")
    public ResponseEntity<ApiResponse<String>> getJoinUrl(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        String joinUrl = lessonService.generateJoinUrl(id, userId);
        return ResponseEntity.ok(ApiResponse.success(joinUrl));
    }
}