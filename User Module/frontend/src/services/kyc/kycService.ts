import { springApi } from "@/services/api/client"
import { ApiResponse, KycApplicationData, KycStatusResponse } from "@/types"

export interface KycUploadResult {
  fileName: string
  originalFileName: string
  fileSize: number
  fileExtension: string
  mimeType: string
  storagePath: string
}

export interface KycReviewPayload {
  action: "APPROVE" | "ACTION_REQUIRED" | "REJECT" | string
  reviewerNotes?: string
  actionRequiredReason?: string
  rejectionReason?: string
  reviewerId?: string
}

export const kycService = {
  // ── 1. Fetch current authenticated user's KYC status ─────────────────────
  async getStatus(): Promise<KycStatusResponse> {
    try {
      const res = await springApi.get<ApiResponse<KycStatusResponse>>("/kyc/status")
      if (res.data?.data) {
        return res.data.data
      }
    } catch (err) {
      console.warn("Failed to fetch KYC status from backend:", err)
    }

    // Fallback based on session
    let defaultStatus: KycStatusResponse = {
      kycStatus: "NOT_STARTED",
      verificationLevel: "NONE",
      trustScore: 40,
      canInvest: false,
      isApproved: false,
      isEmailVerified: false,
    }

    if (typeof window !== "undefined") {
      try {
        const sessionStr = localStorage.getItem("wq_user_session")
        if (sessionStr) {
          const user = JSON.parse(sessionStr)
          defaultStatus = {
            userId: user.id || user.wqUserId,
            kycStatus: user.kycStatus || "NOT_STARTED",
            verificationLevel: user.verificationLevel || "NONE",
            trustScore: user.trustScore || 40,
            canInvest: user.kycStatus === "APPROVED",
            isApproved: user.kycStatus === "APPROVED",
            isEmailVerified: Boolean(user.isEmailVerified),
          }
        }
      } catch {}
    }

    return defaultStatus
  },

  // ── 2. Fetch full user application dossier ───────────────────────────────
  async getApplication(): Promise<KycApplicationData | null> {
    try {
      const res = await springApi.get<ApiResponse<KycApplicationData>>("/kyc/application")
      return res.data?.data || null
    } catch (err) {
      console.warn("No active KYC application found:", err)
      return null
    }
  },

  // ── 3. Upload identity verification document (Private storage) ───────────
  async uploadDocument(file: File, documentType = "GOVERNMENT_PHOTO_ID"): Promise<KycUploadResult> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("documentType", documentType)

    const res = await springApi.post<ApiResponse<KycUploadResult>>("/kyc/upload-document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    if (!res.data?.success || !res.data.data) {
      throw new Error(res.data?.message || "Failed to upload document")
    }

    return res.data.data
  },

  // ── 4. Submit statutory KYC application ──────────────────────────────────
  async submitKyc(data: Partial<KycApplicationData> & { isDraft?: boolean }): Promise<KycApplicationData> {
    const res = await springApi.post<ApiResponse<KycApplicationData>>("/kyc/submit", data)
    if (!res.data?.success || !res.data.data) {
      throw new Error(res.data?.message || "KYC submission failed")
    }

    // Synchronize local session with new status
    if (typeof window !== "undefined" && res.data.data.status) {
      try {
        const sessionStr = localStorage.getItem("wq_user_session")
        if (sessionStr) {
          const user = JSON.parse(sessionStr)
          user.kycStatus = res.data.data.status
          localStorage.setItem("wq_user_session", JSON.stringify(user))
        }
      } catch {}
    }

    return res.data.data
  },

  // ── 5. Resubmit corrected KYC information ────────────────────────────────
  async resubmitKyc(data: Partial<KycApplicationData>): Promise<KycApplicationData> {
    const res = await springApi.post<ApiResponse<KycApplicationData>>("/kyc/resubmit", data)
    if (!res.data?.success || !res.data.data) {
      throw new Error(res.data?.message || "KYC resubmission failed")
    }

    // Synchronize local session
    if (typeof window !== "undefined" && res.data.data.status) {
      try {
        const sessionStr = localStorage.getItem("wq_user_session")
        if (sessionStr) {
          const user = JSON.parse(sessionStr)
          user.kycStatus = res.data.data.status
          localStorage.setItem("wq_user_session", JSON.stringify(user))
        }
      } catch {}
    }

    return res.data.data
  },

  // ── 6. Admin: Retrieve compliance review queue ───────────────────────────
  async getAdminApplications(status = "ALL"): Promise<KycApplicationData[]> {
    const res = await springApi.get<ApiResponse<KycApplicationData[]>>(
      `/kyc/admin/applications?status=${encodeURIComponent(status)}`
    )
    return res.data?.data || []
  },

  // ── 7. Admin: Adjudicate application (Approve / Action Required / Reject) ──
  async reviewApplication(applicationId: string, review: KycReviewPayload): Promise<KycApplicationData> {
    const res = await springApi.post<ApiResponse<KycApplicationData>>(
      `/kyc/admin/applications/${encodeURIComponent(applicationId)}/review`,
      review
    )
    if (!res.data?.success || !res.data.data) {
      throw new Error(res.data?.message || "Review decision failed")
    }

    return res.data.data
  },
}
