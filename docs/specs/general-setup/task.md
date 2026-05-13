# SDD Task Template

> Methodology template used by `/sdd-specify` (and consumed by `/sdd-execute`). Every module-level spec under `docs/specs/<domain>/<feature>/task.md` must follow this structure.
>
> **Not a feature spec itself.** This file defines the *format* for future task lists.

---

## How to use this template

- Pair with `requirements.md` and `design.md` in the same folder.
- Tasks are the **execution unit** of `/sdd-execute`. Keep them small enough to complete in a single PR, large enough to deliver value.
- Number every task. Numbers are immutable once published — same rule as requirement IDs in [`./requirements.md`](./requirements.md).
- Capture **dependencies** explicitly. Use the dependency-graph format below.
- Each task lists the **acceptance criteria it discharges** (cite AC-IDs from `requirements.md`).
- Each task lists the **tests it must add or update**.

---

## Task ID convention

- Tasks use `T-<DOMAIN>-<NN>` matching the domain abbreviation used in `requirements.md`.
- Example: `T-RESULTS-01`, `T-RESULTS-02`.
- Sub-tasks use a dot: `T-RESULTS-01.1`.

---

## Template structure

> Copy the structure below into your `task.md`. Remove this preamble.

---

### 1. Goal

One sentence: what does this task list deliver when fully executed?

### 2. Pre-flight checklist

Before opening the first task:

- [ ] `requirements.md` and `design.md` exist and are reviewed.
- [ ] PRD personas, goals, and constraints cited in `requirements.md` are still current.
- [ ] No conflicting in-flight spec under the same domain (check `docs/specs/<domain>/`).
- [ ] Path aliases needed are already declared in `tsconfig.json` and `jest.config.ts`.

### 3. Dependency graph

Use a textual graph. One arrow per dependency. Cycles are not allowed.

```
T-<DOMAIN>-01 (interfaces, no deps)
    └─▶ T-<DOMAIN>-02 (service)
            ├─▶ T-<DOMAIN>-03 (component)
            └─▶ T-<DOMAIN>-04 (route + guard)
                    └─▶ T-<DOMAIN>-05 (tests)
T-<DOMAIN>-06 (docs update, no deps)
```

### 4. Tasks

Each task has the following fields. Keep them concise.

---

#### T-<DOMAIN>-01 — *Short title*

- **Status**: `pending` | `in_progress` | `completed`
- **Depends on**: list of task IDs (or "none")
- **Discharges ACs**: list of AC-IDs from `requirements.md`
- **Touches**:
  - `src/app/shared/interfaces/...`
  - `src/app/shared/services/...`
  - `src/app/pages/.../...`
  - (other files)
- **Summary**: 1–3 sentences describing the change.
- **Implementation notes**:
  - Reuse existing shared components/services where possible (see [`../../system-design/design.md`](../../system-design/design.md) §8 and [`../../detailed-design/detailed-design.md`](../../detailed-design/detailed-design.md) §6).
  - Follow the patterns in `design.md` §4.
- **Tests to add/update**:
  - Unit: `xxx.service.spec.ts` — cover happy path + 409 conflict.
  - Component: `xxx.component.spec.ts` — verify role-conditional rendering.
- **Done when**:
  - All listed ACs pass.
  - `npm run lint` is clean for changed files.
  - `npm run test` passes; coverage does not regress below [`../../detailed-design/detailed-design.md`](../../detailed-design/detailed-design.md) §10 floors.
  - Manual smoke through the affected golden path in [`../../system-design/design.md`](../../system-design/design.md) §3 succeeds.

---

#### T-<DOMAIN>-02 — *…*

(same structure)

---

### 5. Testing expectations (global rules)

- Use Jest via `jest-preset-angular`. Tests run with `npm run test`. Watch mode: `npm run test:watch`. Coverage: `npm run test:coverage`.
- Co-locate `.spec.ts` files. Use shared fixtures under `src/app/testing/`.
- Mirror server-side validation in component-level form tests.
- For services: use `HttpTestingController` and assert on the `MainResponse<T>` envelope.
- For role-based UI: assert both authorized and unauthorized renderings.
- For interceptors: verify token refresh, 409 surfacing, and toast/alert dispatch.
- For dark-mode parity (if touched): include at least one snapshot or visual-state assertion in both modes.

### 6. Execution conventions

- One task per PR by default. A bundled PR is acceptable when tasks are tightly coupled and reviewable together — record the bundling decision in `design.md` §11.
- PR title: `<type>(<domain>): <short description>` (e.g., `feat(results): add bulk evidence upload`).
- PR description references the spec folder and the discharged ACs.
- Pre-merge:
  - CI green (`unit-tests.yml`, `sonarcloud-analysis.yml`).
  - Bundle budget respected (`ng build` does not warn beyond baseline).
  - Manual smoke of the affected golden paths.
- Post-merge:
  - Update task `Status` to `completed` in the spec.
  - If the spec is fully done, mark the spec folder's `requirements.md` summary accordingly.

### 7. Rollout & feature flags

- If the change is risky or partially shippable, use a feature flag pattern consistent with existing flags in `environment*.ts`. Otherwise, no flag.
- Document rollout sequence (dev → staging → prod) and any data-migration coordination with the backend team.

### 8. Rollback plan

- For each task, describe how to safely revert (usually `git revert`; flag-off if a flag was introduced; backend coordination if a server contract changed).

### 9. Open items

- Items deferred from this task list to a future spec — link to the issue or follow-up spec slug.
