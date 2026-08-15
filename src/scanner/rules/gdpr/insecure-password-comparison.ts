import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import { tokenizeIdentifier } from "@/scanner/utils/names";

const CREDENTIAL_TERMS = new Set([
  "password",
  "passwd",
  "secret",
  "apikey",
  "accesstoken",
  "refreshtoken",
  "authorization",
]);

function isGuardValue(node: Node): boolean {
  const kind = node.getKind();

  return (
    kind === SyntaxKind.NullKeyword ||
    kind === SyntaxKind.UndefinedKeyword ||
    kind === SyntaxKind.TrueKeyword ||
    kind === SyntaxKind.FalseKeyword ||
    kind === SyntaxKind.NumericLiteral ||
    (Node.isIdentifier(node) && node.getText() === "undefined")
  );
}

function expressionName(node: Node): string | null {
  if (Node.isIdentifier(node)) {
    return node.getText();
  }

  if (Node.isPropertyAccessExpression(node)) {
    return node.getName();
  }

  if (Node.isElementAccessExpression(node)) {
    const argument = node.getArgumentExpression();

    if (argument && Node.isStringLiteral(argument)) {
      return argument.getLiteralValue();
    }
  }

  return null;
}

function isCredentialExpression(node: Node): boolean {
  const name = expressionName(node);

  if (!name) {
    return false;
  }

  const tokens = tokenizeIdentifier(name);

  if (tokens.some((token) => CREDENTIAL_TERMS.has(token))) {
    return true;
  }

  for (let index = 0; index < tokens.length - 1; index++) {
    if (CREDENTIAL_TERMS.has(tokens[index] + tokens[index + 1])) {
      return true;
    }
  }

  return false;
}

function looksLikeCredentialLiteral(node: Node): boolean {
  if (!Node.isStringLiteral(node)) {
    return false;
  }

  const value = node.getLiteralValue();

  if (value.length < 8) {
    return false;
  }

  return (
    /^Bearer\s+/i.test(value) ||
    /^sk_[A-Za-z0-9]+$/.test(value) ||
    /^[A-Za-z0-9+/]{16,}={0,2}$/.test(value)
  );
}

export const insecurePasswordComparisonRule: ComplianceRule = {
  id: "GDPR-AUTH-001",
  framework: "gdpr",
  control: "GDPR Article 32",
  title: "Direct sensitive credential comparison",

  analyze(sourceFile) {
    const findings = [];

    for (const binary of sourceFile.getDescendantsOfKind(
      SyntaxKind.BinaryExpression,
    )) {
      const operator = binary.getOperatorToken().getKind();

      if (
        operator !== SyntaxKind.EqualsEqualsEqualsToken &&
        operator !== SyntaxKind.EqualsEqualsToken
      ) {
        continue;
      }

      const left = binary.getLeft();
      const right = binary.getRight();

      if (isGuardValue(left) || isGuardValue(right)) {
        continue;
      }

      const leftCredential = isCredentialExpression(left);
      const rightCredential = isCredentialExpression(right);

      const directCredentialComparison =
        leftCredential && rightCredential;

      const credentialLiteralComparison =
        (leftCredential && looksLikeCredentialLiteral(right)) ||
        (rightCredential && looksLikeCredentialLiteral(left));

      if (
        !directCredentialComparison &&
        !credentialLiteralComparison
      ) {
        continue;
      }

      findings.push(
        createFinding({
          node: binary,
          ruleId: "GDPR-AUTH-001",
          framework: "gdpr",
          control: "GDPR Article 32",
          severity: "high",
          title: "Direct sensitive credential comparison",
          description:
            "A credential appears to be compared directly using equality rather than a dedicated verification mechanism.",
          remediation:
            "Use an appropriate credential verification mechanism such as password hashing verification or a constant time secret comparison.",
        }),
      );
    }

    return findings;
  },
};
