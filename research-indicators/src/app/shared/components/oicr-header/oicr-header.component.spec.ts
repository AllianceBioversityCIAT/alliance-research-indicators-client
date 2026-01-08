import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OicrHeaderComponent } from './oicr-header.component';
import { OicrHeaderData } from '@shared/interfaces/oicr-header-data.interface';
import { SubmissionService } from '@shared/services/submission.service';

describe('OicrHeaderComponent', () => {
  let component: OicrHeaderComponent;
  let fixture: ComponentFixture<OicrHeaderComponent>;
  let mockSubmissionService: jest.Mocked<SubmissionService>;

  beforeEach(async () => {
    mockSubmissionService = {
      getStatusNameById: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [OicrHeaderComponent],
      providers: [
        { provide: SubmissionService, useValue: mockSubmissionService }
      ]
    })
      // avoid rendering dependencies; template rendering isn't required for TS coverage
      .overrideComponent(OicrHeaderComponent, { set: { template: '<div></div>' } })
      .compileComponents();

    fixture = TestBed.createComponent(OicrHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with defaults', () => {
    expect(component).toBeTruthy();
    expect(component.showDownload).toBe(false);
    expect(component.data).toBeNull();
  });

  it('should accept inputs for data and showDownload', () => {
    const mockData: OicrHeaderData = {
      title: 'Test OICR',
      agreement_id: 'AG123',
      description: 'Test description',
      project_lead_description: 'Lead description',
      start_date: '2024-01-01',
      endDateGlobal: '2024-12-31',
      lever: 'Test lever',
      leverUrl: 'https://example.com',
      leverFirst: 'First lever',
      leverSecond: 'Second lever',
      status_id: '1',
      status_name: 'Active'
    };
    
    component.data = mockData;
    component.showDownload = true;
    fixture.detectChanges();
    
    expect(component.data).toBe(mockData);
    expect(component.showDownload).toBe(true);
  });

  it('should handle null data input', () => {
    component.data = null;
    component.showDownload = false;
    fixture.detectChanges();
    
    expect(component.data).toBeNull();
    expect(component.showDownload).toBe(false);
  });

  it('should handle partial data input', () => {
    const partialData: OicrHeaderData = {
      title: 'Partial OICR',
      status_name: 'Draft'
    };
    
    component.data = partialData;
    fixture.detectChanges();
    
    expect(component.data).toBe(partialData);
    expect(component.data.title).toBe('Partial OICR');
    expect(component.data.status_name).toBe('Draft');
    expect(component.data.agreement_id).toBeUndefined();
  });

  it('should handle date inputs as strings', () => {
    const dataWithStringDates: OicrHeaderData = {
      start_date: '2024-01-01',
      endDateGlobal: '2024-12-31'
    };
    
    component.data = dataWithStringDates;
    fixture.detectChanges();
    
    expect(component.data.start_date).toBe('2024-01-01');
    expect(component.data.endDateGlobal).toBe('2024-12-31');
  });

  it('should handle date inputs as Date objects', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    const dataWithDateObjects: OicrHeaderData = {
      start_date: startDate,
      endDateGlobal: endDate
    };
    
    component.data = dataWithDateObjects;
    fixture.detectChanges();
    
    expect(component.data.start_date).toBe(startDate);
    expect(component.data.endDateGlobal).toBe(endDate);
  });

  it('should handle showDownload toggle', () => {
    expect(component.showDownload).toBe(false);
    
    component.showDownload = true;
    fixture.detectChanges();
    expect(component.showDownload).toBe(true);
    
    component.showDownload = false;
    fixture.detectChanges();
    expect(component.showDownload).toBe(false);
  });

  it('should handle showTag input', () => {
    expect(component.showTag).toBe(false);
    
    component.showTag = true;
    fixture.detectChanges();
    expect(component.showTag).toBe(true);
    
    component.showTag = false;
    fixture.detectChanges();
    expect(component.showTag).toBe(false);
  });


  it('should handle data with all properties', () => {
    const completeData: OicrHeaderData = {
      title: 'Complete OICR',
      agreement_id: 'AG-123',
      description: 'Complete description',
      project_lead_description: 'Complete lead description',
      start_date: '2024-01-01',
      endDateGlobal: '2024-12-31',
      lever: 'Complete lever',
      leverUrl: 'https://complete.example.com',
      leverFirst: 'Complete first',
      leverSecond: 'Complete second'
    };
    
    component.data = completeData;
    fixture.detectChanges();
    
    expect(component.data).toBe(completeData);
    expect(component.data.title).toBe('Complete OICR');
    expect(component.data.agreement_id).toBe('AG-123');
    expect(component.data.description).toBe('Complete description');
    expect(component.data.project_lead_description).toBe('Complete lead description');
    expect(component.data.start_date).toBe('2024-01-01');
    expect(component.data.endDateGlobal).toBe('2024-12-31');
    expect(component.data.lever).toBe('Complete lever');
    expect(component.data.leverUrl).toBe('https://complete.example.com');
    expect(component.data.leverFirst).toBe('Complete first');
    expect(component.data.leverSecond).toBe('Complete second');
  });

  it('should handle data with undefined properties', () => {
    const dataWithUndefined: OicrHeaderData = {
      title: 'Undefined Test',
      agreement_id: undefined,
      description: undefined,
      project_lead_description: undefined,
      start_date: undefined,
      endDateGlobal: undefined,
      lever: undefined,
      leverUrl: undefined,
      leverFirst: undefined,
      leverSecond: undefined
    };
    
    component.data = dataWithUndefined;
    fixture.detectChanges();
    
    expect(component.data).toBe(dataWithUndefined);
    expect(component.data.title).toBe('Undefined Test');
    expect(component.data.agreement_id).toBeUndefined();
    expect(component.data.description).toBeUndefined();
    expect(component.data.project_lead_description).toBeUndefined();
    expect(component.data.start_date).toBeUndefined();
    expect(component.data.endDateGlobal).toBeUndefined();
    expect(component.data.lever).toBeUndefined();
    expect(component.data.leverUrl).toBeUndefined();
    expect(component.data.leverFirst).toBeUndefined();
    expect(component.data.leverSecond).toBeUndefined();
  });
});


