# Tasks — QuarterEndTax Support Utils

> Tasks are grouped by feature and layer (Backend → Frontend). Each task is scoped to a single, reviewable unit of work.  
> Status: `[ ]` = not started · `[~]` = in progress · `[x]` = done

---

## Foundation (cross-cutting — do first)

- [ ] **F-00-BE-01** Scaffold solution: `AITrail.QuarterEndTaxSupportUtils.API` + `AITrail.QuarterEndTaxSupportUtils.Business` projects, wire project references
- [ ] **F-00-BE-02** Create `AppEnvironment` enum (`QSB`, `Staging`, `Prod`) in Business > Common > Environment
- [ ] **F-00-BE-03** Create `EnvironmentConnectionResolver` — maps `AppEnvironment` to SQL Server connection string and downstream base URLs from config
- [ ] **F-00-BE-04** Create `SqlConnectionFactory` — accepts `AppEnvironment`, returns open `IDbConnection` via Dapper
- [ ] **F-00-BE-05** Add global exception middleware returning RFC 7807 `ProblemDetails`; add `FluentValidation` pipeline
- [ ] **F-00-FE-01** Scaffold frontend: Vite + React + TypeScript; install Paycor Design System / MUI
- [ ] **F-00-FE-02** Create `AppShell` — sidebar navigation, persistent header with environment selector (QSB / STAGING / PROD)
- [ ] **F-00-FE-03** Create `EnvironmentContext` (React Context) — stores selected env; subscribe global Axios interceptor to inject `environment` query param on every request
- [ ] **F-00-FE-04** Wire React Router v7 routes for all 7 features + dashboard placeholder
- [ ] **F-00-FE-05** Add TanStack Query provider and shared Axios client instance

---

## Feature 1 — Get Failed CTRs

> Identify CTRs that failed generation due to **transient** errors.

### Backend

- [ ] **F1-BE-01** Create `GetFailedCtrsRequest` record with fields: `AppEnvironment Environment`, `string Range`, `DateOnly? From`, `DateOnly? To`, `int Page`, `int PageSize`
- [ ] **F1-BE-02** Create `FailedCtrItem` result record with fields: `int CtrId`, `int ClientId`, `string ClientName`, `int TaxYear`, `DateTime FailedAt`, `string ErrorType`, `string ErrorMessage`, `int RetryCount`
- [ ] **F1-BE-03** Create `GetFailedCtrsQuery` class — Dapper query that filters by environment (via `SqlConnectionFactory`) and time range; returns paged `IEnumerable<FailedCtrItem>`
- [ ] **F1-BE-04** Add `FluentValidation` validator for `GetFailedCtrsRequest` (valid range enum, page > 0, pageSize 1–200)
- [ ] **F1-BE-05** Create `GetFailedCtrsEndpoint` in API — maps `GET /api/v1/ctr-monitoring/failed` to `GetFailedCtrsQuery`; returns paged envelope

### Frontend

- [ ] **F1-FE-01** Add typed API client function `getFailedCtrs(params)` — calls `GET /api/v1/ctr-monitoring/failed` with env + filter params
- [ ] **F1-FE-02** Build `FailedCtrsPage` — time-range filter bar (Daily / Weekly / Monthly / Quarterly + custom date-picker)
- [ ] **F1-FE-03** Build data table: columns CTR ID, Client ID/Name, Tax Year, Failure Date/Time, Error Type, Error Message (truncated, expandable), Retry Count, Actions column
- [ ] **F1-FE-04** Add row-level `Regenerate` action button — opens Generate Form or Regenerate CTR page pre-filled with the selected CTR
- [ ] **F1-FE-05** Add bulk-select checkboxes + `Bulk Regenerate` toolbar action with confirmation dialog
- [ ] **F1-FE-06** Add `View Details` expansion panel — full error message, retry history

---

## Feature 2 — Get CTRs for Regeneration (transient errors)

> List CTRs whose transient failures make them candidates for automated re-generation.

### Backend

- [ ] **F2-BE-01** Create `GetCtrsForRegenerationRequest` record (`AppEnvironment Environment`, `string Range`, `DateOnly? From`, `DateOnly? To`, `int Page`, `int PageSize`)
- [ ] **F2-BE-02** Create `CtrForRegenerationItem` result record (`int CtrId`, `int ClientId`, `string ClientName`, `int TaxYear`, `DateTime FailedAt`, `string ErrorMessage`, `int RetryCount`)
- [ ] **F2-BE-03** Create `GetCtrsForRegenerationQuery` class — Dapper query; targets transient-error category; filters by env + time range
- [ ] **F2-BE-04** Add `FluentValidation` validator for `GetCtrsForRegenerationRequest`
- [ ] **F2-BE-05** Create `GetCtrsForRegenerationEndpoint` in API — maps `GET /api/v1/ctr-monitoring/regeneration`

### Frontend

- [ ] **F2-FE-01** Add typed API client function `getCtrsForRegeneration(params)`
- [ ] **F2-FE-02** Build `CtrsForRegenerationPage` — same filter bar as Feature 1 (shared component)
- [ ] **F2-FE-03** Build data table: CTR ID, Client ID/Name, Tax Year, Failure Date/Time, Error Message, Retry Count, Actions
- [ ] **F2-FE-04** Add row-level `Regenerate` action + bulk-select `Bulk Regenerate` with confirmation dialog

---

## Feature 3 — Get CTRs Requiring Human Attention (non-transient errors)

> Flag CTRs with non-transient failures that cannot be auto-resolved.

### Backend

- [ ] **F3-BE-01** Create `GetCtrsRequiringAttentionRequest` record (`AppEnvironment Environment`, `string Range`, `DateOnly? From`, `DateOnly? To`, `int Page`, `int PageSize`)
- [ ] **F3-BE-02** Create `CtrRequiringAttentionItem` result record (`int CtrId`, `int ClientId`, `string ClientName`, `int TaxYear`, `DateTime FailedAt`, `string ErrorType`, `string ErrorMessage`, `int RetryCount`)
- [ ] **F3-BE-03** Create `GetCtrsRequiringAttentionQuery` class — Dapper query; targets non-transient-error category; filters by env + time range
- [ ] **F3-BE-04** Add `FluentValidation` validator for `GetCtrsRequiringAttentionRequest`
- [ ] **F3-BE-05** Create `GetCtrsRequiringAttentionEndpoint` in API — maps `GET /api/v1/ctr-monitoring/attention`

### Frontend

- [ ] **F3-FE-01** Add typed API client function `getCtrsRequiringAttention(params)`
- [ ] **F3-FE-02** Build `CtrsAttentionPage` — filter bar (shared component), distinct warning badge/color to differentiate from transient failures
- [ ] **F3-FE-03** Build data table: CTR ID, Client ID/Name, Tax Year, Failure Date/Time, Error Type, full Error Message, Retry Count, Actions
- [ ] **F3-FE-04** Add `View Details` expansion panel — full error, no auto-regenerate option; `Mark Reviewed` action

---

## Feature 4 — Generate Form

> Trigger generation of a single form via the downstream HTTP service.

### Backend

- [ ] **F4-BE-01** Create `GenerateFormRequest` record (`AppEnvironment Environment`, `int FormId`, `string Reason`)
- [ ] **F4-BE-02** Create `GenerateFormResult` record (`bool Success`, `string? DownstreamResponse`, `string? ErrorMessage`)
- [ ] **F4-BE-03** Create `GenerateFormService` class — encapsulates `HttpClient`; resolves base URL from `EnvironmentConnectionResolver`; posts to the form generation service; deserialises response into `GenerateFormResult`
- [ ] **F4-BE-04** Register `GenerateFormService` with typed `HttpClient` in `Program.cs` (per-env base address from config)
- [ ] **F4-BE-05** Add `FluentValidation` validator for `GenerateFormRequest` (`FormId > 0`, `Reason` not empty)
- [ ] **F4-BE-06** Create `GenerateFormEndpoint` in API — maps `POST /api/v1/ctr-management/generate-form`; calls `GenerateFormService`; logs action + outcome

### Frontend

- [ ] **F4-FE-01** Add typed API client function `generateForm(body)`
- [ ] **F4-FE-02** Build `GenerateFormPage` — form with Form ID field (accepts pre-fill via query param from monitoring tables), Reason textarea
- [ ] **F4-FE-03** Add `Generate` button → confirmation dialog → submit; display inline result (success / error message from downstream)

---

## Feature 5 — Regenerate CTR

> Trigger re-generation of a full CTR package via the downstream HTTP service.

### Backend

- [ ] **F5-BE-01** Create `RegenerateCtrRequest` record (`AppEnvironment Environment`, `int CtrId`, `string Reason`, `bool FailedFormsOnly`)
- [ ] **F5-BE-02** Create `RegenerateCtrResult` record (`bool Success`, `string? DownstreamResponse`, `string? ErrorMessage`)
- [ ] **F5-BE-03** Create `RegenerateCtrService` class — encapsulates `HttpClient`; resolves base URL from `EnvironmentConnectionResolver`; posts to the CTR regeneration service; deserialises response into `RegenerateCtrResult`
- [ ] **F5-BE-04** Register `RegenerateCtrService` with typed `HttpClient` in `Program.cs`
- [ ] **F5-BE-05** Add `FluentValidation` validator for `RegenerateCtrRequest` (`CtrId > 0`, `Reason` not empty)
- [ ] **F5-BE-06** Create `RegenerateCtrEndpoint` in API — maps `POST /api/v1/ctr-management/regenerate-ctr`; calls `RegenerateCtrService`; logs action + outcome

### Frontend

- [ ] **F5-FE-01** Add typed API client function `regenerateCtr(body)`
- [ ] **F5-FE-02** Build `RegenerateCtrPage` — form with CTR ID field (accepts pre-fill from monitoring tables), Reason textarea, `Failed forms only` toggle
- [ ] **F5-FE-03** Add `Regenerate` button → confirmation dialog showing CTR ID + options → submit; display inline result

---

## Feature 6 — Get Paychex Client Status

> Read a client's Paychex status directly from the database.

### Backend

- [ ] **F6-BE-01** Create `GetPaychexClientStatusRequest` record (`AppEnvironment Environment`, `int ClientId`)
- [ ] **F6-BE-02** Create `PaychexClientStatusResult` record (`int ClientId`, `string ClientName`, `bool IsEnabled`, `DateTime LastChangedAt`)
- [ ] **F6-BE-03** Create `GetPaychexClientStatusQuery` class — Dapper query; looks up client row by `ClientId` in the environment-resolved DB; returns `PaychexClientStatusResult?`
- [ ] **F6-BE-04** Add `FluentValidation` validator for `GetPaychexClientStatusRequest` (`ClientId > 0`)
- [ ] **F6-BE-05** Create `GetPaychexClientStatusEndpoint` in API — maps `GET /api/v1/paychex/clients/{clientId}/status`; query param `environment`

### Frontend

- [ ] **F6-FE-01** Add typed API client function `getPaychexClientStatus(clientId, env)`
- [ ] **F6-FE-02** Build `PaychexClientStatusPage` — Client ID / Name search field with debounced autocomplete; trigger query on selection
- [ ] **F6-FE-03** Display result card: Client ID/Name, status badge (`On Paychex` / `Off Paychex`), Last Changed At

---

## Feature 7 — Set Paychex Client Status

> Write a client's Paychex status directly to the database.

### Backend

- [ ] **F7-BE-01** Create `SetPaychexClientStatusRequest` record (`AppEnvironment Environment`, `int ClientId`, `bool Enabled`, `string Reason`)
- [ ] **F7-BE-02** Create `SetPaychexClientStatusResult` record (`bool Success`, `bool NewStatus`)
- [ ] **F7-BE-03** Create `SetPaychexClientStatusCommand` class — Dapper command; updates the Paychex status flag in the environment-resolved DB; also inserts an audit row into `SupportAuditLog` (environment, clientId, action, before, after, timestamp, reason)
- [ ] **F7-BE-04** Add `FluentValidation` validator for `SetPaychexClientStatusRequest` (`ClientId > 0`, `Reason` not empty)
- [ ] **F7-BE-05** Create `SetPaychexClientStatusEndpoint` in API — maps `PUT /api/v1/paychex/clients/{clientId}/status`; calls `SetPaychexClientStatusCommand`; logs action

### Frontend

- [ ] **F7-FE-01** Add typed API client function `setPaychexClientStatus(clientId, body)`
- [ ] **F7-FE-02** Add `Toggle Status` button on the Client Status result card (Feature 6 page) — grayed out until status is loaded
- [ ] **F7-FE-03** Confirmation dialog: show client name, current status → new status, warn of impact; on confirm call API; refresh card on success

---

## Notes

- Backend tasks marked `BE` belong in `AITrail.QuarterEndTaxSupportUtils.Business` (query/command/service/records) and `AITrail.QuarterEndTaxSupportUtils.API` (endpoint only).
- All request records must carry `AppEnvironment Environment` — validated before any DB or HTTP call.
- Dapper only — no EF Core.
- `GenerateFormService` and `RegenerateCtrService` use `HttpClient`; all other features use Dapper.
- Paychex status (Features 6 & 7) interacts with the database directly — no downstream service call.
- Auth (Entra ID / Easy Auth) is **out of scope** for the current iteration — tracked as Phase 5 in the product plan.
