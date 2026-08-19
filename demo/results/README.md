# ComplyGuard vulnerable demo

This directory documents the reproducible ComplyGuard demonstration project at:

```text
demo/vulnerable-app
```

The demo contains deliberately vulnerable TypeScript source code designed to exercise the real ComplyGuard scanner, root risk correlation, Kiro Deep Review and remediation verification workflow.

Nothing in the scanner result is mocked or hardcoded.

## Current deterministic result

| Metric | Result |
| --- | ---: |
| Source files | 4 |
| Scanner rules | 18 |
| Framework findings | 17 |
| Correlated engineering root risks | 8 |

## Current root risks

The vulnerable application currently produces engineering risks including:

```text
credential comparison
weak security randomness
weak cryptography
disabled TLS verification
sensitive logging
insecure transport
missing audit event
```

Several framework findings can belong to the same root risk.

For example, GDPR, SOC 2 and ISO 27001 rules all detect the weak security randomness used for token generation.

ComplyGuard preserves those individual findings while correlating them into one:

```text
weak-security-randomness
```

root risk.

## Pipeline

```text
demo/vulnerable-app
        ↓
18 deterministic scanner rules
        ↓
17 framework findings
        ↓
8 engineering root risks
        ↓
bounded source context
        ↓
optional Kiro Deep Review
        ↓
developer remediation
        ↓
deterministic verification
```

## Prepare a Deep Review without invoking Kiro

Run:

```bash
pnpm deep-review:demo:prompt
```

This executes:

```text
deterministic scan
repository intelligence
root risk correlation
source context generation
Deep Review request construction
```

It does not invoke Kiro.

## Run the real Kiro Deep Review

Run:

```bash
pnpm deep-review:demo \
  --output /tmp/complyguard-kiro-deep-review.json
```

This invokes the authenticated local Kiro runtime and may consume Kiro credits.

Kiro receives only root risks already produced by the deterministic ComplyGuard pipeline.

Supported verdicts are:

```text
confirmed
likely
false-positive
needs-review
```

The response can include:

```text
confidence
evidence adequacy
reasoning
business impact
remediation plan
suggested patch
```

ComplyGuard validates the response before accepting it.

Unknown root risk IDs, duplicate reviews and incomplete coverage are rejected.

## Verify remediation

After changing the vulnerable source, keep the original project state and compare it with the remediated state.

Run:

```bash
pnpm verify-remediation \
  ./project-before \
  ./project-after \
  --frameworks gdpr,soc2,iso27001 \
  --output verification.json
```

The verifier performs fresh deterministic scans of both project states.

It reports:

```text
resolved
persisting
introduced
```

## Verification self check

Comparing the unchanged vulnerable demo against itself produces:

```text
Before: 17 signals / 8 root risks
After:  17 signals / 8 root risks

Resolved:   0
Persisting: 8
Introduced: 0
```

That is the correct result because no source evidence changed.

## What this demo proves

The demo shows that ComplyGuard can:

1. Detect real source patterns with deterministic rules.
2. Preserve exact framework findings and source evidence.
3. Correlate overlapping findings into engineering root risks.
4. Prepare bounded source context for Kiro.
5. Run real contextual Kiro Deep Review locally.
6. Reject invalid or ungrounded Kiro responses.
7. Rescan code after remediation.
8. Distinguish resolved, persisting and introduced deterministic evidence.

## Scope

This demo demonstrates engineering evidence associated with compliance and security controls.

It does not provide legal certification.

A finding does not prove noncompliance.

A clean or remediated scan does not prove that the complete application is secure.
