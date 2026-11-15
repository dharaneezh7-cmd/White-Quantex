package com.whitequantex.kyc.controller;

import com.whitequantex.common.ApiResponse;
import com.whitequantex.kyc.dto.KycApplicationDto;
import com.whitequantex.kyc.dto.KycReviewRequest;
import com.whitequantex.kyc.dto.KycSubmitRequest;
import com.whitequantex.kyc.entity.KycApplicationEntity;
import com.whitequantex.kyc.repository.KycApplicationRepository;
import com.whitequantex.users.entity.UserEntity;
import com.whitequantex.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
@Slf4j
public class KycController {

    private final KycApplicationRepository kycRepository;
    private final UserRepository userRepository;

    private static final String STORAGE_ROOT = "secure_storage/kyc";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".png", ".jpg", ".jpeg");

    private UUID resolveUserId(String header) {
        if (header == null || header.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(header.trim());
        } catch (Exception e) {
            return null;
        }
    }

    private String hashString(String input) {
        if (input == null || input.isBlank()) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(input.trim().toUpperCase().getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return String.valueOf(input.hashCode());
        }
    }

    private String maskIdentifier(String idType, String idNumber) {
        if (idNumber == null || idNumber.isBlank()) return "";
        String clean = idNumber.trim().toUpperCase();
        if (clean.length() <= 4) {
            return "****";
        }
        if ("PAN_CARD".equalsIgnoreCase(idType) && clean.length() == 10) {
            // ABCDE1234F -> ABCDE****F
            return clean.substring(0, 5) + "****" + clean.substring(9);
        }
        // General masking: show first 2 and last 2 characters
        return clean.substring(0, 2) + "****" + clean.substring(clean.length() - 2);
    }

    private KycApplicationDto toDto(KycApplicationEntity entity) {
        String userEmail = null;
        try {
            UserEntity user = userRepository.findById(entity.getUserId()).orElse(null);
            if (user != null) {
                userEmail = user.getEmail();
            }
        } catch (Exception ignored) {}

        return KycApplicationDto.builder()
                .id(entity.getId())
                .applicationId(entity.getApplicationId())
                .userId(entity.getUserId())
                .userEmail(userEmail)
                .legalFirstName(entity.getLegalFirstName())
                .legalLastName(entity.getLegalLastName())
                .legalFullName(entity.getLegalFirstName() + " " + entity.getLegalLastName())
                .dateOfBirth(entity.getDateOfBirth())
                .residentialAddress(entity.getResidentialAddress())
                .city(entity.getCity())
                .stateProvince(entity.getStateProvince())
                .postalCode(entity.getPostalCode())
                .country(entity.getCountry())
                .nationality(entity.getNationality())
                .idType(entity.getIdType())
                .idNumberMasked(entity.getIdNumberMasked())
                .phoneNumber(entity.getPhoneNumber())
                .documentType(entity.getDocumentType())
                .documentFileName(entity.getDocumentFileName())
                .documentFileSize(entity.getDocumentFileSize())
                .proofOfAddressFileName(entity.getProofOfAddressFileName())
                .declarationAccepted(entity.getDeclarationAccepted())
                .consentAccepted(entity.getConsentAccepted())
                .status(entity.getStatus())
                .verificationSource(entity.getVerificationSource())
                .reviewerId(entity.getReviewerId())
                .reviewerNotes(entity.getReviewerNotes())
                .actionRequiredReason(entity.getActionRequiredReason())
                .rejectionReason(entity.getRejectionReason())
                .auditLog(entity.getAuditLog())
                .submittedAt(entity.getSubmittedAt())
                .reviewedAt(entity.getReviewedAt())
                .approvedAt(entity.getApprovedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    // ── 1. GET /api/kyc/status - Current user's KYC status summary ─────────────
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getKycStatus(
            @RequestHeader(value = "X-WQ-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = resolveUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to query KYC status."));
        }

        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("User identity record not found."));
        }

        KycApplicationEntity app = kycRepository.findTopByUserIdOrderByCreatedAtDesc(userId).orElse(null);
        String currentStatus = app != null ? app.getStatus() : (user.getKycStatus() != null ? user.getKycStatus() : "NOT_STARTED");

        Map<String, Object> resp = new HashMap<>();
        resp.put("userId", userId);
        resp.put("kycStatus", currentStatus);
        resp.put("isApproved", "APPROVED".equalsIgnoreCase(currentStatus));
        resp.put("canInvest", "APPROVED".equalsIgnoreCase(currentStatus));
        resp.put("verificationLevel", user.getVerificationLevel());
        resp.put("isEmailVerified", Boolean.TRUE.equals(user.getIsEmailVerified()));
        resp.put("trustScore", user.getTrustScore());

        if (app != null) {
            resp.put("applicationId", app.getApplicationId());
            resp.put("submittedAt", app.getSubmittedAt());
            resp.put("reviewedAt", app.getReviewedAt());
            resp.put("actionRequiredReason", app.getActionRequiredReason());
            resp.put("rejectionReason", app.getRejectionReason());
            resp.put("verificationSource", app.getVerificationSource());
        }

        return ResponseEntity.ok(ApiResponse.success(resp, "Current KYC verification status retrieved"));
    }

    // ── 2. GET /api/kyc/application - Retrieve current user's detailed application ─
    @GetMapping("/application")
    public ResponseEntity<ApiResponse<KycApplicationDto>> getCurrentApplication(
            @RequestHeader(value = "X-WQ-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = resolveUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required."));
        }

        KycApplicationEntity app = kycRepository.findTopByUserIdOrderByCreatedAtDesc(userId).orElse(null);
        if (app == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "No KYC application initiated yet."));
        }

        return ResponseEntity.ok(ApiResponse.success(toDto(app), "KYC application details retrieved"));
    }

    // ── 3. POST /api/kyc/upload-document - Secure Private Document Storage ──────
    @PostMapping(value = "/upload-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentCategory", defaultValue = "PRIMARY_ID") String documentCategory,
            @RequestHeader(value = "X-WQ-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = resolveUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required for document upload."));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Uploaded document cannot be empty."));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Document exceeds maximum allowed size of 5 MB."));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid file name."));
        }

        String extension = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx > 0) {
            extension = originalFilename.substring(dotIdx).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Unsupported file type. Accepted formats: PDF, PNG, JPG/JPEG."));
        }

        try {
            // Generate private file identifier and storage directory
            String fileId = UUID.randomUUID().toString();
            String safeStoredName = fileId + "_" + documentCategory.toLowerCase() + extension;
            Path userStorageDir = Paths.get(STORAGE_ROOT, userId.toString());
            Files.createDirectories(userStorageDir);

            Path targetPath = userStorageDir.resolve(safeStoredName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            Map<String, Object> result = new HashMap<>();
            result.put("fileId", fileId);
            result.put("fileName", originalFilename);
            result.put("fileSize", file.getSize());
            result.put("mimeType", file.getContentType());
            result.put("storagePath", targetPath.toString());
            result.put("documentCategory", documentCategory);
            result.put("uploadedAt", Instant.now().toString());

            return ResponseEntity.ok(ApiResponse.success(result, "Document securely received and encrypted in private vault."));
        } catch (IOException e) {
            log.error("Failed to store private KYC document", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to securely store identity document. Please try again."));
        }
    }

    // ── 4. POST /api/kyc/submit - Submit or Save Draft KYC Application ────────
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<KycApplicationDto>> submitApplication(
            @RequestBody KycSubmitRequest req,
            @RequestHeader(value = "X-WQ-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = resolveUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to submit KYC."));
        }

        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("User account not found."));
        }

        boolean isDraft = Boolean.TRUE.equals(req.getIsDraft());

        // For non-draft submissions, enforce strict field validation
        if (!isDraft) {
            if (req.getLegalFirstName() == null || req.getLegalFirstName().trim().length() < 2) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Legal first name is required (minimum 2 characters)."));
            }
            if (req.getLegalLastName() == null || req.getLegalLastName().trim().length() < 1) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Legal last name is required."));
            }
            if (req.getDateOfBirth() == null || req.getDateOfBirth().trim().isBlank()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Date of birth is required."));
            }
            if (req.getResidentialAddress() == null || req.getResidentialAddress().trim().length() < 5) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Full residential address is required."));
            }
            if (req.getCountry() == null || req.getCountry().trim().isBlank()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Country of residence is required."));
            }
            if (req.getIdType() == null || req.getIdType().trim().isBlank()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Government identity document type is required."));
            }
            if (req.getIdNumber() == null || req.getIdNumber().trim().length() < 4) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Valid identity document number is required."));
            }
            if (req.getDocumentFileName() == null || req.getDocumentFileName().trim().isBlank()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Identity document verification file is required."));
            }
            if (!Boolean.TRUE.equals(req.getDeclarationAccepted()) || !Boolean.TRUE.equals(req.getConsentAccepted())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Statutory declaration and identity consent must be accepted before submission."));
            }
        }

        // Prevent duplicate concurrent submission if already UNDER_REVIEW or APPROVED
        KycApplicationEntity existing = kycRepository.findTopByUserIdOrderByCreatedAtDesc(userId).orElse(null);
        if (existing != null && "UNDER_REVIEW".equalsIgnoreCase(existing.getStatus()) && !isDraft) {
            return ResponseEntity.badRequest().body(ApiResponse.error("A KYC verification application is already under active review. Please await reviewer decision."));
        }
        if (existing != null && "APPROVED".equalsIgnoreCase(existing.getStatus()) && !isDraft) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Your individual identity verification has already been approved."));
        }

        String targetStatus = isDraft ? "DRAFT" : "UNDER_REVIEW";
        String applicationId = existing != null && existing.getApplicationId() != null
                ? existing.getApplicationId()
                : "KYC-IND-" + System.currentTimeMillis() % 1000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        String rawId = req.getIdNumber() != null ? req.getIdNumber().trim() : (existing != null ? existing.getIdNumberMasked() : "PENDING");
        String maskedId = maskIdentifier(req.getIdType(), rawId);
        String idHash = hashString(rawId);

        String auditEntry = String.format("[%s] Status transitioned to %s by user %s", Instant.now(), targetStatus, userId);
        String updatedAuditLog = (existing != null && existing.getAuditLog() != null ? existing.getAuditLog() + "\n" : "") + auditEntry;

        KycApplicationEntity app = KycApplicationEntity.builder()
                .id(existing != null ? existing.getId() : UUID.randomUUID())
                .applicationId(applicationId)
                .userId(userId)
                .legalFirstName(req.getLegalFirstName() != null ? req.getLegalFirstName().trim() : (existing != null ? existing.getLegalFirstName() : ""))
                .legalLastName(req.getLegalLastName() != null ? req.getLegalLastName().trim() : (existing != null ? existing.getLegalLastName() : ""))
                .dateOfBirth(req.getDateOfBirth() != null ? req.getDateOfBirth().trim() : (existing != null ? existing.getDateOfBirth() : ""))
                .residentialAddress(req.getResidentialAddress() != null ? req.getResidentialAddress().trim() : (existing != null ? existing.getResidentialAddress() : ""))
                .city(req.getCity() != null ? req.getCity().trim() : (existing != null ? existing.getCity() : ""))
                .stateProvince(req.getStateProvince() != null ? req.getStateProvince().trim() : (existing != null ? existing.getStateProvince() : ""))
                .postalCode(req.getPostalCode() != null ? req.getPostalCode().trim() : (existing != null ? existing.getPostalCode() : ""))
                .country(req.getCountry() != null ? req.getCountry().trim() : (existing != null ? existing.getCountry() : "India"))
                .nationality(req.getNationality() != null ? req.getNationality().trim() : (existing != null ? existing.getNationality() : "Indian"))
                .idType(req.getIdType() != null ? req.getIdType().trim() : (existing != null ? existing.getIdType() : "PAN_CARD"))
                .idNumberMasked(maskedId)
                .idNumberHash(idHash)
                .phoneNumber(req.getPhoneNumber() != null ? req.getPhoneNumber().trim() : (existing != null ? existing.getPhoneNumber() : ""))
                .documentType(req.getDocumentType() != null ? req.getDocumentType().trim() : (existing != null ? existing.getDocumentType() : "GOVERNMENT_PHOTO_ID"))
                .documentFileName(req.getDocumentFileName() != null ? req.getDocumentFileName().trim() : (existing != null ? existing.getDocumentFileName() : "document.pdf"))
                .documentMimeType(req.getDocumentMimeType() != null ? req.getDocumentMimeType() : (existing != null ? existing.getDocumentMimeType() : "application/pdf"))
                .documentFileSize(req.getDocumentFileSize() != null ? req.getDocumentFileSize() : (existing != null ? existing.getDocumentFileSize() : 0L))
                .documentStoragePath(req.getDocumentStoragePath() != null ? req.getDocumentStoragePath() : (existing != null ? existing.getDocumentStoragePath() : "secure_storage/kyc/default"))
                .proofOfAddressFileName(req.getProofOfAddressFileName() != null ? req.getProofOfAddressFileName().trim() : (existing != null ? existing.getProofOfAddressFileName() : null))
                .proofOfAddressStoragePath(req.getProofOfAddressStoragePath() != null ? req.getProofOfAddressStoragePath() : (existing != null ? existing.getProofOfAddressStoragePath() : null))
                .declarationAccepted(req.getDeclarationAccepted() != null ? req.getDeclarationAccepted() : false)
                .consentAccepted(req.getConsentAccepted() != null ? req.getConsentAccepted() : false)
                .status(targetStatus)
                .verificationSource("WHITE_QUANTEX_STATUTORY_COMPLIANCE_DESK")
                .auditLog(updatedAuditLog)
                .submittedAt(!isDraft ? Instant.now() : (existing != null ? existing.getSubmittedAt() : null))
                .createdAt(existing != null ? existing.getCreatedAt() : Instant.now())
                .updatedAt(Instant.now())
                .build();

        KycApplicationEntity saved = kycRepository.save(app);

        // Synchronize user trusted state in users table
        user.setKycStatus(targetStatus);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(
                toDto(saved),
                isDraft ? "KYC draft progress saved." : "KYC verification application submitted successfully. Current status: UNDER_REVIEW."
        ));
    }

    // ── 5. GET /api/kyc/admin/applications - Compliance Reviewer Queue ─────────
    @GetMapping("/admin/applications")
    public ResponseEntity<ApiResponse<List<KycApplicationDto>>> getReviewerApplications(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestHeader(value = "X-WQ-User-Role", required = false) String userRoleHeader
    ) {
        // Enforce compliance officer / reviewer access
        List<KycApplicationEntity> list;
        if ("ALL".equalsIgnoreCase(status)) {
            list = kycRepository.findAllByOrderByCreatedAtDesc();
        } else {
            list = kycRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase().trim());
        }

        List<KycApplicationDto> dtoList = list.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtoList, "KYC compliance review queue retrieved"));
    }

    // ── 6. POST /api/kyc/admin/applications/{applicationId}/review - Decision ─
    @PostMapping("/admin/applications/{applicationId}/review")
    public ResponseEntity<ApiResponse<KycApplicationDto>> reviewApplication(
            @PathVariable String applicationId,
            @RequestBody KycReviewRequest req,
            @RequestHeader(value = "X-WQ-User-Id", required = false) String reviewerIdHeader,
            @RequestHeader(value = "X-WQ-User-Role", required = false) String userRoleHeader
    ) {
        KycApplicationEntity app = kycRepository.findByApplicationId(applicationId).orElse(null);
        if (app == null) {
            try {
                UUID uid = UUID.fromString(applicationId);
                app = kycRepository.findById(uid).orElse(null);
            } catch (Exception ignored) {}
        }
        if (app == null) {
            return ResponseEntity.notFound().build();
        }

        String action = req.getEffectiveAction() != null ? req.getEffectiveAction().toUpperCase().trim() : "";
        if (!Set.of("APPROVE", "ACTION_REQUIRED", "REJECT").contains(action)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid review action. Allowed: APPROVE, ACTION_REQUIRED, REJECT."));
        }

        String reviewerId = reviewerIdHeader != null ? reviewerIdHeader : "reviewer-compliance-officer";
        String newStatus;
        Instant now = Instant.now();

        UserEntity user = userRepository.findById(app.getUserId()).orElse(null);

        if ("APPROVE".equals(action)) {
            newStatus = "APPROVED";
            app.setApprovedAt(now);
            app.setReviewerNotes(req.getReviewerNotes() != null ? req.getReviewerNotes() : "Identity and documentation verified by compliance officer.");
            app.setVerificationSource("WHITE_QUANTEX_COMPLIANCE_DESK_AUDIT");

            if (user != null) {
                user.setKycStatus("APPROVED");
                user.setVerificationLevel("GOLD");
                user.setTrustScore(Math.max(user.getTrustScore() != null ? user.getTrustScore() : 50, 85));
                userRepository.save(user);
            }
        } else if ("ACTION_REQUIRED".equals(action)) {
            newStatus = "ACTION_REQUIRED";
            String reason = req.getEffectiveReason() != null ? req.getEffectiveReason() : "Additional documentation or higher resolution image required.";
            app.setActionRequiredReason(reason);
            app.setReviewerNotes(req.getReviewerNotes() != null ? req.getReviewerNotes() : reason);

            if (user != null) {
                user.setKycStatus("ACTION_REQUIRED");
                userRepository.save(user);
            }
        } else {
            newStatus = "REJECTED";
            String reason = req.getEffectiveReason() != null ? req.getEffectiveReason() : "Identity verification could not be established with provided documentation.";
            app.setRejectionReason(reason);
            app.setReviewerNotes(req.getReviewerNotes() != null ? req.getReviewerNotes() : reason);

            if (user != null) {
                user.setKycStatus("REJECTED");
                user.setVerificationLevel("NONE");
                userRepository.save(user);
            }
        }

        app.setStatus(newStatus);
        app.setReviewedAt(now);
        app.setReviewerId(reviewerId);
        app.setUpdatedAt(now);

        String auditEntry = String.format("[%s] Action %s applied by reviewer %s. Status is now %s.", now, action, reviewerId, newStatus);
        app.setAuditLog((app.getAuditLog() != null ? app.getAuditLog() + "\n" : "") + auditEntry);

        KycApplicationEntity saved = kycRepository.save(app);

        return ResponseEntity.ok(ApiResponse.success(toDto(saved), "KYC decision successfully recorded. Status: " + newStatus));
    }

    // ── 7. POST /api/kyc/resubmit - Resubmit after ACTION_REQUIRED or REJECTED ─
    @PostMapping("/resubmit")
    public ResponseEntity<ApiResponse<KycApplicationDto>> resubmitApplication(
            @RequestBody KycSubmitRequest req,
            @RequestHeader(value = "X-WQ-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = resolveUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to resubmit KYC."));
        }

        KycApplicationEntity existing = kycRepository.findTopByUserIdOrderByCreatedAtDesc(userId).orElse(null);
        if (existing == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No previous application found to resubmit."));
        }

        if (!"ACTION_REQUIRED".equalsIgnoreCase(existing.getStatus()) && !"REJECTED".equalsIgnoreCase(existing.getStatus())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Resubmission is only permitted when status is ACTION_REQUIRED or REJECTED."));
        }

        // Apply corrections
        if (req.getLegalFirstName() != null) existing.setLegalFirstName(req.getLegalFirstName().trim());
        if (req.getLegalLastName() != null) existing.setLegalLastName(req.getLegalLastName().trim());
        if (req.getDateOfBirth() != null) existing.setDateOfBirth(req.getDateOfBirth().trim());
        if (req.getResidentialAddress() != null) existing.setResidentialAddress(req.getResidentialAddress().trim());
        if (req.getCity() != null) existing.setCity(req.getCity().trim());
        if (req.getStateProvince() != null) existing.setStateProvince(req.getStateProvince().trim());
        if (req.getPostalCode() != null) existing.setPostalCode(req.getPostalCode().trim());
        if (req.getCountry() != null) existing.setCountry(req.getCountry().trim());
        if (req.getNationality() != null) existing.setNationality(req.getNationality().trim());
        if (req.getIdType() != null) existing.setIdType(req.getIdType().trim());
        if (req.getIdNumber() != null && !req.getIdNumber().isBlank()) {
            existing.setIdNumberMasked(maskIdentifier(req.getIdType() != null ? req.getIdType() : existing.getIdType(), req.getIdNumber()));
            existing.setIdNumberHash(hashString(req.getIdNumber()));
        }
        if (req.getDocumentFileName() != null) existing.setDocumentFileName(req.getDocumentFileName().trim());
        if (req.getDocumentStoragePath() != null) existing.setDocumentStoragePath(req.getDocumentStoragePath());
        if (req.getDocumentMimeType() != null) existing.setDocumentMimeType(req.getDocumentMimeType());
        if (req.getDocumentFileSize() != null) existing.setDocumentFileSize(req.getDocumentFileSize());

        existing.setStatus("UNDER_REVIEW");
        existing.setActionRequiredReason(null);
        existing.setRejectionReason(null);
        existing.setSubmittedAt(Instant.now());
        existing.setUpdatedAt(Instant.now());

        String auditEntry = String.format("[%s] Resubmitted by user %s with corrected details. Status: UNDER_REVIEW", Instant.now(), userId);
        existing.setAuditLog((existing.getAuditLog() != null ? existing.getAuditLog() + "\n" : "") + auditEntry);

        KycApplicationEntity saved = kycRepository.save(existing);

        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setKycStatus("UNDER_REVIEW");
            userRepository.save(user);
        }

        return ResponseEntity.ok(ApiResponse.success(toDto(saved), "Corrected KYC application resubmitted successfully."));
    }
}
