package com.whitequantex.market.service;

import com.whitequantex.explore.entity.CompanyEntity;
import com.whitequantex.explore.entity.VentureEntity;
import com.whitequantex.explore.repository.CompanyRepository;
import com.whitequantex.explore.repository.VentureRepository;
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
    private final VentureRepository ventureRepository;
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
            log.info("Starting comprehensive 5-year historical market data backfill check for verified corporate and venture issuers...");
            List<CompanyEntity> companies = companyRepository.findAll();
            int backfilled = 0;

            for (CompanyEntity c : companies) {
                if (c.getTicker() == null) continue;
                String symbol = c.getTicker().toUpperCase().trim();

                Optional<MarketDataSyncStateEntity> syncOpt = syncRepo.findBySymbolIgnoreCase(symbol);
                if (syncOpt.isEmpty() || !"SYNCED".equals(syncOpt.get().getSyncStatus()) || historyRepo.countBySymbolIgnoreCase(symbol) < 200) {
                    backfillCompany(c);
                    backfilled++;
                }
            }

            List<VentureEntity> ventures = ventureRepository.findAll();
            for (VentureEntity v : ventures) {
                if (v.getTicker() == null) continue;
                String symbol = v.getTicker().toUpperCase().trim();

                Optional<MarketDataSyncStateEntity> syncOpt = syncRepo.findBySymbolIgnoreCase(symbol);
                if (syncOpt.isEmpty() || !"SYNCED".equals(syncOpt.get().getSyncStatus()) || historyRepo.countBySymbolIgnoreCase(symbol) < 200) {
                    backfillVenture(v);
                    backfilled++;
                }
            }

            log.info("Completed 5-year historical market data check. Active/backfilled {} issuers into PostgreSQL", backfilled);
        } catch (Exception e) {
            log.error("Historical market data backfill encountered error", e);
        }
    }

    @Transactional
    public void backfillCompany(CompanyEntity company) {
        String symbol = company.getTicker().toUpperCase().trim();
        String instrumentId = "WQ-" + symbol;
        Instant now = Instant.now();

        try {
            // 1. Fetch comprehensive 5Y historical points (260 weekly closes across 5 years)
            List<PricePointDto> points = marketDataProvider.fetchHistoricalPrices(symbol, "5Y");
            if (points == null || points.isEmpty()) return;

            // Delete stale or conflicting entries to prevent interleaving
            try {
                historyRepo.deleteBySymbolIgnoreCase(symbol);
            } catch (Exception ignored) {}

            List<CompanyPriceHistoryEntity> entitiesToSave = new ArrayList<>(points.size());
            for (PricePointDto p : points) {
                entitiesToSave.add(CompanyPriceHistoryEntity.builder()
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

    @Transactional
    public void backfillVenture(VentureEntity venture) {
        if (venture == null || venture.getTicker() == null) return;
        String symbol = venture.getTicker().toUpperCase().trim();
        String instrumentId = "WQ-" + symbol;
        Instant now = Instant.now();

        try {
            // 1. Fetch comprehensive 5Y historical points
            List<PricePointDto> points = marketDataProvider.fetchHistoricalPrices(symbol, "5Y");
            if (points == null || points.isEmpty()) return;

            try {
                historyRepo.deleteBySymbolIgnoreCase(symbol);
            } catch (Exception ignored) {}

            List<CompanyPriceHistoryEntity> entitiesToSave = new ArrayList<>(points.size());
            for (PricePointDto p : points) {
                entitiesToSave.add(CompanyPriceHistoryEntity.builder()
                        .companyId(null) // null for ventures as company_id foreign key references companies(id)
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
                            .companyId(null) // null for ventures
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

            MarketDataSyncStateEntity sync = syncRepo.findBySymbolIgnoreCase(symbol).orElseGet(() ->
                    MarketDataSyncStateEntity.builder()
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
            log.error("Failed to backfill venture historical data for symbol: {}", symbol, e);
        }
    }
}
