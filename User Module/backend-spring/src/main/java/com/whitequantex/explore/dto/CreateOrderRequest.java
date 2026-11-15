package com.whitequantex.explore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    private String companyId;
    private String ticker;
    private Long shares;
    private BigDecimal amount;
    private BigDecimal pricePerShare;
    private String shareClass;
    private String type;
}
