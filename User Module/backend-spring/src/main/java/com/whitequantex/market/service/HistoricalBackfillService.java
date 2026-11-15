package com.whitequantex.market.service;

import com.whitequantex.explore.entity.CompanyEntity;
import com.whitequantex.explore.repository.CompanyRepository;
import com.whitequantex.market.dto.CandleDto;
import com.whitequantex.market.dto.PricePointDto;
import com.whitequantex.market.entity.*;
import com.whitequantex.market.provider.MarketDataProvider;
import com.whitequantex.market.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HistoricalBackfillService {

    private final CompanyRepository companyRepository;
    private final CompanyPriceCurrentRepository currentRepo;
    private final CompanyPriceHistoryRepository historyRepo;
    private final CompanyPriceCandleRepository candleRepo;
    private final MarketDataSyncStateRepository syncRepo;
    private final MarketDataIngestionLogRepository logRepo;

    @Qualifier("institutionalMarketDataProvider")
    private final MarketDataProvider marketDataProvider;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        backfillAllCompaniesAsync();
    }

    @Async
    public void backfillAllCompaniesAsync() {
        try {
            log.info("Starting historical market data backfill check for verified corporate issuers...");
            List<CompanyEntity> companies = companyRepository.findAll();
            int backfilled = 0;

            for (CompanyEntity c : companies) {
                if (c.getTicker() == null) continue;
                String symbol = c.getTicker().toUpperCase();

                Optional<MarketDataSyncStateEntity> syncOpt = syncRepo.findBySymbolIgnoreCase(symbol);
                if (syncOpt.isEmpty() || !"SYNCED".equals(syncOpt.get().getSyncStatus()) || historyRepo.countBySymbolIgnoreCase(symbol) < 30) {
                    backfillCompany(c);
                    backfilled++;
                }
            }
            log.info("Completed historical market data check. Newly backfilled {} issuers into PostgreSQL", backfilled);
        } catch (Exception e) {
            log.error("Historical market data backfill encountered error", e);
        }
    }

    @Transactional
    public void backfillCompany(CompanyEntity company) {
        String symbol = company.getTicker().toUpperCase();
        String instrumentId = "WQ-" + symbol;
        Instant now = Instant.now();

        try {
            // 1. Fetch comprehensive 1Y historical points
            List<PricePointDto> points = marketDataProvider.fetchHistoricalPrices(symbol, "1Y");
            if (points == null || points.isEmpty()) return;

            List<CompanyPriceHistoryEntity> entitiesToSave = new ArrayList<>(points.size());
            for (PricePointDto p : points) {
                entitiesToSave.add(CompanyPriceHistoryEntity.builder()
                        .id(UUID.randomUUID())
                        .companyId(company.getId())
                        .instrumentId(instrumentId)
                        .symbol(symbol)
                        .price(p.getPrice().setScale(4, RoundingMode.HALF_UP))
                        .volume(p.getVolume() != null ? p.getVolume() : 1000L)
                        .currency("USD")
                        .source(marketDataProvider.getProviderName())
                        .priceTimestamp(p.getTimestamp())
                        .receivedAt(now)
                        .dataStatus("HISTORICAL")
                        .createdAt(now)
                        .build());
            }
            historyRepo.saveAll(entitiesToSave);

            // 2. Fetch and persist candles
            List<CandleDto> candles = marketDataProvider.fetchCandles(symbol, "1D", points.get(0).getTimestamp(), now);
            if (candles != null) {
                List<CompanyPriceCandleEntity> candleEntities = new ArrayList<>();
                for (CandleDto c : candles) {
                    candleEntities.add(CompanyPriceCandleEntity.builder()
                            .id(UUID.randomUUID())
                            .instrumentId(instrumentId)
                            .symbol(symbol)
                            .candleInterval("1D")
                            .candleStart(c.getStart())
                            .candleEnd(c.getEnd())
                            .openPrice(c.getOpen().setScale(4, RoundingMode.HALF_UP))
                            .highPrice(c.getHigh().setScale(4, RoundingMode.HALF_UP))
                            .lowPrice(c.getLow().setScale(4, RoundingMode.HALF_UP))
                            .closePrice(c.getClose().setScale(4, RoundingMode.HALF_UP))
                            .volume(c.getVolume() != null ? c.getVolume() : 0L)
                            .currency("USD")
                            .source(marketDataProvider.getProviderName())
                            .isFinal(true)
                            .updatedAt(now)
                            .build());
                }
                candleRepo.saveAll(candleEntities);
            }

            // 3. Update or Insert Current Price Record
            PricePointDto latestPoint = points.get(points.size() - 1);
            PricePointDto firstPoint = points.get(0);
            BigDecimal latestPrice = latestPoint.getPrice().setScale(4, RoundingMode.HALF_UP);
            BigDecimal openPrice = firstPoint.getPrice().setScale(4, RoundingMode.HALF_UP);
            BigDecimal changeAmt = latestPrice.subtract(openPrice).setScale(4, RoundingMode.HALF_UP);
            BigDecimal changePct = BigDecimal.ZERO;
            if (openPrice.compareTo(BigDecimal.ZERO) > 0) {
                changePct = changeAmt.multiply(BigDecimal.valueOf(100)).divide(openPrice, 4, RoundingMode.HALF_UP);
            }

            BigDecimal high = points.stream().map(PricePointDto::getPrice).max(BigDecimal::compareTo).orElse(latestPrice);
            BigDecimal low = points.stream().map(PricePointDto::getPrice).min(BigDecimal::compareTo).orElse(latestPrice);

            CompanyPriceCurrentEntity current = currentRepo.findBySymbolIgnoreCase(symbol).orElseGet(() ->
                    CompanyPriceCurrentEntity.builder()
                            .id(UUID.randomUUID())
                            .companyId(company.getId())
                            .instrumentId(instrumentId)
                            .symbol(symbol)
                            .currency("USD")
                            .provider(marketDataProvider.getProviderName())
                            .dataStatus("LIVE")
                            .marketStatus("OPEN")
                            .build());

            current.setLatestPrice(latestPrice);
            current.setPriceTimestamp(latestPoint.getTimestamp());
            current.setDayOpen(openPrice);
            current.setDayHigh(high.setScale(4, RoundingMode.HALF_UP));
            current.setDayLow(low.setScale(4, RoundingMode.HALF_UP));
            current.setPrevClose(openPrice);
            current.setChangeAmount(changeAmt);
            current.setChangePercent(changePct);
            current.setVolumeShares(latestPoint.getVolume() != null ? latestPoint.getVolume() : 15000L);
            current.setUpdatedAt(now);
            currentRepo.save(current);

            // 4. Update Sync State
            MarketDataSyncStateEntity sync = syncRepo.findBySymbolIgnoreCase(symbol).orElseGet(() ->
                    MarketDataSyncStateEntity.builder()
                            .id(UUID.randomUUID())
                            .provider(marketDataProvider.getProviderName())
                            .instrumentId(instrumentId)
                            .symbol(symbol)
                            .build());

            sync.setLastSuccessfulTimestamp(now);
            sync.setLastSyncStartedAt(now);
            sync.setLastSyncCompletedAt(now);
            sync.setSyncStatus("SYNCED");
            sync.setRetryCount(0);
            syncRepo.save(sync);

        } catch (Exception e) {
            log.error("Failed to backfill historical data for symbol: {}", symbol, e);
        }
    }
}
