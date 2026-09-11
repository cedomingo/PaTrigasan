/**
 * Run with: npm run seed:scores
 *
 * Writes a handful of realistic-looking ScoreEntry documents so you can
 * see the leaderboard actually populated — both the "Full Mix" and
 * "By Topic" views. Safe to run multiple times; every run just adds more
 * rows. Delete them from the Firebase console when you're done, or wipe
 * the whole `scores` collection.
 */
import { getAllCategoryIdsSorted, getAllCategories } from "../data";
import { writeScore } from "../lib/leaderboard";

const NAMES = ["Alex", "Priya", "Jordan", "Sam", "Mika", "Diego", "Noor", "Casey"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const fullMix = getAllCategoryIdsSorted();
  const categories = getAllCategories();

  const runs: { categoryIds: string[] }[] = [
    // A handful of "Full Mix" runs (every category played).
    ...Array.from({ length: 5 }, () => ({ categoryIds: fullMix })),
    // A handful of single-category "By Topic" runs, one per category.
    ...categories.map((c) => ({ categoryIds: [c.id] })),
  ];

  console.log(`Seeding ${runs.length} sample scores...`);

  for (const run of runs) {
    const correctCount = randomInt(8, 30);
    const missedCount = randomInt(0, 6);
    const bestStreak = randomInt(2, Math.max(2, correctCount));
    const score = correctCount * randomInt(10, 16);

    await writeScore({
      name: NAMES[randomInt(0, NAMES.length - 1)],
      score,
      correctCount,
      missedCount,
      bestStreak,
      categoryIds: run.categoryIds,
    });
  }

  console.log("✅ Done. Refresh the landing page to see the leaderboard populated.");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
