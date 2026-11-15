import React, { useState, useEffect } from "react"
import { Link } from "react-router"
import {
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  FileText,
  Eye,
  Check,
  X,
  ArrowLeft,
  Calendar,
  Lock,
  ChevronDown,
} from "lucide-react"
import { kycService } from "@/services/kyc/kycService"
import { KycApplicationData } from "@/types"

export default function AdminVerificationPage() {
  const [applications, setApplications] = useState<KycApplicationData[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedApp, setSelectedApp] = useState<KycApplicationData | null>(null)
  const [actionModal, setActionModal] = useState<"APPROVE" | "ACTION_REQUIRED" | "REJECT" | null>(null)
  const [reviewerNotes, setReviewerNotes] = useState("")
  const [specificReason, setSpecificReason] = useState("")
  const [submittingDecision, setSubmittingDecision] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const loadApplications = async () => {
    setLoading(true)
    try {
      const data = await kycService.getAdminApplications(statusFilter)
      setApplications(data)
    } catch (err: any) {
      setFeedbackMessage({ type: "error", text: err.message || "Failed to load applications" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [statusFilter])

  const handleReview = async () => {
    if (!selectedApp || !actionModal) return
    setSubmittingDecision(true)
    setFeedbackMessage(null)

    try {
      const targetId = selectedApp.applicationId || selectedApp.id || ""
      const payload = {
        action: actionModal,
        reviewerNotes: reviewerNotes || `Reviewed and adjudicated as ${actionModal}`,
        actionRequiredReason: actionModal === "ACTION_REQUIRED" ? specificReason : undefined,
        rejectionReason: actionModal === "REJECT" ? specificReason : undefined,
        reviewerId: "compliance-officer-desk",
      }

      await kycService.reviewApplication(targetId, payload)
      setFeedbackMessage({
        type: "success",
        text: `Application ${targetId} successfully transitioned to ${actionModal}.`,
      })
      setActionModal(null)
      setSelectedApp(null)
      setReviewerNotes("")
      setSpecificReason("")
      await loadApplications()
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Failed to submit review decision.",
      })
    } finally {
      setSubmittingDecision(false)
    }
  }

  const filteredApps = applications.filter((app) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      app.applicationId?.toLowerCase().includes(q) ||
      app.legalFullName?.toLowerCase().includes(q) ||
      app.userEmail?.toLowerCase().includes(q) ||
      app.idNumberMasked?.toLowerCase().includes(q)
    )
  })

  const underReviewCount = applications.filter((a) => a.status === "UNDER_REVIEW" || a.status === "SUBMITTED").length
  const actionRequiredCount = applications.filter((a) => a.status === "ACTION_REQUIRED").length
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ── Breadcrumb & Top Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <Link
            to="/verification"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to User Verification Hub</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
              Statutory KYC Compliance Review Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Authorized Review Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Examine submitted individual identity documents, check statutory declarations, and grant or decline primary investment access.
          </p>
        </div>

        <button
          onClick={loadApplications}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* ── Feedback Message ─────────────────────────────────────────────── */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300"
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Queue Statistics ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter("UNDER_REVIEW")}
          className={`p-4 rounded-xl border bg-white dark:bg-zinc-900 transition-all cursor-pointer ${
            statusFilter === "UNDER_REVIEW"
              ? "ring-2 ring-blue-500 border-blue-500"
              : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Under Review</span>
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-2">{underReviewCount}</p>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500">Requires auditor review</span>
        </div>

        <div
          onClick={() => setStatusFilter("ACTION_REQUIRED")}
          className={`p-4 rounded-xl border bg-white dark:bg-zinc-900 transition-all cursor-pointer ${
            statusFilter === "ACTION_REQUIRED"
              ? "ring-2 ring-amber-500 border-amber-500"
              : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Action Required</span>
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-2">{actionRequiredCount}</p>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500">Awaiting user response</span>
        </div>

        <div
          onClick={() => setStatusFilter("APPROVED")}
          className={`p-4 rounded-xl border bg-white dark:bg-zinc-900 transition-all cursor-pointer ${
            statusFilter === "APPROVED"
              ? "ring-2 ring-emerald-500 border-emerald-500"
              : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Approved</span>
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-2">{approvedCount}</p>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500">Investment access active</span>
        </div>

        <div
          onClick={() => setStatusFilter("REJECTED")}
          className={`p-4 rounded-xl border bg-white dark:bg-zinc-900 transition-all cursor-pointer ${
            statusFilter === "REJECTED"
              ? "ring-2 ring-rose-500 border-rose-500"
              : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            <span>Rejected</span>
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-2">{rejectedCount}</p>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500">Non-compliant dossiers</span>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, email, or PAN..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
          >
            <option value="ALL">All Statuses ({applications.length})</option>
            <option value="UNDER_REVIEW">Under Review ({underReviewCount})</option>
            <option value="ACTION_REQUIRED">Action Required ({actionRequiredCount})</option>
            <option value="APPROVED">Approved ({approvedCount})</option>
            <option value="REJECTED">Rejected ({rejectedCount})</option>
          </select>
        </div>
      </div>

      {/* ── Applications Table ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-zinc-400 space-y-3">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
            <p>Loading compliance verification queue...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-zinc-400 space-y-2">
            <UserCheck className="h-8 w-8 mx-auto text-slate-300 dark:text-zinc-600" />
            <p className="font-semibold text-slate-700 dark:text-zinc-300">No applications match the current filter</p>
            <p className="text-[11px] text-slate-400">Applications submitted by individual users will appear here for review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Identifier / Document</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {filteredApps.map((app) => (
                  <tr key={app.id || app.applicationId} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                      {app.applicationId || "KYC-PENDING"}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-zinc-100">{app.legalFullName}</div>
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500">{app.userEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-800 dark:text-zinc-200 font-semibold">
                        {app.idType}: {app.idNumberMasked || "ABCDE****F"}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate max-w-xs flex items-center gap-1 mt-0.5">
                        <FileText className="h-3 w-3" />
                        <span>{app.documentFileName || "Document attached"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "Recent"}
                    </td>

                    <td className="py-3.5 px-4">
                      {app.status === "APPROVED" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                          APPROVED
                        </span>
                      )}
                      {(app.status === "UNDER_REVIEW" || app.status === "SUBMITTED") && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800 animate-pulse">
                          UNDER REVIEW
                        </span>
                      )}
                      {app.status === "ACTION_REQUIRED" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                          ACTION REQUIRED
                        </span>
                      )}
                      {app.status === "REJECTED" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                          REJECTED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedApp(app)
                            setActionModal(null)
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
                        >
                          View Details
                        </button>

                        <button
                          onClick={() => {
                            setSelectedApp(app)
                            setActionModal("APPROVE")
                            setReviewerNotes("Identity credentials verified against statutory registers.")
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => {
                            setSelectedApp(app)
                            setActionModal("ACTION_REQUIRED")
                            setSpecificReason("Document image is partially obscured. Please upload a clear color scan.")
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                        >
                          Correction
                        </button>

                        <button
                          onClick={() => {
                            setSelectedApp(app)
                            setActionModal("REJECT")
                            setSpecificReason("Identity details do not match statutory registry.")
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      {selectedApp && !actionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Application Dossier: {selectedApp.applicationId}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  User ID: {selectedApp.userId}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950">
                <span className="text-slate-400 font-medium">Applicant Name</span>
                <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{selectedApp.legalFullName}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950">
                <span className="text-slate-400 font-medium">Email Address</span>
                <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{selectedApp.userEmail}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950">
                <span className="text-slate-400 font-medium">Date of Birth</span>
                <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{selectedApp.dateOfBirth}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950">
                <span className="text-slate-400 font-medium">Nationality & Country</span>
                <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                  {selectedApp.nationality} • {selectedApp.country}
                </p>
              </div>
              <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950">
                <span className="text-slate-400 font-medium">Residential Address</span>
                <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                  {selectedApp.residentialAddress}, {selectedApp.city}, {selectedApp.stateProvince} {selectedApp.postalCode}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950">
                <span className="text-slate-400 font-medium">Identifier Type & Number</span>
                <p className="font-bold font-mono text-slate-800 dark:text-zinc-200 mt-0.5">
                  {selectedApp.idType}: {selectedApp.idNumberMasked}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950">
                <span className="text-slate-400 font-medium">Encrypted Document Storage</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                  {selectedApp.documentFileName}
                </p>
              </div>
            </div>

            {/* Audit Trail */}
            {selectedApp.auditLog && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audit Trail</span>
                <pre className="text-[10px] text-slate-600 dark:text-zinc-400 whitespace-pre-wrap font-mono">
                  {selectedApp.auditLog}
                </pre>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setActionModal("APPROVE")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                Approve Application
              </button>
              <button
                onClick={() => setActionModal("ACTION_REQUIRED")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
              >
                Request Correction
              </button>
              <button
                onClick={() => setActionModal("REJECT")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Adjudication Action Modal (Approve / Action Required / Reject) ── */}
      {selectedApp && actionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                {actionModal === "APPROVE" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {actionModal === "ACTION_REQUIRED" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                {actionModal === "REJECT" && <XCircle className="h-5 w-5 text-rose-500" />}
                <span>
                  Confirm {actionModal === "APPROVE" ? "Approval" : actionModal === "ACTION_REQUIRED" ? "Correction Request" : "Rejection"}
                </span>
              </h3>
              <button onClick={() => setActionModal(null)} className="cursor-pointer text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Applying this decision to <strong>{selectedApp.legalFullName}</strong> ({selectedApp.applicationId}).
              {actionModal === "APPROVE" && " This will immediately grant primary investment capability and upgrade verification level to GOLD."}
              {actionModal === "ACTION_REQUIRED" && " The applicant will be notified of required corrections and allowed to resubmit."}
              {actionModal === "REJECT" && " The applicant will be notified of the statutory denial reason."}
            </p>

            {(actionModal === "ACTION_REQUIRED" || actionModal === "REJECT") && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Specific Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={specificReason}
                  onChange={(e) => setSpecificReason(e.target.value)}
                  placeholder="e.g. Document image is blurry or expired..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Compliance Reviewer Internal Audit Notes
              </label>
              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Enter audit observations for statutory compliance log..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleReview}
                disabled={submittingDecision || ((actionModal === "ACTION_REQUIRED" || actionModal === "REJECT") && !specificReason.trim())}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer ${
                  actionModal === "APPROVE"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : actionModal === "ACTION_REQUIRED"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                {submittingDecision ? "Recording Decision..." : "Submit Decision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
