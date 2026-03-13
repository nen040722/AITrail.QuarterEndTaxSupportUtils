# Product Mission

## Pitch

QuarterEndTax Support Utils is an internal web application that helps Tax portfolio support engineers identify and resolve failed quarter-end form and CTR generation jobs by providing a centralised, self-serve operational surface — eliminating the need for direct database or infrastructure access.

---

## Users

### Primary Customers

- **Tax Portfolio Support Engineers:** Internal engineers who own quarter-end form generation reliability and need to identify and remediate failures quickly during time-sensitive quarter-end windows.
- **Tax Platform Operations:** Platform team members responsible for monitoring downstream form generation services and toggling client configurations (e.g. Paychex status).

### User Personas

**Support Engineer** (25–45 years old)

- **Role:** Tax Portfolio Support / Platform Engineer
- **Context:** Operates during high-stress quarter-end periods; on-call for form generation failures; required to act within tight SLAs.
- **Pain Points:** Must reach into disparate systems (SQL, scripts, downstream APIs) manually; process is undocumented and slow; risk of environment mistakes when running ad-hoc scripts.
- **Goals:** Identify and re-trigger failed CTRs in under 5 minutes; have full audit trail of every action; never touch production directly via raw SQL.

**Platform Operations Lead** (30–50 years old)

- **Role:** Senior engineer or tech lead overseeing Tax platform reliability.
- **Context:** Reviews failure trends, manages Paychex client flags, delegates remediation actions to support engineers.
- **Pain Points:** No centralised view of failure state across environments; no audit history of who changed what; no safe toggle UI for Paychex flags.
- **Goals:** Delegate safely with role-appropriate access; see historical audit log; confirm actions were taken correctly.

---

## The Problem

### Manual, Fragmented Failure Remediation

Quarter-end form and CTR generation failures require engineers to manually query multiple SQL databases, identify root causes, and run undocumented scripts to re-trigger generation. This process can take 30+ minutes per incident and is error-prone, especially under quarter-end pressure.

**Our Solution:** A unified UI where support engineers can search, filter, and bulk-action failed CTRs and forms in under 5 minutes — no SQL knowledge required.

### No Environment Safety Rails

Engineers operating across QSB, Staging, and Production environments risk executing actions against the wrong environment when using ad-hoc scripts. There is no built-in confirmation or audit trail.

**Our Solution:** Every action is scoped to an explicitly selected environment (QSB / Staging / Prod) with confirmation dialogs for destructive operations and every mutating action stored in an immutable audit log.

### No Visibility into Non-Transient Failures

Failures requiring human investigation (non-transient errors) are mixed with auto-recoverable failures (transient), leading to wasted time re-triggering items that cannot self-heal.

**Our Solution:** Distinct monitoring views separate transient failures (candidates for regeneration) from non-transient failures (requiring human attention), with visual differentiation between the two.

### Unsafe Paychex Client Flag Management

Toggling a client's Paychex status requires direct database writes today — a dangerous, untracked operation with no confirmation step.

**Our Solution:** A dedicated Paychex Client Status screen with search, a safe toggle UI, confirmation dialogs, and full audit logging of every before/after state change.

---

## Differentiators

### Unified, Environment-Aware Operations Surface

Unlike ad-hoc scripts and raw SQL sessions, QuarterEndTax Support Utils provides a single web UI where the environment (QSB / Staging / Prod) is globally selected and automatically applied to every action. This eliminates cross-environment mistakes and reduces operational complexity.

### Immutable Audit Trail by Default

Unlike current tooling that leaves no record of support actions, every mutating operation (regeneration trigger, Paychex toggle, form generation) is logged with actor, timestamp, environment, and outcome. This results in full accountability and easier post-incident review.

### Transient vs. Non-Transient Failure Separation

Unlike generic monitoring dashboards, CTR failures are categorised into auto-recoverable (transient) and investigation-required (non-transient) views — saving engineers from wasted re-trigger attempts on items that need human root cause analysis.

---

## Key Features

### Core CTR Monitoring Features

- **Failed CTR View:** Filter and inspect CTRs that failed during generation, with time-range controls and per-row error detail expansion.
- **Transient Failure Queue:** Dedicated view of CTRs eligible for automated re-generation, with bulk-select and bulk-regenerate actions.
- **Non-Transient Attention Queue:** Distinct view of CTRs requiring human investigation, with visual severity differentiation and mark-reviewed action.

### CTR Management Features

- **Form Generation Trigger:** Manually trigger generation of a single form by Form ID, with reason capture and inline result display.
- **CTR Regeneration Trigger:** Trigger full or failed-forms-only re-generation of a CTR package, with confirmation dialog showing impacted form count.
- **Bulk Regeneration:** Select multiple failed CTRs from monitoring views and regenerate in a single action.

### Paychex Management Features

- **Client Status Lookup:** Search for a client by ID or name and view current Paychex status (On/Off) with last-changed timestamp.
- **Safe Status Toggle:** Toggle a client's Paychex status with a confirmation dialog, reason capture, and immediate audit log write.

### Infrastructure Features

- **Global Environment Selector:** Persistent QSB / Staging / Prod selector in the app header — automatically injected into every API call.
- **Audit Log:** Every mutating action recorded with actor, timestamp, environment, payload, and outcome — queryable for post-incident review.
