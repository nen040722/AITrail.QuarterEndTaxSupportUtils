# Product Plan — QuarterEndTax Support Utils

> **Status:** Draft — March 13, 2026  
> **Owner:** Tax Portfolio Engineering  
> **Type:** Internal Tooling

---

## 1. Problem Statement

Quarter-end form and file generation is a critical, time-sensitive process for the Tax portfolio. When generation fails due to transient errors (network blips, timeouts, downstream unavailability), engineers must manually identify the failures and trigger re-generation by reaching into disparate systems — a slow, error-prone, and largely undocumented process.

This tool centralises that operational surface into a single, secure, internal web application so that support engineers can self-serve without requiring direct database or infrastructure access.

---

## 2. Goals

| Goal                                        | Success Criterion                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Reduce MTTR for transient form/CTR failures | Engineers can identify and re-trigger failed items in < 5 minutes with no SQL knowledge                |
| Eliminate ad-hoc script runs                | All common support actions are available via the UI                                                    |
| Audit trail                                 | Every action (regeneration, paychex toggle, sync trigger) is logged with actor, timestamp, and outcome |
| Safe by default                             | Destructive or client-impacting actions require explicit confirmation                                  |

---

## 3. Non-Goals (v1)

- Scheduled/automated self-healing — this tool is operator-driven
- Client-facing visibility
- Support for tax years other than current/prior
- Mobile layout (internal tool, desktop only)

---

## 4. Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                          Browser                               │
│   React + Vite + Paycor Design System (MUI)                    │
│   Environment selector (QSB / STAGING / PROD) in every request │
└────────────────────────────┬───────────────────────────────────┘
                             │ HTTPS / JSON
┌────────────────────────────▼───────────────────────────────────┐
│            AITrail.QuarterEndTaxSupportUtils.API                │
│                    .NET 10 Minimal API                          │
│              Thin — exposes Business project only               │
└────┬───────────────────────┬───────────────────────────────────┘
     │                       │
     │  (delegates to)       │
┌────▼───────────────────────▼───────────────────────────────────┐
│          AITrail.QuarterEndTaxSupportUtils.Business             │
│  Feature slice per operation — all logic lives here             │
│  EnvironmentConnectionResolver maps env → connection string /   │
│  downstream base URL at runtime                                 │
└────┬──────────────────────────────────────┬────────────────────┘
     │ Dapper                               │ HttpClient
     │ (CTR monitoring, Paychex status)     │ (Form generation, CTR regeneration)
┌────▼───────────┐                ┌─────────▼─────────────┐
│  SQL Server    │                │  Form Generation       │
│  QSB / STAGING │                │  Service (HTTP)        │
│  / PROD        │                │  QSB / STAGING / PROD  │
└────────────────┘                └───────────────────────┘
```

### 4.1 Solution Structure

The **Business project** is the single source of truth. Every feature is a self-contained folder with its query/command class plus its record DTOs. The **API project** is a thin host — one endpoint file per feature that does nothing except call into Business.

```
AITrail.QuarterEndTaxSupportUtils/
├── src/
│   ├── AITrail.QuarterEndTaxSupportUtils.API/
│   │   ├── Endpoints/                                  # one file per feature — thin wrappers only
│   │   │   ├── GetFailedCtrsEndpoint.cs
│   │   │   ├── GetCtrsForRegenerationEndpoint.cs
│   │   │   ├── GetCtrsRequiringAttentionEndpoint.cs
│   │   │   ├── GenerateFormEndpoint.cs
│   │   │   ├── RegenerateCtrEndpoint.cs
│   │   │   ├── GetPaychexClientStatusEndpoint.cs
│   │   │   └── SetPaychexClientStatusEndpoint.cs
│   │   ├── Program.cs
│   │   └── appsettings.json
│   │
│   ├── AITrail.QuarterEndTaxSupportUtils.Business/     # ALL logic lives here
│   │   ├── Features/
│   │   │   ├── GetFailedCtrs/
│   │   │   │   ├── GetFailedCtrsQuery.cs               # class — Dapper
│   │   │   │   ├── GetFailedCtrsRequest.cs             # record — input
│   │   │   │   └── FailedCtrItem.cs                    # record — DTO
│   │   │   │
│   │   │   ├── GetCtrsForRegeneration/
│   │   │   │   ├── GetCtrsForRegenerationQuery.cs      # class — Dapper
│   │   │   │   ├── GetCtrsForRegenerationRequest.cs    # record — input
│   │   │   │   └── CtrForRegenerationItem.cs           # record — DTO
│   │   │   │
│   │   │   ├── GetCtrsRequiringAttention/
│   │   │   │   ├── GetCtrsRequiringAttentionQuery.cs   # class — Dapper
│   │   │   │   ├── GetCtrsRequiringAttentionRequest.cs # record — input
│   │   │   │   └── CtrRequiringAttentionItem.cs        # record — DTO
│   │   │   │
│   │   │   ├── GenerateForm/
│   │   │   │   ├── GenerateFormService.cs              # class — HttpClient
│   │   │   │   ├── GenerateFormRequest.cs              # record — input
│   │   │   │   └── GenerateFormResult.cs               # record — DTO
│   │   │   │
│   │   │   ├── RegenerateCtr/
│   │   │   │   ├── RegenerateCtrService.cs             # class — HttpClient
│   │   │   │   ├── RegenerateCtrRequest.cs             # record — input
│   │   │   │   └── RegenerateCtrResult.cs              # record — DTO
│   │   │   │
│   │   │   ├── GetPaychexClientStatus/
│   │   │   │   ├── GetPaychexClientStatusQuery.cs      # class — Dapper
│   │   │   │   ├── GetPaychexClientStatusRequest.cs    # record — input
│   │   │   │   └── PaychexClientStatusResult.cs        # record — DTO
│   │   │   │
│   │   │   └── SetPaychexClientStatus/
│   │   │       ├── SetPaychexClientStatusCommand.cs    # class — Dapper
│   │   │       ├── SetPaychexClientStatusRequest.cs    # record — input
│   │   │       └── SetPaychexClientStatusResult.cs     # record — DTO
│   │   │
│   │   └── Common/
│   │       ├── Environment/
│   │       │   ├── AppEnvironment.cs                   # enum: QSB, Staging, Prod
│   │       │   └── EnvironmentConnectionResolver.cs    # class — resolves conn str / base URL
│   │       └── Infrastructure/
│   │           └── SqlConnectionFactory.cs             # class — takes AppEnvironment
│   │
│   └── frontend/                                       # React + Vite app
│       ├── src/
│       │   ├── app/
│       │   │   ├── router.tsx
│       │   │   └── AppShell.tsx
│       │   ├── features/
│       │   │   ├── ctr-monitoring/
│       │   │   ├── ctr-management/
│       │   │   └── paychex/
│       │   └── shared/
│       │       ├── api/                                # typed Axios client
│       │       ├── components/
│       │       └── environment/                        # env context + selector component
│       └── vite.config.ts
```

### 4.2 Backend Conventions

| Convention                    | Decision                                                                                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture                  | Vertical slice — one folder per feature in Business; one thin endpoint file per feature in API                                                                                    |
| Business project              | Contains ALL logic — queries, commands, services, DTOs                                                                                                                            |
| API project                   | Thin host only — receives HTTP request, calls Business, returns result                                                                                                            |
| DTOs / value objects          | `record` types — inputs, outputs, query results                                                                                                                                   |
| Services / queries / commands | `class` types                                                                                                                                                                     |
| Database access               | Dapper everywhere — no EF Core                                                                                                                                                    |
| Form/CTR generation           | Encapsulated `HttpClient`-based service in Business (`GenerateFormService`, `RegenerateCtrService`)                                                                               |
| Paychex status                | Read and written directly to SQL Server via Dapper — no downstream API call                                                                                                       |
| Multi-environment             | Every request record carries `AppEnvironment Environment` (QSB / Staging / Prod); `EnvironmentConnectionResolver` maps it to the correct connection string or base URL at runtime |
| Auth                          | **Not implemented in v1** — add Entra ID / Easy Auth in a later iteration                                                                                                         |
| Logging                       | Structured logging via `ILogger`; every mutating action logs action + payload                                                                                                     |
| Error handling                | Global exception middleware; returns RFC 7807 `ProblemDetails`                                                                                                                    |

### 4.3 Frontend Conventions

| Convention            | Decision                                                                                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build tool            | Vite                                                                                                                                                                              |
| UI library            | Paycor Design System (MUI-based)                                                                                                                                                  |
| Auth                  | **Not implemented in v1** — add Entra ID / MSAL in a later iteration                                                                                                              |
| Environment           | Global `EnvironmentContext` (React Context) drives a persistent `QSB / STAGING / PROD` selector in the app header; every API call automatically includes the selected environment |
| State / data fetching | TanStack Query (React Query)                                                                                                                                                      |
| Routing               | React Router v7                                                                                                                                                                   |
| Forms                 | React Hook Form                                                                                                                                                                   |
| HTTP client           | Axios instance; env param injected by a request interceptor                                                                                                                       |

---

## 5. Feature Breakdown

> **Environment:** Every feature exposes an `Environment` input (QSB / Staging / Prod). In the UI this is driven by the global env selector in the app header — users never need to type it manually.

---

### Feature 1 — Get Failed CTRs

**Route:** GET `/ctr-monitoring/failed`  
**Backend:** `GetFailedCtrsQuery` (Dapper)  
**Purpose:** List CTRs that failed during generation due to **transient** errors, filterable by time range.

**Filters / inputs:**

- `Environment` (QSB / Staging / Prod)
- Time range: Daily / Weekly / Monthly / Quarterly (date-picker override for custom range)

**Table columns:**

- CTR ID
- Client ID / Name
- Tax Year
- Failure Date/Time
- Error Type / Message (truncated, expandable)
- Retry Count
- Actions: `Regenerate` (row-level), `View Details`

**Bulk actions:**

- Select multiple → `Bulk Regenerate`
- Select all on page / all pages toggle

---

### Feature 2 — Get CTRs for Regeneration (transient errors)

**Route:** GET `/ctr-monitoring/regeneration`  
**Backend:** `GetCtrsForRegenerationQuery` (Dapper)  
**Purpose:** List CTRs that failed with **transient** errors and are candidates for automated re-generation (i.e. they have not yet been manually actioned).

**Filters / inputs:**

- `Environment`
- Time range: Daily / Weekly / Monthly / Quarterly

**Table columns:**

- CTR ID
- Client ID / Name
- Tax Year
- Failure Date/Time
- Error Message
- Retry Count
- Actions: `Regenerate`, `View Details`

**Bulk actions:** Select multiple → `Bulk Regenerate`

---

### Feature 3 — Get CTRs Requiring Human Attention (non-transient errors)

**Route:** GET `/ctr-monitoring/attention`  
**Backend:** `GetCtrsRequiringAttentionQuery` (Dapper)  
**Purpose:** List CTRs that failed with **non-transient** errors that cannot be auto-resolved and need manual investigation.

**Filters / inputs:**

- `Environment`
- Time range: Daily / Weekly / Monthly / Quarterly

**Table columns:**

- CTR ID
- Client ID / Name
- Tax Year
- Failure Date/Time
- Error Type / Message (full, no truncation default)
- Retry Count
- Actions: `View Details`, `Mark Reviewed`

**Visual differentiation:** Distinct badge/color to distinguish from transient failures.

---

### Feature 4 — Generate Form

**Route:** POST `/ctr-management/generate-form`  
**Backend:** `GenerateFormService` (HttpClient — encapsulated, env-aware)  
**Purpose:** Trigger generation of a single form via the downstream form generation service.

**Inputs:**

- `Environment`
- Form ID (manual entry or linked from a monitoring screen)
- Reason / Notes (free text, logged)

**Actions:**

- `Generate` with confirmation dialog
- Inline result display — success / error response from downstream service

---

### Feature 5 — Regenerate CTR

**Route:** POST `/ctr-management/regenerate-ctr`  
**Backend:** `RegenerateCtrService` (HttpClient — encapsulated, env-aware)  
**Purpose:** Trigger re-generation of a full CTR package via the downstream service.

**Inputs:**

- `Environment`
- CTR ID (manual entry or linked from a monitoring screen)
- Reason / Notes (free text, logged)
- Options: Re-generate all forms / Failed forms only

**Actions:**

- `Regenerate` with confirmation dialog showing impacted form count
- Inline result display — success / error response from downstream service

---

### Feature 6 — Get Paychex Client Status

**Route:** GET `/paychex/clients/{clientId}/status`  
**Backend:** `GetPaychexClientStatusQuery` (Dapper — reads directly from DB)  
**Purpose:** Look up a client's current Paychex status.

**Inputs:**

- `Environment`
- Client ID (or Client Name — debounced autocomplete search)

**Result card:**

- Client ID / Name
- Current Status: `On Paychex` / `Off Paychex` (badge)
- Last Changed At

---

### Feature 7 — Set Paychex Client Status

**Route:** PUT `/paychex/clients/{clientId}/status`  
**Backend:** `SetPaychexClientStatusCommand` (Dapper — writes directly to DB)  
**Purpose:** Toggle a client's Paychex status on or off.

**Inputs:**

- `Environment`
- Client ID
- `Enabled` (bool)
- Reason / Notes (logged)

**Actions:**

- `Toggle Status` button on the Client Status page → confirmation dialog stating the impact
- Result displayed inline — new status confirmed
- All changes written to `SupportAuditLog` table (timestamp, before/after state)

---

### Dashboard — `/`

**Deferred to v2.** Placeholder page in v1 with "Coming soon" message.

---

## 6. Navigation Structure

```
Sidebar
├── Dashboard                           /                              (v2 placeholder)
│
├── CTR Monitoring
│   ├── Failed CTRs                     /ctr-monitoring/failed         Feature 1
│   ├── For Regeneration                /ctr-monitoring/regeneration   Feature 2
│   └── Requires Attention              /ctr-monitoring/attention      Feature 3
│
├── CTR Management
│   ├── Generate Form                   /ctr-management/generate-form  Feature 4
│   └── Regenerate CTR                  /ctr-management/regenerate-ctr Feature 5
│
└── Paychex
    └── Client Status                   /paychex/status                Features 6 & 7
```

> The environment selector (QSB / STAGING / PROD) lives in the persistent app header — not in the sidebar — and its value is globally applied to every API call.

---

## 7. API Contract (draft)

All routes prefixed `/api/v1`.  
Auth: **Not implemented in v1.**  
`environment` query parameter (or body field) required on every endpoint: `qsb` | `staging` | `prod`.

### CTR Monitoring

| #   | Method | Route                          | Key Query Params                                                                             |
| --- | ------ | ------------------------------ | -------------------------------------------------------------------------------------------- |
| 1   | GET    | `/ctr-monitoring/failed`       | `environment`, `range` (daily\|weekly\|monthly\|quarterly), `from`, `to`, `page`, `pageSize` |
| 2   | GET    | `/ctr-monitoring/regeneration` | `environment`, `range`, `from`, `to`, `page`, `pageSize`                                     |
| 3   | GET    | `/ctr-monitoring/attention`    | `environment`, `range`, `from`, `to`, `page`, `pageSize`                                     |

### CTR Management

| #   | Method | Route                            | Body                                              |
| --- | ------ | -------------------------------- | ------------------------------------------------- |
| 4   | POST   | `/ctr-management/generate-form`  | `{ environment, formId, reason }`                 |
| 5   | POST   | `/ctr-management/regenerate-ctr` | `{ environment, ctrId, reason, failedFormsOnly }` |

### Paychex

| #   | Method | Route                                | Params / Body                            |
| --- | ------ | ------------------------------------ | ---------------------------------------- |
| 6   | GET    | `/paychex/clients/{clientId}/status` | Query: `environment`                     |
| 7   | PUT    | `/paychex/clients/{clientId}/status` | Body: `{ environment, enabled, reason }` |

---

## 8. Key Data Records (Business project DTOs)

All inputs carry `AppEnvironment Environment`. All outputs are pure data records.

```csharp
// Common
enum AppEnvironment { QSB, Staging, Prod }

// ── Feature 1: GetFailedCtrs ──────────────────────────────────────────────
record GetFailedCtrsRequest(
    AppEnvironment Environment,
    string Range,           // daily | weekly | monthly | quarterly
    DateOnly? From,
    DateOnly? To,
    int Page,
    int PageSize);

record FailedCtrItem(
    int CtrId,
    int ClientId,
    string ClientName,
    int TaxYear,
    DateTime FailedAt,
    string ErrorType,
    string ErrorMessage,
    int RetryCount);

// ── Feature 2: GetCtrsForRegeneration ────────────────────────────────────
record GetCtrsForRegenerationRequest(
    AppEnvironment Environment,
    string Range,
    DateOnly? From,
    DateOnly? To,
    int Page,
    int PageSize);

record CtrForRegenerationItem(
    int CtrId,
    int ClientId,
    string ClientName,
    int TaxYear,
    DateTime FailedAt,
    string ErrorMessage,
    int RetryCount);

// ── Feature 3: GetCtrsRequiringAttention ─────────────────────────────────
record GetCtrsRequiringAttentionRequest(
    AppEnvironment Environment,
    string Range,
    DateOnly? From,
    DateOnly? To,
    int Page,
    int PageSize);

record CtrRequiringAttentionItem(
    int CtrId,
    int ClientId,
    string ClientName,
    int TaxYear,
    DateTime FailedAt,
    string ErrorType,
    string ErrorMessage,
    int RetryCount);

// ── Feature 4: GenerateForm ───────────────────────────────────────────────
record GenerateFormRequest(
    AppEnvironment Environment,
    int FormId,
    string Reason);

record GenerateFormResult(
    bool Success,
    string? DownstreamResponse,
    string? ErrorMessage);

// ── Feature 5: RegenerateCtr ──────────────────────────────────────────────
record RegenerateCtrRequest(
    AppEnvironment Environment,
    int CtrId,
    string Reason,
    bool FailedFormsOnly);

record RegenerateCtrResult(
    bool Success,
    string? DownstreamResponse,
    string? ErrorMessage);

// ── Feature 6: GetPaychexClientStatus ─────────────────────────────────────
record GetPaychexClientStatusRequest(
    AppEnvironment Environment,
    int ClientId);

record PaychexClientStatusResult(
    int ClientId,
    string ClientName,
    bool IsEnabled,
    DateTime LastChangedAt);

// ── Feature 7: SetPaychexClientStatus ─────────────────────────────────────
record SetPaychexClientStatusRequest(
    AppEnvironment Environment,
    int ClientId,
    bool Enabled,
    string Reason);

record SetPaychexClientStatusResult(
    bool Success,
    bool NewStatus);
```

---

## 9. Security

| Concern               | Mitigation                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication        | **Deferred to v2** — Entra ID / Easy Auth will be added in a later iteration                                                                  |
| Audit logging         | Every mutating API call logs action, environment, payload, and outcome to `SupportAuditLog` table                                             |
| SQL Injection         | Parameterised Dapper queries only — no string concatenation                                                                                   |
| Environment isolation | Environment is an explicit, validated enum — invalid values rejected at the API boundary; no dynamic SQL or URL construction from raw strings |
| Secrets               | Connection strings and downstream API keys stored in Azure Key Vault / App Service config — never in source                                   |
| CORS                  | Locked to internal domain only                                                                                                                |
| Input validation      | `FluentValidation` on all command/request records before processing                                                                           |

---

## 10. Implementation Phases

### Phase 1 — Foundation (Sprint 1–2)

- [ ] Solution scaffold: API project, Business project, frontend (Vite + React)
- [ ] `AppEnvironment` enum + `EnvironmentConnectionResolver` in Business
- [ ] `SqlConnectionFactory` accepting `AppEnvironment`
- [ ] Environment selector component in frontend header + `EnvironmentContext`
- [ ] Axios interceptor that injects selected env into every request
- [ ] Global error handling + `ProblemDetails`
- [ ] AppShell with sidebar navigation (all routes stubbed)
- [ ] CI pipeline (build + test)

### Phase 2 — CTR Monitoring (Sprint 2–3)

- [ ] Feature 1: `GetFailedCtrsQuery` + endpoint + UI
- [ ] Feature 2: `GetCtrsForRegenerationQuery` + endpoint + UI
- [ ] Feature 3: `GetCtrsRequiringAttentionQuery` + endpoint + UI
- [ ] Shared filter bar component (env-aware, time range)
- [ ] Bulk select + bulk regeneration trigger

### Phase 3 — CTR Management (Sprint 3–4)

- [ ] Feature 4: `GenerateFormService` (HttpClient) + endpoint + UI form
- [ ] Feature 5: `RegenerateCtrService` (HttpClient) + endpoint + UI form
- [ ] Confirmation dialogs + inline result display
- [ ] Link from monitoring tables → management forms (with pre-filled IDs)

### Phase 4 — Paychex (Sprint 4–5)

- [ ] Feature 6: `GetPaychexClientStatusQuery` (Dapper) + endpoint + UI search/card
- [ ] Feature 7: `SetPaychexClientStatusCommand` (Dapper) + endpoint + toggle UI
- [ ] Audit log write on every status change

### Phase 5 — Auth & Hardening (Sprint 5–6)

- [ ] Entra ID / Easy Auth integration
- [ ] Audit log viewer UI (read-only, filterable)
- [ ] Error boundary + toast notification system
- [ ] End-to-end happy-path tests
- [ ] Internal deployment (App Service) + Key Vault wiring
- [ ] Documentation: runbook, onboarding guide

---

## 11. Open Questions

| #   | Question                                                                                                                                      | Owner                 | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------ |
| 1   | What SQL Server databases/tables hold the failed CTR and form records? Schema access needed to distinguish transient vs non-transient errors. | Backend lead          | Open   |
| 2   | What is the form generation service contract (endpoint, auth, payload schema)?                                                                | Tax platform team     | Open   |
| 3   | What are the exact QSB / Staging / Prod connection strings / base URLs for each environment?                                                  | DevOps                | Open   |
| 4   | Which Entra group(s) should have access (for v2 auth)? Read-only vs. mutating access split needed?                                            | Tax portfolio manager | Open   |
| 5   | Should the audit log be stored in the same SQL Server or a separate logging sink?                                                             | Architect             | Open   |
| 6   | App Service plan + region / subscription pre-provisioned or needs to be created?                                                              | DevOps                | Open   |
