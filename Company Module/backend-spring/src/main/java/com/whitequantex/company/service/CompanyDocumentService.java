package com.whitequantex.company.service;

import com.whitequantex.company.dto.CompanyDocumentResponseDto;
import com.whitequantex.company.entity.CompanyDocumentEntity;
import com.whitequantex.company.exception.ResourceNotFoundException;
import com.whitequantex.company.repository.CompanyDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyDocumentService {

    private final CompanyDocumentRepository documentRepository;
    private final CompanyService companyService;
    private final CompanyAuditService auditService;

    @Transactional
    public CompanyDocumentResponseDto uploadDocument(
            UUID companyId,
            String title,
            String documentType,
            String fileUrl,
            Long fileSizeBytes,
            String mimeType,
            String confidentialityLevel,
            UUID verificationId,
            UUID actorUserId
    ) {
        companyService.assertIsAdminOrOwner(companyId, actorUserId);

        CompanyDocumentEntity doc = CompanyDocumentEntity.builder()
                .id(UUID.randomUUID())
                .companyId(companyId)
                .title(title)
                .documentType(documentType)
                .fileUrl(fileUrl)
                .fileSizeBytes(fileSizeBytes)
                .mimeType(mimeType)
                .confidentialityLevel(confidentialityLevel != null ? confidentialityLevel : "PRIVATE")
                .verificationId(verificationId)
                .uploadedBy(actorUserId)
                .createdAt(Instant.now())
                .build();

        CompanyDocumentEntity saved = documentRepository.save(doc);

        auditService.logAction(
                companyId,
                actorUserId,
                "DOCUMENT_UPLOADED",
                null,
                "Uploaded " + title + " (" + documentType + ")",
                null,
                null
        );

        return CompanyDocumentResponseDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<CompanyDocumentResponseDto> getDocuments(UUID companyId, UUID actorUserId) {
        companyService.assertIsAdminOrOwner(companyId, actorUserId);
        return documentRepository.findAllByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(CompanyDocumentResponseDto::fromEntity).toList();
    }
}
