# Spec Requirements Document

> Spec: Skeleton Project Scaffold — Foundation Sprint
> Created: 2026-03-13
> Status: Planning

## Overview

Stand up two compiling, runnable skeleton projects — a .NET 10 Minimal API backend and a React 19 + Vite frontend — configured as the foundation for the QuarterEndTax Support Utils application. All 7 feature areas will have navigable placeholder pages in the UI and stubbed endpoint files in the API; no real business logic, queries, or auth are implemented at this stage.

## User Stories

### Developer Navigates the Shell and Feature Pages

As a frontend developer, I want a fully wired React app shell with sidebar navigation and placeholder pages for every feature area, so that I can begin building real feature components against a consistent layout from day one.

The developer launches the app with `npm run dev`, sees an `AppShell` with a persistent sidebar listing Dashboard, CTR Monitoring (3 items), CTR Management (2 items), and Paychex (1 item), and can click each nav item to navigate to a placeholder page showing the feature name. An environment selector (QSB / STAGING / PROD) in the header allows switching contexts, and the selected environment is automatically appended as a query param to all Axios requests.

### Developer Calls a Skeleton API Route

As a backend developer, I want one endpoint stub per feature area registered in `Program.cs`, so that I can begin wiring up real handlers against a consistent Minimal API structure without needing to set up routing from scratch.

The developer opens Swagger UI, sees all 7 routes grouped under their respective tags, and calling any route returns HTTP 501 with `{ "message": "Not implemented" }`. Unhandled exceptions anywhere in the API return RFC 7807 `ProblemDetails` via global exception middleware.

## Spec Scope

1. **Backend .NET solution** - Two-project solution (`API` + `Business`) scaffolded with correct target framework, NuGet packages, and project references.
2. **Shared Business infrastructure** - `AppEnvironment` enum, `EnvironmentConnectionResolver`, and `SqlConnectionFactory` added to the Business project.
3. **Global exception middleware** - Catches `ValidationException` (400), `NotFoundException` (404), and all other exceptions (500), returning RFC 7807 `ProblemDetails`.
4. **Skeleton API endpoints** - Seven static endpoint classes, each returning `501 Not Implemented`, registered via extension methods in `Program.cs`.
5. **React + Vite frontend app** - TypeScript app with MUI, React Router v7, TanStack Query, and Axios installed; `EnvironmentContext`, `axiosClient`, `AppShell`, and all placeholder pages wired together.

## Out of Scope

- Real Dapper queries or SQL Server connectivity
- `HttpClient` typed service implementations
- FluentValidation validators (pipeline wiring only — no validators)
- Authentication and authorization (Entra ID / MSAL / Easy Auth)
- Feature-level UI components (tables, forms, filters, modals)
- Unit or integration tests

## Expected Deliverable

1. `dotnet build` passes on the solution with zero errors and zero warnings; Swagger UI is reachable at `https://localhost:{port}/swagger` with all 7 routes appearing under their correct tags and each returning `501`.
2. `npm run dev` starts without errors; the app loads in the browser with a working sidebar, environment selector in the header, and all 8 navigation targets (Dashboard + 7 features) rendering placeholder pages with correct heading text.
3. Axios interceptor appends `?environment=<selected>` to every outgoing request, verifiable in browser DevTools.
