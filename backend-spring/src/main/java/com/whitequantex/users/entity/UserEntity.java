package com.whitequantex.users.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true)
    private String username;

    private String displayName;
    private String headline;
    private String bio;
    private String avatarUrl;
    private String coverImageUrl;
    private String location;
    private String website;
    private String linkedinUrl;
    private String twitterUrl;
    private String githubUrl;
    private String phone;
    private String country;

    @Builder.Default
    private String primaryRole = "FOUNDER";

    @Builder.Default
    private String accountType = "individual";

    @Builder.Default
    private String verificationLevel = "NONE";

    @Builder.Default
    private String kycStatus = "NONE";

    @Builder.Default
    private Integer trustScore = 50;

    @Builder.Default
    private Boolean twoFactorEnabled = false;

    @Builder.Default
    private Boolean isEmailVerified = false;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
