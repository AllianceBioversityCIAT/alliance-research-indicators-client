import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OicrHeaderComponent } from './oicr-header.component';

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
    expect(component.data).toBeUndefined();
  });

  it('should accept inputs for data and showDownload', () => {
    const mock = { id: 1, title: 'Test' };
    component.data = mock;
    component.showDownload = true;
    fixture.detectChanges();
    expect(component.data).toBe(mock);
    expect(component.showDownload).toBe(true);
  });
});


