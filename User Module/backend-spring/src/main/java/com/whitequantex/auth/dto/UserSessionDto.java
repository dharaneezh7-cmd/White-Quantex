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
public class UserSessionDto {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private String userDisplayName;
    private String ipAddress;
    private String userAgent;
    private String deviceType;
    private String browser;
    private String operatingSystem;
    private String location;
    private Boolean isActive;
    private Boolean isCurrent;
    private Instant loginAt;
    private Instant lastActivityAt;
    private Instant expiresAt;
    private Instant logoutAt;
}
