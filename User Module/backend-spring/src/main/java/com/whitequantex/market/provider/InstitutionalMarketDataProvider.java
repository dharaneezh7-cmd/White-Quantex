package com.whitequantex.market.provider;

import com.whitequantex.explore.entity.CompanyEntity;
import com.whitequantex.explore.entity.VentureEntity;
import com.whitequantex.explore.repository.CompanyRepository;
import com.whitequantex.explore.repository.VentureRepository;
import com.whitequantex.market.dto.CandleDto;
import com.whitequantex.market.dto.LiveStockQuoteDto;
import com.whitequantex.market.dto.PricePointDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component("institutionalMarketDataProvider")
@RequiredArgsConstructor
@Slf4j
public class InstitutionalMarketDataProvider implements MarketDataProvider {

    private final CompanyRepository companyRepository;
    private final VentureRepository ventureRepository;
    private static final ZoneId NY_ZONE = ZoneId.of("America/New_York");

    @Override
    public String getProviderName() {
        return "INSTITUTIONAL_WQX";
    }

    @Override
    public boolean isLive() {
        return true;
    }

    @Override
    public String getDataStatus() {
        return "HISTORICAL";
    }

    @Override
    public LiveStockQuoteDto fetchLatestQuote(String symbol) {
        CompanyEntity company = companyRepository.findByTickerIgnoreCase(symbol)
                .orElseGet(() -> {
                    try {
                        return companyRepository.findById(UUID.fromString(symbol)).orElse(null);
                    } catch (Exception e) {
                        return null;
                    }
                });

        if (company == null) {
            VentureEntity venture = ventureRepository.findByTickerIgnoreCase(symbol)
                    .orElseGet(() -> {
                        try {
                            return ventureRepository.findById(UUID.fromString(symbol)).orElse(null);
                        } catch (Exception e) {
                            return null;
                        }
                    });
            if (venture != null) {
                BigDecimal basePrice = deriveBasePrice(venture.getTicker(), venture.getName(), venture.getValuationNum());
                return LiveStockQuoteDto.builder()
                        .id(venture.getId())
                        .ticker(venture.getTicker().toUpperCase())
                        .name(venture.getName())
                        .shortName(venture.getName())
                        .sector(venture.getSector())
                        .price(basePrice)
                        .isPositive(true)
                        .build();
            }
            return null;
        }

        BigDecimal basePrice = deriveBasePrice(company.getTicker(), company.getName(), company.getValuationNum());
        return LiveStockQuoteDto.builder()
                .id(company.getId())
                .ticker(company.getTicker().toUpperCase())
                .name(company.getName())
                .shortName(company.getShortName())
                .sector(company.getSector())
                .price(basePrice)
                .isPositive(true)
                .build();
    }

    @Override
    public List<PricePointDto> fetchHistoricalPrices(String symbol, String range) {
        String cleanSymbol = symbol != null ? symbol.toUpperCase().trim() : "WQ";
        CompanyEntity company = companyRepository.findByTickerIgnoreCase(cleanSymbol)
                .orElseGet(() -> {
                    try {
                        return companyRepository.findById(UUID.fromString(symbol)).orElse(null);
                    } catch (Exception e) {
                        return null;
                    }
                });

        VentureEntity venture = null;
        if (company == null) {
            venture = ventureRepository.findByTickerIgnoreCase(cleanSymbol)
                    .orElseGet(() -> {
                        try {
                            return ventureRepository.findById(UUID.fromString(symbol)).orElse(null);
                        } catch (Exception e) {
                            return null;
                        }
                    });
        }

        String entityName = company != null ? company.getName() : (venture != null ? venture.getName() : cleanSymbol);
        BigDecimal valuationNum = company != null ? company.getValuationNum() : (venture != null ? venture.getValuationNum() : null);
        BigDecimal currentPrice = deriveBasePrice(cleanSymbol, entityName, valuationNum);

        ZonedDateTime now = ZonedDateTime.now(NY_ZONE);
        List<PricePointDto> points = new ArrayList<>();
        int hash = cleanSymbol.chars().reduce(0, Integer::sum);

        switch (range.toUpperCase()) {
            case "1D": {
                // Intraday continuous 5-minute ticks (78 intervals)
                int intervals = 78;
                ZonedDateTime sessionStart = now.minusMinutes(intervals * 5L);
                double startPrice = currentPrice.doubleValue() * (1.0 - (((hash % 15) - 7) / 250.0));
                double totalDelta = currentPrice.doubleValue() - startPrice;
                for (int i = 0; i <= intervals; i++) {
                    ZonedDateTime t = sessionStart.plusMinutes(i * 5L);
                    double progress = (double) i / (double) intervals;
                    double cycle1 = Math.sin(progress * Math.PI * 2.5 + (hash % 3)) * (currentPrice.doubleValue() * 0.012);
                    double cycle2 = Math.cos(progress * Math.PI * 4.0 + (hash % 5)) * (currentPrice.doubleValue() * 0.006);
                    double noise = (((hash * (i + 13)) % 19) - 9) * 0.0008 * currentPrice.doubleValue();
                    double dampening = 1.0 - Math.pow(progress, 3.0);
                    double priceVal = (i == intervals)
                            ? currentPrice.doubleValue()
                            : Math.max(1.0, startPrice + (totalDelta * progress) + (cycle1 + cycle2 + noise) * dampening);
                    BigDecimal p = BigDecimal.valueOf(priceVal).setScale(2, RoundingMode.HALF_UP);
                    long vol = (long) (Math.abs(Math.sin(i * 0.3)) * 6500 + 1200);
                    points.add(new PricePointDto(t.toInstant(), p, vol));
                }
                break;
            }
            case "1M": {
                // 30 business day closes
                ZonedDateTime cursor = now.minusDays(42);
                int count = 0;
                double startPrice = currentPrice.doubleValue() * (1.0 - (((hash % 20) - 7) / 100.0));
                double step = (currentPrice.doubleValue() - startPrice) / 30.0;
                while (count < 30 && cursor.isBefore(now)) {
                    cursor = cursor.plusDays(1);
                    if (cursor.getDayOfWeek() != DayOfWeek.SATURDAY && cursor.getDayOfWeek() != DayOfWeek.SUNDAY) {
                        double noise = Math.sin((count + hash % 7) * 0.6) * (currentPrice.doubleValue() * 0.018);
                        double priceVal = Math.max(1.0, startPrice + (count * step) + noise);
                        BigDecimal p = BigDecimal.valueOf(priceVal).setScale(2, RoundingMode.HALF_UP);
                        long vol = (long) (((hash * (count + 1)) % 85000) + 15000);
                        points.add(new PricePointDto(cursor.withHour(16).withMinute(0).toInstant(), p, vol));
                        count++;
                    }
                }
                break;
            }
            case "1Y": {
                // 252 business days across the year
                ZonedDateTime cursor = now.minusYears(1);
                int count = 0;
                double startPrice = currentPrice.doubleValue() * (1.0 - (((hash % 35) - 10) / 100.0));
                double step = (currentPrice.doubleValue() - startPrice) / 252.0;
                while (cursor.isBefore(now) && count < 252) {
                    cursor = cursor.plusDays(1);
                    if (cursor.getDayOfWeek() != DayOfWeek.SATURDAY && cursor.getDayOfWeek() != DayOfWeek.SUNDAY) {
                        double taper = 1.0 - Math.pow((double) count / 252.0, 2.0);
                        double wave = Math.sin((count + hash % 13) * 0.15) * (currentPrice.doubleValue() * 0.045) * taper;
                        double priceVal = Math.max(1.0, startPrice + (count * step) + wave);
                        BigDecimal p = BigDecimal.valueOf(priceVal).setScale(2, RoundingMode.HALF_UP);
                        long vol = (long) (((hash * (count + 7)) % 120000) + 30000);
                        points.add(new PricePointDto(cursor.withHour(16).withMinute(0).toInstant(), p, vol));
                        count++;
                    }
                }
                break;
            }
            case "5Y": {
                // Exactly 260 weekly closes spanning 5 full calendar years
                ZonedDateTime cursor = now.minusYears(5);
                double startPrice = Math.max(5.0, currentPrice.doubleValue() * 0.45);
                double step = (currentPrice.doubleValue() - startPrice) / 260.0;
                for (int w = 0; w < 260; w++) {
                    cursor = cursor.plusWeeks(1);
                    double progress = (double) w / 260.0;
                    double taper = 1.0 - Math.pow(progress, 2.0);
                    double wave1 = Math.sin((w + hash % 11) * 0.08) * (currentPrice.doubleValue() * 0.05) * taper;
                    double wave2 = Math.cos((w + hash % 7) * 0.04) * (currentPrice.doubleValue() * 0.03) * taper;
                    double priceVal = Math.max(1.0, startPrice + (w * step) + wave1 + wave2);
                    BigDecimal p = BigDecimal.valueOf(priceVal).setScale(2, RoundingMode.HALF_UP);
                    long vol = (long) (((hash * (w + 3)) % 450000) + 120000);
                    points.add(new PricePointDto(cursor.withHour(16).withMinute(0).toInstant(), p, vol));
                }
                break;
            }
            case "ALL":
            default: {
                int founded = company != null && company.getFoundedYear() != null ? company.getFoundedYear() : 2020;
                int years = Math.max(5, Math.min(10, now.getYear() - founded));
                int totalPoints = years * 52;
                ZonedDateTime cursor = now.minusYears(years);
                double startPrice = currentPrice.doubleValue() * (0.25 + ((hash % 20) / 100.0));
                double step = (currentPrice.doubleValue() - startPrice) / totalPoints;
                for (int i = 0; i < totalPoints; i++) {
                    cursor = cursor.plusWeeks(1);
                    double progress = (double) i / (double) totalPoints;
                    double taper = 1.0 - Math.pow(progress, 2.0);
                    double macro = Math.sin((i + hash % 9) * 0.05) * (currentPrice.doubleValue() * 0.08) * taper;
                    double priceVal = Math.max(0.5, startPrice + (i * step) + macro);
                    BigDecimal p = BigDecimal.valueOf(priceVal).setScale(2, RoundingMode.HALF_UP);
                    long vol = (long) (((hash * (i + 5)) % 600000) + 200000);
                    points.add(new PricePointDto(cursor.withHour(16).withMinute(0).toInstant(), p, vol));
                }
                break;
            }
        }

        // Ensure the last point is anchored to current authoritative price
        if (!points.isEmpty()) {
            PricePointDto last = points.get(points.size() - 1);
            last.setPrice(currentPrice);
            if (!"1D".equalsIgnoreCase(range)) {
                last.setTimestamp(Instant.now());
            }
        }

        return points;
    }

    @Override
    public List<CandleDto> fetchCandles(String symbol, String interval, Instant start, Instant end) {
        List<PricePointDto> raw = fetchHistoricalPrices(symbol, "1Y");
        List<CandleDto> candles = new ArrayList<>();

        // Group into candles
        for (int i = 0; i < raw.size(); i += 5) {
            int endIdx = Math.min(i + 5, raw.size());
            List<PricePointDto> slice = raw.subList(i, endIdx);
            if (slice.isEmpty()) continue;

            BigDecimal open = slice.get(0).getPrice();
            BigDecimal close = slice.get(slice.size() - 1).getPrice();
            BigDecimal high = slice.stream().map(PricePointDto::getPrice).max(BigDecimal::compareTo).orElse(open);
            BigDecimal low = slice.stream().map(PricePointDto::getPrice).min(BigDecimal::compareTo).orElse(open);
            long vol = slice.stream().mapToLong(p -> p.getVolume() != null ? p.getVolume() : 1000L).sum();

            candles.add(CandleDto.builder()
                    .start(slice.get(0).getTimestamp())
                    .end(slice.get(slice.size() - 1).getTimestamp())
                    .open(open)
                    .high(high)
                    .low(low)
                    .close(close)
                    .volume(vol)
                    .interval(interval)
                    .isFinal(true)
                    .build());
        }

        return candles;
    }

    private BigDecimal deriveBasePrice(String symbol, String name, BigDecimal valuationNum) {
        String cleanSymbol = symbol != null ? symbol.toUpperCase().trim() : "WQ";
        int hash = cleanSymbol.chars().reduce(0, Integer::sum);
        if (valuationNum != null && valuationNum.compareTo(BigDecimal.ZERO) > 0) {
            double valDouble = valuationNum.doubleValue();
            double sharePrice = Math.max(10.0, Math.min(1500.0, valDouble / 2_500_000.0));
            return BigDecimal.valueOf(sharePrice).setScale(2, RoundingMode.HALF_UP);
        }
        double base = ((hash % 450) + 18) + ((hash % 99) / 100.0);
        return BigDecimal.valueOf(base).setScale(2, RoundingMode.HALF_UP);
    }
}
