# Spec Tasks

## Tasks

- [x] 1. TaxSnapshot database infrastructure (backend)
  - [x] 1.1 Add `TaxSnapshotDbConnectionString_QSB`, `TaxSnapshotDbConnectionString_RC`, and `TaxSnapshotDbConnectionString_PROD` entries (empty string placeholders) to `appsettings.json`
  - [x] 1.2 Create `TaxSnapshotConnectionStringProvider` class in `Business/Common/Infrastructure/` with `GetTaxSnapshotDbConnectionString(AppEnvironment env)` method that reads from `IConfiguration`
  - [x] 1.3 Register `TaxSnapshotConnectionStringProvider` as a singleton in `Program.cs`

- [x] 2. Query models (records)
  - [x] 2.1 Create `TaxPacketGenerationProcessStatusQueryModel` record in `Business/Features/FailedCtrs/` with all 10 properties (matching the SQL result columns plus `Message`)
  - [x] 2.2 Create `TaxReportGenerationStatusQueryModel` record in the same folder with all 12 properties (matching the SQL result columns plus `ReportDataTransMessage` and `PdfGenMessage`)
  - [x] 2.3 Create `FailedTaxReportGenerationStatusQueryModel` record with `TaxReportGenerationStatus` and `IsFailedBecauseOfTransientError` properties

- [x] 3. Business-layer service
  - [x] 3.1 Write unit tests for `FailedCtrService` covering: correct query parameters forwarded, `IsFailedBecauseOfTransientError` computed correctly for each transient-error keyword pattern, and returns empty list when no rows found
  - [x] 3.2 Create `IFailedCtrService` interface with `GetFailedCtrsAsync` and `GetFailedFormsForCtrAsync` signatures
  - [x] 3.3 Implement `FailedCtrService` in `Business/Features/FailedCtrs/`:
    - `GetFailedCtrsAsync(AppEnvironment env, DateTimeOffset from, DateTimeOffset to)` — opens TaxSnapshot connection, executes GetFailedCTRsQuery via Dapper, returns mapped list
    - `GetFailedFormsForCtrAsync(AppEnvironment env, Guid taxPacketGuid)` — opens TaxSnapshot connection, executes GetFailedFormsForCTRQuery via Dapper, computes `IsFailedBecauseOfTransientError` per row, wraps in `FailedTaxReportGenerationStatusQueryModel`, returns list
  - [x] 3.4 Register `IFailedCtrService` / `FailedCtrService` in `Program.cs`
  - [x] 3.5 Verify all tests pass

- [x] 4. API endpoints (backend)
  - [x] 4.1 Replace the 501 stub in `GetFailedCtrsEndpoint.cs` with a real `GET /api/v1/ctr-monitoring/failed` handler accepting `from`, `to`, and `environment` query parameters; validate inputs; call `IFailedCtrService.GetFailedCtrsAsync`; return 200 with JSON array
  - [x] 4.2 Add a new `GET /api/v1/ctr-monitoring/failed/{taxPacketGuid}/forms` handler in the same endpoint file accepting `environment`; validate inputs; call `IFailedCtrService.GetFailedFormsForCtrAsync`; return 200 with JSON array
  - [ ] 4.3 Verify with `.http` file or Scalar UI that both endpoints return data against QSB

- [x] 5. Frontend — Failed CTRs page
  - [x] 5.1 Add TypeScript types in `src/features/ctr-monitoring/types.ts` for `FailedCtr` and `FailedForm` (including `isFailedBecauseOfTransientError`)
  - [x] 5.2 Create `src/features/ctr-monitoring/failedCtrsApi.ts` with `fetchFailedCtrs(from: string, to: string)` and `fetchFailedFormsForCtr(taxPacketGuid: string)` functions using `axiosClient`
  - [x] 5.3 Replace `FailedCtrsPage.tsx` placeholder: add MUI `DatePicker` (defaulting to today), wire it to state, call `fetchFailedCtrs` when date changes, display results in a MUI `DataGrid` / `Table` with all 10 columns
  - [x] 5.4 Implement row-click handler that opens a MUI `Dialog` (fullWidth, maxWidth `lg`) showing the 5 label/value fields in the header and calling `fetchFailedFormsForCtr` to populate the failed-forms table (6 columns + transient-error indicator)
  - [x] 5.5 Ensure `@mui/x-date-pickers` is installed (`package.json`); add if missing
  - [ ] 5.6 Verify page renders correctly in browser against QSB environment; confirm modal loads forms data
