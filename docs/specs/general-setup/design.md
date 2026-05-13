# SDD Design Template

> Methodology template used by `/sdd-specify`. Every module-level spec under `docs/specs/<domain>/<feature>/design.md` must follow this structure.
>
> **Not a feature spec itself.** This file defines the *format* for future design documents.

---

## How to use this template

- Pair with `requirements.md` in the same folder (created from `./requirements.md`).
- Defer **product/scope** decisions to `requirements.md`; this file is **how we'll implement them**.
- Reference and respect the global blueprints in [`../../system-design/design.md`](../../system-design/design.md) and [`../../detailed-design/detailed-design.md`](../../detailed-design/detailed-design.md). If you deviate from them, record the deviation in §11 Design Decisions of this spec **and** update the global blueprint in the same change.

---

## Template structure

> Copy the structure below into your `design.md`. Remove this preamble.

---

### 1. Architectural Overview

A 1–2 paragraph technical summary. What components / services / routes are introduced or touched? Where does the spec sit in the architecture diagram from [`../../detailed-design/detailed-design.md`](../../detailed-design/detailed-design.md) §1?

Include a small textual diagram if it helps:

```
[Component A] ──signal──▶ [Service B] ──HTTP──▶ [Main API]
                                  │
                                  └──websocket──▶ [Gateway]
```

### 2. Data Model

- **New interfaces** introduced (`src/app/shared/interfaces/...`).
- **Existing interfaces** modified — list field additions/removals; never silently rename.
- **Wire shapes** that differ from internal shapes (e.g., DTO ↔ view-model mapping).

### 3. API Contracts

For each endpoint touched:

| Method | URL | Service / Method | Request | Response | Notes |
|--------|-----|------------------|---------|----------|-------|
| GET | `/results/:id` | `ApiService.getResult(id, version?)` | `id`, optional `version` | `MainResponse<Result>` | Use `version` query param when present |

- Always wrap responses as `MainResponse<T>` (see [`../../detailed-design/detailed-design.md`](../../detailed-design/detailed-design.md) §4.2).
- Document 4xx / 5xx handling — especially **409 conflict** flows.

### 4. Frontend Architecture

#### 4.1 Routes
- New / modified routes in `src/app/app.routes.ts` (lazy `loadComponent`, guards, resolvers).

#### 4.2 Components
- New components (path, role, props/signals/events).
- Use shared components from [`../../system-design/design.md`](../../system-design/design.md) §8 before inventing new ones.

#### 4.3 State boundaries
- What goes in component-local signals vs `cache.service.ts` vs URL/route params.
- What is persisted to `localStorage` (must be conscious — token/theme persistence already exists; new persistence requires justification).

#### 4.4 Services
- New services or modifications to existing ones (`ApiService`, domain services, interceptors).
- Reuse before creating.

#### 4.5 Forms
- Reactive form layout, validators (client + server cross-check).
- Use `shared-result-form` and wrapped form fields rather than raw PrimeNG controls.

#### 4.6 Theming
- Use color tokens (`--ac-*`) and utility classes (`abc-*`, `atc-*`, `rs-*`, `fs-*`).
- Verify dark-mode parity unless an exemption is documented.

### 5. Security & Authorization

- Role checks added/changed (mirror `rolesGuard`, `centerAdminGuard`).
- Tokens & sensitive data — no new persistence unless justified; tokens never logged.
- Backend remains authoritative (PRD §8 — client mirrors UX only).

### 6. Error Handling

- New error paths: how surfaced (toast / alert / inline / 409 flow).
- Interaction with `httpErrorInterceptor` and `ActionsService`.
- Stale-data / version handling if relevant.

### 7. Real-Time Considerations

If touching WebSocket (`WebsocketService`):
- New events emitted / listened to.
- Degradation plan when the socket is down (must not block).

### 8. Performance

- Bundle impact estimate (kB added) and how it stays within `angular.json` budgets.
- Lazy-loading strategy (already required by PRD C-6).
- Network: number of requests on first load; any caching strategy (control-list caches, dropdown caches).

### 9. Accessibility

- Per WCAG 2.1 AA (PRD C-4): keyboard, focus, labels, contrast, motion, live regions.
- Any new motion respects `prefers-reduced-motion`.

### 10. Telemetry

- Events fired into Hotjar / Clarity / GA / BugHerd.
- Naming convention follows existing services in `shared/services/`.

### 11. Design Decisions (Decision Record)

Append entries in chronological order. Each entry: date, decision, alternatives considered, rationale.

- **YYYY-MM-DD — <short title>.** Decision: …  Alternatives: …  Rationale: …

If a decision contradicts the global system-design or detailed-design blueprints, update those documents in the same change. Local decisions that conflict with global rules without updating the global rules are not allowed.

### 12. Testing Strategy

- Unit tests added (services, components, guards, pipes).
- Coverage delta — must not push project metrics below the floors in [`../../detailed-design/detailed-design.md`](../../detailed-design/detailed-design.md) §10.
- Manual test plan for golden paths affected (referenced from [`../../system-design/design.md`](../../system-design/design.md) §3).

### 13. Risks & Mitigations

- R-1: …  Mitigation: …
- R-2: …  Mitigation: …

### 14. References

- [`../../prd.md`](../../prd.md)
- [`../../system-design/design.md`](../../system-design/design.md)
- [`../../detailed-design/detailed-design.md`](../../detailed-design/detailed-design.md)
- Related specs.
