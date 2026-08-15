import type { ComplianceRule } from "@/scanner/types/rule";

export class RuleRegistry {
  private readonly rules = new Map<string, ComplianceRule>();

  register(rule: ComplianceRule): void {
    if (this.rules.has(rule.id)) {
      throw new Error(`Compliance rule already registered: ${rule.id}`);
    }

    this.rules.set(rule.id, rule);
  }

  registerMany(rules: ComplianceRule[]): void {
    for (const rule of rules) {
      this.register(rule);
    }
  }

  all(): ComplianceRule[] {
    return Array.from(this.rules.values());
  }

  size(): number {
    return this.rules.size;
  }
}
