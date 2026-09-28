package com.whitequantex.explore.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpcomingCompanyDto {
    private UUID id;
    private String ticker;
    private String name;
    private String shortName;
    private String sector;
    private String targetValuation;
    private String expectedDate;
    private String readiness;
    private Integer trustScore;
    private String description;
    private String logoBg;
    private String legalEntity;
    private String headquarters;
    private String ceo;
    private Integer displayOrder;
}
