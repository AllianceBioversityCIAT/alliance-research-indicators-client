import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DownloadOicrTemplateComponent } from './download-oicr-template.component';
import { WasmService } from '../../services/go/wasm.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { GetOICRDetails } from '@shared/interfaces/gets/get-oicr-details.interface';

describe('DownloadOicrTemplateComponent', () => {
  let component: DownloadOicrTemplateComponent;
  let fixture: ComponentFixture<DownloadOicrTemplateComponent>;
  let wasmMock: jest.Mocked<WasmService>;
  let apiMock: jest.Mocked<ApiService>;
  let cacheMock: jest.Mocked<CacheService>;

  beforeEach(async () => {
    wasmMock = {
      loadWasm: jest.fn().mockResolvedValue(true),
      processDocx: jest.fn(),
      downloadFile: jest.fn()
    } as unknown as jest.Mocked<WasmService>;

    apiMock = {
      GET_OICRDetails: jest.fn()
    } as unknown as jest.Mocked<ApiService>;

    cacheMock = {
      getCurrentNumericResultId: jest.fn().mockReturnValue(123)
    } as unknown as jest.Mocked<CacheService>;

    await TestBed.configureTestingModule({
      imports: [DownloadOicrTemplateComponent, HttpClientTestingModule],
      providers: [
        { provide: WasmService, useValue: wasmMock },
        { provide: ApiService, useValue: apiMock },
        { provide: CacheService, useValue: cacheMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadOicrTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getTagAsText should return expected labels', () => {
    expect(component.getTagAsText('1')).toBe('New OICR');
    expect(component.getTagAsText('2')).toBe('Updated OICR (Same Level of Maturity)');
    expect(component.getTagAsText('3')).toBe('Updated OICR (New Level of Maturity)');
    expect(component.getTagAsText('999' as any)).toBeUndefined();
  });

  it('formatRegionsAndCountries should format regions and countries correctly', () => {
    // Both
    const both = component.formatRegionsAndCountries(
      [{ region_name: 'Africa' } as any],
      [{ country_name: 'Kenya' } as any]
    );
    expect(both).toBe('Regions:\nAfrica\n\nCountries:\nKenya');

    // Only regions
    const onlyRegions = component.formatRegionsAndCountries(
      [{ region_name: 'Asia' } as any],
      []
    );
    expect(onlyRegions).toBe('Regions:\nAsia');

    // Only countries
    const onlyCountries = component.formatRegionsAndCountries(
      [],
      [{ country_name: 'Peru' } as any]
    );
    expect(onlyCountries).toBe('Countries:\nPeru');

    // None
    const none = component.formatRegionsAndCountries([], []);
    expect(none).toBe('');
  });

  it('mapFieldsToProcess should map attributes to selectedValue', () => {
    const details = {
      tag_name_text: 'T',
      title: 'Title',
      main_project: 'Proj',
      outcome_impact_statement: 'Stmt',
      geographic_scope: 'Global',
      geographic_scope_comments: 'Comments',
      other_projects_text: 'Other',
      regions_countries_text: 'RC',
      main_levers_text: 'Main',
      others_levers_text: 'Others',
      handle_link: 'http://x'
    } as unknown as GetOICRDetails;
    component.mapFieldsToProcess(details);
    for (const f of component.fieldsToProcess) {
      expect(f.selectedValue).toBe((details as any)[f.attribute]);
    }
  });

  it('ngOnInit should set wasmLoaded when loadWasm resolves', async () => {
    component.ngOnInit();
    await Promise.resolve();
    expect(component.wasmLoaded()).toBe(true);
  });

  it('getOicrDetails should populate computed text fields and map fields', async () => {
    const data: any = {
      tag_id: 2,
      other_projects: [
        { project_id: 1, project_title: 'A' },
        { project_id: 2, project_title: 'B' }
      ],
      regions: [{ region_name: 'Africa' }],
      countries: [{ country_name: 'Kenya' }],
      other_levers: [{ lever_full: 'L1' }, { lever_full: 'L2' }],
      main_levers: [{ main_lever_name: 'M1' }, { main_lever_name: 'M2' }],
    };
    apiMock.GET_OICRDetails.mockResolvedValue({ data });

    await component.getOicrDetails(123);

    expect(data.other_projects_text).toBe('1 - A\n\n2 - B');
    expect(data.regions_countries_text).toBe('Regions:\nAfrica\n\nCountries:\nKenya');
    expect(data.tag_name_text).toBe('Updated OICR (Same Level of Maturity)');
    expect(data.others_levers_text).toBe('L1\n\nL2');
    expect(data.main_levers_text).toBe('M1\n\nM2');

    // All fields in fieldsToProcess should be mapped: computed ones are strings, others may be undefined
    const computedAttrs = new Set([
      'other_projects_text',
      'regions_countries_text',
      'tag_name_text',
      'others_levers_text',
      'main_levers_text',
    ]);
    for (const f of component.fieldsToProcess) {
      if (computedAttrs.has(f.attribute)) {
        expect(typeof f.selectedValue).toBe('string');
      } else {
        expect(['undefined', 'string']).toContain(typeof (f.selectedValue as any));
      }
    }
  });

  it('downloadOicrTemplate should process and download when success', async () => {
    const data: any = {
      tag_id: 1,
      other_projects: [],
      regions: [],
      countries: [],
      other_levers: [],
      main_levers: [],
    };
    apiMock.GET_OICRDetails.mockResolvedValue({ data } as any);
    const fileData = new Uint8Array([1, 2, 3]);
    wasmMock.processDocx.mockResolvedValue({ success: true, fileData } as any);

    await component.downloadOicrTemplate();

    expect(component.processing()).toBe(false);
    expect(wasmMock.processDocx).toHaveBeenCalled();
    expect(wasmMock.downloadFile).toHaveBeenCalled();
    const [, name] = (wasmMock.downloadFile.mock.calls[0] as any);
    expect((name as string).startsWith('STAR_OICR_123_')).toBe(true);
    expect(component.result?.success).toBe(true);
  });

  it('downloadOicrTemplate should set error result on exception and stop processing', async () => {
    const data: any = {
      tag_id: 1,
      other_projects: [],
      regions: [],
      countries: [],
      other_levers: [],
      main_levers: [],
    };
    apiMock.GET_OICRDetails.mockResolvedValue({ data } as any);
    wasmMock.processDocx.mockRejectedValue(new Error('fail'));

    await component.downloadOicrTemplate();

    expect(component.processing()).toBe(false);
    expect(component.result?.success).toBe(false);
    expect(component.result?.error).toContain('Error inesperado');
  });
});
