package ru.tutorplatform.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CreateUserRequest {

    @NotBlank
    private String username;

    @NotBlank
    @Size(min = 6)
    private String password;

    @NotBlank
    private String role;

    @Email
    private String email;

    private String firstName;

    private String lastName;

    // НОВЫЕ ПОЛЯ (опциональные)
    private String bio;              // Описание/биография
    private String subjects;         // Предметы
    private Integer experienceYears; // Опыт работы
}
