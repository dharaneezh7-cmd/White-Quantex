package com.whitequantex.explore.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExploreOverviewDto {
    private List<CategoryCompanyDto> recentlyViewed;
    private List<CategoryCompanyDto> todaysMostInvested;
    private List<CategoryCompanyDto> todaysLeastInvested;
    private List<CategoryCompanyDto> todaysTopGainers;
    private List<CategoryCompanyDto> todaysTopLosers;
    private List<CategoryCompanyDto> todaysMostActive;
    private List<CategoryCompanyDto> todays52wHighs;
    private List<CompanySummaryDto> recentlyAdded;
    private List<UpcomingCompanyDto> upcomingCompanies;
    private List<WqRecommendationDto> wqRecommendations;
    private List<MutualSchemeDto> mutualInvestmentSchemes;
    private Long totalRegisteredCompanies;
}
