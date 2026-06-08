/**
 * Duration unit conversions (milliseconds).
 *
 * All time-based values across the package are expressed in milliseconds.
 * This module centralizes the conversions so callers never hand-roll
 * `1000 * 60` etc.
 */

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

export const secondsToMs = (seconds: number): number =>
  seconds * MILLISECONDS_PER_SECOND;

export const minutesToMs = (minutes: number): number =>
  secondsToMs(minutes * SECONDS_PER_MINUTE);

export const hoursToMs = (hours: number): number =>
  minutesToMs(hours * MINUTES_PER_HOUR);

export const daysToMs = (days: number): number =>
  hoursToMs(days * HOURS_PER_DAY);
