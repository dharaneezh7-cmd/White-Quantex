import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router"
import {
  Building2,
  ShieldCheck,
  Search,
  X,
  ArrowUpDown,
  Table,
  LayoutGrid,
  Filter,
  MapPin,
  User,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ArrowRight,
} from "lucide-react"
import { getCompanyLogoStyle } from "../utils/exploreUtils"

export interface ExploreIndexTabProps {
  allCompanies: any[]
  filteredCompaniesIndex: any[]
  totalRegisteredCount: number
  indexSearchQuery: string
  setIndexSearchQuery: (query: string) => void
  indexSortBy: "name" | "valuation" | "founded" | "employees"
  setIndexSortBy: (sort: "name" | "valuation" | "founded" | "employees") => void
  indexViewMode: "table" | "grid"
  setIndexViewMode: (mode: "table" | "grid") => void
  indexSelectedLetter: string
  setIndexSelectedLetter: (letter: string) => void
  indexSelectedSector: string
  setIndexSelectedSector: (sector: string) => void
  alphabetLetters: string[]
  indexSectorList: string[]
  onSelectCompany: (company: any) => void
  entityLabel?: string
  aggregateValuation?: string
  legalEntitiesRatio?: string
  averageTrustScore?: string | number
}

export function ExploreIndexTab({
  allCompanies,
  filteredCompaniesIndex,
  totalRegisteredCount,
  indexSearchQuery,
  setIndexSearchQuery,
  indexSortBy,
  setIndexSortBy,
  indexViewMode,
  setIndexViewMode,
  indexSelectedLetter,
  setIndexSelectedLetter,
  indexSelectedSector,
  setIndexSelectedSector,
  alphabetLetters,
  indexSectorList,
  onSelectCompany,
  entityLabel = "Companies",
}: ExploreIndexTabProps) {
  const isVentures = entityLabel === "Ventures"
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 40
  const directoryTopRef = useRef<HTMLDivElement>(null)

  // Reset to first page whenever search query, sort option, alphabet letter, or sector filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [indexSearchQuery, indexSortBy, indexSelectedLetter, indexSelectedSector])

  const totalItems = filteredCompaniesIndex.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)

  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedCompanies = filteredCompaniesIndex.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    if (directoryTopRef.current) {
      directoryTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const getPaginationItems = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", total]
    }
    if (current >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
    }
    return [1, "...", current - 1, current, current + 1, "...", total]
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Corporate Registry Scope Card */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                <Building2 className="h-2.5 w-2.5 text-indigo-400" />
                {isVentures ? "Venture Registry" : "Corporate Registry"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                {isVentures ? "Ventures & Growth Rounds" : "Companies Only · No Ventures"}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              SEC CIK &amp; Delaware Division of Corporations Verified
            </span>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {isVentures ? "Master Venture Issuers & Growth Deals Index" : "Corporate Issuers Index Directory"}
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {isVentures
                ? "Directory of verified venture issuers, growth syndicates, Delaware C-Corps, statutory legal entities, executive officers, and enterprise valuations."
                : "Directory of verified operational companies, incorporating Delaware C-Corps, statutory legal entities, executive officers, and enterprise valuations. Strictly operating corporate entities — excluding active venture crowdfunding campaigns and rounds."}
            </p>
          </div>

          {/* KPI Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">{isVentures ? "Venture Issuers" : "Corporate Issuers"}</span>
              <span className="text-xs sm:text-sm font-extrabold text-white mt-0.5 block">{totalRegisteredCount} Verified</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Aggregate Valuation</span>
              <span className="text-xs sm:text-sm font-extrabold text-[#00d09c] mt-0.5 block">$1.08 Billion</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Legal Entities</span>
              <span className="text-xs sm:text-sm font-extrabold text-indigo-300 mt-0.5 block">100% C-Corp / Inc</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Corporate Trust</span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-300 mt-0.5 block">94.8 / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter, Search & View Controls */}
      <div ref={directoryTopRef} className="space-y-3">
        {/* Search Bar & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={indexSearchQuery}
              onChange={(e) => setIndexSearchQuery(e.target.value)}
              placeholder={
                isVentures
                  ? "Search venture issuers by legal name, ticker, CEO, sector, CIK, HQ..."
                  : "Search operating companies by legal name, ticker, CEO, sector, CIK, HQ..."
              }
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-100/90 dark:bg-zinc-900 border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-slate-100 dark:focus:bg-zinc-800 transition-colors"
            />
            {indexSearchQuery && (
              <button
                type="button"
                onClick={() => setIndexSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-zinc-900 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500 dark:text-zinc-400 font-semibold hidden sm:inline">Sort:</span>
              <select
                value={indexSortBy}
                onChange={(e) => setIndexSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer text-xs"
              >
                <option value="valuation" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Valuation (High to Low)</option>
                <option value="name" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Company Name (A-Z)</option>
                <option value="founded" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Year Founded</option>
                <option value="employees" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Employee Count</option>
              </select>
            </div>

            {/* View Mode Toggle: Table / Grid */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setIndexViewMode("table")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  indexViewMode === "table"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
                title="Table Directory View"
              >
                <Table className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setIndexViewMode("grid")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  indexViewMode === "grid"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* A-Z Alphabetical Directory Jump Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span className="font-semibold flex items-center gap-1">
              Alphabetical Directory Jump:
            </span>
            <span>
              Showing <strong>{totalItems === 0 ? 0 : `${startIndex + 1}–${endIndex}`}</strong> of {totalItems} matching issuers ({totalRegisteredCount} total){totalPages > 1 ? ` · Page ${safeCurrentPage} of ${totalPages}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {alphabetLetters.map((letter) => {
              const isLetterActive = indexSelectedLetter === letter
              const countForLetter = letter === "ALL" 
                ? totalRegisteredCount 
                : allCompanies.filter((c) => c.name.toUpperCase().startsWith(letter)).length
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setIndexSelectedLetter(letter)}
                  disabled={countForLetter === 0 && letter !== "ALL"}
                  className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                    isLetterActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : countForLetter === 0
                      ? "text-slate-300 dark:text-zinc-700 cursor-not-allowed"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  {letter}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Sector:
          </span>
          {indexSectorList.map((sector) => {
            const isSectorActive = indexSelectedSector === sector
            return (
              <button
                key={sector}
                type="button"
                onClick={() => setIndexSelectedSector(sector)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSectorActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                }`}
              >
                {sector}
              </button>
            )
          })}
        </div>
      </div>

      {/* Empty Search / Filter State */}
      {filteredCompaniesIndex.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Building2 className="h-6 w-6" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {isVentures ? "No Venture Issuers Found" : "No Operating Companies Found"}
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            {isVentures
              ? `No registered venture issuers match your query "${indexSearchQuery || indexSelectedLetter}" in the selected sector.`
              : `No registered corporate issuers match your query "${indexSearchQuery || indexSelectedLetter}" in the selected sector.`}
          </p>
          <button
            type="button"
            onClick={() => {
              setIndexSearchQuery("")
              setIndexSelectedLetter("ALL")
              setIndexSelectedSector("All")
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
          >
            Reset Directory Filters
          </button>
        </div>
      ) : indexViewMode === "table" ? (
        /* ── TABLE VIEW ─────────────────────────────────────────── */
        <div className="rounded-xl overflow-hidden bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200/60 dark:border-zinc-800/60 select-none">
                <tr>
                  <th className="py-3 px-4">Company & Legal Entity</th>
                  <th className="py-3 px-3">Ticker / CIK</th>
                  <th className="py-3 px-3">Sector & Specialization</th>
                  <th className="py-3 px-3">Headquarters</th>
                  <th className="py-3 px-3">Executive CEO</th>
                  <th className="py-3 px-3 text-right">Headcount</th>
                  <th className="py-3 px-3 text-right">Valuation / ARR</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-normal">
                {paginatedCompanies.map((comp) => (
                  <tr
                    key={comp.id}
                    onClick={() => onSelectCompany(comp)}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Company Name & Entity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          style={getCompanyLogoStyle(comp.logoColor, comp.ticker)}
                          className="h-8 w-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs ring-1 ring-slate-200/80 dark:ring-zinc-800"
                        >
                          {comp.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block truncate">
                            {comp.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                            {comp.legalEntity} · Est. {comp.foundedYear || (comp as any).founded}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Ticker / CIK */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 block w-fit">
                        {comp.ticker}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {comp.cik}
                      </span>
                    </td>

                    {/* Sector & SubIndustry */}
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                        {comp.sector}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate block max-w-[180px]">
                        {comp.subIndustry}
                      </span>
                    </td>

                    {/* Headquarters */}
                    <td className="py-3.5 px-3">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-zinc-300">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        {comp.headquarters}
                      </span>
                      <span className="text-[10px] text-slate-400 block pl-4">
                        {comp.region}
                      </span>
                    </td>

                    {/* CEO */}
                    <td className="py-3.5 px-3">
                      <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-zinc-200">
                        <User className="h-3 w-3 text-slate-400 shrink-0" />
                        {comp.ceo}
                      </span>
                      <span className="text-[10px] text-slate-400 block pl-4">
                        Chief Executive
                      </span>
                    </td>

                    {/* Employees */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">
                        {comp.employees}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        FTEs
                      </span>
                    </td>

                    {/* Valuation & ARR */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="font-extrabold text-slate-900 dark:text-white font-mono block">
                        {comp.valuation}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                        {comp.annualRevenue}
                      </span>
                    </td>

                    {/* Status & Verification */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-block">
                        {comp.status}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold mt-0.5">
                        {comp.verificationLevel || (comp as any).verification}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/companies/${comp.ticker || comp.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#00d09c] hover:bg-[#00b888] text-slate-950 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                        >
                          Profile
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── GRID CARD VIEW ─────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {paginatedCompanies.map((comp) => (
            <div
              key={comp.id}
              onClick={() => onSelectCompany(comp)}
              className="p-3 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2.5 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      style={getCompanyLogoStyle(comp.logoColor, comp.ticker)}
                      className="h-7 w-7 rounded-lg text-white font-extrabold flex items-center justify-center text-[11px] shadow-2xs shrink-0 ring-1 ring-slate-200/80 dark:ring-zinc-800"
                    >
                      {comp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {comp.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                          {comp.ticker}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono truncate">
                          {comp.legalEntity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    {comp.verificationLevel || (comp as any).verification}
                  </span>
                </div>

                {/* Sector & Sub-industry */}
                <div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 block truncate">
                    {comp.sector} · {comp.subIndustry}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">
                    {comp.description}
                  </p>
                </div>

                {/* Compact Financial & Headcount Grid */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 p-2 rounded-lg bg-slate-100/60 dark:bg-zinc-800/40 text-[10px]">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Valuation</span>
                    <span className="font-extrabold text-slate-900 dark:text-white font-mono text-[11px] block">{comp.valuation}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Revenue Run-rate</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-[11px] block">{comp.annualRevenue}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Headcount</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 text-[10px] block">{comp.employees} FTEs</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Founded</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 text-[10px] block">{comp.foundedYear || (comp as any).founded}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 text-[10px] truncate max-w-[130px]">
                  <User className="h-2.5 w-2.5 shrink-0 text-slate-400" />
                  <span className="truncate">{comp.ceo}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    to={`/companies/${comp.ticker || comp.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1 rounded-md bg-[#00d09c] hover:bg-[#00b888] text-slate-950 font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-slate-200/80 dark:border-zinc-800">
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            Showing <span className="font-bold font-mono text-slate-900 dark:text-white">{startIndex + 1}</span>–
            <span className="font-bold font-mono text-slate-900 dark:text-white">{endIndex}</span> of{" "}
            <span className="font-bold font-mono text-slate-900 dark:text-white">{totalItems}</span> corporate issuers ·{" "}
            <span className="text-slate-400 dark:text-zinc-500">40 per page</span>
          </div>

          <div className="flex items-center gap-1.5 select-none">
            {/* First Page */}
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
              disabled={safeCurrentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPaginationItems(safeCurrentPage, totalPages).map((item, idx) => {
                if (item === "...") {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-slate-400 select-none">
                      ...
                    </span>
                  )
                }
                const pageNum = Number(item)
                const isActive = pageNum === safeCurrentPage
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-mono ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => handlePageChange(Math.min(totalPages, safeCurrentPage + 1))}
              disabled={safeCurrentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
