package com.whitequantex.kyc.dto;

import lombok.Data;

@Data
public class KycReviewRequest {
    private String action; // APPROVE, ACTION_REQUIRED, REJECT
    private String decision;
    private String reviewerNotes;
    private String actionRequiredReason;
    private String rejectionReason;
    private String reason;
    private String reviewerId;

    public String getEffectiveAction() {
        if (action != null && !action.isBlank()) return action;
        return decision;
    }

    public String getEffectiveReason() {
        if (actionRequiredReason != null && !actionRequiredReason.isBlank()) return actionRequiredReason;
        if (rejectionReason != null && !rejectionReason.isBlank()) return rejectionReason;
        return reason;
    }
}
