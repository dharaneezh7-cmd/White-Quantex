package com.whitequantex.company.service;

import com.whitequantex.company.dto.QuarterlyFinancialRequestDto;
import com.whitequantex.company.dto.CompanyQuarterlyFinancialResponseDto;
import com.whitequantex.company.entity.CompanyEntity;
import com.whitequantex.company.entity.CompanyQuarterlyFinancialEntity;
import com.whitequantex.company.entity.VentureEntity;
import com.whitequantex.company.exception.ResourceNotFoundException;
import com.whitequantex.company.repository.CompanyQuarterlyFinancialRepository;
import com.whitequantex.company.repository.CompanyRepository;
import com.whitequantex.company.repository.VentureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyFinancialService {

    private final CompanyQuarterlyFinancialRepository financialRepository;
    private final CompanyRepository companyRepository;
    private final VentureRepository ventureRepository;
    private final CompanyService companyService;
    private final CompanyAuditService auditService;

    @Transactional
    public CompanyQuarterlyFinancialResponseDto submitQuarterlyFinancials(
            String tickerOrId,
            QuarterlyFinancialRequestDto request,
            UUID actorUserId
    ) {
        // Resolve company or venture
        UUID entityId = null;
        String ticker = null;

        CompanyEntity company = null;
        try {
            UUID parsedUuid = UUID.fromString(tickerOrId);
            company = companyRepository.findById(parsedUuid).orElse(null);
            if (company != null) {
                entityId = company.getId();
                ticker = company.getTicker();
            }
        } catch (IllegalArgumentException ignored) {}

        if (company == null) {
            company = companyRepository.findByTicker(tickerOrId.toUpperCase()).orElse(null);
            if (company != null) {
                entityId = company.getId();
                ticker = company.getTicker();
            }
        }

        if (company == null) {
            // Check ventures
            VentureEntity venture = null;
            try {
                UUID parsedUuid = UUID.fromString(tickerOrId);
                venture = ventureRepository.findById(parsedUuid).orElse(null);
            } catch (IllegalArgumentException ignored) {}

            if (venture == null) {
                venture = ventureRepository.findByTicker(tickerOrId.toUpperCase()).orElse(null);
            }

            if (venture == null) {
                throw new ResourceNotFoundException("Corporate entity not found for ticker/id: " + tickerOrId);
            }
            entityId = venture.getId();
            ticker = venture.getTicker();
        }

        // Enforce administrative permissions
        companyService.assertIsAdminOrOwner(entityId, actorUserId);

        // Compute profit margin if not set
        BigDecimal profitMargin = BigDecimal.ZERO;
        if (request.getRevenue().compareTo(BigDecimal.ZERO) > 0) {
            profitMargin = request.getProfit()
                    .divide(request.getRevenue(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        final UUID targetEntityId = entityId;
        final String targetTicker = ticker;

        // Check if filing exists for company and quarter
        CompanyQuarterlyFinancialEntity financial = financialRepository
                .findByCompanyIdAndQuarter(targetEntityId, request.getQuarter())
                .orElseGet(() -> CompanyQuarterlyFinancialEntity.builder()
                        .id(UUID.randomUUID())
                        .companyId(targetEntityId)
                        .ticker(targetTicker)
                        .quarter(request.getQuarter())
                        .createdAt(Instant.now())
                        .build());

        financial.setFiscalYear(request.getFiscalYear());
        financial.setQuarterNumber(request.getQuarterNumber());
        financial.setRevenue(request.getRevenue());
        financial.setProfit(request.getProfit());
        financial.setExpenses(request.getExpenses());
        financial.setGrowthRate(request.getGrowthRate() != null ? request.getGrowthRate() : BigDecimal.ZERO);
        financial.setProfitMargin(profitMargin);
        financial.setMilestones(request.getMilestones());
        financial.setReportedDate(Instant.now());

        CompanyQuarterlyFinancialEntity saved = financialRepository.save(financial);

        // Update live quarterly stats on Company record if applicable
        if (company != null) {
            company.setQuarterlyRevenue(request.getRevenue());
            company.setQuarterlyProfit(request.getProfit());
            company.setLastFinancialUpdate(Instant.now());
            companyRepository.save(company);
        }

        auditService.logAction(
                entityId,
                actorUserId,
                "FINANCIALS_SUBMITTED",
                null,
                "Quarter: " + request.getQuarter() + " Rev: " + request.getRevenue() + " Profit: " + request.getProfit(),
                null,
                null
        );

        return CompanyQuarterlyFinancialResponseDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<CompanyQuarterlyFinancialResponseDto> getFinancialHistory(String ticker) {
        return financialRepository.findAllByTickerOrderByFiscalYearDescQuarterNumberDesc(ticker.toUpperCase())
                .stream().map(CompanyQuarterlyFinancialResponseDto::fromEntity).toList();
    }
}
