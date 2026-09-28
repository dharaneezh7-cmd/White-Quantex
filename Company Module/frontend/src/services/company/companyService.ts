import { springApi } from "@/services/api/client"

export interface CompanyRegistrationPayload {
  // Step 1: Company Identity
  name: string
  legalName: string
  type: "STARTUP" | "EXISTING_COMPANY"
  tagline: string

  // Step 2: Industry & Location
  industry: string
  subIndustry: string
  stage: string
  location: string
  headquarters: string
  region: string
  foundedYear: number

  // Step 3: Executive & Team
  ceo: string
  employees: number
  website: string

  // Step 4: Financials
  valuation: string
  annualRevenue: string
  fundingRaised: string

  // Step 5: Description & Branding
  description: string
  logoUrl?: string
}

export interface VentureRegistrationPayload {
  // Step 1: Venture Identity
  name: string
  legalName: string
  tagline: string

  // Step 2: Venture Details
  industry: string
  stage: string
  location: string
  foundedYear: number

  // Step 3: Team
  ceo: string
  employees: number
  website: string

  // Step 4: Funding
  fundingRaised: string
  valuation: string
  targetFunding: string

  // Step 5: Pitch
  description: string
  pitchDeckUrl?: string
  logoUrl?: string
}

export const companyService = {
  async registerCompany(data: CompanyRegistrationPayload) {
    const res = await springApi.post("/companies/register", data)
    return res.data
  },

  async registerVenture(data: VentureRegistrationPayload) {
    const res = await springApi.post("/companies/register-venture", data)
    return res.data
  },

  async checkNameAvailability(name: string) {
    const res = await springApi.get(`/companies/check-name?name=${encodeURIComponent(name)}`)
    return res.data
  },
}
