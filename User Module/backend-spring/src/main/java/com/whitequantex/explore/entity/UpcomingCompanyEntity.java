package com.whitequantex.explore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "upcoming_companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpcomingCompanyEntity {
    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String ticker;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 100)
    private String shortName;

    @Column(nullable = false, length = 100)
    private String sector;

    @Column(nullable = false, length = 50)
    private String targetValuation;

    @Column(nullable = false, length = 50)
    private String expectedDate;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String readiness = "Audit In Progress";

    @Column(nullable = false)
    @Builder.Default
    private Integer trustScore = 90;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String logoBg = "bg-indigo-600";

    @Column(nullable = false, length = 150)
    @Builder.Default
    private String legalEntity = "Delaware C-Corp";

    @Column(nullable = false, length = 150)
    private String headquarters;

    @Column(nullable = false, length = 150)
    private String ceo;

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
