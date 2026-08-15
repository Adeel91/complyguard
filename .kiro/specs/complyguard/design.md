# ComplyGuard Design

## Web layer

Next.js and React provide the browser interface.

The interface presents project ingestion, scan progress, findings, source evidence, framework mappings, and remediation guidance.

## Scanner layer

The scanner is framework independent TypeScript.

ts morph provides TypeScript compiler AST access.

The scanner loads project source files and evaluates registered compliance rules.

## Rule layer

Each framework owns an independent rule pack.

Rules implement a shared ComplianceRule interface.

A rule receives a SourceFile and returns zero or more ComplianceFinding values.

## Reporting layer

Structured results support the web application, CLI JSON output, and future SARIF generation.

## CLI layer

Commander provides the local command interface.

The CLI consumes exactly the same scanner engine as the web application.

## Testing

Vitest validates scanner infrastructure and every compliance rule.

Fixture projects contain actual vulnerable and compliant source examples.
