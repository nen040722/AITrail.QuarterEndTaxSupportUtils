# API Specification

This is the API specification for the spec detailed in .agent-os/specs/2026-03-14-failed-ctrs-page/spec.md

## Endpoints

---

### GET /api/v1/ctr-monitoring/failed

**Purpose:** Returns all `PROCESS_FAILED` CTR records from the TaxSnapshot database for the specified date range and environment.

**Parameters:**

| Name          | In    | Required | Type                                        | Description                                                                                                                      |
| ------------- | ----- | -------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `from`        | query | yes      | `string` (ISO 8601 date, e.g. `2026-01-05`) | Start of the date range (inclusive).                                                                                             |
| `to`          | query | yes      | `string` (ISO 8601 date, e.g. `2026-01-06`) | End of the date range (inclusive).                                                                                               |
| `environment` | query | yes      | `string` (`QSB` \| `RC` \| `PROD`)          | Target environment to resolve the TaxSnapshot connection string. Injected automatically by the frontend axiosClient interceptor. |

**Success Response — 200 OK:**

```json
[
  {
    "taxPacketGuid": "E6755438-92A0-4EB1-A556-85F23CBF005C",
    "pquid": 122154777166864,
    "clientId": 136367,
    "year": 2021,
    "quarter": 4,
    "processStatus": "PROCESS_FAILED",
    "message": "...",
    "meta_DateCreated": "2026-01-05T11:57:50.237Z",
    "reportType": "CTR",
    "isReportWizardCTR": false
  }
]
```

**Error Responses:**

| Status                      | Condition                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `400 Bad Request`           | Missing or invalid `from`, `to`, or `environment` parameters. Returns standard error response. |
| `500 Internal Server Error` | Unhandled exception (no sensitive detail returned).                                            |

---

### GET /api/v1/ctr-monitoring/failed/{taxPacketGuid}/forms

**Purpose:** Returns all failed tax form records for a specific CTR, each annotated with a computed transient-error indicator.

**Parameters:**

| Name            | In    | Required | Type                               | Description                                                                         |
| --------------- | ----- | -------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| `taxPacketGuid` | path  | yes      | `string` (GUID)                    | The unique identifier of the CTR to inspect.                                        |
| `environment`   | query | yes      | `string` (`QSB` \| `RC` \| `PROD`) | Target environment. Injected automatically by the frontend axiosClient interceptor. |

**Success Response — 200 OK:**

```json
[
  {
    "taxReportGenerationStatus": {
      "taxPacketGuid": "E6755438-92A0-4EB1-A556-85F23CBF005C",
      "id": "034C41B8-E977-4934-8226-B9E9A8DB04E7",
      "reportName": "Tax form - PA LST Return PAKEYL",
      "reportStatus": "F",
      "reportDataTransStatus": "Success",
      "pdfGenStatus": "UnexpectedFailure",
      "reportDataTransMessage": "...",
      "pdfGenMessage": "...",
      "taxAuthCode": "PAKEYL",
      "taxCode": "PADOYL",
      "taxFormName": "PA_LST_Return",
      "generationType": "Cloud"
    },
    "isFailedBecauseOfTransientError": false
  }
]
```

**Error Responses:**

| Status                      | Condition                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| `400 Bad Request`           | Invalid `taxPacketGuid` format or missing `environment`. Returns standard error response. |
| `404 Not Found`             | No forms found for the given `taxPacketGuid` (optional — may return empty array instead). |
| `500 Internal Server Error` | Unhandled exception (no sensitive detail returned).                                       |

---

## Route Summary

| Method | Route                                                 | Handler                                                              | Description                     |
| ------ | ----------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------- |
| GET    | `/api/v1/ctr-monitoring/failed`                       | `GetFailedCtrsEndpoint`                                              | List failed CTRs for date range |
| GET    | `/api/v1/ctr-monitoring/failed/{taxPacketGuid}/forms` | `GetFailedCtrsEndpoint` (or separate `GetFailedFormsForCtrEndpoint`) | List failed forms for a CTR     |
