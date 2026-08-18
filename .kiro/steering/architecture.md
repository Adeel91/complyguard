# Architecture

Keep all layers modular.

## Deterministic scanner

src/scanner

Must remain independent from React, Next.js and AI providers.

## Repository intelligence

src/intelligence

Profiles repository technologies, source areas and risk surfaces.

## Reporting

src/reporting

Builds deterministic reports from real scan output.

## Deep Review

src/ai

Contains provider contracts, source context construction and Kiro integration.

AI providers must never be imported into the deterministic scanner.

## Server

src/server

Handles secure external repository ingestion.

## Web

src/app and src/components

Render repository intelligence, deterministic findings and optional deep review results.

## Verification invariant

AI output is advisory.

Deterministic source evidence remains the source of truth.

A remediation is considered verified only after a deterministic rescan confirms the original finding no longer exists.

## Code quality

Components remain file based and focused.

Do not place unrelated logic in giant files.

Do not create duplicate scanner engines.

Do not create fake demo responses.
