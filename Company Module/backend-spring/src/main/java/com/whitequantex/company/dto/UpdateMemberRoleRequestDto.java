package com.whitequantex.company.dto;

import com.whitequantex.company.entity.CompanyMembershipEntity.CompanyRole;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMemberRoleRequestDto {

    @NotNull(message = "Role is required")
    private CompanyRole role;

    private String title;

    private Boolean isActive;
}
