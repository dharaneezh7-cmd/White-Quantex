package com.whitequantex.market.provider;

import com.whitequantex.market.dto.CandleDto;
import com.whitequantex.market.dto.LiveStockQuoteDto;
import com.whitequantex.market.dto.PricePointDto;

import java.time.Instant;
import java.util.List;

public interface MarketDataProvider {
    String getProviderName();
    boolean isLive();
    String getDataStatus();

    LiveStockQuoteDto fetchLatestQuote(String symbol);
    List<PricePointDto> fetchHistoricalPrices(String symbol, String range);
    List<CandleDto> fetchCandles(String symbol, String interval, Instant start, Instant end);
}
