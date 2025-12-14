package ru.tutorplatform.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.tutorplatform.user.dto.CreateUserRequest;
import ru.tutorplatform.user.dto.UserDto;
import ru.tutorplatform.user.model.User;
import ru.tutorplatform.user.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .bio(request.getBio())
                .subjects(request.getSubjects())
                .experienceYears(request.getExperienceYears())
                .build();

        user = userRepository.save(user);
        return toDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUser(Long id) {
        return userRepository.findById(id)
                .map(this::toDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getTutors(String subject, Integer minRating) {
        List<User> tutors = userRepository.findByRole("TUTOR");
        return tutors.stream()
                .map(this::toDto)
                .toList();
    }

    private UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .bio(user.getBio())
                .subjects(user.getSubjects())
                .experienceYears(user.getExperienceYears())
                .build();
    }
}
