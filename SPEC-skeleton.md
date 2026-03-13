# Spec — Skeleton Projects (Foundation Sprint)

> **Scope:** Foundation scaffolding only — no feature business logic, no real data.  
> **Tasks covered:** F-00-BE-01 through F-00-BE-05 · F-00-FE-01 through F-00-FE-05  
> **Date:** March 13, 2026

---

## 1. Objective

Stand up compiling, runnable skeleton projects for both the backend (.NET solution) and the frontend (React + Vite app). All 7 feature areas must have navigable placeholder pages in the UI and stubbed-out endpoint files in the API. No real queries, services, or business logic are implemented at this stage.

---

## 2. Scope

### In scope

- .NET solution file with two projects wired together
- Shared cross-cutting infrastructure in the Business project (environment enum, connection resolver, connection factory, exception middleware)
- One placeholder endpoint file per feature (returns `501 Not Implemented`)
- Vite + React + TypeScript app with Paycor Design System (MUI) installed
- `AppShell` layout: persistent sidebar + header with environment selector
- Placeholder pages for all 7 features and the dashboard
- React Router v7 routes wiring shell to all pages
- `EnvironmentContext` + Axios interceptor
- TanStack Query provider

### Out of scope

- Any real Dapper queries, `HttpClient` calls, or database connectivity
- FluentValidation validators (except the pipeline wiring)
- Auth (Entra ID / MSAL / Easy Auth)
- Feature-level UI components (tables, forms, filters)
- Tests

---

## 3. Backend — .NET Skeleton

### 3.1 Solution structure

```
AITrail.QuarterEndTaxSupportUtils/
└── src/
    ├── AITrail.QuarterEndTaxSupportUtils.sln
    ├── AITrail.QuarterEndTaxSupportUtils.API/
    └── AITrail.QuarterEndTaxSupportUtils.Business/
```

**Commands to scaffold:**

```bash
dotnet new sln -n AITrail.QuarterEndTaxSupportUtils -o src
dotnet new webapi -n AITrail.QuarterEndTaxSupportUtils.API -o src/AITrail.QuarterEndTaxSupportUtils.API --use-minimal-apis
dotnet new classlib -n AITrail.QuarterEndTaxSupportUtils.Business -o src/AITrail.QuarterEndTaxSupportUtils.Business
dotnet sln src/AITrail.QuarterEndTaxSupportUtils.sln add src/AITrail.QuarterEndTaxSupportUtils.API src/AITrail.QuarterEndTaxSupportUtils.Business
dotnet add src/AITrail.QuarterEndTaxSupportUtils.API reference src/AITrail.QuarterEndTaxSupportUtils.Business
```

### 3.2 Target framework and packages

| Project  | Target  | NuGet packages                                           |
| -------- | ------- | -------------------------------------------------------- |
| API      | net10.0 | `FluentValidation.AspNetCore`                            |
| Business | net10.0 | `Dapper`, `Microsoft.Data.SqlClient`, `FluentValidation` |

### 3.3 Business project — Common infrastructure

#### `Common/Environment/AppEnvironment.cs`

```csharp
namespace AITrail.QuarterEndTaxSupportUtils.Business.Common.Environment;

public enum AppEnvironment
{
    QSB,
    Staging,
    Prod
}
```

#### `Common/Environment/EnvironmentConnectionResolver.cs`

Accepts `IConfiguration`. Exposes:

- `string GetConnectionString(AppEnvironment env)` — reads from `ConnectionStrings:{env}` config key
- `string GetDownstreamBaseUrl(AppEnvironment env)` — reads from `DownstreamServices:{env}:BaseUrl` config key

**Skeleton:** constructor + two public methods that read from `IConfiguration` and throw `NotSupportedException` for unknown enum values. No real connection strings yet; `appsettings.json` has placeholder values.

#### `Common/Infrastructure/SqlConnectionFactory.cs`

Depends on `EnvironmentConnectionResolver`. Exposes:

- `IDbConnection CreateConnection(AppEnvironment env)` — resolves connection string and returns a new (unopened) `SqlConnection`

**Skeleton:** constructor accepting `EnvironmentConnectionResolver`; `CreateConnection` resolves the connection string and instantiates `SqlConnection` but does **not** open it. Actual opening is left to callers.

### 3.4 API project — `Program.cs` wiring

`Program.cs` must:

1. Register `EnvironmentConnectionResolver` and `SqlConnectionFactory` as singletons.
2. Add `FluentValidation` pipeline (service registration only — no validators yet).
3. Register global exception handling middleware that catches unhandled exceptions and returns RFC 7807 `ProblemDetails` with appropriate status codes.
4. Map all 7 feature endpoint files via extension methods (`app.MapGetFailedCtrsEndpoints()`, etc.).
5. Enable `app.UseSwagger()` / `app.UseSwaggerUI()` for local development.

### 3.5 Global exception middleware

Create `Middleware/GlobalExceptionMiddleware.cs` in the API project.

Behaviour:

| Exception type        | HTTP status | `ProblemDetails` title         |
| --------------------- | ----------- | ------------------------------ |
| `ValidationException` | 400         | "Validation failed"            |
| `NotFoundException`   | 404         | "Resource not found"           |
| Any other `Exception` | 500         | "An unexpected error occurred" |

`NotFoundException` is a custom exception defined in `Business.Common.Exceptions`.

### 3.6 Endpoint skeleton files

Create one file per feature in `API/Endpoints/`. Each file is a `static class` with a single `Map…` extension method on `WebApplication`. All handlers return `Results.StatusCode(501)` with a JSON body `{ "message": "Not implemented" }`.

| File                                   | Route                                       | Method |
| -------------------------------------- | ------------------------------------------- | ------ |
| `GetFailedCtrsEndpoint.cs`             | `/api/v1/ctr-monitoring/failed`             | GET    |
| `GetCtrsForRegenerationEndpoint.cs`    | `/api/v1/ctr-monitoring/regeneration`       | GET    |
| `GetCtrsRequiringAttentionEndpoint.cs` | `/api/v1/ctr-monitoring/attention`          | GET    |
| `GenerateFormEndpoint.cs`              | `/api/v1/ctr-management/generate-form`      | POST   |
| `RegenerateCtrEndpoint.cs`             | `/api/v1/ctr-management/regenerate-ctr`     | POST   |
| `GetPaychexClientStatusEndpoint.cs`    | `/api/v1/paychex/clients/{clientId}/status` | GET    |
| `SetPaychexClientStatusEndpoint.cs`    | `/api/v1/paychex/clients/{clientId}/status` | PUT    |

Example pattern:

```csharp
// GetFailedCtrsEndpoint.cs
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

### 3.7 `appsettings.json` shape

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

### 3.8 Acceptance criteria — backend

- [ ] `dotnet build` passes with zero errors and zero warnings on the solution.
- [ ] `dotnet run` starts the API and Swagger UI is reachable at `https://localhost:{port}/swagger`.
- [ ] All 7 routes appear in Swagger under their respective tags.
- [ ] Each route returns `501` when called.
- [ ] `GlobalExceptionMiddleware` is registered and unhandled exceptions return `ProblemDetails`.

---

## 4. Frontend — React Skeleton

### 4.1 Scaffold

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

Resulting location: `src/frontend/`

### 4.2 Dependencies

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

> **Note:** Replace `@mui/material` with the Paycor Design System package when the internal registry is available. MUI is the drop-in stand-in for now.

### 4.3 Directory structure

```
src/frontend/src/
├── app/
│   ├── App.tsx                  # Wraps QueryClientProvider + RouterProvider
│   ├── router.tsx               # createBrowserRouter — all routes
│   └── AppShell.tsx             # Layout: sidebar + header + <Outlet />
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
    │   └── axiosClient.ts       # Axios instance + env interceptor
    └── environment/
        └── EnvironmentContext.tsx  # Context + provider + hook
```

### 4.4 `EnvironmentContext`

File: `shared/environment/EnvironmentContext.tsx`

```tsx
// Exposes:
type AppEnvironment = 'QSB' | 'STAGING' | 'PROD';

interface EnvironmentContextValue {
  environment: AppEnvironment;
  setEnvironment: (env: AppEnvironment) => void;
}

export const EnvironmentContext = createContext<EnvironmentContextValue>(...);
export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ...;
export const useEnvironment = () => useContext(EnvironmentContext);
```

State is initialised to `'QSB'`. The provider wraps the entire app (inside `App.tsx`).

### 4.5 Axios client + interceptor

File: `shared/api/axiosClient.ts`

```ts
import axios from "axios";
// getEnvironment() reads from EnvironmentContext store or a module-level ref
// set by a sync call from the provider

export const axiosClient = axios.create({
  baseURL: "/api/v1",
});

axiosClient.interceptors.request.use((config) => {
  config.params = { ...config.params, environment: getEnvironment() };
  return config;
});
```

> The interceptor must inject the `environment` query param on **every** outgoing request. Use a module-level variable updated by the `EnvironmentProvider` on each render (or via `useEffect`) to avoid breaking React's rules of hooks inside non-hook code.

### 4.6 `AppShell`

File: `app/AppShell.tsx`

Layout composition:

```
┌──────────────────────────────────────────────────────────────┐
│  Header (AppBar)                                             │
│    Left: App title "QuarterEnd Tax Support Utils"            │
│    Right: Environment selector  [QSB ▾]                     │
├────────────┬─────────────────────────────────────────────────┤
│  Sidebar   │  Main content (<Outlet />)                      │
│  (Drawer)  │                                                 │
│            │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

**Sidebar navigation items** (use MUI `List` / `ListItemButton` / `Collapse` for groups):

```
Dashboard                       → /
─────────────────────────────────
CTR Monitoring   (group header)
  Failed CTRs                   → /ctr-monitoring/failed
  For Regeneration              → /ctr-monitoring/regeneration
  Requires Attention            → /ctr-monitoring/attention
─────────────────────────────────
CTR Management   (group header)
  Generate Form                 → /ctr-management/generate-form
  Regenerate CTR                → /ctr-management/regenerate-ctr
─────────────────────────────────
Paychex          (group header)
  Client Status                 → /paychex/status
```

Active route must be visually highlighted. Groups are always expanded (no collapse toggle needed at this stage).

**Environment selector** (in header):

- MUI `Select` or `ToggleButtonGroup` with options `QSB`, `STAGING`, `PROD`
- On change: calls `setEnvironment(...)` from `useEnvironment()`
- Visually distinct: different colour per env is recommended (e.g. green = QSB, amber = STAGING, red = PROD) but not required for skeleton

### 4.7 Placeholder pages

Each page is a minimal React component:

```tsx
// Example — FailedCtrsPage.tsx
export default function FailedCtrsPage() {
  return (
    <Box>
      <Typography variant="h5">Failed CTRs</Typography>
      <Typography color="text.secondary">Feature coming soon.</Typography>
    </Box>
  );
}
```

| Page component            | Route                            | Heading text             |
| ------------------------- | -------------------------------- | ------------------------ |
| `DashboardPage`           | `/`                              | Dashboard                |
| `FailedCtrsPage`          | `/ctr-monitoring/failed`         | Failed CTRs              |
| `CtrsForRegenerationPage` | `/ctr-monitoring/regeneration`   | CTRs for Regeneration    |
| `CtrsAttentionPage`       | `/ctr-monitoring/attention`      | CTRs Requiring Attention |
| `GenerateFormPage`        | `/ctr-management/generate-form`  | Generate Form            |
| `RegenerateCtrPage`       | `/ctr-management/regenerate-ctr` | Regenerate CTR           |
| `PaychexClientStatusPage` | `/paychex/status`                | Paychex Client Status    |

### 4.8 Router (`router.tsx`)

Use `createBrowserRouter` with a single layout route (`AppShell`) and all 7 feature routes + dashboard as children:

```tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "ctr-monitoring/failed", element: <FailedCtrsPage /> },
      {
        path: "ctr-monitoring/regeneration",
        element: <CtrsForRegenerationPage />,
      },
      { path: "ctr-monitoring/attention", element: <CtrsAttentionPage /> },
      { path: "ctr-management/generate-form", element: <GenerateFormPage /> },
      { path: "ctr-management/regenerate-ctr", element: <RegenerateCtrPage /> },
      { path: "paychex/status", element: <PaychexClientStatusPage /> },
    ],
  },
]);
```

### 4.9 `App.tsx`

```tsx
export default function App() {
  return (
    <EnvironmentProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </EnvironmentProvider>
  );
}
```

`queryClient` is a `new QueryClient()` defined at module level in `App.tsx`.

### 4.10 Vite proxy (development)

Add a dev server proxy in `vite.config.ts` so `/api/v1/*` is forwarded to the .NET API (avoids CORS during local development):

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

### 4.11 Acceptance criteria — frontend

- [ ] `npm run dev` starts without errors; app loads in the browser.
- [ ] Sidebar shows all 8 navigation items (Dashboard + 7 features) under correct group headings.
- [ ] Clicking each nav item navigates to the correct placeholder page and highlights the active link.
- [ ] Environment selector (QSB / STAGING / PROD) is visible in the header and changing it updates the context.
- [ ] `axiosClient` interceptor appends `?environment=QSB` (or selected value) to requests — verifiable in browser DevTools.

---

## 5. Definition of Done

- Both projects build and run locally with zero errors.
- All 7 backend routes return `501` in Swagger.
- All 7 frontend routes render a placeholder page with correct heading text.
- Sidebar navigation and environment selector work as described.
- No hardcoded secrets in committed code.
