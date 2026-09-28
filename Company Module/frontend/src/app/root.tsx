import React, { Suspense } from "react"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router"
import "./globals.css"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

const THEME_SCRIPT = `
(function(){
  try {
    var stored = localStorage.getItem('wq-theme');
    var theme = (stored === 'light' || stored === 'dark') ? stored : 'dark';
    document.documentElement.className = theme;
    document.documentElement.style.colorScheme = theme;
  } catch(e) {
    document.documentElement.className = 'dark';
    document.documentElement.style.colorScheme = 'dark';
  }
})();
`.trim()

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#00d09c" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>
          <div className="flex min-h-dvh flex-col bg-[var(--wq-bg)] text-[var(--wq-fg)]">
            {children}
          </div>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-[var(--wq-bg)]">
        <div className="animate-pulse text-[var(--wq-fg-muted)] text-sm">Loading...</div>
      </div>
    }>
      <Outlet />
    </Suspense>
  )
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Something Went Wrong"
  let details = "An unexpected error occurred."

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 — Page Not Found" : `Error ${error.status}`
    details = error.status === 404 ? "The page you're looking for doesn't exist." : error.statusText || details
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-8 text-center bg-[var(--wq-bg)] text-[var(--wq-fg)]">
      <h1 className="text-2xl font-bold mb-3">{message}</h1>
      <p className="text-sm text-[var(--wq-fg-muted)] mb-6 max-w-md">{details}</p>
      <a href="/" className="px-5 py-2.5 bg-[#00d09c] text-black rounded-xl font-bold text-sm hover:bg-[#00b888] transition-all">
        ← Back to Home
      </a>
    </main>
  )
}
