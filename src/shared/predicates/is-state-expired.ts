
import { isOlderThanMs } from "../time/timestamp";

export const isStateExpired = (stateTimestamp: number, maxAgeMs: number): boolean =>
  isOlderThanMs(stateTimestamp, maxAgeMs);
