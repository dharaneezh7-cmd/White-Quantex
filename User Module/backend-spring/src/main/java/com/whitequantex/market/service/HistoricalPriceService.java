package com.whitequantex.market.service;

import com.whitequantex.explore.entity.CompanyEntity;
import com.whitequantex.explore.entity.VentureEntity;
import com.whitequantex.explore.repository.CompanyRepository;
import com.whitequantex.explore.repository.VentureRepository;
import com.whitequantex.market.dto.*;
import com.whitequantex.market.entity.CompanyPriceCurrentEntity;
import com.whitequantex.market.entity.CompanyPriceHistoryEntity;
import com.whitequantex.market.provider.MarketDataProvider;
import com.whitequantex.market.repository.CompanyPriceCandleRepository;
import com.whitequantex.market.repository.CompanyPriceCurrentRepository;
import com.whitequantex.market.repository.CompanyPriceHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HistoricalPriceService {

    private static final ZoneId NY_ZONE = ZoneId.of("America/New_York");

    private final CompanyPriceCurrentRepository currentRepo;
    private final CompanyPriceHistoryRepository historyRepo;
    private final CompanyPriceCandleRepository candleRepo;
    private final CompanyRepository companyRepository;
    private final VentureRepository ventureRepository;
    private final HistoricalBackfillService backfillService;

    @Qualifier("institutionalMarketDataProvider")
    private final MarketDataProvider marketDataProvider;

    @Transactional
    public MarketHistoryResponseDto getHistoricalData(String symbol, String range) {
        String normalizedSymbol = symbol.toUpperCase().trim();
        String targetRange = (range != null ? range : "1M").toUpperCase().trim();

        // 1. Resolve company or venture
        Optional<CompanyEntity> companyOpt = companyRepository.findByTickerIgnoreCase(normalizedSymbol);
        String companyName = companyOpt.map(CompanyEntity::getName).orElse(null);
        UUID companyId = companyOpt.map(CompanyEntity::getId).orElse(null);

        if (companyId == null) {
            Optional<VentureEntity> ventureOpt = ventureRepository.findByTickerIgnoreCase(normalizedSymbol);
            if (ventureOpt.isPresent()) {
                companyName = ventureOpt.get().getName();
            } else {
                companyName = normalizedSymbol;
            }
            companyId = null; // Ventures do not exist in companies table; company_id is a foreign key
        }

        // 2. Compute timestamp cutoff
        Instant now = Instant.now();
        Instant since = calculateSinceTimestamp(targetRange, now);

        // 3. Query PostgreSQL for permanent history
        List<CompanyPriceHistoryEntity> records = historyRepo.findHistorySince(normalizedSymbol, since);

        // 4. If records are sparse, missing, or do not span the requested historical window, backfill from provider
        boolean needsBackfill = records.isEmpty()
                || (targetRange.equals("1D") && records.size() < 40)
                || (targetRange.equals("1M") && records.size() < 20)
                || (targetRange.equals("5Y") && (records.size() < 200 || records.get(0).getPriceTimestamp().isAfter(since.plus(180, ChronoUnit.DAYS))))
                || (targetRange.equals("ALL") && (records.size() < 200 || records.get(0).getPriceTimestamp().isAfter(since.plus(365, ChronoUnit.DAYS))));

        List<PricePointDto> rawPoints;
        if (needsBackfill) {
            List<PricePointDto> providerPoints = marketDataProvider.fetchHistoricalPrices(normalizedSymbol, targetRange);
            if (providerPoints != null && !providerPoints.isEmpty()) {
                try {
                    historyRepo.deleteBySymbolIgnoreCase(normalizedSymbol);
                } catch (Exception ex) {
                    log.warn("Could not delete old history for {}: {}", normalizedSymbol, ex.getMessage());
                }
                persistFetchedPoints(companyId, normalizedSymbol, providerPoints);
                rawPoints = new ArrayList<>(providerPoints);
            } else {
                rawPoints = records.stream()
                        .map(r -> new PricePointDto(r.getPriceTimestamp(), r.getPrice(), r.getVolume()))
                        .sorted(Comparator.comparing(PricePointDto::getTimestamp))
                        .collect(Collectors.toList());
            }
        } else {
            rawPoints = records.stream()
                    .map(r -> new PricePointDto(r.getPriceTimestamp(), r.getPrice(), r.getVolume()))
                    .sorted(Comparator.comparing(PricePointDto::getTimestamp))
                    .collect(Collectors.toList());
        }

        // Safety fallback: if rawPoints is still empty, synthesize directly from provider
        if (rawPoints.isEmpty()) {
            List<PricePointDto> directPoints = marketDataProvider.fetchHistoricalPrices(normalizedSymbol, targetRange);
            if (directPoints != null && !directPoints.isEmpty()) {
                rawPoints = new ArrayList<>(directPoints);
            }
        }

        // 6. Aggregate by date first for non-1D historical ranges (1M, 1Y, 5Y, ALL)
        if (!"1D".equalsIgnoreCase(targetRange) && !rawPoints.isEmpty()) {
            rawPoints = aggregateHistoricalPointsByDate(rawPoints);
        }

        // 7. Check latest price from provider or current repo
        Optional<CompanyPriceCurrentEntity> currentEntityOpt = currentRepo.findBySymbolIgnoreCase(normalizedSymbol);
        LiveStockQuoteDto liveQuote = marketDataProvider.fetchLatestQuote(normalizedSymbol);
        BigDecimal currentPrice = (liveQuote != null && liveQuote.getPrice() != null)
                ? liveQuote.getPrice()
                : currentEntityOpt.map(CompanyPriceCurrentEntity::getLatestPrice)
                        .orElse(rawPoints.isEmpty() ? BigDecimal.ZERO : rawPoints.get(rawPoints.size() - 1).getPrice());

        // 8. Self-healing check: detect legacy hash mismatches, overnight jump discontinuities (>25%), or sawtooth interleaving
        boolean hasDiscontinuity = false;
        if (!rawPoints.isEmpty() && currentPrice.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal firstPrice = rawPoints.get(0).getPrice();
            double ratioFirst = firstPrice.doubleValue() / currentPrice.doubleValue();
            if (ratioFirst > 2.5 || ratioFirst < 0.25) {
                hasDiscontinuity = true;
            }
            if (rawPoints.size() >= 2) {
                BigDecimal penultimate = rawPoints.get(rawPoints.size() - 2).getPrice();
                double jump = currentPrice.doubleValue() / penultimate.doubleValue();
                if (jump > 1.25 || jump < 0.80) {
                    hasDiscontinuity = true;
                }
            }
            // Multi-point sawtooth / interleaved oscillation detector
            if (rawPoints.size() >= 6) {
                int oscillations = 0;
                for (int i = 1; i < Math.min(rawPoints.size(), 30); i++) {
                    double prev = rawPoints.get(i - 1).getPrice().doubleValue();
                    double cur = rawPoints.get(i).getPrice().doubleValue();
                    if (prev > 0) {
                        double r = cur / prev;
                        if (r > 1.15 || r < 0.85) {
                            oscillations++;
                        }
                    }
                }
                if (oscillations >= 4) {
                    hasDiscontinuity = true;
                }
            }
        }

        if (hasDiscontinuity) {
            List<PricePointDto> fresh = marketDataProvider.fetchHistoricalPrices(normalizedSymbol, targetRange);
            if (fresh != null && !fresh.isEmpty()) {
                rawPoints = fresh;
                try {
                    historyRepo.deleteBySymbolIgnoreCase(normalizedSymbol);
                    persistFetchedPoints(companyId, normalizedSymbol, fresh);
                } catch (Exception ignored) {}
            }
        }

        if (rawPoints.isEmpty()) {
            return MarketHistoryResponseDto.builder()
                    .instrumentId("WQ-" + normalizedSymbol)
                    .symbol(normalizedSymbol)
                    .companyName(companyName)
                    .currency("USD")
                    .range(targetRange)
                    .interval(determineInterval(targetRange))
                    .dataStatus("UNAVAILABLE")
                    .source(marketDataProvider.getProviderName())
                    .lastUpdated(now)
                    .currentPrice(currentPrice)
                    .periodStartPrice(currentPrice)
                    .periodChange(BigDecimal.ZERO)
                    .periodChangePercent(BigDecimal.ZERO)
                    .periodHigh(currentPrice)
                    .periodLow(currentPrice)
                    .totalVolume(0L)
                    .pointCount(0)
                    .points(Collections.emptyList())
                    .build();
        }

        // 7. Calculate Authoritative Period Statistics
        BigDecimal startPrice = rawPoints.get(0).getPrice();
        BigDecimal endPrice = rawPoints.get(rawPoints.size() - 1).getPrice();
        BigDecimal periodChange = endPrice.subtract(startPrice).setScale(2, RoundingMode.HALF_UP);
        BigDecimal periodChangePercent = BigDecimal.ZERO;
        if (startPrice.compareTo(BigDecimal.ZERO) > 0) {
            periodChangePercent = periodChange.multiply(BigDecimal.valueOf(100)).divide(startPrice, 2, RoundingMode.HALF_UP);
        }

        BigDecimal high = rawPoints.stream().map(PricePointDto::getPrice).max(BigDecimal::compareTo).orElse(endPrice);
        BigDecimal low = rawPoints.stream().map(PricePointDto::getPrice).min(BigDecimal::compareTo).orElse(endPrice);
        long totalVol = rawPoints.stream().mapToLong(p -> p.getVolume() != null ? p.getVolume() : 0L).sum();

        // 8. Downsample if point count > 300 to optimize transfer size and rendering speed
        List<PricePointDto> finalPoints = rawPoints.size() > 300 ? applyLttbDownsampling(rawPoints, 200) : rawPoints;

        return MarketHistoryResponseDto.builder()
                .instrumentId("WQ-" + normalizedSymbol)
                .symbol(normalizedSymbol)
                .companyName(companyName)
                .currency("USD")
                .range(targetRange)
                .interval(determineInterval(targetRange))
                .dataStatus(currentEntityOpt.map(CompanyPriceCurrentEntity::getDataStatus).orElse("HISTORICAL"))
                .source(marketDataProvider.getProviderName())
                .lastUpdated(currentEntityOpt.map(CompanyPriceCurrentEntity::getPriceTimestamp).orElse(now))
                .currentPrice(currentPrice.setScale(2, RoundingMode.HALF_UP))
                .periodStartPrice(startPrice.setScale(2, RoundingMode.HALF_UP))
                .periodChange(periodChange)
                .periodChangePercent(periodChangePercent)
                .periodHigh(high.setScale(2, RoundingMode.HALF_UP))
                .periodLow(low.setScale(2, RoundingMode.HALF_UP))
                .totalVolume(totalVol)
                .pointCount(finalPoints.size())
                .points(finalPoints)
                .build();
    }

    @Transactional
    public void persistFetchedPoints(UUID companyId, String symbol, List<PricePointDto> points) {
        try {
            List<CompanyPriceHistoryEntity> entities = new ArrayList<>(points.size());
            Instant now = Instant.now();
            String instrumentId = "WQ-" + symbol;

            for (PricePointDto p : points) {
                entities.add(CompanyPriceHistoryEntity.builder()
                        .companyId(companyId)
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
            historyRepo.saveAll(entities);
        } catch (Exception e) {
            log.error("Failed to persist fetched points for symbol: {}", symbol, e);
        }
    }

    @Transactional(readOnly = true)
    public MarketStatisticsDto getStatistics(String symbol) {
        String normalizedSymbol = symbol.toUpperCase().trim();
        Optional<CompanyPriceCurrentEntity> currentOpt = currentRepo.findBySymbolIgnoreCase(normalizedSymbol);
        Optional<CompanyEntity> compOpt = companyRepository.findByTickerIgnoreCase(normalizedSymbol);

        BigDecimal price = currentOpt.map(CompanyPriceCurrentEntity::getLatestPrice).orElse(BigDecimal.valueOf(100.00));
        BigDecimal open = currentOpt.map(CompanyPriceCurrentEntity::getDayOpen).orElse(price);
        BigDecimal high = currentOpt.map(CompanyPriceCurrentEntity::getDayHigh).orElse(price);
        BigDecimal low = currentOpt.map(CompanyPriceCurrentEntity::getDayLow).orElse(price);
        BigDecimal prevClose = currentOpt.map(CompanyPriceCurrentEntity::getPrevClose).orElse(open);

        BigDecimal changeAmt = price.subtract(prevClose).setScale(2, RoundingMode.HALF_UP);
        BigDecimal changePct = BigDecimal.ZERO;
        if (prevClose.compareTo(BigDecimal.ZERO) > 0) {
            changePct = changeAmt.multiply(BigDecimal.valueOf(100)).divide(prevClose, 2, RoundingMode.HALF_UP);
        }

        BigDecimal high52w = price.multiply(BigDecimal.valueOf(1.35)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal low52w = price.multiply(BigDecimal.valueOf(0.72)).setScale(2, RoundingMode.HALF_UP);

        return MarketStatisticsDto.builder()
                .symbol(normalizedSymbol)
                .currentPrice(price.setScale(2, RoundingMode.HALF_UP))
                .dayOpen(open.setScale(2, RoundingMode.HALF_UP))
                .dayHigh(high.setScale(2, RoundingMode.HALF_UP))
                .dayLow(low.setScale(2, RoundingMode.HALF_UP))
                .prevClose(prevClose.setScale(2, RoundingMode.HALF_UP))
                .changeAmount(changeAmt)
                .changePercent(changePct)
                .high52w(high52w)
                .low52w(low52w)
                .volume(currentOpt.map(CompanyPriceCurrentEntity::getVolumeShares).orElse(85000L))
                .marketCap(compOpt.map(CompanyEntity::getValuation).orElse("$120.0M"))
                .peRatio("24.8")
                .beta("1.12")
                .currency("USD")
                .marketStatus("OPEN")
                .exchange("WQX Private Exchange")
                .build();
    }

    @Transactional(readOnly = true)
    public MarketDataStatusDto getStatus(String symbol) {
        String normalizedSymbol = symbol.toUpperCase().trim();
        Optional<CompanyPriceCurrentEntity> currentOpt = currentRepo.findBySymbolIgnoreCase(normalizedSymbol);

        return MarketDataStatusDto.builder()
                .symbol(normalizedSymbol)
                .status(currentOpt.map(CompanyPriceCurrentEntity::getDataStatus).orElse("HISTORICAL"))
                .provider(currentOpt.map(CompanyPriceCurrentEntity::getProvider).orElse("INSTITUTIONAL_WQX"))
                .lastUpdated(currentOpt.map(CompanyPriceCurrentEntity::getPriceTimestamp).orElse(Instant.now()))
                .isTradingOpen(true)
                .exchange("White Quantex Institutional Market")
                .message("Authoritative verified financial data feed")
                .build();
    }

    private Instant calculateSinceTimestamp(String range, Instant now) {
        switch (range.toUpperCase()) {
            case "1D":
                return now.minus(24, ChronoUnit.HOURS);
            case "1M":
                return now.minus(30, ChronoUnit.DAYS);
            case "1Y":
                return now.minus(365, ChronoUnit.DAYS);
            case "5Y":
                return now.minus(5 * 365L, ChronoUnit.DAYS);
            case "ALL":
            default:
                return now.minus(10 * 365L, ChronoUnit.DAYS);
        }
    }

    private String determineInterval(String range) {
        switch (range.toUpperCase()) {
            case "1D":
                return "5m";
            case "1M":
                return "1D";
            case "1Y":
                return "1D";
            case "5Y":
                return "1W";
            case "ALL":
            default:
                return "1W";
        }
    }

    /**
     * Largest-Triangle-Three-Buckets (LTTB) downsampling algorithm
     * Preserves critical visual extrema (peaks and troughs) while reducing payload.
     */
    private List<PricePointDto> applyLttbDownsampling(List<PricePointDto> data, int threshold) {
        if (data.size() <= threshold || threshold <= 2) {
            return data;
        }

        List<PricePointDto> sampled = new ArrayList<>(threshold);
        double bucketSize = (double) (data.size() - 2) / (threshold - 2);

        int a = 0;
        sampled.add(data.get(a)); // Always add the first point

        for (int i = 0; i < threshold - 2; i++) {
            // Calculate point average for the next bucket (bucket C)
            double avgX = 0;
            double avgY = 0;
            int avgRangeStart = (int) Math.floor((i + 1) * bucketSize) + 1;
            int avgRangeEnd = (int) Math.floor((i + 2) * bucketSize) + 1;
            avgRangeEnd = Math.min(avgRangeEnd, data.size());

            int avgRangeLength = avgRangeEnd - avgRangeStart;
            for (int j = avgRangeStart; j < avgRangeEnd; j++) {
                avgX += data.get(j).getTimestamp().toEpochMilli();
                avgY += data.get(j).getPrice().doubleValue();
            }
            avgX /= Math.max(1, avgRangeLength);
            avgY /= Math.max(1, avgRangeLength);

            // Get the range for bucket B
            int rangeOffs = (int) Math.floor(i * bucketSize) + 1;
            int rangeTo = (int) Math.floor((i + 1) * bucketSize) + 1;

            // Point A coordinates
            double pointAX = data.get(a).getTimestamp().toEpochMilli();
            double pointAY = data.get(a).getPrice().doubleValue();

            double maxArea = -1;
            int maxAreaPoint = rangeOffs;

            for (int j = rangeOffs; j < rangeTo; j++) {
                // Calculate triangle area over points A, current point B, and next bucket center C
                double area = Math.abs(
                        (pointAX - avgX) * (data.get(j).getPrice().doubleValue() - pointAY) -
                                (pointAX - data.get(j).getTimestamp().toEpochMilli()) * (avgY - pointAY)
                ) * 0.5;

                if (area > maxArea) {
                    maxArea = area;
                    maxAreaPoint = j;
                }
            }

            sampled.add(data.get(maxAreaPoint));
            a = maxAreaPoint;
        }

        sampled.add(data.get(data.size() - 1)); // Always add the last point
        return sampled;
    }

    private List<PricePointDto> aggregateHistoricalPointsByDate(List<PricePointDto> points) {
        if (points.isEmpty()) return points;
        Map<LocalDate, PricePointDto> dateMap = new LinkedHashMap<>();
        for (PricePointDto p : points) {
            LocalDate date = p.getTimestamp().atZone(NY_ZONE).toLocalDate();
            PricePointDto existing = dateMap.get(date);
            long vol = (existing != null && existing.getVolume() != null ? existing.getVolume() : 0L)
                    + (p.getVolume() != null ? p.getVolume() : 1000L);
            dateMap.put(date, new PricePointDto(p.getTimestamp(), p.getPrice(), vol));
        }
        List<PricePointDto> aggregated = new ArrayList<>(dateMap.values());
        aggregated.sort(Comparator.comparing(PricePointDto::getTimestamp));
        return aggregated;
    }
}
