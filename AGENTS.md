# CLAUDE.md — Repository Guide for Claude Code

This is the **constitutional baseline** for the `alliance-research-indicators-client` repository. Read it before making non-trivial changes.

The actual application lives under `research-indicators/` (Angular 19 + PrimeNG 19 SPA). The `docs/` folder is the source of truth for product intent, UX rules, and technical conventions.

---

## Constitutional Documents

All four are living documents. If reality disagrees with them, **fix one or the other** — never let them drift.

| Document | Purpose | Consult before… |
|----------|---------|-----------------|
| [`docs/prd.md`](./docs/prd.md) | **PRD** — problem, personas (4), goals & KPIs, scope, non-goals, user stories, acceptance criteria, constraints | Any change that affects what the product *does* for users, or that touches scope / personas / KPIs |
| [`docs/system-design/design.md`](./docs/system-design/design.md) | **System Design** — UX principles, IA, flows, screen inventory, navigation, tokens, components, responsive, a11y, dark mode, design decisions | Any UI/UX change — new screen, new pattern, new color/spacing, new modal, theme work |
| [`docs/detailed-design/detailed-design.md`](./docs/detailed-design/detailed-design.md) | **Detailed Design** — system overview, modules, data model, API contracts, state boundaries, integrations, security, errors, testing, constraints | Any technical change — new service, interceptor, route, dependency, integration, or change to state/auth/error patterns |
| [`docs/specs/general-setup/`](./docs/specs/general-setup/) | **SDD templates** — `requirements.md`, `design.md`, `task.md` formats for module specs | Before running `/sdd-specify` for any new feature/module |

These four documents form the SDD constitutional baseline. Future `/sdd-specify`, `/sdd-execute`, `/sdd-validate`, and `/sdd-test` work depends on them.

### Child guides

Scoped guides for specific subtrees. Read them in addition to the constitutional docs whenever you're working inside their folder.

| Guide | Scope |
|-------|-------|
| [`research-indicators/src/CLAUDE.md`](./research-indicators/src/CLAUDE.md) | Day-to-day coding contract for the Angular SPA source — folder layout, path aliases, where new code goes, conventions, tests, commands |

---

## How module specs are organized

Spec taxonomy is **by domain module**, mirroring the page modules in [`docs/detailed-design/detailed-design.md`](./docs/detailed-design/detailed-design.md) §2.

```
docs/specs/
├── general-setup/           # methodology templates (this baseline)
├── results/                 # result lifecycle work
├── indicators/              # indicator catalog
├── projects/                # projects & project detail
├── dashboard/               # analytics & charts
├── notifications/           # real-time feed
├── administration/          # center-admin tooling (bulk upload, SDG mgmt)
├── auth/                    # cognito, JWT, guards
├── shared/                  # cross-cutting shared components/services
└── platform/                # shell, navbar, sidebar
```

Inside each domain, one folder per feature/spec (kebab-case). Each spec folder contains:

- `requirements.md` — what to build (from [`docs/specs/general-setup/requirements.md`](./docs/specs/general-setup/requirements.md))
- `design.md` — how to build it (from [`docs/specs/general-setup/design.md`](./docs/specs/general-setup/design.md))
- `task.md` — execution units (from [`docs/specs/general-setup/task.md`](./docs/specs/general-setup/task.md))

Requirement IDs follow `REQ-<DOMAIN>-<NN>` and task IDs follow `T-<DOMAIN>-<NN>` (see the templates). IDs are immutable once published.

---

## Hard rules (from the PRD constraints — C-1 through C-6)

When you change code, these are non-negotiable unless the PRD itself is updated:

- **C-1**: Stack is **Angular 19 + PrimeNG 19**. No framework migration.
- **C-2**: Auth is **AWS Cognito + JWT**. No alternative IdPs in this client.
- **C-3**: Controlled vocabularies come from **CLARISA**. No parallel taxonomies for institutions, countries, regions, SDGs, levers, impact areas, etc.
- **C-4**: Accessibility floor is **WCAG 2.1 AA** on every changed screen.
- **C-5**: Production bundles must respect `angular.json` budgets (initial ≤ 3 MB error / 2 MB warning; component styles ≤ 8 kB / 4 kB).
- **C-6**: New features are **lazy-loaded standalone components**. No NgModules.

See [`docs/prd.md`](./docs/prd.md) §8.3 for the full constraint list.

---

## Where things live

- **Angular source**: `research-indicators/src/` — see also the child guide [`research-indicators/src/CLAUDE.md`](./research-indicators/src/CLAUDE.md) for folder layout, aliases, and per-folder conventions.
- **Routes**: `research-indicators/src/app/app.routes.ts`
- **Pages**: `research-indicators/src/app/pages/`
- **Shared (components, services, pipes, utils, interfaces)**: `research-indicators/src/app/shared/`
- **Theme (PrimeNG Aura preset)**: `research-indicators/src/app/theme/roartheme.ts`
- **Global SCSS & tokens**: `research-indicators/src/styles/`
- **Environments**: `research-indicators/src/environments/`
- **Jest config**: `research-indicators/jest.config.ts`
- **Color & utility-class reference**: `research-indicators/README.md`
- **Docker / Nginx**: `research-indicators/Dockerfile`, `research-indicators/nginx.conf`, `research-indicators/docker-compose.yml`
- **CI**: `.github/workflows/` (unit tests, SonarCloud, Jenkins trigger)

---

## Quick patterns

- **Color/spacing**: use token utility classes (`abc-*`, `atc-*`, `rs-*`, `fs-*`) — never hardcoded hex. See [`docs/system-design/design.md`](./docs/system-design/design.md) §7 and `research-indicators/README.md`.
- **HTTP**: go through `ApiService` (or a domain service that delegates to it). Always handle `MainResponse<T>`. Surface 409 conflicts via the link-to-existing flow.
- **State**: signals (`signal`, `computed`, `WritableSignal`) for client state; RxJS for streams; no NgRx. See [`docs/detailed-design/detailed-design.md`](./docs/detailed-design/detailed-design.md) §6.
- **Auth**: never bypass `jWtInterceptor`. Tokens stay in `localStorage` + cache signals; never logged.
- **Modals**: use `all-modals` host + `modal` wrapper, not ad-hoc overlays.
- **Forms**: reactive forms; wrapped PrimeNG inputs from `custom-fields.scss` / `custom-prime-force-styles.scss`.
- **Testing**: Jest co-located `.spec.ts`. Shared fixtures in `src/app/testing/`. Don't push project coverage below the floors in `jest.config.ts`.

---

## Working with this repo as Claude

1. **Before non-trivial work**, scan the relevant constitutional doc above.
2. **For new features**, run `/sdd-specify` and follow the templates in [`docs/specs/general-setup/`](./docs/specs/general-setup/).
3. **For UI work**, reach for shared components and tokens before inventing new ones. If you must introduce a new pattern, record the decision in [`docs/system-design/design.md`](./docs/system-design/design.md) §12 in the same change.
4. **For technical changes**, if you deviate from the patterns in [`docs/detailed-design/detailed-design.md`](./docs/detailed-design/detailed-design.md), update that doc in the same change.
5. **Open questions** belong in the relevant doc's "Open Questions" section, not in commit messages.
