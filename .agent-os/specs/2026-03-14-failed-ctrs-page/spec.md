# Spec Requirements Document

> Spec: Failed CTRs Page — Full Implementation
> Created: 2026-03-14
> Status: Planning

## Overview

Implement the Failed CTRs monitoring page that allows support engineers to view all failed CTR (Composite Tax Return) records for a selected date, drill into each record to inspect the individual failed tax forms, and determine whether failures are transient or substantive. This feature requires both a backend data access layer querying a dedicated TaxSnapshot database and a fully interactive frontend page replacing the current placeholder.

## User Stories

### View Failed CTRs for a Date

As a support engineer, I want to see all failed CTRs for a given date, so that I can quickly identify which clients are affected and need attention.

The engineer opens the Failed CTRs page, which defaults to today's date. A date picker lets them choose any other day. The page loads the data from the API and displays it in a table with all relevant columns (TaxPacketGuid, PQUID, ClientId, Year, Quarter, ProcessStatus, Message, META_CreatedAt, ReportType, IsReportWizardCTR).

### Inspect Failed Forms for a CTR

As a support engineer, I want to click on a failed CTR row and see all the failed tax forms associated with it, so that I can understand why the CTR failed and whether the cause is transient.

Clicking a row opens a large modal/popup. The header shows key identifiers (TaxPacketGuid, PQUID, ClientId, Year, Quarter). Below that, a table lists every failed tax form with columns: ReportName, ReportStatus, ReportDataTransStatus, PdfGenStatus, ReportDataTransMessage, PdfGenMessage. An `IsFailedBecauseOfTransientError` indicator is also surfaced per row so the engineer can immediately see which failures warrant a re-trigger.

## Spec Scope

1. **TaxSnapshot Connection String Setup** - Add three environment-keyed connection strings for the TaxSnapshot database to `appsettings.json` and register a `TaxSnapshotConnectionStringProvider` in DI.
2. **GetFailedCTRsQuery** - Implement a parameterised MSSQL query that retrieves `TaxPacketGenerationProcessStatus` rows filtered by `PROCESS_FAILED` status for a given date range.
3. **GetFailedFormsForCTRQuery** - Implement a parameterised MSSQL query that retrieves `TaxReportGenerationStatus` rows with `ReportStatus = 'F'` for a given `TaxPacketGuid`.
4. **FailedCtrService** - Implement a Business-layer service with `GetFailedCtrsAsync` and `GetFailedFormsForCtrAsync`, where the latter calculates the transient-error flag per form.
5. **Backend Endpoints** - Expose both service methods as GET endpoints, each accepting an `environment` query parameter to resolve the correct connection string.
6. **Failed CTRs Page (Frontend)** - Replace the placeholder with a functional page: date picker, results table, and a drill-through modal for failed forms.

## Out of Scope

- Retrying or re-triggering failed CTRs from this page (handled by separate feature)
- Filtering/sorting the tables beyond what the browser provides natively
- Pagination (return all records for the selected date)
- Authentication changes — existing auth model applies

## Expected Deliverable

1. A GET `/api/v1/ctr-monitoring/failed` endpoint accepting `from`, `to`, and `environment` query parameters returns a JSON array of failed CTR records from the TaxSnapshot database.
2. A GET `/api/v1/ctr-monitoring/failed/{taxPacketGuid}/forms` endpoint accepting `environment` returns a JSON array of failed form records, each including the computed `isFailedBecauseOfTransientError` boolean.
3. The Failed CTRs React page renders a date picker (defaulting to today), fetches and displays the CTR table, and opens a modal with the failed-forms table on row click.
