package ru.tutorplatform.lesson.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.tutorplatform.common.constants.Constants;
import ru.tutorplatform.common.event.NotificationEvent;
import ru.tutorplatform.common.event.PaymentEvent;
import ru.tutorplatform.lesson.dto.CreateLessonRequest;
import ru.tutorplatform.lesson.dto.LessonDTO;
import ru.tutorplatform.lesson.dto.UpdateLessonRequest;
import ru.tutorplatform.lesson.exception.LessonNotFoundException;
import ru.tutorplatform.lesson.exception.UnauthorizedAccessException;
import ru.tutorplatform.lesson.mapper.LessonMapper;
import ru.tutorplatform.lesson.model.Lesson;
import ru.tutorplatform.lesson.repository.LessonRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonService {

    private final LessonRepository lessonRepository;
    private final LessonMapper lessonMapper;
    private final RabbitTemplate rabbitTemplate;
    private final VideoConferenceService videoConferenceService;

    @Value("${app.timezone:Europe/Moscow}")
    private String timezone;

    @Transactional
    public LessonDTO createLesson(CreateLessonRequest request, Long userId) {
        validateLessonTime(request.getScheduledTime());

        Lesson lesson = Lesson.builder()
                .studentId(request.getStudentId())
                .tutorId(request.getTutorId())
                .subjectId(request.getSubjectId())
                .scheduledTime(request.getScheduledTime())
                .durationMinutes(request.getDurationMinutes())
                .price(request.getPrice())
                .status(Constants.LessonStatus.SCHEDULED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        lesson = lessonRepository.save(lesson);

        String meetingUrl = videoConferenceService.createMeeting(
                lesson.getId(),
                lesson.getScheduledTime(),
                lesson.getDurationMinutes()
        );
        lesson.setMeetingUrl(meetingUrl);
        lesson = lessonRepository.save(lesson);

        sendNotification("LESSON_CREATED", lesson);

        return lessonMapper.toDTO(lesson);
    }

    @Transactional(readOnly = true)
    public LessonDTO getLesson(Long id, Long userId) {
        Lesson lesson = findLessonWithAuthorization(id, userId);
        return lessonMapper.toDTO(lesson);
    }

    @Transactional(readOnly = true)
    public List<LessonDTO> getLessons(Long studentId,
                                      Long tutorId,
                                      String status,
                                      LocalDate date,
                                      Long userId,
                                      String role) {
        List<Lesson> lessons = lessonRepository.findAll();

        return lessons.stream()
                .filter(lesson -> studentId == null || Objects.equals(lesson.getStudentId(), studentId))
                .filter(lesson -> tutorId == null || Objects.equals(lesson.getTutorId(), tutorId))
                .filter(lesson -> status == null || Objects.equals(lesson.getStatus(), status))
                .filter(lesson -> date == null || (lesson.getScheduledTime() != null &&
                        lesson.getScheduledTime().toLocalDate().isEqual(date)))
                // простая проверка доступа: если не ADMIN, то возвращаем только свои уроки
                .filter(lesson -> "ADMIN".equalsIgnoreCase(role) ||
                        Objects.equals(lesson.getStudentId(), userId) ||
                        Objects.equals(lesson.getTutorId(), userId))
                .map(lessonMapper::toDTO)
                .toList();
    }

    @Transactional
    public LessonDTO updateLesson(Long id, UpdateLessonRequest request, Long userId) {
        Lesson lesson = findLessonWithAuthorization(id, userId);

        if (request.getScheduledTime() != null) {
            validateLessonTime(request.getScheduledTime());
            lesson.setScheduledTime(request.getScheduledTime());
        }
        if (request.getDurationMinutes() != null) {
            lesson.setDurationMinutes(request.getDurationMinutes());
        }
        if (request.getPrice() != null) {
            lesson.setPrice(request.getPrice());
        }
        if (request.getStatus() != null) {
            lesson.setStatus(request.getStatus());
        }

        lesson.setUpdatedAt(LocalDateTime.now());
        lesson = lessonRepository.save(lesson);

        sendNotification("LESSON_UPDATED", lesson);
        return lessonMapper.toDTO(lesson);
    }

    @Transactional
    public LessonDTO completeLesson(Long lessonId, Long userId) {
        Lesson lesson = findLessonWithAuthorization(lessonId, userId);

        if (!Constants.LessonStatus.IN_PROGRESS.equals(lesson.getStatus())) {
            throw new IllegalStateException("Урок должен быть в статусе IN_PROGRESS");
        }

        lesson.setStatus(Constants.LessonStatus.COMPLETED);
        lesson.setCompletedAt(LocalDateTime.now());
        lesson.setUpdatedAt(LocalDateTime.now());
        lesson = lessonRepository.save(lesson);

        sendPaymentEvent(lesson);
        sendNotification("LESSON_COMPLETED", lesson);

        return lessonMapper.toDTO(lesson);
    }

    @Transactional
    public LessonDTO cancelLesson(Long lessonId, String reason, Long userId) {
        Lesson lesson = findLessonWithAuthorization(lessonId, userId);
        lesson.setStatus(Constants.LessonStatus.CANCELLED);
        lesson.setUpdatedAt(LocalDateTime.now());
        lesson = lessonRepository.save(lesson);

        sendNotification("LESSON_CANCELLED", lesson);
        log.info("Lesson {} cancelled. Reason: {}", lessonId, reason);
        return lessonMapper.toDTO(lesson);
    }

    @Transactional(readOnly = true)
    public String generateJoinUrl(Long lessonId, Long userId) {
        Lesson lesson = findLessonWithAuthorization(lessonId, userId);
        if (lesson.getMeetingUrl() != null) {
            return lesson.getMeetingUrl();
        }

        return videoConferenceService.createMeeting(
                lesson.getId(),
                lesson.getScheduledTime(),
                lesson.getDurationMinutes()
        );
    }

    private void validateLessonTime(LocalDateTime scheduledTime) {
        if (scheduledTime == null) {
            throw new IllegalArgumentException("Время урока не указано");
        }
        if (scheduledTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Время урока не может быть в прошлом");
        }
    }

    private void sendPaymentEvent(Lesson lesson) {
        PaymentEvent event = new PaymentEvent();
        event.setEventId(UUID.randomUUID().toString());
        event.setLessonId(lesson.getId());
        event.setStudentId(lesson.getStudentId());
        event.setTutorId(lesson.getTutorId());
        event.setAmount(lesson.getPrice());
        event.setCurrency("RUB");
        event.setStatus(Constants.PaymentStatus.PENDING);
        event.setEventTime(LocalDateTime.now());
        event.setPaymentMethod("PLATFORM");

        rabbitTemplate.convertAndSend(
                Constants.QueueNames.PAYMENT_QUEUE,
                event
        );

        log.info("Payment event sent for lesson {}", lesson.getId());
    }

    private void sendNotification(String type, Lesson lesson) {
        NotificationEvent event = new NotificationEvent();
        event.setEventId(UUID.randomUUID().toString());
        event.setType("EMAIL");
        event.setTemplateId(type);
        event.setEventTime(LocalDateTime.now());

        event.setParameters(Map.of(
                "lessonId", lesson.getId(),
                "date", lesson.getScheduledTime(),
                "duration", lesson.getDurationMinutes(),
                "subject", "Математика"
        ));

        rabbitTemplate.convertAndSend(
                Constants.QueueNames.NOTIFICATION_QUEUE,
                event
        );
    }

    public Lesson findLessonWithAuthorization(Long lessonId, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new LessonNotFoundException(lessonId));

        if (!lesson.getStudentId().equals(userId) &&
                !lesson.getTutorId().equals(userId)) {
            throw new UnauthorizedAccessException("Нет доступа к уроку");
        }

        return lesson;
    }
}