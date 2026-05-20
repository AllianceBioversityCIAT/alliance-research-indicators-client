# Design — Bilateral Module / Tag Visibility

> How we'll implement [`./requirements.md`](./requirements.md). Follows the template at [`../../general-setup/design.md`](../../general-setup/design.md). Pairs with [`./tasks.md`](./tasks.md) (Phase 3 — not yet written).

---

## 1. Architectural overview

This spec adds **one new shared service** (`BilateralService`), **two new methods on `ApiService`** (`GET_AgressoContract`, `PATCH_PoolFundingTag`), **one new lazy-loaded admin page** (`agresso-pool-funding-tag/`), and **incremental edits** to the contract-listing surfaces (`my-projects`, `project-detail`, and — once enriched server-side — `results-center` / `search-a-result`). It introduces no new module-level concept: it rides the existing Angular 19 + PrimeNG 19 + signals + `MainResponse<T>` plumbing already documented in [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §4 and §6.

```
                              ┌────────────────────────────────┐
                              │  ApiService (existing)         │
                              │  + GET_AgressoContract         │
                              │  + PATCH_PoolFundingTag        │
                              └──────────────┬─────────────────┘
                                             │ MainResponse<T>
            ┌────────────────────────────────┼─────────────────────────────────┐
            │                                │                                 │
   ┌────────▼─────────┐         ┌────────────▼──────────────┐      ┌───────────▼────────────┐
   │ MyProjectsService│         │  BilateralService (NEW)   │      │ ResultsCenterService   │
   │ (extended:       │         │  - currentContract sig    │      │ (extended ONLY if      │
   │  poolFundingOnly │         │  - loading / saving sigs  │      │  OQ-TV-1 resolves YES) │
   │  in filters)     │         │  - getContract(code)      │      └────────────────────────┘
   └────────┬─────────┘         │  - patchTag(code, value)  │
            │                   └────────┬──────────────────┘
            │                            │
   ┌────────▼─────────┐         ┌────────▼──────────────────────┐
   │ MyProjectsComp.  │         │ AgressoPoolFundingTagComp.    │
   │ ProjectItemComp. │         │ (NEW, /administration/.../    │
   │ ProjectDetailComp│         │  agresso-pool-funding-tag)    │
   └──────────────────┘         └───────────────────────────────┘
```

No socket work in this spec — the only Pool Funding socket event (`result.pool-funding-alignment.changed`) belongs to the sibling [`alignment-section/`](../alignment-section/) spec.

---

## 2. Data model

### 2.1 Extensions to existing interfaces

**`@interfaces/find-contracts.interface.ts`** — extend `FindContracts`:

```ts
export interface FindContracts {
  // …all existing fields…
  is_pool_funding_contributor?: boolean;   // NEW — present when backend flag is on
}
```

Optional (?) is deliberate: when `ARI_BILATERAL_MODULE_ENABLED=false` the backend omits the field, and the UI treats absent === `false` per [`requirements.md` A-1](./requirements.md#12-assumptions--open-questions).

### 2.2 New interfaces

**`@interfaces/bilateral/agresso-contract.interface.ts`** (new file):

```ts
import { FindContracts } from '../find-contracts.interface';

export interface AgressoContract extends Pick<FindContracts,
  'agreement_id' | 'description' | 'funding_type' | 'is_pool_funding_contributor'
> {
  agreement_id: string;                     // re-narrow to required
  is_pool_funding_contributor: boolean;     // re-narrow to required
  is_bilateral: boolean;                    // server-side flag (drives REQ-BIL-TV-08)
}

export interface PoolFundingTagPatchBody {
  is_pool_funding_contributor: boolean;
}

export interface PoolFundingTagPatchResponse {
  agreement_id: string;
  is_pool_funding_contributor: boolean;
  updated_at: string;
}
```

> The shape mirrors `PoolFundingTagDto` in [`../ari-backend-context/frontend-handoff.md` §4.1](../ari-backend-context/frontend-handoff.md#41-agresso-pool-funding-tag-us1). `is_bilateral` is read from the GET so the override UI can show a clean disabled-state for non-bilateral contracts *before* trying to PATCH (defense in depth on top of AC-08.1).

### 2.3 Wire vs view shape

No wire/view divergence. The UI binds directly to the wire fields, including the snake_case `is_pool_funding_contributor` (consistent with the rest of the codebase — `result_status`, `result_official_code`, etc.). No mapper introduced.

---

## 3. API contracts

| Method | URL | Service / Method | Request | Response | Notes |
|--------|-----|------------------|---------|----------|-------|
| GET | `agresso/contracts/find-contracts` *(existing)* | `ApiService.GET_FindContracts(filters)` | Existing query params **plus** new optional `pool-funding-contributor=true\|false` | `MainResponse<FindContractsResponse>` (now with `is_pool_funding_contributor` on each row) | Extend the filter type with `'pool-funding-contributor'?: boolean`. No URL/path change. |
| GET | `agresso/contracts/:code` *(existing or to confirm)* | `ApiService.GET_AgressoContract(code)` *(new)* | path param `code` | `MainResponse<AgressoContract>` | Used by the center-admin page lookup. If the path differs from `:code`, adjust during T-BIL-TV-03 execution; document any divergence here. |
| PATCH | `agresso/contracts/:code/pool-funding-tag` *(new)* | `ApiService.PATCH_PoolFundingTag(code, body)` *(new)* | `code` path + `PoolFundingTagPatchBody` | `MainResponse<PoolFundingTagPatchResponse>` | Center Admin / System Admin only (server). Body is the minimal DTO from the handoff. |

### 3.1 ApiService additions (drop next to the existing AGRESSO block in `api.service.ts`)

```ts
GET_AgressoContract = (code: string): Promise<MainResponse<AgressoContract>> => {
  const url = () => `agresso/contracts/${encodeURIComponent(code)}`;
  return this.TP.get(url(), {});
};

PATCH_PoolFundingTag = (
  code: string,
  body: PoolFundingTagPatchBody
): Promise<MainResponse<PoolFundingTagPatchResponse>> => {
  const url = () => `agresso/contracts/${encodeURIComponent(code)}/pool-funding-tag`;
  return this.TP.patch(url(), body, { useResultInterceptor: true });
};
```

> `useResultInterceptor: true` mirrors the pattern used by `PATCH_GeoLocation` (line 685 of `api.service.ts`) so 400/409 surface through the same path as other domain mutations. The httpErrorInterceptor handles 5xx + 401; the result interceptor is what we co-opt for 400 inline rendering (see §6).

### 3.2 Extend `GET_FindContracts` filter typing

In `api.service.ts` around the existing `GET_FindContracts` declaration (~line 622), add to the inline filters type:

```ts
'pool-funding-contributor'?: boolean;
```

`buildFindContractsParams` already passes unknown keys through to `HttpParams` — verify in T-BIL-TV-04, add the explicit map entry if needed.

### 3.3 Error model

Every response flows through `MainResponse<T>` per [`detailed-design.md` §4.2](../../../detailed-design/detailed-design.md). Status-specific handling:

| Code | Where surfaced | Notes |
| --- | --- | --- |
| 200 | Toast (success) + signal update | AC-07.6 |
| 400 (`description` ~ "bilateral") | Inline below contract-code input | AC-08.1 — see §6 for the suppression mechanic |
| 401 | `jWtInterceptor` → refresh → retry once, then logout | Existing global behavior; no spec-level change |
| 403 | Existing global toast | Should not occur given `centerAdminGuard`, but mirrored for defense |
| 5xx | Existing `httpErrorInterceptor` toast | No special handling here |

---

## 4. Frontend architecture

### 4.1 Routes

Add **one** new child route under the existing `''` (platform shell) parent in [`app.routes.ts`](../../../../research-indicators/src/app/app.routes.ts):

```ts
{
  path: 'administration/center-admin/agresso-pool-funding-tag',
  loadComponent: () =>
    import('@platform/pages/administration/center-admin/agresso-pool-funding-tag/agresso-pool-funding-tag.component')
      .then(m => m.default),
  canMatch: [centerAdminGuard],
  data: {
    title: 'AGRESSO Pool Funding Tag',
    isLoggedIn: true
  }
}
```

Position: in the alphabetical center-admin block immediately after `bulk-upload` and before `sdg-management`. No path-alias additions (the new file lives under existing `@platform/*`).

### 4.2 Components

#### 4.2.1 NEW — `AgressoPoolFundingTagComponent`

- **Path**: `src/app/pages/platform/pages/administration/center-admin/agresso-pool-funding-tag/agresso-pool-funding-tag.component.{ts,html,scss,spec.ts}`
- **Standalone**, `default export`, `ChangeDetectionStrategy.OnPush` (matches `SdgManagementComponent`).
- **Layout** (3 stacked cards inside the existing platform shell):
  1. *Contract lookup* — single text input (custom-fields-styled), **Look up** button, inline error slot.
  2. *Contract summary* — read-only `agreement_id`, `description`, `funding_type`, current `is_pool_funding_contributor` value rendered as `CustomTagComponent`.
  3. *Override* — PrimeNG `InputSwitch` for the new value, optional justification `textarea` (existing `textarea-validation.service`), **Save** button (disabled until value changes), success state.
- **Signals**:
  - `contractCode: WritableSignal<string>` — bound to lookup input
  - `loading: Signal<boolean>` — proxied from `BilateralService.loadingContract`
  - `saving: Signal<boolean>` — proxied from `BilateralService.savingTag`
  - `contract: Signal<AgressoContract | null>` — proxied from `BilateralService.currentContract`
  - `newValue: WritableSignal<boolean | null>` — switch state, `null` until contract loads
  - `justification: WritableSignal<string>`
  - `inlineError: WritableSignal<string | null>` — drives AC-08.1
- **Behaviors**:
  - On mount, read `contract-code` query param. If present, pre-fill input and auto-look-up.
  - On look-up: call `bilateralService.getContract(code)`; if `is_bilateral === false`, render the override card disabled with an explanatory note ("This contract is not bilateral — the tag cannot be set."); inline error stays empty.
  - On save: call `bilateralService.patchTag(code, value)`; on 200 fire `actions.showToast({ severity: 'success', ... })` and refresh `currentContract`. On 400, set `inlineError` and `return` (no toast).

#### 4.2.2 EXTENDED — `MyProjectsComponent` + `MyProjectsService`

- Add a **Pool Funding column** between **Lever** and **Status** in `my-projects.component.html`. The column body uses `<app-custom-tag>` with the new "pool-funding" status code (see §4.6).
- Add a **filter sidebar entry** ("Pool Funding only") next to Lever/Status, wired through `MyProjectsFilters`:
  ```ts
  export class MyProjectsFilters {
    // …existing…
    poolFundingOnly = false;
  }
  ```
- In `MyProjectsService.applyFilters()`, when `filters.poolFundingOnly === true`, add `params['pool-funding-contributor'] = true` to the request.
- In `getActiveFilters` computed, append `{ label: 'POOL FUNDING', value: 'Only Pool Funding' }` when active.
- Extend `removeFilter()` mapping to clear `poolFundingOnly`.
- Sort: extend `mapTableFieldToApiField` with `is_pool_funding_contributor: 'pool-funding-contributor'`.

#### 4.2.3 EXTENDED — `ProjectItemComponent` (card view)

- Add an optional **`@Input() isPoolFunding?: boolean`** (default `false`).
- When `true`, render an additional small `<app-custom-tag>` after the lever badge.
- Pass `project.is_pool_funding_contributor` from the my-projects card-view template.
- **OQ-TV-4** is resolved here: the badge sits to the right of the lever badge, same row, separated by 8 px (`rs-gap-2`). Validate in design QA before merge — if Figma diverges, update the template only.

#### 4.2.4 EXTENDED — `ProjectDetailComponent`

- Bind the Pool Funding badge into the contract header alongside the contract code (AC-02.1).
- When the user has Center Admin permission (`rolesService.canAccessCenterAdmin()`), wrap the badge in an `<a [routerLink]="...">` to the override page (AC-02.3). Otherwise plain badge.
- The component already injects `RolesService`; no new injection.

#### 4.2.5 EXTENDED — `ResultsCenterComponent` & `SearchAResultComponent` (conditional)

- **Only if OQ-TV-1 resolves "result-list endpoints enrich rows with `is_pool_funding_contributor`"**.
- Adds a hideable "Pool Funding" column behind the existing column-configuration sidebar.
- If OQ-TV-1 resolves "no" (current best understanding — see §11), these surfaces drop from this spec. Track as deferred in `tasks.md` §9 Open Items.

### 4.3 State boundaries

- **Component-local signals** for the new center-admin page form state (`contractCode`, `newValue`, `justification`, `inlineError`).
- **`BilateralService` signals** for shared state across bilateral surfaces: `currentContract`, `loadingContract`, `savingTag`. These will be re-used by [`alignment-section/`](../alignment-section/) and [`indicator-mapping/`](../indicator-mapping/) — laying the foundation now avoids rework.
- **Existing `MyProjectsService` signals** absorb the new `poolFundingOnly` filter.
- **`sessionStorage`** persists the filter via the existing `activateStatePersistence` flow. No new persistence key.
- **`localStorage`** is not touched. No new persisted client state introduced.

### 4.4 Services

#### 4.4.1 NEW — `BilateralService`

- **Path**: `src/app/shared/services/bilateral.service.ts` (`@services/bilateral.service`).
- **`providedIn: 'root'`** (singleton; will be re-used across the three feature folders).
- **Surface**:

```ts
@Injectable({ providedIn: 'root' })
export class BilateralService {
  private readonly api = inject(ApiService);
  private readonly actions = inject(ActionsService);

  readonly currentContract = signal<AgressoContract | null>(null);
  readonly loadingContract = signal(false);
  readonly savingTag = signal(false);

  async getContract(code: string): Promise<AgressoContract | null> {
    this.loadingContract.set(true);
    try {
      const res = await this.api.GET_AgressoContract(code);
      if (!res.successfulRequest) {
        this.currentContract.set(null);
        return null;
      }
      this.currentContract.set(res.data);
      return res.data;
    } finally {
      this.loadingContract.set(false);
    }
  }

  async patchTag(
    code: string,
    value: boolean
  ): Promise<{ ok: true; data: PoolFundingTagPatchResponse } | { ok: false; status: number; description: string }> {
    this.savingTag.set(true);
    try {
      const res = await this.api.PATCH_PoolFundingTag(code, { is_pool_funding_contributor: value });
      if (res.successfulRequest) {
        this.currentContract.update(c => (c ? { ...c, is_pool_funding_contributor: value } : c));
        return { ok: true, data: res.data };
      }
      return { ok: false, status: res.status, description: res.errorDetail?.description ?? '' };
    } finally {
      this.savingTag.set(false);
    }
  }
}
```

- **Why a domain service rather than just `ApiService`?** Three reasons: (1) shared signals (`currentContract`) span the three bilateral sub-specs; (2) the `patchTag` return shape encodes the inline-error vs. toast decision in one place; (3) keeps the per-component code thin and unit-testable.
- **Why does it still go through `ApiService`?** Per child [`CLAUDE.md`](../../../../research-indicators/src/CLAUDE.md) — "always wrap HTTP calls behind `ApiService`". `BilateralService` is a thin domain facade, not an HTTP layer.

#### 4.4.2 EXTENDED — `ApiService`

- Two new methods per §3.1.
- Filter typing for `GET_FindContracts` per §3.2.

### 4.5 Forms

The center-admin page uses **reactive form fields** wrapped per the existing custom-fields styles. Specifically:

- Contract-code input: `formControlName="contractCode"`, validator `Validators.required` + `Validators.pattern(/^[A-Za-z0-9-]+$/)`.
- New-value switch: `formControlName="newValue"` (boolean).
- Justification: `formControlName="justification"`, max 500 chars, no `Validators.required` (optional per AC-07.4).
- The form is disabled until a contract loads (`form.disable()` in `getContract.finally`).

Inline error rendering (AC-08.1):
- Below the contract-code input, a `<small role="alert" aria-live="polite">` element conditionally renders `inlineError()`.
- Set inline error in `onSave()` when `patchTag` returns `{ ok: false }` and `status === 400` and `description.toLowerCase().includes('bilateral')`. Suppress the global toast by short-circuiting in `BilateralService.patchTag` for 400-with-bilateral (do NOT call `actions.showToast`); the existing `httpErrorInterceptor` only fires on 5xx — verify in T-BIL-TV-09.

Final copy lock (resolves **OQ-TV-2**):

> "This contract is not bilateral. Only bilateral contracts can carry the Pool Funding tag."

If design pushes back at QA, swap the string in one place (the template literal in the component) — no other change required.

### 4.6 Theming

The Pool Funding tag is a new categorical visual. Add an entry to `STATUS_COLOR_MAP` in `@shared/constants/status-colors`:

```ts
'pool-funding': {
  color: 'var(--ac-pool-funding-fg)',
  background: 'var(--ac-pool-funding-bg)',
  border: 'var(--ac-pool-funding-border)'
}
```

Add the three tokens to `src/styles/colors.scss` (dark + light variants — no hex literals in component code, per child [`CLAUDE.md`](../../../../research-indicators/src/CLAUDE.md)):

```scss
:root {
  --ac-pool-funding-fg: #1B5E20;
  --ac-pool-funding-bg: #E8F5E9;
  --ac-pool-funding-border: #2E7D32;
}
html.dark {
  --ac-pool-funding-fg: #A5D6A7;
  --ac-pool-funding-bg: rgba(46, 125, 50, 0.18);
  --ac-pool-funding-border: #66BB6A;
}
```

Colors are working values pending design review (see §13 R-1). The named-token approach lets us swap in one place if design assigns a different palette.

---

## 5. Security & authorization

- All read surfaces ride the existing platform `rolesGuard` (logged-in check).
- The new center-admin route uses `canMatch: [centerAdminGuard]`. Verified: `RolesService.canAccessCenterAdmin()` returns `true` for both `CENTER_ADMIN` and `SYSTEM_ADMIN` per `RolesService` source (confirm during T-BIL-TV-06 by reading `roles.service.ts`; if not, extend the guard rather than inventing a parallel one). This resolves **Assumption A-4** in `requirements.md`.
- **No new persistence of sensitive data.** Tokens stay in their existing `localStorage` slots (touched only by `cognito.service.ts` + `jWtInterceptor`). Justification text is sent to the server only — never cached client-side.
- **Backend remains authoritative.** Client only mirrors visible affordances. A user who somehow reaches the override page without `CENTER_ADMIN` would still be rejected by the server (`@Roles(CENTER_ADMIN, SYSTEM_ADMIN)`).

---

## 6. Error handling

### 6.1 400 (non-bilateral) — inline, no toast

`BilateralService.patchTag` resolves to `{ ok: false, status: 400, description }` when the backend rejects. The component reads `description`, matches it against `/bilateral/i`, and writes the locked AC-08.2 copy to `inlineError()`.

Suppression mechanic: the global `httpErrorInterceptor` already does not toast for 400 by default (it toasts on 401, 403, 5xx — confirm in T-BIL-TV-09). The `useResultInterceptor: true` flag on the PATCH means the result interceptor *would* otherwise surface a toast — check `result.interceptor.ts` and, if a generic 400 toast fires there, pass `{ useResultInterceptor: false }` for this PATCH (we lose the result-domain success affordances but those aren't needed here). Resolution: T-BIL-TV-09 explicit interceptor audit.

### 6.2 409 (already-synced)

This endpoint does not produce 409 per the handoff (409 is the alignment-section's territory). No special handling.

### 6.3 Network down / 5xx

Existing `httpErrorInterceptor` toast covers it. No spec-level change.

### 6.4 Empty `data` on GET success

`getContract` returns `null` and the lookup card shows "Contract not found" — render through the same inline-error slot as 400 with a distinct message ("No contract found for code `<code>`."). The save button stays disabled.

---

## 7. Real-time considerations

Out of scope for this feature folder. No socket subscriptions added. The `result.pool-funding-alignment.changed` event is the alignment-section's surface and will be handled there.

---

## 8. Performance

- **Initial chunk impact**: list / project-detail edits are existing components — only the new `BilateralService` (~3 KB pre-gzip) and the new tag entry in `STATUS_COLOR_MAP` (~0.1 KB) ship in the initial chunk. Estimated < 5 KB gzipped (well within REQ-BIL-TV-NF-03 budget of 15 KB).
- **Lazy chunk impact**: the new admin page lazy-loads. Its component + template + scss should land at ~20-30 KB pre-gzip / ~6-10 KB gzipped. Verify in T-BIL-TV-11 by running `npm run build` and reading the `dist/` stats — if it exceeds 50 KB gzipped, lazy-load PrimeNG `InputSwitch` separately.
- **Render impact**: REQ-BIL-TV-NF-01 (≤ 50 ms added at render time on a 100-row fixture). The new column is a pure `<app-custom-tag>` per row — no API call, no template binding more expensive than the existing Lever column. Validate in T-BIL-TV-13.
- **Network impact**: zero new requests on the read surfaces (the new field rides existing `GET_FindContracts`). The override page adds one GET per look-up + one PATCH per save — bounded by user action.

---

## 9. Accessibility (WCAG 2.1 AA — PRD C-4)

- **Tag**: `<app-custom-tag>` already wraps PrimeNG `Tag`. Add `[attr.aria-label]="'Pool Funding contract'"` on the host when rendered in a list. The tag's contrast against `--ac-pool-funding-bg` must hit AA — verify with the contrast checker referenced in [`docs/system-design/design.md`](../../../system-design/design.md) §7.4; if the chosen palette fails, adjust the dark-mode variant first (typical failure mode).
- **Filter**: the new "Pool Funding only" checkbox in the filter sidebar has an associated `<label>` with `for=` matching the input's `id`.
- **Override page**:
  - Logical tab order: contract code input → Look up → switch → justification → Save.
  - `<label>` elements wrap inputs.
  - `aria-live="polite"` on the inline-error region (§4.5).
  - Buttons hit-target ≥ 44×44 px.
  - `aria-busy="true"` on the form while `saving()` is true.
- **No motion** added. `prefers-reduced-motion` n/a.

---

## 10. Telemetry

- Fire `bilateral.tag.override.saved` on success via `TrackingToolsService` (verify naming convention against existing event keys during T-BIL-TV-10). Payload: `{ contract_code, new_value, prior_value }`.
- No event on the read surfaces (zero need — these are pure list/detail extensions). The existing page-view tracking covers them.
- `BugHerd`: no new annotations.
- Error toast events flow through existing telemetry.

---

## 11. Design decisions (decision record)

> Append-only. Newest at the bottom.

- **2026-05-19 — Sub-feature split.** Adopted Option B from [`../proposal.md` §10](../proposal.md#10-recommended-approach): three sequenced feature folders (`tag-visibility`, `alignment-section`, `indicator-mapping`) sharing the four context corners. Alternatives: single-spec one-shot (Option A, rejected — would balloon `tasks.md`); split by canonical domain folder (Option C, rejected — shatters the context corners). Rationale: smallest reviewable units that preserve traceability.

- **2026-05-19 — `BilateralService` is a thin facade over `ApiService`.** All HTTP goes through `ApiService` per the child [`CLAUDE.md`](../../../../research-indicators/src/CLAUDE.md) rule; `BilateralService` owns signals + return-shape conventions + cross-feature reuse. Alternatives: drop new methods straight onto `ApiService` (rejected — three feature folders would touch `api.service.ts` heavily and lose the `currentContract` signal sharing); a dedicated HTTP service ignoring `ApiService` (rejected — violates the architectural rule). Rationale: respects the global rule while creating a sane home for shared bilateral state.

- **2026-05-19 — Result-list surfaces deferred (resolves OQ-TV-1).** Per [`../ari-backend-context/frontend-handoff.md` §4.1](../ari-backend-context/frontend-handoff.md#41-agresso-pool-funding-tag-us1), the backend enriches `/api/v1/agresso/contracts` and the projects-with-indicators sibling endpoint only. The general `/results` family is **not** enriched today. **Decision**: drop REQ-BIL-TV-03 and REQ-BIL-TV-04 (and the result-list slice of REQ-BIL-TV-05 and REQ-BIL-TV-06) from this delivery; reopen as a small follow-up spec once backend confirms enrichment. Alternatives: client-side join via N+1 lookups (rejected — performance), block this spec on backend (rejected — kills the walking-skeleton). Rationale: ship contract-side coverage now; results-side is a thin add-on later.

- **2026-05-19 — Inline error copy locked (resolves OQ-TV-2).** Copy: "This contract is not bilateral. Only bilateral contracts can carry the Pool Funding tag." Alternatives: shorter ("Contract is not bilateral.") rejected — gives no actionable reason; longer (full Pool Funding explainer) rejected — error real-estate. Rationale: states fact + constraint in one line.

- **2026-05-19 — `STATUS_COLOR_MAP` extended with a new `pool-funding` entry.** Reuses the existing pattern instead of inventing a parallel tag style. Tokens added to `colors.scss`. Alternatives: inline colors in the component (rejected — hex literals forbidden); new component (rejected — `CustomTagComponent` is the right reuse). Rationale: lowest-friction extension; design can re-paint tokens in one place.

- **2026-05-19 — Card-view tag placement (resolves OQ-TV-4).** Tag sits to the right of the lever badge in `ProjectItemComponent`, separated by `rs-gap-2`. Alternatives: top-right corner ribbon (rejected — collides with status indicator), below lever badge (rejected — eats card height). To be confirmed at design QA before merge; if Figma diverges, change the template binding only.

- **2026-05-20 — Interceptor audit findings (T-BIL-TV-08, outcome 3 — pending user decision).** Read both `result.interceptor.ts` and `http-error.interceptor.ts` end-to-end.
  - **`result.interceptor.ts`** has no error / toast logic. It mutates the request URL (adds `reportYear` + `reportingPlatforms` query params when the `X-Use-Year` header is present) and forwards. The `useResultInterceptor: true` flag on `PATCH_PoolFundingTag` therefore poses **no** double-surface risk on its own — design §6.1 was overly cautious about this interceptor.
  - **`httpErrorInterceptor` toasts on 400.** Lines 60-68: it skips toast only for 409, 401, `refresh-token` URLs, and the AI-formalize 502. All other errors (including 400) call `actions.showToast({ detail: error.error.errors, severity: 'error', summary: 'Error' })`. On a non-bilateral 400 the backend returns `{ description: "…", errors: null }`, so `error.error.errors` is `null` — producing a broken empty-detail toast on top of our planned inline error.
  - **Conflict with AC-08.3** ("The toast layer is suppressed for this specific error — avoid double-surfacing"). Three options:
    1. **URL-scoped exception in `httpErrorInterceptor`** — mirror the existing precedent (`refresh-token`, `ai/formalize`): add `!req.url.includes('/pool-funding-tag')` to the toast guard. Minimal change, consistent with existing pattern, narrow blast radius. **Recommended.**
    2. **Header-based opt-out** — add `X-Skip-Toast-On-400` header check in `httpErrorInterceptor`; set the header on `PATCH_PoolFundingTag`. More general but introduces a new client convention.
    3. **Accept the double-surface** — show both empty toast and inline error in v1; fix later. Violates AC-08.3.
  - **Resolved 2026-05-20**: user approved option 1. Applied URL-scoped exception in `httpErrorInterceptor`: added `const isPoolFundingTagValidationError = error.status === 400 && req.url.includes('/pool-funding-tag')` to the toast guard, alongside the existing `isAiFormalizeError` precedent. Non-400 errors from `/pool-funding-tag` (e.g., 500) still toast. Two new spec cases verify both branches.

- **2026-05-20 — Pool Funding tokens reduced to two; dark selector corrected (during T-BIL-TV-03).** Original §4.6 proposed three tokens (`--ac-pool-funding-fg/bg/border`) and the selector `html.dark`. After reading `custom-tag.component.html`, the existing `[style.border-color]` + `[style.color]` bindings consume only `border` + `text` — the template never sets a background fill (existing tags are outlined pills). **Decision**: ship two tokens — `--ac-pool-funding-fg`, `--ac-pool-funding-border` — and drop the `bg` token. Also corrected the dark-mode selector to `[data-theme='dark']` (the actual selector used in `colors.scss`). The `STATUS_COLOR_MAP` field name is `text` (not `color`); the new entry is `{ border: 'var(--ac-pool-funding-border)', text: 'var(--ac-pool-funding-fg)' }`. **Impact**: §4.6 of this doc has working examples that should be read as illustrative — the shipping shape is in `colors.scss` and `status-colors.ts`. Contrast verified: light text `#1b5e20` on white ≈ 9.4:1 (AAA); dark text `#a5d6a7` on `#191919` ≈ 12.5:1 (AAA).

- **2026-05-20 — R-3 resolved: no GET-by-code endpoint; lookup uses `GET_FindContracts` filtered by code (during T-BIL-TV-01 execution).** Verified `AgressoContractController` in the backend repo (`alliance-research-indicators-main`, branch `AC-1594-bilateral-module`): the controller exposes `GET /agresso/contracts` (deprecated), `GET /agresso/contracts/results/current-user`, `GET /agresso/contracts/:contractId/results/count`, `GET /agresso/contracts/find-contracts`, and `PATCH /agresso/contracts/:code/pool-funding-tag`. No `GET /agresso/contracts/:code`. **Decision**: drop the planned `ApiService.GET_AgressoContract(code)` method; the override page lookup (T-BIL-TV-09) calls `ApiService.GET_FindContracts({ 'contract-code': code, limit: 1 })` and takes the first row. **Impact**: the `AgressoContract` interface in §2.2 reduces to a re-export of `FindContracts` (typed as `AgressoContractRow = FindContracts` in `interfaces/bilateral/agresso-contract.interface.ts`) — the `is_bilateral` field is no longer carried on a dedicated GET; instead, `BilateralService` derives it client-side from `funding_type` when needed for AC-08.1 pre-disable defense (see T-BIL-TV-09 implementation notes). **Rationale**: lowest-friction path that matches the live backend; preserves the inline-error contract on PATCH 400 as the authoritative non-bilateral guard.

---

## 12. Testing strategy

### 12.1 Unit tests

| Subject | File | Coverage focus |
| --- | --- | --- |
| `BilateralService.getContract` | `bilateral.service.spec.ts` | Happy path; 404 → returns `null`; signals flip during in-flight. |
| `BilateralService.patchTag` | same | 200 → updates `currentContract` and returns `{ ok: true, data }`. 400 → returns `{ ok: false, status: 400, description }` and does NOT toast. |
| `ApiService.GET_AgressoContract` | `api.service.spec.ts` | URL encoding of `code` (semicolons, slashes). |
| `ApiService.PATCH_PoolFundingTag` | same | Body shape matches `PoolFundingTagPatchBody`; `useResultInterceptor` flag set. |
| `MyProjectsFilters` + `MyProjectsService.applyFilters` | `my-projects.service.spec.ts` | `poolFundingOnly === true` adds `pool-funding-contributor=true`; `false` omits it; `removeFilter('POOL FUNDING')` resets. |
| `MyProjectsService.getActiveFilters` | same | When `poolFundingOnly` is true, the chip appears once and only once. |
| `AgressoPoolFundingTagComponent` | `agresso-pool-funding-tag.component.spec.ts` | Pre-fill from query param; disable Save when value unchanged; inline error on 400; success toast on 200; non-bilateral disables the switch. |
| `ProjectDetailComponent` | existing spec extended | Badge renders when `is_pool_funding_contributor === true`; clickable only when `canAccessCenterAdmin()`. |
| `MyProjectsComponent` | existing spec extended | Column header rendered; cell renders tag when true. |
| `centerAdminGuard` | existing spec — verify only | `SYSTEM_ADMIN` passes (regression). |

### 12.2 Coverage delta

- New service: aim ≥ 80% statement coverage (per REQ-BIL-TV-NF-06).
- New component: aim ≥ 60%.
- No regression on `MyProjectsService` (already a heavy spec — keep coverage).
- Run `npm run test:coverage` before merge and confirm none of the floors in `jest.config.ts` (`statements 40 / branches 20 / lines 45 / functions 30`) regress.

### 12.3 Manual smoke

- As CONTRIBUTOR: my-projects column visible, filter works, no edit affordance anywhere.
- As CENTER_ADMIN: my-projects column visible, filter works, project-detail badge clickable → lands on override page pre-filled, look-up + save works, non-bilateral input shows inline error, justification persists.
- Dark mode: every new surface, both themes, contrast checked.
- Export: download Excel from my-projects, confirm "Pool Funding" column present in the correct position.

---

## 13. Risks & mitigations

- **R-1 — Token palette unconfirmed.** Working colors in §4.6 may not match Figma. *Mitigation*: tokens are named; if design assigns different hex values, only `colors.scss` changes — zero component changes. Resolve at design QA.
- **R-2 — `useResultInterceptor` double-surfacing.** If the result interceptor toasts on 400, our inline error duplicates. *Mitigation*: explicit audit in T-BIL-TV-09; switch to `useResultInterceptor: false` for this PATCH if needed.
- **R-3 — `GET_AgressoContract` path may not exist yet.** The handoff names the PATCH path explicitly but doesn't enumerate a GET-by-code. *Mitigation*: confirm in T-BIL-TV-03 against Swagger UI from [`../ari-backend-context/frontend-handoff.md` §10](../ari-backend-context/frontend-handoff.md#10-local-development-tips); if absent, the override page falls back to `GET_FindContracts` filtered by code.
- **R-4 — Card-view layout regression.** The new badge in `ProjectItemComponent` could push card height past existing breakpoints. *Mitigation*: visual regression check during T-BIL-TV-08; small-screen check via `cache.hasSmallScreen()` paths.
- **R-5 — Backend feature flag turned off in staging.** When `ARI_BILATERAL_MODULE_ENABLED=false`, `is_pool_funding_contributor` is absent. *Mitigation*: A-1 already commits us to silently treating absent as false; one test fixture exercises this case explicitly.
- **R-6 — Backend rejects `pool-funding-contributor=true` query param on non-bilateral environments.** *Mitigation*: if the backend doesn't recognize the param when the flag is off, the filter chip degrades to a no-op rather than a 4xx; the filter chip only renders when the column appears (see T-BIL-TV-04).

---

## 14. References

- PRD: [`docs/prd.md`](../../../prd.md) §3, §4, §8.3 (C-1..C-6).
- System Design: [`docs/system-design/design.md`](../../../system-design/design.md) §7 (tokens), §8 (components), §12 (decisions log — update on merge).
- Detailed Design: [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §2, §4, §6.
- Backend handoff: [`../ari-backend-context/frontend-handoff.md` §4.1](../ari-backend-context/frontend-handoff.md#41-agresso-pool-funding-tag-us1), §2, §3.
- Existing code anchors:
  - `research-indicators/src/app/shared/services/api.service.ts` ~line 622 (`GET_FindContracts`).
  - `research-indicators/src/app/shared/services/my-projects.service.ts` (`MyProjectsFilters`, `applyFilters`).
  - `research-indicators/src/app/shared/components/custom-tag/custom-tag.component.ts`.
  - `research-indicators/src/app/pages/platform/pages/administration/center-admin/sdg-management/sdg-management.component.ts` (component pattern).
  - `research-indicators/src/app/shared/guards/center-admin.guard.ts`.
- Sibling specs (future): [`../alignment-section/`](../alignment-section/), [`../indicator-mapping/`](../indicator-mapping/).
