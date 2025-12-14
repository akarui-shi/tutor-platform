package ru.tutorplatform.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String bio;              // Описание/биография
    private String subjects;         // Предметы (например: "Математика, Физика")
    private Integer experienceYears; // Опыт работы в годах
}
