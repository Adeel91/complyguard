# ComplyGuard Design

## Pipeline

Repository

→ Secure ingestion

→ Repository intelligence

→ Deterministic AST scanner

→ Evidence backed findings

→ Observed engineering posture

→ Optional Kiro Deep Review

→ Remediation plan

→ Deterministic rescan

## Web layer

Next.js and React provide repository ingestion and evidence visualization.

## Scanner layer

The scanner remains deterministic and independent from React, Next.js and AI providers.

## Intelligence layer

src/intelligence profiles technologies, source areas and risk surfaces using actual repository content.

## Scoring layer

src/scanner/scoring derives observed engineering posture only from deterministic findings.

It does not calculate legal compliance.

## Reporting layer

src/reporting creates deterministic executive and technical analysis reports.

## Deep Review layer

src/ai defines provider independent contracts.

The Kiro integration will implement ComplianceIntelligenceProvider.

The deep reasoning layer receives real evidence and surrounding source context.

It does not replace deterministic scanning.

## Verification

A remediation is successful only when the deterministic rescan confirms that the original finding is gone.

## CLI

The CLI and web continue to share the same scanner engine.

## Testing

Vitest covers deterministic rules, repository profiling, scoring, source context creation and deep review contracts.
