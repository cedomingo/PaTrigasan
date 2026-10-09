/**
 * Run with: npm run seed:scores
 *
 * Writes a handful of realistic-looking ScoreEntry documents so you can
 * see the leaderboard actually populated — every board (each subject and
 * "Full Mix"). Safe to run multiple times: each sample row gets its own
 * synthetic device id, so a re-run just keeps whichever score is higher
 * rather than piling up duplicates. Delete them from the Firebase console
 * when you're done, or wipe the whole `scores` collection.
 *
 * Note this script writes no real device ids — a real browser's scores live
 * under the id in its localStorage (see /lib/device.ts).
 */
import {
  FULL_MIX_KEY,
  getAllCategoryIdsSorted,
  getAllSubjects,
} from "../data";
import { writeScore } from "../lib/leaderboard";

const NAMES = ["Alex", "Priya", "Jordan", "Sam", "Mika", "Diego", "Noor", "Casey"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const fullMix = getAllCategoryIdsSorted();

  // Only saveable runs exist now: one whole-subject run per subject, plus Full Mix.
  const runs: { categoryIds: string[]; leaderboardKey: string }[] = [
    ...Array.from({ length: 5 }, () => ({
      categoryIds: fullMix,
      leaderboardKey: FULL_MIX_KEY,
    })),
    ...getAllSubjects().flatMap((subject) =>
      Array.from({ length: 3 }, () => ({
        categoryIds: subject.categories.map((c) => c.id),
        leaderboardKey: subject.id,
      }))
    ),
  ];

  console.log(`Seeding ${runs.length} sample scores...`);

  for (const [index, run] of runs.entries()) {
    const correctCount = randomInt(8, 30);
    const missedCount = randomInt(0, 6);
    const bestStreak = randomInt(2, Math.max(2, correctCount));
    const score = correctCount * randomInt(10, 16);

    await writeScore({
      deviceId: `seed-device-${index}`,
      name: NAMES[randomInt(0, NAMES.length - 1)],
      score,
      correctCount,
      missedCount,
      bestStreak,
      categoryIds: run.categoryIds,
      leaderboardKey: run.leaderboardKey,
    });
  }

  console.log("✅ Done. Refresh the landing page to see the leaderboard populated.");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
