import { test } from "node:test";
import assert from "node:assert/strict";
import { FULL_MIX_KEY, getLeaderboardKey } from "@/data";
import {
  SCHEDULE_TOPICS,
  getCategoryIdsForBoard,
  getScheduleToday,
  getWeeklySchedule,
} from "./schedule";

// Monday 2026-10-26 in Manila is 2026-10-25T16:00:00Z.
const MON = (weeksAhead = 0) =>
  new Date(Date.UTC(2026, 9, 25, 16, 0, 0) + weeksAhead * 7 * 86_400_000);
const HOUR = 3_600_000;

test("each week uses all five topics exactly once, Monday to Friday", () => {
  for (let w = 0; w < 60; w++) {
    const schedule = getWeeklySchedule(MON(w));
    assert.equal(schedule.length, 5);
    assert.deepEqual([...schedule].sort(), [...SCHEDULE_TOPICS].sort());
  }
});

test("the same date always gives the same schedule", () => {
  assert.deepEqual(getWeeklySchedule(MON()), getWeeklySchedule(MON()));
});

test("every moment of one Manila week gives the same schedule", () => {
  const expected = getWeeklySchedule(MON());
  // Monday 00:00 through Sunday 23:59 Manila.
  for (let h = 0; h < 7 * 24; h += 5) {
    const d = new Date(MON().getTime() + h * HOUR);
    assert.deepEqual(getWeeklySchedule(d), expected, `hour offset ${h}`);
  }
  assert.deepEqual(
    getWeeklySchedule(new Date(MON().getTime() + 7 * 24 * HOUR - 60_000)),
    expected,
    "Sunday 23:59 is still the same week"
  );
});

test("Monday 00:00 Manila starts a new week; the minute before is the old one", () => {
  const lastMinute = new Date(MON().getTime() - 60_000); // Sun 23:59 Manila
  assert.deepEqual(getWeeklySchedule(lastMinute), getWeeklySchedule(MON(-1)));
  assert.equal(getScheduleToday(lastMinute).dayIndex, null); // Sunday
  assert.equal(getScheduleToday(MON()).dayIndex, 0); // Monday
});

test("the weekday follows Manila time, not UTC", () => {
  // 20:00 UTC on Monday is already 04:00 Tuesday in Manila.
  const d = new Date(Date.UTC(2026, 9, 26, 20, 0, 0));
  assert.equal(d.getUTCDay(), 1); // UTC says Monday...
  assert.equal(getScheduleToday(d).dayIndex, 1); // ...Manila says Tuesday
  // 17:00 UTC on Friday is Saturday 01:00 in Manila: weekend.
  const fri = new Date(Date.UTC(2026, 9, 30, 17, 0, 0));
  assert.equal(fri.getUTCDay(), 5);
  assert.equal(getScheduleToday(fri).dayIndex, null);
});

test("consecutive weeks are different in nearly every case", () => {
  let differing = 0;
  const weeks = 52;
  for (let w = 0; w < weeks; w++) {
    const a = getWeeklySchedule(MON(w)).join();
    const b = getWeeklySchedule(MON(w + 1)).join();
    if (a !== b) differing++;
  }
  assert.ok(differing >= weeks - 2, `only ${differing}/${weeks} weeks differed`);
});

test("over a year, every topic lands on every weekday at some point", () => {
  for (let day = 0; day < 5; day++) {
    const seen = new Set<string>();
    for (let w = 0; w < 104; w++) seen.add(getWeeklySchedule(MON(w))[day]);
    assert.equal(seen.size, SCHEDULE_TOPICS.length, `weekday ${day}`);
  }
});

test("weekdays play that day's topic; weekends play Full Mix", () => {
  const schedule = getWeeklySchedule(MON());
  for (let day = 0; day < 5; day++) {
    const d = new Date(MON().getTime() + (day * 24 + 12) * HOUR);
    const today = getScheduleToday(d);
    assert.equal(today.dayIndex, day);
    assert.equal(today.topicKey, schedule[day]);
    assert.deepEqual(today.schedule, schedule);
  }
  for (const day of [5, 6]) {
    const today = getScheduleToday(new Date(MON().getTime() + (day * 24 + 12) * HOUR));
    assert.equal(today.dayIndex, null);
    assert.equal(today.topicKey, FULL_MIX_KEY);
  }
});

test("every scheduled topic selects everything and is always saveable", () => {
  for (const key of SCHEDULE_TOPICS) {
    const ids = getCategoryIdsForBoard(key);
    assert.ok(ids.length > 0, key);
    assert.equal(getLeaderboardKey(ids), key, `${key} must map back to itself`);
  }
});
