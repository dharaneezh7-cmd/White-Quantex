package com.whitequantex.company.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitGraduationRequestDto {

    @NotBlank(message = "Maturity summary is required")
    private String maturitySummary;

    @NotNull(message = "Annual revenue run rate is required")
    @DecimalMin(value = "0.0")
    private BigDecimal revenueRunRate;

    @NotNull(message = "Customer count is required")
    @PositiveOrZero
    private Integer customerCount;
}
