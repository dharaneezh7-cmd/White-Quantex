package com.whitequantex.company.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "business_lifecycle_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessLifecycleHistoryEntity {

    @Id
    private UUID id;

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "business_name", nullable = false, length = 255)
    private String businessName;

    @Column(name = "previous_classification", nullable = false, length = 32)
    private String previousClassification;

    @Column(name = "new_classification", nullable = false, length = 32)
    private String newClassification;

    @Column(name = "previous_status", length = 32)
    private String previousStatus;

    @Column(name = "new_status", length = 32)
    private String newStatus;

    @Column(name = "transition_reason", columnDefinition = "TEXT")
    private String transitionReason;

    @Column(name = "approval_reference", length = 128)
    private String approvalReference;

    @Column(name = "performed_by", nullable = false, length = 128)
    private String performedBy;

    @Column(name = "effective_at", nullable = false)
    @Builder.Default
    private Instant effectiveAt = Instant.now();

    @Builder.Default
    private Instant createdAt = Instant.now();
}
