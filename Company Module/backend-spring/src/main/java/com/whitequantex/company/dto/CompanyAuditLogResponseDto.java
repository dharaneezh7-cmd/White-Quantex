package com.whitequantex.company.dto;

import com.whitequantex.company.entity.CompanyAuditLogEntity;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyAuditLogResponseDto {

    private UUID id;
    private UUID companyId;
    private UUID actorUserId;
    private String action;
    private String previousState;
    private String newState;
    private String ipAddress;
    private String correlationId;
    private Instant createdAt;

    public static CompanyAuditLogResponseDto fromEntity(CompanyAuditLogEntity entity) {
        if (entity == null) return null;
        return CompanyAuditLogResponseDto.builder()
                .id(entity.getId())
                .companyId(entity.getCompanyId())
                .actorUserId(entity.getActorUserId())
                .action(entity.getAction())
                .previousState(entity.getPreviousState())
                .newState(entity.getNewState())
                .ipAddress(entity.getIpAddress())
                .correlationId(entity.getCorrelationId())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
