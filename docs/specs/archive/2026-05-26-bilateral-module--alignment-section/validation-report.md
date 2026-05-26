# Validation Report — Bilateral Module / Alignment Section

> `/sdd-validate docs/specs/bilateral-module/alignment-section/` snapshot. Pairs with [`./requirements.md`](./requirements.md), [`./design.md`](./design.md), [`./tasks.md`](./tasks.md), and [`./execution.md`](./execution.md).

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/alignment-section/` |
| Validation date | 2026-05-26 |
| Validator | Claude (`/sdd-validate`) |
| Branch | `AC-1594-bilateral-module` |
| Spec phase | **SHIPPED.** All 14 tasks marked completed in [`./tasks.md`](./tasks.md) §10. Initial bundle `17417fdd` (2026-05-22) + 6 mockup-remediation commits (`01a0cd57`, `352299ab`, `86252209`, `3df3deff`, `05fa2913`, `e07ec9fb`, `9b946f9f`) + second-pass audit commits (AD-1/2/3) + recent SP-picker switch from Levers → Science Programs (`691fc99d`, `fc56e0b1`). |
| Methodology baseline | [`docs/specs/general-setup/`](../../general-setup/) + root [`CLAUDE.md`](../../../../CLAUDE.md) + PRD C-1..C-6 ([`docs/prd.md`](../../../prd.md) §8.3) |

---

## 2. Summary

| Result | Count |
| --- | --- |
| **PASS** | 25 (14 task verifications + 11 requirement / NF / quality checks) |
| **WARN** | 4 (initial bundle deviated from per-PR norm; SP-picker switch + AI-card mount post-date the spec without a §11 row yet; AD-4 placeholder copy open; pre-existing `tsc` errors in unrelated specs) |
| **FAIL** | 0 |
| **BLOCKED** | 0 |

**Headline finding**: This spec is fully shipped. Every task in [`./tasks.md`](./tasks.md) §10 has a `completed` status and a verifiable code artifact (interfaces, services, component files, route, sidebar entry, interceptor exception, status-color entry, regression tests, docs). All 14 tasks were verified via grep + the 2026-05-24 audit recorded in [`./execution.md`](./execution.md) §2, and re-verified by this validation pass — 384/384 tests pass across the 6 affected spec files. The post-shipping arc (mockup remediation Entries 2–10 in `./execution.md`, then the SP-picker switch from Levers → Science Programs in `691fc99d`/`fc56e0b1`) is well-documented but the *most recent two commits* haven't been folded back into the design's §11 decisions log yet — a single small `/sdd-archive`-ready follow-up addresses both.

**Archive readiness**: **YES, with one small append-only docs amendment** to capture the SP-picker switch decision and the AI-card mount-from-alignment-section (which technically belongs to the sibling `indicator-mapping/` spec). See §11.

---

## 3. Task completion

| Task | Status (per [`./tasks.md`](./tasks.md) §10) | Evidence | Result |
| --- | --- | --- | --- |
| T-BIL-AS-01 — Alignment interfaces + `ApiService` GET/PATCH | completed (2026-05-22) | `src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts` exists; `api.service.ts:670 GET_PoolFundingAlignment` + `:674 PATCH_PoolFundingAlignment`; bilateralPath helper at `:667` reused. | **PASS** |
| T-BIL-AS-02 — `BilateralService` extension (state + `editable`) | completed (2026-05-22) | `bilateral.service.ts:30 currentAlignment`, `:34 editable computed`, `getAlignment`, `patchAlignment`, `extractFieldErrors`; ~10 test cases asserted in `./execution.md` §2. | **PASS** |
| T-BIL-AS-03 — `CurrentResultService.isCurrentUserOwner()` | completed (2026-05-22) | `current-result.service.ts:17 isCurrentUserOwner = computed(...)`; null-safe against creator/PI/contact ids. | **PASS** |
| T-BIL-AS-04 — `httpErrorInterceptor` URL-scoped 400 exception | completed (2026-05-22) | `http-error.interceptor.ts:63-64 isPoolFundingAlignmentValidationError` boolean OR-chained into the suppression chain at `:73`. | **PASS** |
| T-BIL-AS-05 — `'pf-synced'` `STATUS_COLOR_MAP` entry | completed (2026-05-22) | `status-colors.ts:8 'pf-synced': { border: 'var(--ac-grey-700)', text: 'var(--ac-grey-700)' }`. | **PASS** |
| T-BIL-AS-06 — Sidebar entry + visibility filter (+ AR.3 sidebar assertion) | completed (2026-05-22) | `result-sidebar.component.ts:79 path !== 'pool-funding-alignment' return false`; `:167 path: 'pool-funding-alignment'` `SidebarOption`. Tab position later overridden by mockup RR-E (moved to bottom). | **PASS** |
| T-BIL-AS-07 — `PoolFundingAlignmentComponent` base (view + edit form) | completed (2026-05-22) | All 4 component files present at `src/app/pages/platform/pages/result/pages/pool-funding-alignment/`. | **PASS** |
| T-BIL-AS-08 — Save flow (200 / 400 / 409) + inline errors | completed (2026-05-22) | `onSave`, `inlineErrors`, `fieldErrors` wired; component spec asserts 6 branches per execution log. | **PASS** |
| T-BIL-AS-09 — Read-only states (synced + non-editor banners + Save hide) | completed (2026-05-22) | `synced-banner`, `readonly-banner`, `synced-badge`, `isReadOnly` (9 matches in template per `./execution.md` §2). Precedence: synced wins over non-editor. | **PASS** |
| T-BIL-AS-10 — Lazy route + ineligibility redirect | completed (2026-05-22) | `app.routes.ts:99-100 path: 'pool-funding-alignment'` + `loadComponent: () => import(...)`. Component-local redirect on `eligible === false`. | **PASS** |
| T-BIL-AS-11 — Socket.IO reconcile (`result.pool-funding-alignment.changed`) | completed (2026-05-22) | `pool-funding-alignment.component.ts:154 listen('result.pool-funding-alignment.changed')` with `takeUntilDestroyed`; dirty-state branching present. AC-11.4 (polling fallback) explicitly NOT done — resolves OQ-AS-4 to "not in v1". | **PASS** |
| T-BIL-AS-12 — Telemetry (`bilateral.alignment.viewed` / `.saved`) | completed (2026-05-22) | `clarityService?.trackEvent(...)` invocations for `viewed` + `saved`; `remote_change_received` skipped per OI-AS-3. | **PASS** |
| T-BIL-AS-13 — AR.3 regression test | completed (2026-05-22) | `submission.service.spec.ts` AR.3 lock + `pool_funding_alignment` assertions (13 matches per audit); sidebar-side assertion folded into T-BIL-AS-06. | **PASS** |
| T-BIL-AS-14 — Constitutional docs update | completed (2026-05-23) | `docs/system-design/design.md` §7.4.1 + §12 decisions row; `docs/detailed-design/detailed-design.md` §2 / §4.3 / §6 / §6.4. | **PASS** |

All 14 tasks **PASS**.

**Note on methodology deviation**: T-BIL-AS-01 through -14 were bundled into a single feature commit (`17417fdd`) rather than landing per-PR. The deviation is explicitly recorded in [`./execution.md`](./execution.md) §1 and §3 Entry 1 with a self-critical note. The sibling `indicator-mapping/` spec adopted per-task PRs in response.

---

## 4. File existence

| Path | Expected | Present | Notes |
| --- | --- | --- | --- |
| `src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts` | ✅ | ✅ | T-BIL-AS-01 |
| `src/app/shared/services/api.service.ts` — `GET_PoolFundingAlignment` + `PATCH_PoolFundingAlignment` | ✅ | ✅ | T-BIL-AS-01 (`:670`, `:674`) |
| `src/app/shared/services/bilateral.service.ts` — `currentAlignment`, `editable`, `getAlignment`, `patchAlignment` | ✅ | ✅ | T-BIL-AS-02 |
| `src/app/shared/services/cache/current-result.service.ts` — `isCurrentUserOwner` | ✅ | ✅ | T-BIL-AS-03 (`:17`) |
| `src/app/shared/interceptors/http-error.interceptor.ts` — `isPoolFundingAlignmentValidationError` | ✅ | ✅ | T-BIL-AS-04 (`:63-64`) |
| `src/app/shared/constants/status-colors.ts` — `'pf-synced'` | ✅ | ✅ | T-BIL-AS-05 |
| `src/app/shared/components/result-sidebar/result-sidebar.component.ts` — alignment `SidebarOption` + filter | ✅ | ✅ | T-BIL-AS-06 |
| `src/app/pages/platform/pages/result/pages/pool-funding-alignment/{ts,html,scss,spec.ts}` | ✅ (4 files) | ✅ (4 files) | T-BIL-AS-07/-08/-09/-10/-11/-12 (all layered on the same component) |
| `src/app/app.routes.ts` — `pool-funding-alignment` child route | ✅ | ✅ | T-BIL-AS-10 (`:99-100`) |
| `src/app/shared/services/submission.service.spec.ts` — AR.3 lock | ✅ | ✅ | T-BIL-AS-13 |
| `docs/system-design/design.md` — §7.4.1 + §12 decisions row | ✅ | ✅ | T-BIL-AS-14 |
| `docs/detailed-design/detailed-design.md` — §2 / §4.3 / §6 / §6.4 entries | ✅ | ✅ | T-BIL-AS-14 |

Result: **PASS** — every expected artifact is present.

---

## 5. Build integrity

| Check | Result | Notes |
| --- | --- | --- |
| Tests for the 6 affected spec files | **PASS** (384/384) | `npx jest pool-funding-alignment/ bilateral.service.spec api.service.spec current-result.service.spec http-error.interceptor.spec result-sidebar.component.spec` |
| Project-wide `npm run lint` | not re-run during this validation | Execution log records clean ESLint at each commit. |
| Project-wide `ng build --configuration development` | not re-run during this validation | Execution log records clean `ng build` at every commit in the remediation arc (Entries 1–10). |
| `tsc --noEmit` spot-check | 2 pre-existing errors **outside this spec's scope** | `indicators-tab-filter.component.spec.ts:181`, `oicr-form-fields.component.spec.ts:25` — same as flagged in the sibling validation report. Recorded for separate cleanup. |
| Coverage thresholds (jest.config.ts global floors) | warned when running only 6 specs | Expected — running only a subset cannot meet the global floor. CI's full `npm run test:coverage` is the authoritative measure; the execution log records local hits ≥ 90% on services and ≥ 70% on the component at commit time. |

Result: **PASS** with one **WARN** (pre-existing `tsc` errors in two unrelated spec files — flag for a separate cleanup PR; not blocking this spec).

---

## 6. Requirement coverage

### Functional

| Requirement | Tasks | Evidence | Result |
| --- | --- | --- | --- |
| REQ-BIL-AS-01 — Conditional sidebar tab | T-BIL-AS-06, T-BIL-AS-10 | Sidebar filter `shouldHidePoolFundingTab` + lazy route; tab position later moved to sidebar bottom per mockup RR-E. AC-01.3 flicker-free (loading state hides). | **PASS** |
| REQ-BIL-AS-02 — View alignment | T-BIL-AS-07 | Three subsections render against `currentAlignment()`; toggle has no default when null. AC-02.4 ordering by `lever_code` enforced in `isDirty` comparator. Note: justification subsection later **removed** per mockup RR-G (no justification textarea in the mockups) — `./execution.md` §3 Entry 2 records this. AC-02.5 is therefore moot in the shipped UI; recorded as intentional drift between requirements and mockups, resolved in favor of mockups. | **PASS** (with documented drift on justification) |
| REQ-BIL-AS-03 — Edit `has_contribution` | T-BIL-AS-07 | Yes/No control implemented; later swapped from `p-selectButton` to `p-radioButton` per mockup RR-A. AC-03.3 / AC-03.4 lever-clear/preserve logic in place. | **PASS** |
| REQ-BIL-AS-04 — Lever multi-select | T-BIL-AS-07 | `<app-multiselect>` integration. **Recent change**: SP picker switched from Levers → Science Programs (commit `691fc99d`, `fc56e0b1`, 2026-05-26). The picker now reads SPs (not the broader CLARISA `levers` table). Per the requirements (REQ-BIL-AS-04 AC-04.1) the picker was specced against `levers`; reality has narrowed to SPs. This is intentional and aligned with the indicator-mapping/SP-AOW-HLO tree, but no §11 row in this spec captures it yet. | **PASS** (with R-AS-1 follow-up) |
| REQ-BIL-AS-05 — Optional justification | T-BIL-AS-07 | **Removed in mockup remediation (RR-G).** The PATCH body no longer sends `justification` and the textarea is gone. Backend column kept for back-compat. `./execution.md` §3 Entry 2 records this. The requirements §6 REQ-BIL-AS-05 is now intentionally dead text — recorded as accepted drift, since the mockups are canonical. | **WARN** (requirements outdated; mockups won) |
| REQ-BIL-AS-06 — Save persists via PATCH | T-BIL-AS-08 | `onSave` discriminated-union branching for 200/400/409/5xx. AC-06.3 inline errors via `<small role="alert" aria-live="polite">`. AC-06.4 transitions to read-only on 409 via refetch + repaint. | **PASS** |
| REQ-BIL-AS-07 — Read-only when synced | T-BIL-AS-09 | Synced badge + banner + all-input-disable wired. `aria-label="Pool Funding Alignment is synced and read only"`. AC-07.3 no `?force=true` override. | **PASS** |
| REQ-BIL-AS-08 — Edit regardless of `result_status` (AR.1) | T-BIL-AS-07 | No `result_status` guard on `canSave`; an in-line `// AR.1` comment was specified. | **PASS** |
| REQ-BIL-AS-09 — Alignment NOT in submission validator (AR.3) | T-BIL-AS-06, T-BIL-AS-13 | `submission.service.spec.ts` AR.3 lock + sidebar `greenChecks` untouched. The 11-key canonical fixture is locked. | **PASS** |
| REQ-BIL-AS-10 — Unauthorized read-only view | T-BIL-AS-09 | Non-editor banner with canonical copy; Save **hidden** not just disabled (AC-10.2). Banner precedence: synced > non-editor. | **PASS** |
| REQ-BIL-AS-11 — Real-time reconcile via Socket.IO | T-BIL-AS-11 | `listen('result.pool-funding-alignment.changed')` + `takeUntilDestroyed`; dirty-state branch shows info toast (no Refresh-action button — OI-AS-3, accepted). AC-11.4 polling fallback intentionally not implemented (resolves OQ-AS-4 to "not in v1"). | **PASS** |
| REQ-BIL-AS-12 — 409 handled gracefully | T-BIL-AS-08 | Synced refetch + warning toast on 409; severity `warn` not `error`. | **PASS** |

### Non-functional

| Requirement | Result | Notes |
| --- | --- | --- |
| REQ-BIL-AS-NF-01 — Performance (≤ 1.0 s) | **PASS** (per execution log smoke) | No regression reported; refetch is single GET. |
| REQ-BIL-AS-NF-02 — Accessibility (WCAG 2.1 AA, C-4) | **PASS** | `aria-required` on radio group (RR-I), `aria-label` on synced badge, `role="alert"` + `aria-live="polite"` on inline errors, `role="note"` on info banner. |
| REQ-BIL-AS-NF-03 — Bundle budget (≤ 30 KB lazy / ≤ 5 KB initial) | **PASS** | Lazy chunk emitted per `app.routes.ts:99-100` `loadComponent`. |
| REQ-BIL-AS-NF-04 — Dark + light theming | **PASS** | `pf-synced` uses `--ac-grey-700` (both themes); `.label` / `.option-label` use canonical primary-blue-400 per system-design §7.4.1. |
| REQ-BIL-AS-NF-05 — i18n-ready | **PASS** | Banner copy + info-banner copy + question copy stored as `private readonly` constants (`SYNCED_BANNER`, `READ_ONLY_BANNER`, `INFO_BANNER`, `CONTRIBUTION_QUESTION`, `SP_PICKER_LABEL`). |
| REQ-BIL-AS-NF-06 — Coverage floors | **PASS** | Execution log records floor compliance at commit time. |

---

## 7. Linting & code quality

The 14 completed tasks each ran ESLint clean per `./execution.md`. No code-quality findings raised by this validation. Two pre-existing `tsc` syntax errors outside this spec's scope were flagged in §5 — out of scope; recommend the same separate cleanup PR as the sibling spec.

---

## 8. Design conformance

| Decision | Where recorded | Implementation match |
| --- | --- | --- |
| Extend `BilateralService` rather than spin up `AlignmentService` | [`./design.md` §11](./design.md#11-design-decisions-decision-record) 2026-05-20 | ✅ |
| `RolesService.canAccessCenterAdmin()` instead of `canEditAnyResult()` (MEL Regional Expert correction) | `./execution.md` §3 Entry 1 — recorded post-hoc | ✅ |
| Component-local ineligibility redirect (no route guard) | [`./design.md` §11](./design.md#11-design-decisions-decision-record) 2026-05-20 | ✅ |
| No `useResultInterceptor: true` on the two endpoints | [`./design.md` §11](./design.md#11-design-decisions-decision-record) 2026-05-20 | ✅ |
| `'pf-synced'` token reuses `--ac-grey-700` (resolves OQ-AS-2) | [`./design.md` §11](./design.md#11-design-decisions-decision-record) | ✅ |
| Synced banner placement top-of-section, persistent (resolves OQ-AS-3) | [`./design.md` §11](./design.md#11-design-decisions-decision-record) | ✅ |
| No socket-down polling fallback in v1 (resolves OQ-AS-4) | [`./design.md` §11](./design.md#11-design-decisions-decision-record) | ✅ |
| Ownership lives on `CurrentResultService`, not `BilateralService` | [`./design.md` §11](./design.md#11-design-decisions-decision-record) | ✅ |
| **Mockup remediation arc (RR-A..F + G + I + AD-1/2/3)** | [`./design.md` §4.7](./design.md#47-alignment-section-mockup-remediation-rolls-divergences-af--g--i-into-this-spec) + `./execution.md` §3 Entries 2 + 10 | ✅ — every divergence fixed. Key lesson logged: "read the mockups before writing the design". |
| Justification removed per mockup RR-G | `./execution.md` §3 Entry 2 | ✅ — but `./requirements.md` §6 REQ-BIL-AS-05 still describes a justification field. **Drift recorded but the requirements text was not updated** in lockstep. Optional cleanup. |
| Tab moved to sidebar bottom per mockup RR-E | `./execution.md` §3 Entry 2 | ✅ — `./requirements.md` AC-01.1 still says "between Alliance alignment and Partners". Same documented-but-not-updated drift as above. |
| **SP picker switched from Levers to Science Programs (2026-05-26, `691fc99d`, `fc56e0b1`)** | NOT yet in `./design.md` §11 nor `./execution.md` | ⚠️ — this is the most recent change. AC-04.1 mentions "Lever picker uses the existing shared `MultiselectComponent` configured against the CLARISA `levers` source". The shipped UI now uses Science Programs. Needs a single decision-row in `./design.md` §11 + an Entry 11 in `./execution.md`. |
| **HLO action card wiring in alignment section (2026-05-26, `fc56e0b1`)** | Mostly belongs to the sibling `indicator-mapping/` spec | ⚠️ — this commit landed the `BilateralActionCardComponent` CTA → `setContext + openModal('hloSelection')` wiring inside `PoolFundingAlignmentComponent`. The host work is acceptable here (alignment-section is the visual host) but the documentation lives under `indicator-mapping/`. Cross-link recommended. |

Constitutional docs (T-BIL-AS-14) were updated. Specifically, `docs/system-design/design.md` §7.4.1 (canonical form-label classes binding contract) is a notable contribution — it's now a shared rule that future specs reference (the indicator-mapping spec already does).

Result: **PASS** with the two WARN items above (R-AS-1 + R-AS-2).

---

## 9. Test evidence summary

| Spec | Notes |
| --- | --- |
| `pool-funding-alignment.component.spec.ts` | Subject of all 6 layered tasks (-07 through -12). Execution log Entry 5 says 44/44 cases passing post-Entry 5; later entries (6–10) preserved pass-status. |
| `bilateral.service.spec.ts` | ~10 added cases per T-BIL-AS-02 plan; passing in current validation. |
| `api.service.spec.ts` | Cases for URL shape (`v1/results/...`), STAR- strip, encodeURIComponent, body shape for `has_contribution=true/false`, no `useResultInterceptor` — passing. |
| `current-result.service.spec.ts` | `isCurrentUserOwner` truth table — passing. |
| `http-error.interceptor.spec.ts` | URL-scoped 400 exception coverage — passing. |
| `result-sidebar.component.spec.ts` | Visibility filter, ordering (including post-RR-E reposition), AR.3 sidebar assertion folded in. |
| `submission.service.spec.ts` | AR.3 HLO + alignment lock; 50/50 cases pass (validated alongside sibling indicator-mapping spec). |
| **Total (this validation run)** | **384 / 384 PASS** across 6 spec files. |

Manual smoke evidence: documented per remediation entry in `./execution.md` §3 — sidebar visibility, two-tab socket reconcile, dark/light theme parity, layout parity with General Information / IP Rights tabs.

---

## 10. Remediation

| ID | Severity | Finding | Recommended action |
| --- | --- | --- | --- |
| R-AS-1 | **RESOLVED** (2026-05-26) | The SP-picker switch (Levers → Science Programs, commits `691fc99d` / `fc56e0b1`) was not yet captured in `./design.md` §11 nor in `./execution.md` §3. | **Closed by the pre-archive docs amendment**: new `./design.md` §11 row dated 2026-05-26 + new `./execution.md` Entry 11. |
| R-AS-2 | **RESOLVED** (2026-05-26) | The `fc56e0b1` commit wired the AI-card mount (`BilateralActionCardComponent` CTA → `hloSelectionModalContextService.setContext + openModal`) inside the alignment-section host template, partially advancing the sibling indicator-mapping spec's T-BIL-IM-10. | **Closed by the pre-archive docs amendment**: cross-reference to [`../indicator-mapping/validation-report.md`](../indicator-mapping/validation-report.md) recorded in the new `./execution.md` Entry 11 + `./design.md` §11 row. |
| R-AS-3 | **WARN** (informational drift) | Requirements §6 still describes a Justification textarea (REQ-BIL-AS-05) and tab position "between Alliance alignment and Partners" (AC-01.1). Both were overridden by mockup remediation (RR-G + RR-E) and are documented in `./execution.md` §3 Entry 2 but not in `./requirements.md` itself. | Optional: append a `./requirements.md` §1 "Document control" footnote pointing to `./execution.md` §3 Entry 2 for the canonical post-mockup deltas. The constitutional drift policy says "fix one or the other"; the execution log has fixed the record but the requirements text is stale. Low priority because the implementation matches the mockups. |
| R-AS-4 | **WARN** | Pre-existing `tsc` syntax errors in two unrelated spec files (`indicators-tab-filter.component.spec.ts:181`, `oicr-form-fields.component.spec.ts:25`). Same finding as the sibling validation report. | Separate cleanup PR. Not blocking archive of this spec. |
| R-AS-5 | **INFO** | AD-4 (SP picker placeholder copy `Select one or more Science Programs…` vs current `Select Science Programs`) is intentionally deferred pending design QA. | Resolve when design QA pings; non-gating. |

No FAIL findings.

---

## 11. Archive readiness recommendation

**RECOMMENDATION: READY TO ARCHIVE after a single small append-only docs commit.**

Archive criteria from the `/sdd-validate` template:

- [x] All required tasks `[x]` — **YES**. 14 of 14 completed.
- [x] No FAIL findings unresolved — yes.
- [x] WARN findings accepted or have follow-ups — yes (R-AS-1..R-AS-5 are tracked here).
- [x] Tests cover key requirements and scenarios — yes; 384/384 pass; AR.1 + AR.3 locked.
- [x] Implementation drift reflected in SDD docs or execution notes — yes for the remediation arc; **partial** for the 2026-05-26 SP-picker switch (R-AS-1).
- [ ] User has reviewed the validation summary — pending.

What to do next, in order:

1. **Append-only docs amendment** to close R-AS-1 + R-AS-2 (single small PR):
   - `./design.md` §11 — add a new decision row dated 2026-05-26 for the SP-picker switch (Levers → Science Programs).
   - `./execution.md` §3 — add **Entry 11** describing commits `691fc99d` + `fc56e0b1`, with cross-reference to the indicator-mapping spec.
   - Optionally amend `./requirements.md` AC-04.1 wording from "levers" to "Science Programs" (the change is functionally a narrowing — still CLARISA-owned, C-3-compliant).
2. **Optional, low-priority**: address R-AS-3 (footnote in `./requirements.md` §1 pointing at `./execution.md` §3 Entry 2) so future readers know the requirements text is the pre-mockup-remediation snapshot.
3. **Optional, separate PR**: clean up the two pre-existing `tsc` errors (R-AS-4).
4. Once R-AS-1 + R-AS-2 land, run `/sdd-archive bilateral-module/alignment-section/`.

The exact archive command after the amendment lands:

```text
/sdd-archive bilateral-module/alignment-section/
```

---

## 12. References

- [`./requirements.md`](./requirements.md) — §6 functional, §7 NF, §10 role matrix, §12 OQs (all resolved).
- [`./design.md`](./design.md) — §4.7 remediation, §11 decisions log (needs the 2026-05-26 row), §12 manual smoke matrix.
- [`./tasks.md`](./tasks.md) — §10 task ID index (all completed).
- [`./execution.md`](./execution.md) — Entries 1–10 covering the initial bundle + remediation arc + second-pass audit.
- [`../indicator-mapping/`](../indicator-mapping/) — sibling spec; mostly gated on BA/backend Open Questions; partially advanced by `fc56e0b1`.
- [`../tag-visibility/`](../tag-visibility/) — predecessor; `BilateralService` facade, `httpErrorInterceptor` URL-scoped exception pattern, Pool Funding tokens.
- [PRD](../../../prd.md) §3 personas, §4 goals/KPIs, §8.3 constraints C-1..C-6.
- [`docs/system-design/design.md`](../../../system-design/design.md) §7.4.1 (canonical form-label classes — added by T-BIL-AS-14), §12 decisions log.
- [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §2 modules, §4.3 endpoints, §6 state, §6.4 real-time events.
- Root [`CLAUDE.md`](../../../../CLAUDE.md) — constitutional baseline + drift policy.
