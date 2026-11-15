import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Lock,
  UserCheck,
  Building2,
  FileText,
  RefreshCw,
  ExternalLink,
  Info,
  Check,
  XCircle,
  HelpCircle,
  Eye,
  Sparkles,
} from "lucide-react"
import { kycService, KycUploadResult } from "@/services/kyc/kycService"
import { KycApplicationData, KycStatus, KycStatusResponse } from "@/types"

export default function VerificationHubPage() {
  const navigate = useNavigate()

  // Loading & Data State
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Current KYC Status and Existing Application
  const [kycStatus, setKycStatus] = useState<KycStatusResponse | null>(null)
  const [application, setApplication] = useState<KycApplicationData | null>(null)

  // Multi-step Wizard State: 1 = Intro, 2 = Personal Details, 3 = Document Upload, 4 = Declarations, 5 = Review
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Form Fields
  const [formData, setFormData] = useState({
    legalFirstName: "",
    legalLastName: "",
    dateOfBirth: "",
    country: "India",
    nationality: "Indian",
    idType: "PAN_CARD",
    idNumber: "",
    residentialAddress: "",
    city: "Bengaluru",
    stateProvince: "Karnataka",
    postalCode: "560001",
    phoneNumber: "",
    documentFileName: "",
    documentStoragePath: "",
    documentMimeType: "",
    documentFileSize: 0,
    proofOfAddressFileName: "",
    proofOfAddressStoragePath: "",
    declarationAccepted: false,
    consentAccepted: false,
  })

  // Action required correction fields
  const [correctionNotes, setCorrectionNotes] = useState("")

  // Load Status & Application on mount
  const refreshStatus = async () => {
    setLoading(true)
    try {
      const statusRes = await kycService.getStatus()
      setKycStatus(statusRes)

      const appRes = await kycService.getApplication()
      if (appRes) {
        setApplication(appRes)
        setFormData((prev) => ({
          ...prev,
          legalFirstName: appRes.legalFirstName || prev.legalFirstName,
          legalLastName: appRes.legalLastName || prev.legalLastName,
          dateOfBirth: appRes.dateOfBirth || prev.dateOfBirth,
          country: appRes.country || prev.country,
          nationality: appRes.nationality || prev.nationality,
          idType: appRes.idType || prev.idType,
          residentialAddress: appRes.residentialAddress || prev.residentialAddress,
          city: appRes.city || prev.city,
          stateProvince: appRes.stateProvince || prev.stateProvince,
          postalCode: appRes.postalCode || prev.postalCode,
          phoneNumber: appRes.phoneNumber || prev.phoneNumber,
          documentFileName: appRes.documentFileName || prev.documentFileName,
          documentStoragePath: appRes.documentStoragePath || prev.documentStoragePath,
          documentFileSize: appRes.documentFileSize || prev.documentFileSize,
          declarationAccepted: Boolean(appRes.declarationAccepted),
          consentAccepted: Boolean(appRes.consentAccepted),
        }))
      }
    } catch (err: any) {
      console.error("Error loading KYC:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshStatus()
  }, [])

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType = "GOVERNMENT_PHOTO_ID") => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File exceeds the maximum allowed size of 5 MB.")
      return
    }

    // Validate extension
    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    const allowed = [".pdf", ".png", ".jpg", ".jpeg"]
    if (!allowed.includes(ext)) {
      setErrorMessage("Invalid file format. Please upload a PDF, PNG, or JPG document.")
      return
    }

    setErrorMessage(null)
    setUploadingDoc(true)

    try {
      const res: KycUploadResult = await kycService.uploadDocument(file, docType)
      setFormData((prev) => ({
        ...prev,
        documentFileName: res.originalFileName || res.fileName,
        documentStoragePath: res.storagePath,
        documentMimeType: res.mimeType,
        documentFileSize: res.fileSize,
      }))
      setSuccessMessage("Identity document uploaded and encrypted in private storage successfully.")
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload document. Please retry.")
    } finally {
      setUploadingDoc(false)
    }
  }

  // Handle Submit Application
  const handleSubmitApplication = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const res = await kycService.submitKyc({
        ...formData,
        isDraft: false,
      })
      setApplication(res)
      setKycStatus((prev) => prev ? { ...prev, kycStatus: "UNDER_REVIEW", canInvest: false } : null)
      setSuccessMessage("Your KYC application has been successfully submitted and is under compliance review.")
      await refreshStatus()
    } catch (err: any) {
      setErrorMessage(err.message || "KYC submission failed. Please ensure all required fields are complete.")
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Resubmit Application (for ACTION_REQUIRED)
  const handleResubmitApplication = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const res = await kycService.resubmitKyc({
        ...formData,
        reviewerNotes: correctionNotes,
      })
      setApplication(res)
      setKycStatus((prev) => prev ? { ...prev, kycStatus: "UNDER_REVIEW" } : null)
      setSuccessMessage("Your updated information has been submitted for re-review.")
      await refreshStatus()
    } catch (err: any) {
      setErrorMessage(err.message || "Resubmission failed. Please verify your updated details.")
    } finally {
      setSubmitting(false)
    }
  }

  const effectiveStatus: KycStatus = kycStatus?.kycStatus || (application?.status as KycStatus) || "NOT_STARTED"

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Loading statutory KYC dossier...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Top Header & Statutory Trust Header ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 rounded-full">
              Statutory Compliance
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500">• SEBI & FATF AML/CFT Standards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            Individual Identity & KYC Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            White Quantex requires regulatory identity verification for all individual users before granting investment access to primary corporate subscriptions and venture allocations.
          </p>
        </div>

        {/* Admin Quick Switch (For compliance auditing) */}
        <div className="flex items-center gap-3">
          <Link
            to="/verification/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
            <span>Compliance Officer Desk</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* ── Global Alert Notifications ───────────────────────────────────── */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">{successMessage}</div>
        </div>
      )}

      {/* ── STATE 1: APPROVED ────────────────────────────────────────────── */}
      {effectiveStatus === "APPROVED" && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md ring-4 ring-emerald-100 dark:ring-emerald-900/50">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Identity Verified & Approved</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                    Verified Investor
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Your identity has been verified under White Quantex statutory compliance. Investment access is fully unlocked.
                </p>
              </div>
            </div>

            <Link
              to="/companies"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
            >
              <span>Explore Investments</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Dossier Card Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-emerald-200/80 dark:border-emerald-900/40">
            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">KYC Application ID</span>
              <p className="text-sm font-bold font-mono text-slate-800 dark:text-zinc-200 mt-1">
                {application?.applicationId || kycStatus?.applicationId || "KYC-IND-VERIFIED"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Verification Tier</span>
              <p className="text-sm font-bold text-amber-500 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>GOLD VERIFIED</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">WQ Trust Score</span>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {kycStatus?.trustScore || 85}/100 • Maximum Trust
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Masked Identifier</span>
              <p className="text-sm font-bold font-mono text-slate-800 dark:text-zinc-200 mt-1">
                {application?.idNumberMasked || "ABCDE****F"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── STATE 2: UNDER_REVIEW / SUBMITTED ────────────────────────────── */}
      {(effectiveStatus === "UNDER_REVIEW" || effectiveStatus === "SUBMITTED") && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md ring-4 ring-blue-100 dark:ring-blue-900/50">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Application Under Compliance Review</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                    Processing
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Your identity verification documents are being authenticated by our statutory compliance officers.
                </p>
              </div>
            </div>

            <button
              onClick={refreshStatus}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Workflow Timeline */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-900/40 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Compliance Verification Pipeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>1. Submission Received</span>
              </div>
              <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-bold animate-pulse">
                <Clock className="h-4 w-4 shrink-0" />
                <span>2. Document Authentication</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400 dark:text-zinc-500">
                <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-zinc-700 ml-1 mr-1" />
                <span>3. Statutory Clearance</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400 dark:text-zinc-500">
                <Lock className="h-4 w-4 shrink-0" />
                <span>4. Investment Unlocked</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-blue-100/80 dark:border-blue-900/30 text-xs">
              <span className="text-slate-400 dark:text-zinc-500">Application Number</span>
              <p className="font-mono font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                {application?.applicationId || kycStatus?.applicationId || "KYC-IND-PENDING"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-blue-100/80 dark:border-blue-900/30 text-xs">
              <span className="text-slate-400 dark:text-zinc-500">Document Uploaded</span>
              <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 truncate">
                {application?.documentFileName || "Government Identity Document.pdf"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-blue-100/80 dark:border-blue-900/30 text-xs">
              <span className="text-slate-400 dark:text-zinc-500">Review SLA</span>
              <p className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                Within 24-48 business hours
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── STATE 3: ACTION_REQUIRED ─────────────────────────────────────── */}
      {effectiveStatus === "ACTION_REQUIRED" && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                Action Required: Please Update Application Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                The compliance reviewer examined your submission and requested corrections before approval can be granted.
              </p>
            </div>
          </div>

          {/* Feedback Reason Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 space-y-2">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Compliance Officer Notes
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 leading-relaxed">
              {application?.actionRequiredReason || kycStatus?.actionRequiredReason || "Please upload a clearer image of your government photo ID."}
            </p>
          </div>

          {/* Corrected Upload & Update Section */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Upload Replacement Document or Correction
            </h3>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
                Select Corrected Document (PDF, PNG, JPG - Max 5MB)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="resubmit-file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600 file:cursor-pointer"
                />
                {uploadingDoc && <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />}
              </div>
              {formData.documentFileName && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Ready to submit: {formData.documentFileName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">
                Applicant Explanation / Response to Reviewer
              </label>
              <textarea
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                placeholder="Explain the changes made or provide clarifications for the compliance desk..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
              />
            </div>

            <button
              onClick={handleResubmitApplication}
              disabled={submitting || uploadingDoc}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span>Resubmit for Review</span>
            </button>
          </div>
        </div>
      )}

      {/* ── STATE 4: REJECTED ────────────────────────────────────────────── */}
      {effectiveStatus === "REJECTED" && (
        <div className="rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shrink-0">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">KYC Verification Not Approved</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Your application could not be verified by compliance under current statutory identity guidelines.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/40 space-y-1">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Reason for Denial
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
              {application?.rejectionReason || kycStatus?.rejectionReason || "Identity document information could not be authenticated against statutory records."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setKycStatus((prev) => prev ? { ...prev, kycStatus: "NOT_STARTED" } : null)
                setCurrentStep(1)
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs cursor-pointer"
            >
              Start New Application
            </button>

            <a
              href="mailto:compliance@whitequantex.com"
              className="text-xs font-semibold text-emerald-600 dark:text-[#00d09c] hover:underline"
            >
              Contact Statutory Compliance Desk →
            </a>
          </div>
        </div>
      )}

      {/* ── STATE 5: NOT_STARTED / DRAFT (Multi-Step Form Wizard) ─────────── */}
      {(effectiveStatus === "NOT_STARTED" || effectiveStatus === "DRAFT" || effectiveStatus === "NONE") && (
        <div className="space-y-8">
          {/* Progress Indicator */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 text-center">
              {[
                { step: 1, title: "1. Overview", desc: "Prerequisites" },
                { step: 2, title: "2. Personal", desc: "Identity info" },
                { step: 3, title: "3. Documents", desc: "Secure upload" },
                { step: 4, title: "4. Consent", desc: "AML Declarations" },
                { step: 5, title: "5. Review", desc: "Submit KYC" },
              ].map((item) => (
                <div
                  key={item.step}
                  onClick={() => {
                    if (item.step < currentStep) setCurrentStep(item.step)
                  }}
                  className={`p-2.5 rounded-xl transition-all ${
                    currentStep === item.step
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold"
                      : item.step < currentStep
                      ? "bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 cursor-pointer"
                      : "text-slate-400 dark:text-zinc-600"
                  }`}
                >
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="text-[10px] hidden sm:block opacity-75">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── STEP 1: Overview & Intro ───────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Why Identity Verification Matters</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Regulatory safety, statutory investor protection, and AML/CFT compliance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 space-y-2">
                  <Lock className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Private AES-256 Storage</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Uploaded identity documents are isolated in private filesystem partitions with strict access control. They are never exposed publicly.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 space-y-2">
                  <Building2 className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Unlocks Primary Investment</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    SEBI and corporate laws require verified legal identity before subscribing to equity or venture primary funding rounds.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 space-y-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Elevates Trust Score</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Completing identity verification boosts your WQ Trust Score from 40 to 85+, granting Gold Verification status across the platform.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Accepted documents: Permanent Account Number (PAN Card) for Indian residents; International Passport or National ID for global investors. Document files must be PDF, JPG, or PNG (maximum 5MB).
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <span>Start KYC Verification</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Personal Details ────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Step 2: Legal Personal Details</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Enter your legal details exactly as they appear on your government-issued identification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Legal First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.legalFirstName}
                    onChange={(e) => setFormData({ ...formData, legalFirstName: e.target.value })}
                    placeholder="e.g. Johnathan"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Legal Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.legalLastName}
                    onChange={(e) => setFormData({ ...formData, legalLastName: e.target.value })}
                    placeholder="e.g. Doe"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Country of Residence <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Singapore">Singapore</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Nationality <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="e.g. Indian"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Document Identifier Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.idType}
                    onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                  >
                    <option value="PAN_CARD">Permanent Account Number (PAN Card)</option>
                    <option value="PASSPORT">International Passport</option>
                    <option value="AADHAAR">Aadhaar National ID Card</option>
                    <option value="DRIVERS_LICENSE">Driver's License</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Document Identifier Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value.toUpperCase() })}
                    placeholder={formData.idType === "PAN_CARD" ? "e.g. ABCDE1234F" : "e.g. A1234567"}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Residential Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.residentialAddress}
                    onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                    placeholder="Building, Flat, Street Address"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    State / Province <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.stateProvince}
                    onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Postal Code / PIN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!formData.legalFirstName || !formData.legalLastName || !formData.dateOfBirth || !formData.idNumber || !formData.residentialAddress) {
                      setErrorMessage("Please complete all required fields marked with *.")
                      return
                    }
                    setErrorMessage(null)
                    setCurrentStep(3)
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <span>Continue to Document Upload</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Document Upload ────────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Step 3: Identity Document Upload</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Upload a clear, high-resolution scan or photo of your {formData.idType.replace("_", " ")}.
                </p>
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 text-center space-y-4 bg-slate-50/50 dark:bg-zinc-950/40 transition-colors">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                  {uploadingDoc ? (
                    <RefreshCw className="h-7 w-7 animate-spin" />
                  ) : (
                    <UploadCloud className="h-7 w-7" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                    {uploadingDoc ? "Encrypting and storing document..." : "Click or drag document to upload"}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    Supported formats: PDF, PNG, JPG, JPEG (Max 5 MB)
                  </p>
                </div>

                <div className="flex justify-center">
                  <label
                    htmlFor="id-document-file"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs cursor-pointer transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Choose Identity Document File</span>
                  </label>
                  <input
                    id="id-document-file"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {formData.documentFileName && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Attached: {formData.documentFileName}</span>
                    <span className="text-[10px] text-emerald-600/70">
                      ({(formData.documentFileSize / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!formData.documentFileName) {
                      setErrorMessage("Please upload your identity document before continuing.")
                      return
                    }
                    setErrorMessage(null)
                    setCurrentStep(4)
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <span>Continue to Declarations</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Consent & AML Declarations ─────────────────────────── */}
          {currentStep === 4 && (
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Step 4: Statutory Declarations & AML Consent</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Confirm accuracy and legal compliance in accordance with SEBI / Prevention of Money Laundering Act (PMLA).
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 hover:bg-slate-50 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.declarationAccepted}
                    onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                    className="mt-1 h-4 w-4 text-emerald-600 rounded-sm border-slate-300 dark:border-zinc-700 focus:ring-emerald-500"
                  />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                      Truthfulness & Authenticity Declaration
                    </span>
                    <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                      I solemnly affirm and declare that the identity credentials, documents, and personal details submitted herein are genuine, complete, and legally issued to me. I acknowledge that furnishing fraudulent documents constitutes a statutory offense.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 hover:bg-slate-50 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.consentAccepted}
                    onChange={(e) => setFormData({ ...formData, consentAccepted: e.target.checked })}
                    className="mt-1 h-4 w-4 text-emerald-600 rounded-sm border-slate-300 dark:border-zinc-700 focus:ring-emerald-500"
                  />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                      Consent to Verification & Private Storage
                    </span>
                    <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                      I hereby authorize White Quantex and its designated compliance review desk to verify my identity documents against statutory registers and store encrypted documentation in secure private storage solely for regulatory record-keeping.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!formData.declarationAccepted || !formData.consentAccepted) {
                      setErrorMessage("You must accept both statutory declarations before proceeding to review.")
                      return
                    }
                    setErrorMessage(null)
                    setCurrentStep(5)
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <span>Continue to Final Review</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Final Review & Submission ──────────────────────────── */}
          {currentStep === 5 && (
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Step 5: Review & Submit KYC Application</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Confirm your details before transmitting your statutory application to the compliance audit desk.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                <div className="p-3.5 flex justify-between bg-slate-50/50 dark:bg-zinc-950/50">
                  <span className="text-slate-400 dark:text-zinc-500">Applicant Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-zinc-100">
                    {formData.legalFirstName} {formData.legalLastName}
                  </span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Date of Birth</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{formData.dateOfBirth}</span>
                </div>
                <div className="p-3.5 flex justify-between bg-slate-50/50 dark:bg-zinc-950/50">
                  <span className="text-slate-400 dark:text-zinc-500">Country & Nationality</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {formData.nationality} • {formData.country}
                  </span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Document Type</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {formData.idType.replace("_", " ")}
                  </span>
                </div>
                <div className="p-3.5 flex justify-between bg-slate-50/50 dark:bg-zinc-950/50">
                  <span className="text-slate-400 dark:text-zinc-500">Document Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                    {formData.idNumber}
                  </span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Residential Address</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 text-right max-w-xs">
                    {formData.residentialAddress}, {formData.city}, {formData.stateProvince} {formData.postalCode}
                  </span>
                </div>
                <div className="p-3.5 flex justify-between bg-slate-50/50 dark:bg-zinc-950/50">
                  <span className="text-slate-400 dark:text-zinc-500">Attached File</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{formData.documentFileName}</span>
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2.5">
                <Lock className="h-4 w-4 shrink-0" />
                <span>
                  Upon submission, your application will enter UNDER_REVIEW status and a unique KYC Application ID will be generated.
                </span>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Transmitting Dossier...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Submit KYC Application</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
