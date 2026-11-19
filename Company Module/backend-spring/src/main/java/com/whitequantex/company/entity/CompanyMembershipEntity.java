package com.whitequantex.company.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "company_memberships",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_company_membership", columnNames = {"company_id", "user_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyMembershipEntity {

    @Id
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private CompanyRole role = CompanyRole.MEMBER;

    @Column(length = 128)
    private String title;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "invited_by")
    private UUID invitedBy;

    @Builder.Default
    private Instant joinedAt = Instant.now();

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public enum CompanyRole {
        OWNER,
        ADMIN,
        OFFICER,
        MEMBER,
        AUDITOR;

        public boolean isPrivileged() {
            return this == OWNER || this == ADMIN;
        }
    }
}
