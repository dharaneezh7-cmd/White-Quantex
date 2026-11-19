package com.whitequantex.company.controller;

import com.whitequantex.company.common.ApiResponse;
import com.whitequantex.company.dto.CompanyDocumentResponseDto;
import com.whitequantex.company.security.SecurityUtils;
import com.whitequantex.company.service.CompanyDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies/{companyId}/documents")
@RequiredArgsConstructor
@Tag(name = "Corporate Documents", description = "SEC Filings, Articles of Incorporation, and Financial Statements")
public class CompanyDocumentController {

    private final CompanyDocumentService documentService;

    @GetMapping
    @Operation(summary = "List all corporate documents")
    public ResponseEntity<ApiResponse<List<CompanyDocumentResponseDto>>> getDocuments(@PathVariable UUID companyId) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(ApiResponse.success(documentService.getDocuments(companyId, currentUserId)));
    }

    @PostMapping
    @Operation(summary = "Record uploaded corporate document metadata")
    public ResponseEntity<ApiResponse<CompanyDocumentResponseDto>> uploadDocument(
            @PathVariable UUID companyId,
            @RequestParam String title,
            @RequestParam String documentType,
            @RequestParam String fileUrl,
            @RequestParam(required = false) Long fileSizeBytes,
            @RequestParam(required = false) String mimeType,
            @RequestParam(required = false, defaultValue = "PRIVATE") String confidentialityLevel,
            @RequestParam(required = false) UUID verificationId
    ) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();
        CompanyDocumentResponseDto response = documentService.uploadDocument(
                companyId,
                title,
                documentType,
                fileUrl,
                fileSizeBytes,
                mimeType,
                confidentialityLevel,
                verificationId,
                currentUserId
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }
}
