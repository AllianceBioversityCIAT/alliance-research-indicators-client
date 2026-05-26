# Requirements — Bilateral Module / Alignment Section

> Feature folder under [`../`](../). Scoped to **US2 (AC-1594)** — render the Pool Funding Alignment section inside the result detail, let authorized users toggle `has_contribution`, pick Science Program / Accelerator levers, save, and reconcile across tabs in real time. Follows the template at [`../../general-setup/requirements.md`](../../general-setup/requirements.md).

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/alignment-section/` |
| Proposal | [`../proposal.md`](../proposal.md) — approved 2026-05-19 |
| Sibling spec (predecessor) | [`../tag-visibility/`](../tag-visibility/) — shipped 2026-05-20 (commit `2779b5fd`) |
| Sibling spec (successor) | [`../indicator-mapping/`](../indicator-mapping/) — pending |
| Status | SHIPPED — all 14 tasks completed 2026-05-22 / 2026-05-23 (see [`./tasks.md`](./tasks.md) §10) |
| Domain abbreviation | `BIL-AS` |
| Backend handoff | [`../ari-backend-context/frontend-handoff.md` §4.2 + §4.3 + §5 + §6](../ari-backend-context/frontend-handoff.md) |
| Jira | [`../jira-us/AC-1594-us2-pool-funding-alignment.md`](../jira-us/AC-1594-us2-pool-funding-alignment.md) |
| Constitutional anchors | [`docs/prd.md`](../../../prd.md) §3–§5, §8.3 (C-1..C-6) · [`docs/system-design/design.md`](../../../system-design/design.md) · [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §2, §4, §6 |

---

## 2. Executive summary

Today a Principal Investigator working on a W3 / Bilateral-funded result has no way, inside the STAR client, to confirm that their result contributes to CGIAR Pool Funding (Science Programs / Accelerators) or to record which programs it contributes to. The ARI backend now exposes `GET /api/v1/results/:resultCode/pool-funding-alignment` and `PATCH /api/v1/results/:resultCode/pool-funding-alignment` plus a Socket.IO event for cross-tab reconcile.

This spec ships the **Pool Funding Alignment section** inside the result detail page as a **12th, conditionally-rendered tab**. The tab appears only when the result's primary AGRESSO contract is tagged as a Pool Funding contributor (eligibility driven by the field landed in tag-visibility). When the user is an authorized editor (Creator / PI / contact, Center Admin, or System Admin) they can toggle `has_contribution`, multi-select levers, add optional justification, and save. The section becomes read-only after PRMS sync. Real-time reconcile keeps multiple tabs / users editing the same result coherent.

The work is intentionally bounded to the alignment GET/PATCH endpoints and the socket event — indicator panel and per-type contribution forms ship in the next feature folder ([`../indicator-mapping/`](../indicator-mapping/)).

---

## 3. Glossary

- **Pool Funding Alignment** — the result-level metadata that records (a) whether a bilateral result contributes to CGIAR Pool Funding and (b) which Science Programs / Accelerators it contributes to via the lever taxonomy.
- **Lever** — a Science Program or Accelerator (Pool Funding-funded entity in CLARISA's taxonomy). `lever_code` is the stable identifier, `lever_name` the display string.
- **`has_contribution`** — the user-controlled boolean: "does this result contribute to Pool Funding?". `null` until first set. When `true`, at least one lever is required.
- **`is_synced_to_prms`** — server-driven flag: the result has been pushed to PRMS. After this flips true, the alignment becomes immutable from the client (PATCH returns 409). See AR.2.
- **`is_read_only`** — derived flag returned on GET; mirrors `is_synced_to_prms` plus any future server-side read-only triggers. Single source of truth for the client's disable logic.
- **Eligibility** — `eligible === true` when the result's primary AGRESSO contract has `is_pool_funding_contributor=true`. Drives whether the tab renders at all.
- **Result-owner** — the result's Creator, PI, or designated contact. Combined with role-level permission, determines editability.
- **AR.1 / AR.2 / AR.3** — the three "alignment rules" the backend enforces and the client must mirror: edit-regardless-of-status / read-only-after-sync / not-part-of-submission-validator.

---

## 4. System context & scope

### 4.1 In scope

- **REQ-BIL-AS-01..06** — the alignment section: conditional render, view, edit, save, read-only-after-sync, real-time reconcile.
- **REQ-BIL-AS-07** — Edit-regardless-of-status (AR.1).
- **REQ-BIL-AS-08** — Alignment-not-in-submission-validator (AR.3).
- **REQ-BIL-AS-09** — Role + ownership editability gating, with both branches collapsed to a read-only affordance for non-editors (so the wrong-role / wrong-owner branches don't need separate UX).
- **REQ-BIL-AS-10** — 409 Conflict handling (the result was synced between GET and PATCH).
- **NF-01..06** — performance, accessibility, bundle, theming, i18n-ready, coverage.

### 4.2 Out of scope

- **Indicators panel** (REQ-BIL-IM-* in the next spec) — `GET .../indicators` and the indicator browser, search, filter.
- **Per-`indicator_type` contribution forms** (next spec) — capacity_sharing / knowledge_product / policy_change / innovation_development / NOOP.
- **PRMS push UI surfaces** (US5; backend PENDING) — push button, push history, retry-on-failure.
- **W3 Registry sync UI** (US6; backend PENDING).
- **SP ToC sync UI** (US7; backend PENDING).
- **`innovation_use`** — deferred per D5=C; no backend handler.
- **i18n** — strings English-only; new strings will be extractable for a future i18n pass.

### 4.3 Architectural fit

- **Stack**: Angular 19 + PrimeNG 19 (PRD C-1). Lazy standalone component (C-6).
- **Auth**: Existing Cognito JWT + `jWtInterceptor` (C-2). Editability gates locally via `RolesService` + result-owner check; server is the authority on mutation.
- **Controlled vocabularies**: CLARISA lever taxonomy (C-3). No new taxonomies.
- **State**: signals (C-6); extends the existing `BilateralService` facade (from tag-visibility) with alignment-related signals + methods.
- **Real-time**: `ngx-socket-io` via `WebsocketService.listen(...)`. No new socket library; extending the existing service with one event subscription.
- **API**: extends `ApiService` with two new methods (`GET_PoolFundingAlignment`, `PATCH_PoolFundingAlignment`). All responses flow through `MainResponse<T>`.

---

## 5. Stakeholders / personas

> PRD §3.

| Persona | Interest | Role here |
| --- | --- | --- |
| **Researcher (PI / Contributor)** | Tell the system whether their bilateral result contributes to Pool Funding and which programs. | Primary editor when they are the result's PI / Creator / contact. Read-only otherwise. |
| **Center Admin** | Audit + correct alignment across results in their center. | Editor on any eligible result (ownership bypass). |
| **System Admin** | Same as Center Admin, system-wide. | Editor on any eligible result. |
| **MEL Regional Expert** | Validate alignment across centers. | Read-only consumer of the section. |
| **Cross-Platform Consumer** | Inherit alignment metadata downstream (federation). | Read-only via the GET endpoint; not a UI consumer of this spec directly. |

---

## 6. Functional requirements

### REQ-BIL-AS-01 — *Pool Funding Alignment tab is conditionally rendered*

- **Statement**: The user can see a "Pool Funding Alignment" tab in the result detail sidebar **only** when the result is eligible (`eligible === true` from `GET /pool-funding-alignment`).
- **Persona(s)**: All authenticated personas.
- **PRD goal(s)**: G-1 (traceability of bilateral contributions).
- **Acceptance criteria**:
  - AC-01.1 — On a result with `eligible=true`, the sidebar shows a new tab labeled "Pool Funding Alignment" between the "Alliance alignment" tab and the "Partners" tab (or appended at the end if that position causes visual conflict — confirmed in `design.md`).
  - AC-01.2 — On a result with `eligible=false`, the tab is **hidden entirely** (not greyed out). Direct URL navigation to `/result/:resultCode/pool-funding-alignment` on an ineligible result redirects to `/result/:resultCode/general-information`.
  - AC-01.3 — When the eligibility signal is loading (no GET response yet), the tab is hidden until the response arrives — never flicker visible then hidden.

### REQ-BIL-AS-02 — *User can view the alignment section*

- **Statement**: An authenticated user with access to the result can view the current alignment values (`has_contribution`, selected levers, justification, sync state).
- **Persona(s)**: All authenticated personas (PI / Center Admin / System Admin / MEL Regional Expert).
- **Acceptance criteria**:
  - AC-02.1 — The section renders three subsections (per Figma mockups in [`../figma-mockups/`](../figma-mockups/)):
    1. **Contribution toggle** — "Does this result contribute to Pool Funding?" Yes/No.
    2. **Lever picker** (only when `has_contribution=true`) — selected Science Programs / Accelerators.
    3. **Justification** (optional) — free text.
  - AC-02.2 — When `has_contribution === null` (never set), the toggle shows no default selection (neither Yes nor No is pre-selected); the lever picker is hidden until the user picks Yes.
  - AC-02.3 — When `has_contribution === false`, the lever picker is hidden; the section displays "No Pool Funding contribution recorded."
  - AC-02.4 — When `has_contribution === true`, the lever picker shows the `selected_levers` as chips/tags, ordered by `lever_code`.
  - AC-02.5 — Justification renders as read-only text below the picker when present.

### REQ-BIL-AS-03 — *Authorized user can edit `has_contribution`*

- **Statement**: The user can toggle "does this contribute" between Yes / No when they are authorized to edit (role + ownership).
- **Persona(s)**: PI / Creator / contact (CONTRIBUTOR + owner) · Center Admin · System Admin.
- **Acceptance criteria**:
  - AC-03.1 — Authorized users see an interactive toggle (PrimeNG `p-selectButton` or similar pattern).
  - AC-03.2 — Unauthorized users (CONTRIBUTOR-without-ownership, MEL Regional Expert, Technical Support) see the same toggle disabled and the user-visible affordance "You can't edit this section" (read-only mode — see REQ-BIL-AS-09).
  - AC-03.3 — Switching the toggle to "No" wipes the in-form lever selection but does not persist until Save.
  - AC-03.4 — Switching to "Yes" reveals the lever picker; if `selected_levers` already had values server-side, the picker pre-fills them.

### REQ-BIL-AS-04 — *Authorized user can select one or more levers when `has_contribution=true`*

- **Statement**: The user can multi-select Science Programs / Accelerators from a CLARISA-driven picker.
- **Acceptance criteria**:
  - AC-04.1 — Lever picker uses the existing shared `MultiselectComponent` configured against the CLARISA `levers` source (already used by `alliance-alignment` and `my-projects`).
  - AC-04.2 — At least one lever must be selected when `has_contribution=true` to enable Save (client mirror of server validation).
  - AC-04.3 — Removing a lever via the picker chip's X reflects immediately in the form state; Save remains gated until ≥1 lever is selected (or `has_contribution` flips back to No).

### REQ-BIL-AS-05 — *Authorized user can add optional justification*

- **Statement**: The user can attach a free-text justification (up to 500 chars).
- **Acceptance criteria**:
  - AC-05.1 — Textarea wrapped via the existing `custom-fields` styling, with character counter and `maxlength=500` enforced both via the HTML attribute and in the input handler (defense against paste).
  - AC-05.2 — Justification is optional — empty value is a legitimate save state.
  - AC-05.3 — Justification text is persisted by the backend via the same PATCH body (`justification` field; see [handoff §4.3](../ari-backend-context/frontend-handoff.md#43-patch-alignment)).

### REQ-BIL-AS-06 — *Save persists via PATCH and the section reflects the new state*

- **Statement**: The user can save edits via a Save button that triggers `PATCH /pool-funding-alignment`.
- **Acceptance criteria**:
  - AC-06.1 — Save button is disabled until the form differs from the loaded server state (`isDirty`), or when an in-flight save is pending.
  - AC-06.2 — On 200, the section repaints with the server-returned alignment, a success toast appears ("Pool Funding Alignment saved"), and `BilateralService.currentAlignment` is updated.
  - AC-06.3 — On 400 (validation error from the server), errors render inline next to the offending field; the toast layer is suppressed (mirror the `httpErrorInterceptor` URL-scoped exception pattern from tag-visibility).
  - AC-06.4 — On 409 (synced — see REQ-BIL-AS-10), the section transitions to read-only and shows the synced banner; no retry attempted.
  - AC-06.5 — On 5xx, the global error path applies (toast via `httpErrorInterceptor`); the form state is preserved so the user can retry.

### REQ-BIL-AS-07 — *Section is read-only when result is synced to PRMS*

- **Statement**: When `is_read_only === true` on the GET response, every input is disabled and a "synced — read only" badge appears in the section header.
- **PRD goal(s)**: G-2 (auditable bilateral lineage; immutable once federated).
- **Acceptance criteria**:
  - AC-07.1 — All form inputs (`has_contribution` toggle, lever picker, justification textarea, Save button) are disabled.
  - AC-07.2 — A read-only badge renders in the section header (label: "Synced — read only"; tooltip: "This result has been pushed to PRMS. Alignment can no longer be edited from STAR.").
  - AC-07.3 — Direct URL `?force=true`-style overrides are NOT supported; the disabled state is server-driven only.

### REQ-BIL-AS-08 — *Edit succeeds regardless of `result_status`*

- **Statement**: Editing the alignment is **not gated** by the result's lifecycle status (Draft / Editing / Submitted / etc.) — per AR.1.
- **Acceptance criteria**:
  - AC-08.1 — The Save button is enabled for authorized editors regardless of the parent result's `result_status` (no client-side status guard).
  - AC-08.2 — The other tabs may use the existing status-guard pattern; this tab explicitly does not.

### REQ-BIL-AS-09 — *Alignment is NOT part of the result submission validator*

- **Statement**: A result can be submitted with empty alignment (`has_contribution=null` or `has_contribution=false`) — per AR.3.
- **Acceptance criteria**:
  - AC-09.1 — The existing submission-validator logic does **not** check the alignment section. Empty alignment does not block the Submit CTA.
  - AC-09.2 — The alignment section is not represented in the `greenChecks` map used by `ResultSidebarComponent` to count completed sections.

### REQ-BIL-AS-10 — *Unauthorized users see a read-only view*

- **Statement**: Users without edit permission see the same content as authorized users, but without any edit affordance.
- **Acceptance criteria**:
  - AC-10.1 — `RolesService` + result-owner check determines editability. Result-owner is derived locally from `result.creator_id` / `result.principal_investigator_id` / `result.contact_id` vs. current user (existing pattern; see [detailed-design.md §6](../../../detailed-design/detailed-design.md)).
  - AC-10.2 — Non-editors see all form fields visually present but disabled; the Save button is hidden entirely (not just disabled, to clearly communicate read-only).
  - AC-10.3 — A subtle banner ("You don't have permission to edit this section") renders at the top of the section for read-only consumers.

### REQ-BIL-AS-11 — *Real-time reconcile via Socket.IO event*

- **Statement**: When `result.pool-funding-alignment.changed` fires for the current result, the section refreshes its read model (re-fetches alignment) and shows a non-disruptive notification.
- **Acceptance criteria**:
  - AC-11.1 — The component subscribes to the event on init and unsubscribes on destroy. Subscription is per-result (filter the event by `payload.result_code === currentResultCode`).
  - AC-11.2 — On a matching event, `bilateralService.getAlignment(resultCode)` is called; the section re-renders with the new state.
  - AC-11.3 — If the local form is dirty (user typing) when the event arrives, do not overwrite the form. Instead show a toast: "Another user updated this alignment. Refresh to see the latest." The toast has a "Refresh" action that triggers a re-fetch + form reset.
  - AC-11.4 — When the socket is disconnected, the section continues to function via REST polling-on-tab-focus (lightweight fallback — re-fetch GET when the user re-focuses the tab/window). See [detailed-design.md §6.4](../../../detailed-design/detailed-design.md).
  - AC-11.5 — Reconcile completes within 2 s of receiving the event under normal conditions.

### REQ-BIL-AS-12 — *409 Conflict (synced) is handled gracefully*

- **Statement**: When PATCH returns 409 (the result became synced between GET and PATCH), the UI does not show a generic error; it transitions to read-only with the same UX as AC-07.
- **Acceptance criteria**:
  - AC-12.1 — On 409, the section refetches alignment (`is_read_only` now true), repaints with disabled inputs, shows the "synced — read only" badge, and shows a one-time toast "This result was synced to PRMS. Your unsaved alignment changes were not applied."
  - AC-12.2 — Toast severity is `warning`, not `error`. The user's expectation of saving has been thwarted; the message must be specific.

---

## 7. Non-functional requirements

- **REQ-BIL-AS-NF-01 — Performance.** Initial tab render completes in ≤ 1.0 s on a mid-range laptop (Lighthouse mobile profile) on a result with 5 selected levers. Re-fetch on socket reconcile completes in ≤ 1.0 s on the same profile.
- **REQ-BIL-AS-NF-02 — Accessibility (C-4).** All form controls have associated labels; the read-only badge has an `aria-label`; the dirty-state toast has `role="status"` and is keyboard-dismissible; focus order is logical (toggle → lever picker → justification → Save); contrast meets WCAG 2.1 AA on every new visual.
- **REQ-BIL-AS-NF-03 — Bundle budget (C-5).** The new tab is lazy-loaded; its chunk adds ≤ 30 KB gzipped. Net JS added to the initial chunk ≤ 5 KB (additions to `BilateralService` + `WebsocketService` listener wiring).
- **REQ-BIL-AS-NF-04 — Theming.** Dark + light parity for every new visual via `--ac-*` tokens. The synced badge introduces at most one new token pair if no existing token fits.
- **REQ-BIL-AS-NF-05 — i18n.** New strings are static template literals (no `${variable}` interpolation into displayed copy), extractable for a future i18n pass.
- **REQ-BIL-AS-NF-06 — Coverage.** New service methods ≥ 90% statements; new component ≥ 70%. Project-wide floors must not regress.

---

## 8. Data inputs & outputs

### 8.1 Inputs (REST)

| Endpoint | Service method | Used by | Notes |
| --- | --- | --- | --- |
| `GET /api/v1/results/:resultCode/pool-funding-alignment` (new) | `ApiService.GET_PoolFundingAlignment(resultCode)` (new) | `BilateralService.getAlignment` | Returns `AlignmentResponse`. Bearer JWT required. |
| `PATCH /api/v1/results/:resultCode/pool-funding-alignment` (new) | `ApiService.PATCH_PoolFundingAlignment(resultCode, body)` (new) | `BilateralService.patchAlignment` | `UpdatePoolFundingAlignmentDto`. 200/400/409 paths. |
| (existing) `GET_FindContracts` | `MyProjectsService.main` etc. | eligibility seeding | Already wired in tag-visibility — no change. |

### 8.2 Inputs (Socket.IO)

| Event | Direction | Payload | Used by |
| --- | --- | --- | --- |
| `result.pool-funding-alignment.changed` | server → client | `{ result_code: string; by_user_id: number; at: string }` | `WebsocketService.listen(...)` consumed by the alignment-section component |

### 8.3 Outputs (UI)

- New result-detail tab `/result/:resultCode/pool-funding-alignment`.
- New sidebar entry in `ResultSidebarComponent` (`SidebarOption` with `hide` driven by eligibility).
- Inline edit form (toggle + multiselect + textarea + Save button).
- Synced-state badge + read-only banner.
- Real-time reconcile toast.

### 8.4 Persisted state

- No new client-side persistence introduced. The alignment is server-side state; the client renders it.
- The `BilateralService.currentAlignment` signal lives in memory only; not persisted across reloads.

---

## 9. Controlled vocabularies

PRD C-3 confirmation: this spec consumes CLARISA's `levers` taxonomy for the lever picker (via the existing `getLeversService`, no changes). No new taxonomy introduced.

---

## 10. Role & permission matrix

> Mirrors server enforcement per [handoff §2](../ari-backend-context/frontend-handoff.md#2-auth-roles--ownership).

| Action | Researcher (CONTRIBUTOR + result-owner) | Researcher (CONTRIBUTOR not owner) | Center Admin | MEL Regional Expert | System Admin |
| --- | --- | --- | --- | --- | --- |
| View the section (when eligible) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit `has_contribution` | ✅ | ❌ | ✅ | ❌ | ✅ |
| Edit lever selection | ✅ | ❌ | ✅ | ❌ | ✅ |
| Edit justification | ✅ | ❌ | ✅ | ❌ | ✅ |
| Save (PATCH) | ✅ | ❌ | ✅ | ❌ | ✅ |
| See synced badge (when applicable) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit while result is synced | ❌ (server 409) | ❌ | ❌ | ❌ | ❌ |

Guard composition:
- Tab visibility: signal-driven from `BilateralService.currentAlignment().eligible`.
- Edit affordance: `editable = computed(() => canEdit(role) && isOwner(result, user))` — single computed signal. Server enforces; client mirrors.

---

## 11. Telemetry & observability

- **Clarity (custom events)** via `ClarityService.trackEvent`:
  - `bilateral.alignment.viewed` on section open (fires once per result per session).
  - `bilateral.alignment.saved` on successful PATCH (payload: `{ result_code, has_contribution, lever_count }`).
- **Hotjar / GA**: page-view tracking is already wired via `TrackingToolsService`. No new events needed.
- **BugHerd**: no new triggers.
- **Error surfaces**:
  - Inline field-level for 400.
  - Synced banner for 409.
  - Standard toast for unexpected 5xx via `httpErrorInterceptor`.
  - Dirty-state-vs-socket-event toast for AC-11.3.

---

## 12. Assumptions & open questions

### Assumptions

- **A-1** — `RolesService` exposes a way to check role-level edit permission (e.g., `canEditAnyResult`, `canAccessCenterAdmin`). Verified during tag-visibility execution. *(Design.md confirms.)*
- **A-2** — The current result's PI / Creator / contact IDs are reachable from `cache.currentMetadata()` or `CurrentResultService`. Existing pattern. *(Design.md confirms by reading those services.)*
- **A-3** — `WebsocketService` is initialized app-wide (it is — see `app.config.ts` providers). The new event subscription rides the existing socket connection.
- **A-4** — `result-sidebar.component.ts` `SidebarOption.hide` already supports dynamic visibility via the existing computed pipeline (`allOptionsWithGreenChecks`). Verified during exploration; no shell-wide refactor needed.
- **A-5** — The Pool Funding Alignment section will live at `/result/:resultCode/pool-funding-alignment` as a child route in `app.routes.ts`, matching the existing 11-tab pattern.

### Open questions

- **OQ-AS-1 — Sidebar position.** Between "Alliance alignment" and "Partners"? Or appended at the end? Mockups show "between Alliance alignment and Partners"; final position confirmed by design QA. *(Resolved in `design.md` §4.2.)*
- **OQ-AS-2 — Synced badge token.** Use an existing `<app-custom-tag>` `statusId` (e.g., `'2'` for completed-blue) or introduce a new `'synced'` entry with bespoke `--ac-synced-*` tokens? *(Resolved in `design.md` §4.6.)*
- **OQ-AS-3 — Read-only banner placement.** Top of the section, in the section header next to the title, or as a dismissible inline notice? *(Resolved in `design.md` §4.2 against Figma node `33356-11736-pool-funding-alignment-synchronized.md`.)*
- **OQ-AS-4 — Polling-on-focus fallback (AC-11.4).** Is the lightweight polling fallback worth the implementation cost in v1, or do we accept "section may be stale until next manual refresh" when the socket is down? *(Resolved in `design.md` §7.)*
- **OQ-AS-5 — Justification character counter copy.** "X / 500" inline or "Up to 500 characters" tooltip? *(Resolved in `design.md` §4.5 against the existing custom-fields textarea convention.)*

---

## 13. References

- PRD: [`docs/prd.md`](../../../prd.md) §3 (personas), §4 (goals/KPIs), §8.3 (constraints C-1..C-6).
- System Design: [`docs/system-design/design.md`](../../../system-design/design.md) §8 (shared components), §11 (dark mode), §12 (decisions log).
- Detailed Design: [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §2 (modules), §4.3 (endpoints), §6.4 (real-time WebSocket), §8.2 (authorization).
- Sibling specs:
  - [`../tag-visibility/`](../tag-visibility/) — predecessor; `BilateralService` facade + `httpErrorInterceptor` URL-scoped exception pattern + Pool Funding tokens to be reused.
  - [`../indicator-mapping/`](../indicator-mapping/) — successor; depends on this section's alignment-state foundation.
- Context corners: [`../figma-mockups/`](../figma-mockups/), [`../jira-us/AC-1594-us2-pool-funding-alignment.md`](../jira-us/AC-1594-us2-pool-funding-alignment.md), [`../ari-backend-context/frontend-handoff.md`](../ari-backend-context/frontend-handoff.md).
- Backend integration:
  - [`../ari-backend-context/frontend-handoff.md` §4.2 GET alignment](../ari-backend-context/frontend-handoff.md#42-get-alignment)
  - [`../ari-backend-context/frontend-handoff.md` §4.3 PATCH alignment](../ari-backend-context/frontend-handoff.md#43-patch-alignment)
  - [`../ari-backend-context/frontend-handoff.md` §5 Business / UX rules](../ari-backend-context/frontend-handoff.md#5-business--ux-rules-the-fe-must-honour)
  - [`../ari-backend-context/frontend-handoff.md` §6 Real-time events](../ari-backend-context/frontend-handoff.md#6-real-time-events-socketio)

---

## 14. Requirement ID index

| ID | Title | Persona(s) | Type |
| --- | --- | --- | --- |
| REQ-BIL-AS-01 | Pool Funding Alignment tab is conditionally rendered | All authenticated | Functional |
| REQ-BIL-AS-02 | User can view the alignment section | All authenticated | Functional |
| REQ-BIL-AS-03 | Authorized user can edit `has_contribution` | PI / Center Admin / System Admin | Functional |
| REQ-BIL-AS-04 | Authorized user can select levers | PI / Center Admin / System Admin | Functional |
| REQ-BIL-AS-05 | Authorized user can add optional justification | PI / Center Admin / System Admin | Functional |
| REQ-BIL-AS-06 | Save persists via PATCH | PI / Center Admin / System Admin | Functional |
| REQ-BIL-AS-07 | Read-only when synced to PRMS | All | Functional |
| REQ-BIL-AS-08 | Edit regardless of result_status (AR.1) | PI / Center Admin / System Admin | Functional |
| REQ-BIL-AS-09 | Alignment NOT part of submission validator (AR.3) | All | Functional |
| REQ-BIL-AS-10 | Unauthorized users see read-only view | Non-owner / MEL Regional Expert / Technical Support | Functional |
| REQ-BIL-AS-11 | Real-time reconcile via Socket.IO | All | Functional |
| REQ-BIL-AS-12 | 409 Conflict (synced) handled gracefully | PI / Center Admin / System Admin | Functional |
| REQ-BIL-AS-NF-01 | Performance — render ≤ 1.0 s | All | Non-functional |
| REQ-BIL-AS-NF-02 | Accessibility WCAG 2.1 AA (C-4) | All | Non-functional |
| REQ-BIL-AS-NF-03 | Bundle budget — ≤ 30 KB lazy / ≤ 5 KB initial (C-5) | All | Non-functional |
| REQ-BIL-AS-NF-04 | Dark + light theming parity | All | Non-functional |
| REQ-BIL-AS-NF-05 | i18n-extractable strings | All | Non-functional |
| REQ-BIL-AS-NF-06 | Coverage floors — services ≥ 90% / components ≥ 70% | All | Non-functional |
