# WHITE QUANTEX 2.0 — PHASE 0 BASELINE EXECUTION REPORT

Date: 2026-11-19  
Branch: `audit/wq-verification`  
Auditor: Antigravity Audit Agent  
Database: PostgreSQL 18 (`WhiteQuantex-Financial-Database`), MongoDB 7 (`white_quantex_social`)

---

## 1. Build Verification

| Service | Directory | Build Command | Result | Errors | Evidence |
|---|---|---|---|---|---|
| Company Frontend | `Company Module/frontend` | `npm run build` | **PASS** | 0 errors | `vite v6.4.1 building for production... ✓ built in 2.21s` |
| User Frontend | `User Module/frontend` | `npm run build` | **PASS** | 0 errors | `vite v6.4.1 building for production... ✓ built in 2.37s` |
| Company Backend | `Company Module/backend-spring` | `.\mvnw.cmd test-compile` | **PASS** | 0 errors | `BUILD SUCCESS` (Classes compiled) |
| User Backend | `User Module/backend-spring` | `.\mvnw.cmd test-compile` | **PASS** | 0 errors | `BUILD SUCCESS` (Classes compiled) |
| Node Backend | `User Module/backend-node` | `npm test` | **PASS** | 0 errors | `node --test` executed (0 tests defined) |

---

## 2. Test Suite Baseline

### 2.1 User Backend (`User Module/backend-spring`)
- **Command**: `.\mvnw.cmd test`
- **Total Tests Run**: 9
- **Failures**: 0
- **Errors**: 0
- **Skipped**: 0
- **Elapsed Time**: 4.562 s
- **Breakdown**:
  - `com.whitequantex.auth.UserSessionServiceTest`: 4 run, 0 failures, 0 errors
  - `com.whitequantex.market.HistoricalPriceServiceTest`: 2 run, 0 failures, 0 errors
  - `com.whitequantex.market.PriceIngestionServiceTest`: 3 run, 0 failures, 0 errors

### 2.2 Company Backend (`Company Module/backend-spring`)
- **Command**: `.\mvnw.cmd test`
- **Total Tests Run**: 8
- **Failures**: 0
- **Errors**: 0
- **Skipped**: 0
- **Elapsed Time**: 4.055 s
- **Breakdown**:
  - `com.whitequantex.company.service.CompanyLifecycleServiceTest`: 2 run, 0 failures, 0 errors
  - `com.whitequantex.company.service.CompanyMembershipServiceTest`: 2 run, 0 failures, 0 errors
  - `com.whitequantex.company.service.CompanyServiceTest`: 2 run, 0 failures, 0 errors
  - `com.whitequantex.company.service.CompanyVerificationServiceTest`: 2 run, 0 failures, 0 errors

---

## 3. Runtime Services & Port Verification

| Service | Host/Port | Process | Listening PID | Baseline State |
|---|---|---|---|---|
| PostgreSQL 18 | `127.0.0.1:5432` | `postgres.exe` | 8156 | **ONLINE** |
| MongoDB | `127.0.0.1:27017` | `mongod.exe` | 4496 | **ONLINE** |
| User Backend Spring Boot | `127.0.0.1:8080` | `java.exe` | 5708 | **ONLINE** |
| Company Backend Spring Boot | `127.0.0.1:8081` | `java.exe` | 38480 | **ONLINE** |
| Node.js Social Backend | `127.0.0.1:3001` | `node.exe` | 11844 | **ONLINE** |
| User Frontend | `127.0.0.1:7000` | `node.exe` (Vite) | 30648 | **ONLINE** |
| Company Frontend | `127.0.0.1:7001` | `node.exe` (Vite) | 37376 | **ONLINE** |

---

## 4. Flyway Migrations Status

### 4.1 Company Backend (`flyway_company_history`)
- `V1`: Baseline (`<< Flyway Baseline >>`)
- `V2`: `V2__company_lifecycle_schema.sql` (Success: `true`)

### 4.2 User Backend (`flyway_schema_history`)
- `V1` through `V17`: All 17 migrations applied cleanly (Success: `true`)
- Latest migration: `V17__remove_all_fake_positions_and_orders.sql`
