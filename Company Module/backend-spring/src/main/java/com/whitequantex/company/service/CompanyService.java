package com.whitequantex.company.service;

import com.whitequantex.company.dto.*;
import com.whitequantex.company.entity.*;
import com.whitequantex.company.entity.CompanyMembershipEntity.CompanyRole;
import com.whitequantex.company.exception.*;
import com.whitequantex.company.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final VentureRepository ventureRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final CompanyAuditService auditService;

    @Transactional
    public CompanyResponseDto createCompany(CreateCompanyRequestDto request, UUID ownerUserId) {
        // 1. Uniqueness check (Scenario 1)
        if (companyRepository.existsByTicker(request.getTicker().toUpperCase())) {
            throw new ConflictException("Company with ticker '" + request.getTicker() + "' already exists");
        }
        if (companyRepository.existsByCik(request.getCik())) {
            throw new ConflictException("Company with CIK '" + request.getCik() + "' already exists");
        }
        if (companyRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Company with name '" + request.getName() + "' already exists");
        }

        UUID companyId = UUID.randomUUID();

        CompanyEntity entity = CompanyEntity.builder()
                .id(companyId)
                .ticker(request.getTicker().toUpperCase())
                .name(request.getName())
                .shortName(request.getShortName())
                .legalEntity(request.getLegalEntity())
                .cik(request.getCik())
                .sector(request.getSector())
                .subIndustry(request.getSubIndustry())
                .headquarters(request.getHeadquarters())
                .region(request.getRegion())
                .foundedYear(request.getFoundedYear())
                .ceo(request.getCeo())
                .employees(request.getEmployees())
                .valuation(request.getValuation())
                .valuationNum(request.getValuationNum())
                .annualRevenue(request.getAnnualRevenue())
                .annualRevenueNum(request.getAnnualRevenueNum())
                .description(request.getDescription())
                .logoColor(request.getLogoColor() != null ? request.getLogoColor() : "bg-emerald-600")
                .ownerUserId(ownerUserId)
                .version(0L)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        CompanyEntity saved = companyRepository.save(entity);

        // Scenario 2: Automatically bind registering user as OWNER in company_memberships
        CompanyMembershipEntity ownerMembership = CompanyMembershipEntity.builder()
                .id(UUID.randomUUID())
                .companyId(companyId)
                .userId(ownerUserId)
                .role(CompanyRole.OWNER)
                .title("Founder / CEO")
                .isActive(true)
                .joinedAt(Instant.now())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        membershipRepository.save(ownerMembership);

        // Audit Trail
        auditService.logAction(
                companyId,
                ownerUserId,
                "COMPANY_REGISTERED",
                null,
                "Created company " + saved.getName() + " (" + saved.getTicker() + ")",
                null,
                null
        );

        return CompanyResponseDto.fromEntity(saved);
    }

    @Transactional
    public CompanyResponseDto createVenture(CreateVentureRequestDto request, UUID ownerUserId) {
        if (ventureRepository.existsByTicker(request.getTicker().toUpperCase())) {
            throw new ConflictException("Venture with ticker '" + request.getTicker() + "' already exists");
        }
        if (ventureRepository.existsByCik(request.getCik())) {
            throw new ConflictException("Venture with CIK '" + request.getCik() + "' already exists");
        }
        if (ventureRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Venture with name '" + request.getName() + "' already exists");
        }

        UUID ventureId = UUID.randomUUID();

        VentureEntity entity = VentureEntity.builder()
                .id(ventureId)
                .ticker(request.getTicker().toUpperCase())
                .name(request.getName())
                .shortName(request.getShortName())
                .legalEntity(request.getLegalEntity())
                .cik(request.getCik())
                .sector(request.getSector())
                .subIndustry(request.getSubIndustry())
                .headquarters(request.getHeadquarters())
                .region(request.getRegion())
                .foundedYear(request.getFoundedYear())
                .ceo(request.getCeo())
                .employees(request.getEmployees())
                .valuation(request.getValuation())
                .valuationNum(request.getValuationNum())
                .annualRevenue(request.getAnnualRevenue())
                .annualRevenueNum(request.getAnnualRevenueNum())
                .description(request.getDescription())
                .logoColor(request.getLogoColor() != null ? request.getLogoColor() : "bg-indigo-600")
                .roundType(request.getRoundType() != null ? request.getRoundType() : "Series A")
                .targetRaise(request.getTargetRaise() != null ? request.getTargetRaise() : "$10.0M")
                .targetRaiseNum(request.getTargetRaiseNum())
                .raisedAmount(request.getRaisedAmount() != null ? request.getRaisedAmount() : "$0.0M")
                .raisedAmountNum(request.getRaisedAmountNum())
                .minInvestment(request.getMinInvestment() != null ? request.getMinInvestment() : "$25,000")
                .minInvestmentNum(request.getMinInvestmentNum())
                .fundingPurpose(request.getFundingPurpose())
                .problemStatement(request.getProblemStatement())
                .solutionDescription(request.getSolutionDescription())
                .productStage(request.getProductStage())
                .ownerUserId(ownerUserId)
                .version(0L)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        VentureEntity saved = ventureRepository.save(entity);

        // Bind owner membership
        CompanyMembershipEntity ownerMembership = CompanyMembershipEntity.builder()
                .id(UUID.randomUUID())
                .companyId(ventureId)
                .userId(ownerUserId)
                .role(CompanyRole.OWNER)
                .title("Startup Founder")
                .isActive(true)
                .joinedAt(Instant.now())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        membershipRepository.save(ownerMembership);

        auditService.logAction(
                ventureId,
                ownerUserId,
                "VENTURE_REGISTERED",
                null,
                "Created venture " + saved.getName() + " (" + saved.getTicker() + ")",
                null,
                null
        );

        return CompanyResponseDto.fromVenture(saved);
    }

    @Transactional
    public CompanyResponseDto updateCompany(UUID companyId, UpdateCompanyRequestDto request, UUID actorUserId) {
        // Enforce authorization: Actor must be OWNER or ADMIN of this company
        assertIsAdminOrOwner(companyId, actorUserId);

        CompanyEntity company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        // Optimistic locking verification (Scenario 3)
        if (request.getVersion() != null && !company.getVersion().equals(request.getVersion())) {
            throw new ConflictException("Company record has been modified by another concurrent transaction. Please refresh and retry.");
        }

        String prevState = "CEO: " + company.getCeo() + ", HQ: " + company.getHeadquarters() + ", Desc: " + company.getDescription();

        // Update allowlisted fields strictly
        if (request.getShortName() != null) company.setShortName(request.getShortName());
        if (request.getHeadquarters() != null) company.setHeadquarters(request.getHeadquarters());
        if (request.getEmployees() != null) company.setEmployees(request.getEmployees());
        if (request.getCeo() != null) company.setCeo(request.getCeo());
        if (request.getDescription() != null) company.setDescription(request.getDescription());
        if (request.getLogoColor() != null) company.setLogoColor(request.getLogoColor());

        try {
            CompanyEntity updated = companyRepository.saveAndFlush(company);
            String newState = "CEO: " + updated.getCeo() + ", HQ: " + updated.getHeadquarters() + ", Desc: " + updated.getDescription();
            auditService.logAction(companyId, actorUserId, "COMPANY_UPDATED", prevState, newState, null, null);
            return CompanyResponseDto.fromEntity(updated);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("Concurrent modification conflict detected for company: " + companyId);
        }
    }

    @Transactional(readOnly = true)
    public CompanyResponseDto getCompanyById(UUID id) {
        return companyRepository.findById(id)
                .map(CompanyResponseDto::fromEntity)
                .or(() -> ventureRepository.findById(id).map(CompanyResponseDto::fromVenture))
                .orElseThrow(() -> new ResourceNotFoundException("Company or Venture not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public CompanyResponseDto getCompanyByTicker(String ticker) {
        return companyRepository.findByTicker(ticker.toUpperCase())
                .map(CompanyResponseDto::fromEntity)
                .or(() -> ventureRepository.findByTicker(ticker.toUpperCase()).map(CompanyResponseDto::fromVenture))
                .orElseThrow(() -> new ResourceNotFoundException("Company or Venture not found with ticker: " + ticker));
    }

    @Transactional(readOnly = true)
    public Page<CompanyResponseDto> searchCompanies(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return companyRepository.findAll(pageable).map(CompanyResponseDto::fromEntity);
        }
        return companyRepository.searchCompanies(query, pageable).map(CompanyResponseDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<CompanyResponseDto> getCompaniesOwnedByUser(UUID userId) {
        List<CompanyResponseDto> companies = companyRepository.findAllByOwnerUserId(userId)
                .stream().map(CompanyResponseDto::fromEntity).toList();
        List<CompanyResponseDto> ventures = ventureRepository.findAllByOwnerUserId(userId)
                .stream().map(CompanyResponseDto::fromVenture).toList();

        return java.util.stream.Stream.concat(companies.stream(), ventures.stream()).toList();
    }

    @Transactional(readOnly = true)
    public boolean checkTickerAvailability(String ticker) {
        return !companyRepository.existsByTicker(ticker.toUpperCase()) &&
               !ventureRepository.existsByTicker(ticker.toUpperCase());
    }

    public void assertIsAdminOrOwner(UUID companyId, UUID userId) {
        boolean authorized = membershipRepository.hasAnyRole(
                companyId,
                userId,
                List.of(CompanyRole.OWNER, CompanyRole.ADMIN)
        );
        if (!authorized) {
            // Check direct ownership fallback
            boolean isOwner = companyRepository.findById(companyId)
                    .map(c -> userId.equals(c.getOwnerUserId()))
                    .orElseGet(() -> ventureRepository.findById(companyId)
                            .map(v -> userId.equals(v.getOwnerUserId()))
                            .orElse(false));
            if (!isOwner) {
                throw new ForbiddenException("You do not have administrative privileges for company " + companyId);
            }
        }
    }
}
