# Design — Bilateral Module / Indicator Mapping

> How we'll implement [`./requirements.md`](./requirements.md). Follows the template at [`../../general-setup/design.md`](../../general-setup/design.md). Pairs with [`./tasks.md`](./tasks.md).
>
> **Mockup-first design** (rewrite, 2026-05-23). Every decision below cites the specific Figma node that informed it. Where mockup and backend handoff conflict, the mockup is treated as canonical and the conflict is logged as a **gating Open Question** in [`./requirements.md` §12](./requirements.md#12-assumptions--open-questions). The design does NOT pre-resolve those OQs — it leaves the technical seams clearly marked so that the BA's answer translates into a focused change before `/sdd-execute`.

---

## 1. Architectural overview

This spec extends the existing `PoolFundingAlignmentComponent` (shipped in [`../alignment-section/`](../alignment-section/)) with **two new visual blocks** and a new modal:

1. **AI card** (`bilateral-action-card` or extension of `metadata-panel`) — appears under the SP picker once `has_contribution=true` AND `selected_levers.length >= 1`. Click → opens the HLO modal. *(Figma `32471:129636`.)*
2. **HLO selection modal** (`HloSelectionModalComponent`, registered as `ModalName = 'hloSelection'`) — wide modal (1277×1113 per `32471:131617`) with:
   - **Left sidebar**: SP → AOW expandable tree.
   - **Main pane**: indicator table for the active AOW with search, checkbox + commit per row, disabled-with-reason callouts.
   - **Footer**: "Selected → N items" + Confirm / Cancel.
3. **Inline HLO cards** — once mapped, render inside the alignment tab grouped **SP → AOW → HLO**. Each card has indicator metadata, Expected target, conditional Quantitative contribution, required Reason dropdown, × button. *(Figma `33356:11075`, `32472:129409`.)*

Foundations from the prior bilateral specs are **reused exhaustively**:

- `BilateralService` (singleton facade) — extended with HLO modal selection state + mapping state.
- `editable` computed — single source of truth for write affordances. **No new permission logic.**
- `httpErrorInterceptor` URL-scoped 400 exception already covers `/pool-funding-alignment` sub-paths — **no interceptor edit needed**.
- Socket subscription `result.pool-funding-alignment.changed` already wired by alignment-section — picked up via reactive read on `currentAlignment()`.
- `all-modals` host + `modal` wrapper — extended with `'hloSelection'`.

**One alignment-section remediation block is included here** because indicator-mapping cannot land cleanly without it (§4.7 — covers divergences A–F + G + I identified in the mockup audit).

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ApiService (existing — extended)                                        │
│  + GET_PoolFundingIndicators                                             │
│  + GET_PoolFundingContribution                  (gated by OQ-IM-3)       │
│  + POST/PATCH/DELETE_PoolFundingContribution    (body shape gated OQ-IM-1)│
└────────────────────────┬─────────────────────────────────────────────────┘
                         │ MainResponse<T>
                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  BilateralService (existing — extended)                                  │
│  + indicatorGroups: signal<IndicatorGroupResponse[]>                     │
│  + persistedMappings, pendingMappings: signal<HloMapping[]>              │
│  + hloModalSelection: signal<Set<string>> (modal-session draft)          │
│  + loadingIndicators, savingMappings signals                             │
│  + getIndicators / loadModalSelection / commitModalSelection             │
│  + saveMappings (diffs pending vs persisted; batched POST/PATCH/DELETE)  │
└─┬──────────────────────────────────────────────────────────────┬─────────┘
  │                                                              │
┌─▼────────────────────────────────────┐    ┌────────────────────▼────────────┐
│ PoolFundingAlignmentComponent        │    │ HloSelectionModalComponent      │
│ (existing — extended)                │    │ (NEW; ModalName='hloSelection') │
│ + AI card (slot)                     │    │  ┌──────────┬─────────────────┐ │
│ + Inline HLO cards (SP→AOW grouping) │    │  │ SP/AOW   │ Indicator table │ │
│ + Section heading, info banner,      │◀──open────▶│ tree     │ + search +      │ │
│   radio Yes/No (remediation §4.7)    │    │  │ sidebar  │ disabled-reason │ │
└─┬────────────────────────────────────┘    │  └──────────┴─────────────────┘ │
  │                                         │  Footer: Selected → N + Confirm │
  │ socket reconcile (existing)             └─────────────────────────────────┘
  ▼
```

---

## 2. Data model

### 2.1 Extensions to `pool-funding-alignment.interface.ts`

Add to the file shipped in alignment-section:

```ts
// --- Catalog read shape ------------------------------------------------------

export type IndicatorType = 'output' | 'outcome' | '2030-outcome';

// AOW grouping (OQ-IM-2 — backend confirmation gates this shape).
// Path A (preferred): backend returns groups nested SP -> AOW -> indicators.
export interface IndicatorRow {
  indicator_code: string;
  indicator_name: string;
  indicator_type: IndicatorType;
  target_description: string | null;             // "20 - NUMBER OF KNOWLEDGE PRODUCTS"
  is_quantitative: boolean;                       // OQ-IM-6 (assumed name)
  is_active: boolean;
  is_mapped: boolean;
  is_stale: boolean;
  disabled_reason: string | null;                 // OQ-IM-9 — server-provided when row not mappable
}

export interface AreaOfWorkGroup {
  aow_code: string;
  aow_name: string;
  indicators: IndicatorRow[];
}

export interface IndicatorGroupResponse {
  lever_code: string;
  lever_name: string;
  // OQ-IM-2 — Path A. If backend does NOT expose AOW, fall back to `indicators: IndicatorRow[]`
  // and FE infers AOW from indicator_code prefix.
  areas_of_work: AreaOfWorkGroup[];
}

// --- Mapping read / write shapes --------------------------------------------

// One mapped HLO card on the form. Reflects server state for that pair.
export interface HloMapping {
  result_code: string;
  lever_code: string;
  lever_name: string;
  aow_code: string;
  aow_name: string;
  indicator_code: string;
  indicator_name: string;
  indicator_type: IndicatorType;
  is_stale: boolean;
  is_quantitative: boolean;
  target_description: string | null;
  // Editable fields (server-side validated):
  quantitative_contribution?: number | string | null;   // shape gated by OQ-IM-1 / OQ-IM-5
  reason_code: string | null;                            // OQ-IM-1 / OQ-IM-4 — option list TBD
}

// Body sent to POST/PATCH /contribution — shape gated by OQ-IM-1.
// Provisional shape mirrors the mockup card fields plus the discriminator from handoff §7.
export interface ContributionBody {
  // Path (a) / (c) / (d) per OQ-IM-1 — all paths include some form of these:
  quantitative_contribution?: number | null;
  reason_code: string;
  // Path (c): may additionally include the polymorphic body keyed by indicator_type.
  // OQ-IM-1 must be answered before this is finalized.
}

export interface MappingResponse {
  result_code: string;
  lever_code: string;
  aow_code: string;
  indicator_code: string;
  is_stale: boolean;
}

// --- Modal session state (component-scoped; lives in BilateralService) ------

export interface HloModalSelectionKey {
  lever_code: string;
  aow_code: string;
  indicator_code: string;
}

// String form `lever_code|aow_code|indicator_code` for use as Set keys.
export type HloKeyString = string;
```

All shape assumptions tagged with the OQ that gates them — kept visible so the spec is honest about what's still open.

### 2.2 Extension to `ModalName`

Add `'hloSelection'` to the union in `modal.types.ts`.

### 2.3 Wire vs view shape

**Open** (OQ-IM-1). Until the body shape is locked, the design holds two possible shapes:
- Flat: `{ quantitative_contribution, reason_code }` per the mockup card.
- Polymorphic: handoff §7's 5 types, where the mockup card maps onto NOOP (`{ indicator_type: 'NOOP', narrative: reason_code }`).

`tasks.md` T-BIL-IM-01 forces this resolution before implementation.

---

## 3. API contracts

| Method | URL | Service method | Notes |
| --- | --- | --- | --- |
| GET | `results/:resultCode/pool-funding-alignment/indicators` | `ApiService.GET_PoolFundingIndicators(resultCode, { search?, indicatorType? })` | Returns `MainResponse<IndicatorGroupResponse[]>`. Backend must include AOW per OQ-IM-2 or the FE applies code-prefix inference (R-2). |
| GET | `.../indicators/:indicatorCode/contribution?lever-code=...` | `ApiService.GET_PoolFundingContribution(...)` | Edit-mode pre-fill. Existence gated by OQ-IM-3. |
| POST | `.../indicators/:indicatorCode/contribution?lever-code=...` | `ApiService.POST_PoolFundingContribution(...)` | Body shape gated by OQ-IM-1. |
| PATCH | `.../indicators/:indicatorCode/contribution?lever-code=...` | `ApiService.PATCH_PoolFundingContribution(...)` | Body shape gated by OQ-IM-1. |
| DELETE | `.../indicators/:indicatorCode/contribution?lever-code=...` | `ApiService.DELETE_PoolFundingContribution(...)` | No body. |

### 3.1 ApiService additions

Drop near the existing `GET_PoolFundingAlignment` / `PATCH_PoolFundingAlignment` block:

```ts
GET_PoolFundingIndicators = (
  resultCode: string,
  opts?: { search?: string; indicatorType?: IndicatorType | null }
): Promise<MainResponse<IndicatorGroupResponse[]>> => {
  const params = new URLSearchParams();
  if (opts?.search) params.set('search', opts.search);
  if (opts?.indicatorType) params.set('indicator-type', opts.indicatorType);
  const qs = params.toString();
  const url = () =>
    `results/${encodeURIComponent(resultCode)}/pool-funding-alignment/indicators${qs ? `?${qs}` : ''}`;
  return this.TP.get(url(), {});
};

private contributionUrl = (resultCode: string, indicatorCode: string, leverCode: string) =>
  `results/${encodeURIComponent(resultCode)}/pool-funding-alignment/indicators/` +
  `${encodeURIComponent(indicatorCode)}/contribution?lever-code=${encodeURIComponent(leverCode)}`;

GET_PoolFundingContribution = (r: string, i: string, l: string) =>
  this.TP.get(this.contributionUrl(r, i, l), {});

POST_PoolFundingContribution = (r: string, i: string, l: string, body: ContributionBody) =>
  this.TP.post(this.contributionUrl(r, i, l), body, {});

PATCH_PoolFundingContribution = (r: string, i: string, l: string, body: ContributionBody) =>
  this.TP.patch(this.contributionUrl(r, i, l), body, {});

DELETE_PoolFundingContribution = (r: string, i: string, l: string) =>
  this.TP.delete(this.contributionUrl(r, i, l), {});
```

None pass `useResultInterceptor: true` (same reasoning as alignment-section).

### 3.2 Interceptor URL exception — no new change

Existing `req.url.includes('/pool-funding-alignment')` already covers `/indicators` and `/contribution` sub-paths. Verified.

### 3.3 Error model

| Code | Behavior |
| --- | --- |
| 200 / 201 | Mutation result fold into the diff; on batch completion, single success toast + telemetry. |
| 400 | Inline on the offending HLO card (field-level); toast suppressed by URL exception. |
| 401 | `jWtInterceptor` (refresh → retry → logout). |
| 403 | Defensive global toast; shouldn't fire (CTAs hidden). |
| 409 | Stop batch; refetch alignment + indicators; transition to read-only; warning toast (AC-16). |
| 5xx | Global interceptor toast; pending state preserved. |

---

## 4. Frontend architecture

### 4.1 Routes

**No new routes.** Everything mounts inside `/result/:resultCode/pool-funding-alignment` (registered in alignment-section T-BIL-AS-10).

### 4.2 Components

#### 4.2.1 NEW — `BilateralActionCardComponent` (the AI card)

- **Path**: `src/app/shared/components/bilateral-action-card/bilateral-action-card.component.{ts,html,scss,spec.ts}`.
- **Standalone**, **OnPush**. Reusable beyond bilateral if STAR design system later wants a "promo card" pattern.
- **Visual reference**: [`../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md`](../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md).
- **Inputs**:
  - `illustration: string` (img src or icon name; default to the bilateral illustration `Seo-3--Streamline-Brooklyn`).
  - `title: string` (uppercase tracked).
  - `body: string`.
  - `ctaLabel: string` (default: `View HLOs` — resolves OQ-FIG-5).
  - `ctaIcon: string` (default: `pi pi-folder`).
  - `disabled: boolean`.
- **Output**: `(ctaClick)` event.
- **Layout**: 1036×103 — left 73×73 illustration, center title + body, right green CTA button (114×36).
- **A11y**: `role="region"`, `aria-labelledby` pointing at the title, illustration `aria-hidden="true"`.
- **`data-testid`**: `bilateral-action-card`, `bilateral-action-card-cta`.

#### 4.2.2 NEW — `HloSelectionModalComponent`

- **Path**: `src/app/shared/components/all-modals/modals-content/hlo-selection-modal/hlo-selection-modal.component.{ts,html,scss,spec.ts}`.
- **Standalone**, **OnPush**. Registered with `all-modals` under `ModalName = 'hloSelection'`.
- **Visual references**: [`32471-131617`](../figma-mockups/32471-131617-hlo-modal-empty.md), [`33563-137770`](../figma-mockups/33563-137770-hlo-modal-3-items-selected.md), [`33563-138613`](../figma-mockups/33563-138613-hlo-modal-disabled-reason.md).
- **Imports**: `CommonModule`, `FormsModule`, `InputTextModule` (search), `CheckboxModule`, `ButtonModule`, `TooltipModule`, `SkeletonModule`, `BadgeModule` (AOW count badges).
- **Three-zone layout**:
  - **Header** (modal chrome): title `High Level Outputs` + close (×).
  - **Left sidebar** (256 wide): SPs from `currentAlignment().selected_levers`, expandable into AOWs from `indicatorGroups()`. Active AOW highlighted (`Light Blue-100` per design tokens). Per-AOW badge shows in-session selection count.
  - **Main pane**: header breadcrumb (`SP > AOW`) + search input + indicator table.
  - **Footer**: `Selected → N items` (left) + Cancel / Confirm (right).
- **Empty states**:
  - Catalog not synced (every group's `areas_of_work` empty) → AC-14.1 message in main pane; Confirm disabled.
  - Active AOW has zero indicators → "No indicators in this Area of Work" inline.
  - Search returns empty → "No indicators match \"{query}\" in this Area of Work".
- **Disabled rows** (`disabled_reason` non-null OR `is_stale && !is_mapped`):
  - Greyed out; checkbox + commit button non-interactive.
  - Reason callout (259×26) rendered inline near the row; `aria-describedby` always present so screen readers announce it without hover.
- **Internal state** (component-scoped signals, but persisted via `BilateralService.hloModalSelection`):
  - `activeAowKey: signal<string | null>` — the active `lever_code|aow_code` pair.
  - `search: signal<string>` (debounced 300 ms via effect → `bilateralService.indicatorSearch`).
- **Cancel / × behavior**: if `hloModalSelection` differs from the pre-modal snapshot, show a confirm dialog "Discard your selection changes?". Otherwise close immediately.
- **Confirm behavior**: call `bilateralService.commitModalSelection()` → close modal. The actual server mutations fire on alignment-form Save (REQ-BIL-IM-13).
- **`data-testid`**: `hlo-modal-root`, `hlo-modal-sidebar`, `hlo-modal-aow-{leverCode}-{aowCode}`, `hlo-modal-aow-badge-{...}`, `hlo-modal-row-{leverCode}-{aowCode}-{indicatorCode}`, `hlo-modal-row-checkbox-{...}`, `hlo-modal-row-commit-{...}`, `hlo-modal-row-reason-{...}`, `hlo-modal-counter`, `hlo-modal-confirm`, `hlo-modal-cancel`, `hlo-modal-empty-catalog`, `hlo-modal-empty-aow`, `hlo-modal-empty-search`.

#### 4.2.3 NEW — `HloCardComponent`

- **Path**: `src/app/pages/platform/pages/result/pages/pool-funding-alignment/components/hlo-card/hlo-card.component.{ts,html,scss,spec.ts}`.
- **Standalone**, **OnPush**.
- **Visual references**: [`33356-11075`](../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md) Frame 1171276358; [`32472-129409`](../figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md).
- **Input**: `mapping: HloMapping`.
- **Outputs**: `(reasonChange)`, `(quantitativeChange)`, `(remove)`.
- **Layout** (1036 wide, ~290 px tall when quantitative present, ~269 px when not):
  - Header row: indicator code + name, status tag, `times-circle` × top-right (hidden when `!editable || is_read_only`).
  - Progress bar (uses `<app-custom-progress-bar>` if a progress value is exposed on the mapping; otherwise omit).
  - **Expected target** row: label + `→` icon (decorative) + value (`target_description` from mapping).
  - **Quantitative contribution** row: rendered ONLY when `mapping.is_quantitative === true`. Label + `→` + compact 79×33 dropdown / inputNumber.
  - **Why is this being reported?** row: label + full-width searchable dropdown. Required (inline error when empty + Save attempted).
- **Stale variant**: if `mapping.is_stale === true`, a "Stale" `<p-tag severity="warning">` appears next to the indicator name + tooltip "This indicator was retired in the upstream catalog. Edits to your existing mapping are still allowed."
- **`data-testid`**: `hlo-card-{leverCode}-{aowCode}-{indicatorCode}`, `hlo-card-target-{...}`, `hlo-card-quantitative-{...}`, `hlo-card-reason-{...}`, `hlo-card-remove-{...}`, `hlo-card-stale-badge-{...}`.

#### 4.2.4 EXTENDED — `PoolFundingAlignmentComponent`

Adds three new render zones:

1. **AI card slot** below the SP picker — visible when `formData().has_contribution === true && currentAlignment()?.selected_levers?.length > 0 && pendingMappings().length === 0` (no mappings yet — full card) OR `pendingMappings().length > 0` (collapsed variant per OQ-IM-7 — "Manage HLO mappings" link).
2. **HLO cards container** — grouped SP → AOW → HLO. Renders `pendingMappings()` (which equals `persistedMappings()` until the user opens the modal and changes selection).
3. **Footer Save** — unchanged in mechanics, but on Save now also runs the **mapping diff** (REQ-BIL-IM-13).

**Mockup remediation block (§4.7) lands in this component too** — same file, same PR-able surface.

#### 4.2.5 EXTENDED — `BilateralService`

See §4.4.1.

### 4.3 State boundaries

| Signal | Lives on | Purpose |
| --- | --- | --- |
| `indicatorGroups: signal<IndicatorGroupResponse[]>` | `BilateralService` | Catalog snapshot per current filter / search. |
| `persistedMappings: signal<HloMapping[]>` | `BilateralService` | What the server has for this result. Refetched on init, after Save, on socket. |
| `pendingMappings: signal<HloMapping[]>` | `BilateralService` | Working copy. Mutated by modal Confirm and by HLO card edits (Quantitative / Reason). Diffed on Save. |
| `hloModalSelection: signal<Set<HloKeyString>>` | `BilateralService` | Modal-session draft (Confirm writes back to pendingMappings; Cancel discards). |
| `loadingIndicators, savingMappings` | `BilateralService` | UX gates. |
| `indicatorSearch, indicatorTypeFilter` | `BilateralService` | Panel/modal filter state. |

**No new `localStorage` persistence.** All mapping state is server-backed.

### 4.4 Services

#### 4.4.1 EXTENDED — `BilateralService`

```ts
readonly indicatorGroups = signal<IndicatorGroupResponse[]>([]);
readonly persistedMappings = signal<HloMapping[]>([]);
readonly pendingMappings = signal<HloMapping[]>([]);
readonly hloModalSelection = signal<Set<HloKeyString>>(new Set());
readonly loadingIndicators = signal(false);
readonly savingMappings = signal(false);
readonly indicatorSearch = signal('');
readonly indicatorTypeFilter = signal<IndicatorType | null>(null);

private keyOf(k: HloModalSelectionKey): HloKeyString {
  return `${k.lever_code}|${k.aow_code}|${k.indicator_code}`;
}

async getIndicators(resultCode: string): Promise<IndicatorGroupResponse[]> { /* ... */ }
async getMappings(resultCode: string): Promise<HloMapping[]> {
  // OQ-IM-3: if GET .../contribution exists, fetch per indicator; otherwise
  //          derive from getIndicators + getContribution per mapped row.
  // Until OQ-IM-3 lands, implementation is a stub the panel uses to seed pendingMappings.
}

// Modal Open / Confirm / Cancel
loadModalSelection(): void {
  this.hloModalSelection.set(new Set(this.pendingMappings().map(m => this.keyOf(m))));
}
commitModalSelection(): void {
  const next = this.hloModalSelection();
  // Convert next (Set of keys) back into HloMapping rows by joining against indicatorGroups + persistedMappings.
  // Preserves Quantitative/Reason values for surviving mappings; new keys get defaults; removed keys drop out.
  this.pendingMappings.set(this.materializeMappings(next));
}
cancelModalSelection(): void {
  // Discard: do NOT touch pendingMappings. Modal closes; hloModalSelection becomes stale, ignored.
}

// HLO card edits
updateMappingField(key: HloModalSelectionKey, patch: Partial<HloMapping>): void {
  this.pendingMappings.update(list =>
    list.map(m =>
      this.keyOf(m) === this.keyOf(key) ? { ...m, ...patch } : m
    )
  );
}
removeMapping(key: HloModalSelectionKey): void {
  const k = this.keyOf(key);
  this.pendingMappings.update(list => list.filter(m => this.keyOf(m) !== k));
}

// Diff & save
async saveMappings(resultCode: string): Promise<SaveMappingsResult> {
  const persisted = this.persistedMappings();
  const pending = this.pendingMappings();
  const { added, updated, removed } = this.diff(persisted, pending);
  this.savingMappings.set(true);
  try {
    for (const m of removed) {
      const res = await this.api.DELETE_PoolFundingContribution(resultCode, m.indicator_code, m.lever_code);
      if (!res?.successfulRequest) return { ok: false, status: res?.status ?? 0, ... };
    }
    for (const m of added) {
      const res = await this.api.POST_PoolFundingContribution(resultCode, m.indicator_code, m.lever_code, this.bodyOf(m));
      if (!res?.successfulRequest) return { ok: false, status: res?.status ?? 0, ... };
    }
    for (const m of updated) {
      const res = await this.api.PATCH_PoolFundingContribution(resultCode, m.indicator_code, m.lever_code, this.bodyOf(m));
      if (!res?.successfulRequest) return { ok: false, status: res?.status ?? 0, ... };
    }
    return { ok: true };
  } finally {
    this.savingMappings.set(false);
  }
}

private bodyOf(m: HloMapping): ContributionBody {
  // OQ-IM-1 — body shape gated. Default to flat:
  return {
    quantitative_contribution: m.is_quantitative ? (m.quantitative_contribution ?? null) : undefined,
    reason_code: m.reason_code ?? ''
  };
}
```

`SaveMappingsResult` is a discriminated union:

```ts
type SaveMappingsResult =
  | { ok: true }
  | { ok: false; status: number; description: string; fieldErrors?: Record<string, string>; failedKey?: HloModalSelectionKey };
```

The `failedKey` lets the alignment component direct inline errors to the right HLO card.

#### 4.4.2 EXTENDED — `ApiService`

Five new methods per §3.1.

#### 4.4.3 EXTENDED — `AllModalsService` (registration)

Add `'hloSelection'` to `ModalName`. Confirm during impl whether explicit registration is needed (existing pattern, established in tag-visibility + alignment-section flows).

### 4.5 Forms (HLO card)

Each HLO card holds two editable controls bound directly to its `pendingMappings` entry:

| Control | Visibility | Required | Source |
| --- | --- | --- | --- |
| `quantitative_contribution` | When `mapping.is_quantitative === true` (REQ-BIL-IM-10) | Per backend; default optional | Per-indicator option list per OQ-IM-5 |
| `reason_code` | Always (when editable) | Yes — Save blocks if empty across cards | Per-indicator option list per OQ-IM-4 |

Change handlers call `bilateralService.updateMappingField(key, patch)` immediately. There is no per-card "Save" button; the alignment-form Save commits everything.

### 4.6 Theming

**Reuses existing `--ac-*` tokens.** Three minor token gaps the mockup README §5 flagged:

- `--ac-info-icon` (= `#3B82F6`) — for the info banner + info-circle icons that the SCIENCE PROGRAM CONTRIBUTION block uses.
- `--ac-input-icon` (= `#6B7280`) — semantic alias near `--ac-grey-600/700` for chevron-down, search icons.
- `--ac-surface-900` (= `#212121`) — reserved dark surface; possibly out of v1 scope.

**Decision**: add the first two now (T-BIL-IM-RR-01), defer `--ac-surface-900` until a surface needs it.

**Stale badge / "Mapped" badge / status tags**: reuse existing PrimeNG severities or `'pool-funding'` STATUS_COLOR_MAP entry from tag-visibility — no new entries.

### 4.7 Alignment-section mockup remediation (rolls divergences A–F + G + I into this spec)

The audit found six clear divergences in the shipped alignment-section (commit `17417fdd`). All land as changes on `PoolFundingAlignmentComponent` since that's the host. Rationale for folding into this spec: the AI card from REQ-BIL-IM-01 sits exactly where these remediations sit; doing both in one pass avoids touching the same template twice.

| ID | Divergence | Fix | Source mockup |
| --- | --- | --- | --- |
| RR-A | Yes/No control: `<p-selectButton>` shipped; mockup is **radio group** | Swap to PrimeNG `<p-radiobutton>` two-option group with inline horizontal layout | `32470-3149` §4, `32471-129337` §3 |
| RR-B | Missing section heading `SCIENCE PROGRAM CONTRIBUTION` (uppercase tracked) | Add a section `<h3>` styled via `form-header` variant | `32470-3149` §3 |
| RR-C | Question copy: shipped `"Does this result contribute to Pool Funding?"`; mockup is `"Does this result contribute to a Science Program or Accelerator?"` | Update the literal in the template | `32470-3149` §3, `33528-138394` §3 |
| RR-D | Missing info banner `"Select the High-Level Outputs (HLO) and related indicators this result contributes to."` | Add an `<app-alert-tag>`-style inline-info component above the radio group | `32470-3149` §3 |
| RR-E | Tab position: shipped between Alliance Alignment and Partners; mockup positions at the **bottom** of the sidebar (below "Contributions to indicators") | Move the `SidebarOption` insertion to the bottom of `allOptions` array in `result-sidebar.component.ts` | `33356-11736` §2 |
| RR-F | Tab label casing: shipped `"Pool Funding alignment"`; mockup is `"Pool funding alignment"` (lowercase "f") | Single-character template change | `33356-11736` §2 |
| RR-G | Section-level **justification textarea** (500 chars) shipped, but mockup has no such field — reason lives per-HLO card | **Remove the justification textarea** from the alignment-section template; backend `justification` field becomes deprecated client-side (server still accepts it, but FE no longer sends it). Spec test updated accordingly. **Conflict**: backend handoff §4.3 has the field; resolution rolled into OQ-IM-1's BA conversation. | Mockup absence + `33356-11075` per-card reason |
| RR-I | OQ-FIG-1: required marker (`*`) on the Yes/No question — two mockups disagree | Resolve with designer in a single sentence: ✅ include `*` (matches the stricter `33528-138394`). Apply via `<span class="atc-red-1">*</span>` next to the label + `aria-required="true"` | `33528-138394` §1 |

These land as a single task (T-BIL-IM-RR-01) before the indicator-mapping work starts, so the AI card / HLO cards land in a corrected host.

---

## 5. Security & authorization

Identical to alignment-section. `bilateralService.editable` gates every CTA (AI card CTA, HLO modal Confirm, HLO card × and edit affordances). Server is authoritative on mutation.

---

## 6. Error handling

| Path | Behavior |
| --- | --- |
| 400 on any mutation | `failedKey` directs error to the offending HLO card's Reason / Quantitative inline error. Toast suppressed by URL exception. |
| 409 on any mutation | Stop the batch. Refetch alignment + mappings. Show warning toast (AC-16). |
| 5xx | Global `httpErrorInterceptor` toast. `pendingMappings` preserved so the user can retry. |
| Catalog empty (REQ-BIL-IM-14) | Modal shows the empty-catalog message; Confirm disabled. AI card body updates to explain catalog state. |

---

## 7. Real-time considerations

**No new socket subscription.** The existing `result.pool-funding-alignment.changed` subscription from alignment-section is the only event. The HLO modal + card cluster reacts via signal reads:

- An `effect` on `currentAlignment()?.selected_levers` triggers `getIndicators` + `getMappings`.
- The same effect handles socket reconcile (the alignment-section handler refetches `currentAlignment`, which the effect then picks up).
- Dirty-modal race: if the modal is open when an event arrives, the parent's existing info toast handles it; the modal stays open with its draft selection intact.

---

## 8. Performance

- **HLO modal first paint** ≤ 0.6 s on a result with 5 SPs × 3 AOWs × 5 indicators (REQ-BIL-IM-NF-01).
- **AOW switch** ≤ 0.3 s (client-side switch within the cached `indicatorGroups()`).
- **Inline HLO cards** ≤ 1.5 s on a similar load.
- **Bundle**: AI card + HLO modal + HLO cards lazy-loaded within the alignment-section chunk; total gzip ≤ 60 KB (REQ-BIL-IM-NF-03). Initial chunk addition ≤ 5 KB (`BilateralService` extension).
- **Search debounce**: 300 ms.

---

## 9. Accessibility (WCAG 2.1 AA — PRD C-4)

- **AI card**: `role="region"` + `aria-labelledby` (REQ-BIL-IM-NF-02).
- **HLO modal**: focus trap (via existing `modal` wrapper). Sidebar SP/AOW navigable via arrow keys (custom). AOW count badges have `aria-label="<n> indicators selected in <AOW name>"`.
- **Disabled indicator rows**: reason text via `aria-describedby` always present in DOM (not hover-only). Disabled checkbox announces reason on focus.
- **Counter** ("Selected → N items"): `aria-live="polite"` so changes are announced.
- **HLO cards**: × button has `aria-label="Remove mapping for <indicator name> under <AOW name>"`. Inline errors use `role="alert" aria-live="polite"`.
- **Compact 79×33 quantitative dropdown**: padding adjusted to meet the 44×44 touch target without changing visual size.

---

## 10. Telemetry

- `bilateral.hlo.modal.opened` — once per result per session.
- `bilateral.hlo.selection.confirmed` — payload `{ result_code, added_count, removed_count, total_count }`.
- `bilateral.hlo.mapping.saved` — per successful POST/PATCH/DELETE, payload `{ result_code, indicator_code, lever_code, operation }`.
- `bilateral.alignment.viewed` (existing from alignment-section) — unchanged.

No PII shipped. Reason / Quantitative values NOT included in telemetry to keep payloads minimal and PII-safe.

---

## 11. Design decisions (decision record)

> Append-only. Newest at the bottom.

- **2026-05-23 — Mockup-first rewrite of the design.** Initial draft was backend-handoff-first; the figma-mockups corner is the canonical UX source. Conflicts with backend handoff are flagged as gating OQs in requirements §12 rather than silently picking a side.

- **2026-05-23 — Alignment-section remediation lands inside this spec (§4.7).** Rationale: AI card + HLO cards mount in the same component as the section heading / radio / info banner / removed justification textarea; doing both in one pass avoids redoing the template twice. The remediation is gated by the same BA conversation that answers OQ-IM-1.

- **2026-05-23 — `BilateralActionCardComponent` as a reusable shared component, not bilateral-specific** — the "promo card" visual is generic enough that other STAR surfaces may want it. Putting it under `shared/components/` keeps the door open.

- **2026-05-23 — Modal Confirm writes to a draft signal; server mutations fire only on alignment-form Save.** Matches the mockup intent (HLO cards appear on the form post-confirm, with editable Quantitative / Reason — server doesn't know yet) and avoids interleaving server calls per selection click. Save-time batch is the single mutation point.

- **2026-05-23 — Diff-and-batch on Save: DELETE → POST → PATCH** (in that order). DELETEs first to free server-side constraints; POSTs next to establish new mappings; PATCHes last to update existing ones. Stops on first 409.

- **2026-05-23 — Stale badge uses PrimeNG `<p-tag severity="warning">`** (no new token), inherited from the prior design draft. Design QA may revisit.

- **2026-05-23 — Disabled-indicator reason from the server (not client rules)** — the mockup says the reason is dynamic; backend exposes it via a new `disabled_reason: string | null` field on `IndicatorRow` (OQ-IM-9). FE renders, doesn't decide.

- **2026-05-23 — AI card CTA copy: `View HLOs`** (resolves OQ-FIG-5). The mockup's `Upload file` is a copy-paste artifact; the action launches the modal, doesn't upload anything.

- **2026-05-23 — Required marker (`*`) on the Yes/No question: include it** (resolves OQ-FIG-1, RR-I). The stricter mockup `33528-138394` is the version we follow; designers can flag if otherwise.

- **2026-05-23 — Quantitative + Reason live on `HloMapping`, not on a separate per-card form**. Edits flow through `bilateralService.updateMappingField()`. Reactive Forms are not used here — simpler signal-driven updates suffice and integrate cleanly with the diff on Save.

---

## 12. Testing strategy

### 12.1 Unit tests

| Subject | File | Coverage focus |
| --- | --- | --- |
| `ApiService.{GET,POST,PATCH,DELETE}_PoolFundingContribution` + `GET_PoolFundingIndicators` | `api.service.spec.ts` *(extended)* | URL encoding, query params, body shape (per OQ-IM-1). |
| `BilateralService.getIndicators` / `getMappings` | `bilateral.service.spec.ts` *(extended)* | Happy path, signal toggles, query-param composition. |
| `BilateralService.loadModalSelection / commitModalSelection / cancelModalSelection` | same | Draft snapshot + revert + commit semantics. |
| `BilateralService.updateMappingField / removeMapping` | same | Mutation correctness on `pendingMappings`. |
| `BilateralService.saveMappings` | same | Diff correctness (added / updated / removed); DELETE→POST→PATCH order; stop on 409; `failedKey` propagation on 400/5xx. |
| `BilateralActionCardComponent` | new spec | Renders inputs; emits `(ctaClick)`; a11y attrs. |
| `HloSelectionModalComponent` | new spec | (see breakdown). |
| `HloCardComponent` | new spec | (see breakdown). |
| `PoolFundingAlignmentComponent` *(extended)* | existing spec | AI card visibility gating; HLO card list rendering; Save calls `saveMappings`; mockup remediation regressions (RR-A..F + G + I). |

`HloSelectionModalComponent` spec (~15 cases):
- Sidebar lists SPs from selected_levers; expanding shows AOWs.
- Active AOW switch changes the main pane.
- Search debounce → re-fetch with `search` param.
- Per-row commit toggles row + updates counter + updates AOW badge.
- Disabled row: checkbox unclickable; reason callout in DOM with `aria-describedby`.
- Stale row: `is_stale && !is_mapped` treated as disabled.
- Empty catalog state: Confirm disabled.
- Cancel with no draft changes: closes immediately.
- Cancel with draft changes: confirm dialog "Discard?".
- Confirm: calls `commitModalSelection`; modal closes.

`HloCardComponent` spec (~10 cases):
- Renders header (code + name) + status tag + × (when editable).
- Expected target row hides when `target_description` null.
- Quantitative row hides when `is_quantitative=false`; renders when true.
- Reason dropdown required; empty + Save attempt surfaces inline error.
- Stale badge present when `is_stale=true`.
- × hidden when `!editable || is_read_only`.
- `(reasonChange)` / `(quantitativeChange)` / `(remove)` events fire with the right key.

### 12.2 DOM-level tests

5–7 DOM cases on the parent + modal + card cluster, focused on regression resistance for the **mockup-quoted copy** (RR-B, RR-C, RR-D, RR-F):

- Section heading literal `SCIENCE PROGRAM CONTRIBUTION` present.
- Question copy literal `Does this result contribute to a Science Program or Accelerator?*` present.
- Info banner copy literal present.
- Tab label literal `Pool funding alignment` (lowercase "f") present.
- AI card title literal `VIEW HIGH LEVEL OUTPUTS` present.
- HLO modal title literal `High Level Outputs` present.

These tests are deliberately literal — copy drift caught by CI.

### 12.3 Coverage delta

- New services: ≥ 90% statements.
- New components: ≥ 70% statements.
- Project-wide floors unchanged.

### 12.4 Manual smoke (PR-review)

- AI card appears after alignment Save with `has_contribution=Yes` + lever set.
- Click AI card → HLO modal opens with selected SPs in sidebar; AOWs expand on click; active AOW highlighted.
- Pick 3 indicators → counter reads `Selected → 3 items`; AOW badge shows "3".
- Cancel → confirm dialog; Discard returns to clean state.
- Confirm → modal closes; 3 HLO cards render inline grouped by SP / AOW.
- Edit Reason on one card → form is dirty; Save → POST fires; success toast; card stays.
- Remove one card via × → confirm dialog; on confirm, card disappears; next Save fires DELETE.
- Stale indicator: open modal; row disabled with reason callout. If already mapped, card still renders with Stale badge + editable Reason.
- Synced result: modal can't be opened from the AI card (CTA hidden); HLO cards read-only.
- Mockup-remediation manual checks: heading present, info banner present, radio works, tab at bottom of sidebar, label lowercase "f", `*` next to question.

---

## 13. Risks & mitigations

- **R-1 — OQ-IM-1 unresolved (contribution body shape).** Spec cannot finalize the `bodyOf()` mapping. *Mitigation*: T-BIL-IM-01 is **gated** on this resolution; we don't write any contribution-mutation code until the BA picks a path.
- **R-2 — OQ-IM-2 unresolved (AOW data source).** Whole modal + HLO card grouping depends on AOW data. *Mitigation*: T-BIL-IM-01 also gated; fallback path is FE code-prefix inference, documented but only used if backend can't extend.
- **R-3 — OQ-IM-3 unresolved (edit-mode pre-fill).** Less severe but blocks editing existing mappings. *Mitigation*: T-BIL-IM-01 gates; fallback to embedded data in `IndicatorRow.contribution`.
- **R-4 — Alignment-section remediation touches a shipped surface.** Risk of breaking the existing alignment tests. *Mitigation*: every remediation has a paired spec assertion (RR-A..F + G + I); existing tests updated in the same PR.
- **R-5 — Bundle bloat from the HLO modal.** Sidebar + table + a11y plumbing could exceed budget. *Mitigation*: lazy-load the modal (PrimeNG dialog content); track `ng build --stats-json` per PR.
- **R-6 — Diff-and-batch save can leave partial state on mid-batch 409.** Some mappings persisted, some not. *Mitigation*: refetch `getMappings` after any 409 so the UI always reflects server truth; `pendingMappings` resets from there.
- **R-7 — Disabled-reason source ambiguity (OQ-IM-9).** If backend doesn't add a `disabled_reason` field, the rule logic leaks client-side. *Mitigation*: T-BIL-IM-01 verifies; if absent, we render generic "Cannot be mapped" until backend ships the field, and log telemetry to measure user impact.
- **R-8 — Removing the section justification (RR-G) loses data that backend still stores.** *Mitigation*: do NOT send `justification` on PATCH alignment anymore; backend keeps its column nullable. If existing results have non-null `justification`, the field is shown read-only one last time (TBD UX detail — small follow-up).

---

## 14. References

- PRD: [`docs/prd.md`](../../../prd.md) §3, §4, §8.3.
- System Design: [`docs/system-design/design.md`](../../../system-design/design.md) §7 (tokens — three gaps to add), §8 (components), §12 (decisions log — update on merge).
- Detailed Design: [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §2, §4.3, §6.
- **Figma mockups (authoritative for UX)**:
  - [`../figma-mockups/README.md`](../figma-mockups/README.md) — index, token map, OQ roll-up.
  - [`../figma-mockups/32470-3149-pool-funding-alignment-default.md`](../figma-mockups/32470-3149-pool-funding-alignment-default.md) — entry state.
  - [`../figma-mockups/33528-138394-pool-funding-alignment-default-required.md`](../figma-mockups/33528-138394-pool-funding-alignment-default-required.md) — required marker.
  - [`../figma-mockups/33528-138106-pool-funding-alignment-no-branch.md`](../figma-mockups/33528-138106-pool-funding-alignment-no-branch.md) — No branch.
  - [`../figma-mockups/32471-129337-pool-funding-alignment-sp-dropdown-open.md`](../figma-mockups/32471-129337-pool-funding-alignment-sp-dropdown-open.md) — canonical SP picker.
  - [`../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md`](../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md) — AI card.
  - [`../figma-mockups/32471-131617-hlo-modal-empty.md`](../figma-mockups/32471-131617-hlo-modal-empty.md) — modal shell.
  - [`../figma-mockups/33563-138613-hlo-modal-disabled-reason.md`](../figma-mockups/33563-138613-hlo-modal-disabled-reason.md) — disabled row.
  - [`../figma-mockups/33563-137770-hlo-modal-3-items-selected.md`](../figma-mockups/33563-137770-hlo-modal-3-items-selected.md) — selection state.
  - [`../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md`](../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md) — HLO cards (filled, reasons empty).
  - [`../figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md`](../figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md) — quantitative variant.
  - [`../figma-mockups/33356-12370-pool-funding-alignment-filled-reason.md`](../figma-mockups/33356-12370-pool-funding-alignment-filled-reason.md) — viewport reference.
  - [`../figma-mockups/33356-11736-pool-funding-alignment-synchronized.md`](../figma-mockups/33356-11736-pool-funding-alignment-synchronized.md) — synced state (informs tab position RR-E).
- Sibling specs:
  - [`../tag-visibility/`](../tag-visibility/) — `BilateralService` origin.
  - [`../alignment-section/`](../alignment-section/) — `editable`, `currentAlignment`, socket subscription, URL exception. **Foundations reused; §4.7 remediates copy/structure divergences.**
- Backend handoff: [`../ari-backend-context/frontend-handoff.md`](../ari-backend-context/frontend-handoff.md) §4.4, §4.5, §5, §6, §7 — referenced where it agrees with the mockups; conflicts isolated under OQ-IM-1 / OQ-IM-2.
- Code anchors:
  - `research-indicators/src/app/shared/services/bilateral.service.ts` — extend.
  - `research-indicators/src/app/shared/services/api.service.ts` — extend (5 new methods).
  - `research-indicators/src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts` — extend.
  - `research-indicators/src/app/shared/types/modal.types.ts` — add `'hloSelection'`.
  - `research-indicators/src/app/shared/components/bilateral-action-card/` — new.
  - `research-indicators/src/app/shared/components/all-modals/modals-content/hlo-selection-modal/` — new.
  - `research-indicators/src/app/pages/platform/pages/result/pages/pool-funding-alignment/components/hlo-card/` — new.
  - `research-indicators/src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.{ts,html}` — extended + RR remediation.
  - `research-indicators/src/app/shared/components/result-sidebar/result-sidebar.component.ts` — RR-E (tab position) + RR-F (label).
  - `research-indicators/src/styles/colors.scss` — add `--ac-info-icon`, `--ac-input-icon` (§4.6).
