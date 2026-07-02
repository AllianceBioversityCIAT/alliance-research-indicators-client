// @sdd-spec docs/specs/bilateral-module/center-admin-project-mapping (T-BIL-CAM-03)
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import BilateralMappingComponent from './bilateral-mapping.component';
import { BilateralMappingService } from '@services/bilateral-mapping.service';
import {
  BilateralMappingListPage,
  BilateralProjectMapping
} from '@interfaces/bilateral/bilateral-project-mapping.interface';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeRow(overrides: Partial<BilateralProjectMapping> = {}): BilateralProjectMapping {
  return {
    id: 1,
    agresso_agreement_id: 'A511',
    clarisa_project_id: 22,
    clarisa_project_short_name: 'ACIAR',
    source: 'MANUAL',
    confidence_score: null,
    is_active: true,
    notes: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-06-01T00:00:00.000Z',
    created_by: null,
    updated_by: null,
    ...overrides
  };
}

function makePage(items: BilateralProjectMapping[], total = items.length): BilateralMappingListPage {
  return {
    items,
    meta: { total, page: 1, limit: 20, totalPages: Math.ceil(total / 20) }
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function delayMs(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BilateralMappingComponent', () => {
  let fixture: ComponentFixture<BilateralMappingComponent>;
  let component: BilateralMappingComponent;
  let mockService: { list: jest.Mock };

  beforeEach(async () => {
    mockService = {
      list: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BilateralMappingComponent],
      providers: [
        { provide: BilateralMappingService, useValue: mockService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BilateralMappingComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── AC-03.1: renders table rows on successful list ─────────────────────────

  it('renders table rows on successful list response', async () => {
    const rows = [makeRow({ id: 1 }), makeRow({ id: 2, agresso_agreement_id: 'D527' })];
    mockService.list.mockResolvedValue(makePage(rows));

    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(false);
    expect(component.rows()).toHaveLength(2);

    const tableRows = fixture.nativeElement.querySelectorAll('[data-testid="mapping-row"]');
    expect(tableRows.length).toBe(2);
  });

  // ── AC-03.4: renders empty state when items is empty ──────────────────────

  it('renders the empty state when list returns an empty items array', async () => {
    mockService.list.mockResolvedValue(makePage([]));

    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    expect(component.rows()).toHaveLength(0);
    const emptyState = fixture.nativeElement.querySelector('[data-testid="empty-state"]');
    expect(emptyState).not.toBeNull();
    const table = fixture.nativeElement.querySelector('[data-testid="mappings-table"]');
    expect(table).toBeNull();
  });

  // ── AC-03.3: renders error state with Retry when list returns null ─────────

  it('renders the error state (with role="alert") when list returns null', async () => {
    mockService.list.mockResolvedValue(null);

    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    expect(component.loadError()).toBe(true);
    const errorBlock = fixture.nativeElement.querySelector('[data-testid="error-state"]');
    expect(errorBlock).not.toBeNull();
    expect(errorBlock.getAttribute('role')).toBe('alert');

    const retryBtn = fixture.nativeElement.querySelector('[data-testid="retry-button"]');
    expect(retryBtn).not.toBeNull();
  });

  it('Retry button calls load() again (AC-03.3)', async () => {
    mockService.list.mockResolvedValue(null);

    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    // Now fix the service and click Retry
    const successPage = makePage([makeRow()]);
    mockService.list.mockResolvedValue(successPage);

    const retryBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="retry-button"]');
    retryBtn.click();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    expect(component.loadError()).toBe(false);
    expect(component.rows()).toHaveLength(1);
  });

  // ── AC-04.1: search resets to page 1 and calls service.list with search ───

  it('entering a search term resets page to 1 and calls list with the search param', async () => {
    mockService.list.mockResolvedValue(makePage([makeRow()]));

    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    // Simulate being on page 2
    component.page.set(2);
    mockService.list.mockClear();

    // Trigger via the subject (bypass debounce by calling the subject directly)
    const filteredPage = makePage([makeRow({ agresso_agreement_id: 'A511' })]);
    mockService.list.mockResolvedValue(filteredPage);

    // Push directly into the subject used for debounce
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component as any).searchInput$.next('A511');
    await delayMs(350); // past the 300 ms debounce
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    expect(component.page()).toBe(1);
    const lastCall = mockService.list.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(lastCall?.['search']).toBe('A511');
  });

  // ── AC-04.2: active-state filter resets page and maps to is_active boolean ─

  it('changing active filter to "active" calls list with is_active=true and resets page', async () => {
    mockService.list.mockResolvedValue(makePage([makeRow()]));

    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    component.page.set(3);
    mockService.list.mockClear();
    mockService.list.mockResolvedValue(makePage([makeRow()]));

    component.onActiveFilterChange('active');
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    expect(component.page()).toBe(1);
    const args = mockService.list.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(args?.['is_active']).toBe(true);
  });

  it('changing active filter to "inactive" calls list with is_active=false', async () => {
    mockService.list.mockResolvedValue(makePage([makeRow()]));
    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    mockService.list.mockClear();
    mockService.list.mockResolvedValue(makePage([]));
    component.onActiveFilterChange('inactive');
    await fixture.whenStable();
    await delayMs(0);

    const args = mockService.list.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(args?.['is_active']).toBe(false);
  });

  it('changing active filter to "all" omits is_active from the query', async () => {
    mockService.list.mockResolvedValue(makePage([makeRow()]));
    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    mockService.list.mockClear();
    mockService.list.mockResolvedValue(makePage([makeRow()]));
    component.onActiveFilterChange('all');
    await fixture.whenStable();
    await delayMs(0);

    const args = mockService.list.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(args?.['is_active']).toBeUndefined();
  });

  // ── AC-04.3: source filter resets page and maps source enum ───────────────

  it('changing source filter to "MANUAL" calls list with source=MANUAL and resets page', async () => {
    mockService.list.mockResolvedValue(makePage([makeRow()]));
    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    component.page.set(5);
    mockService.list.mockClear();
    mockService.list.mockResolvedValue(makePage([makeRow()]));

    component.onSourceFilterChange('MANUAL');
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    expect(component.page()).toBe(1);
    const args = mockService.list.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(args?.['source']).toBe('MANUAL');
  });

  it('changing source filter to "AI_SUGGESTED" sends source=AI_SUGGESTED', async () => {
    mockService.list.mockResolvedValue(makePage([makeRow()]));
    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);

    mockService.list.mockClear();
    mockService.list.mockResolvedValue(makePage([]));
    component.onSourceFilterChange('AI_SUGGESTED');
    await fixture.whenStable();
    await delayMs(0);

    const args = mockService.list.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(args?.['source']).toBe('AI_SUGGESTED');
  });

  it('changing source filter to "all" omits source from the query', async () => {
    mockService.list.mockResolvedValue(makePage([makeRow()]));
    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);

    mockService.list.mockClear();
    mockService.list.mockResolvedValue(makePage([makeRow()]));
    component.onSourceFilterChange('all');
    await fixture.whenStable();
    await delayMs(0);

    const args = mockService.list.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(args?.['source']).toBeUndefined();
  });

  // ── AC-03.1: confidence column hidden when source === 'MANUAL' ─────────────

  describe('showConfidence() helper — AC-03.1', () => {
    it('returns false (hidden) when source is MANUAL', () => {
      expect(component.showConfidence(makeRow({ source: 'MANUAL' }))).toBe(false);
    });

    it('returns true (shown) when source is AI_SUGGESTED', () => {
      expect(component.showConfidence(makeRow({ source: 'AI_SUGGESTED', confidence_score: 0.85 }))).toBe(true);
    });

    it('returns true (shown) when source is AI_AUTO', () => {
      expect(component.showConfidence(makeRow({ source: 'AI_AUTO', confidence_score: 0.92 }))).toBe(true);
    });
  });

  // ── DOM: confidence cell hidden when source === MANUAL ────────────────────

  it('renders "—" in confidence cell (not the score) for MANUAL rows in the table', async () => {
    const manualRow = makeRow({ source: 'MANUAL', confidence_score: 0.99 });
    mockService.list.mockResolvedValue(makePage([manualRow]));

    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    // The confidence-hidden element should be present, confidence-value absent
    const hidden = fixture.nativeElement.querySelector('[data-testid="confidence-hidden"]');
    const shown = fixture.nativeElement.querySelector('[data-testid="confidence-value"]');
    expect(hidden).not.toBeNull();
    expect(shown).toBeNull();
  });

  it('renders the confidence value for AI_SUGGESTED rows in the table', async () => {
    const aiRow = makeRow({ source: 'AI_SUGGESTED', confidence_score: 0.75 });
    mockService.list.mockResolvedValue(makePage([aiRow]));

    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    const shown = fixture.nativeElement.querySelector('[data-testid="confidence-value"]');
    const hidden = fixture.nativeElement.querySelector('[data-testid="confidence-hidden"]');
    expect(shown).not.toBeNull();
    expect(hidden).toBeNull();
  });

  // ── NF-06: loading signal resets to false on both success and failure ──────

  it('loading returns to false after a successful list call', async () => {
    mockService.list.mockResolvedValue(makePage([makeRow()]));
    fixture.detectChanges(); // triggers ngOnInit → load()
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
  });

  it('loading returns to false after a failed list call', async () => {
    mockService.list.mockResolvedValue(null);
    fixture.detectChanges();
    await fixture.whenStable();
    await delayMs(0);
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(true);
  });

  // ── sourceLabel() helper ───────────────────────────────────────────────────

  it('sourceLabel returns human-readable labels for all enum values', () => {
    expect(component.sourceLabel('MANUAL')).toBe('Manual');
    expect(component.sourceLabel('AI_SUGGESTED')).toBe('AI Suggested');
    expect(component.sourceLabel('AI_AUTO')).toBe('AI Auto');
  });
});
