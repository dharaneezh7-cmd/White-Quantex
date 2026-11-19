package com.whitequantex.explore.controller;

import com.whitequantex.business.entity.BusinessEntity;
import com.whitequantex.business.repository.BusinessRepository;
import com.whitequantex.common.ApiResponse;
import com.whitequantex.explore.entity.*;
import com.whitequantex.explore.repository.*;
import com.whitequantex.market.dto.LiveStockQuoteDto;
import com.whitequantex.market.service.MarketPriceService;
import com.whitequantex.users.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Slf4j
public class CompanyRegistrationController {

    private final CompanyRepository companyRepository;
    private final VentureRepository ventureRepository;
    private final BusinessRepository businessRepository;
    private final CompanyMarketMetricRepository companyMarketMetricRepository;
    private final VentureMarketMetricRepository ventureMarketMetricRepository;
    private final CompanyQuarterlyFinancialRepository quarterlyFinancialRepository;
    private final MarketPriceService marketPriceService;
    private final UserRepository userRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    private UUID resolveOwnerId(String headerUserId) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                return UUID.fromString(headerUserId);
            } catch (Exception ignored) {}
        }
        return userRepository.findAll().stream().findFirst().map(u -> u.getId())
                .orElse(UUID.fromString("55555555-5555-5555-5555-555555555555"));
    }

    @GetMapping("/check-name")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkNameAvailability(@RequestParam String name) {
        String trimmed = name != null ? name.trim() : "";
        String tickerCandidate = trimmed.replaceAll("[^A-Za-z]", "").toUpperCase();
        if (tickerCandidate.length() > 4) tickerCandidate = tickerCandidate.substring(0, 4);
        if (tickerCandidate.isEmpty()) tickerCandidate = "CORP";

        boolean companyExists = companyRepository.findByTickerIgnoreCase(tickerCandidate).isPresent()
                || companyRepository.findByNameIgnoreCase(trimmed).isPresent();
        boolean ventureExists = ventureRepository.findByTickerIgnoreCase(tickerCandidate).isPresent()
                || ventureRepository.findByNameIgnoreCase(trimmed).isPresent();

        boolean available = !companyExists && !ventureExists;
        Map<String, Object> data = new HashMap<>();
        data.put("available", available);
        data.put("suggestedTicker", tickerCandidate);
        data.put("name", trimmed);

        return ResponseEntity.ok(ApiResponse.success(data, available ? "Name and ticker available" : "Name or ticker already registered"));
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<ApiResponse<CompanyEntity>> registerCompany(
            @RequestBody CompanyRegisterPayload payload,
            @RequestHeader(value = "X-WQ-User-Id", required = false) String headerUserId
    ) {
        log.info("Registering established corporate issuer: {}", payload.getName());

        String ticker = generateUniqueTicker(payload.getName(), false);
        String cik = "CIK-" + (2000000 + new Random().nextInt(800000));
        UUID companyId = UUID.randomUUID();

        BigDecimal valNum = parseAmount(payload.getValuation(), BigDecimal.valueOf(65000000));
        BigDecimal revNum = parseAmount(payload.getAnnualRevenue(), BigDecimal.valueOf(18000000));

        String valStr = payload.getValuation() != null && payload.getValuation().startsWith("$")
                ? payload.getValuation()
                : "$" + String.format("%.1fM", valNum.doubleValue() / 1_000_000.0);
        String revStr = payload.getAnnualRevenue() != null && payload.getAnnualRevenue().startsWith("$")
                ? payload.getAnnualRevenue()
                : "$" + String.format("%.1fM ARR", revNum.doubleValue() / 1_000_000.0);

        CompanyEntity company = CompanyEntity.builder()
                .id(companyId)
                .ticker(ticker)
                .name(payload.getName())
                .shortName(payload.getName().split(" ")[0])
                .legalEntity(payload.getLegalName() != null ? payload.getLegalName() : payload.getName() + " Inc. (Delaware C-Corp)")
                .cik(cik)
                .sector(payload.getIndustry() != null ? payload.getIndustry() : "Enterprise Technology")
                .subIndustry(payload.getSubIndustry() != null ? payload.getSubIndustry() : "Enterprise Software & Cloud")
                .headquarters(payload.getHeadquarters() != null ? payload.getHeadquarters() : (payload.getLocation() != null ? payload.getLocation() : "Austin, TX"))
                .region(payload.getRegion() != null ? payload.getRegion() : "North America")
                .foundedYear(payload.getFoundedYear() != null ? payload.getFoundedYear() : 2021)
                .ceo(payload.getCeo() != null ? payload.getCeo() : "Founder & CEO")
                .employees(payload.getEmployees() != null ? payload.getEmployees() : 45)
                .valuation(valStr)
                .valuationNum(valNum)
                .annualRevenue(revStr)
                .annualRevenueNum(revNum)
                .quarterlyRevenue(revNum.divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP))
                .quarterlyProfit(revNum.divide(BigDecimal.valueOf(16), 2, RoundingMode.HALF_UP))
                .verificationLevel("PLATINUM")
                .trustScore(96)
                .description(payload.getDescription())
                .logoColor(getRandomLogoColor())
                .status("Active Trading")
                .exchangeTier("Tier-1 Institutional")
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        company = companyRepository.save(company);

        // Initial Market Metrics
        CompanyMarketMetricEntity metric = CompanyMarketMetricEntity.builder()
                .id(UUID.randomUUID())
                .company(company)
                .change24h("+4.80%")
                .changePercent(BigDecimal.valueOf(4.80))
                .isPositive(true)
                .marketCapGainLoss("+$" + String.format("%.1fM", valNum.doubleValue() * 0.048 / 1_000_000.0))
                .investedToday("+$1.2M Inflow")
                .allocationPercent(84)
                .tradingVolumeToday("$3.5M Vol")
                .is52wHigh(false)
                .updatedAt(Instant.now())
                .build();
        companyMarketMetricRepository.save(metric);

        // Register Business entity
        BusinessEntity business = BusinessEntity.builder()
                .ownerId(resolveOwnerId(headerUserId))
                .type("EXISTING_COMPANY")
                .name(company.getName())
                .legalName(company.getLegalEntity())
                .tagline(payload.getTagline() != null ? payload.getTagline() : company.getSubIndustry())
                .description(company.getDescription())
                .industry(company.getSector())
                .stage(payload.getStage() != null ? payload.getStage() : "GROWTH")
                .location(company.getHeadquarters())
                .website(payload.getWebsite() != null ? payload.getWebsite() : "https://" + ticker.toLowerCase() + ".wq.io")
                .logoUrl(payload.getLogoUrl())
                .verificationLevel("PLATINUM")
                .trustScore(96)
                .valuation(valNum)
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        businessRepository.save(business);

        // Seed initial quarterly financial record
        CompanyQuarterlyFinancialEntity qf = CompanyQuarterlyFinancialEntity.builder()
                .id(UUID.randomUUID())
                .companyId(company.getId())
                .ticker(ticker)
                .quarter("Q3 2026")
                .fiscalYear(2026)
                .quarterNumber(3)
                .revenue(revNum.divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP))
                .profit(revNum.divide(BigDecimal.valueOf(16), 2, RoundingMode.HALF_UP))
                .expenses(revNum.multiply(BigDecimal.valueOf(0.1875)).setScale(2, RoundingMode.HALF_UP))
                .growthRate(BigDecimal.valueOf(18.5))
                .profitMargin(BigDecimal.valueOf(25.0))
                .milestones("Official corporate registration on White Quantex with SEC Delaware C-Corp accreditation.")
                .reportedDate(Instant.now())
                .createdAt(Instant.now())
                .build();
        quarterlyFinancialRepository.save(qf);

        // Calculate initial share price (e.g. Valuation / 1,000,000 shares)
        BigDecimal initialPrice = valNum.divide(BigDecimal.valueOf(1_000_000), 2, RoundingMode.HALF_UP);
        if (initialPrice.compareTo(BigDecimal.valueOf(5.00)) < 0) initialPrice = BigDecimal.valueOf(25.00);

        // Register quote into live real-time market system
        marketPriceService.registerNewQuote(
                company.getId(),
                ticker,
                company.getName(),
                company.getShortName(),
                company.getSector(),
                company.getLogoColor(),
                company.getValuation(),
                company.getValuationNum(),
                company.getExchangeTier(),
                false,
                initialPrice
        );

        // Notify Node / MongoDB Community of new company account
        syncCompanyToCommunity(ticker, company.getName(), company.getSector(), "COMPANY", payload.getDescription());

        return ResponseEntity.ok(ApiResponse.success(company, "Company registered successfully with official ticker " + ticker));
    }

    @PostMapping("/register-venture")
    @Transactional
    public ResponseEntity<ApiResponse<VentureEntity>> registerVenture(
            @RequestBody VentureRegisterPayload payload,
            @RequestHeader(value = "X-WQ-User-Id", required = false) String headerUserId
    ) {
        log.info("Registering innovative startup venture: {}", payload.getName());

        String ticker = generateUniqueTicker(payload.getName(), true);
        String cik = "CIK-" + (2100000 + new Random().nextInt(800000));
        UUID ventureId = UUID.randomUUID();

        BigDecimal valNum = parseAmount(payload.getValuation(), BigDecimal.valueOf(35000000));
        BigDecimal targetRaiseNum = parseAmount(payload.getTargetFunding(), BigDecimal.valueOf(8000000));
        BigDecimal raisedNum = parseAmount(payload.getFundingRaised(), BigDecimal.valueOf(4200000));

        String valStr = payload.getValuation() != null && payload.getValuation().startsWith("$")
                ? payload.getValuation()
                : "$" + String.format("%.1fM", valNum.doubleValue() / 1_000_000.0);
        String targetStr = payload.getTargetFunding() != null && payload.getTargetFunding().startsWith("$")
                ? payload.getTargetFunding()
                : "$" + String.format("%.1fM", targetRaiseNum.doubleValue() / 1_000_000.0);
        String raisedStr = payload.getFundingRaised() != null && payload.getFundingRaised().startsWith("$")
                ? payload.getFundingRaised()
                : "$" + String.format("%.1fM", raisedNum.doubleValue() / 1_000_000.0);

        VentureEntity venture = VentureEntity.builder()
                .id(ventureId)
                .ticker(ticker)
                .name(payload.getName())
                .shortName(payload.getName().split(" ")[0])
                .legalEntity(payload.getLegalName() != null ? payload.getLegalName() : payload.getName() + " Inc. (Delaware C-Corp)")
                .cik(cik)
                .sector(payload.getIndustry() != null ? payload.getIndustry() : "Fintech & Autonomous Capital")
                .subIndustry(payload.getTagline() != null ? payload.getTagline() : "Venture Scale Innovation")
                .headquarters(payload.getLocation() != null ? payload.getLocation() : "San Francisco, CA")
                .region("North America")
                .foundedYear(payload.getFoundedYear() != null ? payload.getFoundedYear() : 2023)
                .ceo(payload.getCeo() != null ? payload.getCeo() : "Lead Founder")
                .employees(payload.getEmployees() != null ? payload.getEmployees() : 8)
                .valuation(valStr)
                .valuationNum(valNum)
                .annualRevenue("$" + String.format("%.1fM ARR", valNum.doubleValue() * 0.12 / 1_000_000.0))
                .annualRevenueNum(valNum.multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP))
                .verificationLevel("GOLD")
                .trustScore(94)
                .description(payload.getDescription())
                .logoColor("bg-purple-600")
                .status((payload.getStage() != null ? payload.getStage().replace("_", " ") : "Seed") + " Round Active")
                .exchangeTier("Tier-1 Venture Syndicate")
                .roundType(payload.getStage() != null ? payload.getStage().replace("_", " ") : "Seed")
                .targetRaise(targetStr)
                .targetRaiseNum(targetRaiseNum)
                .raisedAmount(raisedStr)
                .raisedAmountNum(raisedNum)
                .minInvestment("$25,000")
                .minInvestmentNum(BigDecimal.valueOf(25000))
                .fundingPurpose(payload.getTagline() != null ? payload.getTagline() : "Venture scaling and global market expansion.")
                .securityType("Series Seed Preferred Stock")
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        venture = ventureRepository.save(venture);

        // Initial Venture Market Metrics
        VentureMarketMetricEntity metric = VentureMarketMetricEntity.builder()
                .id(UUID.randomUUID())
                .venture(venture)
                .change24h("+8.40%")
                .changePercent(BigDecimal.valueOf(8.40))
                .isPositive(true)
                .marketCapGainLoss("+$" + String.format("%.1fM", valNum.doubleValue() * 0.084 / 1_000_000.0))
                .investedToday("+$850K Inflow")
                .allocationPercent(Math.min(98, Math.max(20, (int) ((raisedNum.doubleValue() / targetRaiseNum.doubleValue()) * 100))))
                .tradingVolumeToday("$2.1M Vol")
                .is52wHigh(false)
                .updatedAt(Instant.now())
                .build();
        ventureMarketMetricRepository.save(metric);

        // Register Business entity
        BusinessEntity business = BusinessEntity.builder()
                .ownerId(resolveOwnerId(headerUserId))
                .type("STARTUP")
                .name(venture.getName())
                .legalName(venture.getLegalEntity())
                .tagline(venture.getSubIndustry())
                .description(venture.getDescription())
                .industry(venture.getSector())
                .stage(payload.getStage() != null ? payload.getStage() : "SEED")
                .location(venture.getHeadquarters())
                .website(payload.getWebsite() != null ? payload.getWebsite() : "https://" + ticker.toLowerCase() + ".wq.io")
                .logoUrl(payload.getLogoUrl())
                .verificationLevel("GOLD")
                .trustScore(94)
                .fundingRaised(raisedNum)
                .valuation(valNum)
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        businessRepository.save(business);

        // Calculate initial share price (e.g. Valuation / 1,000,000 shares)
        BigDecimal initialPrice = valNum.divide(BigDecimal.valueOf(1_000_000), 2, RoundingMode.HALF_UP);
        if (initialPrice.compareTo(BigDecimal.valueOf(2.00)) < 0) initialPrice = BigDecimal.valueOf(15.00);

        marketPriceService.registerNewQuote(
                venture.getId(),
                ticker,
                venture.getName(),
                venture.getShortName(),
                venture.getSector(),
                venture.getLogoColor(),
                venture.getValuation(),
                venture.getValuationNum(),
                venture.getExchangeTier(),
                true,
                initialPrice
        );

        // Community Account registration
        syncCompanyToCommunity(ticker, venture.getName(), venture.getSector(), "VENTURE", payload.getDescription());

        return ResponseEntity.ok(ApiResponse.success(venture, "Venture registered successfully with ticker " + ticker));
    }

    @PostMapping("/{tickerOrId}/financials")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitQuarterlyFinancials(
            @PathVariable String tickerOrId,
            @RequestBody QuarterlyFinancialPayload payload
    ) {
        log.info("Submitting quarterly financials for {}: {} - Rev: ${}, Profit: ${}",
                tickerOrId, payload.getQuarter(), payload.getRevenue(), payload.getProfit());

        CompanyEntity company = findCompany(tickerOrId);
        if (company == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Company not found for identifier: " + tickerOrId));
        }

        BigDecimal rev = payload.getRevenue() != null ? payload.getRevenue() : BigDecimal.ZERO;
        BigDecimal profit = payload.getProfit() != null ? payload.getProfit() : BigDecimal.ZERO;
        BigDecimal expenses = payload.getExpenses() != null ? payload.getExpenses() : rev.subtract(profit).max(BigDecimal.ZERO);
        BigDecimal growth = payload.getGrowthRate() != null ? payload.getGrowthRate() : BigDecimal.valueOf(15.0);
        BigDecimal margin = rev.compareTo(BigDecimal.ZERO) > 0 ? profit.multiply(BigDecimal.valueOf(100)).divide(rev, 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        String quarter = payload.getQuarter() != null ? payload.getQuarter().trim() : "Q3 2026";
        int year = payload.getFiscalYear() != null ? payload.getFiscalYear() : 2026;
        int qNum = payload.getQuarterNumber() != null ? payload.getQuarterNumber() : parseQuarterNum(quarter);

        CompanyQuarterlyFinancialEntity record = quarterlyFinancialRepository.findByCompanyIdAndQuarter(company.getId(), quarter)
                .orElse(CompanyQuarterlyFinancialEntity.builder()
                        .id(UUID.randomUUID())
                        .companyId(company.getId())
                        .ticker(company.getTicker())
                        .quarter(quarter)
                        .fiscalYear(year)
                        .quarterNumber(qNum)
                        .createdAt(Instant.now())
                        .build());

        record.setRevenue(rev);
        record.setProfit(profit);
        record.setExpenses(expenses);
        record.setGrowthRate(growth);
        record.setProfitMargin(margin);
        record.setMilestones(payload.getMilestones());
        record.setReportedDate(Instant.now());

        quarterlyFinancialRepository.save(record);

        // Apply dynamic price increase and market cap expansion based on revenue and profit
        LiveStockQuoteDto updatedQuote = marketPriceService.applyQuarterlyFinancialsUpdate(
                company.getTicker(),
                rev,
                profit,
                quarter,
                payload.getMilestones()
        );

        // Post official Corporate Earnings Milestone to Community Feed
        String postContent = String.format(
                "Official Financial Disclosure: %s ($%s) reports %s Performance. Quarterly Revenue: $%sM, Net Profit: $%sM (+%s%% Growth YoY). Milestone: %s #QuarterlyEarnings #%s #Growth",
                company.getName(),
                company.getTicker(),
                quarter,
                String.format("%.1f", rev.doubleValue() / 1_000_000.0),
                String.format("%.1f", profit.doubleValue() / 1_000_000.0),
                growth.toPlainString(),
                payload.getMilestones() != null ? payload.getMilestones() : "Robust commercial expansion and margin optimization.",
                company.getTicker()
        );

        postToCommunity(company.getTicker(), company.getName(), "COMPANY", postContent);

        Map<String, Object> result = new HashMap<>();
        result.put("financialRecord", record);
        result.put("newSharePrice", updatedQuote != null ? updatedQuote.getPrice() : null);
        result.put("newValuation", updatedQuote != null ? updatedQuote.getValuation() : company.getValuation());
        result.put("newValuationNum", updatedQuote != null ? updatedQuote.getValuationNum() : company.getValuationNum());
        result.put("changePercent", updatedQuote != null ? updatedQuote.getChangePercentStr() : "+0.00%");
        result.put("announcementPosted", true);

        return ResponseEntity.ok(ApiResponse.success(result, "Quarterly financials recorded. Market cap and share price updated dynamically."));
    }

    @GetMapping("/{tickerOrId}/financials")
    public ResponseEntity<ApiResponse<List<CompanyQuarterlyFinancialEntity>>> getQuarterlyFinancials(@PathVariable String tickerOrId) {
        CompanyEntity company = findCompany(tickerOrId);
        List<CompanyQuarterlyFinancialEntity> list;
        if (company != null) {
            list = quarterlyFinancialRepository.findByCompanyIdOrderByFiscalYearAscQuarterNumberAsc(company.getId());
        } else {
            list = quarterlyFinancialRepository.findByTickerIgnoreCaseOrderByFiscalYearAscQuarterNumberAsc(tickerOrId);
        }
        return ResponseEntity.ok(ApiResponse.success(list, "Quarterly financial records retrieved"));
    }

    @PostMapping("/{tickerOrId}/trade")
    public ResponseEntity<ApiResponse<Map<String, Object>>> tradeCompanyShares(
            @PathVariable String tickerOrId,
            @RequestBody ShareTradePayload payload
    ) {
        CompanyEntity company = findCompany(tickerOrId);
        String ticker = company != null ? company.getTicker() : tickerOrId.toUpperCase();
        long shares = payload.getShares() != null ? payload.getShares() : 100L;
        BigDecimal amount = payload.getAmount() != null ? payload.getAmount() : BigDecimal.valueOf(shares * 35.0);

        LiveStockQuoteDto updatedQuote = marketPriceService.applyTradeImpact(ticker, shares, amount);

        Map<String, Object> res = new HashMap<>();
        res.put("ticker", ticker);
        res.put("sharesPurchased", shares);
        res.put("totalAmount", amount);
        res.put("newPrice", updatedQuote != null ? updatedQuote.getPrice() : null);
        res.put("newMarketCap", updatedQuote != null ? updatedQuote.getValuation() : null);
        res.put("changePercent", updatedQuote != null ? updatedQuote.getChangePercentStr() : null);

        return ResponseEntity.ok(ApiResponse.success(res, "Shares purchased successfully. Market demand and share price increased."));
    }

    private CompanyEntity findCompany(String identifier) {
        try {
            UUID id = UUID.fromString(identifier);
            Optional<CompanyEntity> byId = companyRepository.findById(id);
            if (byId.isPresent()) return byId.get();
        } catch (Exception ignored) {}
        return companyRepository.findByTickerIgnoreCase(identifier)
                .or(() -> companyRepository.findByNameIgnoreCase(identifier))
                .orElse(null);
    }

    private String generateUniqueTicker(String name, boolean isVenture) {
        String clean = name != null ? name.replaceAll("[^A-Za-z]", "").toUpperCase() : "";
        String base = clean.length() >= 4 ? clean.substring(0, 4) : (clean + "XXXX").substring(0, 4);

        if (companyRepository.findByTickerIgnoreCase(base).isEmpty() && ventureRepository.findByTickerIgnoreCase(base).isEmpty()) {
            return base;
        }

        for (int i = 1; i <= 99; i++) {
            String candidate = (clean.length() >= 3 ? clean.substring(0, 3) : "WQX") + i;
            if (companyRepository.findByTickerIgnoreCase(candidate).isEmpty() && ventureRepository.findByTickerIgnoreCase(candidate).isEmpty()) {
                return candidate;
            }
        }
        return "WQ" + (100 + new Random().nextInt(900));
    }

    private BigDecimal parseAmount(String s, BigDecimal fallback) {
        if (s == null || s.isBlank()) return fallback;
        try {
            String clean = s.replaceAll("[^0-9.]", "");
            double val = Double.parseDouble(clean);
            if (s.toLowerCase().contains("b")) val *= 1_000_000_000.0;
            else if (s.toLowerCase().contains("m")) val *= 1_000_000.0;
            else if (s.toLowerCase().contains("k")) val *= 1_000.0;
            return BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP);
        } catch (Exception e) {
            return fallback;
        }
    }

    private int parseQuarterNum(String q) {
        if (q == null) return 1;
        if (q.contains("1")) return 1;
        if (q.contains("2")) return 2;
        if (q.contains("3")) return 3;
        if (q.contains("4")) return 4;
        return 1;
    }

    private String getRandomLogoColor() {
        String[] colors = {"bg-emerald-600", "bg-indigo-600", "bg-blue-600", "bg-purple-600", "bg-teal-600", "bg-amber-600", "bg-rose-600"};
        return colors[new Random().nextInt(colors.length)];
    }

    private void syncCompanyToCommunity(String ticker, String name, String sector, String type, String bio) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("name", name);
            body.put("username", ticker.toLowerCase());
            body.put("ticker", ticker);
            body.put("accountType", type);
            body.put("role", "CORPORATE");
            body.put("verificationLevel", "PLATINUM");
            body.put("headline", "Verified " + type + " Account @ " + name);
            body.put("bio", bio);
            body.put("location", "Delaware, United States");

            restTemplate.postForEntity("http://localhost:3001/api/members/company-profile", body, Map.class);
        } catch (Exception e) {
            log.debug("Non-blocking community sync notice: {}", e.getMessage());
        }
    }

    private void postToCommunity(String ticker, String name, String type, String content) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("content", content);
            body.put("visibility", "PUBLIC");
            body.put("postType", "UPDATE");
            body.put("authorAccountType", type);
            body.put("authorType", type);
            body.put("authorName", name);
            body.put("authorHeadline", "Corporate Account @ " + name);
            body.put("ticker", ticker);
            body.put("companyId", name);

            restTemplate.postForEntity("http://localhost:3001/api/posts", body, Map.class);
        } catch (Exception e) {
            log.debug("Non-blocking earnings community post notice: {}", e.getMessage());
        }
    }

    @Data
    public static class CompanyRegisterPayload {
        private String name;
        private String legalName;
        private String type;
        private String tagline;
        private String industry;
        private String subIndustry;
        private String stage;
        private String location;
        private String headquarters;
        private String region;
        private Integer foundedYear;
        private String ceo;
        private Integer employees;
        private String website;
        private String valuation;
        private String annualRevenue;
        private String fundingRaised;
        private String description;
        private String logoUrl;
    }

    @Data
    public static class VentureRegisterPayload {
        private String name;
        private String legalName;
        private String tagline;
        private String industry;
        private String stage;
        private String location;
        private Integer foundedYear;
        private String ceo;
        private Integer employees;
        private String website;
        private String fundingRaised;
        private String valuation;
        private String targetFunding;
        private String description;
        private String pitchDeckUrl;
        private String logoUrl;
    }

    @Data
    public static class QuarterlyFinancialPayload {
        private String quarter;
        private Integer fiscalYear;
        private Integer quarterNumber;
        private BigDecimal revenue;
        private BigDecimal profit;
        private BigDecimal expenses;
        private BigDecimal growthRate;
        private String milestones;
    }

    @Data
    public static class ShareTradePayload {
        private Long shares;
        private BigDecimal amount;
        private String orderType;
    }
}
