# Design — Bilateral Module / Alignment Section

> How we'll implement [`./requirements.md`](./requirements.md). Follows the template at [`../../general-setup/design.md`](../../general-setup/design.md). Pairs with [`./tasks.md`](./tasks.md) (Phase 3 — not yet written).

---

## 1. Architectural overview

This spec adds **one new lazy-loaded result-tab component** (`PoolFundingAlignmentComponent`), **two new methods on `ApiService`** (`GET_PoolFundingAlignment`, `PATCH_PoolFundingAlignment`), **extends `BilateralService`** with alignment state + methods, **adds a new sidebar entry** to `ResultSidebarComponent` driven by an eligibility signal, and **subscribes to one new Socket.IO event** (`result.pool-funding-alignment.changed`) via the existing `WebsocketService`. It introduces no new architectural concept — all foundations were laid in tag-visibility:

- `BilateralService` already exists as a singleton facade over `ApiService`.
- `httpErrorInterceptor` already has the URL-scoped exception pattern (refresh-token, ai-formalize, `/pool-funding-tag`) — extend with `/pool-funding-alignment`.
- `ResultSidebarComponent.SidebarOption.hide` already supports dynamic visibility.
- `WebsocketService.listen(eventName)` already returns Observables (Socket.IO via `ngx-socket-io`).

```
                                ┌────────────────────────────────────────────┐
                                │  ApiService (existing, extended)            │
                                │  + GET_PoolFundingAlignment                 │
                                │  + PATCH_PoolFundingAlignment               │
                                └──────────────────┬──────────────────────────┘
                                                   │ MainResponse<T>
                                                   │
              ┌────────────────────────────────────▼──────────────────────────┐
              │  BilateralService (existing, extended)                         │
              │  + currentAlignment: signal<AlignmentResponse|null>            │
              │  + loadingAlignment, savingAlignment signals                   │
              │  + getAlignment(resultCode)                                    │
              │  + patchAlignment(resultCode, body) → PatchAlignmentResult     │
              │  + editable = computed(role + ownership)                       │
              └─┬──────────────────────────────────────────┬────────────────┬─┘
                │                                          │                │
   ┌────────────▼──────────────┐         ┌─────────────────▼────┐  ┌────────▼────────────────┐
   │ PoolFundingAlignment      │         │ ResultSidebarComponent│  │ WebsocketService        │
   │ Component (NEW)           │         │ (extended — new       │  │ (existing)              │
   │ /result/:resultCode/      │         │  SidebarOption with   │  │ .listen('result.pool-   │
   │ pool-funding-alignment    │         │  hide-on-eligibility) │  │   funding-alignment.    │
   │                           │         └───────────────────────┘  │   changed')             │
   │ • toggle (has_contribution)│                                   └──────────┬──────────────┘
   │ • lever multiselect       │                                              │
   │ • justification textarea  │                                              │
   │ • Save + Synced badge     │  ◀─────  socket reconcile ─────────────────┘
   └───────────────────────────┘
```

No new socket library, no new auth flow, no new state-management concept.

---

## 2. Data model

### 2.1 New interfaces

Add to `src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts` (new file alongside the existing `agresso-contract.interface.ts`):

```ts
export interface AlignmentLever {
  lever_code: string;
  lever_name: string;
}

export interface AlignmentResponse {
  result_code: string;
  eligible: boolean;
  has_pool_funding_alignment_eligible: boolean;     // alias — reads identical to `eligible`
  has_contribution: boolean | null;                 // null = never set
  selected_levers: AlignmentLever[];
  justification?: string;                           // optional server-side
  is_synced_to_prms: boolean;
  is_read_only: boolean;
}

export interface UpdatePoolFundingAlignmentDto {
  has_contribution: boolean;
  lever_codes?: string[];                           // required when has_contribution=true; ≥1 entry
  justification?: string;
}

export interface AlignmentChangedEvent {
  result_code: string;
  by_user_id: number;
  at: string;                                       // ISO 8601
}
```

> Shapes mirror [handoff §4.2 + §4.3 + §6](../ari-backend-context/frontend-handoff.md). `has_pool_funding_alignment_eligible` is the alias the handoff exposes for `eligible`; both fields are always present and identical — the client reads `eligible` and treats the alias as ignorable.

### 2.2 Extensions to existing types

No changes to `agresso-contract.interface.ts`. No widening of `Result` interface — eligibility is fetched directly via the alignment GET.

### 2.3 Wire vs view shape

No wire/view divergence. The component binds directly to `AlignmentResponse` and submits `UpdatePoolFundingAlignmentDto` verbatim — no DTO mapper.

---

## 3. API contracts

| Method | URL | Service method | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `results/:resultCode/pool-funding-alignment` (new) | `ApiService.GET_PoolFundingAlignment(resultCode)` | path param | `MainResponse<AlignmentResponse>` | Bearer JWT. Drives tab visibility + form pre-fill. |
| PATCH | `results/:resultCode/pool-funding-alignment` (new) | `ApiService.PATCH_PoolFundingAlignment(resultCode, body)` | `UpdatePoolFundingAlignmentDto` | `MainResponse<AlignmentResponse>` | Bearer JWT. 200 / 400 / 409 paths. |

### 3.1 ApiService additions

Drop near the existing AGRESSO block in `api.service.ts`:

```ts
GET_PoolFundingAlignment = (resultCode: string): Promise<MainResponse<AlignmentResponse>> => {
  const url = () => `results/${encodeURIComponent(resultCode)}/pool-funding-alignment`;
  return this.TP.get(url(), {});
};

PATCH_PoolFundingAlignment = (
  resultCode: string,
  body: UpdatePoolFundingAlignmentDto
): Promise<MainResponse<AlignmentResponse>> => {
  const url = () => `results/${encodeURIComponent(resultCode)}/pool-funding-alignment`;
  return this.TP.patch(url(), body, {});
};
```

> **Note**: We deliberately do **NOT** set `useResultInterceptor: true` here. The `result.interceptor` adds `reportYear` and `reportingPlatforms` query params from the route — which we don't need for alignment (alignment is always the latest version). Confirmed during T-BIL-TV-08 that `result.interceptor` does not toast on errors; its only side effect is URL mutation. Omitting the flag keeps the URL clean.

### 3.2 Interceptor URL-scoped exception extension

Extend `httpErrorInterceptor` with one additional URL exception (mirrors the `/pool-funding-tag` precedent from T-BIL-TV-08):

```ts
const isPoolFundingAlignmentValidationError =
  error.status === 400 && req.url.includes('/pool-funding-alignment');
```

Added to the toast-suppression chain. Inline-error rendering owns the user message for 400-with-bilateral-validation responses.

### 3.3 Error model

| Code | Where surfaced | Notes |
| --- | --- | --- |
| 200 | Form repaint + signal update + success toast | AC-06.2 |
| 400 | Inline below offending field | AC-06.3. Toast suppressed via interceptor URL exception. |
| 401 | Global `jWtInterceptor` (refresh → retry → logout on second 401) | No spec-level change. |
| 403 | Shouldn't occur for non-owners because we hide Save; defensive global toast covers the edge case. | — |
| 409 | Refetch alignment, transition to read-only, warning toast | AC-12.1 |
| 5xx | Global `httpErrorInterceptor` toast | Form state preserved for retry. |

---

## 4. Frontend architecture

### 4.1 Routes

Add **one** new child route under `/result/:id` in `app.routes.ts`, placed alphabetically between `partners` and `policy-change` (or wherever fits — but child order in `app.routes.ts` is not user-visible since the sidebar drives navigation):

```ts
{
  path: 'pool-funding-alignment',
  loadComponent: () =>
    import('@platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component')
      .then(m => m.default),
  data: createResultData()
}
```

No new guard — eligibility is enforced at the sidebar layer and at the component layer (redirect if `!eligible`). The route itself remains reachable for authenticated users to allow direct URL navigation; the component handles the ineligible-redirect case (AC-01.2).

### 4.2 Components

#### 4.2.1 NEW — `PoolFundingAlignmentComponent`

- **Path**: `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.{ts,html,scss,spec.ts}`.
- **Standalone**, **default export**, **OnPush** — matches every other result tab.
- **Imports**: `FormsModule`, `MultiselectComponent` (shared), `FormHeaderComponent`, `NavigationButtonsComponent`, `ButtonModule`, `SelectButtonModule` (PrimeNG), `TextareaModule` (PrimeNG), `TooltipModule`, `CustomTagComponent`.
- **Layout** (top to bottom inside the existing result-tab shell):
  1. **Header**: `<app-form-header>` with title "Pool Funding Alignment". When `is_read_only`, the Synced badge sits in the header (right side).
  2. **Read-only banner** (only when `!editable` for the current user): subtle inline notice "You don't have permission to edit this section."
  3. **Synced banner** (only when `is_read_only`): non-dismissible inline notice "This result has been pushed to PRMS. Alignment can no longer be edited from STAR."
  4. **Contribution toggle** ("Does this result contribute to Pool Funding?"): `<p-selectButton>` with options `Yes / No`. Pre-selected from `has_contribution` if non-null; otherwise none selected.
  5. **Lever multiselect** (only when `has_contribution=true`): `<app-multiselect serviceName="levers">` bound to `selectedLeverCodes` signal.
  6. **Justification textarea** (always shown when editable; rendered as static text below when not): `<textarea pTextarea>` with `maxlength="500"` + `X / 500` counter.
  7. **Navigation buttons + Save**: `<app-navigation-buttons>` (existing component used by all result tabs); Save is a `<p-button>` placed at the end of the form. Save is hidden when `!editable` or `is_read_only`.
- **Signals** (component-local):
  - `loading = bilateralService.loadingAlignment` (proxied)
  - `saving = bilateralService.savingAlignment` (proxied)
  - `alignment = bilateralService.currentAlignment` (proxied)
  - `editable = bilateralService.editable` (proxied; see §4.4.1)
  - `isReadOnly = computed(() => !!alignment()?.is_read_only)`
  - `eligible = computed(() => !!alignment()?.eligible)`
  - **Form state** (WritableSignals): `hasContribution`, `selectedLeverCodes`, `justification`. Seeded from `alignment()` in an `effect`.
  - `isDirty = computed(() => /* compare form state vs alignment() */)`
  - `canSave = computed(() => editable() && !isReadOnly() && isDirty() && (hasContribution() === false || selectedLeverCodes().length >= 1))`
  - `inlineErrors = signal<Record<string, string> | null>(null)` — field-keyed for 400 surfacing.
- **Behaviors**:
  - **On init**: Call `bilateralService.getAlignment(resultCode)`. If response says `eligible=false`, navigate to `general-information` (`router.navigate(['/result', resultCode, 'general-information'], { replaceUrl: true })`). Subscribe to the socket event (see §7).
  - **On toggle change**: update `hasContribution`; if flipped to false, clear `selectedLeverCodes`.
  - **On Save**: build `UpdatePoolFundingAlignmentDto`, call `bilateralService.patchAlignment(...)`. Handle the discriminated-union return:
    - `ok: true` → success toast + Clarity event + reset `isDirty`.
    - `ok: false, status: 400` → populate `inlineErrors` from server response.
    - `ok: false, status: 409` → re-fetch alignment + warning toast.
    - Other → propagated to global interceptor.
  - **On destroy**: unsubscribe socket subscription.

#### 4.2.2 EXTENDED — `ResultSidebarComponent`

Add **one new `SidebarOption`** to `allOptions`:

```ts
{
  label: 'Pool Funding alignment',
  path: 'pool-funding-alignment',
  greenCheckKey: 'pool_funding_alignment',     // existing pattern; backend may or may not expose
  hide: false                                  // toggled below
}
```

Position: between the existing "Alliance alignment" entry and the "Partners" entry (resolves **OQ-AS-1**). Confirmed during Phase-1 exploration of mockups.

The `hide` field is driven by a new computed against `BilateralService.currentAlignment`:

```ts
allOptionsWithGreenChecks = computed(() => {
  const alignment = this.bilateralService.currentAlignment();
  return this.allOptions()
    .filter(option =>
      (option?.indicator_id === this.cache.currentMetadata()?.indicator_id || !option?.indicator_id)
      && !this.shouldHidePoolFundingTab(option, alignment)
    )
    .map(option => ({ ...option, greenCheck: Boolean(this.cache.greenChecks()[option.greenCheckKey as keyof GreenChecks]) }));
});

private shouldHidePoolFundingTab(option: SidebarOption, alignment: AlignmentResponse | null): boolean {
  if (option.path !== 'pool-funding-alignment') return false;
  // hide when alignment is loaded and explicitly ineligible; hide while loading (null) to prevent flicker
  return !alignment || alignment.eligible === false;
}
```

> **Loading flicker (AC-01.3)**: The filter hides the tab while `alignment === null` (initial state). Once GET resolves, eligibility decides. This means a brief delay between page load and tab appearance — acceptable per AC-01.3 ("never flicker visible then hidden").

#### 4.2.3 EXTENDED — `BilateralService` (state + methods)

See §4.4.1 below.

### 4.3 State boundaries

- **Component-local signals** for form state (`hasContribution`, `selectedLeverCodes`, `justification`, `inlineErrors`).
- **`BilateralService` signals** for cross-tab / cross-page shared state: `currentAlignment`, `loadingAlignment`, `savingAlignment`, and `editable` computed. Re-used by the sidebar's tab-visibility filter.
- **No new `localStorage` persistence.** Alignment is server-side state; no client-side cache beyond the in-memory signal.
- **URL state**: route param `:resultCode` only. No new query params.

### 4.4 Services

#### 4.4.1 EXTENDED — `BilateralService`

Add to `src/app/shared/services/bilateral.service.ts` (alongside the existing `currentContract` block):

```ts
// New signals
readonly currentAlignment = signal<AlignmentResponse | null>(null);
readonly loadingAlignment = signal(false);
readonly savingAlignment = signal(false);

// Permission computed — see §5 for the role/ownership inputs.
// rolesService + currentResultService injected (both already in the codebase).
readonly editable = computed(() => {
  const alignment = this.currentAlignment();
  if (!alignment) return false;
  if (alignment.is_read_only) return false;
  if (this.rolesService.canEditAnyResult()) return true;        // CENTER_ADMIN / SYSTEM_ADMIN
  return this.currentResultService.isCurrentUserOwner();          // CONTRIBUTOR + owner
});

// New methods
async getAlignment(resultCode: string): Promise<AlignmentResponse | null> {
  this.loadingAlignment.set(true);
  try {
    const res = await this.api.GET_PoolFundingAlignment(resultCode);
    if (!res?.successfulRequest) {
      this.currentAlignment.set(null);
      return null;
    }
    this.currentAlignment.set(res.data);
    return res.data;
  } finally {
    this.loadingAlignment.set(false);
  }
}

async patchAlignment(
  resultCode: string,
  body: UpdatePoolFundingAlignmentDto
): Promise<PatchAlignmentResult> {
  this.savingAlignment.set(true);
  try {
    const res = await this.api.PATCH_PoolFundingAlignment(resultCode, body);
    if (res?.successfulRequest) {
      this.currentAlignment.set(res.data);
      return { ok: true, data: res.data };
    }
    return {
      ok: false,
      status: res?.status ?? 0,
      description: res?.errorDetail?.description ?? '',
      fieldErrors: this.extractFieldErrors(res?.errorDetail)
    };
  } finally {
    this.savingAlignment.set(false);
  }
}

// Helper: parse server `errorDetail.errors` (if present) into a field→message map
private extractFieldErrors(errorDetail: ErrorResponse | undefined): Record<string, string> | undefined { /* ... */ }
```

Discriminated union:

```ts
export type PatchAlignmentResult =
  | { ok: true; data: AlignmentResponse }
  | { ok: false; status: number; description: string; fieldErrors?: Record<string, string> };
```

> **`CurrentResultService.isCurrentUserOwner()` resolution (OQ on owner derivation)**: A-2 from requirements assumed this is available. If `CurrentResultService` doesn't expose it yet, add a small computed `isCurrentUserOwner = computed(() => /* compare cache.currentMetadata() PI/creator/contact IDs vs cache.dataCache().user.sec_user_id */)`. Verify during T-BIL-AS-02 execution; if absent, add to `CurrentResultService` (not `BilateralService` — keep ownership logic on its rightful owner-service).

#### 4.4.2 EXTENDED — `ApiService`

Two new methods per §3.1. No filter type changes.

#### 4.4.3 EXTENDED — `WebsocketService`

No code change to the service itself (its `listen(event)` API is already generic enough). The new event consumption lives in the component:

```ts
private socketSubscription?: Subscription;

ngOnInit(): void {
  this.socketSubscription = this.websocketService
    .listen('result.pool-funding-alignment.changed')
    .pipe(filter((evt: AlignmentChangedEvent) => evt.result_code === this.resultCode()))
    .subscribe(evt => this.handleRemoteChange(evt));
}

ngOnDestroy(): void {
  this.socketSubscription?.unsubscribe();
}
```

Where `handleRemoteChange` either refetches (if form is clean) or shows the dirty-state toast with a Refresh action (per AC-11.3).

### 4.5 Forms

Reactive structure via **signals** (matching the codebase pattern). Validators replaced by computed gates:

- `hasContribution: WritableSignal<boolean | null>` — null is a valid initial state (AC-02.2).
- `selectedLeverCodes: WritableSignal<string[]>` — at least 1 entry required when `hasContribution=true`.
- `justification: WritableSignal<string>` — max 500 chars, clipped in the input handler.
- `isDirty` computed compares form state vs. `alignment()` server state.
- `canSave` computed gates Save: editable && !readOnly && isDirty && (hasContribution=false OR ≥1 lever).

**Inline error rendering** (AC-06.3): When `bilateralService.patchAlignment` returns `{ ok: false, status: 400, fieldErrors }`, the component sets `inlineErrors` signal. Template renders `<small role="alert" aria-live="polite">` below the offending field (similar pattern to the override page in tag-visibility).

**Justification character counter** (resolves **OQ-AS-5**): `X / 500` rendered right-aligned below the textarea, color shifts to warning when remaining < 50 chars. No new component — inline template.

### 4.6 Theming

Add **one new** `STATUS_COLOR_MAP` entry — `'pf-synced'`:

```ts
'pf-synced': { border: 'var(--ac-grey-700)', text: 'var(--ac-grey-700)' }
```

(Resolves **OQ-AS-2**.) Reuses the existing `--ac-grey-700` token (no new token needed). The neutral grey communicates locked / read-only better than the Pool Funding green (which would imply "active and contributing"). Both light + dark map cleanly because `--ac-grey-700` already flips correctly per `colors.scss`.

Synced badge rendering:

```html
<app-custom-tag statusId="pf-synced" statusName="Synced — read only"
  [pTooltip]="'This result has been pushed to PRMS. Alignment can no longer be edited from STAR.'"
  tooltipPosition="bottom"></app-custom-tag>
```

Synced banner (resolves **OQ-AS-3**): a `<div>` at the top of the section card (above the toggle), styled as a subtle yellow-to-grey gradient or plain grey with an icon. Always visible while `is_read_only`. Wider visual impact than the badge — communicates the state to a user who landed on the tab without reading the header.

Read-only banner (for non-editors, REQ-BIL-AS-10): same structural component as the synced banner but with copy "You don't have permission to edit this section." Renders only when `!editable && !is_read_only` (to avoid stacking both banners when both conditions hold; synced takes precedence).

---

## 5. Security & authorization

- **Tab visibility**: signal-driven from `BilateralService.currentAlignment().eligible`. Hidden when ineligible. Non-blocking for direct URL access; component-level redirect handles the URL hit.
- **Edit affordance**: `BilateralService.editable` computed combines:
  - `RolesService.canEditAnyResult()` (true for `CENTER_ADMIN` and `SYSTEM_ADMIN` per its existing implementation), OR
  - `CurrentResultService.isCurrentUserOwner()` (true when current user is the result's Creator / PI / contact).
  - AND `!is_read_only` (server-side flag wins).
- **Save action**: server is the authority. The client mirrors via `editable` to hide the affordance; the server enforces via its existing `ResultOwnerGuard` + `@Roles(...)`.
- **No new persistence of sensitive data.** No tokens touched. Justification is sent to the server only; never cached client-side.
- **403 UX (resolves Q-BIL-403-ux from the proposal)**: hide the Save CTA when `!editable`. If a stale token somehow lets a non-editor reach Save (e.g., role just revoked), the server 403 falls through to the existing toast; no spec-level special-casing.

---

## 6. Error handling

### 6.1 400 (validation error) — inline, no toast

`BilateralService.patchAlignment` returns `{ ok: false, status: 400, fieldErrors }`. The component reads `fieldErrors` and surfaces them inline below each offending field via `<small role="alert" aria-live="polite">`. The `httpErrorInterceptor` URL-scoped exception suppresses the toast for `/pool-funding-alignment` 400s (mirrors the T-BIL-TV-08 precedent).

### 6.2 409 (synced) — warning toast + read-only transition

On 409: refetch alignment (which now has `is_read_only=true`), repaint with disabled inputs + synced banner, show a one-time warning toast: "This result was synced to PRMS. Your unsaved alignment changes were not applied." Severity `warning`. AC-12.

### 6.3 5xx / network down

Existing `httpErrorInterceptor` toast. Form state preserved so the user can retry.

### 6.4 Eligibility race

If the alignment GET resolves with `eligible=false` (e.g., the AGRESSO tag was just removed):
- Component redirects to `general-information` (AC-01.2).
- Sidebar entry's `hide` flips to true on the next render via the eligibility-aware filter (§4.2.2).

### 6.5 Empty `data` on GET success

Treated as an unexpected server response. `currentAlignment` stays null; the section shows a generic loading skeleton plus a "Could not load alignment — please refresh" inline message. This is defense-in-depth; the backend should not return empty data on this endpoint.

---

## 7. Real-time considerations

### 7.1 Subscription

The component subscribes to `result.pool-funding-alignment.changed` via `WebsocketService.listen(event)`. The subscription is filtered to the current `resultCode` so events for other results don't trigger re-fetches.

### 7.2 Dirty-state guard (AC-11.3)

When the event arrives and the user has unsaved changes (`isDirty()` is true), we do NOT overwrite their work. Instead:

- Show an `info` toast with action button "Refresh":
  - "Another user updated this alignment. Refresh to see the latest."
- On Refresh click, re-fetch alignment, reset form to server state, dismiss toast.
- If the user saves their own work before clicking Refresh, the next save will either succeed (server merged) or 409 (server rejected — see §6.2).

### 7.3 Subscription lifecycle

- Created in `ngOnInit`.
- Cleaned up in `ngOnDestroy` to avoid memory leaks (single subscription, single `unsubscribe`).
- Survives across version-watcher refreshes (the parent `result.component.ts` re-mounts children on version change, which naturally re-creates the subscription).

### 7.4 Degradation when socket is down

Resolves **OQ-AS-4**: **no polling-on-focus fallback in v1.** When the socket is disconnected (server-down, network blip, mobile background), the section may show stale state until the user navigates away and back. Rationale:

- `WebsocketService.socketStatus` reconnects automatically when the server is reachable; staleness is bounded by user behavior.
- Polling-on-focus would add complexity for a marginal-gain scenario.
- The 409-on-stale-PATCH path is the safety net (server is authoritative; stale data fails loudly).

If real-world telemetry shows users hitting stale-state confusion frequently, reopen as a follow-up.

---

## 8. Performance

- **Initial chunk impact**: `BilateralService` extensions + `httpErrorInterceptor` URL exception extension + `ResultSidebarComponent` filter change. Estimated **≤ 5 KB gzipped** (REQ-BIL-AS-NF-03).
- **Lazy chunk impact**: `PoolFundingAlignmentComponent` (TS + HTML + SCSS) + new interface file + PrimeNG `SelectButtonModule` (if not already in any other lazy chunk). Estimated **20-25 KB gzipped**, well within the 30 KB cap.
- **Render impact**: `<p-selectButton>` + `<app-multiselect>` + `<textarea>` is a lightweight DOM tree. NF-01 target (≤ 1.0 s render on Lighthouse mobile) is realistic.
- **Network impact**: one GET on tab mount, one PATCH per save. Socket overhead is shared with the existing connection; no new connection.

---

## 9. Accessibility (WCAG 2.1 AA — PRD C-4)

- **Toggle** (`<p-selectButton>`): keyboard-navigable (arrow keys), ARIA states set by PrimeNG; labels via `<label>` association.
- **Multiselect**: existing shared `MultiselectComponent` is already AA-audited.
- **Justification textarea**: visible label; character counter is announced via `aria-live="polite"`; max length both attribute and handler.
- **Synced badge**: `aria-label="Pool Funding Alignment is synced and read only"`; tooltip via `pTooltip` is keyboard-triggerable on focus.
- **Inline errors**: `<small role="alert" aria-live="polite">` per field (mirrors AC-08.1 pattern from tag-visibility).
- **Banners** (synced + read-only): `role="status"` with `aria-live="polite"`.
- **Focus order**: header → banner (if present) → toggle → lever picker (if visible) → justification → Save (if visible).
- **Reduced motion**: no animations introduced. Tab transition uses the existing `withViewTransitions()` router config; respects user preferences automatically.

---

## 10. Telemetry

- **`bilateral.alignment.viewed`** via `ClarityService.trackEvent` on first tab open per result per session. Payload: `{ result_code, eligible, has_contribution, is_read_only }`.
- **`bilateral.alignment.saved`** on successful PATCH. Payload: `{ result_code, has_contribution, lever_count, has_justification }`.
- **`bilateral.alignment.remote_change_received`** (optional, lightweight) on socket event for THIS result. Helps measure cross-tab collaboration frequency. Payload: `{ result_code }`.
- No PII shipped. Result codes are not PII per current PRD guidance.
- No new tracking for hotjar / GA — page-view tracking via `TrackingToolsService` covers tab-open clicks.

---

## 11. Design decisions (decision record)

> Append-only. Newest at the bottom.

- **2026-05-20 — Reuse `BilateralService` facade.** `BilateralService` was introduced in tag-visibility as a singleton facade with the explicit intent of growing across the three sub-specs. Alignment-section extends it with `currentAlignment` + alignment methods + `editable` computed. Alternative: separate `AlignmentService`. Rejected because (1) sidebar filter needs both contract eligibility and alignment state in one place; (2) cross-feature consumers (indicator-mapping) will need the same shared signal handles; (3) keeping bilateral state in one service preserves traceability.

- **2026-05-20 — Component-level redirect for ineligibility, not a route guard.** A route guard would require knowing eligibility before navigation, which requires the GET. Doing the GET inside a guard would serialize loading and add complexity for the rare case (direct URL navigation to an ineligible result). Component-level redirect (in `ngOnInit` after the GET resolves) is simpler. Sidebar visibility prevents 99% of users from reaching this path.

- **2026-05-20 — No `useResultInterceptor` on the alignment endpoints.** `result.interceptor` adds `reportYear` + `reportingPlatforms` query params for version-aware result fetches; alignment is always-current and not version-scoped. Omitting the flag keeps URLs clean.

- **2026-05-20 — Sidebar position: between Alliance Alignment and Partners.** Resolves **OQ-AS-1**. Confirmed via the Figma mockups in [`../figma-mockups/_assets/`](../figma-mockups/_assets/). Adjustable in `result-sidebar.component.ts` `allOptions` array order if design QA pushes back.

- **2026-05-20 — Synced badge uses `--ac-grey-700` reuse (resolves OQ-AS-2).** New `STATUS_COLOR_MAP` entry `'pf-synced'` points at the existing grey-700 token (light + dark variants already defined). Neutral grey communicates "locked / immutable" better than Pool Funding green (which would conflate active-contribution with synced-state). Single-line addition to the constants file. Alternative: bespoke `--ac-pf-synced-*` tokens. Rejected — over-engineering for a state that visually wants neutral.

- **2026-05-20 — Synced banner placement: top-of-section, persistent (resolves OQ-AS-3).** A `<div>` above the toggle with both border and bg in `--ac-grey-100/200`. Non-dismissible while `is_read_only` holds. Read-only-permission banner (REQ-BIL-AS-10) uses the same structural component with different copy. Synced banner takes precedence when both conditions hold.

- **2026-05-20 — No socket-down polling fallback in v1 (resolves OQ-AS-4).** When the socket is disconnected, accept staleness; the 409 path catches conflicts on save. If telemetry shows confusion, reopen.

- **2026-05-20 — Justification char counter inline below textarea (resolves OQ-AS-5).** `X / 500` right-aligned, color shifts to warning at < 50 remaining. No new component.

- **2026-05-20 — Owner derivation lives on `CurrentResultService.isCurrentUserOwner()`, not on `BilateralService`.** Ownership is a property of the result, not of the bilateral domain. `BilateralService.editable` consumes the helper but doesn't own it.

---

## 12. Testing strategy

### 12.1 Unit tests

| Subject | File | Coverage focus |
| --- | --- | --- |
| `ApiService.GET_PoolFundingAlignment` + `PATCH_PoolFundingAlignment` | `api.service.spec.ts` *(extended)* | URL encoding, body shape, no `useResultInterceptor` flag. |
| `BilateralService.getAlignment` | `bilateral.service.spec.ts` *(extended)* | happy path, 404, `currentAlignment` flips, `loadingAlignment` toggles. |
| `BilateralService.patchAlignment` | same | 200 (signal update + discriminated return), 400-with-fieldErrors, 409 (refetch trigger), 5xx, rejection (defensive try/finally). |
| `BilateralService.editable` | same | role variants × ownership variants × `is_read_only` variants. |
| `httpErrorInterceptor` URL exception | `http-error.interceptor.spec.ts` *(extended)* | 400 on `/pool-funding-alignment` suppressed; 5xx still toasts. |
| `ResultSidebarComponent` tab visibility | `result-sidebar.component.spec.ts` *(extended)* | hide when `eligible=false`; hide while alignment is loading; show when `eligible=true`. |
| `PoolFundingAlignmentComponent` | new spec | (see breakdown below). |

`PoolFundingAlignmentComponent` spec breakdown (target ~15 cases):
- Init / GET / ineligible-redirect / eligibility-loading-flicker (4)
- Toggle behavior (Yes / No / Null) (3)
- Lever picker visibility + ≥1 validation (2)
- Justification clipping (1)
- Save 200 / 400 / 409 / 5xx (4)
- Socket event reconcile: clean + dirty branches (2)
- Read-only state (synced + non-editor) (2)

### 12.2 DOM-level tests

Aim for 5-7 DOM-level cases on the new component (real-render). Selectors via `data-testid` on every interactive element. Covers:
- Synced badge renders when `is_read_only`
- Read-only banner renders when non-editor
- Save button hidden vs disabled in the right states
- Inline error renders with `role="alert"`

### 12.3 Coverage delta

- New component: ≥ 70% statements (REQ-BIL-AS-NF-06).
- New `BilateralService` methods: ≥ 90% statements.
- Project-wide floors (`statements 40 / branches 20 / lines 45 / functions 30`) must not regress.

### 12.4 Manual smoke (PR-review)

- CONTRIBUTOR-non-owner: tab visible, all inputs disabled, Save hidden, read-only banner shown.
- CONTRIBUTOR-owner: full edit flow happy path.
- CENTER_ADMIN on a result they don't own: full edit flow (ownership bypass).
- MEL Regional Expert: same as CONTRIBUTOR-non-owner.
- Synced result: badge + synced banner; inputs disabled; Save hidden.
- Two tabs open on the same result; edit in tab A; tab B receives socket event; with clean form → auto-refresh; with dirty form → toast + Refresh action.
- Direct URL to `/result/<ineligible>/pool-funding-alignment` → redirect to `general-information`.
- Dark + light theme parity.

---

## 13. Risks & mitigations

- **R-1 — `CurrentResultService.isCurrentUserOwner()` may not exist today.** *Mitigation*: T-BIL-AS-02 first step is to read `current-result.service.ts`; if absent, add the helper there (not on `BilateralService`). Owner derivation logic uses `cache.currentMetadata()` PI/Creator/contact IDs vs. `cache.dataCache().user.sec_user_id`.
- **R-2 — Sidebar filter regression.** Extending `allOptionsWithGreenChecks` computed risks breaking the existing indicator-id filter. *Mitigation*: dedicated regression test for the existing filter behavior in `result-sidebar.component.spec.ts`.
- **R-3 — Socket subscription leak.** If `ngOnDestroy` doesn't fire cleanly (e.g., navigation race), the subscription leaks. *Mitigation*: explicit `unsubscribe()` + use of `DestroyRef`-based `takeUntilDestroyed()` operator as a defense.
- **R-4 — Submission-validator regression (AR.3).** If a future contributor adds the alignment to the validator, AR.3 silently breaks. *Mitigation*: a regression test in the existing `SubmissionService` spec asserts that empty alignment does not block submission. Also: design-decision row in this doc + a `// AR.3 — do not validate alignment` comment in the relevant code path if/when one exists.
- **R-5 — Dirty-state-vs-socket-event UX is novel.** No existing surface in the app has this two-tab-collaboration pattern. *Mitigation*: PR-review manual smoke flagged in §12.4; the "Refresh" action toast pattern is documented + reusable for future sub-specs.
- **R-6 — Loading flicker.** The sidebar hides the tab until alignment loads. On a slow network, users may briefly notice the tab "missing" before it appears. *Mitigation*: accepted as design (AC-01.3 explicitly bans flicker-visible-then-hidden, which is worse). Loading state could be improved later with a skeleton tab placeholder if telemetry shows confusion.

---

## 14. References

- PRD: [`docs/prd.md`](../../../prd.md) §3, §4, §8.3 (C-1..C-6).
- System Design: [`docs/system-design/design.md`](../../../system-design/design.md) §7 (tokens — reuses grey), §8 (components), §11 (dark mode), §12 (decisions log — update on merge).
- Detailed Design: [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §2, §4.3, §6, §6.4 (real-time WebSocket).
- Sibling specs:
  - [`../tag-visibility/`](../tag-visibility/) — predecessor; `BilateralService` facade + URL-scoped interceptor exception + Pool Funding tokens. **Foundations reused; nothing replaced.**
  - [`../indicator-mapping/`](../indicator-mapping/) — successor; depends on this spec's `BilateralService.currentAlignment` foundation.
- Backend handoff: [`../ari-backend-context/frontend-handoff.md` §4.2 + §4.3 + §5 + §6](../ari-backend-context/frontend-handoff.md).
- Code anchors:
  - `research-indicators/src/app/shared/services/bilateral.service.ts` — extend.
  - `research-indicators/src/app/shared/services/api.service.ts` — extend.
  - `research-indicators/src/app/shared/services/cache/roles.service.ts` — `canEditAnyResult` consumer.
  - `research-indicators/src/app/shared/services/cache/current-result.service.ts` — owner derivation lives here.
  - `research-indicators/src/app/shared/components/result-sidebar/result-sidebar.component.ts` — extend `allOptions` + computed.
  - `research-indicators/src/app/shared/interceptors/http-error.interceptor.ts` — add URL exception.
  - `research-indicators/src/app/shared/sockets/websocket.service.ts` — consume via `listen(...)` (no service change).
  - `research-indicators/src/app/pages/platform/pages/result/pages/alliance-alignment/` — pattern reference for the new tab.
