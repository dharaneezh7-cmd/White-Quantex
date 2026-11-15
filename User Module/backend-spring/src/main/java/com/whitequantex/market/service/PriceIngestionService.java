package com.whitequantex.market.service;

import com.whitequantex.explore.entity.CompanyEntity;
import com.whitequantex.explore.repository.CompanyRepository;
import com.whitequantex.market.dto.LiveStockQuoteDto;
import com.whitequantex.market.entity.*;
import com.whitequantex.market.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PriceIngestionService {

    private final CompanyPriceCurrentRepository currentRepo;
    private final CompanyPriceHistoryRepository historyRepo;
    private final CompanyPriceCandleRepository candleRepo;
    private final MarketDataIngestionLogRepository logRepo;
    private final CompanyRepository companyRepository;

    @Transactional
    public boolean ingestPriceUpdate(LiveStockQuoteDto update, String source, String sourceEventId) {
        if (update == null || update.getTicker() == null || update.getPrice() == null) {
            log.warn("Rejected null or invalid price update");
            return false;
        }

        String symbol = update.getTicker().toUpperCase();
        BigDecimal price = update.getPrice().setScale(4, RoundingMode.HALF_UP);
        Instant timestamp = update.getLastUpdated() != null ? update.getLastUpdated() : Instant.now();

        // 1. Validation: price must be positive
        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            recordLog(source, symbol, "VALIDATE_FAILED", 1, 0, 1, 0, "Price must be strictly positive");
            return false;
        }

        // 2. Canonical instrument & company lookup
        Optional<CompanyEntity> companyOpt = companyRepository.findByTickerIgnoreCase(symbol);
        UUID companyId = companyOpt.map(CompanyEntity::getId).orElse(null);
        String instrumentId = "WQ-" + symbol;

        // 3. Deduplication check
        if (sourceEventId != null && historyRepo.existsBySymbolIgnoreCaseAndSourceAndSourceEventId(symbol, source, sourceEventId)) {
            recordLog(source, symbol, "DEDUPLICATED", 1, 0, 0, 1, "Duplicate source event: " + sourceEventId);
            return false;
        }

        // 4. Check out-of-order delivery
        Optional<CompanyPriceCurrentEntity> currentOpt = currentRepo.findBySymbolIgnoreCase(symbol);
        if (currentOpt.isPresent()) {
            CompanyPriceCurrentEntity curr = currentOpt.get();
            if (curr.getPriceTimestamp() != null && timestamp.isBefore(curr.getPriceTimestamp())) {
                log.info("Received out-of-order historical tick for {} at {}, current latest is {}", symbol, timestamp, curr.getPriceTimestamp());
                // Store historical record but do NOT overwrite current latest price
                persistHistoryRecord(companyId, instrumentId, symbol, price, update.getVolumeShares(), source, sourceEventId, timestamp);
                return true;
            }
        }

        // 5. Persist Historical Observation
        persistHistoryRecord(companyId, instrumentId, symbol, price, update.getVolumeShares(), source, sourceEventId, timestamp);

        // 6. Update or Create Current Authoritative Record
        CompanyPriceCurrentEntity current = currentOpt.orElseGet(() -> CompanyPriceCurrentEntity.builder()
                .companyId(companyId)
                .instrumentId(instrumentId)
                .symbol(symbol)
                .currency("USD")
                .provider(source)
                .dataStatus("LIVE")
                .marketStatus("OPEN")
                .build());

        BigDecimal dayOpen = current.getDayOpen() != null ? current.getDayOpen() : update.getOpenPrice();
        if (dayOpen == null) dayOpen = price;

        BigDecimal dayHigh = current.getDayHigh() != null ? current.getDayHigh().max(price) : price;
        BigDecimal dayLow = current.getDayLow() != null ? current.getDayLow().min(price) : price;
        BigDecimal prevClose = current.getPrevClose() != null ? current.getPrevClose() : dayOpen;

        BigDecimal changeAmt = price.subtract(prevClose).setScale(4, RoundingMode.HALF_UP);
        BigDecimal changePct = BigDecimal.ZERO;
        if (prevClose.compareTo(BigDecimal.ZERO) > 0) {
            changePct = changeAmt.multiply(BigDecimal.valueOf(100)).divide(prevClose, 4, RoundingMode.HALF_UP);
        }

        current.setLatestPrice(price);
        current.setPriceTimestamp(timestamp);
        current.setDayOpen(dayOpen);
        current.setDayHigh(dayHigh);
        current.setDayLow(dayLow);
        current.setPrevClose(prevClose);
        current.setChangeAmount(changeAmt);
        current.setChangePercent(changePct);
        current.setVolumeShares(update.getVolumeShares() != null ? update.getVolumeShares() : 0L);
        current.setUpdatedAt(Instant.now());

        currentRepo.save(current);
        return true;
    }

    private void persistHistoryRecord(
            UUID companyId, String instrumentId, String symbol,
            BigDecimal price, Long volume, String source, String sourceEventId, Instant timestamp
    ) {
        CompanyPriceHistoryEntity hist = CompanyPriceHistoryEntity.builder()
                .companyId(companyId)
                .instrumentId(instrumentId)
                .symbol(symbol)
                .price(price)
                .volume(volume != null ? volume : 0L)
                .currency("USD")
                .source(source)
                .sourceEventId(sourceEventId)
                .priceTimestamp(timestamp)
                .receivedAt(Instant.now())
                .dataStatus("HISTORICAL")
                .createdAt(Instant.now())
                .build();
        historyRepo.save(hist);
    }

    private void recordLog(String provider, String symbol, String op, int rcv, int acc, int rej, int dedup, String err) {
        try {
            MarketDataIngestionLogEntity l = MarketDataIngestionLogEntity.builder()
                    .provider(provider)
                    .symbol(symbol)
                    .operation(op)
                    .startedAt(Instant.now())
                    .completedAt(Instant.now())
                    .recordsReceived(rcv)
                    .recordsAccepted(acc)
                    .recordsRejected(rej)
                    .recordsDeduplicated(dedup)
                    .status(rej > 0 ? "REJECTED" : "SUCCESS")
                    .errorDetails(err)
                    .build();
            logRepo.save(l);
        } catch (Exception e) {
            log.error("Failed to persist ingestion log", e);
        }
    }
}
