# WHITE QUANTEX 2.0 — SPECIFICATION GAPS & CLARIFICATION ITEMS

Date: 2026-11-19  
Branch: `audit/wq-verification`  
Auditor: Antigravity Audit Agent

---

## 1. Pre-Identified Spec Gaps (G-01 to G-26) Resolution Status

| ID | Description | Code Investigation & Evidence | Resolution / Determination |
|---|---|---|---|
| **G-01** | Header says 43 tables; spec documents ~25. | `information_schema` query confirmed exactly 43 tables in `WhiteQuantex-Financial-Database`. | Documented all 18 missing tables in `docs/audit/UNDOCUMENTED_SURFACE.md`. 13 legacy v1 tables + 2 Flyway tables + 28 v2 modern tables. |
| **G-02** | Role names disagreement (`CORPORATE` vs `COMPANY_FUNDRAISING` vs `ROLE_CORPORATE`). | Inspected `users.primary_role`, `roles`, and Spring Security configs. | `users.primary_role` uses `INVESTOR`, `FOUNDER`, `CORPORATE`, `ADMIN`. JWT token claims store this role. Both Spring filters prepend `ROLE_` to map to Spring authorities (`ROLE_CORPORATE`, `ROLE_FOUNDER`, `ROLE_ADMIN`, `ROLE_INVESTOR`). |
| **G-03** | "Admin only" on SEC 506(c) verification review. | Inspected `CompanyVerificationController.java` and `CompanyVerificationService.java`. | Enforced via `@PreAuthorize("hasRole('ADMIN')")` at platform level. Defect found: Submitters who also hold platform ADMIN role can review and approve their own filing (lacks self-approval guard). |
| **G-04** | Both Spring backends use Flyway against one DB. | Inspected `application.yml` and Flyway history tables. | Distinct tables are configured: `flyway_company_history` (Company backend) and `flyway_schema_history` (User backend). Both execute safely without checksum collision. |
| **G-05** | Polymorphic reference for `company_memberships.company_id` across `companies` and `ventures`. | Inspected `CompanyMembershipService.java` and DB foreign keys. | No foreign key exists on `company_id` to allow referencing either `companies.id` or `ventures.id`. Code checks both repositories (`companyRepository` then `ventureRepository`). |
| **G-06** | Ticker and CIK uniqueness across `companies` and `ventures`. | Inspected DB constraints and `CompanyLifecycleService.java`. | Both tables have unique constraints on `(ticker)` and `(cik)`. On startup graduation, the exact UUID is preserved and the venture is marked `is_graduated = true`. |
| **G-07** | Venture orders and positions upon graduation. | Inspected `CompanyLifecycleService.java`. | Currently `venture_orders` and `venture_positions` remain in place. They are not migrated or converted into `corporate_orders`/`corporate_positions`. Logged as C-03. |
| **G-08** | Optimistic locking on `PUT /api/companies/{id}`. | Inspected `UpdateCompanyRequestDto.java` and `CompanyService.java`. | Client passes `version` in DTO (`@NotNull`). Server checks `!company.getVersion().equals(request.getVersion())` and throws HTTP 409 `ConflictException`. |
| **G-09** | `company_memberships` vs `companies.owner_user_id` consistency. | Inspected `CompanyMembershipService.transferOwnership`. | Atomic transaction updates both `companies.owner_user_id` and elevates new owner to `OWNER` while demoting previous owner to `ADMIN`. |
| **G-10** | Idempotency table keyed by `key` alone (PK). | Inspected `company_idempotency_keys` table and `IdempotencyService.java`. | `PRIMARY KEY (key)` causes collision across multiple users or endpoints submitting identical client keys. Needs compound key or scoping by `(key, user_id)`. |
| **G-11** | High-concurrency trade execution race conditions. | Inspected `CompanyRegistrationController.executeTrade` and `MarketPriceService.applyTradeImpact`. | Trades update price quotes in memory and asynchronously write orders/positions without acquiring row locks on user balance or positions. |
| **G-12** | Cross-service data ownership: User Backend writing to `companies` and `ventures`. | Inspected `CompanyRegistrationController.java` and `MarketPriceService.java`. | User Backend directly mutates `companies` and `ventures` tables owned by Company Backend upon trade execution. Violation of 1.2 ownership boundaries. |
| **G-13** | Sell flow, limit orders, and order matching engine. | Inspected `CorporateOrderEntity.java` and controllers. | No order matching engine exists. Trades are instant market buys against platform liquidity. Sell flow is not implemented in backend. |
| **G-14** | Quarterly calibration division by zero and edge cases. | Inspected `MarketPriceService.java` and `CompanyFinancialService.java`. | `newQuarterRevenue = 0` checked (`profitMargin = BigDecimal.ZERO`). However, calibration formula diverged from spec (invented growthFactor). |
| **G-15** | Money and pricing math floating-point precision. | Inspected `MarketPriceService.java`. | Base price calculation uses `Math.max(10.0, Math.min(1500.0, ...))` with `double` arithmetic instead of `BigDecimal`. |
| **G-16** | Impact % formula counts both `shares` and `amountInvested`. | Inspected `MarketPriceService.java` line 359. | Formula matches spec syntax exactly, but combines correlated parameters. Kept as spec defines. |
| **G-17** | Shared symmetric JWT secret and session revocation. | Inspected `application.yml` and `JwtAuthenticationFilter.java` in both backends. | Both services share identical secret. User backend verifies session in `user_sessions` table; Company backend only inspects signature, ignoring session logout/revocation. |
| **G-18** | Demo login credentials and restrictions. | Inspected `AuthController.demoLogin`. | Always grants fixed demo investor user (`55555555-...`) with `ROLE_INVESTOR`. Blocked from company portal mutations. |
| **G-19** | SSE authentication for `/api/market/stream`. | Inspected `MarketController.java` and `SecurityConfig.java`. | Endpoint is publicly accessible without JWT header. SSE broadcast is public market data. |
| **G-20** | Social Node backend auth model & Socket.io. | Inspected `User Module/backend-node/src/middleware/auth.mjs`. | Node backend blindly trusts headers `X-WQ-User-Id` without validating JWT signatures. P0 vulnerability. |
| **G-21** | Read endpoint authorization & IDOR. | Inspected all controllers. | Audit logs and documents strictly enforce membership (`assertIsAdminOrOwner`). Public profile and quotes are read-only. |
| **G-22** | Database enum CHECK constraints. | Inspected PostgreSQL column types. | Documented enums stored as `VARCHAR(50)`. Validated by Java enum parsers; DB-level CHECK constraints missing on some tables. |
| **G-23** | Immutability of lifecycle history and audit logs. | Inspected repositories and services. | Audit and history entities have no update/delete endpoints. Enforced at application service layer (append-only). |
| **G-24** | Exposure of sensitive fields (`tax_id`, `business_registration_number`). | Inspected DTOs. | Sensitive fields returned only in `CompanyVerificationResponseDto` accessible by admin/owner. Redacted from public endpoints. |
| **G-25** | External market-data and email provider credentials. | Inspected `application.yml`. | No third-party market data provider configured; ticks are generated by internal simulation engine. Email SMTP not configured. |
| **G-26** | Frontend test tooling. | Inspected `package.json` across frontends and Node. | Frontends have Vite build and React Router. Node backend has `playwright` devDependency. |

---

## 2. Clarification Items Needing Owner Decisions (C-01 to C-07)

| Item ID | Question for Owner | Affected Area / Features | Safest Interim Behavior |
|---|---|---|---|
| **C-01** | **Authentication Routing for Company Portal (Port 7001)**: Should the Company Frontend proxy `/api/auth/*` requests to User Backend (8080) where `AuthController` lives, or should Company Backend (8081) implement an authentication controller? | F-23, F-25, Company Portal Login | Route Company Frontend's `/api/spring/auth/*` requests to port 8080 or have Company Backend proxy auth calls to User Backend. |
| **C-02** | **Cross-Service Valuation & Price Updates (G-12)**: The spec dictates that Company Backend owns `companies` and `ventures`, but User Backend's `MarketPriceService` updates valuations upon trades. Should User Backend publish an internal event / direct call, or is direct table update permissible in the shared DB architecture? | F-14, F-19, G-12 | Direct DB updates with transactional consistency, documented as a shared-schema pattern. |
| **C-03** | **Investor Positions Post-Graduation (G-07)**: When a venture graduates to an established company, should investor holdings in `venture_positions` be automatically transferred to `corporate_positions`? | F-13, Graduation, F-20 Holdings | Keep existing `venture_positions` intact with a `GRADUATED` status tag to avoid disruptive balance alteration without explicit governance. |
| **C-04** | **Self-Review Guard for SEC 506(c) Verification (G-03)**: Should a user with platform `ROLE_ADMIN` be forbidden from reviewing their own company's verification application? | F-12, SEC 506(c) Review | Enforce `if (verification.getSubmittedBy().equals(reviewerUserId)) throw ForbiddenException("Reviewer cannot approve self-submitted filing");`. |
| **C-05** | **Quarterly Calibration Price Adjustment Target**: When quarterly financials are submitted to Company Backend (8081), how should the price calibration trigger User Backend's live quotes? | F-14, Quarterly Financials | Company Backend updates quarterly financials in PostgreSQL; User Backend reads the updated quarterly metrics on its next price calibration cycle. |
| **C-06** | **Idempotency Scoping (G-10)**: Should the primary key of `company_idempotency_keys` be updated to a composite key `(key, user_id)` to prevent cross-tenant key collisions? | F-15, Idempotency | Update PK in Flyway migration to `(key, user_id)`. |
| **C-07** | **Node.js Social Backend Authentication**: Should Node.js backend verify the shared symmetric JWT secret (`process.env.JWT_SECRET`) on all incoming REST requests and Socket.io handshakes rather than trusting incoming headers? | F-26, F-27, Community & Chat | Add standard JWT verification middleware using `jsonwebtoken` to validate `Authorization: Bearer <token>` and populate `req.user`. |
