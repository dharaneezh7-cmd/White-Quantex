package com.whitequantex.business.controller;

import com.whitequantex.business.entity.BusinessEntity;
import com.whitequantex.business.repository.BusinessRepository;
import com.whitequantex.common.ApiResponse;
import com.whitequantex.common.PagedResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessRepository businessRepository;

    @GetMapping("/startups")
    public ResponseEntity<ApiResponse<PagedResponse<BusinessEntity>>> getStartups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Page<BusinessEntity> p = businessRepository.findByTypeAndIsActiveTrue("STARTUP", PageRequest.of(page, size));

        PagedResponse<BusinessEntity> response = PagedResponse.<BusinessEntity>builder()
                .content(p.getContent())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .size(p.getSize())
                .number(p.getNumber())
                .first(p.isFirst())
                .last(p.isLast())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Startups retrieved"));
    }

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<PagedResponse<BusinessEntity>>> getCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Page<BusinessEntity> p = businessRepository.findByTypeAndIsActiveTrue("EXISTING_COMPANY", PageRequest.of(page, size));

        PagedResponse<BusinessEntity> response = PagedResponse.<BusinessEntity>builder()
                .content(p.getContent())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .size(p.getSize())
                .number(p.getNumber())
                .first(p.isFirst())
                .last(p.isLast())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Companies retrieved"));
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<BusinessEntity>> getCompanyById(@PathVariable UUID id) {
        BusinessEntity b = businessRepository.findById(id).orElse(null);
        if (b == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(b, "Company retrieved"));
    }

    @GetMapping("/markets")
    public ResponseEntity<ApiResponse<List<MarketData>>> getMarkets() {
        List<MarketData> list = List.of(
            new MarketData("WQ-TECH", "WQ Deep Tech Index", "FINTECH", 1450.80, 2.45, 34.80),
            new MarketData("WQ-AI", "WQ Generative AI Fund", "AI / DEEPTECH", 2890.15, 4.12, 114.20),
            new MarketData("WQ-QUANT", "WQ Quantum Infrastructure", "QUANTUM", 920.40, -0.85, -7.90)
        );
        return ResponseEntity.ok(ApiResponse.success(list, "Markets retrieved"));
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MarketData {
        private String symbol;
        private String name;
        private String category;
        private double currentValue;
        private double changePercent;
        private double changeValue;
    }
}
