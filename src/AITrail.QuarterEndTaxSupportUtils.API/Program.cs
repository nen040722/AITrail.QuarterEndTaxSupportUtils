// Modified by AI on 03/15/2026. Edit #1.
using AITrail.QuarterEndTaxSupportUtils.API.Middleware;
using AITrail.QuarterEndTaxSupportUtils.API.Endpoints;
using AITrail.QuarterEndTaxSupportUtils.Business.Common.Environment;
using AITrail.QuarterEndTaxSupportUtils.Business.Common.Infrastructure;
using AITrail.QuarterEndTaxSupportUtils.Business.Features.FailedCtrs;
using FluentValidation;
using FluentValidation.AspNetCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Infrastructure singletons
builder.Services.AddSingleton<EnvironmentConnectionResolver>();
builder.Services.AddSingleton<SqlConnectionFactory>();
builder.Services.AddSingleton<TaxSnapshotConnectionStringProvider>();

// Feature services
builder.Services.AddScoped<IFailedCtrService, FailedCtrService>();

// FluentValidation pipeline (no validators at skeleton stage)
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// OpenAPI / Scalar
builder.Services.AddOpenApi();

var app = builder.Build();

// Global exception handling (must be first in pipeline)
app.UseMiddleware<GlobalExceptionMiddleware>();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// Feature endpoints
app.MapHealthEndpoints();
app.MapGetFailedCtrsEndpoints();
app.MapGetCtrsForRegenerationEndpoints();
app.MapGetCtrsRequiringAttentionEndpoints();
app.MapGenerateFormEndpoints();
app.MapRegenerateCtrEndpoints();
app.MapGetPaychexClientStatusEndpoints();
app.MapSetPaychexClientStatusEndpoints();

app.Run();
