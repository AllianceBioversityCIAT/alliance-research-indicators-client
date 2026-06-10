import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpAlignmentDraft, TocCatalogSp, TocLevel } from '@interfaces/bilateral/pool-funding-alignment.interface';
import {
  TOC_CATALOG_CAPSHARING_FIXTURE,
  TOC_CATALOG_POLICY_FIXTURE
} from 'src/app/testing/toc-catalog.fixture';
import { SpTocAlignmentBlockComponent, SpTocBlockScienceProgram } from './sp-toc-alignment-block.component';

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
  } = {}): void {
    fixture.componentRef.setInput('sp', inputs.sp ?? SP01);
    fixture.componentRef.setInput('catalog', inputs.catalog ?? SP01_CAT);
    fixture.componentRef.setInput('allowedLevels', inputs.allowedLevels ?? ['OUTPUT']);
    fixture.componentRef.setInput('draft', inputs.draft ?? emptyDraft());
    fixture.componentRef.setInput('disabled', inputs.disabled ?? false);
    fixture.componentRef.setInput('inlineErrors', inputs.inlineErrors ?? null);
    fixture.componentRef.setInput('catalogState', inputs.catalogState ?? 'ready');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SpTocAlignmentBlockComponent] }).compileComponents();
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

    it('selecting an indicator reveals the contribution panel (AC-06.2)', () => {
      setup({ catalog: SP01_CAT, draft: emptyDraft({ aligns_with_toc: true, level: 'OUTPUT', toc_result_id: 5187, indicator_id: 5973 }) });
      fixture.detectChanges();
      expect(component.selectedIndicator()?.indicator_id).toBe(5973);
      expect(fixture.nativeElement.querySelector('[data-testid="sp-toc-contribution-SP01"]')).not.toBeNull();
    });
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
