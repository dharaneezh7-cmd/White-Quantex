package com.whitequantex.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private UUID id;
    private String wqUserId;
    private String email;
    private String displayName;
    private String firstName;
    private String lastName;
    private String username;
    private String headline;
    private String bio;
    private String location;
    private String website;
    private String linkedinUrl;
    private String twitterUrl;
    private String githubUrl;
    private String phone;
    private String country;
    private String primaryRole;
    private String avatarUrl;
}
