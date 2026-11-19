package com.whitequantex.company.dto;

import com.whitequantex.company.entity.CompanyMembershipEntity.CompanyRole;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddMemberRequestDto {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Role is required")
    private CompanyRole role;

    private String title;
}
