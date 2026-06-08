/**
 * Shared module barrel
 *
 * Cross-cutting utilities used by the rest of the package. Each
 * subdirectory is intentionally focused:
 *
 * - `calculations/` — pure math (backoff, eviction, pagination, chunking)
 * - `validators/`   — shape checks (email, URL, OAuth state, PKCE)
 * - `predicates/`   — boolean returners (isExpired, shouldRetry, has…)
 * - `time/`         — ms conversions, age math, expiry timestamps
 * - `limits/`       — per-platform and per-layer numeric boundaries
 */

export * from "./calculations";
export * from "./validators";
export * from "./predicates";
export * from "./time";
export * from "./limits";
