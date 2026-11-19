package com.whitequantex.company.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitVerificationRequestDto {

    private String requestType;

    private String verificationTier;

    @NotBlank(message = "Business registration number is required")
    private String businessRegistrationNumber;

    @NotBlank(message = "Tax ID / EIN is required")
    private String taxId;

    @NotBlank(message = "Incorporation jurisdiction is required")
    private String incorporationJurisdiction;

    private String submissionNotes;
}
