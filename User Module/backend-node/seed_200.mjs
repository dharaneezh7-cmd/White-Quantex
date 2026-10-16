import fs from "fs"
import path from "path"
import mongoose from "mongoose"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─────────────────────────────────────────────────────────────────────────────
// 1. DATA DEFINITIONS FOR 200 COMPANIES
// ─────────────────────────────────────────────────────────────────────────────

const sectors = [
  {
    name: "Fintech",
    subIndustries: [
      "Real-time Settlement Rails", "Decentralized Escrow", "Cross-border Liquidity",
      "Corporate Treasury Clearing", "Sovereign Debt Tokenization", "Algorithmic Market Making",
      "Triple-entry Accounting", "Autonomous Tax Reconciliation", "Institutional Lending Protocols",
      "Cap Table Secondary Market"
    ],
    prefixes: ["Nova", "Apex", "Veloce", "Aura", "Sovereign", "Omni", "Strata", "Nexus", "Equi", "Zeta", "Flux", "Kinetix", "Valence", "Prime", "Synapse"],
    suffixes: ["Pay", "Capital", "Ledger", "Settlement", "Treasury", "Liquidity", "Vault", "Exchange", "Fintech", "Rails", "Credit", "Trust", "Direct", "Matrix"]
  },
  {
    name: "AI & ML",
    subIndustries: [
      "Distributed Neural Inference", "Autonomous ERP Reasoning", "LLM Quantization Hardware",
      "Multi-Agent Workflow Orchestration", "Spatial Computer Vision", "Speech Synthesis Telemetry",
      "Synthetic Data Generation", "AI Regulatory Compliance", "Zero-Shot Video Diffusion",
      "Neuromorphic Edge Inference"
    ],
    prefixes: ["Cogni", "Neuro", "Synap", "Tensor", "Deep", "Hyper", "Intelli", "Cortex", "Meta", "Omni", "Logic", "Vector", "Pulse", "Mind", "Axon"],
    suffixes: ["Mind", "Logic", "AI", "Intelligence", "Labs", "Systems", "Neural", "Cognition", "Robotics", "Compute", "Matrix", "Inference", "Engines", "Core"]
  },
  {
    name: "CleanTech",
    subIndustries: [
      "Solid-State Utility Batteries", "Autonomous Microgrid Dispatch", "Perovskite Photovoltaic Films",
      "Industrial Carbon Capture", "Green Hydrogen Electrolyzers", "Bio-Synthetic Aviation Fuels",
      "Smart Thermal Heat Pumps", "Decentralized Energy Virtual Plants", "Direct Air Scrubbing",
      "Geothermal Closed-Loop Wells"
    ],
    prefixes: ["Terra", "Solar", "Verde", "Aero", "Eco", "Hydro", "Bio", "Geo", "Volt", "Carbon", "Clean", "Lumina", "Zephyr", "Aura", "Helios"],
    suffixes: ["Volt", "Energy", "Grid", "Harvest", "Power", "Carbon", "Clean", "Storage", "Battery", "Dynamics", "Fuels", "Thermal", "Renewables", "Eco"]
  },
  {
    name: "SaaS",
    subIndustries: [
      "Post-Quantum Security Enclaves", "Reed-Solomon Erasure Storage", "Autonomous Compliance CI/CD",
      "Enterprise Identity Orchestration", "API Observability Telemetry", "Real-time Graph Database Engine",
      "Contract Lifecycle Intelligence", "Fleet Telematics Dispatch", "Distributed Multi-Cloud Mesh",
      "Developer Sandboxing Infrastructure"
    ],
    prefixes: ["Data", "Cyber", "Cloud", "Secure", "Mesh", "Ops", "Shield", "Sync", "Stream", "Stack", "Infra", "Fort", "Logic", "Base", "Trace"],
    suffixes: ["Forge", "Vault", "Shield", "Flow", "Sync", "Stack", "Cloud", "Ops", "Hub", "Scale", "Secure", "Sphere", "Base", "Metrics"]
  },
  {
    name: "Biotech",
    subIndustries: [
      "CRISPR Cas13 Targeted RNA Editing", "Personalized Neoantigen Vaccines", "Enzymatic DNA Synthesis",
      "Subcutaneous Continuous Biosensing", "Autonomous Laparoscopic Micro-robotics", "Protein Fold Diffusion Modeling",
      "Allogeneic Cell Therapy", "Blood-Brain Barrier Nanocarriers", "Epigenetic Reprogramming",
      "Stem Cell Organoid Regeneration"
    ],
    prefixes: ["Bio", "Helix", "Synthetix", "Pulse", "Gen", "Thera", "Vanguard", "Cell", "Nano", "Immuno", "Aura", "Medi", "Cure", "Onco", "Vital"],
    suffixes: ["Sync", "Vanguard", "Labs", "Therapeutics", "Bio", "Genetics", "Pharma", "Health", "Cell", "Medical", "Robotics", "Synthetics", "Life", "BioLabs"]
  },
  {
    name: "SpaceTech",
    subIndustries: [
      "In-Space Ion Thruster Propulsion", "Autonomous LEO Constellations", "Superconducting RF Nanowafers",
      "Magnetic Confinement Fusion", "Reusable Upper Stage Fairings", "Orbital Refueling Nodes",
      "Lunar Telemetry Relays", "Synthetic Aperture Radar", "Laser Inter-Satellite Links",
      "Radiation-Hardened Space Compute"
    ],
    prefixes: ["Orbital", "Aether", "Aero", "Hyperion", "Quantum", "Cosmo", "Astro", "Solar", "Starlight", "Exo", "Pinnacle", "Vanguard", "Nova", "Zenith", "Titan"],
    suffixes: ["Dynamics", "Systems", "Space", "Orbital", "Propulsion", "Materials", "Fusion", "Launch", "Constellation", "Satellites", "Robotics", "Aero", "Astro", "Frontier"]
  }
]

const cities = [
  { hq: "San Francisco, CA", region: "West Coast" },
  { hq: "San Jose, CA", region: "West Coast" },
  { hq: "Austin, TX", region: "Southwest" },
  { hq: "New York, NY", region: "East Coast" },
  { hq: "Boston, MA", region: "East Coast" },
  { hq: "Seattle, WA", region: "Pacific Northwest" },
  { hq: "Denver, CO", region: "Mountain West" },
  { hq: "Boulder, CO", region: "Mountain West" },
  { hq: "Chicago, IL", region: "Midwest" },
  { hq: "Atlanta, GA", region: "South" },
  { hq: "Houston, TX", region: "South" },
  { hq: "Dallas, TX", region: "Southwest" },
  { hq: "San Diego, CA", region: "West Coast" },
  { hq: "Pittsburgh, PA", region: "East Coast" },
  { hq: "Salt Lake City, UT", region: "Mountain West" },
  { hq: "Raleigh, NC", region: "South" },
  { hq: "Miami, FL", region: "South" },
  { hq: "Washington, DC", region: "East Coast" }
]

const firstNames = [
  "Dr. Alexander", "Elena", "Marcus", "Sarah", "Jonathan", "Dr. Rachel", "Arthur", "Chloe", "Dr. Nathan",
  "David", "Sophia", "Julian", "Dr. Warren", "Sergei", "Nadia", "Bradley", "Leona", "Liam", "Dr. Victor",
  "Maya", "Cassandra", "Adrian", "Talia", "Gabriel", "Dr. Aris", "Kavita", "Dmitri", "Camila", "Lucian",
  "Hannah", "Vikram", "Dr. Evelyn", "Owen", "Siddharth", "Zoe", "Felix", "Amara", "Xavier", "Isabella", "Maxim"
]

const lastNames = [
  "Vance", "Voss", "Klein", "Chen", "Frost", "Kim", "Pendelton", "Davenport", "Cross", "Holm",
  "Sterling", "Thorne", "Price", "Voronov", "Al-Mansoor", "Cooper", "Martinez", "Zhao", "Novak",
  "Patel", "Sinclair", "Mercer", "Lindqvist", "Kovacs", "Reyes", "O'Connor", "Takahashi", "Moreau",
  "Dubois", "Fischer", "Gupta", "Nakamura", "Becker", "Wright", "Goldstein", "Hastings", "Mercer", "Kaufman"
]

const logoColors = [
  "bg-indigo-600", "bg-emerald-600", "bg-cyan-600", "bg-blue-600", "bg-purple-600",
  "bg-rose-600", "bg-amber-600", "bg-teal-600", "bg-orange-600", "bg-violet-600",
  "bg-slate-700", "bg-zinc-700", "bg-red-600", "bg-emerald-500", "bg-blue-700"
]

const tiers = ["Tier-1 Institutional", "Tier-2 Growth", "Tier-3 Emerging"]
const statuses = ["Active Trading", "Operating - Private", "Pre-IPO Syndicate"]
const verifications = ["PLATINUM", "GOLD", "SILVER"]
const legalEntities = ["Delaware C-Corp", "Delaware C-Corp", "Delaware C-Corp", "California Corp", "New York Corp", "Nevada Corp"]

// Helper for formatting pad
function pad(num, size) {
  let s = num + ""
  while (s.length < size) s = "0" + s
  return s
}

// Generate 200 unique companies
const generatedCompanies = []
const usedTickers = new Set([
  "TFLOW", "GGRID", "NPAY", "CARB", "ORBD", "MEDS", "CYBR", "SHRV", "OMNI", "TVLT",
  "AETH", "BVGD", "DFRG", "FLED", "HLIX", "CGNS", "AGRD", "QMAT", "SGLD", "FUSE",
  "PULSE", "SYNT", "RBCD", "EXOA", "VRTX"
])

const sectorCounts = {
  "Fintech": 34,
  "AI & ML": 34,
  "CleanTech": 34,
  "SaaS": 34,
  "Biotech": 32,
  "SpaceTech": 32
}

let compCounter = 1

for (const sectorObj of sectors) {
  const countNeeded = sectorCounts[sectorObj.name]
  for (let i = 0; i < countNeeded; i++) {
    const idNum = compCounter + 25 // existing 25
    const companyId = `00000000-0000-0000-0001-${pad(idNum, 12)}`
    const metricId = `10000000-0000-0000-0001-${pad(idNum, 12)}`

    // Ticker generation: 4 letters unique
    let ticker = ""
    let attempts = 0
    while (!ticker || usedTickers.has(ticker)) {
      const p = sectorObj.prefixes[Math.floor(Math.random() * sectorObj.prefixes.length)].slice(0, 2).toUpperCase()
      const s = sectorObj.suffixes[Math.floor(Math.random() * sectorObj.suffixes.length)].slice(0, 2).toUpperCase()
      const extra = String.fromCharCode(65 + (attempts % 26))
      ticker = attempts < 3 ? (p + s) : (p + s.slice(0, 1) + extra)
      attempts++
    }
    usedTickers.add(ticker)

    const pName = sectorObj.prefixes[i % sectorObj.prefixes.length]
    const sName = sectorObj.suffixes[(i + 3) % sectorObj.suffixes.length]
    const shortName = `${pName}${sName}`
    const suffixCorporate = i % 3 === 0 ? "Inc." : i % 3 === 1 ? "Corp." : "Technologies Ltd."
    const fullName = `${shortName} ${suffixCorporate}`

    const subInd = sectorObj.subIndustries[i % sectorObj.subIndustries.length]
    const loc = cities[(compCounter * 7) % cities.length]
    const ceo = `${firstNames[(compCounter * 3) % firstNames.length]} ${lastNames[(compCounter * 5) % lastNames.length]}`
    const foundedYear = 2018 + (compCounter % 7)
    const employees = 15 + ((compCounter * 17) % 380)

    // Valuation calculation: between $12M and $180M
    const valBase = 12 + ((compCounter * 7.3) % 168)
    const valuationNum = Math.round(valBase * 10) / 10
    const valuationStr = `$${valuationNum.toFixed(1)}M`

    // ARR: roughly 20-35% of valuation
    const arrNum = Math.round(valuationNum * (0.22 + (compCounter % 15) * 0.01) * 10) / 10
    const arrStr = `$${arrNum.toFixed(1)}M ARR`

    const verificationLevel = verifications[compCounter % verifications.length]
    const trustScore = 86 + (compCounter % 14)
    const logoColor = logoColors[compCounter % logoColors.length]
    const status = statuses[compCounter % statuses.length]
    const exchangeTier = tiers[compCounter % tiers.length]
    const legalEntity = legalEntities[compCounter % legalEntities.length]
    const cik = `CIK-00021${pad(compCounter, 5)}`

    const description = `${shortName} engineers institutional ${subInd.toLowerCase()} infrastructure providing high-throughput verified execution for enterprise and private market allocators.`

    // Market metrics
    const isPositive = compCounter % 3 !== 0
    const changeMagnitude = (1.2 + (compCounter * 1.37) % 24.8).toFixed(1)
    const changePercent = isPositive ? parseFloat(changeMagnitude) : -parseFloat(changeMagnitude)
    const change24h = `${isPositive ? "+" : "-"}${changeMagnitude}%`
    const capDelta = (valuationNum * (parseFloat(changeMagnitude) / 100)).toFixed(1)
    const marketCapGainLoss = `${isPositive ? "+" : "-"}$${capDelta}M`
    const inflowNum = (0.2 + (compCounter * 0.17) % 2.8).toFixed(2)
    const investedToday = isPositive ? `+$${inflowNum}M Inflow` : `Low Inflow`
    const allocationPercent = 35 + (compCounter % 60)
    const volNum = (0.3 + (compCounter * 0.31) % 4.9).toFixed(1)
    const tradingVolumeToday = `$${volNum}M Vol`
    const is52wHigh = isPositive && parseFloat(changeMagnitude) > 16

    generatedCompanies.push({
      company: {
        id: companyId,
        ticker,
        name: fullName,
        short_name: shortName,
        legal_entity: legalEntity,
        cik,
        sector: sectorObj.name,
        sub_industry: subInd,
        headquarters: loc.hq,
        region: loc.region,
        founded_year: foundedYear,
        ceo,
        employees,
        valuation: valuationStr,
        valuation_num: valuationNum * 1000000,
        annual_revenue: arrStr,
        annual_revenue_num: arrNum * 1000000,
        verification_level: verificationLevel,
        trust_score: trustScore,
        description,
        logo_color: logoColor,
        status,
        exchange_tier: exchangeTier,
        is_active: true
      },
      metric: {
        id: metricId,
        company_id: companyId,
        change_24h: change24h,
        change_percent: changePercent,
        is_positive: isPositive,
        market_cap_gain_loss: marketCapGainLoss,
        invested_today: investedToday,
        allocation_percent: allocationPercent,
        trading_volume_today: tradingVolumeToday,
        is_52w_high: is52wHigh
      }
    })

    compCounter++
  }
}

console.log(`Generated ${generatedCompanies.length} companies and market metric rows.`)

// ─────────────────────────────────────────────────────────────────────────────
// 2. GENERATE SQL SCRIPT FOR POSTGRESQL MIGRATION (V9)
// ─────────────────────────────────────────────────────────────────────────────

let sqlContent = `-- White Quantex v2 — Seed 200 Verified Corporate Issuers and Market Data
-- Compatible with PostgreSQL and H2 databases

-- 1. Insert 200 Companies
INSERT INTO companies (
    id, ticker, name, short_name, legal_entity, cik, sector, sub_industry,
    headquarters, region, founded_year, ceo, employees, valuation, valuation_num,
    annual_revenue, annual_revenue_num, verification_level, trust_score, description,
    logo_color, status, exchange_tier, is_active
) VALUES
`

const companyValues = generatedCompanies.map((item) => {
  const c = item.company
  const safeDesc = c.description.replace(/'/g, "''")
  const safeName = c.name.replace(/'/g, "''")
  const safeShort = c.short_name.replace(/'/g, "''")
  const safeSub = c.sub_industry.replace(/'/g, "''")
  const safeCeo = c.ceo.replace(/'/g, "''")
  return `('${c.id}', '${c.ticker}', '${safeName}', '${safeShort}', '${c.legal_entity}', '${c.cik}', '${c.sector}', '${safeSub}', '${c.headquarters}', '${c.region}', ${c.founded_year}, '${safeCeo}', ${c.employees}, '${c.valuation}', ${c.valuation_num}, '${c.annual_revenue}', ${c.annual_revenue_num}, '${c.verification_level}', ${c.trust_score}, '${safeDesc}', '${c.logo_color}', '${c.status}', '${c.exchange_tier}', TRUE)`
}).join(",\n")

sqlContent += companyValues + "\nON CONFLICT (id) DO NOTHING;\n\n"

sqlContent += `-- 2. Insert 200 Company Market Metrics
INSERT INTO company_market_metrics (
    id, company_id, change_24h, change_percent, is_positive,
    market_cap_gain_loss, invested_today, allocation_percent, trading_volume_today, is_52w_high
) VALUES
`

const metricValues = generatedCompanies.map((item) => {
  const m = item.metric
  return `('${m.id}', '${m.company_id}', '${m.change_24h}', ${m.change_percent}, ${m.is_positive ? "TRUE" : "FALSE"}, '${m.market_cap_gain_loss}', '${m.invested_today}', ${m.allocation_percent}, '${m.trading_volume_today}', ${m.is_52w_high ? "TRUE" : "FALSE"})`
}).join(",\n")

sqlContent += metricValues + "\nON CONFLICT (id) DO NOTHING;\n"

const migrationFilePath = path.join(
  __dirname,
  "../backend-spring/src/main/resources/db/migration/V9__seed_200_companies.sql"
)
fs.writeFileSync(migrationFilePath, sqlContent, "utf8")
console.log(`[Success] Written V9 migration to ${migrationFilePath}`)

// Also write standalone SQL file in scratch for immediate psql execution
const tempSqlPath = path.join(__dirname, "temp_seed_200_companies.sql")
fs.writeFileSync(tempSqlPath, sqlContent, "utf8")
console.log(`[Success] Written temp SQL to ${tempSqlPath}`)

// ─────────────────────────────────────────────────────────────────────────────
// 3. GENERATE 200 POSTS FOR MONGODB
// ─────────────────────────────────────────────────────────────────────────────

const postThemes = [
  {
    topic: "AI Inference & Neural Compute",
    communitySlug: "ai-ml-founders",
    hashtags: ["AI", "MachineLearning", "NeuralInference", "EnterpriseAI", "DeepTech"],
    templates: [
      "Our latest benchmarks demonstrate a 4.2x throughput increase in distributed FP8 tensor calculations across heterogeneous clusters. Achieving sub-12ms p99 latency without sacrificing numerical stability is critical for financial order execution.",
      "Enterprise AI adoption is shifting rapidly from general-purpose foundation models to fine-tuned, sovereign domain architectures. Verifiable weights and audit logging are now mandatory statutory requirements for institutional clients.",
      "Just deployed automated model evaluation pipelines across our entire distributed inference mesh. Real-time drift detection caught multiple parameter shifts before they impacted production risk calculators.",
      "The economics of on-premise private AI clusters vs public cloud compute are reaching an inflection point. At 50M+ daily tokens, dedicated hardware delivers a 62% cost reduction with complete sovereign data residency.",
      "Announcing our open benchmark report comparing spec-decoding strategies across 70B parameter models. Distributed inference optimizations are unlocking massive enterprise efficiency.",
      "Excited to partner with secondary capital syndicates to scale our GPU compute cluster footprint. High-throughput neural reasoning is the foundational layer for next-generation algorithmic finance."
    ]
  },
  {
    topic: "CleanTech & Energy Grid",
    communitySlug: "cleantech-energy",
    hashtags: ["CleanTech", "EnergyTransition", "Microgrids", "BatteryStorage", "Renewables"],
    templates: [
      "Completed our 48-hour continuous commercial grid-tie test with zero thermal spikes. Autonomous microgrid balancing algorithms handled fluctuating peak loads seamlessly, saving 34% on peak demand charges.",
      "Direct lithium extraction and solid-state electrolyte integration are officially entering commercial scale production. Zero dendritic degradation observed after 2,500 continuous deep-discharge cycles.",
      "Industrial manufacturing facilities are transitioning into virtual power plants. By coordinating decentralized battery storage contracts, enterprise operators can monetize surplus capacity during peak tariff intervals.",
      "Synthetic fuel cell efficiency has crossed the 68% electrical threshold in bench trials. Modular hydrogen generation at point-of-consumption eliminates costly long-range cryogenic transit pipelines.",
      "State utility commissions are approving standardized fast-track interconnection tariffs for private battery storage assets. Regulatory clarity is unlocking institutional capital for distributed energy storage.",
      "Perovskite-silicon tandem solar arrays are demonstrating over 29.4% lab efficiency with accelerated UV weathering stability. Building-integrated photovoltaics are moving from novelty to mandatory architectural standard."
    ]
  },
  {
    topic: "Sovereign Fintech & Payment Rails",
    communitySlug: "sovereign-fintech",
    hashtags: ["Fintech", "Payments", "ISO20022", "Treasury", "PrivateSecondary", "Liquidity"],
    templates: [
      "ISO-20022 real-time treasury clearing enables instant cross-border batch settlement without intermediate correspondent banking delays. Capital efficiency and liquidity management have entered a new era.",
      "Private secondary equity markets require transparent, real-time price discovery combined with Delaware statutory transfer verification. Our matching engine executed $14.5M in block transactions this quarter.",
      "Corporate treasury departments are increasingly utilizing automated algorithmic liquidity routing. Holding multi-currency balances across instant rails minimizes foreign exchange slippage during high-volatility sessions.",
      "The integration of cryptographic escrow verification with standard GAAP continuous audits reduces closing timelines for secondary venture transactions from weeks to minutes.",
      "Statutory compliance and automated KYC/AML credentialing are foundational for accredited institutional syndicates. Frictionless onboarding creates deep secondary liquidity pools.",
      "Real-time settlement architectures have processed over 250,000 corporate transfers with zero ledger reconciliation discrepancies. Decentralized triple-entry bookkeeping is proving its institutional reliability."
    ]
  },
  {
    topic: "BioTech & Precision Medicine",
    communitySlug: "biotech-therapeutics",
    hashtags: ["Biotech", "Genomics", "CRISPR", "PrecisionMedicine", "HealthTech", "FDA"],
    templates: [
      "Phase 1 preliminary cohort results show 94% target engagement with zero off-target genomic cleavage using our CRISPR Cas13 RNA editing system. Preparing formal statutory filings with regulatory oversight boards.",
      "Sub-millimeter haptic surgical robotics just passed its 600th phantom trial with sub-second computer vision margin alerts. Surgeon cognitive fatigue was reduced by 40% across extended laparoscopic procedures.",
      "Automated enzymatic oligonucleotide printers are enabling decentralized research labs to synthesize therapeutic-grade DNA constructs in under 8 hours. Biomanufacturing lead times are compressing exponentially.",
      "Personalized mRNA neoantigen vaccine design pipelines have cut biopsy-to-formulation lead time down to 11 days. Rapid synthesis allows oncologists to intervene during critical post-resection windows.",
      "Continuous biosensing subcutaneous micro-implants provide uninterrupted multi-analyte tracking. Real-time biomarker analytics are transforming proactive metabolic and cardiovascular care protocols.",
      "Protein folding diffusion algorithms combined with cryo-EM validation have identified novel small molecule binding pockets previously considered undruggable. Computational biology is accelerating pipeline timelines."
    ]
  },
  {
    topic: "SpaceTech & Defense Hardware",
    communitySlug: "spacetech-defense",
    hashtags: ["SpaceTech", "Aerospace", "Propulsion", "Defense", "LEO", "Satellites"],
    templates: [
      "Successfully verified magnetic containment stability on our high-temperature superconducting magnet coils. Continuous operation achieved at 14 Tesla with nominal cryogenic cooling overhead.",
      "Our autonomous low-Earth orbit constellation completed 1,200 inter-satellite optical laser crosslinks without packet drop. High-bandwidth space telemetry is now operational across global polar orbits.",
      "Ion propulsion thruster endurance trials reached 5,000 cumulative firing hours in vacuum chamber simulations. Specific impulse metrics exceed statutory performance targets by 18%.",
      "Composite carbon matrix fairings engineered for multi-payload orbital insertion demonstrated zero structural fatigue during acoustic vibration qualification tests. Ready for flight manifest.",
      "Radiation-hardened edge compute hardware completed thermal vacuum cycling. Spacecraft avionics can now run onboard real-time neural inference without relying on ground station downlinks.",
      "Orbital refueling docking sensors achieved millimeter docking alignment under simulated microgravity thruster drift. Space logistics infrastructure is becoming commercially viable."
    ]
  },
  {
    topic: "Delaware Corporate Issuers & Secondary Liquidity",
    communitySlug: "delaware-issuers",
    hashtags: ["CorporateGovernance", "DelawareCorp", "CapTable", "VentureCapital", "409A", "M&A"],
    templates: [
      "Annual General Meeting (AGM) voting mechanics for private Delaware C-Corps can be friction-free. Transparent on-chain ballot hashing ensures unanimous shareholder verification with zero paperwork delays.",
      "Maintaining up-to-date 409A valuations and audited option pool reserves is crucial before initiating employee secondary tender offers. Structured liquidity retains top tier executive talent.",
      "Investor relations teams are leveraging automated quarterly reporting dashboards. Consolidating KPI metrics and balance sheet disclosures builds trust with sovereign and institutional allocators.",
      "Delaware statutory merger frameworks combined with standardized secondary stock transfer agreements are streamlining private corporate acquisitions. Closing cycles are dropping from 90 days to under 3 weeks.",
      "Private secondary transactions for growth-stage ventures crossed record quarterly volume on White Quantex. Verified corporate issuer registries are redefining illiquid private equity dynamics.",
      "Establishing clear ROFR (Right of First Refusal) guidelines and board observation covenants ensures clean governance during rapid Series A through Pre-IPO growth trajectories."
    ]
  }
]

const memberAuthors = [
  { id: "wq-user-elena-voss", name: "Elena Voss", username: "elenavoss", headline: "Founder & CEO @ NovaMind AI", role: "FOUNDER", level: "GOLD" },
  { id: "wq-user-marcus-klein", name: "Marcus Klein", username: "marcusklein", headline: "CEO @ VerdeGrid Energy", role: "FOUNDER", level: "SILVER" },
  { id: "wq-user-aris-thorne", name: "Dr. Aris Thorne", username: "aristhorne", headline: "Founder @ MediSync Robotics", role: "FOUNDER", level: "PLATINUM" },
  { id: "wq-user-vikram-seth", name: "Vikram Seth", username: "vikramseth", headline: "Founder @ OmniLogic NeuroTech", role: "FOUNDER", level: "GOLD" },
  { id: "wq-user-sarah-chen", name: "Sarah Chen", username: "sarahchen", headline: "General Partner @ Sequoia Capital", role: "INVESTOR", level: "PLATINUM" },
  { id: "wq-user-david-kim", name: "David Kim", username: "davidkim", headline: "Managing Director @ Founders Fund", role: "INVESTOR", level: "GOLD" },
  { id: "wq-uuid-demo-author", name: "Alexander Vance", username: "alexvance", headline: "Managing Partner · Quantex Sovereign Capital", role: "INVESTOR", level: "PLATINUM" },
  { id: "wq-user-claire-dupont", name: "Claire Dupont", username: "clairedupont", headline: "Partner @ European Tech Horizons", role: "INVESTOR", level: "GOLD" },
  { id: "wq-user-jonathan-frost", name: "Jonathan Frost", username: "jonathanfrost", headline: "CEO @ Aether Dynamics Space Systems", role: "FOUNDER", level: "PLATINUM" },
  { id: "wq-user-chloe-davenport", name: "Dr. Chloe Davenport", username: "chloedavenport", headline: "Chief Scientist @ BioVanguard Labs", role: "FOUNDER", level: "GOLD" },
  { id: "wq-user-sergei-voronov", name: "Sergei Voronov", username: "sergeivoronov", headline: "Founder @ CogniSense AI", role: "FOUNDER", level: "PLATINUM" },
  { id: "wq-user-nadia-mansoor", name: "Nadia Al-Mansoor", username: "nadiamansoor", headline: "VP of Security @ CyberShield Vault", role: "FOUNDER", level: "PLATINUM" },
  { id: "wq-user-bradley-cooper", name: "Bradley Cooper", username: "bradleycooper", headline: "COO @ RoboCore Dynamics", role: "FOUNDER", level: "GOLD" },
  { id: "wq-user-arthur-pendelton", name: "Dr. Arthur Pendelton", username: "arthurpendelton", headline: "Chief Quantum Architect @ Quantum Materials", role: "FOUNDER", level: "PLATINUM" }
]

async function seedMongoDBPosts() {
  const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/white_quantex_social"
  console.log(`[Mongo] Connecting to ${mongoURI}...`)
  await mongoose.connect(mongoURI)

  const hubsCollection = mongoose.connection.db.collection("communities")
  const hubs = await hubsCollection.find({}).toArray()
  const hubMap = {}
  hubs.forEach((h) => {
    hubMap[h.slug] = h._id.toString()
  })

  const postsCollection = mongoose.connection.db.collection("posts")
  const currentCount = await postsCollection.countDocuments()
  console.log(`[Mongo] Current posts in DB: ${currentCount}`)

  const postsToInsert = []
  const now = Date.now()

  for (let i = 0; i < 200; i++) {
    const theme = postThemes[i % postThemes.length]
    const template = theme.templates[Math.floor(i / postThemes.length) % theme.templates.length]
    const author = memberAuthors[(i * 3) % memberAuthors.length]
    const hubId = hubMap[theme.communitySlug] || null

    // Date spread over past 30 days
    const hoursAgo = Math.floor(Math.random() * 720) + 1
    const postDate = new Date(now - hoursAgo * 3600000)

    const likes = 12 + Math.floor(Math.random() * 320)
    const comments = 2 + Math.floor(Math.random() * 45)
    const shares = 1 + Math.floor(Math.random() * 28)
    const bookmarks = 4 + Math.floor(Math.random() * 65)

    // Variation prefix/suffix to ensure every post is uniquely informative
    const variationPrefixes = [
      "",
      "Update from our executive team: ",
      "Q3 Operational Milestone: ",
      "Technical Deep Dive: ",
      "Institutional Dispatch: ",
      "Strategic Market Reflection: ",
      "Founder's Note: ",
      "Field Report: "
    ]
    const pfx = variationPrefixes[i % variationPrefixes.length]
    const content = `${pfx}${template} #${theme.hashtags[0]} #${theme.hashtags[1]}`

    postsToInsert.push({
      wqAuthorId: author.id,
      authorName: author.name,
      authorUsername: author.username,
      authorAvatarUrl: "",
      authorHeadline: author.headline,
      authorRole: author.role,
      authorVerificationLevel: author.level,
      content,
      mediaUrls: [],
      videoUrl: null,
      postType: i % 4 === 0 ? "IMAGE" : "TEXT",
      visibility: "PUBLIC",
      communityId: hubId,
      hashtags: theme.hashtags.slice(0, 3),
      mentions: [],
      likesCount: likes,
      commentsCount: comments,
      sharesCount: shares,
      bookmarksCount: bookmarks,
      isDeleted: false,
      createdAt: postDate,
      updatedAt: postDate
    })
  }

  const result = await postsCollection.insertMany(postsToInsert)
  console.log(`[Mongo] Successfully inserted ${result.insertedCount} posts!`)
  const newCount = await postsCollection.countDocuments()
  console.log(`[Mongo] Total posts in DB now: ${newCount}`)

  await mongoose.disconnect()
}

seedMongoDBPosts().catch((err) => {
  console.error("[Mongo] Error seeding posts:", err)
  process.exit(1)
})
