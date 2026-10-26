import { FULL_MIX_KEY, getAllCategories } from "@/data";
import { DERIVATIVES_SUBJECT_ID } from "@/data/questions/derivatives";
import { DOMAIN_RANGE_SUBJECT_ID } from "@/data/questions/domain-range";
import { INTEGRALS_SUBJECT_ID } from "@/data/questions/integrals";
import { UNIT_CIRCLE_SUBJECT_ID } from "@/data/questions/unit-circle";

/**
 * The library's weekly topic schedule (/mathlib).
 *
 * Each week the five boards below are dealt out to Monday–Friday, one per
 * day, with none repeated. The deal is a pure function of the week: every
 * computer in the library shows the same schedule, it never changes on
 * refresh, and no server or database is involved. Nothing here touches
 * Math.random().
 *
 * "Today" and "this week" are decided in the library's own time zone, not the
 * computer's, so a mis-set clock or time zone can't show a different day.
 */

export const SCHEDULE_TIME_ZONE = "Asia/Manila";

/**
 * The five things that can be scheduled — a subject id or FULL_MIX_KEY, i.e.
 * leaderboard keys. Exactly one per weekday, so this list must stay at five
 * entries: adding a subject means deciding which one it replaces.
 */
export const SCHEDULE_TOPICS: readonly string[] = [
  UNIT_CIRCLE_SUBJECT_ID,
  DOMAIN_RANGE_SUBJECT_ID,
  DERIVATIVES_SUBJECT_ID,
  INTEGRALS_SUBJECT_ID,
  FULL_MIX_KEY,
];

/** Monday to Friday, in order. */
export const SCHEDULE_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

const MS_PER_DAY = 86_400_000;

/**
 * Whole days since 1970-01-01 for the calendar date `date` falls on in the
 * schedule's time zone (not the machine's, and not UTC).
 */
function localDayNumber(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SCHEDULE_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const part = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  return Math.floor(
    Date.UTC(part("year"), part("month") - 1, part("day")) / MS_PER_DAY
  );
}

/** 0 = Monday … 6 = Sunday for a day number (day 0, 1970-01-01, was a Thursday). */
function mondayBasedWeekday(dayNumber: number): number {
  return (((dayNumber + 3) % 7) + 7) % 7;
}

/** Small seeded PRNG (mulberry32): same seed, same sequence, everywhere. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Scrambles a week number so neighbouring weeks get unrelated seeds. */
function seedForWeek(weekStartDay: number): number {
  let h = Math.imul(weekStartDay ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** Day number of the Monday that starts the week containing `dayNumber`. */
function weekStartOf(dayNumber: number): number {
  return dayNumber - mondayBasedWeekday(dayNumber);
}

function scheduleForWeek(weekStartDay: number): string[] {
  const rng = mulberry32(seedForWeek(weekStartDay));
  const topics = [...SCHEDULE_TOPICS];
  // Fisher–Yates.
  for (let i = topics.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [topics[i], topics[j]] = [topics[j], topics[i]];
  }
  return topics;
}

/**
 * The week's schedule as five board keys, Monday first. The week runs
 * Monday–Sunday in Manila time, so a Saturday or Sunday still belongs to the
 * week that just ended. Every date in the same week gives the same answer.
 */
export function getWeeklySchedule(date: Date): string[] {
  return scheduleForWeek(weekStartOf(localDayNumber(date)));
}

export interface TodaySchedule {
  /** This week's five board keys, Monday first. */
  schedule: string[];
  /** 0 = Monday … 4 = Friday, or null on a weekend. */
  dayIndex: number | null;
  /** The board to play today: today's topic, or Full Mix on a weekend. */
  topicKey: string;
}

export function getScheduleToday(date: Date): TodaySchedule {
  const day = localDayNumber(date);
  const weekday = mondayBasedWeekday(day);
  const schedule = scheduleForWeek(weekStartOf(day));
  const dayIndex = weekday <= 4 ? weekday : null;
  return {
    schedule,
    dayIndex,
    topicKey: dayIndex === null ? FULL_MIX_KEY : schedule[dayIndex],
  };
}

/**
 * Every category id that belongs to a board — all of a subject's categories,
 * or all categories of all subjects for Full Mix. This is exactly the
 * selection getLeaderboardKey() maps back to the same board, so a scheduled
 * run is always saveable.
 */
export function getCategoryIdsForBoard(boardKey: string): string[] {
  const categories = getAllCategories();
  return (
    boardKey === FULL_MIX_KEY
      ? categories
      : categories.filter((c) => c.subjectId === boardKey)
  ).map((c) => c.id);
}
