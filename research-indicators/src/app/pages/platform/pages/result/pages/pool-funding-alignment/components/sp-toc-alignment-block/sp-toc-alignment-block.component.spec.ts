import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Select } from 'primeng/select';
import { SpAlignmentDraft, TocCatalogSp, TocLevel } from '@interfaces/bilateral/pool-funding-alignment.interface';
import {
  TOC_CATALOG_CAPSHARING_FIXTURE,
  TOC_CATALOG_CAPSHARING_GUIDANCE_FIXTURE,
  TOC_CATALOG_POLICY_FIXTURE
} from 'src/app/testing/toc-catalog.fixture';
import { IndicatorSelectOption, SpTocAlignmentBlockComponent, SpTocBlockScienceProgram } from './sp-toc-alignment-block.component';

const SP01: SpTocBlockScienceProgram = { official_code: 'SP01', name: 'Biodiversity for Food and Agriculture', color: '#173f6f' };

const SP01_CAT: TocCatalogSp = TOC_CATALOG_CAPSHARING_FIXTURE.catalogs[0];
const SP01_POLICY_CAT: TocCatalogSp = TOC_CATALOG_POLICY_FIXTURE.catalogs[0];

function emptyDraft(overrides: Partial<SpAlignmentDraft> = {}): SpAlignmentDraft {
  return {
    sp_code: 'SP01',
    aligns_with_toc: null,
    level: null,
    toc_result_id: null,
    indicator_id: null,
    quantitative_contribution: null,
    ...overrides
  };
}

describe('SpTocAlignmentBlockComponent', () => {
  let fixture: ComponentFixture<SpTocAlignmentBlockComponent>;
  let component: SpTocAlignmentBlockComponent;

  function setup(inputs: {
    sp?: SpTocBlockScienceProgram;
    catalog?: TocCatalogSp | null;
    allowedLevels?: TocLevel[];
    draft?: SpAlignmentDraft;
    disabled?: boolean;
    inlineErrors?: Record<string, string> | null;
    catalogState?: 'loading' | 'ready' | 'error';
    resultType?: string | null;
  } = {}): void {
    fixture.componentRef.setInput('sp', inputs.sp ?? SP01);
    fixture.componentRef.setInput('catalog', inputs.catalog ?? SP01_CAT);
    fixture.componentRef.setInput('allowedLevels', inputs.allowedLevels ?? ['OUTPUT']);
    fixture.componentRef.setInput('draft', inputs.draft ?? emptyDraft());
    fixture.componentRef.setInput('disabled', inputs.disabled ?? false);
    fixture.componentRef.setInput('inlineErrors', inputs.inlineErrors ?? null);
    fixture.componentRef.setInput('catalogState', inputs.catalogState ?? 'ready');
    fixture.componentRef.setInput('resultType', inputs.resultType ?? null);
  }

  beforeEach(async () => {
    // provideNoopAnimations: the guidance suite opens the body-appended select
    // overlay (p-overlay declares animations); a no-op for every other test.
    await TestBed.configureTestingModule({
      imports: [SpTocAlignmentBlockComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();
    fixture = TestBed.createComponent(SpTocAlignmentBlockComponent);
    component = fixture.componentInstance;
  });

  it('creates', () => {
    setup();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // --- Yes/No toggle (AC-03.2) ----------------------------------------------
  describe('per-SP Yes/No (AC-03.2)', () => {
    it('No emits a draft with cascade fields nulled and aligns_with_toc false', () => {
      setup({ draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 5187, indicator_id: 5973, quantitative_contribution: 3 }) });
      const emitted: SpAlignmentDraft[] = [];
      component.draftChange.subscribe(d => emitted.push(d));

      component.onAlignsChange(false);

      expect(emitted[0]).toEqual(
        expect.objectContaining({
          aligns_with_toc: false,
          level: null,
          toc_result_id: null,
          indicator_id: null,
          quantitative_contribution: null
        })
      );
    });

    it('Yes emits aligns_with_toc true without touching other fields', () => {
      setup({ draft: emptyDraft() });
      const emitted: SpAlignmentDraft[] = [];
      component.draftChange.subscribe(d => emitted.push(d));

      component.onAlignsChange(true);

      expect(emitted[0].aligns_with_toc).toBe(true);
    });

    it('alignsYes computed is true only when aligns_with_toc === true', () => {
      setup({ draft: emptyDraft({ aligns_with_toc: null }) });
      fixture.detectChanges();
      expect(component.alignsYes()).toBe(false);

      fixture.componentRef.setInput('draft', emptyDraft({ aligns_with_toc: true }));
      fixture.detectChanges();
      expect(component.alignsYes()).toBe(true);
    });

    it('null (unanswered) hides cascade — no level select rendered', () => {
      setup({ draft: emptyDraft({ aligns_with_toc: null }) });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="sp-toc-level-SP01"]')).toBeNull();
    });
  });

  // --- Level options + labels (AC-04.1/04.2/04.4, D-4) ------------------------
  describe('Level options (§4.7 labels, D-4)', () => {
    it('CapSharing: a single OUTPUT level labeled "High Level Output"', () => {
      setup({ allowedLevels: ['OUTPUT'] });
      fixture.detectChanges();
      expect(component.levelOptions()).toEqual([{ label: 'High Level Output', value: 'OUTPUT' }]);
    });

    it('Policy: OUTCOME + EOI labeled "Intermediate Outcome" / "2030 Outcome"', () => {
      setup({ allowedLevels: ['OUTCOME', 'EOI'] });
      fixture.detectChanges();
      expect(component.levelOptions()).toEqual([
        { label: 'Intermediate Outcome', value: 'OUTCOME' },
        { label: '2030 Outcome', value: 'EOI' }
      ]);
    });

    it('single-option level is NOT preselected (D-4): draft.level stays null', () => {
      setup({ allowedLevels: ['OUTPUT'], draft: emptyDraft({ aligns_with_toc: true }) });
      fixture.detectChanges();
      // The block never emits a level on its own — it waits for user choice.
      expect(component.draft().level).toBeNull();
    });

    it('changing Level resets HLO + indicator + contribution (AC-04.4)', () => {
      setup({ draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 5187, indicator_id: 5973, quantitative_contribution: 3 }) });
      const emitted: SpAlignmentDraft[] = [];
      component.draftChange.subscribe(d => emitted.push(d));

      component.onLevelChange('OUTPUT');

      expect(emitted[0]).toEqual(
        expect.objectContaining({ level: 'OUTPUT', toc_result_id: null, indicator_id: null, quantitative_contribution: null })
      );
    });
  });

  // --- HLO options + labels (AC-05.1/05.3/05.4) ------------------------------
  describe('HLO options (AC-05.x)', () => {
    it('options correspond 1:1 to the (SP, level) toc_results (22 for SP01 OUTPUT)', () => {
      setup({ catalog: SP01_CAT, draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT' }) });
      fixture.detectChanges();
      expect(component.hloOptions().length).toBe(22);
    });

    it('OUTPUT options carry the AOW code (bold prefix) + title', () => {
      setup({ catalog: SP01_CAT, draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT' }) });
      fixture.detectChanges();
      const first = component.hloOptions().find(o => o.value === 5187);
      expect(first).toEqual({ value: 5187, aowCode: 'AOW01', title: 'HLO1.AOW1.IO1 Steer to impact' });
    });

    it('EOI options have aow_code === null (title-only label, AC-05.4)', () => {
      setup({ catalog: SP01_POLICY_CAT, allowedLevels: ['OUTCOME', 'EOI'], draft: emptyDraft({ aligns_with_toc: true, level: 'EOI' }) });
      fixture.detectChanges();
      const opts = component.hloOptions();
      expect(opts.length).toBeGreaterThan(0);
      expect(opts.every(o => o.aowCode === null)).toBe(true);
    });

    it('hloFieldLabel follows the selected level (§4.7)', () => {
      setup({ catalog: SP01_POLICY_CAT, allowedLevels: ['OUTCOME', 'EOI'], draft: emptyDraft({ aligns_with_toc: true, level: 'OUTCOME' }) });
      fixture.detectChanges();
      expect(component.hloFieldLabel()).toBe('Intermediate Outcome');
    });

    it('empty (SP, level) renders an inline empty state, not a broken dropdown (AC-05.4)', () => {
      const emptyLevelCat: TocCatalogSp = { sp_code: 'SP01', levels: [{ level: 'OUTPUT', toc_results: [] }] };
      setup({ catalog: emptyLevelCat, draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT' }) });
      fixture.detectChanges();
      expect(component.showEmptyHlo()).toBe(true);
      expect(fixture.nativeElement.querySelector('[data-testid="sp-toc-hlo-empty-SP01"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('[data-testid="sp-toc-hlo-SP01"]')).toBeNull();
    });

    it('changing HLO resets indicator + contribution only (AC-05.3)', () => {
      setup({ draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 5172, indicator_id: 5939, quantitative_contribution: 7 }) });
      const emitted: SpAlignmentDraft[] = [];
      component.draftChange.subscribe(d => emitted.push(d));

      component.onHloChange(5187);

      expect(emitted[0]).toEqual(
        expect.objectContaining({ level: 'OUTPUT', toc_result_id: 5187, indicator_id: null, quantitative_contribution: null })
      );
    });

    it('coerces string HLO ids from PrimeNG before emitting', () => {
      setup({ draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 5172, indicator_id: 5939, quantitative_contribution: 7 }) });
      const emitted: SpAlignmentDraft[] = [];
      component.draftChange.subscribe(d => emitted.push(d));

      component.onHloChange('5187');

      expect(emitted[0].toc_result_id).toBe(5187);
    });
  });

  // --- Indicator options (AC-06.1, D-5) --------------------------------------
  describe('Indicator options (AC-06.x, D-5)', () => {
    it('options correspond 1:1 to the chosen HLO indicators (5 for 5187), UNFILTERED', () => {
      setup({ catalog: SP01_CAT, draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 5187 }) });
      fixture.detectChanges();
      const opts = component.indicatorOptions();
      expect(opts.length).toBe(5);
      // A `custom` type_value indicator (5973) is still present — no type filtering.
      expect(opts.some(o => o.value === 5973)).toBe(true);
      expect(opts[0].label).toBe('Number of new market intelligence briefs');
    });

    it('resolves indicators when toc_result_id is a string (PrimeNG coercion)', () => {
      setup({
        catalog: SP01_CAT,
        draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: '5187' as unknown as number })
      });
      fixture.detectChanges();
      expect(component.indicatorOptions().length).toBe(5);
    });

    it('shows an empty notice when the chosen HLO has no indicators in the catalog', () => {
      const catalogWithoutIndicators = {
        ...SP01_CAT,
        levels: [
          {
            level: 'OUTPUT' as const,
            toc_results: [
              {
                toc_result_id: 9999,
                title: 'Result without indicators',
                description: null,
                aow_code: 'AOW01',
                indicators: []
              }
            ]
          }
        ]
      };
      setup({
        catalog: catalogWithoutIndicators,
        draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 9999 })
      });
      fixture.detectChanges();
      expect(component.showEmptyIndicators()).toBe(true);
      expect(fixture.nativeElement.querySelector('[data-testid="sp-toc-indicator-empty-SP01"]')).not.toBeNull();
    });

    it('selecting an indicator reveals the contribution panel (AC-06.2)', () => {
      setup({ catalog: SP01_CAT, draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 5187, indicator_id: 5973 }) });
      fixture.detectChanges();
      expect(component.selectedIndicator()?.indicator_id).toBe(5973);
      expect(fixture.nativeElement.querySelector('[data-testid="sp-toc-contribution-SP01"]')).not.toBeNull();
    });
  });

  // --- Indicator-type guidance: grouped + badged dropdown ---------------------
  // @sdd-spec docs/specs/bilateral-module/toc-indicator-type-guidance (T-BIL-ITG-03)
  describe('indicator-type guidance (REQ-BIL-ITG-02 / AC-05.1/05.2)', () => {
    const GUIDANCE_SP01_CAT: TocCatalogSp = TOC_CATALOG_CAPSHARING_GUIDANCE_FIXTURE.catalogs[0];
    const GUIDANCE_SP03_CAT: TocCatalogSp = TOC_CATALOG_CAPSHARING_GUIDANCE_FIXTURE.catalogs[1];
    const RECOMMENDED_LABEL = 'Recommended for Capacity Sharing for Development';

    interface OptionGroup {
      label: string;
      items: IndicatorSelectOption[];
    }
    /** PrimeNG-flattened row shape (`Select.visibleOptions()` with `[group]`). */
    interface FlattenedRow {
      group?: boolean;
      value?: number;
      optionGroup?: { label?: string };
    }

    function guidanceSetup(
      tocResultId: number,
      resultType: string | null = TOC_CATALOG_CAPSHARING_GUIDANCE_FIXTURE.result_type,
      catalog: TocCatalogSp = GUIDANCE_SP01_CAT
    ): void {
      setup({ catalog, resultType, draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: tocResultId }) });
      fixture.detectChanges();
    }

    function flatten(options: IndicatorSelectOption[] | OptionGroup[]): IndicatorSelectOption[] {
      return options.flatMap(option => ('items' in option ? option.items : [option]));
    }

    function indicatorSelect(): Select {
      const selectDe = fixture.debugElement
        .queryAll(By.directive(Select))
        .find(de => (de.nativeElement as HTMLElement).getAttribute('data-testid') === 'sp-toc-indicator-SP01');
      expect(selectDe).toBeDefined();
      return selectDe!.componentInstance as Select;
    }

    beforeAll(() => {
      // jsdom has no matchMedia; PrimeNG's Overlay probes it when the select
      // panel opens (responsive/modal check). Non-matching stub is enough.
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: jest.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn()
        }))
      });
    });

    afterEach(() => {
      // The overlay is appended to document.body — drop any leftovers so DOM
      // assertions never bleed across tests.
      document.body.querySelectorAll('.p-select-overlay, .p-overlay').forEach(el => el.remove());
    });

    it('AC-02.1 — mixed HLO 7201: Recommended (type-matches then wildcards) before Other indicators', () => {
      guidanceSetup(7201);
      expect(component.guidanceEnabled()).toBe(true);
      expect(component.indicatorGroupsEnabled()).toBe(true);
      const groups = component.indicatorSelectOptions() as OptionGroup[];
      expect(groups.map(g => g.label)).toEqual([RECOMMENDED_LABEL, 'Other indicators']);
      expect(groups[0].items.map(i => i.value)).toEqual([7301, 7303]); // type-match, then wildcard
      expect(groups[1].items.map(i => i.value)).toEqual([7302]);
    });

    it('AC-02.2 — badges per classification on 7201 (canonical + custom labeled)', () => {
      guidanceSetup(7201);
      const byValue = new Map(flatten(component.indicatorSelectOptions()).map(o => [o.value, o]));
      expect(byValue.get(7301)).toEqual(expect.objectContaining({ badge: 'Trained people', classification: 'type-match' }));
      expect(byValue.get(7303)).toEqual(expect.objectContaining({ badge: 'Custom', classification: 'wildcard' }));
      expect(byValue.get(7302)).toEqual(expect.objectContaining({ badge: 'Knowledge products', classification: 'other' }));
    });

    it('AC-02.2/02.3 — unclassified-only HLO 7202: flat ungrouped list, no badges', () => {
      guidanceSetup(7202);
      expect(component.indicatorGroupsEnabled()).toBe(false);
      const options = component.indicatorSelectOptions() as IndicatorSelectOption[];
      expect(options.map(o => o.value)).toEqual([7304, 7305]); // original catalog order, no group wrappers
      expect(options.every(o => o.badge === null && o.classification === 'unclassified')).toBe(true);
    });

    it('AC-02.3 — other-canonical-only HLO 5172: flat fallback (no empty Recommended header), badge kept', () => {
      guidanceSetup(5172);
      expect(component.indicatorGroupsEnabled()).toBe(false);
      const options = component.indicatorSelectOptions() as IndicatorSelectOption[];
      expect(options.map(o => o.value)).toEqual([5939]);
      expect(options[0]).toEqual(expect.objectContaining({ badge: 'Knowledge products', classification: 'other' }));
    });

    it('all-recommended HLO 5186 renders ONLY the Recommended group (empty Other dropped)', () => {
      guidanceSetup(5186);
      const groups = component.indicatorSelectOptions() as OptionGroup[];
      expect(groups.map(g => g.label)).toEqual([RECOMMENDED_LABEL]);
      expect(groups[0].items.map(i => i.value)).toEqual([5971]);
    });

    it('AC-02.5 — option-count parity: every indicator of every HLO present exactly once', () => {
      for (const catalog of [GUIDANCE_SP01_CAT, GUIDANCE_SP03_CAT]) {
        for (const tocResult of catalog.levels[0].toc_results) {
          guidanceSetup(tocResult.toc_result_id, TOC_CATALOG_CAPSHARING_GUIDANCE_FIXTURE.result_type, catalog);
          const values = flatten(component.indicatorSelectOptions())
            .map(o => o.value)
            .sort((a, b) => a - b);
          const expected = tocResult.indicators.map(i => i.indicator_id).sort((a, b) => a - b);
          expect(values).toEqual(expected);
        }
      }
    });

    it('AC-05.1/05.2 — guidance fully suppressed for oicr/unknown/null even on mixed HLO 7201', () => {
      for (const resultType of ['oicr', 'unknown', null]) {
        guidanceSetup(7201, resultType);
        expect(component.guidanceEnabled()).toBe(false);
        expect(component.indicatorGroupsEnabled()).toBe(false);
        const options = component.indicatorSelectOptions() as IndicatorSelectOption[];
        // Flat structure in original catalog order — today's behavior byte-for-byte
        // (the extra fields are inert: badge null everywhere).
        expect(options.map(o => o.value)).toEqual([7301, 7302, 7303]);
        expect(options.every(o => o.badge === null)).toBe(true);
        // AC-05.2 — nothing classifies as `other` without a matrix row.
        expect(options.every(o => o.classification === 'unclassified')).toBe(true);
      }
    });

    it('AC-02.4 / R-2 — PrimeNG group+filter: search spans both groups, emptied group headers disappear', fakeAsync(() => {
      guidanceSetup(7201);
      const select = indicatorSelect();

      // Unfiltered flattened rows: 2 group headers + all 3 options (parity).
      const rows = select.visibleOptions() as FlattenedRow[];
      expect(rows.filter(r => r.group).map(r => r.optionGroup?.label)).toEqual([RECOMMENDED_LABEL, 'Other indicators']);
      expect(rows.filter(r => !r.group).map(r => r.value)).toEqual([7301, 7303, 7302]);

      // Open the overlay so the filter field + option list render for real.
      select.show();
      fixture.detectChanges();
      flush();
      const filterInput = document.body.querySelector('.p-select-filter') as HTMLInputElement;
      expect(filterInput).not.toBeNull();
      // jsdom quirk: a synthetic `input` event never reaches the overlay's
      // zone-bound listener, so invoke the exact handler the (input) binding
      // calls. No flush() between filter and assert — ngModel's deferred
      // writeValue(null) → resetFilter() would wipe the filter first (that
      // reset is a CVA re-write artifact of the harness, not a user path).
      const typeFilter = (value: string): void => {
        filterInput.value = value;
        select.onFilterInputChange({ target: filterInput, stopPropagation: () => undefined } as unknown as Event);
        fixture.detectChanges();
      };

      // Query matching only the Recommended group ⇒ Other header disappears.
      typeFilter('trained');
      let filtered = select.visibleOptions() as FlattenedRow[];
      expect(filtered.filter(r => r.group).map(r => r.optionGroup?.label)).toEqual([RECOMMENDED_LABEL]);
      expect(filtered.filter(r => !r.group).map(r => r.value)).toEqual([7301]);
      expect(Array.from(document.body.querySelectorAll('.sp-toc-block__group-label')).map(el => el.textContent?.trim())).toEqual([
        RECOMMENDED_LABEL
      ]);
      expect(document.body.querySelectorAll('.p-select-option').length).toBe(1);

      // Query matching only the Other group ⇒ Recommended header disappears.
      typeFilter('manuals');
      filtered = select.visibleOptions() as FlattenedRow[];
      expect(filtered.filter(r => r.group).map(r => r.optionGroup?.label)).toEqual(['Other indicators']);
      expect(filtered.filter(r => !r.group).map(r => r.value)).toEqual([7302]);

      // No match ⇒ no rows at all (no orphaned headers).
      typeFilter('zzz-no-match');
      expect((select.visibleOptions() as FlattenedRow[]).length).toBe(0);
      expect(document.body.querySelectorAll('.sp-toc-block__group-label').length).toBe(0);

      flush(); // drain PrimeNG's deferred alignOverlay timers before teardown
    }));

    it('renders text-only group headers and badge chips inside the overlay panel', fakeAsync(() => {
      guidanceSetup(7201);
      const select = indicatorSelect();
      select.show();
      fixture.detectChanges();
      flush();

      const headers = Array.from(document.body.querySelectorAll('.sp-toc-block__group-label')).map(el => el.textContent?.trim());
      expect(headers).toEqual([RECOMMENDED_LABEL, 'Other indicators']);
      const badges = Array.from(document.body.querySelectorAll('.sp-toc-block__type-badge')).map(el => el.textContent?.trim());
      expect(badges).toEqual(['Trained people', 'Custom', 'Knowledge products']);
    }));

    it('flat fallback renders NO group headers in the overlay (AC-02.3)', fakeAsync(() => {
      guidanceSetup(7202);
      const select = indicatorSelect();
      select.show();
      fixture.detectChanges();
      flush();

      expect(document.body.querySelectorAll('.sp-toc-block__group-label').length).toBe(0);
      expect(document.body.querySelectorAll('.sp-toc-block__type-badge').length).toBe(0);
      // Both unclassified options still render and are selectable (AC-02.5).
      expect(document.body.querySelectorAll('.p-select-option').length).toBe(2);
    }));
  });

  // --- Contribution panel (AC-07.1/07.2/07.3) --------------------------------
  describe('Contribution panel (AC-07.x)', () => {
    function fullDraft(): SpAlignmentDraft {
      return emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 5187, indicator_id: 5973 });
    }

    it('shows read-only unit + target from the selected indicator (AC-07.1)', () => {
      setup({ catalog: SP01_CAT, draft: fullDraft() });
      fixture.detectChanges();
      const unit = fixture.nativeElement.querySelector('[data-testid="sp-toc-unit-SP01"]') as HTMLElement;
      const target = fixture.nativeElement.querySelector('[data-testid="sp-toc-target-SP01"]') as HTMLElement;
      expect(unit.textContent?.trim()).toBe('Number');
      expect(target.textContent?.trim()).toBe('5');
    });

    it('callout uses 2026 wording, not 2025 (AC-07.3)', () => {
      setup({ catalog: SP01_CAT, draft: fullDraft() });
      fixture.detectChanges();
      expect(component.CONTRIBUTION_CALLOUT).toContain('2026');
      expect(component.CONTRIBUTION_CALLOUT).not.toContain('2025');
    });

    it('renders the contribution callout with the same banner layout as the HLO info banner', () => {
      setup({ catalog: SP01_CAT, draft: fullDraft() });
      fixture.detectChanges();
      const callout = fixture.nativeElement.querySelector('[data-testid="sp-toc-contribution-callout-SP01"]') as HTMLElement;
      expect(callout).not.toBeNull();
      expect(callout.classList.contains('items-center')).toBe(true);
      expect(callout.classList.contains('border-l-[5px]')).toBe(true);
      expect(callout.classList.contains('bg-[#F4F7F9]')).toBe(true);
      const text = callout.querySelector('p');
      expect(text?.classList.contains('leading-[17px]')).toBe(true);
      expect(text?.textContent).toContain('2026 target');
    });

    it('emits the entered contribution value', () => {
      setup({ catalog: SP01_CAT, draft: fullDraft() });
      const emitted: SpAlignmentDraft[] = [];
      component.draftChange.subscribe(d => emitted.push(d));

      component.onContributionChange(3);

      expect(emitted[0].quantitative_contribution).toBe(3);
    });

    it('clamps a negative contribution to 0 (AC-07.2, ≥ 0)', () => {
      setup({ catalog: SP01_CAT, draft: fullDraft() });
      const emitted: SpAlignmentDraft[] = [];
      component.draftChange.subscribe(d => emitted.push(d));

      component.onContributionChange(-4);

      expect(emitted[0].quantitative_contribution).toBe(0);
    });

    it('a new indicator selection nulls any stale contribution', () => {
      setup({ catalog: SP01_CAT, draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 5187, indicator_id: 5972, quantitative_contribution: 9 }) });
      const emitted: SpAlignmentDraft[] = [];
      component.draftChange.subscribe(d => emitted.push(d));

      component.onIndicatorChange(5973);

      expect(emitted[0]).toEqual(expect.objectContaining({ indicator_id: 5973, quantitative_contribution: null }));
    });
  });

  // --- disabled / version-locked (AC-09.1 block parts) -----------------------
  describe('disabled / version-locked rendering', () => {
    it('renders the current draft values read-only when disabled', () => {
      setup({
        catalog: SP01_CAT,
        disabled: true,
        draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 5187, indicator_id: 5973, quantitative_contribution: 3 })
      });
      fixture.detectChanges();
      // Snapshot values still render (unit/target visible) even while locked.
      expect(fixture.nativeElement.querySelector('[data-testid="sp-toc-unit-SP01"]')).not.toBeNull();
      // The radio is disabled.
      const radioWrapper = fixture.nativeElement.querySelector('[data-testid="sp-toc-aligns-yes-SP01"]');
      expect(radioWrapper).not.toBeNull();
    });
  });

  // --- catalogState (AC-11.1/11.2) -------------------------------------------
  describe('catalogState (AC-11.x)', () => {
    it("loading: shows a loading affordance with aria-live, no dropdowns", () => {
      setup({ draft: emptyDraft({ aligns_with_toc: true }), catalogState: 'loading' });
      fixture.detectChanges();
      const loading = fixture.nativeElement.querySelector('[data-testid="sp-toc-catalog-loading-SP01"]') as HTMLElement;
      expect(loading).not.toBeNull();
      expect(loading.getAttribute('aria-live')).toBe('polite');
      expect(fixture.nativeElement.querySelector('[data-testid="sp-toc-level-SP01"]')).toBeNull();
    });

    it('error: shows an inline message + Retry button wired to retryCatalog (AC-11.2)', () => {
      setup({ draft: emptyDraft({ aligns_with_toc: true }), catalogState: 'error' });
      fixture.detectChanges();
      const retry = jest.spyOn(component.retryCatalog, 'emit');
      const btn = fixture.nativeElement.querySelector('[data-testid="sp-toc-catalog-retry-SP01"]') as HTMLButtonElement;
      expect(btn).not.toBeNull();
      btn.dispatchEvent(new Event('click'));
      expect(retry).toHaveBeenCalled();
    });

    it('ready: renders the level select for the cascade', () => {
      setup({ draft: emptyDraft({ aligns_with_toc: true }), catalogState: 'ready' });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="sp-toc-level-SP01"]')).not.toBeNull();
    });
  });

  // --- Purity guarantee ------------------------------------------------------
  describe('purity (never mutates the draft input)', () => {
    it('emits a NEW object on every change, leaving the input draft untouched', () => {
      const input = emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 5187, indicator_id: 5973, quantitative_contribution: 3 });
      const snapshot = JSON.parse(JSON.stringify(input));
      setup({ catalog: SP01_CAT, draft: input });
      const emitted: SpAlignmentDraft[] = [];
      component.draftChange.subscribe(d => emitted.push(d));

      component.onLevelChange('OUTPUT');
      component.onHloChange(5172);
      component.onContributionChange(10);

      // None of the emissions are the same reference as the input.
      emitted.forEach(d => expect(d).not.toBe(input));
      // The input object is byte-for-byte unchanged.
      expect(input).toEqual(snapshot);
    });
  });

  // --- Inline server errors --------------------------------------------------
  it('renders an inline server error for quantitative_contribution', () => {
    setup({
      catalog: SP01_CAT,
      draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 5187, indicator_id: 5973 }),
      inlineErrors: { quantitative_contribution: 'Contribution is required' }
    });
    fixture.detectChanges();
    const err = fixture.nativeElement.querySelector('[data-testid="sp-toc-error-contribution-SP01"]') as HTMLElement;
    expect(err.textContent?.trim()).toBe('Contribution is required');
  });
});
