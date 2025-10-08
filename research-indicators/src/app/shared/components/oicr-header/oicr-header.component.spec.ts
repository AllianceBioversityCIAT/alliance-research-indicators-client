import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OicrHeaderComponent } from './oicr-header.component';
import { OicrHeaderData } from '@shared/interfaces/oicr-header-data.interface';

describe('OicrHeaderComponent', () => {
  let component: OicrHeaderComponent;
  let fixture: ComponentFixture<OicrHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OicrHeaderComponent]
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
});


