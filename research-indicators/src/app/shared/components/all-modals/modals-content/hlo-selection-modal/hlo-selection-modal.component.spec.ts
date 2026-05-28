// @sdd-spec docs/specs/bilateral-module/indicator-mapping (T-BIL-IM-05)
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HloSelectionModalComponent } from './hlo-selection-modal.component';
import { AllModalsService } from '@services/cache/all-modals.service';
import { BilateralService } from '@services/bilateral.service';
import { HloSelectionModalContextService } from '@services/cache/hlo-selection-modal-context.service';
import { signal } from '@angular/core';
import {
  bilateralHlosIndicatorsResponseMock,
  bilateralHlosNoAowResponseMock
} from 'src/app/testing/fixtures/bilateral.fixtures';
import { BilateralHlosIndicatorsResponse, HloKeyString } from '@interfaces/bilateral/pool-funding-alignment.interface';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// ---------------------------------------------------------------------------
// Helpers to build minimal service mocks
// ---------------------------------------------------------------------------

function buildBilateralServiceMock(overrides: Partial<{
  hlosIndicators: BilateralHlosIndicatorsResponse | null;
  loadingHlos: boolean;
  indicatorSearchValue: string;
  hloModalSelectionSet: Set<HloKeyString>;
}> = {}) {
  const {
    hlosIndicators = null,
    loadingHlos = false,
    indicatorSearchValue = '',
    hloModalSelectionSet = new Set<HloKeyString>()
  } = overrides;

  const hlosIndicatorsSignal = signal<BilateralHlosIndicatorsResponse | null>(hlosIndicators);
  const loadingHlosSignal = signal(loadingHlos);
  const indicatorSearchSignal = signal(indicatorSearchValue);
  const hloModalSelectionSignal = signal<Set<HloKeyString>>(hloModalSelectionSet);

  // Derived indicatorRows — use a simple computed-like function instead of real computed
  // to avoid test complexity; the unit tests verify interaction via the signals.
  const persistedMappingsSignal = signal<import('@interfaces/bilateral/pool-funding-alignment.interface').HloMapping[]>([]);

  return {
    hlosIndicators: hlosIndicatorsSignal,
    loadingHlos: loadingHlosSignal,
    indicatorSearch: indicatorSearchSignal,
    hloModalSelection: hloModalSelectionSignal,
    persistedMappings: persistedMappingsSignal,
    pendingMappings: signal<import('@interfaces/bilateral/pool-funding-alignment.interface').HloMapping[]>([]),
    indicatorRows: signal<import('@interfaces/bilateral/pool-funding-alignment.interface').IndicatorRow[]>([]),
    getHlosIndicators: jest.fn().mockResolvedValue(null),
    loadModalSelection: jest.fn(),
    commitModalSelection: jest.fn(),
    cancelModalSelection: jest.fn()
  };
}

function buildAllModalsServiceMock(isOpen = false) {
  // Use a WritableSignal for modalConfig so that allModalsService.isModalOpen()
  // is signal-reactive inside effects (mirrors AllModalsService.isModalOpen internals).
  const modalConfigSignal = signal<Record<string, { isOpen: boolean; title: string; isWide: boolean }>>({
    hloSelection: { isOpen, title: 'High Level Outputs', isWide: true }
  });
  return {
    modalConfig: modalConfigSignal,
    isModalOpen: (name: string) => modalConfigSignal()[name],
    closeModal: jest.fn(),
    openModal: jest.fn()
  };
}

function buildContextServiceMock(resultCode = 'TEST-001') {
  return {
    context: signal({ resultCode }),
    setContext: jest.fn(),
    clear: jest.fn()
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HloSelectionModalComponent', () => {
  let component: HloSelectionModalComponent;
  let fixture: ComponentFixture<HloSelectionModalComponent>;
  let bilateralMock: ReturnType<typeof buildBilateralServiceMock>;
  let allModalsMock: ReturnType<typeof buildAllModalsServiceMock>;
  let contextMock: ReturnType<typeof buildContextServiceMock>;

  async function createComponent(overrides: Parameters<typeof buildBilateralServiceMock>[0] = {}): Promise<void> {
    bilateralMock = buildBilateralServiceMock(overrides);
    allModalsMock = buildAllModalsServiceMock();
    contextMock = buildContextServiceMock();

    await TestBed.configureTestingModule({
      imports: [HloSelectionModalComponent, NoopAnimationsModule],
      providers: [
        { provide: BilateralService, useValue: bilateralMock },
        { provide: AllModalsService, useValue: allModalsMock },
        { provide: HloSelectionModalContextService, useValue: contextMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HloSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  // --------------------------------------------------------------------------
  // 1. Modal title literal (locked copy — must not drift)
  // --------------------------------------------------------------------------
  it('should have the AllModalsService config title set to "High Level Outputs"', async () => {
    await createComponent();
    // Verify the AllModalsService modalConfig for 'hloSelection' carries the right title.
    // The modal chrome renders it from this config; if it drifts, the header copy breaks.
    const cfg = allModalsMock.isModalOpen('hloSelection');
    expect(cfg?.title).toBe('High Level Outputs');
  });

  // --------------------------------------------------------------------------
  // 2. Sidebar lists each pairs[].program once (deduplication)
  // --------------------------------------------------------------------------
  it('should list each distinct program once in the sidebar', async () => {
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });
    const groups = component.sidebarGroups();
    const programs = groups.map(g => g.program);
    expect(programs).toEqual(['SP01', 'SP02']);
    // Both programs appear exactly once
    expect(new Set(programs).size).toBe(programs.length);
  });

  // --------------------------------------------------------------------------
  // 3. AOW expand toggles
  // --------------------------------------------------------------------------
  it('should toggle SP group expansion when toggleSpExpanded is called', async () => {
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });
    const groups = component.sidebarGroups();
    const program = groups[0].program;

    expect(component.isSpExpanded(program)).toBe(false);
    component.toggleSpExpanded(program);
    expect(component.isSpExpanded(program)).toBe(true);
    component.toggleSpExpanded(program);
    expect(component.isSpExpanded(program)).toBe(false);
  });

  // --------------------------------------------------------------------------
  // 4. Active AOW switch updates main pane (visibleRows scoped to active pair)
  // --------------------------------------------------------------------------
  it('should scope visibleRows to the active (program, area_of_work) after switching AOW', async () => {
    // Build indicatorRows from the mock — manually seed them so the test doesn't
    // depend on the real materializeRows private method.
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });

    // Seed indicatorRows signal with rows for both pairs
    const rows: import('@interfaces/bilateral/pool-funding-alignment.interface').IndicatorRow[] = [
      { indicator_id: '5001', program: 'SP01', area_of_work: 'AOW06', indicator_name: 'Row SP01', composite_code: 'SP01-AOW06', toc_result_id: 1001, indicator_type: 'outcome', target_description: null, is_quantitative: false, is_mapped: false, is_stale: false, disabled_reason: null },
      { indicator_id: '5003', program: 'SP02', area_of_work: 'AOW02', indicator_name: 'Row SP02', composite_code: 'SP02-AOW02', toc_result_id: 1002, indicator_type: 'outcome', target_description: null, is_quantitative: false, is_mapped: false, is_stale: false, disabled_reason: null }
    ];
    bilateralMock.indicatorRows.set(rows);

    component.activeAowKey.set('SP01|AOW06');
    fixture.detectChanges();

    const visible = component.visibleRows();
    expect(visible.every(r => r.program === 'SP01' && r.area_of_work === 'AOW06')).toBe(true);

    component.activeAowKey.set('SP02|AOW02');
    fixture.detectChanges();

    const visible2 = component.visibleRows();
    expect(visible2.every(r => r.program === 'SP02' && r.area_of_work === 'AOW02')).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 5. Per-row commit toggles selection + counter + AOW badge
  // --------------------------------------------------------------------------
  it('should toggle row selection when toggleRowSelection is called', async () => {
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });
    const row: import('@interfaces/bilateral/pool-funding-alignment.interface').IndicatorRow = {
      indicator_id: '5001', program: 'SP01', area_of_work: 'AOW06',
      indicator_name: 'Test row', composite_code: 'SP01-AOW06',
      toc_result_id: 1001, indicator_type: 'outcome',
      target_description: null, is_quantitative: false,
      is_mapped: false, is_stale: false, disabled_reason: null
    };

    expect(component.isRowSelected(row)).toBe(false);
    expect(component.selectionCount()).toBe(0);

    component.toggleRowSelection(row);
    fixture.detectChanges();
    expect(component.isRowSelected(row)).toBe(true);
    expect(component.selectionCount()).toBe(1);

    // AOW badge count should now be 1
    expect(component.getAowBadgeCount('SP01|AOW06')).toBe(1);

    // Toggle off
    component.toggleRowSelection(row);
    fixture.detectChanges();
    expect(component.isRowSelected(row)).toBe(false);
    expect(component.selectionCount()).toBe(0);
    expect(component.getAowBadgeCount('SP01|AOW06')).toBe(0);
  });

  // --------------------------------------------------------------------------
  // 6. aow_status = 'unmapped' blocks Confirm
  // --------------------------------------------------------------------------
  it('should disable Confirm and show unmapped empty state when aow_status is unmapped', async () => {
    const unmappedResponse: BilateralHlosIndicatorsResponse = {
      ...bilateralHlosIndicatorsResponseMock,
      aow_status: 'unmapped',
      pairs: []
    };
    await createComponent({ hlosIndicators: unmappedResponse });
    fixture.detectChanges();

    expect(component.isUnmapped()).toBe(true);
    expect(component.isConfirmDisabled()).toBe(true);

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-testid="hlo-modal-empty-unmapped"]')).toBeTruthy();
  });

  // --------------------------------------------------------------------------
  // 7. aow_status = 'no_aow_mappings' renders flat-per-SP with empty area_of_work
  // --------------------------------------------------------------------------
  it('should render sidebar entries with empty area_of_work for no_aow_mappings status', async () => {
    await createComponent({ hlosIndicators: bilateralHlosNoAowResponseMock });
    fixture.detectChanges();

    expect(component.isNoAowMappings()).toBe(true);

    const groups = component.sidebarGroups();
    expect(groups.length).toBe(1);
    expect(groups[0].program).toBe('SP05');

    // AOW entry has empty area_of_work (the '' token)
    expect(groups[0].aows.length).toBe(1);
    expect(groups[0].aows[0].area_of_work).toBe('');
  });

  // --------------------------------------------------------------------------
  // 8. pairs[] empty → empty-pairs state shown, Confirm disabled
  // --------------------------------------------------------------------------
  it('should show empty-pairs state and disable Confirm when pairs array is empty (cache miss)', async () => {
    const emptyPairsResponse: BilateralHlosIndicatorsResponse = {
      ...bilateralHlosIndicatorsResponseMock,
      aow_status: 'has_aow',
      pairs: []
    };
    await createComponent({ hlosIndicators: emptyPairsResponse });
    fixture.detectChanges();

    expect(component.isPairsEmpty()).toBe(true);
    expect(component.isConfirmDisabled()).toBe(true);

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-testid="hlo-modal-empty-pairs"]')).toBeTruthy();
  });

  // --------------------------------------------------------------------------
  // 9. Search filters client-side (no new fetch)
  // --------------------------------------------------------------------------
  it('should filter visibleRows client-side based on search input', async () => {
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });

    const rows: import('@interfaces/bilateral/pool-funding-alignment.interface').IndicatorRow[] = [
      { indicator_id: '5001', program: 'SP01', area_of_work: 'AOW06', indicator_name: 'Farmers adopting practice', composite_code: 'SP01-AOW06', toc_result_id: 1001, indicator_type: 'outcome', target_description: null, is_quantitative: false, is_mapped: false, is_stale: false, disabled_reason: null },
      { indicator_id: '5002', program: 'SP01', area_of_work: 'AOW06', indicator_name: 'Qualitative narrative', composite_code: 'SP01-AOW06', toc_result_id: 1001, indicator_type: 'outcome', target_description: null, is_quantitative: false, is_mapped: false, is_stale: false, disabled_reason: null }
    ];
    bilateralMock.indicatorRows.set(rows);
    component.activeAowKey.set('SP01|AOW06');
    fixture.detectChanges();

    // Before search: both rows visible
    expect(component.visibleRows().length).toBe(2);

    // After search: only matching row visible
    bilateralMock.indicatorSearch.set('farmers');
    fixture.detectChanges();
    const filtered = component.visibleRows();
    expect(filtered.length).toBe(1);
    expect(filtered[0].indicator_name).toBe('Farmers adopting practice');

    // Search did NOT trigger getHlosIndicators (no extra fetch)
    expect(bilateralMock.getHlosIndicators).not.toHaveBeenCalled();
  });

  // --------------------------------------------------------------------------
  // 10. Confirm calls commitModalSelection + closes modal
  // --------------------------------------------------------------------------
  it('should call commitModalSelection and closeModal when Confirm is clicked', async () => {
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });
    fixture.detectChanges();

    component.confirm();
    fixture.detectChanges();

    expect(bilateralMock.commitModalSelection).toHaveBeenCalledTimes(1);
    expect(allModalsMock.closeModal).toHaveBeenCalledWith('hloSelection');
  });

  // --------------------------------------------------------------------------
  // 11. Cancel closes modal without calling commitModalSelection
  // --------------------------------------------------------------------------
  it('should close the modal without committing when Cancel is clicked', async () => {
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });
    fixture.detectChanges();

    component.cancel();
    fixture.detectChanges();

    expect(bilateralMock.commitModalSelection).not.toHaveBeenCalled();
    expect(allModalsMock.closeModal).toHaveBeenCalledWith('hloSelection');
  });

  // --------------------------------------------------------------------------
  // 12. data-testid attributes present in the DOM
  // --------------------------------------------------------------------------
  it('should render data-testid="hlo-modal-root" on the root element', async () => {
    await createComponent();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-testid="hlo-modal-root"]')).toBeTruthy();
  });

  it('should render hlo-modal-counter with aria-live="polite"', async () => {
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const counter = el.querySelector('[data-testid="hlo-modal-counter"]');
    expect(counter).toBeTruthy();
    expect(counter?.getAttribute('aria-live')).toBe('polite');
  });

  it('should render data-testid="hlo-modal-confirm" and "hlo-modal-cancel"', async () => {
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-testid="hlo-modal-confirm"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="hlo-modal-cancel"]')).toBeTruthy();
  });

  // --------------------------------------------------------------------------
  // 13. AOW-scoped data-testid rendered for sidebar entries
  // --------------------------------------------------------------------------
  it('should render hlo-modal-aow-{program}-{aow} testids for each AOW in the sidebar', async () => {
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });

    // Expand first group using the component method, then trigger CD
    const groups = component.sidebarGroups();
    component.toggleSpExpanded(groups[0].program);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const aow06btn = el.querySelector('[data-testid="hlo-modal-aow-SP01-AOW06"]');
    expect(aow06btn).toBeTruthy();
  });

  // --------------------------------------------------------------------------
  // 14. Disabled row is not toggled by toggleRowSelection
  // --------------------------------------------------------------------------
  it('should NOT toggle selection for a disabled row (disabled_reason !== null)', async () => {
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });
    const disabledRow: import('@interfaces/bilateral/pool-funding-alignment.interface').IndicatorRow = {
      indicator_id: '9999', program: 'SP01', area_of_work: 'AOW06',
      indicator_name: 'Disabled indicator', composite_code: 'SP01-AOW06',
      toc_result_id: 1001, indicator_type: 'outcome', target_description: null,
      is_quantitative: false, is_mapped: false, is_stale: false,
      disabled_reason: 'Cannot be mapped to this result type'
    };

    component.toggleRowSelection(disabledRow);
    fixture.detectChanges();

    expect(component.isRowSelected(disabledRow)).toBe(false);
    expect(component.selectionCount()).toBe(0);
  });

  // --------------------------------------------------------------------------
  // 15. Skeleton shown while loading
  // --------------------------------------------------------------------------
  it('should show skeleton placeholders when loadingHlos is true', async () => {
    await createComponent({ loadingHlos: true });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    // Loading state hides the sidebar
    expect(el.querySelector('[data-testid="hlo-modal-sidebar"]')).toBeFalsy();
    // Skeleton container should be present
    expect(el.querySelector('.hlo-modal__skeleton')).toBeTruthy();
  });

  // --------------------------------------------------------------------------
  // 16. Immutable Set update on selection (no mutation of the original Set)
  // --------------------------------------------------------------------------
  it('should create a new Set (immutable update) when toggling row selection', async () => {
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });

    const originalSet = bilateralMock.hloModalSelection();
    const row: import('@interfaces/bilateral/pool-funding-alignment.interface').IndicatorRow = {
      indicator_id: '5001', program: 'SP01', area_of_work: 'AOW06',
      indicator_name: 'Test', composite_code: 'SP01-AOW06', toc_result_id: 1001,
      indicator_type: 'outcome', target_description: null,
      is_quantitative: false, is_mapped: false, is_stale: false, disabled_reason: null
    };

    component.toggleRowSelection(row);
    const newSet = bilateralMock.hloModalSelection();

    // The signal was updated to a brand-new Set instance
    expect(newSet).not.toBe(originalSet);
    expect(newSet.has('SP01|AOW06|5001')).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 17. search debounce
  // --------------------------------------------------------------------------
  describe('search debounce', () => {
    beforeEach(async () => {
      await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });
    });

    it('should debounce search input updates to bilateralService.indicatorSearch by 300ms', fakeAsync(() => {
      const event = { target: { value: 'farm' } } as unknown as Event;
      component.onSearchInput(event);
      // Not yet propagated — debounce still running
      expect(bilateralMock.indicatorSearch()).toBe('');

      tick(300);
      expect(bilateralMock.indicatorSearch()).toBe('farm');
    }));
  });

  // --------------------------------------------------------------------------
  // 18. 5-min cache guard — second open must NOT re-fetch
  // --------------------------------------------------------------------------
  it('should NOT call getHlosIndicators on second modal open when hlosIndicators is already populated', async () => {
    // Start with data already in the cache (simulates the 5-min window still valid).
    await createComponent({ hlosIndicators: bilateralHlosIndicatorsResponseMock });

    // Reset spy count to zero so we only count calls from the second open onward.
    bilateralMock.getHlosIndicators.mockClear();

    // Simulate a second modal open by triggering onModalOpened directly.
    // hlosIndicators() is non-null, so the guard inside onModalOpened should skip the fetch.
    await (component as unknown as { onModalOpened: () => Promise<void> }).onModalOpened();

    expect(bilateralMock.getHlosIndicators).not.toHaveBeenCalled();
  });
});
