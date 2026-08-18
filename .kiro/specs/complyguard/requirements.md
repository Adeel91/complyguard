# ComplyGuard Requirements

## Product mission

ComplyGuard is an evidence first compliance engineering system.

It combines deterministic source analysis with repository intelligence and an optional deep reasoning layer.

It does not provide legal advice or compliance certification.

## Source ingestion

The system shall analyze real TypeScript and JavaScript repositories.

The CLI shall accept an actual project directory.

The web application shall accept public GitHub repository URLs.

Downloaded repositories must be processed temporarily and securely.

## Deterministic analysis

ComplyGuard shall construct a real abstract syntax tree from source code.

Deterministic rules shall inspect actual syntax structures.

Every deterministic finding must contain exact source evidence.

No finding may exist solely for demonstration purposes.

## Repository intelligence

ComplyGuard shall profile the repository before deep analysis.

The repository profile may identify:

Application frameworks

Authentication technology

Database technology

Payment integrations

Logging systems

Source areas associated with authentication, APIs, databases, payments and security

Risk surfaces must be derived from real repository evidence.

## Frameworks

The first release supports:

GDPR

SOC 2

ISO 27001

## Findings

Every deterministic finding shall contain:

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

## Engineering posture

ComplyGuard may calculate an observed engineering posture from deterministic findings.

The methodology must be transparent.

The score must never be presented as certification or proof of compliance.

No random or fabricated score is allowed.

## Deep Review

A Deep Review may use Kiro as a reasoning layer.

Kiro receives only real deterministic findings, repository intelligence and relevant source context.

Kiro may:

Confirm a finding

Mark a finding as likely

Reject a false positive

Mark a finding as requiring human review

Explain technical reasoning

Explain business or audit impact

Create remediation steps

Suggest a patch when sufficient context exists

Kiro must not invent repository findings or source evidence.

## Verification loop

Future remediation workflow:

Deterministic scan

Repository intelligence

Kiro Deep Review

Developer approved remediation

Deterministic rescan

Compare observed posture before and after

## Interfaces

The same deterministic scanner engine powers CLI and web.

The CLI supports JSON output.

The application supports SARIF output.

## Quality

Every deterministic rule requires vulnerable and safe tests.

Repository intelligence requires automated tests.

Deep Review contracts require automated tests.

Type checking, linting, tests and production build must pass before submission.
