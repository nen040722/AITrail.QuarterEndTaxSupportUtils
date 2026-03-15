// Modified by AI on 03/15/2026. Edit #1.
using AITrail.QuarterEndTaxSupportUtils.Business.Common.Environment;
using AITrail.QuarterEndTaxSupportUtils.Business.Features.FailedCtrs;

namespace AITrail.QuarterEndTaxSupportUtils.API.Endpoints;

public static class GetFailedCtrsEndpoint
{
    private static readonly Dictionary<string, AppEnvironment> EnvironmentMap = new(StringComparer.OrdinalIgnoreCase)
    {
        { "QSB", AppEnvironment.QSB },
        { "RC", AppEnvironment.Staging },
        { "PROD", AppEnvironment.Prod }
    };

    public static void MapGetFailedCtrsEndpoints(this WebApplication app)
    {
        app.MapGet("/api/v1/ctr-monitoring/failed", async (
            string? from,
            string? to,
            string? environment,
            IFailedCtrService service) =>
        {
            if (string.IsNullOrWhiteSpace(environment) || !EnvironmentMap.TryGetValue(environment, out var env))
                return Results.BadRequest(new { title = "Invalid environment", detail = "environment must be QSB, RC, or PROD." });

            if (!DateTimeOffset.TryParse(from, out var fromDate))
                return Results.BadRequest(new { title = "Invalid from date", detail = "from must be a valid date." });

            if (!DateTimeOffset.TryParse(to, out var toDate))
                return Results.BadRequest(new { title = "Invalid to date", detail = "to must be a valid date." });

            var results = await service.GetFailedCtrsAsync(env, fromDate, toDate);
            return Results.Ok(results);
        })
        .WithName("GetFailedCtrs")
        .WithTags("CTR Monitoring");

        app.MapGet("/api/v1/ctr-monitoring/failed/{taxPacketGuid}/forms", async (
            Guid taxPacketGuid,
            string? environment,
            IFailedCtrService service) =>
        {
            if (string.IsNullOrWhiteSpace(environment) || !EnvironmentMap.TryGetValue(environment, out var env))
                return Results.BadRequest(new { title = "Invalid environment", detail = "environment must be QSB, RC, or PROD." });

            var results = await service.GetFailedFormsForCtrAsync(env, taxPacketGuid);
            return Results.Ok(results);
        })
        .WithName("GetFailedFormsForCtr")
        .WithTags("CTR Monitoring");
    }
}
