package com.whitequantex.company.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferOwnershipRequestDto {

    @NotNull(message = "New owner user ID is required")
    private UUID newOwnerUserId;

    @NotBlank(message = "Transfer justification reason is required")
    private String reason;
}
