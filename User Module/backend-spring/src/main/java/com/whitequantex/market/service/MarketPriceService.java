package com.whitequantex.market.service;

import com.whitequantex.explore.entity.CompanyEntity;
import com.whitequantex.explore.entity.VentureEntity;
import com.whitequantex.explore.repository.CompanyRepository;
import com.whitequantex.explore.repository.VentureRepository;
import com.whitequantex.market.dto.LiveStockQuoteDto;
import com.whitequantex.market.dto.MarketIndexDto;
import com.whitequantex.market.dto.MarketUpdateEventDto;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketPriceService {

    private final CompanyRepository companyRepository;
    private final VentureRepository ventureRepository;
    private final PriceIngestionService priceIngestionService;

    private final ConcurrentHashMap<String, LiveStockQuoteDto> quotes = new ConcurrentHashMap<>();
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final AtomicLong tickCounter = new AtomicLong(0);
    private final Random random = new Random();

    private final DecimalFormat priceFormatter = new DecimalFormat("#,##0.00");
    private final DecimalFormat volumeFormatter = new DecimalFormat("#,###");

    @PostConstruct
    public void init() {
        seedInitialQuotes();
    }

    public synchronized void seedInitialQuotes() {
        if (!quotes.isEmpty()) return;

        List<CompanyEntity> companies = companyRepository.findAll();
        for (CompanyEntity c : companies) {
            if (c.getTicker() == null) continue;
            quotes.put(c.getTicker().toUpperCase(), createInitialQuote(c.getId(), c.getTicker(), c.getName(), c.getShortName(), c.getSector(), c.getLogoColor(), c.getValuation(), c.getValuationNum(), c.getExchangeTier(), false));
        }

        List<VentureEntity> ventures = ventureRepository.findAll();
        for (VentureEntity v : ventures) {
            if (v.getTicker() == null) continue;
            quotes.put(v.getTicker().toUpperCase(), createInitialQuote(v.getId(), v.getTicker(), v.getName(), v.getShortName(), v.getSector(), v.getLogoColor(), v.getValuation(), v.getValuationNum(), v.getRoundType(), true));
        }

        log.info("Initialized MarketPriceService with {} active corporate and venture quotes", quotes.size());
    }

    private LiveStockQuoteDto createInitialQuote(
            UUID id, String ticker, String name, String shortName, String sector,
            String logoColor, String valuation, BigDecimal valuationNum, String exchangeTier, boolean isVenture
    ) {
        int hash = (ticker + (name != null ? name : "WQ")).chars().reduce(0, Integer::sum);
        double base = ((hash % 450) + 18) + ((hash % 99) / 100.0);
        double changePercent = ((hash % 1500) - 650) / 100.0;
        BigDecimal basePrice = BigDecimal.valueOf(base).setScale(2, RoundingMode.HALF_UP);
        BigDecimal changePct = BigDecimal.valueOf(changePercent).setScale(2, RoundingMode.HALF_UP);
        BigDecimal changeAmt = basePrice.multiply(changePct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal openPrice = basePrice.subtract(changeAmt).setScale(2, RoundingMode.HALF_UP);
        BigDecimal high24h = basePrice.max(openPrice).multiply(BigDecimal.valueOf(1.025)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal low24h = basePrice.min(openPrice).multiply(BigDecimal.valueOf(0.975)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal high52w = basePrice.multiply(BigDecimal.valueOf(1.35)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal low52w = basePrice.multiply(BigDecimal.valueOf(0.72)).setScale(2, RoundingMode.HALF_UP);
        long volume = ((hash * 1337L) % 850000L) + 50000L;

        boolean isPositive = changePct.compareTo(BigDecimal.ZERO) >= 0;

        return LiveStockQuoteDto.builder()
                .id(id)
                .ticker(ticker.toUpperCase())
                .name(name)
                .shortName(shortName != null ? shortName : name)
                .sector(sector)
                .logoColor(logoColor != null ? logoColor : "bg-emerald-600")
                .price(basePrice)
                .priceStr(priceFormatter.format(basePrice))
                .changePercent(changePct)
                .changePercentStr((isPositive ? "+" : "") + changePct.toPlainString() + "%")
                .changeAmount(changeAmt)
                .changeAmountStr((isPositive ? "+" : "") + changeAmt.toPlainString())
                .isPositive(isPositive)
                .direction("FLAT")
                .openPrice(openPrice)
                .high24h(high24h)
                .low24h(low24h)
                .high52w(high52w)
                .low52w(low52w)
                .volumeShares(volume)
                .volumeStr(volumeFormatter.format(volume))
                .valuation(valuation)
                .valuationNum(valuationNum)
                .exchangeTier(exchangeTier)
                .isVenture(isVenture)
                .lastUpdated(Instant.now())
                .build();
    }

    @Scheduled(fixedRate = 2200)
    public void tickMarketPrices() {
        if (quotes.isEmpty()) {
            seedInitialQuotes();
            if (quotes.isEmpty()) return;
        }

        long tick = tickCounter.incrementAndGet();
        Map<String, LiveStockQuoteDto> updatedQuotes = new HashMap<>();

        List<String> tickers = new ArrayList<>(quotes.keySet());
        for (int i = 0; i < tickers.size(); i++) {
            // Nudge ~25% of tickers on each tick
            if (((tick * 7 + i * 13) % 4) == 0) {
                String ticker = tickers.get(i);
                LiveStockQuoteDto old = quotes.get(ticker);
                if (old == null) continue;

                // Random walk step between -0.65% and +0.70%
                double deltaPct = (random.nextDouble() - 0.48) * 1.35;
                BigDecimal oldPrice = old.getPrice();
                BigDecimal deltaFactor = BigDecimal.valueOf(1.0 + deltaPct / 100.0);
                BigDecimal newPrice = oldPrice.multiply(deltaFactor).setScale(2, RoundingMode.HALF_UP);
                if (newPrice.compareTo(BigDecimal.valueOf(1.00)) < 0) {
                    newPrice = BigDecimal.valueOf(1.00);
                }

                BigDecimal newChangeAmt = newPrice.subtract(old.getOpenPrice() != null ? old.getOpenPrice() : oldPrice).setScale(2, RoundingMode.HALF_UP);
                BigDecimal newChangePct = BigDecimal.ZERO;
                if (old.getOpenPrice() != null && old.getOpenPrice().compareTo(BigDecimal.ZERO) > 0) {
                    newChangePct = newChangeAmt.multiply(BigDecimal.valueOf(100)).divide(old.getOpenPrice(), 2, RoundingMode.HALF_UP);
                }
                boolean isPos = newChangePct.compareTo(BigDecimal.ZERO) >= 0;
                String dir = newPrice.compareTo(oldPrice) > 0 ? "UP" : (newPrice.compareTo(oldPrice) < 0 ? "DOWN" : "FLAT");

                BigDecimal newHigh = old.getHigh24h() != null ? old.getHigh24h().max(newPrice) : newPrice;
                BigDecimal newLow = old.getLow24h() != null ? old.getLow24h().min(newPrice) : newPrice;
                long addVolume = (random.nextInt(350) + 15) * 10L;
                long newVolume = (old.getVolumeShares() != null ? old.getVolumeShares() : 10000L) + addVolume;

                LiveStockQuoteDto updated = LiveStockQuoteDto.builder()
                        .id(old.getId())
                        .ticker(old.getTicker())
                        .name(old.getName())
                        .shortName(old.getShortName())
                        .sector(old.getSector())
                        .logoColor(old.getLogoColor())
                        .price(newPrice)
                        .priceStr(priceFormatter.format(newPrice))
                        .changePercent(newChangePct)
                        .changePercentStr((isPos ? "+" : "") + newChangePct.toPlainString() + "%")
                        .changeAmount(newChangeAmt)
                        .changeAmountStr((isPos ? "+" : "") + newChangeAmt.toPlainString())
                        .isPositive(isPos)
                        .direction(dir)
                        .openPrice(old.getOpenPrice())
                        .high24h(newHigh)
                        .low24h(newLow)
                        .high52w(old.getHigh52w())
                        .low52w(old.getLow52w())
                        .volumeShares(newVolume)
                        .volumeStr(volumeFormatter.format(newVolume))
                        .valuation(old.getValuation())
                        .valuationNum(old.getValuationNum())
                        .exchangeTier(old.getExchangeTier())
                        .isVenture(old.getIsVenture())
                        .lastUpdated(Instant.now())
                        .build();

                quotes.put(ticker, updated);
                updatedQuotes.put(ticker, updated);

                // Persist accepted price update permanently into PostgreSQL
                try {
                    priceIngestionService.ingestPriceUpdate(updated, "INSTITUTIONAL_WQX", "TICK-" + tick + "-" + ticker);
                } catch (Exception e) {
                    log.error("Failed to persist tick into database for ticker: {}", ticker, e);
                }
            }
        }

        List<MarketIndexDto> currentIndices = computeIndices(tick);

        if (!emitters.isEmpty() && !updatedQuotes.isEmpty()) {
            MarketUpdateEventDto event = MarketUpdateEventDto.builder()
                    .tick(tick)
                    .timestamp(Instant.now())
                    .indices(currentIndices)
                    .updates(updatedQuotes)
                    .build();

            broadcastToEmitters(event);
        }
    }

    public List<MarketIndexDto> computeIndices(long tick) {
        double drift1 = Math.sin((tick + 0) * 0.25) * 12.5;
        double drift2 = Math.sin((tick + 2) * 0.22) * 18.0;
        double drift3 = Math.cos((tick + 4) * 0.28) * 9.2;
        double drift4 = Math.sin((tick + 6) * 0.20) * 6.4;

        BigDecimal v1 = BigDecimal.valueOf(4892.40 + drift1).setScale(2, RoundingMode.HALF_UP);
        BigDecimal v2 = BigDecimal.valueOf(6214.15 + drift2).setScale(2, RoundingMode.HALF_UP);
        BigDecimal v3 = BigDecimal.valueOf(3410.80 + drift3).setScale(2, RoundingMode.HALF_UP);
        BigDecimal v4 = BigDecimal.valueOf(1984.30 + drift4).setScale(2, RoundingMode.HALF_UP);

        double chg1 = 1.24 + Math.sin(tick * 0.15) * 0.35;
        double chg2 = 2.01 + Math.sin(tick * 0.18) * 0.40;
        double chg3 = -0.42 + Math.cos(tick * 0.14) * 0.25;
        double chg4 = 0.78 + Math.sin(tick * 0.12) * 0.20;

        return List.of(
                MarketIndexDto.builder()
                        .symbol("WQ100")
                        .name("WQ Composite 100")
                        .value(v1)
                        .valueStr(priceFormatter.format(v1))
                        .changePercent(BigDecimal.valueOf(chg1).setScale(2, RoundingMode.HALF_UP))
                        .changeStr((chg1 >= 0 ? "+" : "") + String.format("%.2f%%", chg1))
                        .isPositive(chg1 >= 0)
                        .volume("$1.48B")
                        .build(),
                MarketIndexDto.builder()
                        .symbol("WQAI")
                        .name("WQ DeepTech AI Index")
                        .value(v2)
                        .valueStr(priceFormatter.format(v2))
                        .changePercent(BigDecimal.valueOf(chg2).setScale(2, RoundingMode.HALF_UP))
                        .changeStr((chg2 >= 0 ? "+" : "") + String.format("%.2f%%", chg2))
                        .isPositive(chg2 >= 0)
                        .volume("$642.1M")
                        .build(),
                MarketIndexDto.builder()
                        .symbol("WQXF")
                        .name("WQ Fintech 25")
                        .value(v3)
                        .valueStr(priceFormatter.format(v3))
                        .changePercent(BigDecimal.valueOf(chg3).setScale(2, RoundingMode.HALF_UP))
                        .changeStr((chg3 >= 0 ? "+" : "") + String.format("%.2f%%", chg3))
                        .isPositive(chg3 >= 0)
                        .volume("$489.3M")
                        .build(),
                MarketIndexDto.builder()
                        .symbol("WQGRN")
                        .name("WQ CleanEnergy")
                        .value(v4)
                        .valueStr(priceFormatter.format(v4))
                        .changePercent(BigDecimal.valueOf(chg4).setScale(2, RoundingMode.HALF_UP))
                        .changeStr((chg4 >= 0 ? "+" : "") + String.format("%.2f%%", chg4))
                        .isPositive(chg4 >= 0)
                        .volume("$310.5M")
                        .build()
        );
    }

    public SseEmitter subscribeStream() {
        SseEmitter emitter = new SseEmitter(180_000L); // 3 minutes timeout with auto-reconnect

        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> {
            emitter.complete();
            emitters.remove(emitter);
        });
        emitter.onError(e -> {
            emitter.complete();
            emitters.remove(emitter);
        });

        // Send initial heartbeat & full snapshot on connection
        try {
            MarketUpdateEventDto initialSnapshot = MarketUpdateEventDto.builder()
                    .tick(tickCounter.get())
                    .timestamp(Instant.now())
                    .indices(computeIndices(tickCounter.get()))
                    .updates(quotes)
                    .build();
            emitter.send(SseEmitter.event().name("market-init").data(initialSnapshot));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    private void broadcastToEmitters(MarketUpdateEventDto event) {
        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("market-tick").data(event));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
        }
    }

    public Map<String, LiveStockQuoteDto> getAllQuotes() {
        if (quotes.isEmpty()) seedInitialQuotes();
        return Collections.unmodifiableMap(quotes);
    }

    public List<LiveStockQuoteDto> getCompanyStockQuotes() {
        if (quotes.isEmpty()) seedInitialQuotes();
        return quotes.values().stream()
                .filter(q -> Boolean.FALSE.equals(q.getIsVenture()))
                .sorted(Comparator.comparing(LiveStockQuoteDto::getTicker))
                .collect(Collectors.toList());
    }

    public List<LiveStockQuoteDto> getVentureQuotes() {
        if (quotes.isEmpty()) seedInitialQuotes();
        return quotes.values().stream()
                .filter(q -> Boolean.TRUE.equals(q.getIsVenture()))
                .sorted(Comparator.comparing(LiveStockQuoteDto::getTicker))
                .collect(Collectors.toList());
    }

    public LiveStockQuoteDto getQuote(String ticker) {
        if (ticker == null) return null;
        if (quotes.isEmpty()) seedInitialQuotes();
        return quotes.get(ticker.toUpperCase());
    }
}
