# Alliance Research Indicators — Client

Web client for the **Alliance of Bioversity International and CIAT** (and the broader CGIAR ecosystem) — used to report, search, validate, and analyze research results mapped to a standardized indicator framework. It is the user-facing layer of a multi-platform results federation that includes **STAR, TIP, PRMS, and AICCRA**.

The application captures structured evidence of research outcomes (capacity sharing events, innovation development, policy changes, OICRs, IP rights, partners, evidence files, geographic scope) using canonical **CLARISA** controlled vocabularies so results are comparable across platforms and reportable to funders.

> The **constitutional baseline** for this repository lives in [`docs/`](./docs/). Read it before non-trivial changes. The day-to-day coding contract for the Angular SPA lives in [`research-indicators/src/CLAUDE.md`](./research-indicators/src/CLAUDE.md).

---

## Repository layout

```
alliance-research-indicators-client/
├── README.md                       ← this file
├── CLAUDE.md                       ← repo-level guide for Claude Code
├── LICENSE
├── docs/                           ← SDD constitutional baseline (read first)
│   ├── prd.md
│   ├── system-design/design.md
│   ├── detailed-design/detailed-design.md
│   └── specs/
│       ├── general-setup/          ← methodology templates
│       │   ├── requirements.md
│       │   ├── design.md
│       │   └── task.md
│       └── <domain>/<feature>/     ← feature specs (created via /sdd-specify)
└── research-indicators/            ← Angular 19 + PrimeNG 19 SPA
    ├── README.md                   ← app-level: color tokens, utility classes
    ├── README.Docker.md            ← Docker usage notes
    ├── src/
    │   ├── CLAUDE.md               ← child guide: folder layout, aliases, conventions
    │   └── ...                     ← Angular source
    ├── angular.json
    ├── package.json
    ├── Dockerfile
    ├── docker-compose.yml
    └── nginx.conf
```

---

## Documentation map

The `docs/` folder is the source of truth for product intent, UX rules, and technical conventions. All four documents are **living** — if reality disagrees with them, fix one or the other.

| Document | What it covers | When to consult |
|----------|----------------|-----------------|
| [`docs/prd.md`](./docs/prd.md) | **Product Requirements** — problem, four personas (Researcher, Center Admin, MEL Regional Expert, Cross-Platform Consumer), goals, KPIs (M1–M8), scope, non-goals, user stories (R-1…CP-3, S-1…S-3), acceptance criteria, hard constraints (C-1…C-6), assumptions, open questions | Any change that affects **what** the product does for users, or that touches scope / personas / KPIs |
| [`docs/system-design/design.md`](./docs/system-design/design.md) | **UI/UX Blueprint** — experience principles, information architecture, 5 primary user flows, 22-screen inventory, navigation model, layout patterns, design tokens, component inventory, responsive behavior, accessibility, dark mode, decision record, open gaps | Any UI/UX change — new screen, pattern, color/spacing, modal, or theme work |
| [`docs/detailed-design/detailed-design.md`](./docs/detailed-design/detailed-design.md) | **Technical Blueprint** — system overview, domain modules, data model, API contracts (`MainResponse<T>` envelope, 3 services, 3 interceptors), state boundaries (signals + RxJS, no NgRx), integrations (Cognito, CLARISA, file-manager, text-mining, WebSocket, analytics), security/authorization, error handling, testing strategy, constraints | Any technical change — new service, interceptor, route, dependency, integration, or change to state/auth/error patterns |
| [`docs/specs/general-setup/`](./docs/specs/general-setup/) | **SDD methodology templates** for module specs: [`requirements.md`](./docs/specs/general-setup/requirements.md), [`design.md`](./docs/specs/general-setup/design.md), [`task.md`](./docs/specs/general-setup/task.md) | Before running `/sdd-specify` for any new feature/module |

Together these documents are the foundation for `/sdd-specify`, `/sdd-execute`, `/sdd-validate`, and `/sdd-test`.

### Spec taxonomy

Spec folders under `docs/specs/` are organized **by domain module**, mirroring [`docs/detailed-design/detailed-design.md`](./docs/detailed-design/detailed-design.md) §2:

```
docs/specs/
├── general-setup/    ← templates (this baseline)
├── results/          ← result lifecycle work (11 metadata tabs)
├── indicators/       ← indicator catalog
├── projects/         ← projects & project detail
├── dashboard/        ← analytics & charts
├── notifications/    ← real-time feed
├── administration/   ← center-admin tooling (bulk upload, SDG mgmt)
├── auth/             ← Cognito, JWT, guards
├── shared/           ← cross-cutting shared components/services
└── platform/         ← shell, navbar, sidebar
```

Each feature spec is a slug folder (kebab-case) containing `requirements.md`, `design.md`, and `task.md` derived from the templates. Requirement IDs (`REQ-<DOMAIN>-<NN>`) and task IDs (`T-<DOMAIN>-<NN>`) are **immutable** once published.

---

## Hard constraints (from PRD §8.3)

These bind every change. Updates require updating the PRD itself.

- **C-1** Stack is **Angular 19 + PrimeNG 19**. No framework migration.
- **C-2** Auth is **AWS Cognito + JWT**. No alternative IdPs.
- **C-3** Controlled vocabularies come from **CLARISA**. No parallel taxonomies.
- **C-4** **WCAG 2.1 AA** accessibility floor on every changed screen.
- **C-5** Production bundles respect `angular.json` budgets (initial ≤ 3 MB error / 2 MB warning; component styles ≤ 8 kB / 4 kB).
- **C-6** New features are **lazy-loaded standalone components**. No NgModules.

---

## Getting started

All commands run from the `research-indicators/` directory.

### Prerequisites

- **Node.js 20.x** (matches the Dockerfile build stage).
- **npm 10.x** (ships with Node 20).
- Access to the backend services configured in `src/environments/environment*.ts`:
  - `mainApiUrl` — primary REST API
  - `textMiningUrl` — text-mining / NLP microservice
  - `fileManagerUrl` — evidence file upload service
- **AWS Cognito** user-pool credentials (consumed at runtime).

### Install

```bash
cd research-indicators
npm install
```

### Run

| Command | Purpose |
|---------|---------|
| `npm start` | Dev server at `http://localhost:4200` (hot reload) |
| `npm run build` | Production build → `dist/research-indicators/` |
| `npm run build-dev` | Dev build with sourcemaps |
| `npm run test` | Jest unit tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Coverage report (floors: stmts 40% / branches 20% / lines 45% / functions 30%) |
| `npm run lint` | Angular ESLint (TS + HTML) |
| `npm run s-lint` | Stylelint (SCSS) |
| `npm run compose:up:dev` | Docker Compose dev profile |
| `npm run compose:up:prod` | Docker Compose prod profile |

See [`research-indicators/README.md`](./research-indicators/README.md) for the **color token system** and **responsive utility classes** reference. See [`research-indicators/README.Docker.md`](./research-indicators/README.Docker.md) for Docker-specific usage.

---

## Architecture at a glance

```
┌────────────────────────────────────────────┐
│      Browser (Angular 19 SPA, this repo)   │
│  PrimeNG 19, Signals + RxJS, SCSS tokens   │
│  Lazy standalone routes • JWT + Cognito    │
│  WebSocket presence/notifications          │
└──────┬───────────┬────────────────────┬────┘
       │ HTTPS REST│ HTTPS REST         │ WSS
       ▼           ▼                    ▼
   Main API    Text-Mining          WebSocket
   (NestJS)    microservice         gateway
       │
       ▼
   CLARISA   ◀── STAR / TIP / PRMS / AICCRA (federation)
                ▲
                │
           AWS Cognito
```

Full architecture, data model, API contracts, and security model in [`docs/detailed-design/detailed-design.md`](./docs/detailed-design/detailed-design.md).

---

## Build & deploy

- **Multi-stage Dockerfile** at [`research-indicators/Dockerfile`](./research-indicators/Dockerfile) — Node 20-alpine build → Nginx-alpine serving `dist/research-indicators/browser` on port 80.
- **Nginx** config at [`research-indicators/nginx.conf`](./research-indicators/nginx.conf) — SPA fallback (`try_files $uri $uri/ /index.html`).
- **Compose** at [`research-indicators/docker-compose.yml`](./research-indicators/docker-compose.yml) — dev profile mounts source for hot reload.
- **Service worker** at [`research-indicators/ngsw-config.json`](./research-indicators/ngsw-config.json) — registered in production builds only (currently a no-op for offline; see detailed-design §11.4).
- **CI/CD** workflows in [`.github/workflows/`](./.github/workflows/): `unit-tests.yml`, `sonarcloud-analysis.yml`, `jenkins-trigger.yml`.

---

## Contributing

1. **Read the relevant constitutional doc** before non-trivial work (see [Documentation map](#documentation-map)).
2. **For new features**, run `/sdd-specify` and follow the templates in [`docs/specs/general-setup/`](./docs/specs/general-setup/). Place the spec under the matching `docs/specs/<domain>/<feature>/` folder.
3. **For UI work**, reach for shared components and tokens before inventing new ones. New patterns must be recorded in [`docs/system-design/design.md`](./docs/system-design/design.md) §12 in the same change.
4. **For technical changes**, if you deviate from [`docs/detailed-design/detailed-design.md`](./docs/detailed-design/detailed-design.md), update that doc in the same change.
5. **Open questions** belong in the relevant doc's "Open Questions" section, not in commit messages.
6. **Tests** must not push project coverage below the floors enforced by [`research-indicators/jest.config.ts`](./research-indicators/jest.config.ts).

Conventions for branching, PR titles, and execution sequencing are documented in [`docs/specs/general-setup/task.md`](./docs/specs/general-setup/task.md) §6.

---

## License

See [`LICENSE`](./LICENSE).
