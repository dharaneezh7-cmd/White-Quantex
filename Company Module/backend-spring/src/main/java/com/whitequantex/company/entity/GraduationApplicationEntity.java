package com.whitequantex.company.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "graduation_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GraduationApplicationEntity {

    @Id
    private UUID id;

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "business_name", nullable = false, length = 255)
    private String businessName;

    @Column(nullable = false, length = 32)
    private String ticker;

    @Column(name = "application_status", nullable = false, length = 32)
    @Builder.Default
    private String applicationStatus = "SUBMITTED";

    @Column(name = "product_maturity_summary", columnDefinition = "TEXT")
    private String productMaturitySummary;

    @Column(name = "revenue_run_rate", length = 64)
    private String revenueRunRate;

    @Column(name = "customer_count")
    @Builder.Default
    private Integer customerCount = 0;

    @Column(name = "compliance_notes", columnDefinition = "TEXT")
    private String complianceNotes;

    @Column(name = "evidence_documents", columnDefinition = "TEXT")
    private String evidenceDocuments;

    @Column(name = "submitted_at", nullable = false)
    @Builder.Default
    private Instant submittedAt = Instant.now();

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "reviewed_by", length = 128)
    private String reviewedBy;

    @Column(length = 32)
    private String decision;

    @Column(name = "decision_reason", columnDefinition = "TEXT")
    private String decisionReason;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
