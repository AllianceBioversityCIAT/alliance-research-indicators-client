# Bilateral Module — ARI Backend Context (Integration Handoff)

> **Audience**: STAR product, design, and engineering integrating the bilateral module against the ARI backend.
> **Source**: ARI backend repo `alliance-research-indicators-main`, branch `AC-1594-bilateral-module`, file `docs/specs/bilateral-module/frontend-handoff.md` @ commit `7cb00e07` (2026-05-19).
> **Status**: Snapshot — authored by the ARI backend team for STAR. Not a STAR spec. Input to the eventual SDD at [`docs/specs/bilateral-module/{requirements,design,task}.md`](../../general-setup/).
> **Last verified**: 2026-05-19.

---

## 1. Purpose & how to read this corner

This file is the **ari-backend-context** corner of the four-input briefing for the bilateral module:

```
docs/specs/bilateral-module/
├── figma-mockups/         — visual reference (Figma node-by-node)
├── jira-us/               — user-story reference (Jira epic AC-1385)
├── prms-context/          — what PRMS already built and how STAR can reuse it
├── ari-backend-context/   — this corner: the live API the STAR client integrates against
│   ├── README.md                  — you are here
│   ├── frontend-handoff.md        — verbatim snapshot of the backend handoff (commit 7cb00e07)
│   └── backend-response-to-fe.md  — 2026-05-26 backend reply to the indicator-mapping §6 audit (commit cfbeb8ec)
└── (no requirements.md/design.md/tasks.md yet — see §5)
```

Read this corner **alongside** the other three. The split is:

| Corner | Answers |
| --- | --- |
| `figma-mockups/` | What should it look like? |
| `jira-us/` | What does the PO need it to do? |
| `prms-context/` | What does PRMS already do that we can reuse or have to mirror? |
| `ari-backend-context/` *(this)* | What endpoints, events, payloads, and flags will the STAR client actually call? |

Treat [`./frontend-handoff.md`](./frontend-handoff.md) as the **integration contract** for Phase 1 + Phase 2. Treat it as a freeze-frame: it's correct as of the snapshot date, the canonical source still lives in the backend repo, and the backend will republish when something material changes.

---

## 2. What's inside the handoff

The snapshot covers, in order:

1. **§1 Read this first** — three non-obvious framing rules: the module is a sub-resource of a result, eligibility is server-driven, and the module bypasses the normal result status workflow.
2. **§2 Auth, roles & ownership** — JWT vs. M2M Basic, the role × ownership matrix, what triggers `401` vs. `403`.
3. **§3 Response envelope & error model** — every response (success and error) uses `ServerResponseDto`. Per-status FE handling table.
4. **§4 API surface (live today)** — the AGRESSO tag endpoint, GET/PATCH alignment, GET indicators panel, contribution POST/PATCH/DELETE. **This is the canonical endpoint list for STAR HTTP clients.**
5. **§5 Business / UX rules** — AR.1 (edit regardless of status), AR.2 (read-only after PRMS sync), AR.3 (alignment is optional for submission), conditional render rules, stale-catalog rules, deliberate-typo rule (D12).
6. **§6 Real-time events (Socket.IO)** — only `result.pool-funding-alignment.changed` is wired today; four more events are pending future tasks.
7. **§7 Type-specific contribution payloads (D12)** — per-`indicator_type` body shape; **typos are intentional** (`has_unkown_using`, `readinness_level_id`, British `licence`).
8. **§8 Feature flags** — four `ARI_BILATERAL_*` env vars, all default `false`. Module surfaces have to degrade gracefully per any combination.
9. **§9 What's live vs pending** — capability-level matrix. **The STAR-side scope today is the LIVE rows.**
10. **§10 Local dev tips** — Swagger URL, migration command, where the e2e fixtures live (canonical example payloads).
11. **§11 Where to look next** — pointer chain into backend canonical docs.
12. **§12 Change log** — backend-side history.

---

## 3. STAR fit notes (read these before opening the handoff)

Each note classifies a handoff item as **direct reuse**, **adaptation needed**, or **open question** for the STAR side.

- **Endpoint shapes — direct reuse.** §4 is implementable as-is. STAR's `ApiService` already wraps `MainResponse<T>`; that shape is compatible with the `ServerResponseDto` in §3 (same envelope, different name). Build a thin `BilateralService` that delegates to `ApiService` and returns the typed `AlignmentResponse` / `IndicatorGroupResponse` / `MappingResponse`.
- **Conditional render rules — direct reuse.** §4.2 + §5 spell out the three render gates (`eligible`, `is_read_only`, `has_contribution`). Wire these to signals; no extra client-side derivation needed.
- **Auth & roles — adaptation needed.** STAR currently surfaces role gating via `jWtInterceptor` + route guards. The bilateral surfaces need an **ownership check on top of role**, and on `403` the UI must distinguish "wrong role" from "right role but not your result" only at the affordance level (the server lumps both into one `403 description`). Plan: hide the edit CTA when neither role nor ownership permits, otherwise show it and let the server enforce.
- **D12 typos — direct reuse, but call it out.** `has_unkown_using`, `readinness_level_id`, British `licence` are deliberate. Mirror them in TypeScript interfaces verbatim. Add an inline code comment at the type definition pointing back to D12 so a future "fix this typo" PR gets blocked at review.
- **Socket subscription — adaptation needed.** STAR doesn't have a Socket.IO client wired today; only the first event is live. Decide whether to add the client now (cheap, low risk) or defer until push events ship in T-26.
- **Empty `IndicatorGroupResponse.indicators` arrays — open question for UX.** Until SP ToC sync (T-31) ships on the backend, every indicators-panel call returns groups with empty arrays. We need an explicit empty state from design — coordinate with the `figma-mockups/` corner (the existing mockups assume populated arrays).
- **Push status UI — out of scope.** §9 marks push + push events PENDING. Do not build the push-status surface until T-26 fires the events; building blind risks rework.
- **STAR-side task IDs `T-13` / `T-14` / `T-19`** mentioned in the handoff are **backend repo task IDs**, not STAR task IDs. When STAR drafts its own `tasks.md` (see §5 below), it will assign its own `T-*` IDs and cross-reference these backend ones.

---

## 4. Open questions

Track these in the relevant per-feature spec when STAR writes one; for now they live here so they don't get lost.

| # | Question | Owner | Where to resolve |
| --- | --- | --- | --- |
| Q1 | Do we add the Socket.IO client now, or only when push events ship? | STAR lead | future `design.md` §integrations |
| Q2 | What does the "ToC catalog not yet synced" empty state look like? | Design | `figma-mockups/` follow-up |
| Q3 | How do we surface the difference between role-`403` and ownership-`403` to the user? Both come back with the same `description`. | UX + STAR FE | future `design.md` §error UX |
| Q4 | Should the `is_stale` badge use existing PrimeNG `Tag` severity, or do we need a new "stale" token in `roartheme.ts`? | Design | future `design.md` §components |
| Q5 | KP partial support (§7.2 + D9): which fields do we collect now and which do we defer? | PO + STAR FE | future `requirements.md` AC mapping |

---

## 5. What STAR still needs to write

This corner — plus the other three — is **input** to the SDD, not the SDD itself. The canonical STAR specs at `docs/specs/bilateral-module/{requirements,design,tasks}.md` **do not exist yet**.

When ready to author them, follow [`docs/specs/general-setup/`](../../general-setup/) templates. The order:

1. `/sdd-specify` from the four corners → `requirements.md` (`REQ-BIL-*` IDs).
2. `design.md` — translate the §4 endpoints into `BilateralService`, signals/state, route placement, components, error UX (resolves Q3, Q4).
3. `tasks.md` — STAR `T-BIL-*` task IDs, mapped 1:1 to the LIVE rows in §9, with explicit cross-refs to backend `T-13`/`T-14`/`T-19` and `R-BIL-*` IDs.

The constitutional docs that bind these are listed in the root [`CLAUDE.md`](../../../../CLAUDE.md): `docs/prd.md`, `docs/system-design/design.md`, `docs/detailed-design/detailed-design.md`, and the templates in `docs/specs/general-setup/`. Per `C-1`–`C-6`, the bilateral module must be **Angular 19 + PrimeNG 19**, **AWS Cognito + JWT**, lazy-loaded standalone components, WCAG 2.1 AA, and respect bundle budgets.

---

## 6. Drift policy

- The canonical source is the backend repo. When the backend updates `frontend-handoff.md`, refresh [`./frontend-handoff.md`](./frontend-handoff.md) in this corner and bump the snapshot header (source commit + snapshot-taken date).
- Do not edit the body of the snapshot in place. If STAR needs to add commentary, put it in **this README** (preferred) or in the eventual `design.md`.
- The next time the backend `frontend-handoff.md` is updated, append a row to the [§7 change log](#7-change-log) below with the previous-vs-new commit SHAs and a one-line summary of what changed (compare with `git -C <backend-repo> diff <old>..<new> -- docs/specs/bilateral-module/frontend-handoff.md`).

---

## 7. Change log

| Date | Change | Snapshot commit | Author |
| --- | --- | --- | --- |
| 2026-05-19 | Initial import of the backend handoff into the STAR client repo as a new context corner. | `7cb00e07` | STAR (`AC-1594-bilateral-module`) |
