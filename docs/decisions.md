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

## ADR-005: Prototype-First Deferral Policy (No Premature Infrastructure)
- **Date:** 2026-10-06
- **Status:** Accepted
- **Context:** It is tempting to add WebSockets, Redis caching, microservices, and message queues early.
- **Decision:** Strictly avoid WebSockets, Redis, queues, Kubernetes, and microservices in v1. The first working vertical slice uses simple HTTP REST, a pure shared calculation engine, and a PostgreSQL database.
- **Consequences:** Fast progress, minimal mental overhead, and rapid path to a working product.
