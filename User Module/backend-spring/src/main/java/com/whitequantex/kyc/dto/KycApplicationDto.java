package com.whitequantex.kyc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycApplicationDto {
    private UUID id;
    private String applicationId;
    private UUID userId;
    private String userEmail;
    private String legalFirstName;
    private String legalLastName;
    private String legalFullName;
    private String dateOfBirth;
    private String residentialAddress;
    private String city;
    private String stateProvince;
    private String postalCode;
    private String country;
    private String nationality;
    private String idType;
    private String idNumberMasked;
    private String phoneNumber;
    private String documentType;
    private String documentFileName;
    private Long documentFileSize;
    private String proofOfAddressFileName;
    private Boolean declarationAccepted;
    private Boolean consentAccepted;
    private String status;
    private String verificationSource;
    private String reviewerId;
    private String reviewerNotes;
    private String actionRequiredReason;
    private String rejectionReason;
    private String auditLog;
    private Instant submittedAt;
    private Instant reviewedAt;
    private Instant approvedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
