import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import StarReportViewerComponent from './star-report-viewer.component';

describe('StarReportViewerComponent', () => {
  let fixture: ComponentFixture<StarReportViewerComponent>;
  let component: StarReportViewerComponent;
  let api: { GET_ResultPdfReport: jest.Mock };

  const setup = async (id: string | null = 'STAR-8', version: string | null = '2026', response?: { data: string }) => {
    api = {
      GET_ResultPdfReport: jest.fn().mockResolvedValue(response ?? { data: 'https://reports.example.com/star-8.pdf' })
    };

    await TestBed.configureTestingModule({
      imports: [StarReportViewerComponent],
      providers: [
        { provide: ApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(id === null ? {} : { id }),
              queryParamMap: convertToParamMap(version === null ? {} : { version })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StarReportViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should show loading while the PDF URL is being generated', async () => {
    let resolveReport!: (value: { data: string }) => void;
    api = {
      GET_ResultPdfReport: jest.fn().mockReturnValue(
        new Promise(resolve => {
          resolveReport = resolve;
        })
      )
    };

    await TestBed.configureTestingModule({
      imports: [StarReportViewerComponent],
      providers: [
        { provide: ApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'STAR-8' }),
              queryParamMap: convertToParamMap({ version: '2026' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StarReportViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Generating pdf, please wait...');
    expect(fixture.nativeElement.textContent).toContain('Preparing your report');
    expect(fixture.nativeElement.querySelector('img[alt="STAR"]')).toBeTruthy();
    if (!component.isProductionEnvironment) {
      expect(fixture.nativeElement.querySelector('[aria-label="Testing Environment"]')?.textContent).toContain('Testing');
    }
    expect(component.loading()).toBe(true);

    resolveReport({ data: 'https://reports.example.com/star-8.pdf' });
    await fixture.whenStable();
  });

  it('should load and sanitize the STAR PDF URL from the route result code', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.GET_ResultPdfReport).toHaveBeenCalledWith('8', 'STAR', '2026', 'cap_sharing');
    expect(component.resultCode).toBe('STAR-8');
    expect(component.version).toBe('2026');
    expect(component.loading()).toBe(false);
    expect(component.safePdfUrl()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('iframe')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('header')?.classList.contains('bottom-5')).toBe(true);
  });

  it('should show an error when the report URL is empty', async () => {
    await setup('STAR-8', '2026', { data: '' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.safePdfUrl()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('The STAR PDF report is not available yet.');
  });

  it('should show an error when the route result code is invalid', async () => {
    await setup('   ', '2026');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.GET_ResultPdfReport).not.toHaveBeenCalled();
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe('The STAR result code is missing or invalid.');
  });

  it('should default missing route params to empty strings', async () => {
    await setup(null, null);
    await fixture.whenStable();

    expect(component.resultCode).toBe('');
    expect(component.version).toBe('');
  });

  it('should use the raw result code when it is not prefixed with STAR', async () => {
    await setup('8', '2026');
    await fixture.whenStable();

    expect(api.GET_ResultPdfReport).toHaveBeenCalledWith('8', 'STAR', '2026', 'cap_sharing');
  });

  it('should omit reportYear when the version query param is missing', async () => {
    await setup('STAR-8', null);
    await fixture.whenStable();

    expect(api.GET_ResultPdfReport).toHaveBeenCalledWith('8', 'STAR', null, 'cap_sharing');
  });

  it('should use inn_dev report_name when provided in the query string', async () => {
    api = {
      GET_ResultPdfReport: jest.fn().mockResolvedValue({ data: 'https://reports.example.com/star-8.pdf' })
    };

    await TestBed.configureTestingModule({
      imports: [StarReportViewerComponent],
      providers: [
        { provide: ApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'STAR-8' }),
              queryParamMap: convertToParamMap({ version: '2026', report_name: 'inn_dev' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StarReportViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(api.GET_ResultPdfReport).toHaveBeenCalledWith('8', 'STAR', '2026', 'inn_dev');
  });

  it('should show an error when generating the PDF fails', async () => {
    await setup('STAR-8', '2026');
    api.GET_ResultPdfReport.mockRejectedValueOnce(new Error('fail'));

    await (component as any).loadPdf();

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe('We could not generate the STAR PDF report. Please try again.');
  });
});
