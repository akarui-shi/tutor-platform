package ru.tutorplatform.lesson.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
public class CreateLessonRequest {

    @NotNull
    private Long studentId;

    @NotNull
    private Long tutorId;

    @NotNull
    private Long subjectId;

    @NotNull
//    @Future
    private LocalDateTime scheduledTime;

    @NotNull
    @Min(15)
    private Integer durationMinutes;

    @NotNull
    @Min(0)
    private BigDecimal price;

}

