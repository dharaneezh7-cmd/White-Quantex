package com.whitequantex.kyc.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "kyc_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycApplicationEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String applicationId;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 100)
    private String legalFirstName;

    @Column(nullable = false, length = 100)
    private String legalLastName;

    @Column(nullable = false, length = 50)
    private String dateOfBirth;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String residentialAddress;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String stateProvince;

    @Column(nullable = false, length = 50)
    private String postalCode;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(nullable = false, length = 100)
    private String nationality;

    @Column(nullable = false, length = 50)
    private String idType; // PAN_CARD, NATIONAL_ID, PASSPORT, DRIVERS_LICENSE

    @Column(nullable = false, length = 100)
    private String idNumberMasked;

    @Column(nullable = false, length = 255)
    private String idNumberHash;

    @Column(length = 50)
    private String phoneNumber;

    @Column(nullable = false, length = 50)
    private String documentType;

    @Column(nullable = false, length = 255)
    private String documentFileName;

    @Column(length = 100)
    private String documentMimeType;

    private Long documentFileSize;

    @Column(nullable = false, length = 500)
    private String documentStoragePath;

    @Column(length = 255)
    private String proofOfAddressFileName;

    @Column(length = 500)
    private String proofOfAddressStoragePath;

    @Builder.Default
    private Boolean declarationAccepted = false;

    @Builder.Default
    private Boolean consentAccepted = false;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "NOT_STARTED"; // NOT_STARTED, DRAFT, SUBMITTED, UNDER_REVIEW, ACTION_REQUIRED, APPROVED, REJECTED

    @Column(length = 100)
    private String verificationSource;

    @Column(length = 100)
    private String reviewerId;

    @Column(columnDefinition = "TEXT")
    private String reviewerNotes;

    @Column(columnDefinition = "TEXT")
    private String actionRequiredReason;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(columnDefinition = "TEXT")
    private String auditLog;

    private Instant submittedAt;
    private Instant reviewedAt;
    private Instant approvedAt;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
