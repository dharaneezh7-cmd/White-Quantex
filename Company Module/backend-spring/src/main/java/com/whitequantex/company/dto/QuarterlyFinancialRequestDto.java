package com.whitequantex.company.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuarterlyFinancialRequestDto {

    @NotBlank(message = "Quarter label is required (e.g. Q3 2026)")
    private String quarter;

    @NotNull(message = "Fiscal year is required")
    @Min(2000)
    @Max(2100)
    private Integer fiscalYear;

    @NotNull(message = "Quarter number is required (1-4)")
    @Min(1)
    @Max(4)
    private Integer quarterNumber;

    @NotNull(message = "Revenue is required")
    @DecimalMin("0.0")
    private BigDecimal revenue;

    @NotNull(message = "Profit is required")
    private BigDecimal profit;

    @NotNull(message = "Expenses is required")
    @DecimalMin("0.0")
    private BigDecimal expenses;

    private BigDecimal growthRate;

    private String milestones;
}
