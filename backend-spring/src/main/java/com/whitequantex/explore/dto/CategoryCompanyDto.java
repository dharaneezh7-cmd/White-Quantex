package com.whitequantex.explore.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCompanyDto {
    private UUID id;
    private Integer rank;
    private String name;
    private String shortName;
    private String ticker;
    private String logoText;
    private String logoBg;
    private String sector;
    private String metricLabel;
    private String metricValue;
    private String subMetric;
    private String change;
    private Boolean isPositive;
    private String valuation;
    private String investedToday;
    private Integer percentFunded;
    private String volume;
    private String cik;
}
