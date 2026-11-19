# WHITE QUANTEX 2.0 — FINDINGS REGISTER

Date: 2026-11-19  
Branch: `audit/wq-verification`  
Auditor: Antigravity Audit Agent

---

## Summary of Findings by Severity

| Severity | Count | Primary Impact |
|---|---|---|
| **P0** | 2 | Authentication bypass, arbitrary identity spoofing, privilege escalation |
| **P1** | 4 | Broken company login, formula divergence from spec, idempotency key collision, cross-service ownership |
| **P2** | 4 | Missing self-review guard on verification, floating-point math in financial pricing, trade concurrency locking, missing token refresh |
| **P3** | 2 | Dead legacy v1 tables in PostgreSQL, missing DB-level CHECK constraints |
| **Total** | **12** | |

---

## Detailed Findings Register

### 1. Priority P0 — Critical Security & Auth Bypass

| ID | Severity | Area | Feature ID(s) | Spec Reference | Observed Behavior | Expected Behavior | Evidence | Root Cause | Proposed Fix | Test to Add | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **SEC-01** | **P0** | Company Security Filter | F-23, F-06, F-12 | Spec §1.3, §8 | `Company Module/backend-spring`'s `JwtAuthenticationFilter.java` (lines 70-92) blindly trusts the `X-WQ-User-Id` request header when no JWT token is present, granting full authenticated access and role (`ROLE_ADMIN`, `ROLE_CORPORATE`) to any unauthenticated caller who passes that header. | Authentication must require a valid, cryptographically signed JWT token; header-only identity spoofing must never establish a `SecurityContext`. | Line 71 in `JwtAuthenticationFilter.java`: `String devUserId = request.getHeader("X-WQ-User-Id"); ... SecurityContextHolder.getContext().setAuthentication(auth);` | Developer fallback was left in production security filter chain. | Remove header-based fallback completely from `JwtAuthenticationFilter.java`. Require valid Bearer token for all authenticated endpoints. | Automated security test asserting that a request with only `X-WQ-User-Id` header receives HTTP 401 Unauthorized. | **FAIL** |
| **SEC-02** | **P0** | Node Backend Security | F-26, F-27 | Spec §1.1, §8, G-20 | Node backend (`User Module/backend-node/src/middleware/auth.mjs`) reads unverified headers `x-wq-user-id`, `x-wq-user-role`, `x-wq-user-email` and does not verify JWT signatures, allowing arbitrary callers to spoof any user UUID, role, or post as any corporate account. | Node backend must verify the symmetric JWT signature (`${JWT_SECRET}`) on `Authorization: Bearer <token>` before populating `req.user`. | Lines 1-43 in `auth.mjs`: `const userId = req.headers["x-wq-user-id"] ... return { id: userId, role: ... }` with no `jwt.verify()`. | Absence of JWT verification middleware in Node.js service. | Integrate `jsonwebtoken` with `process.env.JWT_SECRET` in `auth.mjs` and Socket.io handshake middleware. | Node test asserting that tampered or unsigned JWT requests to `/api/posts` return 401. | **FAIL** |

---

### 2. Priority P1 — Broken Features, Formulas & Concurrency

| ID | Severity | Area | Feature ID(s) | Spec Reference | Observed Behavior | Expected Behavior | Evidence | Root Cause | Proposed Fix | Test to Add | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **BUG-01** | **P1** | Company Portal Authentication | F-23, F-25 | Spec §1.1, §1.3, C-01 | Company Frontend (port 7001) calls `/auth/login` via `/api/spring` proxy to port 8081, but Company Backend (8081) has no `AuthController`. Requests return HTTP 500 error. | Company portal users must be able to log in and obtain valid JWT tokens to manage their companies. | `curl.exe http://127.0.0.1:8081/api/auth/login` returns HTTP 500 `An unexpected internal error occurred`. | `AuthController` only exists in User Backend (port 8080). Company frontend proxy routes all `/api/spring` traffic to 8081. | In `Company Module/frontend/vite.config.ts`, route `/api/spring/auth` specifically to `http://127.0.0.1:8080`, or configure an auth proxy route in Company Backend. | Cypress/Playwright or HTTP test verifying login via port 7001 proxy returns 200 with JWT token. | **FAIL** |
| **BUG-02** | **P1** | Business Logic / Pricing Formula | F-19 | Spec §1.3, §7.2 | In `MarketPriceService.applyTradeImpact`, new valuation is calculated as `newValNum = oldValNum.add(totalAmountInvested)` instead of the specification formula `newValuation = old * (1 + impact * 0.85 / 100)`. | New valuation must follow `newValuation = old * (1 + impact * 0.85 / 100)` with `BigDecimal` arithmetic. | `MarketPriceService.java` line 377: `BigDecimal newValNum = oldValNum.add(totalAmountInvested);` | Discrepancy between code implementation and spec test vectors. | Replace valuation formula with `oldVal.multiply(BigDecimal.ONE.add(impact.multiply(new BigDecimal("0.85")).divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP)))`. | Unit test using fixed test vectors from Phase 4 (e.g. 10 shares, $1,000 -> 100,637,500.00). | **FAIL** |
| **BUG-03** | **P1** | Business Logic / Quarterly Calibration | F-14 | Spec §1.3, §7.3 | In `MarketPriceService.applyQuarterlyFinancialsUpdate`, share price uses an invented `growthFactor = Math.min(1.30, Math.max(1.04, 1.0 + margin*0.5 + 0.04))` instead of the spec formula `calibrated = annualized * 4.2 + profit * 4 * 10; factor = min(1.35, max(0.70, calibrated / currentVal)); newPrice = price * factor`. | Calibrated valuation and share price factor must follow Section 1.3 / 7.3 formula vectors. | `MarketPriceService.java` lines 469-482. | Discrepancy between code implementation and specification. | Refactor `applyQuarterlyFinancialsUpdate` to use exact spec formulas with `BigDecimal` rounding. | Unit test using Section 7.3 test vectors (e.g. 50M rev, 5M profit, 800M val -> 65.00). | **FAIL** |
| **CONC-01**| **P1** | Concurrency / Idempotency Table | F-15 | Spec §1.3 (Pillar 7), G-10 | `company_idempotency_keys` table uses `key` as the single primary key (`PRIMARY KEY (key)`). If two distinct users or different endpoints submit the same key, a primary key collision occurs. | Idempotency keys must be uniquely scoped per user and endpoint `(key, user_id)`. | PostgreSQL `\d company_idempotency_keys`: `company_idempotency_keys_pkey PRIMARY KEY (key)`. | Flyway migration `V1__company_core_schema.sql` defined PK on `key` column alone. | New Flyway migration `V3__scope_idempotency_keys_by_user.sql` altering primary key to composite `(key, user_id)`. | Automated test sending identical key from two different user IDs; both must succeed. | **FAIL** |

---

### 3. Priority P2 — Validation, Edge Cases & Partial Implementations

| ID | Severity | Area | Feature ID(s) | Spec Reference | Observed Behavior | Expected Behavior | Evidence | Root Cause | Proposed Fix | Test to Add | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **BUS-01** | **P2** | SEC 506(c) Verification | F-12 | Spec §1.3, G-03 | In `CompanyVerificationService.reviewVerification`, a user holding platform `ROLE_ADMIN` who submitted a verification request for their own company is not blocked from approving their own filing. | Submitter cannot review or approve their own company verification filing. | `CompanyVerificationService.java` lines 79-110 contains no check on `verification.getSubmittedBy().equals(reviewerUserId)`. | Missing self-review validation check. | Add check: `if (reviewerUserId.equals(verification.getSubmittedBy())) throw new ForbiddenException("Self-review prohibited");`. | Unit test asserting 403 Forbidden when submitter attempts to review own verification. | **FAIL** |
| **NUM-01** | **P2** | Precision / Money Math | F-06, F-19 | Spec §1.3, G-15 | In `MarketPriceService.java`, base price calculation uses primitive `double` arithmetic (`valuationNum.doubleValue() / 2_500_000.0`) and `Math.max(10.0, Math.min(1500.0, ...))` risking binary floating point precision loss. | All price, valuation, and impact calculations must use `BigDecimal` with explicit scale and rounding. | `MarketPriceService.java` line 76: `double sharePrice = Math.max(10.0, Math.min(1500.0, valuationNum.doubleValue() / 2_500_000.0));` | Primitive math used instead of `BigDecimal`. | Refactor base price clamping and calculation to pure `BigDecimal` with `RoundingMode.HALF_UP`. | Unit test validating boundary test vectors in Section 7.1. | **FAIL** |
| **CONC-02**| **P2** | Trading Concurrency | F-19 | Spec §1.3 (Pillar 4), G-11 | Order placement in `CompanyRegistrationController.executeTrade` does not acquire a pessimistic write lock on the target company quote / price row or verify user account balance sufficiency. | Trade execution must be atomic, prevent negative balance, and lock price state during high concurrency. | `CompanyRegistrationController.java` lines 400-450: executes trade asynchronously without row locking. | Missing transaction isolation and locking during order execution. | Add pessimistic row lock on company quote/instrument row during trade execution. | Concurrency test with 20 parallel buys against same ticker. | **FAIL** |
| **API-01** | **P2** | Token Refresh Endpoint | F-04 | Spec §1.3, G-17 | Spec mentions `TOKEN_REFRESH` activity type and session rotation, but no `/api/auth/refresh` endpoint is implemented in `AuthController.java`. | Client should be able to refresh session token before expiration. | `AuthController.java` contains login/logout/profile but no refresh endpoint. | Omitted in initial auth controller implementation. | Document as Clarification Item C-01 / implement token refresh endpoint if confirmed by user. | API test testing token refresh with active session. | **PARTIAL** |

---

### 4. Priority P3 — Polish, Legacy Cleanup & Tech Debt

| ID | Severity | Area | Feature ID(s) | Spec Reference | Observed Behavior | Expected Behavior | Evidence | Root Cause | Proposed Fix | Test to Add | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **DB-01**  | **P3** | Database Hygiene | N/A | Spec §1.1, G-01 | PostgreSQL contains 13 legacy v1 tables (`businesses`, `investments`, `markets`, `audit_logs`, etc.) from early migrations that are no longer used by the v2 modern architecture. | Legacy tables should be documented, safely decoupled, or flagged for archival to avoid architectural ambiguity. | PostgreSQL `\dt` listing showing 43 tables. | Project evolution from v1 to v2 without migration deprecation script. | Fully document in `UNDOCUMENTED_SURFACE.md` and keep intact to prevent breaking legacy references. | Schema check test verifying modern entities do not query legacy tables. | **PASS** (Documented) |
| **DB-02**  | **P3** | Constraint Hardening | F-06, F-07 | Spec §1.3, G-22 | Documented enums (`lifecycle_classification`, `verification_level`, `round_type`) are stored as `VARCHAR(50)` without PostgreSQL `CHECK` constraints. | Database columns should enforce allowed enum values via `CHECK` constraints to ensure data integrity at storage tier. | `information_schema.check_constraints` shows no check constraints on enum columns. | Flyway migrations used standard VARCHAR columns. | Add Flyway migration with `CHECK` constraints for critical status columns. | Test inserting invalid enum string into PostgreSQL directly. | **FAIL** |
