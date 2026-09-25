package com.whitequantex.explore.service;

import com.whitequantex.common.PagedResponse;
import com.whitequantex.explore.dto.*;
import com.whitequantex.explore.entity.*;
import com.whitequantex.explore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExploreServiceImpl implements ExploreService {

    private final CompanyRepository companyRepository;
    private final CompanyMarketMetricRepository metricRepository;
    private final CorporatePositionRepository positionRepository;
    private final CorporateOrderRepository orderRepository;
    private final CorporateNewsRepository newsRepository;
    private final UpcomingCompanyRepository upcomingCompanyRepository;
    private final WqRecommendationRepository wqRecommendationRepository;
    private final MutualSchemeRepository mutualSchemeRepository;
    private final UserRecentlyViewedRepository userRecentlyViewedRepository;

    @Override
    public ExploreOverviewDto getExploreOverview() {
        return getExploreOverview(null);
    }

    @Override
    public ExploreOverviewDto getExploreOverview(UUID userId) {
        List<CategoryCompanyDto> gainers = metricRepository.findTopGainers().stream()
                .map(m -> mapToCategoryDto(m, m.getRankGainer(), "% MCap", m.getMarketCapGainLoss(), m.getChange24h()))
                .collect(Collectors.toList());

        List<CategoryCompanyDto> losers = metricRepository.findTopLosers().stream()
                .map(m -> mapToCategoryDto(m, m.getRankLoser(), "% MCap", m.getMarketCapGainLoss(), m.getChange24h()))
                .collect(Collectors.toList());

        List<CategoryCompanyDto> mostInvested = metricRepository.findMostInvested().stream()
                .map(m -> mapToCategoryDto(m, m.getRankMostInvested(), "Inflow", m.getInvestedToday(), m.getChange24h()))
                .collect(Collectors.toList());

        List<CategoryCompanyDto> leastInvested = metricRepository.findLeastInvested().stream()
                .map(m -> mapToCategoryDto(m, m.getRankLeastInvested(), "Inflow", m.getInvestedToday(), m.getChange24h()))
                .collect(Collectors.toList());

        List<CategoryCompanyDto> mostActive = metricRepository.findMostActive().stream()
                .map(m -> mapToCategoryDto(m, m.getRankMostActive(), "Volume", m.getTradingVolumeToday(), m.getChange24h()))
                .collect(Collectors.toList());

        List<CategoryCompanyDto> highs = metricRepository.find52wHighs().stream()
                .map(m -> mapToCategoryDto(m, m.getRank52wHigh(), "Momentum", m.getChange24h(), m.getChange24h()))
                .collect(Collectors.toList());

        List<CategoryCompanyDto> viewed;
        if (userId != null) {
            List<UserRecentlyViewedEntity> userViews = userRecentlyViewedRepository.findByUserIdOrderByViewedAtDesc(userId);
            int rank = 1;
            viewed = new java.util.ArrayList<>();
            for (UserRecentlyViewedEntity uv : userViews) {
                if (rank > 8) break;
                viewed.add(mapCompanyToCategoryDto(uv.getCompany(), rank++));
            }
        } else {
            viewed = metricRepository.findRecentlyViewed().stream()
                    .map(m -> mapToCategoryDto(m, m.getRankRecentlyViewed(), "Return", m.getChange24h(), m.getChange24h()))
                    .collect(Collectors.toList());
        }

        List<CompanySummaryDto> recentlyAdded = companyRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .limit(10)
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());

        List<UpcomingCompanyDto> upcoming = getUpcomingCompanies();
        List<WqRecommendationDto> recommendations = getWqRecommendations();
        List<MutualSchemeDto> schemes = getMutualInvestmentSchemes();

        long count = companyRepository.count();

        return ExploreOverviewDto.builder()
                .todaysTopGainers(gainers)
                .todaysTopLosers(losers)
                .todaysMostInvested(mostInvested)
                .todaysLeastInvested(leastInvested)
                .todaysMostActive(mostActive)
                .todays52wHighs(highs)
                .recentlyViewed(viewed)
                .recentlyAdded(recentlyAdded)
                .upcomingCompanies(upcoming)
                .wqRecommendations(recommendations)
                .mutualInvestmentSchemes(schemes)
                .totalRegisteredCompanies(count)
                .build();
    }

    private CategoryCompanyDto mapCompanyToCategoryDto(CompanyEntity c, Integer rank) {
        CompanyMarketMetricEntity m = metricRepository.findByCompanyId(c.getId()).orElse(null);
        String change = m != null && m.getChange24h() != null ? m.getChange24h() : "+0.0%";
        boolean isPositive = m != null ? Boolean.TRUE.equals(m.getIsPositive()) : true;
        String logoText = c.getShortName() != null && c.getShortName().length() >= 2
                ? c.getShortName().substring(0, 2).toUpperCase()
                : c.getTicker().substring(0, Math.min(2, c.getTicker().length()));
        return CategoryCompanyDto.builder()
                .id(c.getId())
                .name(c.getName())
                .shortName(c.getShortName() != null ? c.getShortName() : c.getName())
                .ticker(c.getTicker())
                .logoText(logoText)
                .logoBg(c.getLogoColor())
                .sector(c.getSector())
                .rank(rank)
                .metricLabel("Return")
                .metricValue(change)
                .change(change)
                .isPositive(isPositive)
                .valuation(c.getValuation())
                .cik(c.getCik())
                .build();
    }

    @Override
    public PagedResponse<CompanySummaryDto> searchCompanies(
            String query,
            String sector,
            String tier,
            BigDecimal minValuation,
            BigDecimal maxValuation,
            String letter,
            String sortBy,
            String sortDirection,
            int page,
            int size
    ) {
        String sortField = "name";
        if ("valuation".equalsIgnoreCase(sortBy)) {
            sortField = "valuationNum";
        } else if ("founded".equalsIgnoreCase(sortBy)) {
            sortField = "foundedYear";
        } else if ("employees".equalsIgnoreCase(sortBy)) {
            sortField = "employees";
        } else if ("revenue".equalsIgnoreCase(sortBy)) {
            sortField = "annualRevenueNum";
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortField);
        PageRequest pageRequest = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);

        Page<CompanyEntity> companyPage = companyRepository.searchCompanies(
                query,
                sector,
                tier,
                minValuation,
                maxValuation,
                letter,
                pageRequest
        );

        List<CompanySummaryDto> dtos = companyPage.getContent().stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());

        return PagedResponse.<CompanySummaryDto>builder()
                .content(dtos)
                .number(companyPage.getNumber())
                .size(companyPage.getSize())
                .totalElements(companyPage.getTotalElements())
                .totalPages(companyPage.getTotalPages())
                .first(companyPage.isFirst())
                .last(companyPage.isLast())
                .build();
    }

    @Override
    public CompanySummaryDto getCompanyById(UUID id) {
        return companyRepository.findById(id)
                .map(this::mapToSummaryDto)
                .orElse(null);
    }

    @Override
    public CompanySummaryDto getCompanyByTicker(String ticker) {
        return companyRepository.findByTickerIgnoreCase(ticker)
                .map(this::mapToSummaryDto)
                .orElse(null);
    }

    @Override
    public List<CorporatePositionDto> getPositions() {
        return getPositions(null);
    }

    @Override
    public List<CorporatePositionDto> getPositions(UUID userId) {
        List<CorporatePositionEntity> positions;
        if (userId != null) {
            positions = positionRepository.findByUserId(userId);
        } else {
            positions = List.of();
        }

        return positions.stream()
                .map(p -> CorporatePositionDto.builder()
                        .id(p.getId())
                        .companyId(p.getCompany().getId())
                        .companyName(p.getCompany().getName())
                        .ticker(p.getCompany().getTicker())
                        .logoColor(p.getCompany().getLogoColor())
                        .sector(p.getCompany().getSector())
                        .shares(p.getShares())
                        .shareClass(p.getShareClass())
                        .costBasis(p.getCostBasis())
                        .currentValue(p.getCurrentValue())
                        .unrealizedPl(p.getUnrealizedPl())
                        .unrealizedPlPercent(p.getUnrealizedPlPercent())
                        .ownershipPercent(p.getOwnershipPercent())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<CorporateOrderDto> getOrders(String status) {
        return getOrders(null, status);
    }

    @Override
    public List<CorporateOrderDto> getOrders(UUID userId, String status) {
        List<CorporateOrderEntity> orders;
        if (userId != null) {
            if (status == null || "ALL".equalsIgnoreCase(status)) {
                orders = orderRepository.findByUserId(userId);
            } else {
                orders = orderRepository.findByUserIdAndStatus(userId, status.toUpperCase());
            }
        } else {
            orders = List.of();
        }

        return orders.stream()
                .map(o -> CorporateOrderDto.builder()
                        .id(o.getId())
                        .companyId(o.getCompany().getId())
                        .companyName(o.getCompany().getName())
                        .ticker(o.getCompany().getTicker())
                        .logoColor(o.getCompany().getLogoColor())
                        .orderNumber(o.getOrderNumber())
                        .type(o.getType())
                        .shareClass(o.getShareClass())
                        .shares(o.getShares())
                        .pricePerShare(o.getPricePerShare())
                        .totalAmount(o.getTotalAmount())
                        .status(o.getStatus())
                        .settlementStatus(o.getSettlementStatus())
                        .executedAt(o.getExecutedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void recordRecentlyViewed(UUID userId, String tickerOrId) {
        if (userId == null || tickerOrId == null || tickerOrId.isBlank()) {
            return;
        }

        CompanyEntity company = companyRepository.findByTickerIgnoreCase(tickerOrId.trim())
                .orElseGet(() -> {
                    try {
                        return companyRepository.findById(UUID.fromString(tickerOrId.trim())).orElse(null);
                    } catch (Exception e) {
                        return null;
                    }
                });

        if (company == null) {
            return;
        }

        UserRecentlyViewedEntity existing = userRecentlyViewedRepository.findByUserIdAndCompanyId(userId, company.getId())
                .orElse(null);

        if (existing != null) {
            existing.setViewedAt(java.time.Instant.now());
            userRecentlyViewedRepository.save(existing);
        } else {
            UserRecentlyViewedEntity newView = UserRecentlyViewedEntity.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .company(company)
                    .viewedAt(java.time.Instant.now())
                    .build();
            userRecentlyViewedRepository.save(newView);
        }
    }

    @Override
    public List<CorporateNewsDto> getNews(String ticker, String category) {
        List<CorporateNewsEntity> newsList;
        if ((ticker == null || "ALL".equalsIgnoreCase(ticker)) && (category == null || "ALL".equalsIgnoreCase(category))) {
            newsList = newsRepository.findAllNews();
        } else {
            newsList = newsRepository.findByFilters(ticker, category);
        }

        return newsList.stream()
                .map(n -> CorporateNewsDto.builder()
                        .id(n.getId())
                        .companyId(n.getCompany().getId())
                        .companyName(n.getCompany().getName())
                        .ticker(n.getCompany().getTicker())
                        .logoColor(n.getCompany().getLogoColor())
                        .category(n.getCategory())
                        .title(n.getTitle())
                        .snippet(n.getSnippet())
                        .sentiment(n.getSentiment())
                        .impactMetric(n.getImpactMetric())
                        .source(n.getSource())
                        .readTime(n.getReadTime())
                        .urgency(n.getUrgency())
                        .dueDate(n.getDueDate())
                        .isActionRequired(n.getIsActionRequired())
                        .actionLabel(n.getActionLabel())
                        .actionType(n.getActionType())
                        .publishedAt(n.getPublishedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<UpcomingCompanyDto> getUpcomingCompanies() {
        return upcomingCompanyRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToUpcomingDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<WqRecommendationDto> getWqRecommendations() {
        return wqRecommendationRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToRecommendationDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MutualSchemeDto> getMutualInvestmentSchemes() {
        return mutualSchemeRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToMutualSchemeDto)
                .collect(Collectors.toList());
    }

    @Override
    public MutualSchemeDto getMutualSchemeByCode(String code) {
        return mutualSchemeRepository.findByCodeIgnoreCase(code)
                .map(this::mapToMutualSchemeDto)
                .orElse(null);
    }

    @Override
    public MutualSchemeDto getMutualSchemeById(UUID id) {
        return mutualSchemeRepository.findById(id)
                .map(this::mapToMutualSchemeDto)
                .orElse(null);
    }

    private UpcomingCompanyDto mapToUpcomingDto(UpcomingCompanyEntity e) {
        return UpcomingCompanyDto.builder()
                .id(e.getId())
                .ticker(e.getTicker())
                .name(e.getName())
                .shortName(e.getShortName())
                .sector(e.getSector())
                .targetValuation(e.getTargetValuation())
                .expectedDate(e.getExpectedDate())
                .readiness(e.getReadiness())
                .trustScore(e.getTrustScore())
                .description(e.getDescription())
                .logoBg(e.getLogoBg())
                .legalEntity(e.getLegalEntity())
                .headquarters(e.getHeadquarters())
                .ceo(e.getCeo())
                .displayOrder(e.getDisplayOrder())
                .build();
    }

    private WqRecommendationDto mapToRecommendationDto(WqRecommendationEntity e) {
        return WqRecommendationDto.builder()
                .id(e.getId())
                .ticker(e.getTicker())
                .name(e.getName())
                .shortName(e.getShortName())
                .sector(e.getSector())
                .rating(e.getRating())
                .upside(e.getUpside())
                .quantScore(e.getQuantScore())
                .valuation(e.getValuation())
                .annualRevenue(e.getAnnualRevenue())
                .thesis(e.getThesis())
                .logoBg(e.getLogoBg())
                .legalEntity(e.getLegalEntity())
                .cik(e.getCik())
                .ceo(e.getCeo())
                .displayOrder(e.getDisplayOrder())
                .build();
    }

    private MutualSchemeDto mapToMutualSchemeDto(MutualSchemeEntity e) {
        return MutualSchemeDto.builder()
                .id(e.getId())
                .code(e.getCode())
                .name(e.getName())
                .strategy(e.getStrategy())
                .nav(e.getNav())
                .oneYearReturn(e.getOneYearReturn())
                .minInvestment(e.getMinInvestment())
                .aum(e.getAum())
                .riskLevel(e.getRiskLevel())
                .manager(e.getManager())
                .topHoldings(parseTopHoldings(e.getTopHoldings()))
                .description(e.getDescription())
                .benchmark(e.getBenchmark())
                .expenseRatio(e.getExpenseRatio())
                .displayOrder(e.getDisplayOrder())
                .build();
    }

    private List<String> parseTopHoldings(String topHoldings) {
        if (topHoldings == null || topHoldings.isBlank()) {
            return List.of();
        }
        String cleaned = topHoldings.trim();
        if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
            cleaned = cleaned.substring(1, cleaned.length() - 1);
        }
        return Arrays.stream(cleaned.split(","))
                .map(s -> s.trim().replaceAll("^\"|\"$", "").replaceAll("^'|'$", ""))
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());
    }

    private CompanySummaryDto mapToSummaryDto(CompanyEntity c) {
        CompanySummaryDto.CompanySummaryDtoBuilder builder = CompanySummaryDto.builder()
                .id(c.getId())
                .ticker(c.getTicker())
                .name(c.getName())
                .shortName(c.getShortName())
                .legalEntity(c.getLegalEntity())
                .cik(c.getCik())
                .sector(c.getSector())
                .subIndustry(c.getSubIndustry())
                .headquarters(c.getHeadquarters())
                .region(c.getRegion())
                .foundedYear(c.getFoundedYear())
                .ceo(c.getCeo())
                .employees(c.getEmployees())
                .valuation(c.getValuation())
                .valuationNum(c.getValuationNum())
                .annualRevenue(c.getAnnualRevenue())
                .annualRevenueNum(c.getAnnualRevenueNum())
                .verificationLevel(c.getVerificationLevel())
                .trustScore(c.getTrustScore())
                .description(c.getDescription())
                .logoColor(c.getLogoColor())
                .status(c.getStatus())
                .exchangeTier(c.getExchangeTier());

        if (c.getMarketMetric() != null) {
            CompanyMarketMetricEntity m = c.getMarketMetric();
            builder.change24h(m.getChange24h())
                   .changePercent(m.getChangePercent())
                   .isPositive(m.getIsPositive())
                   .marketCapGainLoss(m.getMarketCapGainLoss())
                   .investedToday(m.getInvestedToday())
                   .allocationPercent(m.getAllocationPercent())
                   .tradingVolumeToday(m.getTradingVolumeToday());
        }

        return builder.build();
    }

    private CategoryCompanyDto mapToCategoryDto(
            CompanyMarketMetricEntity m,
            Integer rank,
            String metricLabel,
            String metricValue,
            String change
    ) {
        CompanyEntity c = m.getCompany();
        String logoText = c.getShortName() != null && c.getShortName().length() >= 2
                ? c.getShortName().substring(0, 2).toUpperCase()
                : c.getTicker().substring(0, Math.min(2, c.getTicker().length()));

        return CategoryCompanyDto.builder()
                .id(c.getId())
                .rank(rank)
                .name(c.getName())
                .shortName(c.getShortName())
                .ticker(c.getTicker())
                .logoText(logoText)
                .logoBg(c.getLogoColor())
                .sector(c.getSector())
                .metricLabel(metricLabel)
                .metricValue(metricValue)
                .change(change)
                .isPositive(m.getIsPositive())
                .valuation(c.getValuation())
                .investedToday(m.getInvestedToday())
                .percentFunded(m.getAllocationPercent())
                .volume(m.getTradingVolumeToday())
                .cik(c.getCik())
                .build();
    }
}
