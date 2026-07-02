# Design — Center Admin: Bilateral Project Mapping

> SDD design for `docs/specs/bilateral-module/center-admin-project-mapping/`. Pairs with [`requirements.md`](./requirements.md). Depth: **Standard**.
> Backend is **consume-only** — no server changes. This document describes the STAR client (`alliance-research-indicators-client`) implementation.

---

## 1. Architectural Overview

A new lazy-loaded standalone Angular page under the existing **Center Admin** area consumes the already-shipped `/api/bilateral-project-mappings` CRUD API and two CLARISA/AGRESSO picker endpoints. State is component-local (signals); data access goes through a thin **feature service** that wraps `ApiService` methods, mirroring how `agresso-pool-funding-tag` delegates to `BilateralService`.

```
[BilateralMappingComponent] ──signals──▶ [BilateralMappingService]
        (page: list + dialogs)                     │
                                                    ├─ ApiService.GET_BilateralProjectMappings(query)
                                                    ├─ ApiService.POST_BilateralProjectMapping(body)
                                                    ├─ ApiService.PATCH_BilateralProjectMapping(id, body)
                                                    ├─ ApiService.PATCH_BilateralProjectMappingDeactivate(id)
                                                    ├─ ApiService.GET_FindContracts({pool-funding-contributor:true})   (AGRESSO picker)
                                                    └─ ApiService.GET_ClarisaBilateralProjects()                        (CLARISA picker)
                                                            │
                                                            └─ ToPromiseService.TP ──HTTP──▶ mainApiUrl (/api/…) ──▶ NestJS RolesGuard
```

Placement in the detailed-design page-module map: `administration/` domain → `center-admin/` sub-area (same tier as `sdg-management`, `agresso-pool-funding-tag`, `capacity-bulk-upload`).

---

## 2. Data Model

**New interfaces** — `research-indicators/src/app/shared/interfaces/bilateral/bilateral-project-mapping.interface.ts`:

```ts
export type BilateralMappingSource = 'MANUAL' | 'AI_SUGGESTED' | 'AI_AUTO';

export interface BilateralProjectMapping {
  id: number;
  agresso_agreement_id: string;
  clarisa_project_id: number;
  clarisa_project_short_name?: string | null;
  source: BilateralMappingSource;
  confidence_score?: number | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface BilateralMappingListMeta { total: number; page: number; limit: number; totalPages: number; }
export interface BilateralMappingListPage { items: BilateralProjectMapping[]; meta: BilateralMappingListMeta; }

export interface BilateralMappingListQuery {
  page?: number; limit?: number; search?: string;
  is_active?: boolean; source?: BilateralMappingSource;
}

export interface CreateBilateralMappingBody { agresso_agreement_id: string; clarisa_project_id: number; notes?: string; }
export interface UpdateBilateralMappingBody { clarisa_project_id?: number; notes?: string; }

// Picker view models (shape confirmed against live backend — see §11 OQ-1)
export interface ClarisaBilateralProjectOption {
  id: number; short_name: string; source_of_funding?: string;
  science_programs?: { code?: string; name?: string; portfolio?: string; allocation?: number }[];
}
```

- **Reuse:** the AGRESSO picker reuses the existing `FindContractsResponse` / `AgressoContractRow` interfaces (`interfaces/bilateral/agresso-contract.interface.ts`) via `GET_FindContracts` rather than introducing a parallel type.
- **Wire ↔ view:** wire shapes are consumed as-is; the only view mapping is display formatting (e.g. hide `confidence_score` when `source === 'MANUAL'`).

---

## 3. API Contracts

All responses are wrapped `MainResponse<T>`. Base = `environment.mainApiUrl` (`…/api/`), so `ApiService` URLs are relative (no `/api` prefix, no `v1`).

| Method | URL (relative to `/api/`) | `ApiService` method | Request | Response | Notes |
|--------|---------------------------|---------------------|---------|----------|-------|
| GET | `bilateral-project-mappings` | `GET_BilateralProjectMappings(query)` | `page,limit,search,is_active,source` | `MainResponse<BilateralMappingListPage>` | omit empty params |
| GET | `bilateral-project-mappings/:id` | `GET_BilateralProjectMapping(id)` | `id` | `MainResponse<BilateralProjectMapping>` | used for refresh-on-edit if needed |
| POST | `bilateral-project-mappings` | `POST_BilateralProjectMapping(body)` | `CreateBilateralMappingBody` | `MainResponse<BilateralProjectMapping>` | 409 on duplicate active agreement |
| PATCH | `bilateral-project-mappings/:id` | `PATCH_BilateralProjectMapping(id, body)` | `UpdateBilateralMappingBody` | `MainResponse<BilateralProjectMapping>` | 400 validation, 409 conflict |
| PATCH | `bilateral-project-mappings/:id/deactivate` | `PATCH_BilateralProjectMappingDeactivate(id)` | `id` | `MainResponse<BilateralProjectMapping>` | idempotent soft-delete |
| GET | `agresso/contracts/find-contracts?pool-funding-contributor=true` | `GET_FindContracts({...})` *(existing)* | filters | `MainResponse<FindContractsResponse>` | AGRESSO picker (OQ-1) |
| GET | `tools/clarisa/projects/bilateral` | `GET_ClarisaBilateralProjects()` *(new)* | — | `MainResponse<ClarisaBilateralProjectOption[]>` | CLARISA picker (OQ-1) |

**Error handling contract** *(backend-confirmed 2026-07-01):*
- **409** on **POST create only** (PATCH update never 409s — agreement is immutable) → conflict path: inline + toast. The human message is in **`MainResponse.errorDetail.errors`** (e.g. "Active mapping already exists for this contract"); `description` is the exception name (`"ConflictException"`) and must NOT be shown. Reuse the `useResultInterceptor`/`MainResponse.status` pattern from `PATCH_PoolFundingTag`.
- **400** → surface `MainResponse.errorDetail.errors` when present, else `MainResponse.description`.
- **5xx / network** → generic failure toast; list falls back to error state (REQ-BIL-CAM-NF-06).

`ApiService` methods use the `this.TP.get/post/patch(url(), body?, opts)` idiom already established (e.g. lines 159, 693, 699 of `api.service.ts`). Mutations pass `{ useResultInterceptor: true }` so `MainResponse.status` is readable for 400/409 branching (as `PATCH_PoolFundingTag` does).

---

## 4. Frontend Architecture

### 4.1 Routes
`research-indicators/src/app/app.routes.ts` — add within the center-admin block (near lines 252–281):

```ts
{
  path: 'administration/center-admin/bilateral-mapping',
  loadComponent: () =>
    import('@platform/pages/administration/center-admin/bilateral-mapping/bilateral-mapping.component').then(m => m.default),
  canMatch: [centerAdminGuard],
  data: { title: 'Bilateral Mapping', isLoggedIn: true }
}
```

### 4.2 Components
- **`BilateralMappingComponent`** (`default export`, standalone, `OnPush`) — path `pages/platform/pages/administration/center-admin/bilateral-mapping/bilateral-mapping.component.ts` (+ `.html`, `.scss`). Owns: search box, filters, PrimeNG table + paginator, and the create/edit dialog. Analog: `sdg-management.component.ts` (signals + load/save lifecycle) and `agresso-pool-funding-tag.component.ts` (lookup + 400 inline handling).
- **Create/Edit dialog** — implemented inline in the page (PrimeNG `Dialog`) or as a small child component `bilateral-mapping-form.component.ts` if the template grows; holds the two pickers + notes + Save/Cancel.
- **Pickers** — prefer the shared wrapped fields (`shared/components/custom-fields/*` select/multiselect) as used by `sdg-management`; raw PrimeNG `p-select`/`p-autocomplete` is acceptable where the wrapped field's service-locator model doesn't fit (consistent with bilateral ToC decision D-8a). Decide per §11.

### 4.3 State boundaries
- Component-local signals only: `loading`, `loadError`, `rows`, `meta` (`total/page/limit/totalPages`), `search`, `activeFilter`, `sourceFilter`, `dialogOpen`, `editing` (current mapping or null), `saving`, `saveError`, per-picker option signals + loading flags.
- No `cache.service` entries, no new `localStorage`. Query state (search/filters/page) is component-local; URL query-param sync is optional (not required by ACs).

### 4.4 Services
- **New:** `BilateralMappingService` (`shared/services/bilateral-mapping.service.ts` or co-located under the page). Thin wrapper: `list(query)`, `get(id)`, `create(body)`, `update(id, body)`, `deactivate(id)`, `loadAgressoOptions()`, `loadClarisaProjectOptions()`. Returns typed results (`{ ok, data?, status, description }` for mutations) so the component branches on 400/409 without catching raw HTTP. Mirrors `BilateralService.patchTag` returning `PatchTagResult`.
- **New `ApiService` methods** (§3) — declared alongside the existing bilateral methods.
- **Reuse:** `ActionsService` (toast + confirm dialog), `ClarityService` (telemetry), `RolesService`/`centerAdminGuard` (access).

### 4.5 Forms
- Create/edit uses a lightweight reactive/`ngModel` form consistent with `agresso-pool-funding-tag` (which uses `FormsModule` + signals). Validators: both pickers required for create; notes length capped (mirror the 500-char justification cap pattern). Save disabled until valid and (edit) dirty (AC-05.3 / AC-06.4).
- Server cross-check: 400/409 responses drive inline errors; the client never assumes success.

### 4.6 Theming
- Use existing tokens (`--ac-*`) and utility classes (`abc-*`, `atc-*`, `rs-*`, `fs-*`) as in sibling admin pages; verify dark + light parity (REQ-BIL-CAM-NF-04).

---

## 5. Security & Authorization
- Route protected by `centerAdminGuard` (`canMatch`), reusing `RolesService.canAccessCenterAdmin()` (role 1, or role 9 with `focus_id===1 && sec_role_id===9`).
- Menu item rendered only under `rolesService.canAccessCenterAdmin()` in `administrationGroups()`.
- Backend `RolesGuard` + `@Roles(CENTER_ADMIN, SYSTEM_ADMIN)` remains authoritative; the client gate is UX-only (PRD §8). No tokens logged; no new sensitive persistence.

---

## 6. Error Handling
- **List:** failure → `loadError` state + retry button; never a permanent spinner (NF-06).
- **Create:** 409 → conflict message from `errorDetail.errors` (inline + toast); 400 → surface `errorDetail.errors`/`description`; success → toast + list refresh. **Edit:** 400 only (no 409); success → toast + row update.
- **Deactivate:** confirm via `ActionsService.showGlobalAlert` (confirm/cancel callbacks) — the repo has no `p-confirmdialog` (bilateral decision D-6a); on success, refresh the affected row.
- Interacts with `httpErrorInterceptor` for generic 5xx; mutation calls opt into `useResultInterceptor` so `MainResponse.status` is inspectable.

---

## 7. Real-Time Considerations
- None. No `WebsocketService` events are emitted or consumed. (Mappings are admin-curated, low-frequency; a manual list refresh after mutation is sufficient.)

---

## 8. Performance
- Lazy `loadComponent` keeps the route out of the initial bundle (NF-03).
- First load issues exactly one list request; picker option lists load lazily when the create/edit dialog opens (NF-01).
- Pagination limits payload size (default `limit=20`, max 200 server-side).

---

## 9. Accessibility
- Table rows and action buttons keyboard-reachable; dialog traps focus and restores it on close; pickers labelled; visible focus rings.
- Status conveyed by text/tag, not color alone (active/inactive, source). Respect `prefers-reduced-motion` for any dialog animation. Target WCAG 2.1 AA (NF-02).

---

## 10. Telemetry
- `ClarityService.trackEvent` on `bilateral.mapping.created` / `bilateral.mapping.updated` / `bilateral.mapping.deactivated` with `{ mapping_id?, agresso_agreement_id, clarisa_project_id }`, consistent with the existing `bilateral.tag.override.saved` event.

---

## 11. Design Decisions (Decision Record)

- **2026-07-01 — Native Angular page over iframing the SSR shell.** Decision: rebuild the React SSR page as a native STAR Center Admin page (proposal Option A). Alternatives: iframe the SSR page (Option B), do nothing (Option C). Rationale: consistent admin UX, one UI to maintain, reuses proven backend + existing in-repo template (`sdg-management`).
- **2026-07-01 — Thin feature service returning result objects, not raw HTTP.** Decision: `BilateralMappingService` returns `{ ok, status, description, data? }` for mutations. Rationale: lets the component branch on 400/409 declaratively, mirroring `BilateralService.patchTag` (`PatchTagResult`).
- **2026-07-01 — Reuse `GET_FindContracts` for the AGRESSO picker.** Decision: source AGRESSO contract options from the existing `GET_FindContracts({ 'pool-funding-contributor': true })` rather than binding the SSR page's `/api/v1/agresso/contracts`. Rationale: the client already has this method + type; avoids a duplicate binding. **Contingent on OQ-1** live-verify.
- **2026-07-01 — Deactivate confirmation via `ActionsService.showGlobalAlert`, not `p-confirmdialog`.** Decision/Rationale: the repo has no `p-confirmdialog`; consistent with bilateral decision **D-6a**.
- **2026-07-01 — Pickers may use raw PrimeNG where the wrapped custom-field service-locator model doesn't fit.** Consistent with bilateral decision **D-8a**; prefer wrapped fields when they fit (as `sdg-management` does).
- **2026-07-01 — OQ-1 resolved from backend source + runtime (backend team).** Contract confirmed against `alliance-research-indicators-main` branch `AC-1594-bilateral-module-v2` (79 commits ahead of `main`, NOT merged): mapping CRUD at `bilateral-project-mappings`; list `{items,meta}`; CLARISA picker `tools/clarisa/projects/bilateral` under `RolesGuard`+CENTER_ADMIN/SYSTEM_ADMIN (runtime 200); AGRESSO picker via existing `GET_FindContracts`. **409 semantics:** fires **only on POST**; human message in `errorDetail.errors`, `description` = `"ConflictException"`. Testing-env availability depends on which branch devops tracks for testing (see §13 R-6). Local backend DB was seeded for manual verify: A511 & D527 `is_pool_funding_contributor=true`; D504 mapped to CLARISA project 22 (mapping id 11).
- **2026-07-01 — Read `errorDetail.errors` for user-facing API error text.** Decision: surface `MainResponse.errorDetail.errors`, falling back to `description`. Rationale: backend puts the readable conflict/validation message in `errors`; `description` carries the exception class name. Note: the sibling `agresso-pool-funding-tag` currently reads `description` for its 400 path — that surface is out of scope here but the same `errors`-first pattern is the correct convention going forward.

No deviation from the global system-design/detailed-design blueprints is introduced; the page slots into the existing `administration/center-admin` module tier. Add the new page to `docs/detailed-design/detailed-design.md` §2 page map during `/sdd-archive`.

---

## 12. Testing Strategy
- **Service** (`bilateral-mapping.service.spec.ts`): `HttpTestingController` — assert URL + params for `list` (query serialization, omitted empties), create/update/deactivate; assert `MainResponse<T>` unwrap; cover 400 and **409** branches returning the result object.
- **Component** (`bilateral-mapping.component.spec.ts`): load → renders rows/empty/error; search/filter reset to page 1; create Save disabled until both pickers set; 409 create surfaces conflict message; deactivate requires confirm; **role-conditional**: menu/route hidden/blocked for non-admin.
- **Guard/route:** existing `centerAdminGuard` coverage extended to the new path if a route table test exists.
- **Coverage:** must not push project metrics below the detailed-design §10 floors.
- **Manual:** golden path against live backend — create a mapping, hit the 409 by re-mapping the same agreement, edit notes, deactivate; verify light/dark.

---

## 13. Risks & Mitigations
- **R-1 — Picker endpoint/shape drift (OQ-1).** Mitigation: verify against running backend Swagger in the first task; keep picker option mapping isolated in the service so a path change is one-line.
- **R-2 — Envelope shape (`{items,meta}` vs bare array).** Mitigation: assert in the service spec; normalize in one place.
- **R-3 — Auth parity mismatch (guard vs server roles).** Mitigation: manual verify with a center-admin and a non-admin account; server stays authoritative (403 handled gracefully).
- **R-6 — Endpoints live only on `AC-1594-bilateral-module-v2`, not `main`.** The backend CRUD + picker endpoints are on the unmerged v2 branch (79 commits ahead). Mitigation: confirm with devops which branch the testing env tracks before end-to-end sign-off; FE dev/tests proceed against fixtures/local independently. Tracked as an open item (tasks §9 / OQ-DEPLOY).
- **R-7 — Mapping does not (yet) drive the "Contributing to Pool Funding" tag (product intent gap).** Product intent (clarified 2026-07-01): a bilateral mapping SHOULD make the project show the pool-funding tag. Reality: the tag is driven only by `agresso_contracts.is_pool_funding_contributor`, decoupled from `bilateral_project_mapping` (verified in backend source). Impact: users who map a project (e.g. D504) expect the badge and don't see it. Mitigation: **backend follow-up** — see requirements OQ-POOL. Out of scope for this FE spec; this admin page's CRUD is correct as built. NOT a defect in this feature.
- **R-4 — Wrapped custom-field pickers may not fit the async-search need.** Mitigation: fall back to raw PrimeNG `p-autocomplete`/`p-select` per D-8a.
- **R-5 — SSR page and Angular page diverge while both live.** Mitigation: deactivate is idempotent and server-authoritative; schedule SSR retirement (OQ-4) promptly after validation.

---

## 14. References
- [`requirements.md`](./requirements.md) · [`proposal.md`](./proposal.md)
- [`../../../prd.md`](../../../prd.md) · [`../../../system-design/design.md`](../../../system-design/design.md) · [`../../../detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md)
- In-repo analogs: `.../center-admin/sdg-management/`, `.../center-admin/agresso-pool-funding-tag/`, `shared/services/bilateral.service.ts`, `shared/services/api.service.ts`.
- Backend: `alliance-research-indicators-main/.../domain/entities/bilateral-project-mapping/` + `.../admin/client/pages/BilateralProjectMappings.tsx`.
