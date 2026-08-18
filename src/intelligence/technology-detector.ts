import type { DetectedTechnology } from "@/intelligence/types";

type DependencyMap = Record<string, string>;

const TECHNOLOGIES: Array<{
  packages: string[];
  name: string;
  category: DetectedTechnology["category"];
}> = [
  {
    packages: ["next"],
    name: "Next.js",
    category: "framework",
  },
  {
    packages: ["react"],
    name: "React",
    category: "framework",
  },
  {
    packages: ["express"],
    name: "Express",
    category: "framework",
  },
  {
    packages: ["@nestjs/core"],
    name: "NestJS",
    category: "framework",
  },
  {
    packages: ["fastify"],
    name: "Fastify",
    category: "framework",
  },
  {
    packages: ["next-auth", "@auth/core"],
    name: "Auth.js",
    category: "authentication",
  },
  {
    packages: ["passport"],
    name: "Passport",
    category: "authentication",
  },
  {
    packages: ["jsonwebtoken", "jose"],
    name: "JWT",
    category: "authentication",
  },
  {
    packages: ["bcrypt", "bcryptjs", "argon2"],
    name: "Password hashing",
    category: "authentication",
  },
  {
    packages: ["prisma", "@prisma/client"],
    name: "Prisma",
    category: "database",
  },
  {
    packages: ["drizzle-orm"],
    name: "Drizzle",
    category: "database",
  },
  {
    packages: ["pg"],
    name: "PostgreSQL",
    category: "database",
  },
  {
    packages: ["mysql2"],
    name: "MySQL",
    category: "database",
  },
  {
    packages: ["mongoose", "mongodb"],
    name: "MongoDB",
    category: "database",
  },
  {
    packages: ["stripe"],
    name: "Stripe",
    category: "payment",
  },
  {
    packages: ["@paypal/checkout-server-sdk"],
    name: "PayPal",
    category: "payment",
  },
  {
    packages: ["pino"],
    name: "Pino",
    category: "logging",
  },
  {
    packages: ["winston"],
    name: "Winston",
    category: "logging",
  },
  {
    packages: ["zod"],
    name: "Zod",
    category: "validation",
  },
  {
    packages: ["@sentry/node", "@sentry/nextjs"],
    name: "Sentry",
    category: "logging",
  },
];

export function detectTechnologies(
  dependencies: DependencyMap,
): DetectedTechnology[] {
  const detected: DetectedTechnology[] = [];

  for (const technology of TECHNOLOGIES) {
    const matchedPackage = technology.packages.find(
      (packageName) => packageName in dependencies,
    );

    if (!matchedPackage) {
      continue;
    }

    detected.push({
      name: technology.name,
      category: technology.category,
      evidence: matchedPackage,
    });
  }

  detected.push({
    name: "Node.js",
    category: "runtime",
    evidence: "JavaScript/TypeScript project",
  });

  return detected;
}
