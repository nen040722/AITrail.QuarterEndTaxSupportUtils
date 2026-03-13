# Technical Specification

This is the technical specification for the spec detailed in .agent-os/specs/2026-03-13-skeleton-project-scaffold/spec.md

---

## Technical Requirements

### Backend — Solution Structure

```
AITrail.QuarterEndTaxSupportUtils/
└── src/
    ├── AITrail.QuarterEndTaxSupportUtils.sln
    ├── AITrail.QuarterEndTaxSupportUtils.API/
    └── AITrail.QuarterEndTaxSupportUtils.Business/
```

- Target framework: **net10.0** for both projects
- `API` project type: `dotnet new webapi --use-minimal-apis`
- `Business` project type: `dotnet new classlib`
- `API` references `Business` via project reference

### Backend — NuGet Packages

| Project  | Package                       |
| -------- | ----------------------------- |
| API      | `FluentValidation.AspNetCore` |
| Business | `Dapper`                      |
| Business | `Microsoft.Data.SqlClient`    |
| Business | `FluentValidation`            |

### Backend — Business Project: Common Infrastructure

#### `Common/Environment/AppEnvironment.cs`

- `public enum AppEnvironment { QSB, Staging, Prod }`
- Namespace: `AITrail.QuarterEndTaxSupportUtils.Business.Common.Environment`

#### `Common/Environment/EnvironmentConnectionResolver.cs`

- Constructor: accepts `IConfiguration`
- `string GetConnectionString(AppEnvironment env)` — reads `ConnectionStrings:{env}` from config; throws `NotSupportedException` for unknown enum values
- `string GetDownstreamBaseUrl(AppEnvironment env)` — reads `DownstreamServices:{env}:BaseUrl` from config; throws `NotSupportedException` for unknown enum values

#### `Common/Exceptions/NotFoundException.cs`

- Custom exception extending `Exception`
- Used by global exception middleware to produce 404 responses

#### `Common/Infrastructure/SqlConnectionFactory.cs`

- Constructor: accepts `EnvironmentConnectionResolver`
- `IDbConnection CreateConnection(AppEnvironment env)` — resolves connection string via `EnvironmentConnectionResolver`, instantiates and returns a new (unopened) `SqlConnection`
- Does **not** open the connection; callers are responsible for opening

### Backend — API Project: `Program.cs` wiring

1. Register `EnvironmentConnectionResolver` and `SqlConnectionFactory` as **singletons**
2. Register FluentValidation pipeline (`AddFluentValidationAutoValidation`) — no validators at this stage
3. Register global exception middleware: `app.UseMiddleware<GlobalExceptionMiddleware>()`
4. Map all 7 feature endpoint groups via extension methods:
   - `app.MapGetFailedCtrsEndpoints()`
   - `app.MapGetCtrsForRegenerationEndpoints()`
   - `app.MapGetCtrsRequiringAttentionEndpoints()`
   - `app.MapGenerateFormEndpoints()`
   - `app.MapRegenerateCtrEndpoints()`
   - `app.MapGetPaychexClientStatusEndpoints()`
   - `app.MapSetPaychexClientStatusEndpoints()`
5. Enable Swagger: `app.UseSwagger()` + `app.UseSwaggerUI()` inside `if (app.Environment.IsDevelopment())`

### Backend — Global Exception Middleware

File: `Middleware/GlobalExceptionMiddleware.cs`

| Exception type        | HTTP status | `ProblemDetails` title         |
| --------------------- | ----------- | ------------------------------ |
| `ValidationException` | 400         | "Validation failed"            |
| `NotFoundException`   | 404         | "Resource not found"           |
| Any other `Exception` | 500         | "An unexpected error occurred" |

- Returns `application/json` with RFC 7807 `ProblemDetails` structure
- Does **not** expose stack traces or exception details in responses (5xx safety rule)

### Backend — `appsettings.json`

```json
{
  "ConnectionStrings": {
    "QSB": "Server=.;Database=placeholder_qsb;Integrated Security=true;",
    "Staging": "Server=.;Database=placeholder_staging;Integrated Security=true;",
    "Prod": "Server=.;Database=placeholder_prod;Integrated Security=true;"
  },
  "DownstreamServices": {
    "QSB": { "BaseUrl": "https://placeholder-qsb.internal" },
    "Staging": { "BaseUrl": "https://placeholder-staging.internal" },
    "Prod": { "BaseUrl": "https://placeholder-prod.internal" }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

No real secrets or connection strings are committed. All values are placeholder strings.

---

### Frontend — Directory Structure

Location: `src/frontend/` (scaffolded via `npm create vite@latest frontend -- --template react-ts`)

```
src/frontend/src/
├── app/
│   ├── App.tsx                  # QueryClientProvider + EnvironmentProvider + RouterProvider
│   ├── router.tsx               # createBrowserRouter — all routes
│   └── AppShell.tsx             # Layout: MUI AppBar + Drawer sidebar + <Outlet />
├── features/
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── ctr-monitoring/
│   │   ├── FailedCtrsPage.tsx
│   │   ├── CtrsForRegenerationPage.tsx
│   │   └── CtrsAttentionPage.tsx
│   ├── ctr-management/
│   │   ├── GenerateFormPage.tsx
│   │   └── RegenerateCtrPage.tsx
│   └── paychex/
│       └── PaychexClientStatusPage.tsx
└── shared/
    ├── api/
    │   └── axiosClient.ts
    └── environment/
        └── EnvironmentContext.tsx
```

### Frontend — npm Dependencies

```bash
# UI
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# Routing
npm install react-router-dom

# Data fetching
npm install @tanstack/react-query

# HTTP client
npm install axios
```

> Note: Replace `@mui/material` with the Paycor Design System package when the internal registry is available. MUI is the stand-in for the skeleton.

### Frontend — `EnvironmentContext.tsx`

- `type AppEnvironment = 'QSB' | 'STAGING' | 'PROD'`
- Context value: `{ environment: AppEnvironment; setEnvironment: (env: AppEnvironment) => void }`
- Initial state: `'QSB'`
- Provider wraps the entire app (inside `App.tsx`, outside `QueryClientProvider`)
- Exports: `EnvironmentContext`, `EnvironmentProvider`, `useEnvironment` hook

### Frontend — `axiosClient.ts`

- `axios.create({ baseURL: '/api/v1' })`
- Request interceptor injects `environment` query param on every outgoing request
- Environment value read from a module-level ref updated by `EnvironmentProvider` on each render (avoids calling hooks outside React)

### Frontend — `AppShell.tsx`

- MUI `AppBar` header: left = app title "QuarterEnd Tax Support Utils"; right = environment selector (`Select` or `ToggleButtonGroup`, options: QSB / STAGING / PROD)
- MUI `Drawer` sidebar with `List` / `ListItemButton` navigation items
- Active route highlighted using `useMatch` or `NavLink` active class
- Groups always expanded (no collapse toggle needed at this stage)
- `<Outlet />` renders the active page in the main content area

**Sidebar navigation items:**

| Label                           | Route                            |
| ------------------------------- | -------------------------------- |
| Dashboard                       | `/`                              |
| _CTR Monitoring_ (group header) | —                                |
| Failed CTRs                     | `/ctr-monitoring/failed`         |
| For Regeneration                | `/ctr-monitoring/regeneration`   |
| Requires Attention              | `/ctr-monitoring/attention`      |
| _CTR Management_ (group header) | —                                |
| Generate Form                   | `/ctr-management/generate-form`  |
| Regenerate CTR                  | `/ctr-management/regenerate-ctr` |
| _Paychex_ (group header)        | —                                |
| Client Status                   | `/paychex/status`                |

### Frontend — Placeholder Pages

Each page is a minimal functional component:

```tsx
export default function [PageName]() {
  return (
    <Box>
      <Typography variant="h5">[Heading Text]</Typography>
      <Typography color="text.secondary">Feature coming soon.</Typography>
    </Box>
  );
}
```

| Component                 | Route                            | Heading Text             |
| ------------------------- | -------------------------------- | ------------------------ |
| `DashboardPage`           | `/`                              | Dashboard                |
| `FailedCtrsPage`          | `/ctr-monitoring/failed`         | Failed CTRs              |
| `CtrsForRegenerationPage` | `/ctr-monitoring/regeneration`   | CTRs for Regeneration    |
| `CtrsAttentionPage`       | `/ctr-monitoring/attention`      | CTRs Requiring Attention |
| `GenerateFormPage`        | `/ctr-management/generate-form`  | Generate Form            |
| `RegenerateCtrPage`       | `/ctr-management/regenerate-ctr` | Regenerate CTR           |
| `PaychexClientStatusPage` | `/paychex/status`                | Paychex Client Status    |

### Frontend — `router.tsx`

- Uses `createBrowserRouter` from `react-router-dom`
- Single layout route (`path: "/"`, `element: <AppShell />`) with 7 feature child routes + dashboard index route

### Frontend — `App.tsx`

- Module-level `new QueryClient()` constant
- Render order: `<EnvironmentProvider>` → `<QueryClientProvider client={queryClient}>` → `<RouterProvider router={router} />`

### Frontend — Vite Dev Proxy

`vite.config.ts` proxy forwards `/api/*` to the .NET API to avoid CORS during local development:

```ts
server: {
  proxy: {
    '/api': {
      target: 'https://localhost:5001',
      changeOrigin: true,
      secure: false,
    },
  },
},
```
