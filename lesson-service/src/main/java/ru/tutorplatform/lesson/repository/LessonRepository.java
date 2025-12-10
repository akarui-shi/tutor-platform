package ru.tutorplatform.lesson.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.tutorplatform.lesson.model.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
}


