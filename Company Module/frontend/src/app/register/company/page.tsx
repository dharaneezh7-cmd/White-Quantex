import React, { useState } from "react"
import { useNavigate, Link } from "react-router"
import { Check, ChevronLeft, ChevronRight, Building2, AlertCircle } from "lucide-react"
import { companyService } from "@/services/company/companyService"

const INDUSTRIES = [
  "AI & Machine Learning", "Fintech", "CleanTech & Energy", "SaaS & Cloud",
  "Biotech & Health", "SpaceTech & Aerospace", "DeepTech & Nano",
  "E-Commerce & Retail", "EdTech", "AgriTech", "Cybersecurity", "Web3 & Blockchain", "Other"
]

const STAGES = [
  "IDEA", "PRE_SEED", "SEED", "SERIES_A", "SERIES_B", "GROWTH", "PRE_IPO"
]

const REGIONS = [
  "West Coast", "East Coast", "Mountain West", "Southwest", "Central", "Midwest", "Northeast", "Southeast", "International"
]

export default function CompanyRegistrationPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1
    companyName: "",
    legalName: "",
    companyType: "EXISTING_COMPANY",
    tagline: "",
    // Step 2
    industry: INDUSTRIES[0],
    subIndustry: "",
    stage: STAGES[0],
    location: "",
    headquarters: "",
    region: REGIONS[0],
    foundedYear: "",
    // Step 3
    ceoName: "",
    employees: "",
    websiteUrl: "",
    // Step 4
    valuation: "",
    revenue: "",
    fundingRaised: "",
    // Step 5
    description: "",
    logoUrl: ""
  })

  const steps = [
    "Identity",
    "Industry",
    "Team",
    "Financials",
    "Branding"
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.companyName) return "Company Name is required"
        if (!formData.legalName) return "Legal Name is required"
        if (!formData.tagline) return "Tagline is required"
        break
      case 2:
        if (!formData.subIndustry) return "Sub-Industry is required"
        if (!formData.location) return "Location is required"
        if (!formData.headquarters) return "Headquarters is required"
        if (!formData.foundedYear) return "Founded Year is required"
        break
      case 3:
        if (!formData.ceoName) return "CEO Name is required"
        if (!formData.employees) return "Number of Employees is required"
        if (!formData.websiteUrl) return "Website URL is required"
        break
      case 4:
        if (!formData.valuation) return "Current Valuation is required"
        if (!formData.revenue) return "Annual Revenue is required"
        if (!formData.fundingRaised) return "Total Funding Raised is required"
        break
      case 5:
        if (formData.description.length < 100) return "Description must be at least 100 characters"
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
      await companyService.registerCompany({
        name: formData.companyName,
        legalName: formData.legalName,
        type: formData.companyType as "STARTUP" | "EXISTING_COMPANY",
        tagline: formData.tagline,
        industry: formData.industry,
        subIndustry: formData.subIndustry,
        stage: formData.stage,
        location: formData.location,
        headquarters: formData.headquarters,
        region: formData.region,
        foundedYear: parseInt(formData.foundedYear, 10) || new Date().getFullYear(),
        ceo: formData.ceoName,
        employees: parseInt(formData.employees, 10) || 1,
        website: formData.websiteUrl,
        valuation: formData.valuation,
        annualRevenue: formData.revenue,
        fundingRaised: formData.fundingRaised,
        description: formData.description,
        logoUrl: formData.logoUrl || undefined,
      })
      navigate("/registration-success")
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-lg mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--wq-fg-muted)] hover:text-[#00d09c] transition-colors mb-6">
          <ChevronLeft className="h-4 w-4" /> Back to Hub
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--wq-fg)]">Register a Company</h1>
            <p className="text-xs text-[var(--wq-fg-muted)]">Corporate entity verification</p>
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
                    isActive ? 'border-[#00d09c] bg-[#00d09c]/10 text-[#00d09c]' :
                    isCompleted ? 'border-[#00d09c] bg-[#00d09c] text-black' :
                    'border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-[var(--wq-fg-muted)]'
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'text-[#00d09c]' : 
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
               className="h-full bg-[#00d09c] transition-all duration-300"
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
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Company Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Legal Name</label>
                <input type="text" name="legalName" value={formData.legalName} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="e.g. Acme Corporation, Inc." />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Company Type</label>
                <select name="companyType" value={formData.companyType} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]">
                  <option value="STARTUP">Startup</option>
                  <option value="EXISTING_COMPANY">Existing Company</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Tagline</label>
                <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="Brief one-liner description" />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Industry</label>
                  <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]">
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Sub-Industry</label>
                  <input type="text" name="subIndustry" value={formData.subIndustry} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="e.g. Generative AI" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Stage</label>
                  <select name="stage" value={formData.stage} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]">
                    {STAGES.map(st => <option key={st} value={st}>{st.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Founded Year</label>
                  <input type="number" name="foundedYear" value={formData.foundedYear} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="e.g. 2020" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Region</label>
                  <select name="region" value={formData.region} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]">
                    {REGIONS.map(reg => <option key={reg} value={reg}>{reg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Headquarters</label>
                  <input type="text" name="headquarters" value={formData.headquarters} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="e.g. San Francisco, CA" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Full Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="City, State, Country" />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">CEO / Founder Name</label>
                <input type="text" name="ceoName" value={formData.ceoName} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="Full Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Number of Employees</label>
                <input type="text" name="employees" value={formData.employees} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="e.g. 10-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Company Website URL</label>
                <input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="https://..." />
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Current Valuation</label>
                <input type="text" name="valuation" value={formData.valuation} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="e.g. $5M" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Annual Revenue</label>
                <input type="text" name="revenue" value={formData.revenue} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="e.g. $1.2M ARR" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Total Funding Raised</label>
                <input type="text" name="fundingRaised" value={formData.fundingRaised} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="e.g. $2.5M" />
              </div>
            </div>
          )}

          {/* Step 5 */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Company Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c] min-h-[120px] resize-none" 
                  placeholder="Describe your company's mission, product, and market... (min 100 characters)" 
                />
                <div className="text-right text-[10px] text-[var(--wq-fg-muted)] mt-1">
                  {formData.description.length} / 100+ chars
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Logo URL (Optional)</label>
                <input type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]" placeholder="https://..." />
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
                className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all flex items-center justify-center gap-2 ml-auto"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all flex items-center justify-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
