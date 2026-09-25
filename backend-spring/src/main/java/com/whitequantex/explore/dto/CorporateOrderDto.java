package com.whitequantex.explore.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorporateOrderDto {
    private UUID id;
    private UUID companyId;
    private String companyName;
    private String ticker;
    private String logoColor;
    private String orderNumber;
    private String type;
    private String shareClass;
    private Long shares;
    private BigDecimal pricePerShare;
    private BigDecimal totalAmount;
    private String status;
    private String settlementStatus;
    private Instant executedAt;
}
