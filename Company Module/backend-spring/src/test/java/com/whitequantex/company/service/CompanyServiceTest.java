package com.whitequantex.company.service;

import com.whitequantex.company.dto.*;
import com.whitequantex.company.entity.*;
import com.whitequantex.company.entity.CompanyMembershipEntity.CompanyRole;
import com.whitequantex.company.exception.*;
import com.whitequantex.company.repository.*;
import com.whitequantex.company.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private VentureRepository ventureRepository;

    @Mock
    private CompanyMembershipRepository membershipRepository;

    @Mock
    private CompanyAuditService auditService;

    @InjectMocks
    private CompanyService companyService;

    private UUID userId;
    private UUID companyId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        companyId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Scenario 1: Reject duplicate company ticker registration")
    void testCreateCompanyDuplicateTicker() {
        CreateCompanyRequestDto request = CreateCompanyRequestDto.builder()
                .ticker("ZEPR")
                .name("Zepr Tech")
                .shortName("Zepr")
                .legalEntity("Delaware C-Corp")
                .cik("CIK-0001234567")
                .sector("Technology")
                .subIndustry("Software")
                .headquarters("San Francisco, CA")
                .region("North America")
                .foundedYear(2021)
                .ceo("Jane Doe")
                .employees(50)
                .valuation("$100M")
                .valuationNum(new BigDecimal("100000000.00"))
                .annualRevenue("$20M")
                .annualRevenueNum(new BigDecimal("20000000.00"))
                .build();

        when(companyRepository.existsByTicker("ZEPR")).thenReturn(true);

        assertThrows(ConflictException.class, () -> companyService.createCompany(request, userId));
        verify(companyRepository, never()).save(any());
    }

    @Test
    @DisplayName("Scenario 3: Optimistic Locking version collision throws ConflictException")
    void testOptimisticLockingVersionCollision() {
        UpdateCompanyRequestDto updateDto = UpdateCompanyRequestDto.builder()
                .shortName("Updated Name")
                .version(1L) // Client sending stale version
                .build();

        CompanyEntity existing = CompanyEntity.builder()
                .id(companyId)
                .ticker("ZEPR")
                .name("Zepr Corporation")
                .shortName("Zepr")
                .ownerUserId(userId)
                .version(2L) // DB already at version 2
                .build();

        when(membershipRepository.hasAnyRole(eq(companyId), eq(userId), any())).thenReturn(true);
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(existing));

        assertThrows(ConflictException.class, () -> companyService.updateCompany(companyId, updateDto, userId));
        verify(companyRepository, never()).saveAndFlush(any());
    }
}
