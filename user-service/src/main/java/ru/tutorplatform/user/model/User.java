package ru.tutorplatform.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username")
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String role; // STUDENT, TUTOR, ADMIN — роль пользователя

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    // НОВОЕ ПОЛЕ - описание/биография
    @Column(name = "bio", length = 1000)
    private String bio;

    // ДОПОЛНИТЕЛЬНО: можно добавить предметы и опыт
    @Column(name = "subjects")
    private String subjects; // Например: "Математика, Физика"

    @Column(name = "experience_years")
    private Integer experienceYears; // Опыт работы в годах
}
