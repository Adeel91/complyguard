# ComplyGuard Requirements

## Source ingestion

The system shall analyze real TypeScript and JavaScript projects.

The local CLI shall accept an actual project directory.

The web application shall later support real repository ingestion.

## Static analysis

The scanner shall construct an abstract syntax tree from source code.

Compliance rules shall inspect actual syntax tree structures.

The scanner shall report exact files and locations for findings.

## Frameworks

The first release shall contain meaningful rule packs for:

GDPR

SOC 2

ISO 27001

## Findings

Every finding shall contain:

Rule identifier

Framework

Mapped control

Severity

Title

Description

Evidence

File

Line

Column

Remediation guidance

## Interfaces

The same scanner engine shall power both the CLI and web application.

The CLI shall support machine readable JSON output.

The application shall later support SARIF output.

## Accuracy

No finding may be generated solely for demonstration purposes.

No compliance score may be fabricated.

Every scanner rule shall have tests showing vulnerable and safe examples.

## Product positioning

ComplyGuard detects software patterns associated with compliance risk.

It does not provide legal advice or compliance certification.
