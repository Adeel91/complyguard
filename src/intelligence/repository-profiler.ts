import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import {
  relative,
  resolve,
} from "node:path";

import {
  detectTechnologies,
} from "@/intelligence/technology-detector";
import type {
  RepositoryProfile,
  RiskSurface,
  RiskSurfaceId,
} from "@/intelligence/types";

const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo",
]);

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
]);

function extensionOf(path: string): string {
  const match = path.match(/\.[^.]+$/);

  return match?.[0].toLowerCase() ?? "";
}

function collectFiles(
  rootPath: string,
  currentPath = rootPath,
  output: string[] = [],
): string[] {
  if (output.length >= 5000) {
    return output;
  }

  for (const entry of readdirSync(currentPath)) {
    if (IGNORED_DIRECTORIES.has(entry)) {
      continue;
    }

    const absolutePath = resolve(currentPath, entry);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      collectFiles(
        rootPath,
        absolutePath,
        output,
      );
      continue;
    }

    output.push(absolutePath);

    if (output.length >= 5000) {
      break;
    }
  }

  return output;
}

function readDependencies(
  packagePath: string,
): Record<string, string> {
  try {
    const parsed = JSON.parse(
      readFileSync(
        packagePath,
        "utf8",
      ),
    ) as {
      dependencies?: Record<
        string,
        string
      >;
      devDependencies?: Record<
        string,
        string
      >;
    };

    return {
      ...parsed.dependencies,
      ...parsed.devDependencies,
    };
  } catch {
    return {};
  }
}

function unique(
  values: string[],
): string[] {
  return Array.from(
    new Set(values),
  );
}

function classifySourceAreas(
  rootPath: string,
  files: string[],
) {
  const areas = {
    authentication: [] as string[],
    api: [] as string[],
    database: [] as string[],
    payments: [] as string[],
    security: [] as string[],
  };

  for (const file of files) {
    const rel = relative(
      rootPath,
      file,
    ).replaceAll("\\", "/");

    const lower = rel.toLowerCase();

    if (
      /auth|login|session|jwt|oauth|password/.test(
        lower,
      )
    ) {
      areas.authentication.push(
        rel,
      );
    }

    if (
      /api|route|controller|handler|server/.test(
        lower,
      )
    ) {
      areas.api.push(rel);
    }

    if (
      /db|database|prisma|repository|model|schema/.test(
        lower,
      )
    ) {
      areas.database.push(rel);
    }

    if (
      /payment|billing|stripe|checkout|invoice/.test(
        lower,
      )
    ) {
      areas.payments.push(rel);
    }

    if (
      /security|crypto|secret|token|permission|role|guard/.test(
        lower,
      )
    ) {
      areas.security.push(rel);
    }
  }

  return {
    authentication:
      unique(
        areas.authentication,
      ).slice(0, 25),
    api: unique(
      areas.api,
    ).slice(0, 25),
    database:
      unique(
        areas.database,
      ).slice(0, 25),
    payments:
      unique(
        areas.payments,
      ).slice(0, 25),
    security:
      unique(
        areas.security,
      ).slice(0, 25),
  };
}

function buildRiskSurfaces(
  profile: Omit<
    RepositoryProfile,
    "riskSurfaces"
  >,
): RiskSurface[] {
  const surfaces = new Map<
    RiskSurfaceId,
    RiskSurface
  >();

  function add(
    id: RiskSurfaceId,
    label: string,
    reason: string,
  ) {
    const existing =
      surfaces.get(id);

    if (existing) {
      existing.reasons.push(
        reason,
      );
      return;
    }

    surfaces.set(id, {
      id,
      label,
      reasons: [reason],
    });
  }

  for (const technology of profile.technologies) {
    switch (
      technology.category
    ) {
      case "authentication":
        add(
          "authentication",
          "Authentication",
          `${technology.name} detected through ${technology.evidence}`,
        );
        break;

      case "database":
        add(
          "database",
          "Persistent data",
          `${technology.name} database technology detected`,
        );

        add(
          "personal-data",
          "Personal data handling",
          "Database backed application may persist user information",
        );
        break;

      case "payment":
        add(
          "payments",
          "Payments",
          `${technology.name} payment integration detected`,
        );
        break;

      case "logging":
        add(
          "logging",
          "Logging and observability",
          `${technology.name} logging or monitoring integration detected`,
        );
        break;

      default:
        break;
    }
  }

  if (
    profile.sourceAreas.authentication
      .length > 0
  ) {
    add(
      "authentication",
      "Authentication",
      `${profile.sourceAreas.authentication.length} authentication related source files detected`,
    );
  }

  if (
    profile.sourceAreas.api.length >
    0
  ) {
    add(
      "external-api",
      "API surface",
      `${profile.sourceAreas.api.length} API or server related source files detected`,
    );
  }

  if (
    profile.sourceAreas.payments
      .length > 0
  ) {
    add(
      "payments",
      "Payments",
      `${profile.sourceAreas.payments.length} payment related source files detected`,
    );
  }

  if (
    profile.sourceAreas.security
      .length > 0
  ) {
    add(
      "cryptography",
      "Security sensitive code",
      `${profile.sourceAreas.security.length} security sensitive source files detected`,
    );
  }

  add(
    "server-runtime",
    "Application runtime",
    "Node.js JavaScript or TypeScript application",
  );

  return Array.from(
    surfaces.values(),
  );
}

export function profileRepository(
  rootPath: string,
): RepositoryProfile {
  if (!existsSync(rootPath)) {
    throw new Error(
      `Repository path does not exist: ${rootPath}`,
    );
  }

  const allFiles =
    collectFiles(rootPath);

  const sourceFiles =
    allFiles.filter((file) =>
      SOURCE_EXTENSIONS.has(
        extensionOf(file),
      ),
    );

  const tsCount =
    sourceFiles.filter((file) =>
      [".ts", ".tsx"].includes(
        extensionOf(file),
      ),
    ).length;

  const jsCount =
    sourceFiles.filter((file) =>
      [".js", ".jsx"].includes(
        extensionOf(file),
      ),
    ).length;

  const packageFiles =
    allFiles.filter(
      (file) =>
        file.endsWith(
          "package.json",
        ),
    );

  const dependencies =
    packageFiles.reduce<
      Record<string, string>
    >(
      (accumulator, packageFile) => ({
        ...accumulator,
        ...readDependencies(
          packageFile,
        ),
      }),
      {},
    );

  const sourceAreas =
    classifySourceAreas(
      rootPath,
      sourceFiles,
    );

  const withoutRisk: Omit<
    RepositoryProfile,
    "riskSurfaces"
  > = {
    primaryLanguage:
      tsCount > 0 &&
      jsCount > 0
        ? "mixed"
        : tsCount > 0
          ? "typescript"
          : jsCount > 0
            ? "javascript"
            : "unknown",
    sourceFileCount:
      sourceFiles.length,
    packageFiles:
      packageFiles.map(
        (file) =>
          relative(
            rootPath,
            file,
          ).replaceAll("\\", "/"),
      ),
    technologies:
      detectTechnologies(
        dependencies,
      ),
    sourceAreas,
  };

  return {
    ...withoutRisk,
    riskSurfaces:
      buildRiskSurfaces(
        withoutRisk,
      ),
  };
}
