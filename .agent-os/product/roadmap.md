# Product Roadmap

---

## Phase 1: Foundation

**Goal:** Scaffold the full solution structure, establish the multi-environment plumbing, and ship a navigable app shell so every subsequent feature has a working home and consistent patterns to follow.
**Success Criteria:** API project builds and runs; frontend app shell renders with sidebar navigation and environment selector; environment resolution is tested and confirmed for all three environments; CI pipeline passes.

### Features

- [ ] Solution scaffold — API project, Business project, frontend (Vite + React) `M`
- [ ] `AppEnvironment` enum + `EnvironmentConnectionResolver` in Business `S`
- [ ] `SqlConnectionFactory` accepting `AppEnvironment` `S`
- [ ] Environment selector component in frontend header + `EnvironmentContext` `S`
- [ ] Axios interceptor that injects selected env into every request `XS`
- [ ] Global exception middleware returning RFC 7807 `ProblemDetails` `S`
- [ ] AppShell with sidebar navigation — all routes stubbed `S`
- [ ] CI pipeline (build + test) `M`

### Dependencies

- Target framework confirmed as .NET 10
- Node.js / npm toolchain available in CI environment
- Access to Paycor Design System (MUI) package feed

---

## Phase 2: CTR Monitoring

**Goal:** Give support engineers a real-time view of failed CTRs, separated by error category, with filtering and bulk-regeneration triggers — covering the highest-frequency support task.
**Success Criteria:** Engineers can filter and view failed CTRs across time ranges; transient and non-transient failures are visually distinct; single-row and bulk regenerate actions are wired end-to-end; all regeneration triggers write to the audit log.

### Features

- [ ] Feature 1: `GetFailedCtrsQuery` (Dapper) + `GET /ctr-monitoring/failed` endpoint + UI table with filters `L`
- [ ] Feature 2: `GetCtrsForRegenerationQuery` (Dapper) + `GET /ctr-monitoring/regeneration` endpoint + UI `M`
- [ ] Feature 3: `GetCtrsRequiringAttentionQuery` (Dapper) + `GET /ctr-monitoring/attention` endpoint + UI `M`
- [ ] Shared filter bar component (time range: Daily / Weekly / Monthly / Quarterly + custom date picker) `M`
- [ ] Bulk select (page / all-pages toggle) + bulk regenerate action `M`
- [ ] Error detail expansion (truncated inline, full-text expandable row) `S`

### Dependencies

- Phase 1 complete (AppShell, env plumbing)
- SQL schema access for failed CTR and form records (Open Question #1)
- Transient vs. non-transient error classification rules confirmed with Tax platform team

---

## Phase 3: CTR Management

**Goal:** Enable engineers to trigger form and CTR regeneration directly from the management screens (manual entry or pre-filled from monitoring links), with confirmation dialogs and inline result feedback.
**Success Criteria:** Generate Form and Regenerate CTR forms are functional end-to-end; confirmation dialog shows impacted count; inline success/error response displayed; all triggers logged to audit log.

### Features

- [ ] Feature 4: `GenerateFormService` (HttpClient, env-aware) + `POST /ctr-management/generate-form` endpoint + UI form `L`
- [ ] Feature 5: `RegenerateCtrService` (HttpClient, env-aware) + `POST /ctr-management/regenerate-ctr` endpoint + UI form `L`
- [ ] Confirmation dialogs (impacted form count, environment callout) `M`
- [ ] Inline result display — downstream service success / error response `S`
- [ ] Deep-link from monitoring table rows → management forms with pre-filled IDs `S`
- [ ] Reason / Notes capture on all triggerable actions (free text, logged) `XS`

### Dependencies

- Phase 2 complete (monitoring screens + audit log table)
- Form generation service contract confirmed — endpoint, auth, payload schema (Open Question #2)
- QSB / Staging / Prod base URLs confirmed (Open Question #3)

---

## Phase 4: Paychex Client Management

**Goal:** Replace the dangerous direct-DB Paychex flag toggle with a safe, audited UI — covering the second highest-risk support operation.
**Success Criteria:** Support engineers can search for a client by ID or name, view current status, and toggle it with confirmation; every change is recorded in `SupportAuditLog` with before/after state, actor, and timestamp.

### Features

- [ ] Feature 6: `GetPaychexClientStatusQuery` (Dapper) + `GET /paychex/clients/{clientId}/status` endpoint + UI search/card `M`
- [ ] Feature 7: `SetPaychexClientStatusCommand` (Dapper) + `PUT /paychex/clients/{clientId}/status` endpoint + toggle UI `M`
- [ ] Client name debounced autocomplete search `M`
- [ ] Status badge: `On Paychex` / `Off Paychex` with last-changed timestamp `S`
- [ ] Confirmation dialog — impact statement before toggle `S`
- [ ] Audit log write for every Paychex status change (before/after state) `S`

### Dependencies

- Phase 1 complete (env plumbing, SqlConnectionFactory)
- `SupportAuditLog` table schema confirmed and created (Open Question #5)
- SQL tables for Paychex client status identified

---

## Phase 5: Auth, Hardening & Deployment

**Goal:** Secure the application with Entra ID authentication, add an audit log viewer, harden error handling, and complete the production deployment to App Service.
**Success Criteria:** All endpoints require authenticated Entra ID identity; audit log is viewable and filterable in the UI; end-to-end happy-path tests pass; application is deployed to App Service with secrets in Key Vault.

### Features

- [ ] Entra ID / Easy Auth integration (backend + frontend MSAL) `XL`
- [ ] Role-based access: read-only vs. mutating action split `L`
- [ ] Audit log viewer UI — read-only, filterable by date, environment, actor, action `L`
- [ ] Error boundary + toast notification system in frontend `M`
- [ ] End-to-end happy-path tests (monitoring → regenerate flow) `M`
- [ ] Internal deployment: Azure App Service + Key Vault wiring for connection strings and API keys `L`
- [ ] Documentation: runbook + onboarding guide `M`

### Dependencies

- All previous phases complete
- Entra group(s) for access confirmed — read-only vs. mutating split (Open Question #4)
- App Service plan + region / subscription provisioned (Open Question #6)
- Audit log sink decision confirmed — same SQL Server or separate (Open Question #5)
