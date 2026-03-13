# Spec Tasks

## Tasks

- [x] 1. Scaffold .NET solution and projects
  - [x] 1.1 Create `src/` directory and run `dotnet new sln` to create `AITrail.QuarterEndTaxSupportUtils.sln`
  - [x] 1.2 Scaffold `AITrail.QuarterEndTaxSupportUtils.API` using `dotnet new webapi --use-minimal-apis` targeting `net10.0`
  - [x] 1.3 Scaffold `AITrail.QuarterEndTaxSupportUtils.Business` using `dotnet new classlib` targeting `net10.0`
  - [x] 1.4 Add both projects to the solution with `dotnet sln add`
  - [x] 1.5 Add project reference from `API` to `Business` with `dotnet add reference`
  - [x] 1.6 Add NuGet packages: `FluentValidation.AspNetCore` to API; `Dapper`, `Microsoft.Data.SqlClient`, `FluentValidation` to Business
  - [x] 1.7 Verify `dotnet build` passes on the solution with zero errors and zero warnings

- [x] 2. Implement Business project common infrastructure
  - [x] 2.1 Create `Common/Environment/AppEnvironment.cs` with enum values `QSB`, `Staging`, `Prod`
  - [x] 2.2 Create `Common/Exceptions/NotFoundException.cs` as a custom exception extending `Exception`
  - [x] 2.3 Create `Common/Environment/EnvironmentConnectionResolver.cs` accepting `IConfiguration`; implement `GetConnectionString` and `GetDownstreamBaseUrl` reading from config keys; throw `NotSupportedException` for unknown enum values
  - [x] 2.4 Create `Common/Infrastructure/SqlConnectionFactory.cs` accepting `EnvironmentConnectionResolver`; implement `CreateConnection` that resolves the connection string and returns a new (unopened) `SqlConnection`
  - [x] 2.5 Verify `dotnet build` on Business project passes with zero errors and zero warnings

- [x] 3. Build API project — middleware, wiring, and configuration
  - [x] 3.1 Create `Middleware/GlobalExceptionMiddleware.cs`: catch `ValidationException` → 400, `NotFoundException` → 404, all other exceptions → 500; return RFC 7807 `ProblemDetails` without exposing stack traces or exception details in responses
  - [x] 3.2 Update `appsettings.json` with the required `ConnectionStrings`, `DownstreamServices`, `Logging`, and `AllowedHosts` placeholder shape
  - [x] 3.3 Wire `Program.cs`: register `EnvironmentConnectionResolver` and `SqlConnectionFactory` as singletons; register FluentValidation pipeline; register `GlobalExceptionMiddleware`; add `Scalar.AspNetCore` for API browsing UI (replaces Swashbuckle — native .NET 10 approach)
  - [x] 3.4 Verify `dotnet run` starts and API reference UI is reachable at `/scalar/v1`

- [x] 4. Create skeleton API endpoint files
  - [x] 4.1 Create `Endpoints/GetFailedCtrsEndpoint.cs` — `GET /api/v1/ctr-monitoring/failed` returning `501`
  - [x] 4.2 Create `Endpoints/GetCtrsForRegenerationEndpoint.cs` — `GET /api/v1/ctr-monitoring/regeneration` returning `501`
  - [x] 4.3 Create `Endpoints/GetCtrsRequiringAttentionEndpoint.cs` — `GET /api/v1/ctr-monitoring/attention` returning `501`
  - [x] 4.4 Create `Endpoints/GenerateFormEndpoint.cs` — `POST /api/v1/ctr-management/generate-form` returning `501`
  - [x] 4.5 Create `Endpoints/RegenerateCtrEndpoint.cs` — `POST /api/v1/ctr-management/regenerate-ctr` returning `501`
  - [x] 4.6 Create `Endpoints/GetPaychexClientStatusEndpoint.cs` — `GET /api/v1/paychex/clients/{clientId}/status` returning `501`
  - [x] 4.7 Create `Endpoints/SetPaychexClientStatusEndpoint.cs` — `PUT /api/v1/paychex/clients/{clientId}/status` returning `501`
  - [x] 4.8 Register all 7 endpoint extension methods in `Program.cs`
  - [x] 4.9 Verify all 7 routes appear in Swagger under their correct tags and each returns `501` when called

- [x] 5. Scaffold React + Vite frontend app
  - [x] 5.1 Run `npx create-vite@5 frontend --template react-ts` inside `src/` to create the app at `src/frontend/`
  - [x] 5.2 Install dependencies: `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`, `react-router-dom`, `@tanstack/react-query`, `axios`
  - [x] 5.3 Configure Vite dev proxy in `vite.config.ts` to forward `/api/*` to `https://localhost:5001`
  - [x] 5.4 Verify `npm run build` passes cleanly

- [x] 6. Implement frontend shared infrastructure
  - [x] 6.1 Create `shared/environment/EnvironmentContext.tsx`: define `AppEnvironment` type (`'QSB' | 'STAGING' | 'PROD'`), context, `EnvironmentProvider` (initial state `'QSB'`), and `useEnvironment` hook; update module-level ref used by Axios on each provider render
  - [x] 6.2 Create `shared/api/axiosClient.ts`: create Axios instance with `baseURL: '/api/v1'`; add request interceptor that appends `environment` query param from the module-level ref
  - [x] 6.3 Verify the interceptor appends `?environment=QSB` to requests in browser DevTools

- [x] 7. Build AppShell layout and placeholder pages
  - [x] 7.1 Create all 7 placeholder page components (`DashboardPage`, `FailedCtrsPage`, `CtrsForRegenerationPage`, `CtrsAttentionPage`, `GenerateFormPage`, `RegenerateCtrPage`, `PaychexClientStatusPage`) each rendering the correct heading text and "Feature coming soon." body
  - [x] 7.2 Create `app/router.tsx` using `createBrowserRouter` with `AppShell` as the layout route and all 8 child routes (dashboard index + 7 features)
  - [x] 7.3 Create `app/AppShell.tsx` with MUI `AppBar` header (title + environment selector) and MUI `Drawer` sidebar with grouped navigation items; highlight active route
  - [x] 7.4 Create `app/App.tsx` wrapping `EnvironmentProvider` → `QueryClientProvider` → `RouterProvider`; define module-level `QueryClient`
  - [x] 7.5 Verify all 8 navigation items are visible in the sidebar, clicking each navigates to the correct placeholder page with the correct heading, and the environment selector updates context
