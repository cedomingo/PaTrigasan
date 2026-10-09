import { FULL_MIX_KEY, getAllSubjects } from "@/data";
import { DERIVATIVES_SUBJECT_ID } from "@/data/questions/derivatives";
import { INTEGRALS_SUBJECT_ID } from "@/data/questions/integrals";
import { UNIT_CIRCLE_SUBJECT_ID } from "@/data/questions/unit-circle";
import { DOMAIN_RANGE_SUBJECT_ID } from "@/data/questions/domain-range";

/**
 * The leaderboards, in the order the sub-label under "Leaderboard" cycles
 * through them (then loops). Change this one array to reorder or add boards;
 * the first entry is the default. Entries are leaderboard keys: a subject id
 * or FULL_MIX_KEY.
 */
export const LEADERBOARD_ORDER: string[] = [
  DERIVATIVES_SUBJECT_ID,
  INTEGRALS_SUBJECT_ID,
  FULL_MIX_KEY,
  UNIT_CIRCLE_SUBJECT_ID,
  DOMAIN_RANGE_SUBJECT_ID,
];

const FULL_MIX_LABEL = "Full Mix";

/** Display label for a leaderboard key — subject names come from the data layer. */
export function getLeaderboardLabel(key: string): string {
  if (key === FULL_MIX_KEY) return FULL_MIX_LABEL;
  return getAllSubjects().find((s) => s.id === key)?.name ?? key;
}
