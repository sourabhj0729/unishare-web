package com.unishare.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="students")
public class Student {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private String fullName;
 @Column(nullable=false,unique=true) private String email;
 @Column(nullable=false) private String password;
 @Column(nullable=false) private String collegeName;
 @Column(nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
 public Student() {}
 public Long getId(){return id;}
 public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;}
 public String getEmail(){return email;} public void setEmail(String v){email=v;}
 public String getPassword(){return password;} public void setPassword(String v){password=v;}
 public String getCollegeName(){return collegeName;} public void setCollegeName(String v){collegeName=v;}
 public LocalDateTime getCreatedAt(){return createdAt;}
}