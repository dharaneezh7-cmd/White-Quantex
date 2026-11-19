# WHITE QUANTEX 2.0 — UNDOCUMENTED SURFACE INVENTORY

Date: 2026-11-19  
Branch: `audit/wq-verification`  
Auditor: Antigravity Audit Agent

---

## 1. Undocumented PostgreSQL Tables (18 Tables)

The specification explicitly notes 23 items covering ~25 tables. Database inspection of `WhiteQuantex-Financial-Database` identified exactly 43 tables. The 18 tables not documented in the specification text are:

| # | Table Name | Flyway Migration Provenance | Purpose / Domain | Columns | Owner Service | Security / Risk Assessment |
|---|---|---|---|---|---|---|
| 1 | `businesses` | `V1__financial_schema.sql` | Legacy v1 business entity table (precursor to `companies` and `ventures`) | 20 | User Backend (Legacy) | Low. Superseded by `companies` / `ventures`. Recommend deprecation plan. |
| 2 | `investments` | `V1__financial_schema.sql` | Legacy v1 investment tracking table | 11 | User Backend (Legacy) | Low. Superseded by `corporate_orders` / `venture_orders`. |
| 3 | `fundraising_campaigns` | `V1__financial_schema.sql` | Legacy v1 fundraising campaigns | 15 | User Backend (Legacy) | Low. Seeded or idle. |
| 4 | `markets` | `V1__financial_schema.sql` | Legacy v1 market definitions | 7 | User Backend (Legacy) | Low. |
| 5 | `audit_logs` | `V1__financial_schema.sql` | Legacy v1 general user action audit trail | 6 | User Backend (Legacy) | Low. Distinct from modern `company_audit_logs`. |
| 6 | `upcoming_companies` | `V6__upcoming_recommendations_schemes_schema.sql` | Scheduled future IPO / Direct Listing pipeline | 18 | User Backend | Low. Exploratory read-only data for User portal. |
| 7 | `mutual_investment_schemes`| `V6__upcoming_recommendations_schemes_schema.sql` | Curated multi-company investment portfolios / pools | 18 | User Backend | Medium. Financial product definition; read-only on explore. |
| 8 | `wq_recommendations` | `V6__upcoming_recommendations_schemes_schema.sql` | Algorithmic institutional investment recommendations | 19 | User Backend | Low. Informational. |
| 9 | `corporate_news` | `V3__explore_companies_schema.sql` | News and SEC filing press releases for established companies | 15 | User Backend | Low. Content feed. |
| 10 | `venture_news` | `V10__ventures_schema_and_seed_250.sql` | Funding and milestone announcements for startups/ventures | 15 | User Backend | Low. Content feed. |
| 11 | `company_market_metrics` | `V3__explore_companies_schema.sql` | Daily P/E, Beta, 52W range, dividend yield for companies | 19 | User Backend | Low. Financial metrics cache. |
| 12 | `venture_market_metrics` | `V10__ventures_schema_and_seed_250.sql` | Burn rate, runway, ARR multiple metrics for startups | 18 | User Backend | Low. Startup metrics cache. |
| 13 | `price_alerts` | `V1__financial_schema.sql` | User price alert threshold subscriptions | 8 | User Backend | Low. Unused in production or read-only. |
| 14 | `user_recently_viewed` | `V8__user_scoped_positions_orders_and_history.sql` | History of viewed tickers per user | 4 | User Backend | Low. Scoped to `user_id`. |
| 15 | `market_data_sync_state` | `V12__market_data_price_history_and_candles.sql` | High-frequency market ingestion state tracker | 10 | User Backend | Medium. Coordinates tick ingestion and prevents race gaps. |
| 16 | `graduation_policies` | `V2__company_lifecycle_schema.sql` | Institutional criteria and rule thresholds for venture graduation | 10 | Company Backend | Low. Read by graduation validator. |
| 17 | `flyway_schema_history` | Flyway System | Migration tracking table for User Backend Spring Boot | 10 | User Backend Flyway | Internal. |
| 18 | `flyway_company_history`| Flyway System | Migration tracking table for Company Backend Spring Boot | 10 | Company Backend Flyway | Internal. |

---

## 2. Undocumented Endpoints in User Backend (Port 8080)

| Controller | HTTP Method & Path | Roles / Auth | Purpose | Risk / Notes |
|---|---|---|---|---|
| `CompanyRegistrationController` | `POST /api/companies/register` | None (`@Transactional`) | Duplicate company registration in User Backend | High: Duplicates 8081 `POST /api/companies`. Does not create owner membership or write to `company_audit_logs`. |
| `CompanyRegistrationController` | `POST /api/companies/register-venture` | None | Duplicate venture registration in User Backend | High: Duplicates 8081 `POST /api/companies/ventures`. |
| `CompanyRegistrationController` | `POST /api/companies/{tickerOrId}/financials` | None | Duplicate quarterly financials submission in User Backend | Medium: Bypasses Company Backend admin guard. |
| `CompanyRegistrationController` | `GET /api/companies/{tickerOrId}/financials` | Public | Financials lookup | Low. |
| `CompanyRegistrationController` | `GET /api/companies/check-name` | Public | Uniqueness check for company name | Low. |
| `ExploreController` | `GET /api/explore/overview` | Public | Aggregate explore dashboard stats | Low. |
| `ExploreController` | `GET /api/explore/upcoming` | Public | Upcoming IPO list | Low. |
| `ExploreController` | `GET /api/explore/recommendations`| Public | Recommended assets | Low. |
| `ExploreController` | `GET /api/explore/schemes` | Public | Investment schemes list | Low. |
| `ExploreController` | `GET /api/explore/ventures/overview` | Public | Venture portal metrics | Low. |
| `ExploreController` | `POST /api/explore/recently-viewed/{id}` | Authenticated | Record ticker view | Low. |
| `BusinessController` | `GET /api/startups`, `GET /api/companies`, `GET /api/markets` | Public | Legacy directory endpoints | Low. Legacy v1 queries on `businesses` table. |

---

## 3. Undocumented Endpoints in Company Backend (Port 8081)

| Controller | HTTP Method & Path | Roles / Auth | Purpose | Risk / Notes |
|---|---|---|---|---|
| `CompanyController` | `GET /api/companies/search` | Public / Authenticated | Full-text query on name/ticker | Low. |
| `CompanyController` | `GET /api/companies/my-companies` | Authenticated | List companies where user is member | Low. Essential for portal navigation. |
| `CompanyController` | `POST /api/companies/register` | Authenticated | Alias to `POST /api/companies` | Low. |
| `CompanyController` | `POST /api/companies/register-venture`| Authenticated | Alias to `POST /api/companies/ventures` | Low. |
| `CompanyVerificationController`| `GET /api/companies/{id}/verification/pending-reviews`| `ROLE_ADMIN` | Admin queue of pending SEC 506(c) reviews | Low. Helpful admin queue. |
| `CompanyLifecycleController` | `GET /api/companies/{id}/lifecycle/history` | Public | Audit trail of lifecycle transitions | Low. Transparent compliance history. |

---

## 4. Undocumented Social Backend (Node.js Port 3001)

The specification lists no endpoints or Socket.io events for the Node service. The implemented surface was audited from source:

### 4.1 REST API Routes
- `GET /api/health`: Healthcheck.
- `GET /api/posts`: Feed query with pagination, sorting (`trending`, `recent`), filter by `communityId`, and visibility checks (`PUBLIC`, `PROTECTED`, `PRIVATE`).
- `POST /api/posts`: Create post (supports markdown, images, mentions, tags, visibility).
- `GET /api/posts/:id`: Single post with author profile and comments.
- `POST /api/posts/:id/like`: Toggle like on post.
- `POST /api/posts/:id/bookmark`: Toggle bookmark.
- `GET /api/posts/:id/comments`: Retrieve nested comment thread.
- `POST /api/posts/:id/comments`: Add comment.
- `GET /api/communities`: List community channels and circles.
- `POST /api/communities`: Create community circle.
- `POST /api/communities/:id/join`: Join community.
- `GET /api/communities/:id/messages`: WhatsApp-style circle group chat messages.
- `POST /api/communities/:id/messages`: Send message in community (enforces joined member check).
- `GET /api/follows/:userId/followers`, `GET /api/follows/:userId/following`: Follower graphs.
- `POST /api/follows/:userId`: Follow/unfollow user.
- `PUT /api/follows/:userId/private-access`: Toggle private post viewing permission.
- `GET /api/messages/conversations`: 1-on-1 direct message conversation threads.
- `GET /api/messages/:conversationId`: Message history between two users.
- `POST /api/messages`: Send direct message.
- `GET /api/notifications`: In-app notification feed.
- `PUT /api/notifications/read-all`: Mark notifications read.

### 4.2 Socket.io Real-Time Events
- `connection`: Client connects with handshake auth.
- `join_room` / `leave_room`: Subscribe to 1-on-1 direct message conversation or community circle room.
- `send_message`: Real-time chat message broadcast.
- `new_message`: Pushed to room recipients.
- `typing_start` / `typing_stop`: Typing indicator broadcast.
- `user_online` / `user_offline`: Presence tracking.

### 4.3 Security & Design Evaluation of Social Backend
- **Critical Vulnerability (P0)**: Node backend lacks cryptographic JWT validation in `middleware/auth.mjs`. It reads unauthenticated headers (`x-wq-user-id`, `x-wq-user-role`, `x-wq-user-email`), permitting arbitrary identity spoofing and horizontal privilege escalation.
- **Data Linkage**: MongoDB documents consistently store the permanent PostgreSQL `UUID` as `authorId`, `userId`, `senderId`, and `recipientId`.
