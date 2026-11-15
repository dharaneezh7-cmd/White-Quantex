package com.whitequantex.market;

import com.whitequantex.explore.entity.CompanyEntity;
import com.whitequantex.explore.repository.CompanyRepository;
import com.whitequantex.market.dto.LiveStockQuoteDto;
import com.whitequantex.market.entity.CompanyPriceCurrentEntity;
import com.whitequantex.market.entity.CompanyPriceHistoryEntity;
import com.whitequantex.market.repository.CompanyPriceCandleRepository;
import com.whitequantex.market.repository.CompanyPriceCurrentRepository;
import com.whitequantex.market.repository.CompanyPriceHistoryRepository;
import com.whitequantex.market.repository.MarketDataIngestionLogRepository;
import com.whitequantex.market.service.PriceIngestionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PriceIngestionServiceTest {

    @Mock
    private CompanyPriceCurrentRepository currentRepo;

    @Mock
    private CompanyPriceHistoryRepository historyRepo;

    @Mock
    private CompanyPriceCandleRepository candleRepo;

    @Mock
    private MarketDataIngestionLogRepository logRepo;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private PriceIngestionService priceIngestionService;

    private CompanyEntity testCompany;

    @BeforeEach
    void setUp() {
        testCompany = CompanyEntity.builder()
                .id(UUID.randomUUID())
                .ticker("EXSP")
                .name("NovaSystems Inc.")
                .shortName("NovaSystems")
                .build();
    }

    @Test
    @DisplayName("Should accept and persist valid price update")
    void shouldAcceptAndPersistValidPriceUpdate() {
        when(companyRepository.findByTickerIgnoreCase("EXSP")).thenReturn(Optional.of(testCompany));
        when(historyRepo.existsBySymbolIgnoreCaseAndSourceAndSourceEventId(any(), any(), any())).thenReturn(false);
        when(currentRepo.findBySymbolIgnoreCase("EXSP")).thenReturn(Optional.empty());

        LiveStockQuoteDto update = LiveStockQuoteDto.builder()
                .ticker("EXSP")
                .price(BigDecimal.valueOf(338.23))
                .openPrice(BigDecimal.valueOf(320.00))
                .volumeShares(45000L)
                .lastUpdated(Instant.now())
                .build();

        boolean result = priceIngestionService.ingestPriceUpdate(update, "INSTITUTIONAL_WQX", "EVT-101");

        assertTrue(result);
        verify(historyRepo, times(1)).save(any(CompanyPriceHistoryEntity.class));
        verify(currentRepo, times(1)).save(any(CompanyPriceCurrentEntity.class));
    }

    @Test
    @DisplayName("Should reject update with zero or negative price")
    void shouldRejectZeroOrNegativePrice() {
        LiveStockQuoteDto invalidUpdate = LiveStockQuoteDto.builder()
                .ticker("EXSP")
                .price(BigDecimal.valueOf(-10.50))
                .build();

        boolean result = priceIngestionService.ingestPriceUpdate(invalidUpdate, "INSTITUTIONAL_WQX", "EVT-ERR");

        assertFalse(result);
        verify(historyRepo, never()).save(any());
        verify(currentRepo, never()).save(any());
    }

    @Test
    @DisplayName("Should reject duplicate event IDs (idempotency)")
    void shouldRejectDuplicateEventId() {
        when(companyRepository.findByTickerIgnoreCase("EXSP")).thenReturn(Optional.of(testCompany));
        when(historyRepo.existsBySymbolIgnoreCaseAndSourceAndSourceEventId("EXSP", "INSTITUTIONAL_WQX", "EVT-DUP-1"))
                .thenReturn(true);

        LiveStockQuoteDto duplicateUpdate = LiveStockQuoteDto.builder()
                .ticker("EXSP")
                .price(BigDecimal.valueOf(338.23))
                .build();

        boolean result = priceIngestionService.ingestPriceUpdate(duplicateUpdate, "INSTITUTIONAL_WQX", "EVT-DUP-1");

        assertFalse(result);
        verify(historyRepo, never()).save(any());
        verify(currentRepo, never()).save(any());
    }
}
