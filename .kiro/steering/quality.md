# Quality Requirements

Use strict TypeScript.

Avoid any.

Validate all external input.

Never fabricate findings.

Never fabricate source evidence.

Never fabricate compliance status.

Every deterministic rule requires positive and negative tests.

Repository intelligence must be evidence based.

Deep Review must operate only on supplied repository evidence.

False positives must be rejectable.

Every finding requires exact source location information.

Every remediation must remain advisory until verified by deterministic rescan.

The project must pass:

pnpm typecheck

pnpm lint

pnpm test:run

pnpm build

Security and compliance claims must be precise and evidence based.
