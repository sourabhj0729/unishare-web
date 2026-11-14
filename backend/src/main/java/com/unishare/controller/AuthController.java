package com.unishare.controller;

import com.unishare.entity.Student;
import com.unishare.repository.StudentRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final StudentRepository students;
    private final PasswordEncoder passwordEncoder;

    public AuthController(StudentRepository students, PasswordEncoder passwordEncoder) {
        this.students = students;
        this.passwordEncoder = passwordEncoder;
    }

    public record RegisterRequest(@NotBlank String fullName, @Email @NotBlank String email,
                                  @Size(min=6) String password, @NotBlank String collegeName) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record StudentResponse(Long id, String fullName, String email, String collegeName) {}

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponse register(@Valid @RequestBody RegisterRequest request) {
        if (students.existsByEmail(request.email().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        Student student = new Student();
        student.setFullName(request.fullName().trim());
        student.setEmail(request.email().trim().toLowerCase());
        student.setPassword(passwordEncoder.encode(request.password()));
        student.setCollegeName(request.collegeName().trim());
        return response(students.save(student));
    }

    @PostMapping("/login")
    public StudentResponse login(@Valid @RequestBody LoginRequest request) {
        Student student = students.findByEmail(request.email().trim().toLowerCase())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), student.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return response(student);
    }

    private StudentResponse response(Student s) {
        return new StudentResponse(s.getId(), s.getFullName(), s.getEmail(), s.getCollegeName());
    }
}
