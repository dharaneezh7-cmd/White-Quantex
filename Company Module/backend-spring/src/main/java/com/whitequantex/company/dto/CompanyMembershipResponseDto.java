package com.whitequantex.company.dto;

import com.whitequantex.company.entity.CompanyMembershipEntity;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyMembershipResponseDto {

    private UUID id;
    private UUID companyId;
    private UUID userId;
    private String role;
    private String title;
    private Boolean isActive;
    private UUID invitedBy;
    private Instant joinedAt;
    private Instant createdAt;

    public static CompanyMembershipResponseDto fromEntity(CompanyMembershipEntity entity) {
        if (entity == null) return null;
        return CompanyMembershipResponseDto.builder()
                .id(entity.getId())
                .companyId(entity.getCompanyId())
                .userId(entity.getUserId())
                .role(entity.getRole() != null ? entity.getRole().name() : null)
                .title(entity.getTitle())
                .isActive(entity.getIsActive())
                .invitedBy(entity.getInvitedBy())
                .joinedAt(entity.getJoinedAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
