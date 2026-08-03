export type LifeClaimInsurer = {
  id: string;
  name: string;
  /** Illustrative claims acceptance rate 0–100. */
  acceptanceRate: number;
  /** Average weeks to decision. */
  avgWeeksToDecision: number;
  /** Complaint rate per 100 claims (illustrative). */
  complaintsPer100: number;
};

export type LifeClaimsComparisonResult = {
  insurers: LifeClaimInsurer[];
  bestAcceptance: string;
  fastest: string;
  fewestComplaints: string;
};

/** Built-in illustrative dataset — not real insurer statistics. */
export const SAMPLE_LIFE_CLAIM_INSURERS: LifeClaimInsurer[] = [
  {
    id: "a",
    name: "Insurer A (sample)",
    acceptanceRate: 92,
    avgWeeksToDecision: 8,
    complaintsPer100: 1.2,
  },
  {
    id: "b",
    name: "Insurer B (sample)",
    acceptanceRate: 88,
    avgWeeksToDecision: 6,
    complaintsPer100: 2.1,
  },
  {
    id: "c",
    name: "Insurer C (sample)",
    acceptanceRate: 95,
    avgWeeksToDecision: 11,
    complaintsPer100: 0.9,
  },
];

/**
 * Rank sample insurers on acceptance, speed, and complaints.
 * Educational comparison only — replace with live data if publishing for real decisions.
 */
export function compareLifeClaims(
  insurers: LifeClaimInsurer[] = SAMPLE_LIFE_CLAIM_INSURERS,
): LifeClaimsComparisonResult {
  const list = [...insurers];
  const bestAcceptance = [...list].sort(
    (a, b) => b.acceptanceRate - a.acceptanceRate,
  )[0].name;
  const fastest = [...list].sort(
    (a, b) => a.avgWeeksToDecision - b.avgWeeksToDecision,
  )[0].name;
  const fewestComplaints = [...list].sort(
    (a, b) => a.complaintsPer100 - b.complaintsPer100,
  )[0].name;

  return { insurers: list, bestAcceptance, fastest, fewestComplaints };
}
