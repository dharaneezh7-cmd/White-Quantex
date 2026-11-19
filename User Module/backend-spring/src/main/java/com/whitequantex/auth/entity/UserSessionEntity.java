package com.whitequantex.auth.entity;

import com.whitequantex.users.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "session_token", nullable = false, unique = true, length = 500)
    private String sessionToken;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "device_type", length = 50)
    @Builder.Default
    private String deviceType = "Desktop";

    @Column(name = "browser", length = 100)
    @Builder.Default
    private String browser = "Unknown Browser";

    @Column(name = "operating_system", length = 100)
    @Builder.Default
    private String operatingSystem = "Unknown OS";

    @Column(name = "location", length = 150)
    @Builder.Default
    private String location = "Local Network";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "login_at", nullable = false)
    @Builder.Default
    private Instant loginAt = Instant.now();

    @Column(name = "last_activity_at", nullable = false)
    @Builder.Default
    private Instant lastActivityAt = Instant.now();

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "logout_at")
    private Instant logoutAt;
}
