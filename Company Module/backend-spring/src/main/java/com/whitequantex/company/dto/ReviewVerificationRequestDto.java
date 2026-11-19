package com.whitequantex.company.dto;

import com.whitequantex.company.entity.CompanyVerificationEntity.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewVerificationRequestDto {

    @NotNull(message = "Decision status is required")
    private VerificationStatus decision;

    private String reviewerNotes;
}
