# Archive Summary — Bilateral Module / Alignment Section

> Final summary written at `/sdd-archive` time. Pairs with the full document set being moved into `docs/specs/archive/`.

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/alignment-section/` |
| Archive date | 2026-05-26 |
| Branch | `AC-1594-bilateral-module` |
| Archived by | Claude (`/sdd-archive`) |
| Domain abbreviation | `BIL-AS` |
| Jira | [`../jira-us/AC-1594-us2-pool-funding-alignment.md`](../jira-us/AC-1594-us2-pool-funding-alignment.md) (sibling folder; not archived with this spec) |
| Proposal | [`../proposal.md`](../proposal.md) — approved 2026-05-19 (lives in the bilateral-module umbrella, not archived with this spec) |
| Predecessor spec | [`../tag-visibility/`](../tag-visibility/) — shipped 2026-05-20 (`2779b5fd`) |
| Successor spec | [`../indicator-mapping/`](../indicator-mapping/) — still active; partially gated on BA/backend OQs |

---

## 2. Original spec path

```text
docs/specs/bilateral-module/alignment-section/
```

After archive:

```text
docs/specs/archive/2026-05-26-bilateral-module--alignment-section/
```

---

## 3. Archive date

**2026-05-26**

---

## 4. Final status

**✅ SHIPPED.** All 14 tasks completed and verified.

| Milestone | Date | Evidence |
| --- | --- | --- |
| Initial bundle (`17417fdd`) | 2026-05-22 | T-BIL-AS-01 through T-BIL-AS-14 landed in a single feature commit (deliberate deviation from per-PR norm; documented in `execution.md` §1) |
| Mockup remediation arc (RR-A..F + G + I) | 2026-05-23 → 2026-05-24 | 7 follow-up commits (`01a0cd57`, `352299ab`, `86252209`, `3df3deff`, `05fa2913`, `e07ec9fb`, `9b946f9f`) |
| Second-pass mockup audit (AD-1/2/3) | 2026-05-24 | Captured in `execution.md` §3 Entry 10 |
| SP-picker switch (Levers → Science Programs) + AI-card host mount | 2026-05-26 | Commits `691fc99d` + `fc56e0b1`; captured in `execution.md` §3 Entry 11 + `design.md` §11 |
| Validation pass | 2026-05-26 | `validation-report.md` — 25 PASS, 4 WARN (3 informational drift; 0 FAIL; 0 BLOCKED) |
| Pre-archive docs amendment (closes R-AS-1, R-AS-2) | 2026-05-26 | `design.md` §11 + `execution.md` Entry 11 |

---

## 5. Requirements delivered

All 12 functional + 6 non-functional requirements have implementation evidence. See `validation-report.md` §6 for the full mapping.

| Range | Status |
| --- | --- |
| REQ-BIL-AS-01..04 (tab visibility, view, edit, lever selection) | ✅ shipped |
| REQ-BIL-AS-05 (justification) | ⚠️ **superseded** by mockup remediation RR-G — backend column kept; PATCH body no longer carries the field; textarea removed from the UI |
| REQ-BIL-AS-06..12 (save flow, read-only, AR.1, AR.3, unauthorized read-only, socket reconcile, 409 handling) | ✅ shipped |
| REQ-BIL-AS-NF-01..06 (performance, a11y, bundle, theming, i18n-ready, coverage) | ✅ shipped |

**Documented requirements vs. implementation drift** (intentional):

- AC-01.1 — Sidebar tab position. Specced "between Alliance alignment and Partners"; mockup RR-E moved it to sidebar bottom. Captured in `execution.md` §3 Entry 2.
- AC-04.1 — SP picker source. Specced against `levers`; the 2026-05-26 SP-picker switch (Entry 11) narrowed it to Science Programs only. Captured in `design.md` §11 + `execution.md` Entry 11.
- REQ-BIL-AS-05 — Justification textarea. Specced as optional 500-char field; removed per RR-G. Backend contract preserves the column.

The spec text is the **pre-mockup-remediation snapshot**; the execution log + design decision rows are the canonical post-shipping shape. This is by design (drift policy: "fix one or the other" — fixed in the execution log).

---

## 6. Files changed (summary from execution.md)

### New files (3 + 4 component shards)

- `src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts`
- `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.ts`
- `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.html`
- `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.scss`
- `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.spec.ts`

### Modified files

- `src/app/shared/services/api.service.ts` — `GET_PoolFundingAlignment` + `PATCH_PoolFundingAlignment` + `bilateralPath()` helper.
- `src/app/shared/services/bilateral.service.ts` — `currentAlignment`, `loadingAlignment`, `savingAlignment`, `editable` computed, `getAlignment`, `patchAlignment`, `extractFieldErrors`.
- `src/app/shared/services/cache/current-result.service.ts` — `isCurrentUserOwner` computed.
- `src/app/shared/interceptors/http-error.interceptor.ts` — URL-scoped 400 exception for `/pool-funding-alignment`.
- `src/app/shared/constants/status-colors.ts` — `'pf-synced'` entry.
- `src/app/shared/components/result-sidebar/result-sidebar.component.ts` — alignment `SidebarOption` + `shouldHidePoolFundingTab` filter + sidebar-bottom positioning (post RR-E).
- `src/app/app.routes.ts` — lazy child route under `/result/:id/`.
- `src/app/pages/.../result/result.component.ts` — load alignment at parent so sidebar tab can appear (post-remediation fix in commit `352299ab`).
- `src/app/shared/services/submission.service.spec.ts` — AR.3 lock.
- `docs/system-design/design.md` — §7.4.1 canonical form-label classes binding contract + §12 decisions row.
- `docs/detailed-design/detailed-design.md` — §2 modules + §4.3 endpoints + §6 services + §6.4 real-time events.

All co-located `.spec.ts` files extended in lockstep.

---

## 7. Test evidence summary

- Validated 2026-05-26 — **384 / 384 tests pass** across the 6 affected spec files (`pool-funding-alignment.component`, `bilateral.service`, `api.service`, `current-result.service`, `http-error.interceptor`, `result-sidebar.component`).
- Component coverage ≥ 70%; service coverage ≥ 90% (per `execution.md` §1 milestone notes).
- AR.1 (edit regardless of `result_status`) — locked by **absence** + inline `// AR.1` comment on `canSave`.
- AR.3 (alignment NOT in submission validator) — locked by 2 cases in `submission.service.spec.ts` + the sibling sidebar test in `result-sidebar.component.spec.ts`.
- Manual smoke documented per remediation entry in `execution.md` §3 — sidebar visibility on eligible / ineligible results, two-tab socket reconcile, dark/light theme parity, layout parity with General Information / IP Rights tabs.

---

## 8. Validation summary

Captured in `validation-report.md`:

| | Count |
|---|---|
| PASS | 25 |
| WARN | 4 (2 closed at archive time; 2 accepted as informational drift) |
| FAIL | 0 |
| BLOCKED | 0 |

Closed at archive time:

- **R-AS-1** — SP-picker switch decision captured in `design.md` §11 + `execution.md` Entry 11.
- **R-AS-2** — AI-card mount cross-reference recorded in `execution.md` Entry 11.

Accepted as follow-up (see §9):

- **R-AS-3** — `requirements.md` text snapshot is pre-remediation; canonical post-shipping shape lives in execution + design rows. Intentional, low-priority.
- **R-AS-4** — Pre-existing `tsc` errors in two unrelated spec files (`indicators-tab-filter.component.spec.ts:181`, `oicr-form-fields.component.spec.ts:25`). Separate cleanup PR.

---

## 9. Accepted warnings & follow-ups

| ID | Severity | Status | Recommended owner / action |
| --- | --- | --- | --- |
| R-AS-3 | WARN (drift) | accepted | `requirements.md` AC-01.1 / AC-04.1 / REQ-BIL-AS-05 text is intentionally not retro-edited — execution log is the canonical post-mockup record. Optional cleanup if future readers stumble. |
| R-AS-4 | WARN (out of scope) | accepted | Pre-existing `tsc` syntax errors in `indicators-tab-filter.component.spec.ts:181` and `oicr-form-fields.component.spec.ts:25`. **Same finding flagged in the sibling `indicator-mapping/` validation**. Single separate cleanup PR can close both. |
| OI-AS-3 | open follow-up | tracked in `tasks.md` §9 + `execution.md` §4 | `ActionsService.showToast` doesn't accept an `actions` array — cross-tab Refresh UX uses a plain info toast. Reopen if telemetry shows confusion. |
| OI-AS-4 | open follow-up | tracked in `tasks.md` §9 + `execution.md` §4 | Backend `errorDetail.errors` shape needs confirmation; `extractFieldErrors` falls back gracefully today. |
| OI-AS-7 | open follow-up | tracked in `execution.md` §4 | Lever code/id mismatch with backend handoff (string vs number); resolved at save-time via `.map(String)`. |
| AD-4 | open follow-up | tracked in `execution.md` §3 Entry 10 | SP picker placeholder copy proposal `Select one or more Science Programs…` vs current `Select Science Programs`. Awaiting design QA. Non-gating. |

The two **gating** open items that touch this spec's footprint live under the sibling [`../indicator-mapping/`](../indicator-mapping/) folder:

- **OI-IM-2** — `app-info-banner` shared component (IP Rights / Pool funding alignment pattern duplicated; promote when convenient).
- **OI-IM-3** — Backend sort dispatcher doesn't honor `order-field=pool-funding-contributor` on `current-user=false`.

---

## 10. Historical notes

**Initial bundling deviation**. Tasks T-BIL-AS-01 through T-BIL-AS-14 landed in a single feature commit (`17417fdd`) rather than per-PR. The deviation is explicitly recorded in `execution.md` §1 and §3 Entry 1. The sibling `indicator-mapping/` spec adopted per-task PRs in response. Recorded here so future contributors don't read the git log as "this is normal".

**Mockup-first lesson**. The initial bundle was backend-handoff-first and missed 6 mockup divergences (RR-A..F + G + I), which required a follow-up cycle (Entries 2–8). The lesson — **read the mockups before writing the design** — was then encoded into the constitutional docs (`docs/system-design/design.md` §7.4.1 canonical form-label classes binding contract, added by T-BIL-AS-14) and shaped the sibling `indicator-mapping/` spec rewrite (which went mockup-first explicitly).

**Cross-spec entanglement with `indicator-mapping/`**. Commit `fc56e0b1` (2026-05-26) wired the `BilateralActionCardComponent` (which ships under the sibling spec's T-BIL-IM-03) into this section's template as a host. The host code lives here; the component code lives in the sibling spec. The sibling spec's `validation-report.md` §3 records this partial-discharge of its T-BIL-IM-10. When `indicator-mapping/` archives, future readers should cross-check both archive folders for the full mount picture.

**Defensive socket / Clarity injection** (commit `3df3deff`). `app.config.ts` does NOT register `SocketIoModule.forRoot(...)` in production at archive time. The component uses try/catch IIFE injection so it degrades gracefully if `WebsocketService` construction throws. Real-time reconcile no-ops + telemetry no-ops until infrastructure adds the module — no code change required on the FE side when that happens.

**`v1/` + `STAR-` URL pattern**. Commit `86252209` introduced the private `bilateralPath()` helper on `ApiService` to prepend `v1/` and strip a leading `STAR-` (case-insensitive) from `resultCode`. Reused by the sibling spec's API methods (when they land). The helper is the canonical bilateral-URL builder.

**Justification removal**. The originally-specced justification textarea (REQ-BIL-AS-05) was removed per mockup RR-G. The backend column is preserved for back-compat; the PATCH body no longer carries the field. This is documented as intentional drift in `execution.md` §3 Entry 2.

---

## 11. References (for the archived folder)

- `requirements.md` — pre-remediation snapshot; canonical shape lives in execution + design rows.
- `design.md` — system design + §11 decisions log (last updated 2026-05-26).
- `tasks.md` — 14 tasks, all `completed`.
- `execution.md` — Entries 1–11 capturing the full shipping arc.
- `validation-report.md` — 2026-05-26 validation snapshot (25 PASS, 4 WARN).
- `archive-summary.md` — this file.
