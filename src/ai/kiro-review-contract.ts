import type {
  DeepReviewRequest,
} from "@/ai/types";

function serialize(
  value: unknown,
): string {
  return JSON.stringify(
    value,
    null,
    2,
  );
}

export function buildKiroDeepReviewPrompt(
  input: DeepReviewRequest,
): string {
  return `
You are the contextual Deep Review stage of ComplyGuard.

ComplyGuard is an evidence-first compliance engineering system.

The deterministic scanner has already produced source evidence and correlated
framework-specific signals into root engineering risks.

Your responsibility is NOT to discover unrelated vulnerabilities.

Your responsibility is to review ONLY the supplied root risks using ONLY the
supplied repository profile, deterministic evidence, framework mappings and
source context.

IMPORTANT RULES

1. Review every supplied rootRiskId exactly once.

2. Never create a new root risk.

3. Never invent source code, files, line numbers, controls, frameworks,
   evidence or repository behavior.

4. Never claim that the repository is compliant, certified, secure, audit
   ready, regulatory ready or legally compliant.

5. A deterministic rule match can still be a false positive. Reject it when
   the surrounding source context shows that the matched syntax does not
   represent the engineering risk described by the root risk.

6. Use verdict "confirmed" only when the supplied context directly supports
   the risk.

7. Use verdict "likely" when the evidence strongly supports the risk but some
   relevant behavior remains outside the supplied context.

8. Use verdict "false-positive" when the context contradicts the risk or shows
   that the deterministic signal is benign in this repository context.

9. Use verdict "needs-review" when the supplied context is not sufficient to
   decide responsibly.

10. confidence must be between 0 and 1.

11. evidenceAdequacy must be exactly one of:
    "sufficient"
    "partial"
    "insufficient"

12. businessImpact must describe the practical engineering or operational
    consequence. Do not turn it into legal advice.

13. remediationPlan must contain concrete repository-relevant engineering
    steps.

14. suggestedPatch must be null unless the supplied context is sufficient to
    propose a technically responsible change.

15. Every review should include suggestedPatch.
    - Use null when no responsible patch can be proposed.
    - If a patch is present, file must be one of the supplied source files.
    - If a patch is present, include a concise rationale when possible.
    - diff must be a unified diff.
    - do not modify unrelated code.
    - do not claim the patch is verified. ComplyGuard verifies remediation
      later with a deterministic rescan.

16. Return JSON only.
    No Markdown.
    No code fences.
    No commentary before or after the JSON.

EXPECTED RESPONSE SHAPE

{
  "executiveSummary": "Short technical summary of the reviewed root risks.",
  "reviews": [
    {
      "rootRiskId": "EXACT_ID_FROM_INPUT",
      "verdict": "confirmed | likely | false-positive | needs-review",
      "confidence": 0.0,
      "evidenceAdequacy": "sufficient | partial | insufficient",
      "reasoning": "Technical explanation grounded only in supplied evidence.",
      "businessImpact": "Concrete engineering or operational consequence.",
      "remediationPlan": [
        "Concrete remediation step 1",
        "Concrete remediation step 2"
      ],
      "suggestedPatch": null
    }
  ]
}

REPOSITORY

${input.repository}

SELECTED FRAMEWORKS

${serialize(
  input.frameworks,
)}

REPOSITORY PROFILE

${serialize(
  input.repositoryProfile,
)}

OBSERVED ENGINEERING POSTURE

${serialize(
  input.posture,
)}

CORRELATED ROOT RISKS

${serialize(
  input.rootRisks,
)}

SOURCE CONTEXT

${serialize(
  input.contexts,
)}

Now review only the supplied correlated root risks and return the strict JSON
object described above.
`.trim();
}
