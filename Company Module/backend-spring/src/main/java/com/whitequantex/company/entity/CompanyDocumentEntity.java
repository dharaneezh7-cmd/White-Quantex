package com.whitequantex.company.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "company_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyDocumentEntity {

    @Id
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(nullable = false)
    private String title;

    @Column(name = "document_type", nullable = false, length = 64)
    private String documentType;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "confidentiality_level", nullable = false, length = 32)
    @Builder.Default
    private String confidentialityLevel = "PRIVATE";

    @Column(name = "verification_id")
    private UUID verificationId;

    @Column(name = "uploaded_by", nullable = false)
    private UUID uploadedBy;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
