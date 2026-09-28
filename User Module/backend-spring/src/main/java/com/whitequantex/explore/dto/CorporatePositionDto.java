package com.whitequantex.explore.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorporatePositionDto {
    private UUID id;
    private UUID companyId;
    private String companyName;
    private String ticker;
    private String logoColor;
    private String sector;
    private Long shares;
    private String shareClass;
    private BigDecimal costBasis;
    private BigDecimal currentValue;
    private BigDecimal unrealizedPl;
    private BigDecimal unrealizedPlPercent;
    private BigDecimal ownershipPercent;
}
