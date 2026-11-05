
import { secondsToMs } from "./duration";

export const nowMs = (): number => Date.now();

export const ageInMs = (timestamp: number): number => {
  const diff = Date.now() - timestamp;
  return diff < 0 ? 0 : diff;
};

export const isOlderThanMs = (timestamp: number, maxAgeMs: number): boolean =>
  ageInMs(timestamp) > maxAgeMs;

export const expiryFromNow = (secondsUntilExpiry: number | undefined): number | null =>
  secondsUntilExpiry === undefined ? null : Date.now() + secondsToMs(secondsUntilExpiry);
