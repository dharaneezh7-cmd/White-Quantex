package com.whitequantex.company.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;

import java.time.Instant;
import java.util.UUID;

/**
 * Read-only mapping of the existing canonical users table owned by the User Module.
 * The Company Module NEVER generates new user tables, duplicate credentials, or passwords.
 * It references existing permanent user identities by UUID.
 */
@Entity
@Table(name = "users")
@Immutable
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true)
    private String username;

    private String displayName;

    private String primaryRole;

    private String accountType;

    private String verificationLevel;

    private Integer trustScore;

    @Column(nullable = false)
    private Boolean isActive;

    private Instant createdAt;

    public String getFullName() {
        if (displayName != null && !displayName.isBlank()) {
            return displayName;
        }
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }
}
