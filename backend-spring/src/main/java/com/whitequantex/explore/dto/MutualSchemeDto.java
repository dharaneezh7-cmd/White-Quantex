package com.whitequantex.explore.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MutualSchemeDto {
    private UUID id;
    private String code;
    private String name;
    private String strategy;
    private String nav;
    private String oneYearReturn;
    private String minInvestment;
    private String aum;
    private String riskLevel;
    private String manager;
    private List<String> topHoldings;
    private String description;
    private String benchmark;
    private String expenseRatio;
    private Integer displayOrder;
}
