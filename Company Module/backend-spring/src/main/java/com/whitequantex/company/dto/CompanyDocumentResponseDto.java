package com.whitequantex.company.dto;

import com.whitequantex.company.entity.CompanyDocumentEntity;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyDocumentResponseDto {

    private UUID id;
    private UUID companyId;
    private String title;
    private String documentType;
    private String fileUrl;
    private Long fileSizeBytes;
    private String mimeType;
    private String confidentialityLevel;
    private UUID verificationId;
    private UUID uploadedBy;
    private Instant createdAt;

    public static CompanyDocumentResponseDto fromEntity(CompanyDocumentEntity entity) {
        if (entity == null) return null;
        return CompanyDocumentResponseDto.builder()
                .id(entity.getId())
                .companyId(entity.getCompanyId())
                .title(entity.getTitle())
                .documentType(entity.getDocumentType())
                .fileUrl(entity.getFileUrl())
                .fileSizeBytes(entity.getFileSizeBytes())
                .mimeType(entity.getMimeType())
                .confidentialityLevel(entity.getConfidentialityLevel())
                .verificationId(entity.getVerificationId())
                .uploadedBy(entity.getUploadedBy())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
