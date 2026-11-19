package com.whitequantex.company.service;

import com.whitequantex.company.entity.*;
import com.whitequantex.company.exception.ConflictException;
import com.whitequantex.company.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyLifecycleServiceTest {

    @Mock
    private VentureRepository ventureRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private GraduationApplicationRepository graduationRepository;

    @Mock
    private BusinessLifecycleHistoryRepository lifecycleHistoryRepository;

    @Mock
    private CompanyService companyService;

    @Mock
    private CompanyAuditService auditService;

    @InjectMocks
    private CompanyLifecycleService lifecycleService;

    private UUID ventureId;
    private UUID applicationId;
    private UUID reviewerId;

    @BeforeEach
    void setUp() {
        ventureId = UUID.randomUUID();
        applicationId = UUID.randomUUID();
        reviewerId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Scenario 6: Atomically graduate startup and strictly PRESERVE original business UUID")
    void testApproveGraduationPreservesUuid() {
        GraduationApplicationEntity app = GraduationApplicationEntity.builder()
                .id(applicationId)
                .businessId(ventureId)
                .businessName("TechFlow AI Solutions")
                .ticker("TFLOW")
                .applicationStatus("SUBMITTED")
                .revenueRunRate("25000000.00")
                .customerCount(120)
                .build();

        VentureEntity venture = VentureEntity.builder()
                .id(ventureId)
                .ticker("TFLOW")
                .name("TechFlow AI Solutions")
                .shortName("TechFlow")
                .legalEntity("Delaware C-Corp")
                .cik("CIK-0002100099")
                .sector("AI & ML")
                .subIndustry("Enterprise Software")
                .headquarters("Palo Alto, CA")
                .region("North America")
                .foundedYear(2022)
                .ceo("Alex Vance")
                .employees(45)
                .valuation("$150M")
                .valuationNum(new BigDecimal("150000000.00"))
                .annualRevenue("$25M")
                .annualRevenueNum(new BigDecimal("25000000.00"))
                .isGraduated(false)
                .build();

        when(graduationRepository.findByIdWithPessimisticLock(applicationId)).thenReturn(Optional.of(app));
        when(ventureRepository.findByIdWithPessimisticLock(ventureId)).thenReturn(Optional.of(venture));
        when(companyRepository.findById(ventureId)).thenReturn(Optional.empty());
        when(companyRepository.save(any(CompanyEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CompanyEntity graduated = lifecycleService.approveGraduation(applicationId, "Approved for full listing", reviewerId);

        assertThat(graduated.getId()).isEqualTo(ventureId);
        assertThat(graduated.getTicker()).isEqualTo("TFLOW");
        assertThat(graduated.getLifecycleClassification()).isEqualTo("ESTABLISHED_COMPANY");
        assertThat(venture.getIsGraduated()).isTrue();

        verify(lifecycleHistoryRepository).save(any(BusinessLifecycleHistoryEntity.class));
        verify(auditService).logAction(eq(ventureId), eq(reviewerId), eq("STARTUP_GRADUATED"), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Scenario 6: Reject graduation if venture is already graduated")
    void testGraduationRejectionIfAlreadyGraduated() {
        GraduationApplicationEntity app = GraduationApplicationEntity.builder()
                .id(applicationId)
                .businessId(ventureId)
                .applicationStatus("SUBMITTED")
                .build();

        VentureEntity alreadyGraduatedVenture = VentureEntity.builder()
                .id(ventureId)
                .isGraduated(true)
                .build();

        when(graduationRepository.findByIdWithPessimisticLock(applicationId)).thenReturn(Optional.of(app));
        when(ventureRepository.findByIdWithPessimisticLock(ventureId)).thenReturn(Optional.of(alreadyGraduatedVenture));

        assertThrows(ConflictException.class, () -> lifecycleService.approveGraduation(applicationId, "Notes", reviewerId));
        verify(companyRepository, never()).save(any());
    }
}
