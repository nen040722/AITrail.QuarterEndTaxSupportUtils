# API Specification

This is the API specification for the spec detailed in .agent-os/specs/2026-03-13-skeleton-project-scaffold/spec.md

---

## Overview

All endpoints are skeleton stubs returning `501 Not Implemented`. Each is implemented as a `static class` with a single `Map…` extension method on `WebApplication`. Handlers return `Results.Json(new { message = "Not implemented" }, statusCode: 501)`.

Route prefix: `/api/v1`

---

## Endpoints

### GET /api/v1/ctr-monitoring/failed

**File:** `API/Endpoints/GetFailedCtrsEndpoint.cs`
**Class:** `GetFailedCtrsEndpoint`
**Extension method:** `MapGetFailedCtrsEndpoints(this WebApplication app)`
**Purpose:** Retrieve CTRs that failed generation during the quarter-end run.
**Parameters:** None (real query params TBD in feature sprint)
**Response:** `501` — `{ "message": "Not implemented" }`
**Tag:** `CTR Monitoring`
**WithName:** `GetFailedCtrs`

---

### GET /api/v1/ctr-monitoring/regeneration

**File:** `API/Endpoints/GetCtrsForRegenerationEndpoint.cs`
**Class:** `GetCtrsForRegenerationEndpoint`
**Extension method:** `MapGetCtrsForRegenerationEndpoints(this WebApplication app)`
**Purpose:** Retrieve CTRs that are queued or eligible for regeneration.
**Parameters:** None (real query params TBD in feature sprint)
**Response:** `501` — `{ "message": "Not implemented" }`
**Tag:** `CTR Monitoring`
**WithName:** `GetCtrsForRegeneration`

---

### GET /api/v1/ctr-monitoring/attention

**File:** `API/Endpoints/GetCtrsRequiringAttentionEndpoint.cs`
**Class:** `GetCtrsRequiringAttentionEndpoint`
**Extension method:** `MapGetCtrsRequiringAttentionEndpoints(this WebApplication app)`
**Purpose:** Retrieve CTRs that require manual review or support intervention.
**Parameters:** None (real query params TBD in feature sprint)
**Response:** `501` — `{ "message": "Not implemented" }`
**Tag:** `CTR Monitoring`
**WithName:** `GetCtrsRequiringAttention`

---

### POST /api/v1/ctr-management/generate-form

**File:** `API/Endpoints/GenerateFormEndpoint.cs`
**Class:** `GenerateFormEndpoint`
**Extension method:** `MapGenerateFormEndpoints(this WebApplication app)`
**Purpose:** Trigger generation of a specific tax form for a CTR.
**Parameters:** None (real request body TBD in feature sprint)
**Response:** `501` — `{ "message": "Not implemented" }`
**Tag:** `CTR Management`
**WithName:** `GenerateForm`

---

### POST /api/v1/ctr-management/regenerate-ctr

**File:** `API/Endpoints/RegenerateCtrEndpoint.cs`
**Class:** `RegenerateCtrEndpoint`
**Extension method:** `MapRegenerateCtrEndpoints(this WebApplication app)`
**Purpose:** Re-trigger CTR generation for a failed or stuck record.
**Parameters:** None (real request body TBD in feature sprint)
**Response:** `501` — `{ "message": "Not implemented" }`
**Tag:** `CTR Management`
**WithName:** `RegenerateCtr`

---

### GET /api/v1/paychex/clients/{clientId}/status

**File:** `API/Endpoints/GetPaychexClientStatusEndpoint.cs`
**Class:** `GetPaychexClientStatusEndpoint`
**Extension method:** `MapGetPaychexClientStatusEndpoints(this WebApplication app)`
**Purpose:** Retrieve the current Paychex processing status flag for a given client.
**Parameters:** `clientId` (route, string) — Paychex client identifier
**Response:** `501` — `{ "message": "Not implemented" }`
**Tag:** `Paychex`
**WithName:** `GetPaychexClientStatus`

---

### PUT /api/v1/paychex/clients/{clientId}/status

**File:** `API/Endpoints/SetPaychexClientStatusEndpoint.cs`
**Class:** `SetPaychexClientStatusEndpoint`
**Extension method:** `MapSetPaychexClientStatusEndpoints(this WebApplication app)`
**Purpose:** Set or toggle the Paychex processing status flag for a given client.
**Parameters:** `clientId` (route, string) — Paychex client identifier; request body TBD in feature sprint
**Response:** `501` — `{ "message": "Not implemented" }`
**Tag:** `Paychex`
**WithName:** `SetPaychexClientStatus`

---

## Endpoint Implementation Pattern

```csharp
namespace AITrail.QuarterEndTaxSupportUtils.API.Endpoints;

public static class GetFailedCtrsEndpoint
{
    public static void MapGetFailedCtrsEndpoints(this WebApplication app)
    {
        app.MapGet("/api/v1/ctr-monitoring/failed", () =>
            Results.Json(new { message = "Not implemented" }, statusCode: 501))
            .WithName("GetFailedCtrs")
            .WithTags("CTR Monitoring");
    }
}
```

## Error Responses (via Global Middleware)

All unhandled exceptions bypass the stub handler and are caught by `GlobalExceptionMiddleware`:

| Exception class       | Status | ProblemDetails title           |
| --------------------- | ------ | ------------------------------ |
| `ValidationException` | 400    | "Validation failed"            |
| `NotFoundException`   | 404    | "Resource not found"           |
| Any other `Exception` | 500    | "An unexpected error occurred" |

Stack traces and exception details are never exposed in responses.
