package com.whitequantex.company.service;

import com.whitequantex.company.dto.ReviewVerificationRequestDto;
import com.whitequantex.company.dto.SubmitVerificationRequestDto;
import com.whitequantex.company.entity.CompanyVerificationEntity;
import com.whitequantex.company.entity.CompanyVerificationEntity.VerificationStatus;
import com.whitequantex.company.exception.ConflictException;
import com.whitequantex.company.repository.CompanyRepository;
import com.whitequantex.company.repository.CompanyVerificationRepository;
import com.whitequantex.company.repository.VentureRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyVerificationServiceTest {

    @Mock
    private CompanyVerificationRepository verificationRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private VentureRepository ventureRepository;

    @Mock
    private CompanyService companyService;

    @Mock
    private CompanyAuditService auditService;

    @InjectMocks
    private CompanyVerificationService verificationService;

    private UUID companyId;
    private UUID actorUserId;
    private UUID verificationId;

    @BeforeEach
    void setUp() {
        companyId = UUID.randomUUID();
        actorUserId = UUID.randomUUID();
        verificationId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Scenario 5: Prevent concurrent duplicate verification submission")
    void testDuplicateVerificationSubmissionThrowsConflict() {
        SubmitVerificationRequestDto request = SubmitVerificationRequestDto.builder()
                .businessRegistrationNumber("REG-999")
                .taxId("EIN-123456")
                .incorporationJurisdiction("Delaware")
                .build();

        CompanyVerificationEntity active = CompanyVerificationEntity.builder()
                .id(UUID.randomUUID())
                .companyId(companyId)
                .status(VerificationStatus.PENDING)
                .build();

        when(verificationRepository.findActiveRequestsByCompanyId(companyId)).thenReturn(List.of(active));

        assertThrows(ConflictException.class, () -> verificationService.submitVerification(companyId, request, actorUserId));
        verify(verificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Scenario 5: Disallow re-adjudicating an already finalized verification")
    void testFinalizedVerificationReviewThrowsConflict() {
        ReviewVerificationRequestDto request = ReviewVerificationRequestDto.builder()
                .decision(VerificationStatus.APPROVED)
                .reviewerNotes("Re-approval")
                .build();

        CompanyVerificationEntity finalized = CompanyVerificationEntity.builder()
                .id(verificationId)
                .companyId(companyId)
                .status(VerificationStatus.APPROVED) // Already finalized
                .build();

        when(verificationRepository.findByIdWithPessimisticLock(verificationId)).thenReturn(Optional.of(finalized));

        assertThrows(ConflictException.class, () -> verificationService.reviewVerification(verificationId, request, actorUserId));
        verify(verificationRepository, never()).save(any());
    }
}
