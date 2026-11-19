package com.whitequantex.company.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCompanyRequestDto {

    @Size(max = 100)
    private String shortName;

    private String headquarters;

    private Integer employees;

    private String ceo;

    private String description;

    private String logoColor;

    /**
     * Optimistic locking version submitted by client (Scenario 3).
     */
    @NotNull(message = "Version is required for optimistic locking")
    private Long version;
}
