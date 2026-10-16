import React from "react"
import { FileCheck, ShieldCheck } from "lucide-react"

export interface LiveOrder {
  id: string
  company: string
  instrument: string
  amount: string
  shares: string
  date: string
  status: string
  statusLabel: string
  badge: string
}

export interface ExploreOrdersTabProps {
  liveOrders: LiveOrder[]
  orderFilter: "ALL" | "FILLED" | "PENDING"
  entityLabel?: string
}

export function ExploreOrdersTab({
  liveOrders,
  orderFilter,
  entityLabel = "Companies",
}: ExploreOrdersTabProps) {
  const isVentures = entityLabel === "Ventures"
  const filteredOrders = liveOrders.filter((ord) => orderFilter === "ALL" || ord.status === orderFilter)

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="rounded-xl overflow-hidden bg-slate-50/50 dark:bg-zinc-900/40 shadow-xs">
        <div className="p-4 border-b border-slate-200/40 dark:border-zinc-800/40 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-blue-500" />
              {isVentures ? "Venture Allocation" : "Corporate Orders"} &amp; Share Executions
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Audited ledger records with cryptographic contract hash confirmation
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Ledger Node: <strong>US-EAST-JPA</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900/90 text-slate-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider border-b border-slate-200/40 dark:border-zinc-800/40">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-3">{isVentures ? "Venture / Startup Name" : "Company Name"}</th>
                <th className="py-3 px-3">Share Class / Instrument</th>
                <th className="py-3 px-3">Invested Amount</th>
                <th className="py-3 px-3">Units / Shares</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Settlement Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 dark:text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileCheck className="h-7 w-7 text-slate-400 dark:text-zinc-600 mb-0.5" />
                      <p className="font-bold text-xs text-slate-700 dark:text-zinc-300">
                        No {isVentures ? "venture allocation" : "corporate secondary"} orders
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-500 max-w-sm">
                        {orderFilter === "ALL"
                          ? `No trade executions or pending escrow orders recorded on your ${isVentures ? "venture" : "corporate"} ledger.`
                          : `No orders found matching status filter "${orderFilter}".`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {ord.id}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {ord.company}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-zinc-300">{ord.instrument}</td>
                    <td className="py-3.5 px-3 font-bold text-[#00d09c]">{ord.amount}</td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-zinc-400 font-mono">{ord.shares}</td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">{ord.date}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ord.badge}`}>
                        {ord.statusLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-[11px] transition-colors cursor-pointer">
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Note */}
      <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#00d09c] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-slate-900 dark:text-white block">
            Institutional Security & Escrow Guarantee
          </span>
          <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
            Every executed order is backed by automated smart escrow custody, SEC Rule 506(c) accredited verification, and tamper-proof cap table synchronizations on our Spring Boot PostgreSQL core.
          </p>
        </div>
      </div>
    </div>
  )
}
