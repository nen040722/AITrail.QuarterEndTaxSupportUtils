# Technical Specification

This is the technical specification for the spec detailed in .agent-os/specs/2026-03-14-failed-ctrs-page/spec.md

## Technical Requirements

### Backend — Configuration

- Add three new connection string entries to `appsettings.json` under a logical `TaxSnapshotDb` key group:
  - `TaxSnapshotDbConnectionString_QSB` — empty string placeholder
  - `TaxSnapshotDbConnectionString_RC` — empty string placeholder
  - `TaxSnapshotDbConnectionString_PROD` — empty string placeholder
- Create a `TaxSnapshotConnectionStringProvider` class in `AITrail.QuarterEndTaxSupportUtils.Business/Common/Infrastructure/` with a single method `GetTaxSnapshotDbConnectionString(AppEnvironment env)` that reads and returns the matching connection string from `IConfiguration`.
- Register `TaxSnapshotConnectionStringProvider` as a singleton in `Program.cs`.

### Backend — Query Models (Records)

**`TaxPacketGenerationProcessStatusQueryModel`** — maps the failed CTR query result:

| Property            | CLR type         |
| ------------------- | ---------------- |
| `TaxPacketGuid`     | `Guid`           |
| `PQUID`             | `long`           |
| `ClientId`          | `int`            |
| `Year`              | `int`            |
| `Quarter`           | `int`            |
| `ProcessStatus`     | `string`         |
| `Message`           | `string`         |
| `META_DateCreated`  | `DateTimeOffset` |
| `ReportType`        | `string`         |
| `IsReportWizardCTR` | `bool`           |

**`TaxReportGenerationStatusQueryModel`** — maps the failed forms query result:

| Property                 | CLR type |
| ------------------------ | -------- |
| `TaxPacketGuid`          | `Guid`   |
| `Id`                     | `Guid`   |
| `ReportName`             | `string` |
| `ReportStatus`           | `string` |
| `ReportDataTransStatus`  | `string` |
| `PdfGenStatus`           | `string` |
| `ReportDataTransMessage` | `string` |
| `PdfGenMessage`          | `string` |
| `TaxAuthCode`            | `string` |
| `TaxCode`                | `string` |
| `TaxFormName`            | `string` |
| `GenerationType`         | `string` |

**`FailedTaxReportGenerationStatusQueryModel`** — wraps a form result with the transient-error flag:

| Property                          | CLR type                              |
| --------------------------------- | ------------------------------------- |
| `TaxReportGenerationStatus`       | `TaxReportGenerationStatusQueryModel` |
| `IsFailedBecauseOfTransientError` | `bool`                                |

### Backend — SQL Queries

**GetFailedCTRsQuery** — parameterised by `@from` (`DateTimeOffset`) and `@to` (`DateTimeOffset`):

```sql
SELECT
    tpgps.TaxPacketGuid,
    tpgps.PQUID,
    tpgps.ClientId,
    tpgps.Year,
    tpgps.Quarter,
    tpgps.ProcessStatus,
    tpgps.Message,
    tpgps.META_DateCreated,
    tpgps.ReportType,
    tpgps.IsReportWizardCTR
FROM TaxPacketGenerationProcessStatus tpgps
WHERE tpgps.ProcessStatus = 'PROCESS_FAILED'
  AND tpgps.META_DateCreated >= @from
  AND tpgps.META_DateCreated <= @to;
```

**GetFailedFormsForCTRQuery** — parameterised by `@taxPacketGuid` (`Guid`):

```sql
SELECT
    TaxPacketGuid,
    Id,
    ReportName,
    ReportStatus,
    ReportDataTransStatus,
    PdfGenStatus,
    ReportDataTransMessage,
    PdfGenMessage,
    TaxAuthCode,
    TaxCode,
    TaxFormName,
    GenerationType
FROM TaxReportGenerationStatus
WHERE TaxPacketGuid = @taxPacketGuid
  AND ReportStatus = 'F';
```

Both queries execute against the TaxSnapshot database using a connection obtained from `TaxSnapshotConnectionStringProvider`.

### Backend — Service

Create `FailedCtrService` (interface `IFailedCtrService`) in `AITrail.QuarterEndTaxSupportUtils.Business/Features/FailedCtrs/`:

- `Task<IReadOnlyList<TaxPacketGenerationProcessStatusQueryModel>> GetFailedCtrsAsync(AppEnvironment env, DateTimeOffset from, DateTimeOffset to)`
  - Opens a connection via `TaxSnapshotConnectionStringProvider` for the given `env`.
  - Executes **GetFailedCTRsQuery** with Dapper and returns the mapped list.

- `Task<IReadOnlyList<FailedTaxReportGenerationStatusQueryModel>> GetFailedFormsForCtrAsync(AppEnvironment env, Guid taxPacketGuid)`
  - Opens a connection via `TaxSnapshotConnectionStringProvider` for the given `env`.
  - Executes **GetFailedFormsForCTRQuery** with Dapper.
  - For each result row, computes `IsFailedBecauseOfTransientError` based on the transient-error keyword patterns (see below) and wraps it in `FailedTaxReportGenerationStatusQueryModel`.
  - Returns the wrapped list.

**Transient-error detection logic** — `IsFailedBecauseOfTransientError` is `true` when any of the following substrings appear in `ReportDataTransMessage` OR `PdfGenMessage`:

- `Failed to upload generated file to PRS API`
- `Execution Timeout Expired`
- `Microsoft.Data.SqlClient.SqlException`
- `The wait operation timed out`
- `This SqlTransaction has completed; it is no longer usable`

### Backend — Endpoints

API endpoints are added to `GetFailedCtrsEndpoint.cs` in `AITrail.QuarterEndTaxSupportUtils.API/Endpoints/`.

Both endpoints accept `environment` as a required query string parameter (`QSB` | `RC` | `PROD`) and map it to `AppEnvironment` before calling the service.

### Frontend — Failed CTRs Page

Replace `FailedCtrsPage.tsx` placeholder with a fully implemented page:

- **Date picker** (MUI `DatePicker` from `@mui/x-date-pickers`) defaulting to today's date. The selected date drives the `from` / `to` range (start and end of the selected day in UTC).
- **CTR table** rendered with MUI `DataGrid` or `Table` showing all 10 columns. Rows are clickable.
- **Detail modal** (`MUI Dialog`, size `lg`/fullWidth) opens on row click:
  - Header section: labelled values for TaxPacketGuid, PQUID, ClientId, Year, Quarter.
  - **Failed forms table** rendered with all 6 display columns plus a visual indicator for `IsFailedBecauseOfTransientError`.
- API calls use `axiosClient` (which already appends ?environment=... from the context). A dedicated `failedCtrsApi.ts` module in `src/features/ctr-monitoring/` holds the typed fetch functions.

### Frontend — Types

Define TypeScript interfaces in `src/features/ctr-monitoring/types.ts`:

- `FailedCtr` — mirrors `TaxPacketGenerationProcessStatusQueryModel`
- `FailedForm` — mirrors `TaxReportGenerationStatusQueryModel` with `isFailedBecauseOfTransientError: boolean`

## External Dependencies

- **Dapper** — lightweight ORM for parameterised SQL execution. Already expected to be present in the Business project (consistent with existing `SqlConnectionFactory` pattern). Confirm version in `.csproj` before use.
- **@mui/x-date-pickers** — MUI date picker components for the frontend date selection. Verify it is installed in `frontend/package.json`; add if missing.
