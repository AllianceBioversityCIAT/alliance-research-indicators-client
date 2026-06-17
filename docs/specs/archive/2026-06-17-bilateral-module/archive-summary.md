# Archive Summary — Bilateral Module (reference/context close-out)

## 1. Document control

| Field | Value |
| --- | --- |
| Original path | `docs/specs/bilateral-module/` |
| Archive date | 2026-06-17 |
| Archived by | `/sdd-archive` (module close-out) |
| Final status | **Module complete** — all bilateral specs delivered and archived; this moves the residual reference/context material |
| Branch | `AC-1594-bilateral-module` |

## 2. Original spec path

`docs/specs/bilateral-module/` — the bilateral module's **reference/context** material (not a spec). After every bilateral spec was archived, the remaining contents were context folders + a module-level proposal:
- `proposal.md` — the original module-level proposal that spawned the bilateral specs.
- `ari-backend-context/` — snapshotted backend docs for the FE (`backend-response-to-fe.md`, `po-decision-brief-OQ-IM-1.md`); tied to the superseded indicator-mapping flow.
- `figma-mockups/` — the Figma mockup catalog + `_assets/` PNGs (incl. the Pool Funding Alignment canon screens).
- `jira-us/` — the epic (AC-1385) + user-story docs (US1–US7).
- `prms-context/` — PRMS backend background + glossary.

## 3. Archive date

2026-06-17.

## 4. Final status

**Module complete.** The bilateral module shipped end-to-end across these specs (all archived under `docs/specs/archive/`):
- `2026-05-26-bilateral-module--tag-visibility`
- `2026-05-26-bilateral-module--alignment-section`
- `2026-05-28-bilateral-module--alignment-section-remediation`
- `2026-06-10-bilateral-module--indicator-mapping` (superseded)
- `2026-06-10-bilateral-module--hlo-grouped-mapping` (superseded, never built)
- `2026-06-17-bilateral-module--toc-mapping-v2` (T-06 deferred — see its summary)
- `2026-06-17-bilateral-module--toc-mapping-save-gating-ux`

This entry archives the shared reference material that those specs were built against, now that the module is done.

## 5. Requirements delivered

Delivered across the archived specs above (Pool Funding tag visibility, alignment section, per-result SP picker, PRMS-sourced read-only, the lambda-toc level-based ToC catalog + inline per-SP alignment, and the save-gating UX fix). See each spec's own `requirements.md` / `archive-summary.md` for the per-spec ID coverage.

## 6. Files changed summary

N/A — reference/context material only (no implementation). Implementation lives in the archived specs' `execution.md` files and the `AC-1594-bilateral-module` branch history.

## 7. Test evidence summary

N/A here — test evidence is in each archived spec's `execution.md` (full suite green throughout; coverage floors held).

## 8. Validation summary

N/A here — each spec was executed via the JCSPECS Implementer→Reviewer triad with a Reviewer PASS per task. No unresolved FAIL findings across the module.

## 9. Accepted warnings or follow-ups

Carried from the archived `toc-mapping-v2`:
- **T-BIL-TM2-06 (deferred):** live golden-path sign-off against the deployed testing env (gated on the backend deploy).
- **Catalog-503 robustness gap (open):** a top-level `hlos-indicators` cold-cache 503 silently hides the ToC section; recommended page-level error+retry.
- **In-flight code (uncommitted at archive time):** ToC block/dropdown tweaks + the unrelated `shared-result-form` changes on the branch.

## 10. Historical notes

- The bilateral module ran as a **two-session, two-repo** effort: this FE repo + a backend `toc-mapping-v2` spec on `alliance-research-indicators-main`.
- `figma-mockups/` was the design canon (Pool Funding Alignment screens); `jira-us/` tracked AC-1385 (epic) + US1–US7.
- Note on links: archived bilateral specs contain relative links like `../jira-us/` that broke when each spec was first archived out of `bilateral-module/` — those are accepted-historical. The one active reference (`system-design/design.md`) was repointed to this archive in the same change.
