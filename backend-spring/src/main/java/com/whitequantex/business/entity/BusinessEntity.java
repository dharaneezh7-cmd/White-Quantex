package com.whitequantex.business.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "businesses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID ownerId;

    @Column(nullable = false)
    private String type; // STARTUP or EXISTING_COMPANY

    @Column(nullable = false)
    private String name;

    private String legalName;
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String industry;

    @Column(nullable = false)
    private String stage;

    private String location;
    private String website;
    private String logoUrl;
    private String coverImageUrl;

    @Builder.Default
    private String verificationLevel = "NONE";

    @Builder.Default
    private Integer trustScore = 50;

    @Builder.Default
    private BigDecimal fundingRaised = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal valuation = BigDecimal.ZERO;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
