export type RiskSurfaceId =
  | "authentication"
  | "authorization"
  | "personal-data"
  | "payments"
  | "database"
  | "cryptography"
  | "logging"
  | "external-api"
  | "server-runtime";

export interface DetectedTechnology {
  name: string;
  category:
    | "framework"
    | "authentication"
    | "database"
    | "payment"
    | "logging"
    | "validation"
    | "runtime"
    | "infrastructure";
  evidence: string;
}

export interface RiskSurface {
  id: RiskSurfaceId;
  label: string;
  reasons: string[];
}

export interface RepositoryProfile {
  primaryLanguage: "typescript" | "javascript" | "mixed" | "unknown";
  sourceFileCount: number;
  packageFiles: string[];
  technologies: DetectedTechnology[];
  riskSurfaces: RiskSurface[];
  sourceAreas: {
    authentication: string[];
    api: string[];
    database: string[];
    payments: string[];
    security: string[];
  };
}
