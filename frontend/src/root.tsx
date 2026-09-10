import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router"
import "./app/globals.css"
import { Providers } from "./components/providers"

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
        <Providers>{children}</Providers>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return <Outlet />
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Something Went Wrong"
  let details = "An unexpected error occurred. Please try refreshing the page."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 — Page Not Found" : `Error ${error.status}`
    details =
      error.status === 404
        ? "The page you're looking for doesn't exist or has been moved."
        : error.statusText || details
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        background: "var(--wq-bg)",
        color: "var(--wq-fg)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "var(--wq-destructive-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
          fontSize: "1.5rem",
        }}
      >
        ⚠
      </div>
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "var(--wq-fg)",
          letterSpacing: "-0.02em",
        }}
      >
        {message}
      </h1>
      <p
        style={{
          color: "var(--wq-fg-muted)",
          marginBottom: "2rem",
          maxWidth: 440,
          lineHeight: 1.6,
        }}
      >
        {details}
      </p>
      <a
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.625rem 1.25rem",
          background: "var(--wq-accent)",
          color: "var(--wq-accent-fg)",
          borderRadius: "var(--wq-radius)",
          fontWeight: 600,
          fontSize: "0.875rem",
          textDecoration: "none",
        }}
      >
        ← Back to Home
      </a>
      {stack && (
        <pre
          style={{
            marginTop: "2rem",
            width: "100%",
            maxWidth: 680,
            padding: "1rem",
            overflowX: "auto",
            textAlign: "left",
            fontSize: "0.75rem",
            background: "var(--wq-bg-elevated)",
            color: "var(--wq-fg-muted)",
            borderRadius: "var(--wq-radius)",
            border: "1px solid var(--wq-border)",
          }}
        >
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
