package com.whitequantex.explore.service;

import com.whitequantex.common.PagedResponse;
import com.whitequantex.explore.dto.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ExploreService {
    ExploreOverviewDto getExploreOverview();
    ExploreOverviewDto getExploreOverview(UUID userId);

    PagedResponse<CompanySummaryDto> searchCompanies(
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
    );

    CompanySummaryDto getCompanyById(UUID id);

    CompanySummaryDto getCompanyByTicker(String ticker);

    List<CorporatePositionDto> getPositions();
    List<CorporatePositionDto> getPositions(UUID userId);

    List<CorporateOrderDto> getOrders(String status);
    List<CorporateOrderDto> getOrders(UUID userId, String status);

    void recordRecentlyViewed(UUID userId, String tickerOrId);

    List<CorporateNewsDto> getNews(String ticker, String category);

    List<UpcomingCompanyDto> getUpcomingCompanies();

    List<WqRecommendationDto> getWqRecommendations();

    List<MutualSchemeDto> getMutualInvestmentSchemes();

    MutualSchemeDto getMutualSchemeByCode(String code);

    MutualSchemeDto getMutualSchemeById(UUID id);
}
