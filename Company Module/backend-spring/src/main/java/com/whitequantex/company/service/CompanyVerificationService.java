package com.whitequantex.company.service;

import com.whitequantex.company.dto.*;
import com.whitequantex.company.entity.*;
import com.whitequantex.company.entity.CompanyVerificationEntity.VerificationStatus;
import com.whitequantex.company.exception.*;
import com.whitequantex.company.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyVerificationService {

    private final CompanyVerificationRepository verificationRepository;
    private final CompanyRepository companyRepository;
    private final VentureRepository ventureRepository;
    private final CompanyService companyService;
    private final CompanyAuditService auditService;

    /**
     * Scenario 5: Prevent concurrent duplicate verification submissions.
     */
    @Transactional
    public CompanyVerificationResponseDto submitVerification(UUID companyId, SubmitVerificationRequestDto request, UUID actorUserId) {
        companyService.assertIsAdminOrOwner(companyId, actorUserId);

        // Check if an active verification is already in flight
        List<CompanyVerificationEntity> activeRequests = verificationRepository.findActiveRequestsByCompanyId(companyId);
        if (!activeRequests.isEmpty()) {
            throw new ConflictException("A verification request is already in progress for this company. Please await review.");
        }

        CompanyVerificationEntity entity = CompanyVerificationEntity.builder()
                .id(UUID.randomUUID())
                .companyId(companyId)
                .requestType(request.getRequestType() != null ? request.getRequestType() : "STANDARD_VERIFICATION")
                .verificationTier(request.getVerificationTier() != null ? request.getVerificationTier() : "GOLD")
                .status(VerificationStatus.PENDING)
                .businessRegistrationNumber(request.getBusinessRegistrationNumber())
                .taxId(request.getTaxId())
                .incorporationJurisdiction(request.getIncorporationJurisdiction())
                .submissionNotes(request.getSubmissionNotes())
                .submittedBy(actorUserId)
                .submittedAt(Instant.now())
                .version(0L)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        CompanyVerificationEntity saved = verificationRepository.save(entity);

        auditService.logAction(
                companyId,
                actorUserId,
                "VERIFICATION_SUBMITTED",
                null,
                "Verification ID: " + saved.getId() + " Tier: " + saved.getVerificationTier(),
                null,
                null
        );

        return CompanyVerificationResponseDto.fromEntity(saved);
    }

    /**
     * Scenario 5: Concurrent review decisions using Pessimistic Lock on verification entity.
     */
    @Transactional
    public CompanyVerificationResponseDto reviewVerification(UUID verificationId, ReviewVerificationRequestDto request, UUID reviewerUserId) {
        CompanyVerificationEntity verification = verificationRepository.findByIdWithPessimisticLock(verificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification record not found: " + verificationId));

        if (verification.getStatus() == VerificationStatus.APPROVED || verification.getStatus() == VerificationStatus.REJECTED) {
            throw new ConflictException("Verification has already been finalized as " + verification.getStatus());
        }

        String prevStatus = verification.getStatus().name();
        verification.setStatus(request.getDecision());
        verification.setReviewerUserId(reviewerUserId);
        verification.setReviewerNotes(request.getReviewerNotes());
        verification.setReviewedAt(Instant.now());

        CompanyVerificationEntity updated = verificationRepository.save(verification);

        // Update company verification tier & score upon approval
        if (request.getDecision() == VerificationStatus.APPROVED) {
            UUID companyId = verification.getCompanyId();
            companyRepository.findById(companyId).ifPresent(c -> {
                c.setVerificationLevel(verification.getVerificationTier());
                c.setTrustScore(Math.max(c.getTrustScore(), 95));
                companyRepository.save(c);
            });

            ventureRepository.findById(companyId).ifPresent(v -> {
                v.setVerificationLevel(verification.getVerificationTier());
                v.setTrustScore(Math.max(v.getTrustScore(), 90));
                ventureRepository.save(v);
            });
        }

        auditService.logAction(
                verification.getCompanyId(),
                reviewerUserId,
                "VERIFICATION_REVIEWED",
                prevStatus,
                "Decision: " + request.getDecision() + " Notes: " + request.getReviewerNotes(),
                null,
                null
        );

        return CompanyVerificationResponseDto.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<CompanyVerificationResponseDto> getCompanyVerifications(UUID companyId) {
        return verificationRepository.findAllByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(CompanyVerificationResponseDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public Page<CompanyVerificationResponseDto> getPendingVerifications(Pageable pageable) {
        return verificationRepository.findAllByStatusOrderBySubmittedAtDesc(VerificationStatus.PENDING, pageable)
                .map(CompanyVerificationResponseDto::fromEntity);
    }
}
