package com.whitequantex.company.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCompanyRequestDto {

    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 255)
    private String name;

    @NotBlank(message = "Ticker symbol is required")
    @Pattern(regexp = "^[A-Z0-9.]{1,20}$", message = "Ticker must be 1-20 uppercase alphanumeric characters")
    private String ticker;

    @NotBlank(message = "Short name is required")
    @Size(max = 100)
    private String shortName;

    @NotBlank(message = "Legal entity type is required")
    private String legalEntity;

    @NotBlank(message = "SEC CIK number is required")
    @Pattern(regexp = "^(CIK-)?[0-9]{10}$", message = "CIK must be in format CIK-0000000000 or 10 digits")
    private String cik;

    @NotBlank(message = "Sector is required")
    private String sector;

    @NotBlank(message = "Sub-industry is required")
    private String subIndustry;

    @NotBlank(message = "Headquarters location is required")
    private String headquarters;

    @NotBlank(message = "Region is required")
    private String region;

    @NotNull(message = "Founded year is required")
    @Min(1800)
    @Max(2100)
    private Integer foundedYear;

    @NotBlank(message = "CEO name is required")
    private String ceo;

    @NotNull(message = "Employee count is required")
    @Positive
    private Integer employees;

    @NotBlank(message = "Valuation is required")
    private String valuation;

    @NotNull(message = "Valuation number is required")
    @DecimalMin(value = "0.0")
    private BigDecimal valuationNum;

    @NotBlank(message = "Annual revenue is required")
    private String annualRevenue;

    @NotNull(message = "Annual revenue number is required")
    @DecimalMin(value = "0.0")
    private BigDecimal annualRevenueNum;

    private String description;

    private String logoColor;
}
