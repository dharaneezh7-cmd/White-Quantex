import { AxiosError } from "axios"

export interface ApiErrorResponse {
  message: string
  status?: number
  code?: string
}

export function formatApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    const status = error.response?.status
    if (status === 401) {
      return "Authentication required. Please sign in."
    }
    if (status === 403) {
      return "You do not have permission to perform this action."
    }
    if (status === 404) {
      return "The requested resource was not found."
    }
    if (status === 429) {
      return "Too many requests. Please try again later."
    }
    if (status && status >= 500) {
      return "A server error occurred. Please try again later."
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return "An unexpected error occurred."
}
