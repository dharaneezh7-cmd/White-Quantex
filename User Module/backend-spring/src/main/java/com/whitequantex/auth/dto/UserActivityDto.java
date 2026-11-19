package com.whitequantex.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserActivityDto {
    private UUID id;
    private UUID sessionId;
    private UUID userId;
    private String activityType;
    private String activityName;
    private String path;
    private String metadata;
    private String ipAddress;
    private Instant createdAt;
}
