package ru.tutorplatform.lesson.exception;

public class LessonNotFoundException extends RuntimeException {
    public LessonNotFoundException(Long lessonId) {
        super("Lesson with id %d not found".formatted(lessonId));
    }
}

