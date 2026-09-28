import { springApi } from "@/services/api/client"
import { Startup, Company, Investment, Portfolio, FundraisingCampaign, ApiResponse, PagedResponse } from "@/types"

export const investmentService = {
  async getStartups(page = 0, size = 12): Promise<PagedResponse<Startup>> {
    const res = await springApi.get<ApiResponse<PagedResponse<Startup>>>(`/startups?page=${page}&size=${size}`)
    return res.data.data
  },

  async getStartupById(id: string): Promise<Startup> {
    const res = await springApi.get<ApiResponse<Startup>>(`/startups/${id}`)
    return res.data.data
  },

  async getCompanies(page = 0, size = 12): Promise<PagedResponse<Company>> {
    const res = await springApi.get<ApiResponse<PagedResponse<Company>>>(`/companies?page=${page}&size=${size}`)
    return res.data.data
  },

  async getCompanyById(id: string): Promise<Company> {
    const res = await springApi.get<ApiResponse<Company>>(`/companies/${id}`)
    return res.data.data
  },

  async getCampaigns(companyId?: string): Promise<FundraisingCampaign[]> {
    const url = companyId ? `/campaigns?companyId=${companyId}` : "/campaigns"
    const res = await springApi.get<ApiResponse<FundraisingCampaign[]>>(url)
    return res.data.data
  },

  async createInvestment(campaignId: string, amount: number): Promise<Investment> {
    const res = await springApi.post<ApiResponse<Investment>>("/investments", { campaignId, amount })
    return res.data.data
  },

  async getPortfolio(): Promise<Portfolio> {
    const res = await springApi.get<ApiResponse<Portfolio>>("/portfolio")
    return res.data.data
  },
}
