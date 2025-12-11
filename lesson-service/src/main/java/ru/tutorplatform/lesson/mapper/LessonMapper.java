package ru.tutorplatform.lesson.mapper;

import org.springframework.stereotype.Component;
import ru.tutorplatform.lesson.dto.LessonDTO;
import ru.tutorplatform.lesson.model.Lesson;

import java.util.List;
import java.util.Objects;

@Component
public class LessonMapper {

    public LessonDTO toDTO(Lesson lesson) {
        if (lesson == null) {
            return null;
        }

        return LessonDTO.builder()
                .id(lesson.getId())
                .studentId(lesson.getStudentId())
                .tutorId(lesson.getTutorId())
                .subjectId(lesson.getSubjectId())
                .scheduledTime(lesson.getScheduledTime())
                .durationMinutes(lesson.getDurationMinutes())
                .price(lesson.getPrice())
                .status(lesson.getStatus())
                .meetingUrl(lesson.getMeetingUrl())
                .createdAt(lesson.getCreatedAt())
                .updatedAt(lesson.getUpdatedAt())
                .completedAt(lesson.getCompletedAt())
                .build();
    }

    public List<LessonDTO> toDTOs(List<Lesson> lessons) {
        return lessons.stream()
                .filter(Objects::nonNull)
                .map(this::toDTO)
                .toList();
    }
}





