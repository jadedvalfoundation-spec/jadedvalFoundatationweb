export const IMPACT_SECTORS = [
  "Education", "Healthcare", "Sustainability", "Community", "Youth", "Digital", "Agriculture", "Other",
] as const;

export type ImpactSector = typeof IMPACT_SECTORS[number];
