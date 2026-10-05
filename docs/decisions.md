# Architecture Decision Records (ADRs)

This document tracks key technical decisions, rationale, and date of record for ApexTrack.

---

## ADR-001: Monorepo Structure with pnpm Workspaces
- **Date:** 2026-10-06
- **Status:** Accepted
- **Context:** ApexTrack requires a web application (`apps/web`), a future REST backend (`apps/api`), and a shared core trip telemetry engine (`packages/shared`). Code duplication of telemetry math (Haversine, point validation, trip statistics) between frontend and backend causes bugs and divergence.
- **Decision:** Use a `pnpm` monorepo workspace. `pnpm` provides fast, disk-efficient symlinked dependencies and native workspace protocol support (`workspace:*`).
- **Consequences:** We maintain a single Git repository. Shared code is modified in one place and consumed by both web and API.

---

## ADR-002: Shared Telemetry Engine as a Zero-Dependency Package
- **Date:** 2026-10-06
- **Status:** Accepted
- **Context:** The trip engine calculates distances, validates GPS streams, and summarizes drive metrics. It must run identically in the browser (client-side simulation and offline tracking) and on the backend (authoritative verification of submitted trips).
- **Decision:** Keep `packages/shared` 100% pure TypeScript with zero runtime framework dependencies. Build using `tsup` to emit dual outputs: CommonJS (`.cjs`) for Node/NestJS and ECMAScript Modules (`.js`) for Vite.
- **Consequences:** Super fast unit tests, zero vendor lock-in, and reliable cross-platform portability.

---

## ADR-003: Strict Internal SI Units Policy
- **Date:** 2026-10-06
- **Status:** Accepted
- **Context:** GPS receivers report coordinates and timestamps. Different regions display distances in miles or kilometers and speeds in mph or km/h. Mixing units in calculations causes catastrophic unit-conversion bugs (e.g. Mars Climate Orbiter).
- **Decision:** Every calculation, database column, and API payload MUST strictly use SI units:
  - Distance: **meters (m)**
  - Time/Duration: **seconds (s)**
  - Speed: **meters per second (m/s)**
  - Acceleration: **meters per second squared (m/s²)**
  - Timestamps: **ISO 8601 UTC** or epoch milliseconds.
  Conversion to `km/h` or `mph` is permitted *only* at the visual UI presentation layer.
- **Consequences:** Pure, uncorrupted math across the entire stack.

---

## ADR-004: Telemetry Anomaly Detection & Anti-Cheat Heuristics
- **Date:** 2026-10-06
- **Status:** Accepted
- **Context:** Mobile GPS experiences multipath reflections, tunnel disconnects, and simulated spoofing. Unfiltered points produce erratic top speeds (e.g., 800 km/h) and corrupt leaderboards.
- **Decision:** Implement multi-stage point validation:
  1. Coordinate boundaries: $-90 \le \text{lat} \le 90$, $-180 \le \text{lon} \le 180$.
  2. Accuracy threshold: discard points with reported accuracy $> 50$ meters.
  3. Chronology: enforce strict monotonically increasing timestamps ($\Delta t > 0$).
  4. Implied velocity filter: flag consecutive segments exceeding $100\text{ m/s}$ ($360\text{ km/h}$).
  5. Implied acceleration filter: flag consecutive acceleration exceeding $15\text{ m/s}^2$ ($\approx 1.5g$).
  Trips with fewer than 3 valid points or an excessive anomaly ratio are marked `INVALID`.
- **Consequences:** Clean, realistic drive data and cheat-resistant leaderboards without requiring heavy ML pipelines in v1.

---

## ADR-006: Dual API Client Interface with Mock vs. HTTP Toggle
- **Date:** 2026-10-06
- **Status:** Accepted
- **Context:** Following the "One new technology at a time" roadmap rule, the UI must be completely usable, testable, and demonstrable before the NestJS backend and PostgreSQL database are implemented.
- **Decision:** Implement a TypeScript interface `ApiClient` with two concrete implementations: `MockApiClient` (using `localStorage` + the pure shared mathematical engine) and `HttpApiClient` (making REST calls). Controlled by `VITE_USE_MOCKS`.
- **Consequences:** We can develop and test the entire mobile/desktop user journey on phones via local network tunnels immediately. Transitioning to Phase 5 (real backend) is a single environment variable change.

---

## ADR-007: MapLibre GL JS with Zero-Key Open Dark Map Tiles
- **Date:** 2026-10-06
- **Status:** Accepted
- **Context:** Rendering GPS routes requires a map engine. Using Google Maps or Mapbox requires credit cards, API keys, and restrictive usage quotas for a prototype.
- **Decision:** Use `maplibre-gl` with free CARTO Dark Matter raster tiles and OpenStreetMap attribution. Downsample polyline points before rendering using our zero-dependency Douglas-Peucker `simplifyRoute` implementation in `@apextrack/shared`.
- **Consequences:** Zero cost, zero API keys to leak, gorgeous dark motorsport aesthetic, and instant offline/localhost rendering.

