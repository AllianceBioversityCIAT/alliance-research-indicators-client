# Alliance Research Indicators — Detailed Design (Technical Blueprint)

> The implementation blueprint. Companion to [`../prd.md`](../prd.md) (product) and [`../system-design/design.md`](../system-design/design.md) (UI/UX). When the code disagrees with this document, fix one or the other — never let them drift.

---

## 1. System Overview

The repository contains a **single Angular 19 SPA** (under `research-indicators/`) that acts as the client tier of the Alliance Research Indicators platform.

```
┌────────────────────────────────────────────┐
│      Browser (Angular 19 SPA, this repo)   │
│                                            │
│  - PrimeNG 19 UI, Signals + RxJS, SCSS     │
│  - Lazy standalone routes                  │
│  - JWT + Cognito auth                      │
│  - WebSocket presence/notifications        │
│  - Analytics: Hotjar, Clarity, GA, BugHerd │
└──────────┬───────────────┬──────────────┬──┘
           │ HTTPS / REST  │ HTTPS / REST │ WSS
           │               │              │
┌──────────▼──┐   ┌────────▼──────┐  ┌────▼──────────┐
│  Main API   │   │ Text-Mining   │  │ File Manager  │
│  (NestJS)   │   │ microservice  │  │ microservice  │
└─────────────┘   └───────────────┘  └───────────────┘
           │
           ▼
   ┌─────────────┐         ┌───────────────────┐
   │   CLARISA   │         │ STAR / TIP / PRMS │
   │ (lists)     │         │ AICCRA (federation)│
   └─────────────┘         └───────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ AWS Cognito   │
              └───────────────┘
```

- **Build artifacts** ship as static files behind **Nginx** in an Alpine container.
- **CI/CD**: GitHub Actions (`unit-tests.yml`, `sonarcloud-analysis.yml`, `jenkins-trigger.yml`).
- **Versioning**: npm semver scripts (`version:patch|minor|major`); production builds register a service worker (`ngsw-config.json`).

---

## 2. Domain Modules & Responsibilities

The Angular app is organized by **page domain** under `src/app/pages/` with cross-cutting code in `src/app/shared/`. Spec work should follow the same domain split (see [`../specs/general-setup/`](../specs/general-setup/)).

| Module | Path | Responsibility |
|--------|------|----------------|
| **Platform shell** | `src/app/pages/platform/` | Authenticated shell — navbar, sidebar, outlet for children |
| **Home** | `pages/platform/pages/home/` | Logged-in dashboard / entry actions |
| **Indicator** | `pages/platform/pages/indicator/`, `about-indicators/` | Indicator catalog & detail |
| **Results** | `pages/platform/pages/result/`, `results-center/`, `search-a-result/`, `load-result/` | Result lifecycle: create, edit (11 tabs + the conditionally-rendered Pool Funding alignment tab), search, hub |
| **Projects** | `pages/platform/pages/my-projects/`, `project-detail/` | Project portfolio & detail |
| **Dashboard** | `pages/platform/pages/dashboard/` | Aggregate analytics, Chart.js views |
| **Notifications** | `pages/platform/pages/notifications/` | Real-time feed |
| **Profile** | `pages/platform/pages/profile/` | User settings, theme |
| **About** | `pages/platform/pages/about/` | App info |
| **Administration / Center Admin** | `pages/platform/pages/administration/center-admin/` | Bulk upload, SDG management, portfolio management, AGRESSO Pool Funding tag override, Bilateral Mapping ([`bilateral-mapping/`](../../research-indicators/src/app/pages/platform/pages/administration/center-admin/bilateral-mapping/) — AGRESSO↔CLARISA project mapping CRUD, spec [`bilateral-module/center-admin-project-mapping`](../specs/bilateral-module/center-admin-project-mapping/)) |
| **Auth** | `pages/login/`, `pages/auth/` | Cognito entry & callback |
| **Landing** | `pages/landing/` | Public surface |
| **Real-time** | `pages/room/` | WebSocket collaboration |
| **OICR Download** | `pages/oicr-download/` | Public template download |
| **Dynamic Fields** | `pages/dynamic-fields/` | Form-field configuration utility |
| **Shared** | `src/app/shared/` | Components, services, pipes, utilities, interfaces |
| **Theme** | `src/app/theme/` | PrimeNG Aura preset (`roartheme.ts`) |
| **Testing** | `src/app/testing/` | Test harness, mocks |

---

## 3. Data Model & Entities

The authoritative source of truth is the backend; this document reflects the **client-side TypeScript shapes** under `src/app/shared/interfaces/`.

### 3.1 Core entities (client view)

- **Result** (`result.interface.ts`) — the central record. Fields span all 11 tabs:
  - Identity: `id`, `official_code`, `platform_code`, `title`, `description`, `indicator_id`, `version`
  - Lifecycle: `status_id`, `created_at`, `updated_at`, `submitted_at`, `submitted_by`
  - General info: `start_date`, `end_date`, `keywords`, `language_id`, `geographic_scope_id`
  - Sub-entities below
- **Result sub-entities** (one interface file each):
  - `general-information`, `links-to-result`, `alliance-alignment`, `partners`, `evidence`, `oicr-details`, `ip-rights`, `capacity-sharing`, `policy-change`, `innovation-details`, `geographic-scope`
- **Project** — research project metadata; results link to projects.
- **Indicator** (`api.interface.ts`) — five known indicator types (1–5), each with category metadata and example results.
- **User** (`get-current-user.interface.ts`) — `user_id`, `role_id`, `sec_role_id`, `focus_id`, `first_name`, `last_name`, `email`, `center`, `platform`.
- **Cache state** (`cache.interface.ts`) — client UI state: current result, current metadata, theme, modals, role flags.
- **Controlled-list entities** — institutions, countries, regions, subnational, SDGs, levers, sdg-targets, impact-areas, delivery-modality, languages, session-types, session-purposes, actor-types.
- **MainResponse<T>** (`responses.interface.ts`) — envelope: `{ successfulRequest, status, data, errorDetail }`.
- **HttpErrorResponse** (`http-error-response.interface.ts`) + `ErrorDetailLike` — structured error shape.

### 3.2 Versioning

- Results are **versioned** server-side. The client receives a `version` field and supports a `?version=N` query param on `/result/:id`.
- `VersionWatcherService` polls / observes version transitions and surfaces stale-data prompts.

### 3.3 Federation identity

- Cross-platform identity is the pair (`platform_code`, `official_code`).
- Duplicate creation returns **HTTP 409** with the existing record reference — the client surfaces a link-to-existing flow.

---

## 4. API Surface & Contracts

Three backend services are consumed; URLs come from `src/environments/environment*.ts`.

### 4.1 Service URLs

| Env var | Purpose | Owner |
|---------|---------|-------|
| `environment.mainApiUrl` | Primary REST backend (NestJS-style) | Main API team |
| `environment.textMiningUrl` | AI/NLP auto-fill & extraction | Text-mining team |
| `environment.fileManagerUrl` | Evidence file upload/serve | File-manager team |

### 4.2 Response envelope

```ts
interface MainResponse<T> {
  successfulRequest: boolean;
  status: number;
  data: T;
  errorDetail?: {
    status: number;
    title: string;
    description?: string;
    errors?: Array<{ field: string; message: string }>;
  };
}
```

The client should **never** parse a raw `T` — always go through `MainResponse<T>`. Interceptors centralize this.

### 4.3 Representative endpoints (consumed via `ApiService`)

- `POST /authorization/login`
- `POST /authorization/refresh-token`
- `GET /indicator-types`, `GET /indicators`
- `GET /maturity-levels`
- `GET /tools/clarisa/institutions`, `/sdgs`, `/levers`, `/sdg-targets`, `/impact-areas`, `/countries`, `/languages`, `/delivery-modality`, `/session-types`
- `GET /results`, `GET /results/search`, `GET /results/:id`
- `POST /results`, `PATCH /results/:id`, `PATCH /results/:id/submit`, `DELETE /results/:id/:field`
- `GET /results-center`, `GET /dashboards`
- `GET /projects`, `GET /contracts`, `GET /metadata`
- `PATCH /agresso/contracts/:code/pool-funding-tag` — Center Admin / System Admin override of the bilateral Pool Funding tag (spec: [`../specs/bilateral-module/tag-visibility/`](../specs/bilateral-module/tag-visibility/)).
- `GET /results/:resultCode/pool-funding-alignment`, `PATCH /results/:resultCode/pool-funding-alignment` — Pool Funding Alignment read + write (eligible bilateral results only; PATCH returns 409 once synced to PRMS; spec: [`../specs/bilateral-module/alignment-section/`](../specs/bilateral-module/alignment-section/)).
- `GET /results/:resultCode/pool-funding-alignment/hlos-indicators` — **reshaped (ToC Mapping v2, 2026-06-10).** Returns a **level-based ToC catalog**: `result_code`, `mapping_status`, `clarisa_project`, `result_type` (backend-owned key), `allowed_levels[]` (`OUTPUT`/`OUTCOME`/`EOI`, derived from the result type), `version_locked`, and `catalogs[]` — one entry per Science Program, one `levels[]` entry per allowed level, each with `toc_results[]` (id, title, `aow_code` as a display-only label, indicators with `unit_of_measurement`/`type_value`/resolved 2026 `target_value`/`target_year`). Sourced from the **lambda-toc** integration (`ARI_TOC_INTEGRATION_HOST`) through a 5-min backend cache — not persisted in ARI. The legacy `(SP, AOW)`-pair envelope (`pairs[]` + `aow_status`) is **retired**: AOW is no longer a request dimension, only a `toc_result` display attribute. Spec: [`../specs/archive/2026-06-17-bilateral-module--toc-mapping-v2/`](../specs/archive/2026-06-17-bilateral-module--toc-mapping-v2/) (supersedes the archived [`indicator-mapping`](../specs/archive/2026-06-10-bilateral-module--indicator-mapping/)).

### 4.4 Client contract rules

- **Always** wrap HTTP calls behind `ApiService` (or domain-specific service that delegates to it). No raw `HttpClient` in components.
- **Never** swallow `successfulRequest === false`. Pass it through to `ActionsService` so the user sees a toast/alert.
- **Conflicts (409)**: surface a structured "link to existing" prompt; do not retry blindly.
- **Auth (401)**: handled by `jWtInterceptor` → refresh → retry once. After a second 401, log the user out.
- **Validation errors**: render `errorDetail.errors[]` inline next to the offending form field.

---

## 5. Backend Workflows & Business Rules (Client Reflection)

The backend is authoritative; the client must mirror these rules so users don't run into surprises mid-flow:

1. **Result creation** validates uniqueness of (`platform_code`, `official_code`) → 409 if duplicate.
2. **Tab completion** is independent — saving one tab doesn't require others to be complete.
3. **Submission** requires required-field validation across tabs; the client should pre-check before calling `PATCH /results/:id/submit`.
4. **MEL review** transitions are server-driven; the client reads `status_id` and renders permitted actions accordingly.
5. **Center-admin actions** (bulk upload, SDG management) require `role_id === 9` plus matching `focus_id` / `sec_role_id` checks (mirrored client-side by `RolesService` / `centerAdminGuard`).
6. **Versioning**: editing a stale version returns 409/410-style errors; client prompts user to reload.
7. **Evidence files** are uploaded to the file-manager service first, then the resulting URL is attached to the result — never embed raw file bytes in a result POST.

---

## 6. Frontend Architecture & State Boundaries

### 6.1 Component / module style

- **Standalone components only.** No NgModules in new code. Lazy load via `loadComponent: () => import(...)` (see `src/app/app.routes.ts`).
- **View transitions** enabled at the router (`withViewTransitions()`).
- **Path aliases** declared in `tsconfig.json` (and mirrored in `jest.config.ts`):
  - `@platform`, `@landing`, `@pages`, `@shared`, `@services`, `@guards`, `@envs`, `@interfaces`, etc.
- Prefix for generated selectors is `app` (see `angular.json`).

### 6.2 State boundaries

| Layer | Primary tool | Where it lives |
|-------|--------------|----------------|
| Server cache | `ApiService` + per-domain services + `MainResponse<T>` | `src/app/shared/services/` |
| Client cache (cross-cutting state) | **Angular Signals** (`signal`, `computed`, `WritableSignal<T>`) | `shared/services/cache.service.ts` |
| Reactive streams (HTTP, WebSocket) | **RxJS** | services + interceptors |
| Local component state | Signals (preferred) or component fields | inside components |
| Persisted state | `localStorage` (tokens, theme) via cache services | `cache.service.ts`, `dark-mode.service.ts` |
| URL state | Angular Router (route params, query params) | `app.routes.ts` |

- **No NgRx.** Service-per-domain + signals is the established pattern.
- **No two-way binding** for cross-cutting state; use signals + setters.

### 6.3 Interceptors

Three are registered (order matters):

1. `jWtInterceptor` — attaches JWT, proactively refreshes near expiry, retries once on 401.
2. `httpErrorInterceptor` — central error logging + toast/alert dispatch via `ActionsService`. URL-scoped toast exceptions exist for `refresh-token`, AI-formalize 502, 400 on `/pool-funding-tag`, and 400 on `/pool-funding-alignment` (where the inline-error path owns the user message).
3. `resultInterceptor` — result-domain transformations (e.g., version handling).

### 6.4 Real-time (WebSocket)

- `WebsocketService` connects on app init via `ngx-socket-io`.
- Emits `config-user` (name, userId, platform) to identify the client.
- Listens to: `all-connected-users-<platform>`, `notifications`, `alert-<platform>`, `result.pool-funding-alignment.changed` (per-result subscription in `PoolFundingAlignmentComponent`; dirty-state guard via info toast — design: [`../specs/bilateral-module/alignment-section/design.md`](../specs/bilateral-module/alignment-section/design.md) §7).
- Exposes signals (`userList`, `currentRoom`) for components.
- **Degradation**: when the socket is disconnected, UI must continue to function with REST polling fallbacks where applicable; it must never block on `connected`.

### 6.5 Form handling

- Reactive forms via `@angular/forms`.
- Each result tab is its own form; `shared-result-form` provides the host pattern.
- Custom fields (`custom-fields`) and PrimeNG inputs are wrapped via `src/styles/custom-fields.scss` / `custom-prime-force-styles.scss`.
- Validation: client-side mirrors server-side; server-side wins on conflict.

---

## 7. Integration Points

| Integration | Mechanism | Service / file |
|-------------|-----------|----------------|
| **AWS Cognito** | OAuth-style redirect → `/auth` callback → token exchange | `cognito.service.ts`, `login.component`, `auth.component` |
| **Main API** | REST over HTTPS, `MainResponse<T>` envelope | `api.service.ts`, `to-promise.service.ts` |
| **Text-mining service** | REST | `text-mining.service.ts` |
| **File-manager service** | REST multipart upload, returns persistent URL | `file-manager.service.ts` |
| **WebSocket gateway** | Socket.IO via `ngx-socket-io` | `sockets/websocket.service.ts` |
| **CLARISA** | Indirect via main API endpoints (`/tools/clarisa/*`) | `get-clarisa-institutions-*.service.ts`, `get-subnational-by-iso-alpha.service.ts` |
| **Hotjar** | Browser SDK | `hotjar.service.ts`, `tracking-tools.service.ts` |
| **Microsoft Clarity** | Browser SDK | `clarity.service.ts` |
| **Google Analytics** | Browser SDK | `google-analytics.service.ts` |
| **BugHerd** | Browser SDK | `bug-herd.service.ts` |
| **Service worker** | Angular ngsw, production builds only | `ngsw-config.json`, `app.config.ts` |

Federation with STAR / TIP / PRMS / AICCRA is **read/link-only** from the client — it follows deep-link URLs supplied by the main API.

---

## 8. Security & Authorization Model

### 8.1 Authentication

- **AWS Cognito** + JWT (PRD C-2). No alternative IdPs.
- Tokens (`access_token`, `refresh_token`, `exp`) stored in `localStorage` and mirrored in cache signals.
- `jWtInterceptor` performs **proactive expiration checks** before each outbound request and refreshes when within the configured skew.
- Refresh failure → clear tokens + redirect to `/login`.

### 8.2 Authorization

- Backend is authoritative. The client mirrors role checks for UX (hide actions early).
- `rolesGuard` — global authenticated/unauthenticated routing decision.
- `centerAdminGuard` — composite check: `role_id === 1` (Admin) OR (`role_id === 9` AND focus/sec-role match).
- `RolesService` exposes computed signals for role membership and feature visibility.
- **Never** trust the client to enforce destructive policies; the backend must reject unauthorized writes regardless of client UI.

### 8.3 Sensitive data handling

- No PII beyond user account fields (name, email, center) is stored client-side.
- Tokens are never logged or sent to analytics SDKs.
- Evidence uploads pass through the file-manager service and are never inlined.
- Service workers (`ngsw-worker.js`) are scoped to production and do not cache authenticated API responses by default.

---

## 9. Error Handling & Observability

### 9.1 Error handling

- **Layered model**:
  1. `httpErrorInterceptor` — central HTTP error trap.
  2. `ActionsService` — converts errors into toasts (`global-toast`), alerts (`global-alert`, `alert-tag`), and structured form-field errors.
  3. Components subscribe to `ActionsService` signals for surface-specific behavior.
- **User-facing rule**: every error reaches the user as a *human-readable* toast or alert. Never `console.log` and walk away in production paths.
- **Form-validation errors** are rendered inline using `errorDetail.errors[]` from the response envelope.
- **409 / conflicts** route to dedicated flows (duplicate-result link prompt; stale-version reload prompt).

### 9.2 Observability

- **Hotjar**, **Microsoft Clarity** — session replay / heatmaps for UX research.
- **Google Analytics** — page/event analytics.
- **BugHerd** — in-product feedback / bug reports.
- **SonarCloud** — static analysis via `.github/workflows/sonarcloud-analysis.yml`.
- **Version watcher** — `VersionWatcherService` surfaces app-update banners when a new build is deployed.

### 9.3 What is *not* observable today (open gaps)

- No browser-side error reporting service (e.g., Sentry).
- No structured RUM (real-user-monitoring) for Web Vitals beyond what GA reports.

---

## 10. Testing Strategy

- **Test runner**: Jest via `jest-preset-angular` (`jest.config.ts`).
- **Test environment**: `jsdom`.
- **Path aliases** mirrored in `jest.config.ts` (must stay in sync with `tsconfig.json`).
- **Coverage thresholds** (CI floor): statements 40%, branches 20%, lines 45%, functions 30%.
- **Excluded from coverage**: `app.config.ts`, `app.routes.ts`, `websocket.service.ts`, `alert.component.ts` (known instability).
- **No e2e** suite today. Manual smoke testing covers the golden paths in [`../system-design/design.md`](../system-design/design.md) §3.

### 10.1 What to test

- **Services**: HTTP wiring (with `HttpTestingController`), interceptors, role logic, cache mutations.
- **Components**: rendering, role-conditional visibility, form validity, signal-driven state transitions, error surfaces.
- **Guards & resolvers**: pass/fail decisions for representative role + token states.
- **Pipes & utilities**: pure-function coverage at high percentage.

### 10.2 Testing conventions

- Co-locate `.spec.ts` files with their subjects.
- Use `src/app/testing/` mocks; do not reinvent fixtures per test.
- Snapshot tests sparingly — they decay quickly on a PrimeNG-heavy UI.

---

## 11. Technical Constraints & Assumptions

### 11.1 Hard constraints (from [`../prd.md`](../prd.md) §8.3)

- **C-1**: Angular 19 + PrimeNG 19 — no framework migration.
- **C-2**: AWS Cognito + JWT — no alternative IdPs.
- **C-3**: CLARISA is the controlled-vocabulary source.
- **C-4**: WCAG 2.1 AA accessibility minimum.
- **C-5**: Production bundle budgets per `angular.json`: initial ≤ 3 MB error / 2 MB warning; component styles ≤ 8 kB error / 4 kB warning.
- **C-6**: Standalone components + lazy `loadComponent` routes only.

### 11.2 Operational constraints

- Container build: multi-stage `Dockerfile`, Nginx-Alpine serving `dist/research-indicators/browser` on port 80.
- Nginx config (`nginx.conf`) does SPA fallback (`try_files $uri $uri/ /index.html`).
- Service worker registers with `registerWhenStable:30000`, production only.
- CI workflows: `unit-tests.yml`, `sonarcloud-analysis.yml`, `jenkins-trigger.yml`.

### 11.3 Assumptions

- Backend services maintain the `MainResponse<T>` envelope. A breaking change to that contract is a coordinated cross-team change.
- CLARISA endpoints stay stable across versions; client-side caching is safe.
- Cognito region/userpool configuration is supplied via `environment*.ts` at build/deploy time.
- WebSocket gateway is hosted on the same domain (or a CORS-permitted one) and uses transports compatible with `ngx-socket-io` 4.x.
- *(2026-06-10 — ToC Mapping v2)* The bilateral ToC catalog flow assumes the backend's reshaped `hlos-indicators` endpoint performs the upstream lambda-toc reads server-side with its own 5-min cache (warm-stale on upstream failure; cold-cache → 503). The FE does **not** cache the response itself; the catalog is fetched **once per section load** (one of the section's 3 GETs in `PoolFundingAlignmentComponent`), not per interaction — the modal-open-per-fetch pattern was retired with the modal flow. On a catalog 503 the FE keeps the prior value and surfaces an error/retry. If backend cache TTL changes, the FE preload pattern may need re-tuning.

### 11.4 Known technical debt / future work

- Coverage thresholds are intentionally low; raise them gradually as new tests land.
- Some `custom-prime-force-styles.scss` rules don't fully account for dark mode (see system-design OG-2).
- No first-class error-reporting integration (Sentry-like).
- No e2e suite; consider Playwright if the surface grows.
- `ngsw-config.json` currently has no asset/data groups defined — service worker is effectively a no-op for offline.
- *(2026-05-27)* Bilateral indicator-mapping's per-row enrichment fields — `is_quantitative`, `disabled_reason` — are derived client-side in `BilateralService.materializeRows()` because the backend's safe-bundle additions (per [`../specs/bilateral-module/indicator-mapping/open-questions-for-ba.md` §7.1](../specs/bilateral-module/indicator-mapping/open-questions-for-ba.md#71-backends-verdict-per-oq)) target `IndicatorPanelIndicatorResponse`, which the new flow does not consume. When backend mirrors the fields onto `PrmsTocIndicator` (or a sibling enrichment DTO), the derivation in `materializeRows()` should be replaced with direct reads — single seam, single PR.
