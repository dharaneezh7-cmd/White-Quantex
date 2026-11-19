package com.whitequantex.market;

import com.whitequantex.explore.entity.CompanyEntity;
import com.whitequantex.explore.repository.CompanyRepository;
import com.whitequantex.explore.repository.VentureRepository;
import com.whitequantex.market.dto.MarketHistoryResponseDto;
import com.whitequantex.market.entity.CompanyPriceCurrentEntity;
import com.whitequantex.market.entity.CompanyPriceHistoryEntity;
import com.whitequantex.market.provider.MarketDataProvider;
import com.whitequantex.market.repository.CompanyPriceCandleRepository;
import com.whitequantex.market.repository.CompanyPriceCurrentRepository;
import com.whitequantex.market.repository.CompanyPriceHistoryRepository;
import com.whitequantex.market.service.HistoricalPriceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class HistoricalPriceServiceTest {

    @Mock
    private CompanyPriceCurrentRepository currentRepo;

    @Mock
    private CompanyPriceHistoryRepository historyRepo;

    @Mock
    private CompanyPriceCandleRepository candleRepo;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private VentureRepository ventureRepository;

    @Mock
    private MarketDataProvider marketDataProvider;

    private HistoricalPriceService historicalPriceService;

    private CompanyEntity testCompany;

    @BeforeEach
    void setUp() {
        historicalPriceService = new HistoricalPriceService(
                currentRepo,
                historyRepo,
                candleRepo,
                companyRepository,
                ventureRepository,
                null,
                marketDataProvider
        );

        testCompany = CompanyEntity.builder()
                .id(UUID.randomUUID())
                .ticker("EXSP")
                .name("NovaSystems Inc.")
                .valuationNum(BigDecimal.valueOf(157300000))
                .build();
    }

    @Test
    @DisplayName("Should retrieve historical data and correctly compute period metrics")
    void shouldRetrieveHistoryAndCalculateMetrics() {
        when(companyRepository.findByTickerIgnoreCase("EXSP")).thenReturn(Optional.of(testCompany));

        Instant now = Instant.now();
        List<CompanyPriceHistoryEntity> mockRecords = new ArrayList<>();
        // 25 daily records starting from 100 to 124
        for (int i = 0; i < 25; i++) {
            mockRecords.add(CompanyPriceHistoryEntity.builder()
                    .id(UUID.randomUUID())
                    .symbol("EXSP")
                    .price(BigDecimal.valueOf(100.00 + i))
                    .volume(10000L)
                    .priceTimestamp(now.minus(25 - i, ChronoUnit.DAYS))
                    .build());
        }

        when(historyRepo.findHistorySince(eq("EXSP"), any())).thenReturn(mockRecords);
        when(currentRepo.findBySymbolIgnoreCase("EXSP")).thenReturn(Optional.of(CompanyPriceCurrentEntity.builder()
                .symbol("EXSP")
                .latestPrice(BigDecimal.valueOf(124.00))
                .priceTimestamp(now)
                .dataStatus("HISTORICAL")
                .build()));
        when(marketDataProvider.getProviderName()).thenReturn("INSTITUTIONAL_WQX");

        MarketHistoryResponseDto response = historicalPriceService.getHistoricalData("EXSP", "1M");

        assertNotNull(response);
        assertEquals("EXSP", response.getSymbol());
        assertEquals("1M", response.getRange());
        assertEquals(25, response.getPointCount());
        assertEquals(BigDecimal.valueOf(100.00).setScale(2), response.getPeriodStartPrice());
        assertEquals(BigDecimal.valueOf(124.00).setScale(2), response.getCurrentPrice());
        assertEquals(BigDecimal.valueOf(24.00).setScale(2), response.getPeriodChange());
        assertEquals(BigDecimal.valueOf(24.00).setScale(2), response.getPeriodChangePercent());
    }

    @Test
    @DisplayName("Should handle missing symbol gracefully with empty response")
    void shouldHandleEmptyHistoryGracefully() {
        when(companyRepository.findByTickerIgnoreCase("UNKNOWN")).thenReturn(Optional.empty());
        when(historyRepo.findHistorySince(eq("UNKNOWN"), any())).thenReturn(List.of());
        when(marketDataProvider.fetchHistoricalPrices(eq("UNKNOWN"), any())).thenReturn(List.of());
        when(currentRepo.findBySymbolIgnoreCase("UNKNOWN")).thenReturn(Optional.empty());
        when(marketDataProvider.getProviderName()).thenReturn("INSTITUTIONAL_WQX");

        MarketHistoryResponseDto response = historicalPriceService.getHistoricalData("UNKNOWN", "1D");

        assertNotNull(response);
        assertEquals("UNKNOWN", response.getSymbol());
        assertEquals(0, response.getPointCount());
        assertEquals("UNAVAILABLE", response.getDataStatus());
    }
}
