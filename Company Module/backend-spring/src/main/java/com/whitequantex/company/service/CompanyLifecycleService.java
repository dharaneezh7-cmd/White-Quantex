package com.whitequantex.company.service;

import com.whitequantex.company.dto.SubmitGraduationRequestDto;
import com.whitequantex.company.entity.*;
import com.whitequantex.company.exception.*;
import com.whitequantex.company.repository.*;
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
public class CompanyLifecycleService {

    private final VentureRepository ventureRepository;
    private final CompanyRepository companyRepository;
    private final GraduationApplicationRepository graduationRepository;
    private final BusinessLifecycleHistoryRepository lifecycleHistoryRepository;
    private final CompanyService companyService;
    private final CompanyAuditService auditService;

    @Transactional
    public GraduationApplicationEntity submitGraduationApplication(UUID ventureId, SubmitGraduationRequestDto request, UUID actorUserId) {
        companyService.assertIsAdminOrOwner(ventureId, actorUserId);

        VentureEntity venture = ventureRepository.findById(ventureId)
                .orElseThrow(() -> new ResourceNotFoundException("Venture not found: " + ventureId));

        List<GraduationApplicationEntity> pending = graduationRepository.findActiveRequestsByBusinessId(ventureId);
        if (!pending.isEmpty()) {
            throw new ConflictException("A graduation application is already pending review for this venture.");
        }

        GraduationApplicationEntity app = GraduationApplicationEntity.builder()
                .id(UUID.randomUUID())
                .businessId(ventureId)
                .businessName(venture.getName())
                .ticker(venture.getTicker())
                .applicationStatus("SUBMITTED")
                .productMaturitySummary(request.getMaturitySummary())
                .revenueRunRate(request.getRevenueRunRate() != null ? request.getRevenueRunRate().toString() : "0.00")
                .customerCount(request.getCustomerCount())
                .submittedAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return graduationRepository.save(app);
    }

    @Transactional
    public CompanyEntity approveGraduation(UUID graduationApplicationId, String reviewerNotes, UUID reviewerUserId) {
        GraduationApplicationEntity app = graduationRepository.findByIdWithPessimisticLock(graduationApplicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Graduation application not found: " + graduationApplicationId));

        if ("APPROVED".equalsIgnoreCase(app.getApplicationStatus()) || "REJECTED".equalsIgnoreCase(app.getApplicationStatus())) {
            throw new ConflictException("Graduation application has already been processed as: " + app.getApplicationStatus());
        }

        UUID businessId = app.getBusinessId();

        VentureEntity venture = ventureRepository.findByIdWithPessimisticLock(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Venture entity not found for business: " + businessId));

        if (Boolean.TRUE.equals(venture.getIsGraduated())) {
            throw new ConflictException("This venture has already graduated to an established company.");
        }

        app.setApplicationStatus("APPROVED");
        app.setDecision("APPROVED");
        app.setReviewedBy(reviewerUserId.toString());
        app.setDecisionReason(reviewerNotes);
        app.setReviewedAt(Instant.now());
        graduationRepository.save(app);

        venture.setIsGraduated(true);
        venture.setLifecycleClassification("ESTABLISHED_COMPANY");
        venture.setLifecycleStatus("GRADUATED");
        ventureRepository.save(venture);

        CompanyEntity company = companyRepository.findById(businessId).orElse(null);
        if (company == null) {
            company = CompanyEntity.builder()
                    .id(businessId)
                    .ticker(venture.getTicker())
                    .name(venture.getName())
                    .shortName(venture.getShortName())
                    .legalEntity(venture.getLegalEntity())
                    .cik(venture.getCik())
                    .sector(venture.getSector())
                    .subIndustry(venture.getSubIndustry())
                    .headquarters(venture.getHeadquarters())
                    .region(venture.getRegion())
                    .foundedYear(venture.getFoundedYear())
                    .ceo(venture.getCeo())
                    .employees(venture.getEmployees())
                    .valuation(venture.getValuation())
                    .valuationNum(venture.getValuationNum())
                    .annualRevenue(venture.getAnnualRevenue())
                    .annualRevenueNum(venture.getAnnualRevenueNum())
                    .verificationLevel(venture.getVerificationLevel())
                    .trustScore(venture.getTrustScore())
                    .description(venture.getDescription())
                    .logoColor(venture.getLogoColor())
                    .status("Active Trading")
                    .exchangeTier("Tier-1 Institutional")
                    .isActive(true)
                    .lifecycleClassification("ESTABLISHED_COMPANY")
                    .lifecycleStatus("ACTIVE")
                    .graduationDate(Instant.now())
                    .marketListingStatus("LISTED")
                    .ownerUserId(venture.getOwnerUserId())
                    .version(0L)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            company = companyRepository.save(company);
        }

        BusinessLifecycleHistoryEntity history = BusinessLifecycleHistoryEntity.builder()
                .id(UUID.randomUUID())
                .businessId(businessId)
                .businessName(venture.getName())
                .previousClassification("STARTUP")
                .newClassification("ESTABLISHED_COMPANY")
                .previousStatus("ACTIVE")
                .newStatus("GRADUATED")
                .transitionReason("Maturity threshold met: Run rate " + app.getRevenueRunRate() + ", " + app.getCustomerCount() + " customers.")
                .approvalReference(graduationApplicationId.toString())
                .performedBy(reviewerUserId.toString())
                .effectiveAt(Instant.now())
                .createdAt(Instant.now())
                .build();
        lifecycleHistoryRepository.save(history);

        auditService.logAction(
                businessId,
                reviewerUserId,
                "STARTUP_GRADUATED",
                "STARTUP",
                "ESTABLISHED_COMPANY (UUID preserved: " + businessId + ")",
                null,
                null
        );

        return company;
    }

    @Transactional(readOnly = true)
    public List<BusinessLifecycleHistoryEntity> getLifecycleHistory(UUID businessId) {
        return lifecycleHistoryRepository.findAllByBusinessIdOrderByEffectiveAtDesc(businessId);
    }
}
