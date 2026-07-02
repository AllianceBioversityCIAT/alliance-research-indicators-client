# Proposal — Center Admin: Bilateral Project Mapping

> Lightweight `/sdd-propose` proposal. The reviewable intent layer before `/sdd-specify` produces requirements/design/tasks.

---

## 1. Document Control

| Field | Value |
| --- | --- |
| Spec path | `bilateral-module/center-admin-project-mapping` |
| Proposal path | `docs/specs/bilateral-module/center-admin-project-mapping/proposal.md` |
| Author | STAR (`AC-1594-bilateral-module`) |
| Status | DRAFT — awaiting approval |
| Created | 2026-07-01 |
| Frontend repo | `alliance-research-indicators-client` (Angular STAR client) — **primary work** |
| Backend repo | `alliance-research-indicators-main` (NestJS) — **already implemented; consume-only** |
| Related (archived) | `docs/specs/archive/2026-06-17-bilateral-module*` (ToC / Pool Funding Alignment — a **different** feature) |
| Backend reference impl | `main:.../src/admin/client/pages/BilateralProjectMappings.tsx` (React SSR admin page — to be replaced) |

---

## 2. Intent

Give **Center Admins** a first-class page inside the STAR client's **Center Admin** area to **map an AGRESSO bilateral contract (agreement) to a CLARISA project**. This mapping (`bilateral_project_mapping`) is what lets a bilateral/W3-funded contract resolve to a CLARISA project and its Science Programs, which downstream powers the "Contributing to Pool Funding" tag and the ToC/Pool Funding Alignment flows.

The operator's job on this page: find a bilateral contract, pick the correct CLARISA project it corresponds to, save the mapping, and later search/edit/deactivate existing mappings.

---

## 3. Problem / Current Behavior

- The backend **already exposes a complete CRUD + picker API** for these mappings (see §7), and there is a **React SSR admin page** at `/admin/bilateral-project-mappings` that operators reach outside the STAR client.
- The STAR Angular client's **Center Admin dropdown** (`alliance-sidebar`) today offers only: **Bulk upload**, **AGRESSO Pool Funding Tag**, **SDG Management**. There is **no** bilateral project-mapping surface.
- Operators therefore manage bilateral mappings in a **separate React SSR shell**, disjoint from the rest of the admin experience (different look/feel, navigation, and auth surface).
- Result: fragmented admin UX and a second UI to maintain for the same API.

---

## 4. Proposed Outcome

A new **Center Admin → "Bilateral Mapping"** page in the STAR client that lets a Center Admin:

1. **List** existing mappings in a paginated table — columns: AGRESSO agreement, CLARISA project (short name + id), source (MANUAL / AI_SUGGESTED / AI_AUTO), confidence (when not MANUAL), active state, last updated.
2. **Search / filter** — free-text search (agreement id / project short name) + filters for `is_active` and `source`.
3. **Create** a mapping via two typeahead pickers: an **AGRESSO bilateral contract** picker and a **CLARISA bilateral project** picker (with a Science-Program allocation preview), plus optional `notes`.
4. **Edit** an existing mapping (re-point CLARISA project / edit notes).
5. **Deactivate** (soft-delete) a mapping, with the one-active-per-agreement uniqueness rule surfaced clearly (409 handling).

The page matches STAR client conventions: standalone Angular component, **signals** state, **PrimeNG** table/paginator/inputs, `centerAdminGuard`, and the shared alert/loading patterns used by SDG Management.

Once shipped, the **React SSR page is deprecated** and the STAR Center Admin page becomes the single operator surface.

---

## 5. Scope

**In scope (frontend — `alliance-research-indicators-client`):**

- New route `administration/center-admin/bilateral-mapping` (lazy standalone component, `canMatch: [centerAdminGuard]`).
- New sidebar entry under the `center-admin` group in `alliance-sidebar.component.ts`.
- New page component + template under `pages/.../administration/center-admin/bilateral-mapping/`.
- Client-side models + `ApiService` bindings for the 5 CRUD endpoints and the 2 picker endpoints.
- List/search/filter/paginate, create, edit, deactivate; success/error/loading/empty states; 409 (duplicate active agreement) handling.

**In scope (backend — `alliance-research-indicators-main`):**

- **Consume-only verification** that the existing endpoints serve the STAR client (JWT/roles, CORS, response envelope shape). No new backend feature work anticipated.

**Deferred / later:**

- Removal of the React SSR page (`/admin/bilateral-project-mappings`) and its route — tracked as a cleanup after the Angular page is validated in testing.

---

## 6. Non-Goals

- No changes to the mapping **data model** or the mapping **business rules** (uniqueness, soft-delete, audit) — reuse as-is.
- No AI suggestion/auto-mapping generation flow — `AI_SUGGESTED`/`AI_AUTO` rows are displayed/edited but not produced here.
- No changes to the ToC / Pool Funding Alignment (indicator-mapping) feature — that is separate, archived work.
- No bulk import of mappings (single-record CRUD only for v1).
- No new roles/permissions — reuse `CENTER_ADMIN` (9) / `SYSTEM_ADMIN` (1).

---

## 7. Affected Users, Systems, And Specs

**Users:** Center Admins / System Admins.

**Frontend touch points:**
- `research-indicators/src/app/app.routes.ts` — center-admin route block (near lines 252–281).
- `research-indicators/src/app/shared/components/alliance-sidebar/alliance-sidebar.component.ts` — `administrationGroups()` `center-admin` children.
- `research-indicators/src/app/pages/platform/pages/administration/center-admin/bilateral-mapping/` — new component (analog: `sdg-management/`).
- `research-indicators/src/app/shared/guards/center-admin.guard.ts` + `services/cache/roles.service.ts` — reused as-is.
- `ApiService` — new endpoint methods; new interfaces under `shared/interfaces/bilateral/`.

**Backend surface consumed (already implemented, `alliance-research-indicators-main`):**
- `GET /api/bilateral-project-mappings` — list (`page`, `limit`, `search`, `is_active`, `source`) → `{ items[], meta{total,page,limit,totalPages} }`.
- `GET /api/bilateral-project-mappings/:id`
- `POST /api/bilateral-project-mappings`
- `PATCH /api/bilateral-project-mappings/:id`
- `PATCH /api/bilateral-project-mappings/:id/deactivate`
- `GET /api/tools/clarisa/projects/bilateral` — CLARISA project picker (with SP allocation).
- `GET /api/v1/agresso/contracts?pool-funding-contributor=true` — AGRESSO contract picker.
- Guard: `RolesGuard` + `@Roles(CENTER_ADMIN, SYSTEM_ADMIN)`.
- Entity fields: `id, agresso_agreement_id, clarisa_project_id, clarisa_project_short_name?, source, confidence_score?, notes?, is_active, created_at/by, updated_at/by`.

**Related specs:** the archived `bilateral-module` specs (ToC/alignment) — reference only; this is a distinct Center Admin admin-CRUD feature.

---

## 8. Requirement Delta Preview

### ADDED Requirements

- Center Admin can open a **Bilateral Mapping** page from the Center Admin menu.
- Center Admin can list, search, and filter (`is_active`, `source`) bilateral project mappings with pagination.
- Center Admin can create a mapping by selecting an AGRESSO contract + CLARISA project (typeahead) with optional notes.
- Center Admin can edit and soft-deactivate a mapping.
- The UI surfaces the one-active-mapping-per-agreement rule (409) as an actionable error.

### MODIFIED Requirements

- The Center Admin menu gains a third/fourth destination alongside Bulk upload, AGRESSO Pool Funding Tag, and SDG Management.

### REMOVED Requirements

- (Deferred) The React SSR admin page `/admin/bilateral-project-mappings` ceases to be the operator surface for bilateral mappings.

---

## 9. Approach Options

**Option A — Port the React SSR page into a native Angular Center Admin page (Recommended).**
Rebuild the existing SSR page as a standalone Angular component consuming the same REST endpoints, following STAR conventions (signals + PrimeNG + `centerAdminGuard`). Later retire the SSR page.
- ➕ Single, consistent admin UX; one UI to maintain; reuses proven backend + existing STAR patterns (SDG Management is a near-template).
- ➕ Zero backend feature work.
- ➖ Reimplements picker/table UI in Angular (bounded, matches existing components).

**Option B — Embed the existing React SSR page as an iframe (like Bulk upload).**
Add a Center Admin menu item that iframes `/admin/bilateral-project-mappings`.
- ➕ Fastest; no reimplementation.
- ➖ Look/feel + auth/token seams differ from the STAR client; keeps two UIs; poor long-term fit; harder to theme/QA.

**Option C — Keep SSR page, do nothing in STAR.**
- ➖ Fails the stated intent (module inside STAR Center Admin); fragmentation persists. Rejected.

---

## 10. Recommended Approach

**Option A.** It's the smallest path that actually satisfies the intent (a native Center Admin module), reuses a fully-built backend, and follows an existing in-repo template (SDG Management page). Backend stays consume-only; the SSR page removal is a deferred cleanup, keeping this change bounded to the frontend.

---

## 11. Risks, Dependencies, And Open Questions

- **Response-envelope drift:** confirm the STAR `ApiService` unwraps the list `{ items, meta }` and the `ResponseUtils.format` envelope consistently. *(verify in specify)*
- **Picker payloads:** confirm the exact shapes of `GET /api/tools/clarisa/projects/bilateral` and `GET /api/v1/agresso/contracts?pool-funding-contributor=true` (fields the SSR page assumed: `short_name`, `source_of_funding`, `science_programs[]`; `agreement_id`, `description`, `funding_type`). *(verify against live backend in specify)*
- **Auth parity:** the SSR page relied on `RolesGuard` at the API and an SSR shell; the STAR page relies on `centerAdminGuard` (role 1, or role 9 with `focus_id===1 && sec_role_id===9`) — confirm this matches the API's CENTER_ADMIN/SYSTEM_ADMIN expectations.
- **409 semantics:** define the UX when creating/activating a second mapping for an agreement that already has an active one.
- **Deactivate vs delete:** confirm operators only ever soft-deactivate (no hard delete) and whether reactivation is needed in v1.
- **Open question (deferred):** timing + owner for removing the React SSR page and its `/admin` route.

---

## 12. Success Criteria

- A Center Admin can reach **Center Admin → Bilateral Mapping** and see a paginated, searchable, filterable list of mappings.
- A Center Admin can create, edit, and deactivate a mapping end-to-end against the live backend, including correct 409 handling.
- Page matches STAR conventions (signals, PrimeNG, guard, alert/loading/empty states) and passes lint + the client test suite.
- Non-admins cannot reach the route (guard redirect verified).
- Product owner agrees the STAR page can supersede the React SSR page.

---

## 13. Next Step

```text
/sdd-specify bilateral-module/center-admin-project-mapping
```
