package com.whitequantex.explore.service;

import com.whitequantex.common.PagedResponse;
import com.whitequantex.explore.dto.*;
import com.whitequantex.explore.entity.*;
import com.whitequantex.explore.repository.*;
import com.whitequantex.market.dto.LiveStockQuoteDto;
import com.whitequantex.market.service.MarketPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final VentureRepository ventureRepository;
    private final VentureMarketMetricRepository ventureMetricRepository;
    private final MarketPriceService marketPriceService;

    @Override
    public ExploreOverviewDto getExploreOverview() {
        return getExploreOverview(null);
    }

    @Override
    public ExploreOverviewDto getExploreOverview(UUID userId) {
        List<CompanyEntity> allCompanies = companyRepository.findAll();

        List<CategoryCompanyDto> gainers = allCompanies.stream()
                .filter(c -> c.getTicker() != null && marketPriceService.getQuote(c.getTicker()) != null)
                .sorted((a, b) -> {
                    LiveStockQuoteDto qA = marketPriceService.getQuote(a.getTicker());
                    LiveStockQuoteDto qB = marketPriceService.getQuote(b.getTicker());
                    return qB.getChangePercent().compareTo(qA.getChangePercent());
                })
                .limit(5)
                .map(c -> {
                    LiveStockQuoteDto q = marketPriceService.getQuote(c.getTicker());
                    return CategoryCompanyDto.builder()
                            .id(c.getId())
                            .ticker(c.getTicker())
                            .name(c.getName())
                            .shortName(c.getShortName() != null ? c.getShortName() : c.getName())
                            .sector(c.getSector())
                            .valuation(c.getValuation())
                            .change(q.getChangePercentStr())
                            .isPositive(q.getIsPositive())
                            .logoBg(c.getLogoColor() != null ? c.getLogoColor() : "bg-emerald-600")
                            .logoText(c.getShortName() != null && c.getShortName().length() >= 2 ? c.getShortName().substring(0, 2).toUpperCase() : c.getTicker().substring(0, Math.min(2, c.getTicker().length())))
                            .metricLabel("% MCap")
                            .metricValue("+$" + q.getChangeAmount().abs().toPlainString() + "M")
                            .build();
                })
                .collect(Collectors.toList());

        List<CategoryCompanyDto> losers = allCompanies.stream()
                .filter(c -> c.getTicker() != null && marketPriceService.getQuote(c.getTicker()) != null)
                .sorted((a, b) -> {
                    LiveStockQuoteDto qA = marketPriceService.getQuote(a.getTicker());
                    LiveStockQuoteDto qB = marketPriceService.getQuote(b.getTicker());
                    return qA.getChangePercent().compareTo(qB.getChangePercent());
                })
                .limit(5)
                .map(c -> {
                    LiveStockQuoteDto q = marketPriceService.getQuote(c.getTicker());
                    return CategoryCompanyDto.builder()
                            .id(c.getId())
                            .ticker(c.getTicker())
                            .name(c.getName())
                            .shortName(c.getShortName() != null ? c.getShortName() : c.getName())
                            .sector(c.getSector())
                            .valuation(c.getValuation())
                            .change(q.getChangePercentStr())
                            .isPositive(q.getIsPositive())
                            .logoBg(c.getLogoColor() != null ? c.getLogoColor() : "bg-rose-600")
                            .logoText(c.getShortName() != null && c.getShortName().length() >= 2 ? c.getShortName().substring(0, 2).toUpperCase() : c.getTicker().substring(0, Math.min(2, c.getTicker().length())))
                            .metricLabel("% MCap")
                            .metricValue("-$" + q.getChangeAmount().abs().toPlainString() + "M")
                            .build();
                })
                .collect(Collectors.toList());

        List<CategoryCompanyDto> mostInvested = metricRepository.findMostInvested().stream()
                .limit(5)
                .map(m -> mapToCategoryDto(m, m.getRankMostInvested(), "Inflow", m.getInvestedToday(), m.getChange24h()))
                .collect(Collectors.toList());

        List<CategoryCompanyDto> leastInvested = metricRepository.findLeastInvested().stream()
                .limit(5)
                .map(m -> mapToCategoryDto(m, m.getRankLeastInvested(), "Inflow", m.getInvestedToday(), m.getChange24h()))
                .collect(Collectors.toList());

        List<CategoryCompanyDto> mostActive = allCompanies.stream()
                .filter(c -> c.getTicker() != null && marketPriceService.getQuote(c.getTicker()) != null)
                .sorted((a, b) -> {
                    LiveStockQuoteDto qA = marketPriceService.getQuote(a.getTicker());
                    LiveStockQuoteDto qB = marketPriceService.getQuote(b.getTicker());
                    long volB = qB.getVolumeShares() != null ? qB.getVolumeShares() : 0L;
                    long volA = qA.getVolumeShares() != null ? qA.getVolumeShares() : 0L;
                    return Long.compare(volB, volA);
                })
                .limit(5)
                .map(c -> {
                    LiveStockQuoteDto q = marketPriceService.getQuote(c.getTicker());
                    return CategoryCompanyDto.builder()
                            .id(c.getId())
                            .ticker(c.getTicker())
                            .name(c.getName())
                            .shortName(c.getShortName() != null ? c.getShortName() : c.getName())
                            .sector(c.getSector())
                            .valuation(c.getValuation())
                            .change(q.getChangePercentStr())
                            .isPositive(q.getIsPositive())
                            .logoBg(c.getLogoColor() != null ? c.getLogoColor() : "bg-indigo-600")
                            .logoText(c.getShortName() != null && c.getShortName().length() >= 2 ? c.getShortName().substring(0, 2).toUpperCase() : c.getTicker().substring(0, Math.min(2, c.getTicker().length())))
                            .metricLabel("Volume")
                            .metricValue(q.getVolumeStr() != null ? q.getVolumeStr() : "125,000")
                            .build();
                })
                .collect(Collectors.toList());

        List<CategoryCompanyDto> highs = metricRepository.find52wHighs().stream()
                .limit(5)
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
                    .limit(8)
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
        BigDecimal sumVal = companyRepository.sumTotalValuation();
        if (sumVal == null) sumVal = BigDecimal.ZERO;
        String formattedValuation = formatValuation(sumVal);

        Long cCorps = companyRepository.countCCorps();
        long cCorpsCount = cCorps != null ? cCorps : 0L;
        int legalPct = count > 0 ? (int) Math.round((cCorpsCount * 100.0) / count) : 100;
        String legalEntitiesRatio = legalPct + "% C-Corp / Inc";

        Double avgTrust = companyRepository.averageTrustScore();
        double avgTrustScore = avgTrust != null ? avgTrust : 90.0;
        String formattedTrust = String.format(java.util.Locale.US, "%.1f / 100", avgTrustScore);

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
                .aggregateValuation(formattedValuation)
                .aggregateValuationNum(sumVal)
                .legalEntitiesRatio(legalEntitiesRatio)
                .averageTrustScore(formattedTrust)
                .averageTrustScoreNum(avgTrustScore)
                .build();
    }

    private String formatValuation(BigDecimal valuation) {
        if (valuation == null || valuation.compareTo(BigDecimal.ZERO) == 0) {
            return "$0.00";
        }
        double val = valuation.doubleValue();
        if (val >= 1_000_000_000_000.0) {
            return String.format(java.util.Locale.US, "$%.2f Trillion", val / 1_000_000_000_000.0);
        } else if (val >= 1_000_000_000.0) {
            return String.format(java.util.Locale.US, "$%.2f Billion", val / 1_000_000_000.0);
        } else if (val >= 1_000_000.0) {
            return String.format(java.util.Locale.US, "$%.2f Million", val / 1_000_000.0);
        } else {
            return String.format(java.util.Locale.US, "$%,.0f", val);
        }
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
        CompanySummaryDto company = companyRepository.findById(id)
                .map(this::mapToSummaryDto)
                .orElse(null);
        if (company != null) {
            return company;
        }
        return getVentureById(id);
    }

    @Override
    public CompanySummaryDto getCompanyByTicker(String ticker) {
        CompanySummaryDto company = companyRepository.findByTickerIgnoreCase(ticker)
                .map(this::mapToSummaryDto)
                .orElse(null);
        if (company != null) {
            return company;
        }
        return getVentureByTicker(ticker);
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
                .map(p -> {
                    BigDecimal shares = BigDecimal.valueOf(p.getShares() != null ? p.getShares() : 0);
                    BigDecimal costBasis = p.getCostBasis() != null ? p.getCostBasis() : BigDecimal.ZERO;
                    String ticker = p.getCompany() != null ? p.getCompany().getTicker() : null;
                    LiveStockQuoteDto liveQuote = ticker != null ? marketPriceService.getQuote(ticker) : null;

                    BigDecimal currentPrice = liveQuote != null
                            ? liveQuote.getPrice()
                            : (p.getShares() != null && p.getShares() > 0 && p.getCurrentValue() != null
                            ? p.getCurrentValue().divide(shares, 2, RoundingMode.HALF_UP)
                            : BigDecimal.valueOf(100));

                    BigDecimal currentValue = shares.multiply(currentPrice).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal unrealizedPl = currentValue.subtract(costBasis);
                    BigDecimal unrealizedPlPercent = costBasis.compareTo(BigDecimal.ZERO) > 0
                            ? unrealizedPl.multiply(BigDecimal.valueOf(100)).divide(costBasis, 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;

                    return CorporatePositionDto.builder()
                            .id(p.getId())
                            .companyId(p.getCompany().getId())
                            .companyName(p.getCompany().getName())
                            .ticker(p.getCompany().getTicker())
                            .logoColor(p.getCompany().getLogoColor())
                            .sector(p.getCompany().getSector())
                            .shares(p.getShares())
                            .shareClass(p.getShareClass())
                            .costBasis(costBasis)
                            .currentValue(currentValue)
                            .unrealizedPl(unrealizedPl)
                            .unrealizedPlPercent(unrealizedPlPercent)
                            .ownershipPercent(p.getOwnershipPercent())
                            .build();
                })
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

        LiveStockQuoteDto liveQuote = c.getTicker() != null ? marketPriceService.getQuote(c.getTicker()) : null;
        if (liveQuote != null) {
            builder.change24h(liveQuote.getChangePercentStr())
                   .changePercent(liveQuote.getChangePercent())
                   .isPositive(liveQuote.getIsPositive())
                   .tradingVolumeToday(liveQuote.getVolumeStr());
        } else if (c.getMarketMetric() != null) {
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

        LiveStockQuoteDto liveQuote = c.getTicker() != null ? marketPriceService.getQuote(c.getTicker()) : null;
        String effectiveChange = liveQuote != null ? liveQuote.getChangePercentStr() : change;
        Boolean effectiveIsPositive = liveQuote != null ? liveQuote.getIsPositive() : (m.getIsPositive() != null ? m.getIsPositive() : true);

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
                .change(effectiveChange)
                .isPositive(effectiveIsPositive)
                .valuation(c.getValuation())
                .investedToday(m.getInvestedToday())
                .percentFunded(m.getAllocationPercent())
                .volume(liveQuote != null ? liveQuote.getVolumeStr() : m.getTradingVolumeToday())
                .cik(c.getCik())
                .build();
    }

    @Override
    public ExploreOverviewDto getVenturesOverview() {
        return getVenturesOverview(null);
    }

    @Override
    public ExploreOverviewDto getVenturesOverview(UUID userId) {
        List<VentureEntity> allVentures = ventureRepository.findAll();

        List<CategoryCompanyDto> gainers = allVentures.stream()
                .filter(v -> v.getTicker() != null && marketPriceService.getQuote(v.getTicker()) != null)
                .sorted((a, b) -> {
                    LiveStockQuoteDto qA = marketPriceService.getQuote(a.getTicker());
                    LiveStockQuoteDto qB = marketPriceService.getQuote(b.getTicker());
                    return qB.getChangePercent().compareTo(qA.getChangePercent());
                })
                .limit(5)
                .map(v -> {
                    LiveStockQuoteDto q = marketPriceService.getQuote(v.getTicker());
                    return CategoryCompanyDto.builder()
                            .id(v.getId())
                            .ticker(v.getTicker())
                            .name(v.getName())
                            .shortName(v.getShortName() != null ? v.getShortName() : v.getName())
                            .sector(v.getSector())
                            .valuation(v.getValuation())
                            .change(q.getChangePercentStr())
                            .isPositive(q.getIsPositive())
                            .logoBg(v.getLogoColor() != null ? v.getLogoColor() : "bg-purple-600")
                            .logoText(v.getShortName() != null && v.getShortName().length() >= 2 ? v.getShortName().substring(0, 2).toUpperCase() : v.getTicker().substring(0, Math.min(2, v.getTicker().length())))
                            .metricLabel("% MCap")
                            .metricValue("+$" + q.getChangeAmount().abs().toPlainString() + "M")
                            .build();
                })
                .collect(Collectors.toList());

        List<CategoryCompanyDto> losers = allVentures.stream()
                .filter(v -> v.getTicker() != null && marketPriceService.getQuote(v.getTicker()) != null)
                .sorted((a, b) -> {
                    LiveStockQuoteDto qA = marketPriceService.getQuote(a.getTicker());
                    LiveStockQuoteDto qB = marketPriceService.getQuote(b.getTicker());
                    return qA.getChangePercent().compareTo(qB.getChangePercent());
                })
                .limit(5)
                .map(v -> {
                    LiveStockQuoteDto q = marketPriceService.getQuote(v.getTicker());
                    return CategoryCompanyDto.builder()
                            .id(v.getId())
                            .ticker(v.getTicker())
                            .name(v.getName())
                            .shortName(v.getShortName() != null ? v.getShortName() : v.getName())
                            .sector(v.getSector())
                            .valuation(v.getValuation())
                            .change(q.getChangePercentStr())
                            .isPositive(q.getIsPositive())
                            .logoBg(v.getLogoColor() != null ? v.getLogoColor() : "bg-rose-600")
                            .logoText(v.getShortName() != null && v.getShortName().length() >= 2 ? v.getShortName().substring(0, 2).toUpperCase() : v.getTicker().substring(0, Math.min(2, v.getTicker().length())))
                            .metricLabel("% MCap")
                            .metricValue("-$" + q.getChangeAmount().abs().toPlainString() + "M")
                            .build();
                })
                .collect(Collectors.toList());

        List<CategoryCompanyDto> mostInvested = ventureMetricRepository.findMostInvested().stream()
                .limit(5)
                .map(m -> mapVentureMetricToCategoryDto(m, m.getRankMostInvested(), "Inflow", m.getInvestedToday(), m.getChange24h()))
                .collect(Collectors.toList());

        List<CategoryCompanyDto> leastInvested = ventureMetricRepository.findLeastInvested().stream()
                .limit(5)
                .map(m -> mapVentureMetricToCategoryDto(m, m.getRankLeastInvested(), "Inflow", m.getInvestedToday(), m.getChange24h()))
                .collect(Collectors.toList());

        List<CategoryCompanyDto> mostActive = allVentures.stream()
                .filter(v -> v.getTicker() != null && marketPriceService.getQuote(v.getTicker()) != null)
                .sorted((a, b) -> {
                    LiveStockQuoteDto qA = marketPriceService.getQuote(a.getTicker());
                    LiveStockQuoteDto qB = marketPriceService.getQuote(b.getTicker());
                    long volB = qB.getVolumeShares() != null ? qB.getVolumeShares() : 0L;
                    long volA = qA.getVolumeShares() != null ? qA.getVolumeShares() : 0L;
                    return Long.compare(volB, volA);
                })
                .limit(5)
                .map(v -> {
                    LiveStockQuoteDto q = marketPriceService.getQuote(v.getTicker());
                    return CategoryCompanyDto.builder()
                            .id(v.getId())
                            .ticker(v.getTicker())
                            .name(v.getName())
                            .shortName(v.getShortName() != null ? v.getShortName() : v.getName())
                            .sector(v.getSector())
                            .valuation(v.getValuation())
                            .change(q.getChangePercentStr())
                            .isPositive(q.getIsPositive())
                            .logoBg(v.getLogoColor() != null ? v.getLogoColor() : "bg-indigo-600")
                            .logoText(v.getShortName() != null && v.getShortName().length() >= 2 ? v.getShortName().substring(0, 2).toUpperCase() : v.getTicker().substring(0, Math.min(2, v.getTicker().length())))
                            .metricLabel("Volume")
                            .metricValue(q.getVolumeStr() != null ? q.getVolumeStr() : "110,000")
                            .build();
                })
                .collect(Collectors.toList());

        List<CategoryCompanyDto> highs = ventureMetricRepository.find52wHighs().stream()
                .limit(5)
                .map(m -> mapVentureMetricToCategoryDto(m, m.getRank52wHigh(), "Momentum", m.getChange24h(), m.getChange24h()))
                .collect(Collectors.toList());

        List<CategoryCompanyDto> viewed = ventureMetricRepository.findRecentlyViewed().stream()
                .limit(8)
                .map(m -> mapVentureMetricToCategoryDto(m, m.getRankRecentlyViewed(), "Return", m.getChange24h(), m.getChange24h()))
                .collect(Collectors.toList());

        List<CompanySummaryDto> recentlyAdded = ventureRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .limit(10)
                .map(this::mapVentureToSummaryDto)
                .collect(Collectors.toList());

        long count = ventureRepository.count();
        BigDecimal sumVal = ventureRepository.sumTotalValuation();
        if (sumVal == null) sumVal = BigDecimal.ZERO;
        String formattedValuation = formatValuation(sumVal);

        Long cCorps = ventureRepository.countCCorps();
        long cCorpsCount = cCorps != null ? cCorps : 0L;
        int legalPct = count > 0 ? (int) Math.round((cCorpsCount * 100.0) / count) : 100;
        String legalEntitiesRatio = legalPct + "% C-Corp / Inc";

        Double avgTrust = ventureRepository.averageTrustScore();
        double avgTrustScore = avgTrust != null ? avgTrust : 88.0;
        String formattedTrust = String.format(java.util.Locale.US, "%.1f / 100", avgTrustScore);

        return ExploreOverviewDto.builder()
                .todaysTopGainers(gainers)
                .todaysTopLosers(losers)
                .todaysMostInvested(mostInvested)
                .todaysLeastInvested(leastInvested)
                .todaysMostActive(mostActive)
                .todays52wHighs(highs)
                .recentlyViewed(viewed)
                .recentlyAdded(recentlyAdded)
                .upcomingCompanies(List.of())
                .wqRecommendations(List.of())
                .mutualInvestmentSchemes(List.of())
                .totalRegisteredCompanies(count)
                .aggregateValuation(formattedValuation)
                .aggregateValuationNum(sumVal)
                .legalEntitiesRatio(legalEntitiesRatio)
                .averageTrustScore(formattedTrust)
                .averageTrustScoreNum(avgTrustScore)
                .build();
    }

    @Override
    public PagedResponse<CompanySummaryDto> searchVentures(
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
        } else if ("targetRaise".equalsIgnoreCase(sortBy)) {
            sortField = "targetRaiseNum";
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortField);
        PageRequest pageRequest = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);

        Page<VentureEntity> venturePage = ventureRepository.searchVentures(
                query,
                sector,
                tier,
                minValuation,
                maxValuation,
                letter,
                pageRequest
        );

        List<CompanySummaryDto> dtos = venturePage.getContent().stream()
                .map(this::mapVentureToSummaryDto)
                .collect(Collectors.toList());

        return PagedResponse.<CompanySummaryDto>builder()
                .content(dtos)
                .number(venturePage.getNumber())
                .size(venturePage.getSize())
                .totalElements(venturePage.getTotalElements())
                .totalPages(venturePage.getTotalPages())
                .first(venturePage.isFirst())
                .last(venturePage.isLast())
                .build();
    }

    @Override
    public CompanySummaryDto getVentureById(UUID id) {
        return ventureRepository.findById(id)
                .map(this::mapVentureToSummaryDto)
                .orElse(null);
    }

    @Override
    public CompanySummaryDto getVentureByTicker(String ticker) {
        return ventureRepository.findByTickerIgnoreCase(ticker)
                .map(this::mapVentureToSummaryDto)
                .orElse(null);
    }

    private CompanySummaryDto mapVentureToSummaryDto(VentureEntity v) {
        CompanySummaryDto.CompanySummaryDtoBuilder builder = CompanySummaryDto.builder()
                .id(v.getId())
                .ticker(v.getTicker())
                .name(v.getName())
                .shortName(v.getShortName())
                .legalEntity(v.getLegalEntity())
                .cik(v.getCik())
                .sector(v.getSector())
                .subIndustry(v.getSubIndustry())
                .headquarters(v.getHeadquarters())
                .region(v.getRegion())
                .foundedYear(v.getFoundedYear())
                .ceo(v.getCeo())
                .employees(v.getEmployees())
                .valuation(v.getValuation())
                .valuationNum(v.getValuationNum())
                .annualRevenue(v.getAnnualRevenue())
                .annualRevenueNum(v.getAnnualRevenueNum())
                .verificationLevel(v.getVerificationLevel())
                .trustScore(v.getTrustScore())
                .description(v.getDescription())
                .logoColor(v.getLogoColor())
                .status(v.getStatus())
                .exchangeTier(v.getExchangeTier())
                .roundType(v.getRoundType())
                .targetRaise(v.getTargetRaise())
                .targetRaiseNum(v.getTargetRaiseNum())
                .raisedAmount(v.getRaisedAmount())
                .raisedAmountNum(v.getRaisedAmountNum())
                .minInvestment(v.getMinInvestment())
                .minInvestmentNum(v.getMinInvestmentNum())
                .fundingPurpose(v.getFundingPurpose())
                .securityType(v.getSecurityType());

        LiveStockQuoteDto liveQuote = v.getTicker() != null ? marketPriceService.getQuote(v.getTicker()) : null;
        if (liveQuote != null) {
            builder.change24h(liveQuote.getChangePercentStr())
                   .changePercent(liveQuote.getChangePercent())
                   .isPositive(liveQuote.getIsPositive())
                   .tradingVolumeToday(liveQuote.getVolumeStr());
        } else if (v.getMarketMetric() != null) {
            VentureMarketMetricEntity m = v.getMarketMetric();
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

    private CategoryCompanyDto mapVentureMetricToCategoryDto(
            VentureMarketMetricEntity m,
            Integer rank,
            String metricLabel,
            String metricValue,
            String change
    ) {
        VentureEntity v = m.getVenture();
        String logoText = v.getShortName() != null && v.getShortName().length() >= 2
                ? v.getShortName().substring(0, 2).toUpperCase()
                : v.getTicker().substring(0, Math.min(2, v.getTicker().length()));

        LiveStockQuoteDto liveQuote = v.getTicker() != null ? marketPriceService.getQuote(v.getTicker()) : null;
        String effectiveChange = liveQuote != null ? liveQuote.getChangePercentStr() : change;
        Boolean effectiveIsPositive = liveQuote != null ? liveQuote.getIsPositive() : (m.getIsPositive() != null ? m.getIsPositive() : true);

        return CategoryCompanyDto.builder()
                .id(v.getId())
                .rank(rank)
                .name(v.getName())
                .shortName(v.getShortName())
                .ticker(v.getTicker())
                .logoText(logoText)
                .logoBg(v.getLogoColor())
                .sector(v.getSector())
                .metricLabel(metricLabel)
                .metricValue(metricValue)
                .change(effectiveChange)
                .isPositive(effectiveIsPositive)
                .valuation(v.getValuation())
                .investedToday(m.getInvestedToday())
                .percentFunded(m.getAllocationPercent())
                .volume(liveQuote != null ? liveQuote.getVolumeStr() : m.getTradingVolumeToday())
                .cik(v.getCik())
                .minInvestment(v.getMinInvestment())
                .minInvestmentNum(v.getMinInvestmentNum())
                .fundingPurpose(v.getFundingPurpose())
                .targetRaise(v.getTargetRaise())
                .roundType(v.getRoundType())
                .build();
    }

    @Override
    @Transactional
    public CorporateOrderDto createOrder(UUID userId, CreateOrderRequest request) {
        CompanyEntity company = null;
        if (request.getCompanyId() != null && !request.getCompanyId().isBlank()) {
            try {
                UUID cid = UUID.fromString(request.getCompanyId());
                company = companyRepository.findById(cid).orElse(null);
            } catch (Exception ignored) {}
        }
        if (company == null && request.getTicker() != null && !request.getTicker().isBlank()) {
            company = companyRepository.findByTickerIgnoreCase(request.getTicker()).orElse(null);
        }
        if (company == null) {
            company = companyRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No corporate issuer available for order placement"));
        }

        UUID orderId = UUID.randomUUID();
        String ticker = company.getTicker() != null ? company.getTicker() : "WQ";
        String orderNum = "ORD-" + ticker + "-" + (System.currentTimeMillis() % 1000000);
        BigDecimal price = request.getPricePerShare() != null ? request.getPricePerShare() : BigDecimal.valueOf(25.00);
        BigDecimal amount = request.getAmount() != null ? request.getAmount() : BigDecimal.valueOf(25000.00);
        Long shares = request.getShares() != null ? request.getShares() : (amount.divideToIntegralValue(price).longValue());
        String shareClass = request.getShareClass() != null && !request.getShareClass().isBlank() ? request.getShareClass() : "Series Seed Preferred";
        String type = request.getType() != null && !request.getType().isBlank() ? request.getType() : "PRIMARY_SUBSCRIPTION";

        CorporateOrderEntity order = CorporateOrderEntity.builder()
                .id(orderId)
                .userId(userId)
                .company(company)
                .orderNumber(orderNum)
                .type(type)
                .shareClass(shareClass)
                .shares(shares)
                .pricePerShare(price)
                .totalAmount(amount)
                .status("FILLED")
                .settlementStatus("SETTLED")
                .executedAt(java.time.Instant.now())
                .createdAt(java.time.Instant.now())
                .build();

        order = orderRepository.save(order);

        CorporatePositionEntity position = positionRepository.findByUserIdAndCompanyId(userId, company.getId()).orElse(null);
        if (position == null) {
            position = CorporatePositionEntity.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .company(company)
                    .shares(shares)
                    .shareClass(shareClass)
                    .costBasis(amount)
                    .currentValue(amount)
                    .unrealizedPl(BigDecimal.ZERO)
                    .unrealizedPlPercent(BigDecimal.ZERO)
                    .ownershipPercent(BigDecimal.valueOf(0.05))
                    .createdAt(java.time.Instant.now())
                    .updatedAt(java.time.Instant.now())
                    .build();
        } else {
            position.setShares(position.getShares() + shares);
            position.setCostBasis(position.getCostBasis().add(amount));
            position.setCurrentValue(position.getCurrentValue().add(amount));
            position.setUpdatedAt(java.time.Instant.now());
        }
        positionRepository.save(position);

        return CorporateOrderDto.builder()
                .id(order.getId())
                .companyId(company.getId())
                .companyName(company.getName())
                .ticker(company.getTicker())
                .logoColor(company.getLogoColor())
                .orderNumber(order.getOrderNumber())
                .type(order.getType())
                .shareClass(order.getShareClass())
                .shares(order.getShares())
                .pricePerShare(order.getPricePerShare())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .settlementStatus(order.getSettlementStatus())
                .executedAt(order.getExecutedAt())
                .build();
    }
}

