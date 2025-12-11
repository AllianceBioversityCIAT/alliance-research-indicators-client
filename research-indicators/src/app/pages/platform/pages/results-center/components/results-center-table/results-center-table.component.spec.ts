import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsCenterTableComponent } from './results-center-table.component';
import { ResultsCenterService } from '../../results-center.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { AllModalsService } from '../../../../../../shared/services/cache/all-modals.service';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('ResultsCenterTableComponent', () => {
  let component: ResultsCenterTableComponent;
  let fixture: ComponentFixture<ResultsCenterTableComponent>;

  let mockService: any;
  let mockCache: any;
  let mockModals: any;
  let mockRouter: any;

  const mockResult = {
    result_official_code: 7,
    title: 'Title',
    indicators: { name: 'Ind' },
    result_status: { name: 'SUBMITTED', result_status_id: 6 },
    result_contracts: { contract_id: 'C-1' },
    result_levers: { lever: { short_name: 'L' } },
    report_year_id: 2024,
    snapshot_years: [2022, 2023, 2024],
    created_by_user: { first_name: 'A', last_name: 'B' },
    created_at: '2024-01-01T00:00:00Z',
    platform_code: 'ROAR'
  } as any;

  function createComponent() {
    fixture = TestBed.createComponent(ResultsCenterTableComponent);
    component = fixture.componentInstance;
    // PrimeNG Table minimal mock
    (component as any).dt2 = {
      filterGlobal: jest.fn(),
      first: 0,
      filteredValue: undefined
    } as any;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockService = {
      searchInput: signal(''),
      list: signal([mockResult]),
      loading: signal(false),
      getAllPathsAsArray: jest.fn(() => ['title']),
      getActiveFilters: jest.fn(() => [
        { label: 'INDICATOR TAB', value: 'X' },
        { label: 'PROJECT', value: 'P-1' },
        { label: 'OTHER', value: 'Y' }
      ]),
      tableColumns: signal([ { field: 'title', path: 'title', header: 'Title', getValue: (r: any) => r.title, filter: true } ]),
      countTableFiltersSelected: jest.fn(() => 1),
      countFiltersSelected: jest.fn(() => 0),
      clearAllFilters: jest.fn(),
      removeFilter: jest.fn(),
      showFiltersSidebar: signal(false),
      showConfigurationsSidebar: signal(false),
      tableRef: signal<any>(undefined)
    };

    mockCache = {
      headerHeight: signal(60),
      navbarHeight: signal(60),
      tableFiltersSidebarHeight: signal(60),
      hasSmallScreen: signal(false),
      dataCache: signal({ user: { first_name: 'John', last_name: 'Doe' } })
    };

    mockModals = {
      selectedResultForInfo: signal<any>(null),
      openModal: jest.fn(),
      // New helper used by processRowClick to avoid interfering when a modal is already open
      isAnyModalOpen: jest.fn(() => false)
    };

    mockRouter = {
      navigate: jest.fn(),
      createUrlTree: jest.fn().mockReturnValue({ toString: () => '/result/ROAR-7/general-information?version=2024' })
    };

    await TestBed.configureTestingModule({
      imports: [ResultsCenterTableComponent],
      providers: [
        { provide: ResultsCenterService, useValue: mockService },
        { provide: CacheService, useValue: mockCache },
        { provide: AllModalsService, useValue: mockModals },
        { provide: Router, useValue: mockRouter },
        provideRouter([])
      ]
    })
      .overrideComponent(ResultsCenterTableComponent, { set: { template: '' } })
      .compileComponents();

    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSearchInputChange should call table.filterGlobal when search changes', () => {
    (component as any).dt2 = { filterGlobal: jest.fn(), first: 0 } as any;
    mockService.searchInput.set('abc');
    fixture.detectChanges();
    expect((component as any).dt2.filterGlobal).toHaveBeenCalledWith('abc', 'contains');
  });

  it('setSearchInputFilter should update service searchInput', () => {
    component.setSearchInputFilter('q');
    expect(mockService.searchInput()).toBe('q');
  });

  it('getActiveFiltersExcludingIndicatorTab and shouldShowFilterMessage', () => {
    const list = component.getActiveFiltersExcludingIndicatorTab();
    expect(list.some(f => f.label === 'INDICATOR TAB')).toBe(false);
    expect(component.shouldShowFilterMessage()).toBe(true);
  });

  it('getFilterDisplayText should format PROJECT and default', () => {
    expect(component.getFilterDisplayText({ label: 'PROJECT', value: 'P-1' })).toBe('Project: P-1');
    expect(component.getFilterDisplayText({ label: 'X', value: 'Y' })).toBe('Y');
    expect(component.getFilterDisplayText({ label: 'LBL', value: '' })).toBe('LBL');
  });

  it('getScrollHeight should build calc string based on cache values', () => {
    // header 60 + navbar 60 + sidebar 60 + big-screen addition 350
    const value = component.getScrollHeight();
    expect(value.startsWith('calc(100vh - ')).toBe(true);
    expect(value.includes('px)')).toBe(true);
  });

  it('getPlatformColors should return undefined for unknown code', () => {
    const colors = component.getPlatformColors('ROAR');
    expect(colors).toBeUndefined();
  });

  it('formatResultCode should pad numbers', () => {
    expect(component.formatResultCode(7)).toBe('007');
    expect(component.formatResultCode('12')).toBe('012');
    expect(component.formatResultCode(null as unknown as any)).toBe('');
  });

  it('getStatusSeverity should map statuses', () => {
    expect(component.getStatusSeverity('SUBMITTED')).toBe('info');
    expect(component.getStatusSeverity('ACCEPTED')).toBe('success');
    expect(component.getStatusSeverity('EDITING')).toBe('warn');
    expect(component.getStatusSeverity('UNKNOWN' as any)).toBeUndefined();
  });

  it('showFiltersSidebar and showConfiguratiosnSidebar should toggle signals', () => {
    component.showFiltersSidebar();
    expect(mockService.showFiltersSidebar()).toBe(true);
    component.showConfiguratiosnSidebar();
    expect(mockService.showConfigurationsSidebar()).toBe(true);
  });

  it('openResult should open modal for PRMS and not navigate', () => {
    const prms = { ...mockResult, platform_code: 'PRMS' };
    component.openResult(prms);
    expect(mockService.clearAllFilters).toHaveBeenCalled();
    expect(mockModals.selectedResultForInfo()).toEqual(prms);
    expect(mockModals.openModal).toHaveBeenCalledWith('resultInformation');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('openResult should navigate with version for non-PRMS with snapshots', () => {
    component.openResult(mockResult);
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/result', 'ROAR-7', 'general-information'],
      { queryParams: { version: 2024 } }
    );
  });

  it('openResult should navigate without version when condition not met', () => {
    const r = { ...mockResult, result_status: { name: 'SUBMITTED', result_status_id: 1 }, snapshot_years: [] };
    component.openResult(r as any);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/result', 'ROAR-7']);
  });

  it('openResultByYear should no-op for PRMS, navigate otherwise', () => {
    component.openResultByYear(7 as any, 2020, 'PRMS');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    component.openResultByYear(7 as any, 2020, 'ROAR');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/result', 'ROAR-7'], { queryParams: { version: 2020 } });
  });

  it('getResultHref should return empty and trigger modal for PRMS', () => {
    const r = { ...mockResult, platform_code: 'PRMS' };
    const href = component.getResultHref(r as any);
    expect(href).toBe('');
    expect(mockModals.selectedResultForInfo()).toEqual(r);
  });

  it('getResultHref should use createUrlTree when snapshots present', () => {
    const href = component.getResultHref(mockResult);
    expect(mockRouter.createUrlTree).toHaveBeenCalled();
    expect(href).toContain('/result/ROAR-7/general-information');
  });

  it('getResultHref should return simple path when no snapshots/version', () => {
    const r = { ...mockResult, result_status: { name: 'SUBMITTED', result_status_id: 1 }, snapshot_years: [] };
    const href = component.getResultHref(r as any);
    expect(href).toBe('/result/ROAR-7');
  });

  it('getResultRouteArray should return correct routes based on status', () => {
    expect(component.getResultRouteArray(mockResult as any)).toEqual(['/result', 'ROAR-7', 'general-information']);
    const r = { ...mockResult, result_status: { name: 'X', result_status_id: 1 } };
    expect(component.getResultRouteArray(r as any)).toEqual(['/result', 'ROAR-7']);
  });

  it('ngAfterViewInit should set table refs and add document listener', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    component.ngAfterViewInit();
    expect(mockService.tableRef()).toBe((component as any).dt2);
    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), { capture: true });
  });

  it('ngAfterViewInit should register and remove document click listener', () => {
    const removeSpy = jest.spyOn(document, 'removeEventListener');
    component.ngAfterViewInit();
    // call the remover
    (component as any).removeDocumentClickListener?.();
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), { capture: true } as unknown as boolean);
  });

  it('onDocClickCapture should call processRowClick with target element', () => {
    const processSpy = jest.spyOn<any, any>(component as any, 'processRowClick');
    component.ngAfterViewInit();
    const el = document.createElement('div');
    document.body.appendChild(el);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(processSpy).toHaveBeenCalledWith(el, expect.any(MouseEvent));
  });

  it('processRowClick should open PRMS modal and prevent default', () => {
    const tableElement = document.createElement('div');
    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');
    const td = document.createElement('td');
    tbody.appendChild(row);
    row.appendChild(td);
    tableElement.appendChild(tbody);
    
    (component as any).dt2 = {
      first: 0,
      filteredValue: [{ ...mockResult, platform_code: 'PRMS' }],
      el: { nativeElement: tableElement }
    } as any;
    
    const prevent = jest.fn();
    const stop = jest.fn();
    (component as any).processRowClick(td, { preventDefault: prevent, stopPropagation: stop } as any);
    expect(mockModals.openModal).toHaveBeenCalledWith('resultInformation');
    expect(prevent).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  });

  it('processRowClick should early return when not inside row', () => {
    const tableElement = document.createElement('div');
    const div = document.createElement('div');
    tableElement.appendChild(div);
    (component as any).dt2 = {
      el: { nativeElement: tableElement }
    } as any;
    (component as any).processRowClick(div, { preventDefault: jest.fn(), stopPropagation: jest.fn() } as any);
    // nothing should happen
    expect(mockModals.openModal).not.toHaveBeenCalledWith('resultInformation');
  });

  it('onHostClick should delegate to processRowClick for non-PRMS and do nothing', () => {
    const tableElement = document.createElement('div');
    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');
    const td = document.createElement('td');
    tbody.appendChild(row);
    row.appendChild(td);
    tableElement.appendChild(tbody);
    (component as any).dt2 = {
      first: 0,
      filteredValue: [{ ...mockResult, platform_code: 'ROAR' }],
      el: { nativeElement: tableElement }
    } as any;
    component.onHostClick({ target: td } as any);
    expect(mockModals.openModal).not.toHaveBeenCalledWith('resultInformation');
  });

  it('exportTable should build workbook, style headers, and trigger download', async () => {
    // Mock ExcelJS
    const rows: any[] = [];
    const headers: any[] = [];
    const eachCellMocks: Array<(opts: any, cb: (cell: any, rowNum: number) => void) => void> = [];
    const getColumn = jest.fn((n: number) => ({
      header: headers[n - 1] ?? 'H',
      eachCell: (opts: any, cb: (cell: any, rowNum: number) => void) => {
        for (let i = 1; i <= rows.length + 1; i++) cb({ text: i === 1 ? 'H' : 'val' }, i);
      },
      width: 0,
      hidden: false
    }));

    const worksheet = {
      getColumn,
      columnCount: 50,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn((i: number) => ({ getCell: jest.fn(() => ({} as any)), height: 0 })),
      addRow: jest.fn((r: any) => rows.push(r)),
      columns: [] as any
    } as any;

    const workbookMock = {
      creator: '',
      created: new Date(),
      addWorksheet: jest.fn(() => worksheet),
      xlsx: { writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)) }
    } as any;

    jest.spyOn<any, any>(require('exceljs'), 'Workbook').mockImplementation(() => workbookMock);

    // Mock URL and link click
    (global as any).URL = (global as any).URL || {};
    (global as any).URL.createObjectURL = jest.fn().mockReturnValue('blob:123');
    (global as any).URL.revokeObjectURL = jest.fn();
    const clickSpy = jest.fn();
    const originalCreate = document.createElement;
    (document as any).createElement = (tagName: any) => {
      if (tagName === 'a') return { click: clickSpy } as any;
      return originalCreate.call(document, tagName);
    };

    (component as any).dt2 = { filteredValue: undefined } as any;
    mockService.list.set([mockResult]);
    await component.exportTable();

    expect(worksheet.addRow).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect((global as any).URL.revokeObjectURL).toHaveBeenCalledWith('blob:123');
    (document as any).createElement = originalCreate;
  });

  it('exportTable should use filteredValue if present', async () => {
    // reuse previous ExcelJS mock path by spying workbook again
    const worksheet = {
      getColumn: jest.fn(() => ({ header: 'H', eachCell: (_: any, cb: any) => { for (let i = 1; i <= 2; i++) cb({ text: 'x' }, i); }, width: 0, hidden: false })),
      columnCount: 10,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({} as any)), height: 0 })),
      addRow: jest.fn(),
      columns: [] as any
    } as any;
    const workbookMock = {
      creator: '',
      created: new Date(),
      addWorksheet: jest.fn(() => worksheet),
      xlsx: { writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)) }
    } as any;
    jest.spyOn<any, any>(require('exceljs'), 'Workbook').mockImplementation(() => workbookMock);
    (global as any).URL = (global as any).URL || {};
    (global as any).URL.createObjectURL = jest.fn().mockReturnValue('blob:456');
    (global as any).URL.revokeObjectURL = jest.fn();
    const clickSpy = jest.fn();
    const originalCreate = document.createElement;
    (document as any).createElement = (tagName: any) => {
      if (tagName === 'a') return { click: clickSpy } as any;
      return originalCreate.call(document, tagName);
    };

    (component as any).dt2 = { filteredValue: [mockResult] } as any;
    await component.exportTable();
    expect(worksheet.addRow).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect((global as any).URL.revokeObjectURL).toHaveBeenCalledWith('blob:456');
    (document as any).createElement = originalCreate;
  });

  it('exportTable should log error when writeBuffer throws', async () => {
    const worksheet = {
      getColumn: jest.fn(() => ({ header: 'H', eachCell: (_: any, cb: any) => { for (let i = 1; i <= 2; i++) cb({ text: 'x' }, i); }, width: 0, hidden: false })),
      columnCount: 10,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({} as any)), height: 0 })),
      addRow: jest.fn(),
      columns: [] as any
    } as any;
    const workbookMock = {
      creator: '',
      created: new Date(),
      addWorksheet: jest.fn(() => worksheet),
      xlsx: { writeBuffer: jest.fn().mockRejectedValue(new Error('boom')) }
    } as any;
    jest.spyOn<any, any>(require('exceljs'), 'Workbook').mockImplementation(() => workbookMock);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (component as any).dt2 = { filteredValue: [mockResult] } as any;
    await component.exportTable();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('getResultQueryParams should return latest year or empty object', () => {
    expect(component.getResultQueryParams(mockResult as any)).toEqual({ version: 2024 });
    const r = { ...mockResult, result_status: { name: 'SUBMITTED', result_status_id: 1 }, snapshot_years: [] };
    expect(component.getResultQueryParams(r as any)).toEqual({});
  });

  it('onResultLinkClick should open modal for PRMS', () => {
    const r = { ...mockResult, platform_code: 'PRMS' };
    component.onResultLinkClick(r as any);
    expect(mockModals.openModal).toHaveBeenCalledWith('resultInformation');
  });

  it('onSearchInputChange should ignore when table not ready', () => {
    (component as any).dt2 = undefined;
    expect(() => mockService.searchInput.set('zzz')).not.toThrow();
  });

  it('processRowClick should early return when row has no parent', () => {
    const tableElement = document.createElement('div');
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    tr.appendChild(td);
    tableElement.appendChild(tr);
    (component as any).dt2 = {
      first: 0,
      filteredValue: [mockResult],
      el: { nativeElement: tableElement }
    } as any;
    const prevent = jest.fn();
    const stop = jest.fn();
    (component as any).processRowClick(td, { preventDefault: prevent, stopPropagation: stop } as any);
    expect(mockModals.openModal).not.toHaveBeenCalledWith('resultInformation');
  });

  it('shouldShowFilterMessage should be false when only INDICATOR TAB is present', () => {
    mockService.getActiveFilters.mockReturnValue([{ label: 'INDICATOR TAB', value: 'X' }]);
    expect(component.shouldShowFilterMessage()).toBe(false);
  });

  it('exportTable should hide columns after totalColumns', async () => {
    const hiddenMap: Record<number, boolean> = {};
    const worksheet = {
      getColumn: jest.fn((i: number) => ({
        header: 'H',
        eachCell: (_: any, cb: any) => { for (let r = 1; r <= 2; r++) cb({ text: 'x' }, r); },
        width: 0,
        get hidden() { return hiddenMap[i]; },
        set hidden(v: boolean) { hiddenMap[i] = v; }
      })),
      columnCount: 15,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({} as any)), height: 0 })),
      addRow: jest.fn(),
      columns: [] as any
    } as any;
    const workbookMock = {
      creator: '',
      created: new Date(),
      addWorksheet: jest.fn(() => worksheet),
      xlsx: { writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)) }
    } as any;
    jest.spyOn<any, any>(require('exceljs'), 'Workbook').mockImplementation(() => workbookMock);
    (global as any).URL = (global as any).URL || {};
    (global as any).URL.createObjectURL = jest.fn().mockReturnValue('blob:u');
    (global as any).URL.revokeObjectURL = jest.fn();
    const originalCreate = document.createElement;
    const clickSpy = jest.fn();
    (document as any).createElement = (tagName: any) => {
      if (tagName === 'a') return { click: clickSpy } as any;
      return originalCreate.call(document, tagName);
    };

    (component as any).dt2 = { filteredValue: [mockResult] } as any;
    await component.exportTable();

    // 9 headers are expected, so column 10 should be hidden
    expect(hiddenMap[10]).toBe(true);
    (document as any).createElement = originalCreate;
  });
});


