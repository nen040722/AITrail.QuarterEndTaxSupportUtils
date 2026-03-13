# Technical Stack

## Backend

application_framework: .NET 10 (Minimal API)
database_system: SQL Server
orm_data_access: Dapper (no EF Core)
validation: FluentValidation
logging: Microsoft.Extensions.Logging (structured, ILogger)
error_handling: Global exception middleware — RFC 7807 ProblemDetails
http_client: System.Net.Http.HttpClient (typed, env-aware — GenerateFormService, RegenerateCtrService)

## Frontend

javascript_framework: React 19
build_tool: Vite
ui_component_library: Paycor Design System (MUI-based)
state_data_fetching: TanStack Query (React Query)
routing: React Router v7
forms: React Hook Form
http_client: Axios (request interceptor injects selected environment into every request)
import_strategy: node (npm / Vite)

## Fonts & Icons

fonts_provider: MUI / Paycor Design System defaults
icon_library: MUI Icons (via Paycor Design System)

## Hosting & Infrastructure

application_hosting: Azure App Service
database_hosting: SQL Server — QSB / Staging / Prod (existing infrastructure; connection strings resolved at runtime)
asset_hosting: Azure App Service static files (served by Vite build)
secrets_management: Azure Key Vault / App Service Application Settings
deployment_solution: CI/CD pipeline (build + test)
cors: Locked to internal domain only

## Authentication

authentication: Entra ID / Easy Auth — deferred to v2 (not implemented in v1)
authorization: Role-based — deferred to v2

## Code Repository

code_repository_url: c:\Users\ntomov\source\repos\_\_poc\AITrail.QuarterEndTaxSupportUtils

## Multi-Environment Strategy

environments: QSB | Staging | Prod
environment_resolution: AppEnvironment enum (QSB, Staging, Prod); EnvironmentConnectionResolver maps env → SQL connection string or downstream HTTP base URL at runtime
environment_transport: `environment` query param or request body field on every API call; Axios interceptor injects from global React context
