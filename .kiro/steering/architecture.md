# Architecture

Keep the application modular.

The web interface, scanner engine, compliance rule packs, reporters, and CLI must remain separate modules.

The scanner engine must not depend on React or Next.js.

The CLI and web application must consume the same scanner engine.

Compliance frameworks must use independent rule packs.

Every rule must be independently testable.

Prefer TypeScript AST analysis over regular expressions when program structure can be inspected directly.

Components must remain focused and file based.

Do not create giant React components.

Do not place unrelated scanner logic in a single file.
