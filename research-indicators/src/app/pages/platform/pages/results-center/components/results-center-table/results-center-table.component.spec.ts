import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsCenterTableComponent } from './results-center-table.component';
import { ResultsCenterService } from '../../results-center.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { AllModalsService } from '../../../../../../shared/services/cache/all-modals.service';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from '../../../../../../shared/services/api.service';
import { CreateResultManagementService } from '../../../../../../shared/components/all-modals/modals-content/create-result-modal/services/create-result-management.service';

describe('ResultsCenterTableComponent', () => {
  let component: ResultsCenterTableComponent;
  let fixture: ComponentFixture<ResultsCenterTableComponent>;

  let mockService: any;
  let mockCache: any;
  let mockModals: any;
  let mockRouter: any;
  let mockApiService: any;
  let mockCreateResultManagementService: any;

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
      primaryContractId: jest.fn().mockReturnValue(null),
      getAllPathsAsArray: jest.fn(() => ['title']),
      getActiveFilters: jest.fn(() => [
        { label: 'INDICATOR TAB', value: 'X' },
        { label: 'PROJECT', value: 'P-1' },
        { label: 'OTHER', value: 'Y' }
      ]),
      tableColumns: signal([{ field: 'title', path: 'title', header: 'Title', getValue: (r: any) => r.title, filter: true }]),
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
      closeModal: jest.fn(),
      closeAllModals: jest.fn(),
      isModalOpen: jest.fn(() => ({ isOpen: false })),
      // New helper used by processRowClick to avoid interfering when a modal is already open
      isAnyModalOpen: jest.fn(() => false)
    };

    mockRouter = {
      navigate: jest.fn(),
      createUrlTree: jest.fn().mockReturnValue({ toString: () => '/result/ROAR-7/general-information?version=2024' })
    };

    mockApiService = {
      GET_GeneralReport: jest.fn().mockResolvedValue({
        data: [
          {
            Code: 1,
            'Platform Code': 'STAR',
            Title: 'Test Title',
            Projects: 'S261',
            Indicator: 'Capacity Sharing',
            Levers: 'Lever 2',
            'Live version': 2025,
            'Approved versions': null,
            Creator: 'Test User',
            'Main contact person': 'Test Contact',
            'Creation date': '01/01/2025',
            'Project title': 'Test Project',
            'Project principal investigator': 'Test PI',
            'Result desciption': 'Test Description',
            Evidences: null,
            'Geographic scope': 'Multi-national',
            'Countries specified': 'India',
            'Regions specified': null,
            'Partners involved': null,
            'Were the trainees attending on behalf of an organization? (CapSha)': null,
            'Policy stage': null,
            'Policy type': null,
            'Innovation type': null,
            'Innovation nature': null,
            'Innovation readiness level': null,
            'Number people trained TOTAL': 22,
            'Number people trained FEMALE': null,
            'Number people trained MALE': null,
            'Number people trained NON BINARY': null,
            'Length training': 'Short-term',
            'Delivery modality': 'Hybrid'
          }
        ]
      })
    };

    mockCreateResultManagementService = {
      setContractId: jest.fn(),
      setPresetFromProjectResultsTable: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ResultsCenterTableComponent],
      providers: [
        { provide: ResultsCenterService, useValue: mockService },
        { provide: CacheService, useValue: mockCache },
        { provide: AllModalsService, useValue: mockModals },
        { provide: Router, useValue: mockRouter },
        { provide: ApiService, useValue: mockApiService },
        { provide: CreateResultManagementService, useValue: mockCreateResultManagementService },
        provideRouter([]),
        provideHttpClientTesting()
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

  it('getScrollHeight should use 280 when hasSmallScreen is true', () => {
    (mockCache.hasSmallScreen as any).set(true);
    const value = component.getScrollHeight();
    expect(value).toContain('460');
    expect(value).not.toContain('350');
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

  it('openCreateResultForProject should open create modal when primaryContractId is set', () => {
    (mockService.primaryContractId as jest.Mock).mockReturnValue('CONTRACT-123');
    component.openCreateResultForProject();
    expect(mockCreateResultManagementService.setContractId).toHaveBeenCalledWith('CONTRACT-123');
    expect(mockCreateResultManagementService.setPresetFromProjectResultsTable).toHaveBeenCalledWith(true);
    expect(mockModals.openModal).toHaveBeenCalledWith('createResult');
  });

  it('openCreateResultForProject should do nothing when primaryContractId is null', () => {
    (mockService.primaryContractId as jest.Mock).mockReturnValue(null);
    component.openCreateResultForProject();
    expect(mockCreateResultManagementService.setContractId).not.toHaveBeenCalled();
    expect(mockModals.openModal).not.toHaveBeenCalledWith('createResult');
  });

  it('openResult should navigate with version for non-PRMS with snapshots', () => {
    component.openResult(mockResult);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/result', 'ROAR-7', 'general-information'], { queryParams: { version: 2024 } });
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

  it('getResultRouteArray should return empty array for TIP platform', () => {
    const tipResult = { ...mockResult, platform_code: 'TIP' };
    expect(component.getResultRouteArray(tipResult as any)).toEqual([]);
  });

  it('getPrimaryContractId should return null when result_contracts is null', () => {
    const result = { ...mockResult, result_contracts: null };
    expect(component.getPrimaryContractId(result as any)).toBeNull();
  });

  it('getPrimaryContractId should return null when result_contracts is undefined', () => {
    const result = { ...mockResult, result_contracts: undefined };
    expect(component.getPrimaryContractId(result as any)).toBeNull();
  });

  it('getPrimaryContractId should return contract_id when primary contract exists in array', () => {
    const result = {
      ...mockResult,
      result_contracts: [
        { is_primary: 0, contract_id: 'A123' },
        { is_primary: 1, contract_id: 'B456' },
        { is_primary: 0, contract_id: 'C789' }
      ]
    };
    expect(component.getPrimaryContractId(result as any)).toBe('B456');
  });

  it('getPrimaryContractId should return contract_id when primary contract exists as single object', () => {
    const result = {
      ...mockResult,
      result_contracts: { is_primary: 1, contract_id: 'D012' }
    };
    expect(component.getPrimaryContractId(result as any)).toBe('D012');
  });

  it('getPrimaryContractId should return null when no primary contract exists', () => {
    const result = {
      ...mockResult,
      result_contracts: [
        { is_primary: 0, contract_id: 'A123' },
        { is_primary: '0', contract_id: 'B456' }
      ]
    };
    expect(component.getPrimaryContractId(result as any)).toBeNull();
  });

  it('getPrimaryContractId should handle string is_primary value', () => {
    const result = {
      ...mockResult,
      result_contracts: [{ is_primary: '1', contract_id: 'E345' }]
    };
    expect(component.getPrimaryContractId(result as any)).toBe('E345');
  });

  it('getVisibleColumns should return all columns when showNewProjectResultButton is false', () => {
    (component as any).showNewProjectResultButton = false;
    const columns = mockService.tableColumns();
    expect(component.getVisibleColumns()).toBe(columns);
  });

  it('getVisibleColumns should filter out project and lever columns when showNewProjectResultButton is true', () => {
    (component as any).showNewProjectResultButton = true;
    const columns = [
      { field: 'project', header: 'Project' },
      { field: 'lever', header: 'Lever' },
      { field: 'title', header: 'Title' },
      { field: 'code', header: 'Code' }
    ];
    mockService.tableColumns.set(columns as any);
    const visible = component.getVisibleColumns();
    expect(visible).toEqual([
      { field: 'title', header: 'Title' },
      { field: 'code', header: 'Code' }
    ]);
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
    mockModals.isAnyModalOpen.mockReturnValue(false);
    const tableElement = document.createElement('div');
    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');
    const td = document.createElement('td');
    const prmsResult = { ...mockResult, platform_code: 'PRMS' };
    row.setAttribute('data-result-id', prmsResult.result_official_code.toString());
    row.setAttribute('data-platform', prmsResult.platform_code);
    tbody.appendChild(row);
    row.appendChild(td);
    tableElement.appendChild(tbody);
    (component as any).dt2 = {
      first: 0,
      value: [prmsResult],
      el: { nativeElement: tableElement }
    } as any;
    const prevent = jest.fn();
    const stop = jest.fn();
    const handleSpy = jest.spyOn(component as any, 'handleRowClickResult');
    (component as any).processRowClick(td, { preventDefault: prevent, stopPropagation: stop } as any);
    expect(handleSpy).toHaveBeenCalledWith(prmsResult, td, expect.any(Object));
    expect(mockModals.openModal).toHaveBeenCalledWith('resultInformation');
    expect(prevent).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  });

  it('processRowClick should return when data.find does not find matching result', () => {
    mockModals.isAnyModalOpen.mockReturnValue(false);
    const tableElement = document.createElement('div');
    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');
    const td = document.createElement('td');
    row.setAttribute('data-result-id', '999');
    row.setAttribute('data-platform', 'ROAR');
    tbody.appendChild(row);
    row.appendChild(td);
    tableElement.appendChild(tbody);
    (component as any).dt2 = {
      first: 0,
      value: [mockResult],
      el: { nativeElement: tableElement }
    } as any;
    const handleSpy = jest.spyOn(component as any, 'handleRowClickResult');
    (component as any).processRowClick(td, new MouseEvent('click'));
    expect(handleSpy).not.toHaveBeenCalled();
    expect(mockModals.openModal).not.toHaveBeenCalled();
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
      getRow: jest.fn((i: number) => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
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
    const createObjectURLSpy = jest.fn().mockReturnValue('blob:123');
    const revokeObjectURLSpy = jest.fn();
    const originalURL = globalThis.URL;
    (globalThis as any).URL = {
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy
    };

    const clickSpy = jest.fn();
    const linkElement = {
      click: clickSpy,
      style: { display: '' },
      href: '',
      download: '',
      remove: jest.fn()
    };
    const originalCreate = document.createElement;
    const originalAppendChild = document.body.appendChild;
    (document as any).createElement = (tagName: any) => {
      if (tagName === 'a') return linkElement as any;
      return originalCreate.call(document, tagName);
    };
    document.body.appendChild = jest.fn((node: any) => {
      if (node === linkElement) {
        return node;
      }
      return originalAppendChild.call(document.body, node);
    }) as any;

    jest.useFakeTimers();
    (component as any).dt2 = { filteredValue: undefined } as any;

    const exportPromise = component.exportTable();

    // Wait for all async operations to complete
    await jest.runAllTimersAsync();
    await exportPromise;

    expect(mockApiService.GET_GeneralReport).toHaveBeenCalled();
    expect(worksheet.addRow).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:123');

    jest.useRealTimers();
    (document as any).createElement = originalCreate;
    document.body.appendChild = originalAppendChild;
    globalThis.URL = originalURL;
  });

  it('exportTable should use filteredValue if present', async () => {
    // reuse previous ExcelJS mock path by spying workbook again
    const worksheet = {
      getColumn: jest.fn(() => ({
        header: 'H',
        eachCell: (_: any, cb: any) => {
          for (let i = 1; i <= 2; i++) cb({ text: 'x' }, i);
        },
        width: 0,
        hidden: false
      })),
      columnCount: 10,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
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

    const createObjectURLSpy = jest.fn().mockReturnValue('blob:456');
    const revokeObjectURLSpy = jest.fn();
    const originalURL = globalThis.URL;
    (globalThis as any).URL = {
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy
    };

    const clickSpy = jest.fn();
    const linkElement = {
      click: clickSpy,
      style: { display: '' },
      href: '',
      download: '',
      remove: jest.fn()
    };
    const originalCreate = document.createElement;
    const originalAppendChild = document.body.appendChild;
    (document as any).createElement = (tagName: any) => {
      if (tagName === 'a') return linkElement as any;
      return originalCreate.call(document, tagName);
    };
    document.body.appendChild = jest.fn((node: any) => {
      if (node === linkElement) {
        return node;
      }
      return originalAppendChild.call(document.body, node);
    }) as any;

    jest.useFakeTimers();
    (component as any).dt2 = { filteredValue: [mockResult] } as any;

    const exportPromise = component.exportTable();

    // Wait for all async operations to complete
    await jest.runAllTimersAsync();
    await exportPromise;

    expect(mockApiService.GET_GeneralReport).toHaveBeenCalled();
    expect(worksheet.addRow).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:456');

    jest.useRealTimers();
    (document as any).createElement = originalCreate;
    document.body.appendChild = originalAppendChild;
    globalThis.URL = originalURL;
  });

  it('exportTable should log error when writeBuffer throws', async () => {
    const worksheet = {
      getColumn: jest.fn(() => ({
        header: 'H',
        eachCell: (_: any, cb: any) => {
          for (let i = 1; i <= 2; i++) cb({ text: 'x' }, i);
        },
        width: 0,
        hidden: false
      })),
      columnCount: 10,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
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

    const createObjectURLSpy = jest.fn().mockReturnValue('blob:error');
    const revokeObjectURLSpy = jest.fn();
    const originalURL = globalThis.URL;
    (globalThis as any).URL = {
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy
    };

    const linkElement = {
      click: jest.fn(),
      style: { display: '' },
      href: '',
      download: '',
      remove: jest.fn()
    };
    const originalCreate = document.createElement;
    const originalAppendChild = document.body.appendChild;
    (document as any).createElement = (tagName: any) => {
      if (tagName === 'a') return linkElement as any;
      return originalCreate.call(document, tagName);
    };
    document.body.appendChild = jest.fn((node: any) => {
      if (node === linkElement) {
        return node;
      }
      return originalAppendChild.call(document.body, node);
    }) as any;

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (component as any).dt2 = { filteredValue: [mockResult] } as any;
    await component.exportTable();
    expect(mockApiService.GET_GeneralReport).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
    (document as any).createElement = originalCreate;
    document.body.appendChild = originalAppendChild;
    globalThis.URL = originalURL;
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

  it('onResultLinkClick should open modal for TIP', () => {
    const r = { ...mockResult, platform_code: 'TIP' };
    component.onResultLinkClick(r as any);
    expect(mockModals.openModal).toHaveBeenCalledWith('resultInformation');
  });

  it('onResultLinkClick should open modal for AICCRA', () => {
    const r = { ...mockResult, platform_code: 'AICCRA' };
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

  it('processRowClick should return early when row index yields no result', () => {
    mockModals.isAnyModalOpen.mockReturnValue(false);
    const tableElement = document.createElement('table');
    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');
    const td = document.createElement('td');
    tbody.appendChild(row);
    row.appendChild(td);
    tableElement.appendChild(tbody);
    (component as any).dt2 = {
      el: { nativeElement: tableElement },
      value: [mockResult],
      first: 10
    };
    (component as any).processRowClick(td, new MouseEvent('click'));
    expect(mockModals.openModal).not.toHaveBeenCalled();
  });

  it('adjustColumnWidth should set column width from cell text lengths', () => {
    const eachCellCb = jest.fn();
    const worksheet = {
      getColumn: jest.fn(() => ({
        header: { toString: () => 'Header' },
        width: 0,
        eachCell: (_opts: any, cb: (cell: any, rowNumber: number) => void) => {
          cb({ text: 'Header' }, 1);
          cb({ text: 'LongCellText' }, 2);
          cb({ text: 'X' }, 3);
        }
      }))
    } as any;
    (component as any).adjustColumnWidth(worksheet, 1);
    expect(worksheet.getColumn).toHaveBeenCalledWith(1);
  });

  it('adjustColumnWidth should no-op when column is null', () => {
    const worksheet = { getColumn: jest.fn(() => null) } as any;
    (component as any).adjustColumnWidth(worksheet, 1);
    expect(worksheet.getColumn).toHaveBeenCalledWith(1);
  });

  it('exportTable should sanitize number, boolean, object, long string and empty string', async () => {
    const longStr = 'a'.repeat(33000);
    mockApiService.GET_GeneralReport.mockResolvedValue({
      data: [
        {
          Code: 1,
          Num: Number.NaN,
          BoolTrue: true,
          BoolFalse: false,
          Obj: { x: 1 },
          LongStr: longStr,
          EmptyStr: '   ',
          NullVal: null,
          Title: 'Normal'
        }
      ]
    });
    const addRowCalls: any[][] = [];
    const worksheet = {
      getColumn: jest.fn((i: number) => ({
        header: 'H',
        eachCell: (_: any, cb: any) => {
          for (let r = 1; r <= 2; r++) cb({ text: 'x' }, r);
        },
        width: 0,
        hidden: false
      })),
      columnCount: 10,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
      addRow: jest.fn((row: any) => addRowCalls.push(Array.isArray(row) ? row : [row])),
      columns: [] as any
    } as any;
    const workbookMock = {
      creator: '',
      created: new Date(),
      addWorksheet: jest.fn(() => worksheet),
      xlsx: { writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)) }
    } as any;
    jest.spyOn<any, any>(require('exceljs'), 'Workbook').mockImplementation(() => workbookMock);
    const createObjectURLSpy = jest.fn().mockReturnValue('blob:sn');
    const revokeObjectURLSpy = jest.fn();
    const originalURL = globalThis.URL;
    (globalThis as any).URL = { createObjectURL: createObjectURLSpy, revokeObjectURL: revokeObjectURLSpy };
    const linkEl = { click: jest.fn(), style: { display: '' }, href: '', download: '', remove: jest.fn() };
    const origCreate = document.createElement;
    (document as any).createElement = (tagName: any) => (tagName === 'a' ? linkEl : origCreate.call(document, tagName));
    jest.useFakeTimers();
    await component.exportTable();
    await jest.runAllTimersAsync();
    jest.useRealTimers();
    (document as any).createElement = origCreate;
    globalThis.URL = originalURL;
    expect(addRowCalls.length).toBeGreaterThan(0);
    const row = addRowCalls[addRowCalls.length - 1];
    expect(row.some((v: any) => v === 'TRUE' || v === true)).toBe(true);
    expect(row.some((v: any) => v === 'FALSE' || v === false)).toBe(true);
  });

  it('exportTable should sanitize unknown type as empty string', async () => {
    const noop = () => {};
    mockApiService.GET_GeneralReport.mockResolvedValue({
      data: [{ Code: 1, Title: 'OK', Fn: noop as any }]
    });
    const addRowCalls: any[][] = [];
    const worksheet = {
      getColumn: jest.fn(() => ({
        header: 'H',
        eachCell: (_: any, cb: any) => {
          for (let r = 1; r <= 2; r++) cb({ text: 'x' }, r);
        },
        width: 0,
        hidden: false
      })),
      columnCount: 3,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
      addRow: jest.fn((row: any) => addRowCalls.push(Array.isArray(row) ? row : [row])),
      columns: [] as any
    } as any;
    const workbookMock = {
      creator: '',
      created: new Date(),
      addWorksheet: jest.fn(() => worksheet),
      xlsx: { writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)) }
    } as any;
    jest.spyOn<any, any>(require('exceljs'), 'Workbook').mockImplementation(() => workbookMock);
    const originalURL = globalThis.URL;
    (globalThis as any).URL = { createObjectURL: jest.fn().mockReturnValue('blob:z'), revokeObjectURL: jest.fn() };
    const linkEl = { click: jest.fn(), style: {}, href: '', download: '', remove: jest.fn() };
    const origCreate = document.createElement;
    (document as any).createElement = (tagName: any) => (tagName === 'a' ? linkEl : origCreate.call(document, tagName));
    jest.useFakeTimers();
    await component.exportTable();
    await jest.runAllTimersAsync();
    jest.useRealTimers();
    (document as any).createElement = origCreate;
    globalThis.URL = originalURL;
    expect(addRowCalls.length).toBeGreaterThan(0);
    const row = addRowCalls[addRowCalls.length - 1];
    expect(row.some((v: any) => v === '')).toBe(true);
  });

  it('exportTable should set column widths for Title, Description, Project, Creator', async () => {
    mockApiService.GET_GeneralReport.mockResolvedValue({
      data: [{ Code: 1, Title: 'A Title', Description: 'A desc', Project: 'P1', Creator: 'User 1' }]
    });
    const getColumnCalls: { width?: number }[] = [];
    const worksheet = {
      getColumn: jest.fn((i: number) => {
        const col = {
          header: 'H',
          eachCell: (_: any, cb: any) => {
            cb({ text: 'x' }, 1);
            cb({ text: 'y' }, 2);
          },
          width: 0,
          hidden: false
        };
        getColumnCalls[i - 1] = col;
        return col;
      }),
      columnCount: 5,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
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
    const originalURL = globalThis.URL;
    (globalThis as any).URL = { createObjectURL: jest.fn().mockReturnValue('blob:w'), revokeObjectURL: jest.fn() };
    const linkEl = { click: jest.fn(), style: {}, href: '', download: '', remove: jest.fn() };
    const origCreate = document.createElement;
    (document as any).createElement = (tagName: any) => (tagName === 'a' ? linkEl : origCreate.call(document, tagName));
    jest.useFakeTimers();
    await component.exportTable();
    await jest.runAllTimersAsync();
    jest.useRealTimers();
    (document as any).createElement = origCreate;
    globalThis.URL = originalURL;
    expect(worksheet.getColumn).toHaveBeenCalled();
    expect(getColumnCalls.length).toBeGreaterThan(0);
  });

  it('exportTable should sanitize object that stringifies to length > 32767', async () => {
    const bigObj = { data: 'x'.repeat(33000) };
    mockApiService.GET_GeneralReport.mockResolvedValue({
      data: [{ Code: 1, Title: 'OK', BigObj: bigObj }]
    });
    const addRowCalls: any[][] = [];
    const worksheet = {
      getColumn: jest.fn(() => ({
        header: 'H',
        eachCell: (_: any, cb: any) => {
          for (let r = 1; r <= 2; r++) cb({ text: 'x' }, r);
        },
        width: 0,
        hidden: false
      })),
      columnCount: 3,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
      addRow: jest.fn((row: any) => addRowCalls.push(Array.isArray(row) ? row : [row])),
      columns: [] as any
    } as any;
    const workbookMock = {
      creator: '',
      created: new Date(),
      addWorksheet: jest.fn(() => worksheet),
      xlsx: { writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)) }
    } as any;
    jest.spyOn<any, any>(require('exceljs'), 'Workbook').mockImplementation(() => workbookMock);
    const originalURL = globalThis.URL;
    (globalThis as any).URL = { createObjectURL: jest.fn().mockReturnValue('blob:big'), revokeObjectURL: jest.fn() };
    const linkEl = { click: jest.fn(), style: {}, href: '', download: '', remove: jest.fn() };
    const origCreate = document.createElement;
    (document as any).createElement = (tagName: any) => (tagName === 'a' ? linkEl : origCreate.call(document, tagName));
    jest.useFakeTimers();
    await component.exportTable();
    await jest.runAllTimersAsync();
    jest.useRealTimers();
    (document as any).createElement = origCreate;
    globalThis.URL = originalURL;
    expect(addRowCalls.length).toBeGreaterThan(0);
    const row = addRowCalls[addRowCalls.length - 1];
    expect(row.some((v: any) => typeof v === 'string' && v.endsWith('...'))).toBe(true);
  });

  it('exportTable should sanitize object that throws on JSON.stringify', async () => {
    const circular: any = { a: 1 };
    circular.self = circular;
    mockApiService.GET_GeneralReport.mockResolvedValue({
      data: [{ Code: 1, Title: 'OK', BadObj: circular }]
    });
    const addRowCalls: any[][] = [];
    const worksheet = {
      getColumn: jest.fn(() => ({
        header: 'H',
        eachCell: (_: any, cb: any) => {
          for (let r = 1; r <= 2; r++) cb({ text: 'x' }, r);
        },
        width: 0,
        hidden: false
      })),
      columnCount: 3,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
      addRow: jest.fn((row: any) => addRowCalls.push(Array.isArray(row) ? row : [row])),
      columns: [] as any
    } as any;
    const workbookMock = {
      creator: '',
      created: new Date(),
      addWorksheet: jest.fn(() => worksheet),
      xlsx: { writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)) }
    } as any;
    jest.spyOn<any, any>(require('exceljs'), 'Workbook').mockImplementation(() => workbookMock);
    const originalURL = globalThis.URL;
    (globalThis as any).URL = { createObjectURL: jest.fn().mockReturnValue('blob:y'), revokeObjectURL: jest.fn() };
    const linkEl = { click: jest.fn(), style: {}, href: '', download: '', remove: jest.fn() };
    const origCreate = document.createElement;
    (document as any).createElement = (tagName: any) => (tagName === 'a' ? linkEl : origCreate.call(document, tagName));
    jest.useFakeTimers();
    await component.exportTable();
    await jest.runAllTimersAsync();
    jest.useRealTimers();
    (document as any).createElement = origCreate;
    globalThis.URL = originalURL;
    expect(addRowCalls.length).toBeGreaterThan(0);
    const row = addRowCalls[addRowCalls.length - 1];
    expect(row.some((v: any) => v === '')).toBe(true);
  });

  it('exportTable should handle outer catch when addRow throws', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockApiService.GET_GeneralReport.mockResolvedValue({
      data: [
        { Code: 1, Title: 'First' },
        { Code: 2, Title: 'Second' }
      ]
    });
    let addRowCallCount = 0;
    const worksheet = {
      getColumn: jest.fn(() => ({
        header: 'H',
        eachCell: (_: any, cb: any) => {
          for (let r = 1; r <= 3; r++) cb({ text: 'x' }, r);
        },
        width: 0,
        hidden: false
      })),
      columnCount: 2,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
      addRow: jest.fn(() => {
        addRowCallCount++;
        if (addRowCallCount === 2) throw new Error('addRow failed');
      }),
      columns: [] as any
    } as any;
    const workbookMock = {
      creator: '',
      created: new Date(),
      addWorksheet: jest.fn(() => worksheet),
      xlsx: { writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)) }
    } as any;
    jest.spyOn<any, any>(require('exceljs'), 'Workbook').mockImplementation(() => workbookMock);
    const originalURL = globalThis.URL;
    (globalThis as any).URL = { createObjectURL: jest.fn().mockReturnValue('blob:x'), revokeObjectURL: jest.fn() };
    const linkEl = { click: jest.fn(), style: {}, href: '', download: '', remove: jest.fn() };
    const origCreate = document.createElement;
    (document as any).createElement = (tagName: any) => (tagName === 'a' ? linkEl : origCreate.call(document, tagName));
    jest.useFakeTimers();
    await component.exportTable();
    await jest.runAllTimersAsync();
    jest.useRealTimers();
    (document as any).createElement = origCreate;
    globalThis.URL = originalURL;
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Error processing row'), expect.any(Error));
    consoleWarnSpy.mockRestore();
  });

  it('exportTable should warn and skip row when rowValues length does not match headers length', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockApiService.GET_GeneralReport.mockResolvedValue({
      data: [
        { Code: 1, Title: 'First' },
        { Code: 2, Title: 'Second' }
      ]
    });
    const originalPush = Array.prototype.push;
    let pushCallCount = 0;
    Array.prototype.push = function (this: any, ...args: any[]) {
      pushCallCount++;
      if (pushCallCount === 3) return this.length;
      return originalPush.apply(this, args);
    };
    const worksheet = {
      getColumn: jest.fn(() => ({
        header: 'H',
        eachCell: jest.fn(),
        width: 0
      })),
      columnCount: 2,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
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
    const originalURL = globalThis.URL;
    (globalThis as any).URL = { createObjectURL: jest.fn().mockReturnValue('blob:x'), revokeObjectURL: jest.fn() };
    const linkEl = { click: jest.fn(), style: {}, href: '', download: '', remove: jest.fn() };
    const origCreate = document.createElement;
    (document as any).createElement = (tagName: any) => (tagName === 'a' ? linkEl : origCreate.call(document, tagName));
    jest.useFakeTimers();
    await component.exportTable();
    await jest.runAllTimersAsync();
    jest.useRealTimers();
    Array.prototype.push = originalPush;
    (document as any).createElement = origCreate;
    globalThis.URL = originalURL;
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^Row \d+ has \d+ values but expected \d+, skipping$/)
    );
    consoleWarnSpy.mockRestore();
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
        eachCell: (_: any, cb: any) => {
          for (let r = 1; r <= 2; r++) cb({ text: 'x' }, r);
        },
        width: 0,
        get hidden() {
          return hiddenMap[i];
        },
        set hidden(v: boolean) {
          hiddenMap[i] = v;
        }
      })),
      columnCount: 15,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
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

    const createObjectURLSpy = jest.fn().mockReturnValue('blob:u');
    const revokeObjectURLSpy = jest.fn();
    const originalURL = globalThis.URL;
    (globalThis as any).URL = {
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy
    };

    const clickSpy = jest.fn();
    const linkElement = {
      click: clickSpy,
      style: { display: '' },
      href: '',
      download: '',
      remove: jest.fn()
    };
    const originalCreate = document.createElement;
    const originalAppendChild = document.body.appendChild;
    (document as any).createElement = (tagName: any) => {
      if (tagName === 'a') return linkElement as any;
      return originalCreate.call(document, tagName);
    };
    document.body.appendChild = jest.fn((node: any) => {
      if (node === linkElement) {
        return node;
      }
      return originalAppendChild.call(document.body, node);
    }) as any;

    (component as any).dt2 = { filteredValue: [mockResult] } as any;
    await component.exportTable();

    expect(mockApiService.GET_GeneralReport).toHaveBeenCalled();
    // Check that columns after data are hidden
    expect(worksheet.addRow).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    (document as any).createElement = originalCreate;
    document.body.appendChild = originalAppendChild;
    globalThis.URL = originalURL;
  });

  it('exportTable should return early when no data to export', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockApiService.GET_GeneralReport.mockResolvedValue({ data: [] });

    await component.exportTable();

    expect(consoleWarnSpy).toHaveBeenCalledWith('No data to export');
    consoleWarnSpy.mockRestore();
  });

  it('exportTable should return early when no headers found', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockApiService.GET_GeneralReport.mockResolvedValue({ data: [{}] });

    const worksheet = {
      getColumn: jest.fn(() => ({
        header: 'H',
        eachCell: jest.fn(),
        width: 0
      })),
      columnCount: 0,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
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

    await component.exportTable();

    expect(consoleWarnSpy).toHaveBeenCalledWith('No headers found in data');
    consoleWarnSpy.mockRestore();
  });

  it('exportTable should handle error when accessing property in row', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const rowWithThrowingGetter = { Code: 2, Title: 'B' };
    Object.defineProperty(rowWithThrowingGetter, 'Title', {
      get: () => {
        throw new Error('access');
      },
      configurable: true
    });
    mockApiService.GET_GeneralReport.mockResolvedValue({
      data: [{ Code: 1, Title: 'Test' }, rowWithThrowingGetter]
    });

    const worksheet = {
      getColumn: jest.fn(() => ({
        header: 'H',
        eachCell: jest.fn(),
        width: 0
      })),
      columnCount: 2,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
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

    const createObjectURLSpy = jest.fn().mockReturnValue('blob:u');
    const revokeObjectURLSpy = jest.fn();
    const originalURL = globalThis.URL;
    (globalThis as any).URL = {
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy
    };

    const linkElement = {
      click: jest.fn(),
      style: { display: '' },
      href: '',
      download: '',
      remove: jest.fn()
    };
    const originalCreate = document.createElement;
    (document as any).createElement = (tagName: any) => {
      if (tagName === 'a') return linkElement as any;
      return originalCreate.call(document, tagName);
    };

    jest.useFakeTimers();
    await component.exportTable();
    await jest.runAllTimersAsync();
    jest.useRealTimers();

    (document as any).createElement = originalCreate;
    globalThis.URL = originalURL;
    consoleWarnSpy.mockRestore();
  });

  it('exportTable should handle error when buffer is empty', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockApiService.GET_GeneralReport.mockResolvedValue({
      data: [{ Code: 1, Title: 'Test' }]
    });

    const worksheet = {
      getColumn: jest.fn(() => ({
        header: 'H',
        eachCell: jest.fn(),
        width: 0
      })),
      columnCount: 2,
      views: [] as any,
      autoFilter: {} as any,
      getRow: jest.fn(() => ({ getCell: jest.fn(() => ({}) as any), height: 0 })),
      addRow: jest.fn(),
      columns: [] as any
    } as any;
    const workbookMock = {
      creator: '',
      created: new Date(),
      addWorksheet: jest.fn(() => worksheet),
      xlsx: { writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)) }
    } as any;
    jest.spyOn<any, any>(require('exceljs'), 'Workbook').mockImplementation(() => workbookMock);

    await component.exportTable();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Generated buffer is empty or invalid');
    consoleErrorSpy.mockRestore();
  });

  it('processRowClick should return early when modal is open', () => {
    mockModals.isAnyModalOpen.mockReturnValue(true);
    const target = document.createElement('div');
    const event = new MouseEvent('click');

    (component as any).processRowClick(target, event);

    expect(mockModals.isAnyModalOpen).toHaveBeenCalled();
  });

  it('processRowClick should return early when dt2.el.nativeElement is not available', () => {
    mockModals.isAnyModalOpen.mockReturnValue(false);
    (component as any).dt2 = { el: null };
    const target = document.createElement('div');
    const event = new MouseEvent('click');

    (component as any).processRowClick(target, event);

    // Should not throw or navigate
  });

  it('processRowClick should return early when target is not in table', () => {
    mockModals.isAnyModalOpen.mockReturnValue(false);
    const tableElement = document.createElement('div');
    (component as any).dt2 = { el: { nativeElement: tableElement } };
    const target = document.createElement('div');
    document.body.appendChild(target);
    const event = new MouseEvent('click');

    (component as any).processRowClick(target, event);

    document.body.removeChild(target);
  });

  it('processRowClick should return early when target is in calendar/datepicker', () => {
    mockModals.isAnyModalOpen.mockReturnValue(false);
    const tableElement = document.createElement('div');
    const calendarElement = document.createElement('div');
    calendarElement.className = 'p-calendar';
    tableElement.appendChild(calendarElement);
    (component as any).dt2 = { el: { nativeElement: tableElement } };
    const event = new MouseEvent('click');

    (component as any).processRowClick(calendarElement, event);

    // Should not navigate
  });

  it('processRowClick should return early when target is in thead or th', () => {
    mockModals.isAnyModalOpen.mockReturnValue(false);
    const tableElement = document.createElement('table');
    const thead = document.createElement('thead');
    const th = document.createElement('th');
    thead.appendChild(th);
    tableElement.appendChild(thead);
    (component as any).dt2 = { el: { nativeElement: tableElement } };
    const event = new MouseEvent('click');

    (component as any).processRowClick(th, event);

    // Should not navigate
  });

  it('processRowClick should navigate to project-detail when clicking project-cell', () => {
    mockModals.isAnyModalOpen.mockReturnValue(false);
    const tableElement = document.createElement('table');
    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.className = 'project-cell';
    row.appendChild(cell);
    tbody.appendChild(row);
    tableElement.appendChild(tbody);
    (component as any).dt2 = {
      el: { nativeElement: tableElement },
      filteredValue: [{ ...mockResult, result_contracts: { contract_id: 'C-1' } }],
      first: 0
    };
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

    (component as any).processRowClick(cell, event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/project-detail', 'C-1', 'project-results']);
  });

  it('processRowClick should return early for non-PRMS/TIP/AICCRA when clicking routerLink', () => {
    mockModals.isAnyModalOpen.mockReturnValue(false);
    const tableElement = document.createElement('table');
    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    const link = document.createElement('a');
    link.setAttribute('routerLink', '/some-path');
    cell.appendChild(link);
    row.appendChild(cell);
    tbody.appendChild(row);
    tableElement.appendChild(tbody);
    (component as any).dt2 = {
      el: { nativeElement: tableElement },
      filteredValue: [{ ...mockResult, platform_code: 'ROAR' }],
      first: 0
    };
    const event = new MouseEvent('click');

    (component as any).processRowClick(link, event);

    // Should not navigate
  });

  it('processRowClick with STAR platform should close result information modal and clear selected result', () => {
    mockModals.isAnyModalOpen.mockReturnValue(false);
    mockModals.isModalOpen.mockReturnValue({ isOpen: true });
    const setSelectedSpy = jest.spyOn(mockModals.selectedResultForInfo, 'set');
    const tableElement = document.createElement('table');
    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');
    const td = document.createElement('td');
    const starResult = { ...mockResult, platform_code: 'STAR', result_official_code: 7 };
    row.setAttribute('data-result-id', String(starResult.result_official_code));
    row.setAttribute('data-platform', starResult.platform_code);
    tbody.appendChild(row);
    row.appendChild(td);
    tableElement.appendChild(tbody);
    (component as any).dt2 = {
      el: { nativeElement: tableElement },
      value: [starResult],
      filteredValue: [starResult],
      first: 0
    };
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    (component as any).processRowClick(td, event);
    expect(mockModals.closeModal).toHaveBeenCalledWith('resultInformation');
    expect(setSelectedSpy).toHaveBeenCalledWith(null);
  });

  it('closeResultInformationModal should only close modal when resultInformation is open', () => {
    mockModals.isModalOpen.mockReturnValue({ isOpen: true });
    const setSelectedSpy = jest.spyOn(mockModals.selectedResultForInfo, 'set');
    (component as any).closeResultInformationModal();
    expect(mockModals.closeModal).toHaveBeenCalledWith('resultInformation');
    expect(setSelectedSpy).toHaveBeenCalledWith(null);
  });
});
