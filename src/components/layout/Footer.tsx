import React from "react"
import { Link, useLocation } from "react-router"
import { ShieldCheck, ArrowUpRight } from "lucide-react"
import { FOOTER_LINKS } from "../../constants"
import { Separator } from "../ui/separator"

export const Footer = React.memo(function Footer() {
  const location = useLocation()

  if (location.pathname.startsWith("/community")) {
    return null
  }

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-[#09090b]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-none bg-slate-900 dark:bg-white shadow-sm">
                <span className="text-xs font-black text-white dark:text-zinc-950">WQ</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                White Quantex
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              The trusted platform connecting founders, investors, and companies
              in the global startup ecosystem.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { name: "Twitter", url: "https://twitter.com/whitequantex" },
                { name: "LinkedIn", url: "https://linkedin.com/company/whitequantex" },
                { name: "GitHub", url: "https://github.com/whitequantex" },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-none border border-slate-200 text-slate-600 transition-all hover:border-black hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-800 dark:text-slate-400 dark:hover:border-white dark:hover:bg-zinc-800 dark:hover:text-white"
                  aria-label={social.name}
                >
                  <span className="text-xs font-medium">{social.name[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link: { label: string; href: string }) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="group flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10 bg-slate-200 dark:bg-zinc-800" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} White Quantex. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {["PCI-DSS", "SOC 2", "GDPR"].map((badge) => (
              <span
                key={badge}
                className="flex items-center gap-1.5 rounded-none border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-300"
              >
                <ShieldCheck className="h-3 w-3 text-slate-700 dark:text-white" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
})
