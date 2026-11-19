import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"

interface AppErrorBoundaryProps {
  children: ReactNode
  title?: string
  fallbackMessage?: string
  onReset?: () => void
}

interface AppErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public override state: AppErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[AppErrorBoundary] Caught uncaught component error:", error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="w-full p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 shadow-xs flex flex-col items-center justify-center text-center space-y-3.5 my-4">
          <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {this.props.title || "Section Temporarily Unavailable"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              {this.props.fallbackMessage ||
                "This section encountered an unexpected render issue. Real-time platform data continues operating normally."}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Section</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
