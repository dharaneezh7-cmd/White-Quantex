import React, { useState } from "react"
import { useNavigate, Link } from "react-router"
import { Check, ChevronLeft, ChevronRight, Rocket, AlertCircle } from "lucide-react"
import { companyService } from "@/services/company/companyService"

const INDUSTRIES = [
  "AI & Machine Learning", "Fintech", "CleanTech & Energy", "SaaS & Cloud",
  "Biotech & Health", "SpaceTech & Aerospace", "DeepTech & Nano",
  "E-Commerce & Retail", "EdTech", "AgriTech", "Cybersecurity", "Web3 & Blockchain", "Other"
]

const STAGES = [
  "IDEA", "PRE_SEED", "SEED", "SERIES_A", "SERIES_B", "GROWTH", "PRE_IPO"
]

export default function VentureRegistrationPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1
    ventureName: "",
    legalEntityName: "",
    tagline: "",
    // Step 2
    industry: INDUSTRIES[0],
    stage: STAGES[0],
    location: "",
    foundedYear: "",
    // Step 3
    leadFounderName: "",
    teamSize: "",
    websiteUrl: "",
    // Step 4
    fundingRaised: "",
    targetValuation: "",
    targetFundraising: "",
    // Step 5
    description: "",
    pitchDeckUrl: "",
    logoUrl: ""
  })

  const steps = [
    "Identity",
    "Details",
    "Team",
    "Funding",
    "Pitch"
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.ventureName) return "Venture Name is required"
        if (!formData.tagline) return "Tagline / One-liner is required"
        break
      case 2:
        if (!formData.location) return "Location is required"
        if (!formData.foundedYear) return "Founded Year is required"
        break
      case 3:
        if (!formData.leadFounderName) return "Lead Founder / CEO Name is required"
        if (!formData.teamSize) return "Team Size is required"
        if (!formData.websiteUrl) return "Website URL is required"
        break
      case 4:
        if (!formData.fundingRaised) return "Total Funding Raised is required"
        if (!formData.targetValuation) return "Current/Target Valuation is required"
        if (!formData.targetFundraising) return "Target Fundraising Amount is required"
        break
      case 5:
        if (formData.description.length < 100) return "Venture Description must be at least 100 characters"
        break
    }
    return null
  }

  const handleNext = () => {
    const validationError = validateStep(currentStep)
    if (validationError) {
      setError(validationError)
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, 5))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateStep(5)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      setError("")
      await companyService.registerVenture({
        name: formData.ventureName,
        legalName: formData.legalEntityName || formData.ventureName,
        tagline: formData.tagline,
        industry: formData.industry,
        stage: formData.stage,
        location: formData.location,
        foundedYear: parseInt(formData.foundedYear, 10) || new Date().getFullYear(),
        ceo: formData.leadFounderName,
        employees: parseInt(formData.teamSize, 10) || 1,
        website: formData.websiteUrl,
        fundingRaised: formData.fundingRaised,
        valuation: formData.targetValuation,
        targetFunding: formData.targetFundraising,
        description: formData.description,
        pitchDeckUrl: formData.pitchDeckUrl || undefined,
        logoUrl: formData.logoUrl || undefined,
      })
      navigate("/registration-success")
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Use purple accent color instead of green for venture
  const accentColor = "#a855f7" // Tailwind purple-500
  const hoverColor = "#9333ea" // Tailwind purple-600

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-lg mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--wq-fg-muted)] hover:text-purple-500 transition-colors mb-6">
          <ChevronLeft className="h-4 w-4" /> Back to Hub
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--wq-fg)]">Register a Venture</h1>
            <p className="text-xs text-[var(--wq-fg-muted)]">Startup & early-stage verification</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg space-y-6 bg-[var(--wq-bg-surface)] p-8 rounded-2xl border border-[var(--wq-border)] shadow-xl relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="relative mb-8">
          <div className="flex justify-between relative z-10">
            {steps.map((step, index) => {
              const stepNumber = index + 1
              const isActive = stepNumber === currentStep
              const isCompleted = stepNumber < currentStep
              
              return (
                <div key={stepNumber} className="flex flex-col items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                    isActive ? 'border-purple-500 bg-purple-500/10 text-purple-500' :
                    isCompleted ? 'border-purple-500 bg-purple-500 text-white' :
                    'border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-[var(--wq-fg-muted)]'
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'text-purple-500' : 
                    isCompleted ? 'text-[var(--wq-fg)]' : 'text-[var(--wq-fg-muted)]'
                  }`}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="absolute top-4 left-0 h-0.5 w-full bg-[var(--wq-border)] -z-0">
             <div 
               className="h-full bg-purple-500 transition-all duration-300"
               style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
             />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Venture Name</label>
                <input type="text" name="ventureName" value={formData.ventureName} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="e.g. NextGen Space" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Legal Entity Name (Optional)</label>
                <input type="text" name="legalEntityName" value={formData.legalEntityName} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="e.g. NextGen Space, Inc." />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Tagline / One-liner</label>
                <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="Brief one-liner description" />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Industry</label>
                  <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500">
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Stage</label>
                  <select name="stage" value={formData.stage} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500">
                    {STAGES.map(st => <option key={st} value={st}>{st.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="City, State, Country" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Founded Year</label>
                  <input type="number" name="foundedYear" value={formData.foundedYear} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="e.g. 2023" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Lead Founder / CEO Name</label>
                <input type="text" name="leadFounderName" value={formData.leadFounderName} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="Full Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Team Size</label>
                <input type="text" name="teamSize" value={formData.teamSize} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="e.g. 2-5" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Website URL</label>
                <input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="https://..." />
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Total Funding Raised</label>
                <input type="text" name="fundingRaised" value={formData.fundingRaised} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="e.g. $500k" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Current/Target Valuation</label>
                <input type="text" name="targetValuation" value={formData.targetValuation} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="e.g. $5M" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Target Fundraising Amount</label>
                <input type="text" name="targetFundraising" value={formData.targetFundraising} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="e.g. $1M" />
              </div>
            </div>
          )}

          {/* Step 5 */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Venture Description / Mission Statement</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500 min-h-[120px] resize-none" 
                  placeholder="Describe your venture's mission, product, and market... (min 100 characters)" 
                />
                <div className="text-right text-[10px] text-[var(--wq-fg-muted)] mt-1">
                  {formData.description.length} / 100+ chars
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Pitch Deck URL (Optional)</label>
                <input type="url" name="pitchDeckUrl" value={formData.pitchDeckUrl} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Logo URL (Optional)</label>
                <input type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-purple-500" placeholder="https://..." />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-[var(--wq-border)]">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 py-3 rounded-xl bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] font-bold text-xs hover:bg-[var(--wq-bg-surface)] transition-all"
              >
                Back
              </button>
            )}
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-purple-500 text-white font-extrabold text-xs hover:bg-purple-600 shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 ml-auto"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-purple-500 text-white font-extrabold text-xs hover:bg-purple-600 shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Registration"} <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
