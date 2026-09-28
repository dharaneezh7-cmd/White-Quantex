package com.whitequantex.explore.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WqRecommendationDto {
    private UUID id;
    private String ticker;
    private String name;
    private String shortName;
    private String sector;
    private String rating;
    private String upside;
    private Integer quantScore;
    private String valuation;
    private String annualRevenue;
    private String thesis;
    private String logoBg;
    private String legalEntity;
    private String cik;
    private String ceo;
    private Integer displayOrder;
}
