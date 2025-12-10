package ru.tutorplatform.lesson.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDTO {
    private Long id;
    private Long studentId;
    private Long tutorId;
    private Long subjectId;
    private LocalDateTime scheduledTime;
    private Integer durationMinutes;
    private BigDecimal price;
    private String status;
    private String meetingUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}

