package com.trustchain.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "pan_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PanRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String vendorId;

    @Column(nullable = false, unique = true, length = 10)
    private String panNumber;

    private String name;

    private String dateOfBirth;

    private String fatherName;

    @Column(length = 50)
    private String category; // Individual, Company, etc.

    private String mobileNumber;

    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status;

    @Column(length = 2000)
    private String verificationResponse;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum VerificationStatus {
        PENDING,
        VERIFIED,
        FAILED,
        REJECTED
    }
}
