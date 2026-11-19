package com.whitequantex.company.dto;

import com.whitequantex.company.entity.CompanyVerificationEntity;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyVerificationResponseDto {

    private UUID id;
    private UUID companyId;
    private String requestType;
    private String verificationTier;
    private String status;
    private String businessRegistrationNumber;
    private String taxId;
    private String incorporationJurisdiction;
    private String submissionNotes;
    private UUID reviewerUserId;
    private String reviewerNotes;
    private Instant reviewedAt;
    private UUID submittedBy;
    private Instant submittedAt;
    private Long version;
    private Instant createdAt;

    public static CompanyVerificationResponseDto fromEntity(CompanyVerificationEntity entity) {
        if (entity == null) return null;
        return CompanyVerificationResponseDto.builder()
                .id(entity.getId())
                .companyId(entity.getCompanyId())
                .requestType(entity.getRequestType())
                .verificationTier(entity.getVerificationTier())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .businessRegistrationNumber(entity.getBusinessRegistrationNumber())
                .taxId(entity.getTaxId())
                .incorporationJurisdiction(entity.getIncorporationJurisdiction())
                .submissionNotes(entity.getSubmissionNotes())
                .reviewerUserId(entity.getReviewerUserId())
                .reviewerNotes(entity.getReviewerNotes())
                .reviewedAt(entity.getReviewedAt())
                .submittedBy(entity.getSubmittedBy())
                .submittedAt(entity.getSubmittedAt())
                .version(entity.getVersion())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
