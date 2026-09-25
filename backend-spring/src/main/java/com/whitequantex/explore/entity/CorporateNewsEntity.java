package com.whitequantex.explore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "corporate_news")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorporateNewsEntity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyEntity company;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String snippet;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String sentiment = "Bullish";

    @Column(length = 100)
    private String impactMetric;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String source = "SEC Statutory Wire";

    @Column(length = 50)
    @Builder.Default
    private String readTime = "3 min read";

    @Column(length = 50)
    @Builder.Default
    private String urgency = "Medium";

    @Column(length = 100)
    private String dueDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActionRequired = false;

    @Column(length = 100)
    private String actionLabel;

    @Column(length = 50)
    private String actionType;

    @Builder.Default
    private Instant publishedAt = Instant.now();
}
