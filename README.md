# ComplyGuard

ComplyGuard is a real static analysis application for identifying source code patterns associated with GDPR, SOC 2 and ISO 27001 engineering risks.

ComplyGuard does not certify compliance.

## Features

Real TypeScript and JavaScript AST analysis

GDPR rule pack

SOC 2 rule pack

ISO 27001 rule pack

Exact source evidence

File, line and column locations

Control mappings

Severity levels

Remediation guidance

Public GitHub repository scanning

Local CLI scanning

JSON reporting

SARIF reporting

Automated tests

Kiro specs

Kiro steering

Kiro hooks

No findings are hardcoded.

## Technology

Next.js 16

React 19

TypeScript

Tailwind CSS

shadcn UI

Node.js 24

pnpm

ts morph

Zod

Commander

Vitest

## Install

Run pnpm install.

## Web application

Run pnpm dev.

Open http://localhost:3000

## CLI

Scan a project with:

pnpm scan ./path/to/project

## Kiro

The repository contains the Kiro specification, steering files and automation hooks under the .kiro directory.

## Important limitation

ComplyGuard identifies code patterns that may be relevant to compliance controls.

A finding does not prove noncompliance.

A clean scan does not prove compliance.
