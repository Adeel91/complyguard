# ComplyGuard

> Evidence first compliance engineering for TypeScript and JavaScript repositories.

ComplyGuard turns source code into inspectable engineering evidence associated with **GDPR, SOC 2 and ISO 27001** controls.

It does not generate a vague compliance score. It finds concrete source patterns, preserves the exact evidence, correlates overlapping framework findings into engineering root risks, and can use **Kiro Deep Review** for contextual reasoning before a deterministic rescan verifies whether remediation actually removed the original evidence.

## What ComplyGuard does

```text
Repository
    ↓
Deterministic AST scanner
    ↓
Framework findings
    ↓
Semantic root risk correlation
    ↓
Repository and bounded source context
    ↓
Optional Kiro Deep Review
    ↓
Developer remediation
    ↓
Deterministic rescan verification
```

The deterministic scanner always remains the source of truth for observable source evidence.

Kiro adds contextual reasoning on top of risks that ComplyGuard has already found.

## Why ComplyGuard

Traditional compliance workflows often separate policy documents from the engineering work that actually creates risk.

ComplyGuard brings those concerns into the source code workflow.

A finding contains:

```text
rule ID
framework
control
severity
source file
line
column
evidence
explanation
remediation
```

That makes every result inspectable by a developer instead of hiding it behind an opaque score.

## Current rule engine

ComplyGuard currently includes **18 deterministic rules**.

| Framework | Rules | Examples |
| --- | ---: | --- |
| GDPR | 5 | Sensitive logging, exposed credentials, weak authentication handling, weak security randomness, insecure personal data transport |
| SOC 2 | 5 | Hardcoded secrets, insecure transport, weak authentication randomness, missing audit events, sensitive logging |
| ISO 27001 | 8 | Hardcoded credentials, insecure HTTP, weak cryptography, dynamic code execution, disabled TLS verification, sensitive logging, weak randomness, missing audit events |
| **Total** | **18** | |

Supported source files:

```text
.ts
.tsx
.js
.jsx
```

## Semantic root risks

Several compliance frameworks can describe the same underlying engineering problem.

Without correlation, one insecure line can appear as several apparently separate problems.

ComplyGuard keeps every original framework finding while correlating related findings into a single engineering root risk.

For example:

```text
GDPR weak randomness finding
SOC 2 weak randomness finding
ISO 27001 weak randomness finding
```

can describe one underlying:

```text
weak-security-randomness
```

root risk.

The raw findings and their original framework controls remain attached to the correlated risk.

## Current vulnerable demo

ComplyGuard includes a deliberately vulnerable TypeScript application at:

```text
demo/vulnerable-app
```

The current deterministic result is:

| Metric | Result |
| --- | ---: |
| Source files | 4 |
| Scanner rules | 18 |
| Raw framework findings | 17 |
| Correlated engineering root risks | 8 |

The current root risks include:

```text
credential comparison
weak security randomness
weak cryptography
disabled TLS verification
sensitive logging
insecure transport
missing audit event
```

The demo contains real vulnerable source patterns. The findings are not mocked or hardcoded.

See:

```text
demo/results/README.md
```

for the reproducible demo workflow.

## Kiro Deep Review

Static analysis is useful because it is deterministic, but source patterns can still require context.

ComplyGuard therefore provides an optional second stage powered by **Kiro**.

Kiro receives:

```text
repository profile
selected frameworks
engineering posture
correlated root risks
bounded source context
```

Kiro may classify each supplied root risk as:

```text
confirmed
likely
false-positive
needs-review
```

A validated Deep Review can contain:

```text
root risk ID
verdict
confidence
evidence adequacy
reasoning
business impact
remediation plan
optional suggested patch
```

Kiro cannot introduce an arbitrary new root risk.

ComplyGuard validates the returned response and rejects:

```text
unknown root risk IDs
duplicate root risk reviews
missing supplied risks
invalid verdicts
invalid confidence values
invalid structured output
```

## Real Kiro runtime

The repository contains a dedicated ComplyGuard Kiro agent:

```text
.kiro/agents/complyguard-deep-review.json
.kiro/agents/complyguard-deep-review.md
```

The agent is intentionally read only.

The local Deep Review runtime uses authenticated **Kiro headless execution**.

Run a real Deep Review with:

```bash
pnpm deep-review ./path/to/project \
  --frameworks gdpr,soc2,iso27001
```

For the included vulnerable demo:

```bash
pnpm deep-review:demo \
  --output /tmp/complyguard-kiro-deep-review.json
```

A real Deep Review invokes Kiro and may consume Kiro credits.

To generate the full deterministic review request without invoking Kiro:

```bash
pnpm deep-review:demo:prompt
```

## Deterministic remediation verification

Kiro may suggest a remediation, but Kiro does not get to declare that its own suggestion worked.

ComplyGuard verifies remediation with a fresh deterministic scan.

Compare a repository before and after a change:

```bash
pnpm verify-remediation \
  ./project-before \
  ./project-after \
  --frameworks gdpr,soc2,iso27001 \
  --output verification.json
```

The verifier reports:

```text
resolved
persisting
introduced
```

### Resolved

The original deterministic evidence is no longer observed.

### Persisting

The same underlying deterministic engineering risk remains observable.

### Introduced

A deterministic engineering risk appears in the new project state that did not match an original risk.

The verifier does not rely on the old root risk ID alone because source lines can move during remediation.

It compares the relative source file, canonical engineering risk family, rule identity and normalized source evidence.

## Verification self check

The verification engine has been tested by comparing the vulnerable demo with itself.

Expected and verified result:

```text
Before: 17 signals / 8 root risks
After:  17 signals / 8 root risks

Resolved:   0
Persisting: 8
Introduced: 0
```

Because the source did not change, all eight risks correctly remain persisting.

## Web scanner

Start the application:

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000
```

The web scanner accepts a public GitHub repository URL and executes the same deterministic scanner core used by the CLI.

The hosted scanner currently accepts GitHub repository archives up to **25 MB**.

Large repositories can be scanned locally with the CLI.

## Local scanner CLI

Scan a local repository:

```bash
pnpm scan ./path/to/project
```

The CLI runs the deterministic rule engine directly against the local source tree.

## Reports

ComplyGuard supports structured scanner output suitable for developer workflows.

Current reporting includes:

```text
interactive web results
CLI output
JSON
SARIF
```

## Repository intelligence

Before contextual review, ComplyGuard profiles the repository to identify useful engineering context such as:

```text
frameworks
authentication libraries
database tooling
payment integrations
logging libraries
validation libraries
runtime
security related source areas
authentication source areas
API source areas
database source areas
payment source areas
```

This repository intelligence helps contextual review understand where a deterministic finding sits without replacing the finding itself.

## Engineering posture

ComplyGuard can calculate an observed engineering posture from deterministic findings.

The score is based on active scanner evidence and severity weighting.

It is intentionally described as **engineering posture**, not legal compliance readiness.

It is not a certification score.

## Kiro development workflow

Kiro is part of the project development process as well as the contextual review runtime.

The repository contains:

```text
.kiro/steering/
.kiro/specs/
.kiro/hooks/
.kiro/agents/
```

These are used for:

```text
product direction
architecture constraints
quality requirements
spec driven implementation
automated checks
contextual Deep Review
```

The Kiro workflow is therefore visible and reproducible inside the repository rather than existing only in the hackathon submission text.

## Architecture principles

ComplyGuard follows several strict rules.

### Deterministic evidence first

AI output never replaces the scanner evidence.

### No fabricated findings

Kiro reviews only root risks supplied by ComplyGuard.

### Preserve provenance

Framework findings remain attached to their correlated engineering root risk.

### Verify after remediation

A suggested fix is not considered resolved until a fresh deterministic scan confirms the original evidence disappeared.

### Precise claims

ComplyGuard reports engineering evidence and observed posture.

It does not claim legal certification.

## Project structure

```text
complyguard/
├── .kiro/
│   ├── agents/
│   ├── hooks/
│   ├── specs/
│   └── steering/
├── demo/
│   ├── results/
│   └── vulnerable-app/
├── src/
│   ├── ai/
│   ├── app/
│   ├── cli/
│   ├── components/
│   ├── intelligence/
│   ├── reporting/
│   ├── scanner/
│   ├── server/
│   └── verification/
└── tests/
```

## Development

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Run type checking:

```bash
pnpm typecheck
```

Run linting:

```bash
pnpm lint
```

Run tests:

```bash
pnpm test:run
```

Run the complete quality gate:

```bash
pnpm check
```

Create a production build:

```bash
pnpm build
```

## Technology

ComplyGuard is built with:

```text
Next.js 16
React 19
TypeScript 5
Tailwind CSS 4
ts-morph
Zod
Commander
Vitest
Kiro CLI
```

The scanner does not require a database.

## Hosted scanner and Kiro

The hosted web application runs the deterministic scanner.

The authenticated Kiro Deep Review workflow currently runs locally through the Kiro CLI.

The hosted application does **not** pretend that a locally authenticated Kiro session is running inside Vercel.

This separation is intentional so the public demo does not simulate functionality that is not actually available in the hosted environment.

## Important limitations

ComplyGuard identifies source code patterns associated with compliance and security controls.

A finding does **not** prove legal noncompliance.

A clean scan does **not** prove compliance.

A resolved finding means that the original deterministic scanner evidence is no longer observed.

It does **not** prove:

```text
legal compliance
certification
complete application security
absence of all vulnerabilities
```

ComplyGuard is an engineering intelligence tool, not a certification authority.
