# Proposal — Pool Funding Alignment: ToC-mapping save/sequencing UX

## 1. Document control

| Field | Value |
| --- | --- |
| Spec path | `docs/specs/bilateral-module/toc-mapping-save-gating-ux/` |
| Created | 2026-06-17 |
| Status | Proposed — awaiting approval |
| Author | Juanca (via FE session) |
| Module | bilateral-module — Pool Funding Alignment tab |
| Relates to | [`../toc-mapping-v2/`](../toc-mapping-v2/) (the shipped inline per-SP ToC cascade); follow-up UX fix |
| Branch (suggested) | `AC-1594-bilateral-module` (or a child UX branch) |

## 2. Intent

Make the **select-SPs → map-ToC → save** flow on the Pool Funding Alignment tab self-explanatory and immediately responsive, so a contributor who answers **"Yes — this result aligns with the Program's ToC indicators"** sees the mapping cascade (Level → HLO → Indicator → contribution) right away — without first discovering, by trial and error, that something else (a save) is apparently required.

## 3. Problem / current behavior

Observed by the user (screenshots, 2026-06-17) on a result with `has_contribution = Yes` and two Science Programs selected (SP02 30%, SP06 70%):

1. Selecting the SPs renders the **"Map HLOs and/or indicators"** section with one block per SP, each asking *"Does this result align with the Program's ToC indicators?" (Yes/No)*.
2. Clicking **Yes** appears to do **nothing** — the expected cascade (Level → HLO → Indicator → contribution) does not visibly appear.
3. The user's empirical workaround: **save first**, then mapping works.
4. **Nothing communicates this.** There is no hint, disabled state, or guidance explaining the sequence, so the interaction reads as broken.

Why this matters: the ToC mapping is the core value of the redesigned tab. An affordance that looks interactive but silently no-ops (or requires an unstated prior step) erodes trust and will generate support load — and risks the contributor leaving the result unmapped.

**Note on contract reality (underpins the recommendation):** the backend `PATCH …/pool-funding-alignment` accepts `has_contribution`, `sp_codes`, **and** `toc_alignments[]` in the **same request**, validating each alignment's `sp_code` against the effective SP set of that request. So the platform does **not** technically require the SP selection to be persisted before ToC alignments can be sent — a single save can carry both. The "must save first" the user experienced is therefore a **client-side UX/behavior gap**, not a backend gate.

## 4. Proposed outcome

After this change, on the Pool Funding Alignment tab:

- Answering **Yes** on a per-SP ToC question **immediately reveals that SP's cascade** (Level select, then HLO, then Indicator, then the contribution panel) — with no prior save required, consistent with the single-save contract.
- The relationship between **selecting SPs**, **mapping ToC**, and **Save** is **visually clear**: the contributor understands they can select, map, and save in one pass, and what state each block is in (unanswered / aligned-incomplete / aligned-complete / not-aligned).
- If a genuine prerequisite or transient state does exist (e.g. the ToC catalog is still loading or unavailable for an SP), the block shows **explicit feedback** (loading / "couldn't load — Retry" / "no ToC results for this Program at this level") instead of appearing inert.
- Save affordance communicates *why* it's disabled when it is (e.g. an incomplete "Yes" block), rather than the user guessing.

## 5. Scope

- The Pool Funding Alignment page component + the per-SP ToC block: the **reveal-on-Yes behavior**, the **section/Save sequencing affordances**, and **state/empty/loading feedback** — within the already-shipped `toc-mapping-v2` UI.
- Confirming and fixing the precise reason the cascade does not appear on "Yes" pre-save (see Open Questions).
- Microcopy / inline guidance for the select → map → save sequence.

## 6. Non-goals

- No change to the frozen wire contract (catalog read, PATCH write, read-back) — verified contract-clean against the live backend.
- No change to the per-SP independence model, the level rules, the 2026 version gate, or the cascade reset semantics.
- No reintroduction of the retired modal flow.
- Not a redesign of the SP picker itself (the chip allocation/icon polish already landed separately).
- No backend change expected (the same-request `sp_codes` + `toc_alignments` capability already exists).

## 7. Affected users, systems, and specs

| Kind | Item | Impact |
| --- | --- | --- |
| Users | STAR result contributors mapping bilateral results | Clearer, immediately-responsive mapping flow |
| Code | `pages/.../pool-funding-alignment/pool-funding-alignment.component.{ts,html,scss}` | Sequencing affordances, Save-disabled hinting, state feedback |
| Code | `.../components/sp-toc-alignment-block/` | Reveal-on-Yes correctness; loading/empty/error visibility |
| Specs | [`../toc-mapping-v2/`](../toc-mapping-v2/) | This is a UX follow-up; cross-link from there |
| Specs | `docs/system-design/design.md` | Record any new interaction pattern (§12) if introduced |

## 8. Requirement delta preview

### ADDED requirements

- Answering "Yes" on a per-SP ToC question SHALL immediately reveal that SP's cascade, with no save required first.
- The page SHALL make the select → map → save sequence legible (guidance and/or per-block state), and SHALL explain a disabled Save (e.g. "complete or clear the in-progress alignment(s)").
- Each block SHALL always show a determinate state on "Yes": cascade, loading, empty-for-(SP,level), or error+retry — never an inert blank.

### MODIFIED requirements

- The `toc-mapping-v2` per-SP block reveal behavior: from "appears to require a prior save" → "responds immediately"; precise current behavior to be confirmed (Open Questions).

### REMOVED requirements

- None.

## 9. Approach options

### A. Fix reveal-on-Yes + single-save flow (recommended)

Make "Yes" reveal the cascade immediately (diagnose and fix the no-op), keep the select + map + save as **one pass / one save**, and add light state feedback + Save-disabled hinting.

- ✅ Matches the backend single-save contract; fewest steps for the user.
- ✅ No new modes; smallest behavioral change.
- ⚠️ Requires nailing the exact render-time cause first (live repro).

### B. Explicit save-gate

Intentionally disable/hide the ToC-mapping section until the SP selection is saved, with a clear "Save your Science Programs to start mapping" prompt.

- ✅ Removes ambiguity by making the prerequisite explicit.
- ❌ Adds an extra save the contract doesn't require; slower; two-trip flow.

### C. Guided stepper

Re-frame the tab as explicit steps (1. Contribute? 2. Select SPs 3. Map ToC 4. Save).

- ✅ Maximally clear for first-time users.
- ❌ Largest change; heavier than the problem warrants; risks over-engineering a single tab.

## 10. Recommended approach

**Option A.** It aligns with what the platform already supports (one PATCH carries SPs + alignments), gives the contributor the fastest path, and is the smallest change that removes the confusion — provided we first confirm *why* "Yes" currently appears to no-op pre-save and fix that. Add just enough guidance + state feedback so the flow explains itself; reserve the explicit save-gate (B) only if the live repro proves a real prerequisite that can't be removed.

## 11. Risks, dependencies, and open questions

**Risks / dependencies**
- Root cause unconfirmed by static reading: the page renders blocks only once the catalog has loaded (`allowed_levels` present), and "Yes" should reveal the Level select client-side — yet the user sees nothing. Needs a live repro to pin down.
- lambda-toc availability affects the catalog (a transient 503 currently degrades poorly — see the separate catalog-503 robustness follow-up); keep that in mind during diagnosis.

**Open questions**
| ID | Question | Blocking? |
| --- | --- | --- |
| OQ-UX-1 | ~~Exact reason "Yes" shows no cascade pre-save.~~ **RESOLVED 2026-06-17 — confirmed BUG (Option A), not a gate.** `MultiselectComponent.setValue` emits `selectEvent` *inside* its own `formData.update()` callback; the page's `onSpSelectionChange → syncDraftsToSelection` runs a **nested `formData.update`** whose `toc_drafts` result is then clobbered by the outer update's `return { ...current }`. So `toc_drafts` is never populated on SP selection. `draftForSp` then returns a throwaway `emptyDraft`, and `onDraftChange`'s replace-only `.map` can't insert it → "Yes" never persists → cascade never reveals. A save repopulates `toc_drafts` via `snapshotFromServer` (clean, non-re-entrant), which is why "save first" works. | Resolved |
| OQ-UX-2 | Is a single save (SPs + alignments together) the desired product flow, or does the team want an explicit save-then-map gate? | Yes (A vs B) |
| OQ-UX-3 | If single-save: should Save be enabled with partially-mapped SPs (some "Yes" incomplete), or block until each "Yes" block is complete (current D-9 behavior)? | No (D-9 default stands unless changed) |

## 12. Success criteria

1. Clicking "Yes" on a per-SP ToC question reveals that SP's cascade immediately, with no prior save, on a freshly-selected SP.
2. A contributor can select SPs, map ToC for each, and persist everything in **one** save; reload pre-fills the saved alignments.
3. No block ever shows an inert blank on "Yes" — always cascade / loading / empty / error+retry.
4. When Save is disabled, the reason is visible to the user.
5. `npm run lint` + `npm run test` green; WCAG 2.1 AA preserved on the changed screen; no contract change.

## 13. Next step

```text
/sdd-specify bilateral-module/toc-mapping-save-gating-ux
```
