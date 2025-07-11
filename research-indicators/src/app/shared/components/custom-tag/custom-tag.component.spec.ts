import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomTagComponent } from './custom-tag.component';
import { STATUS_COLOR_MAP } from '@shared/constants/status-colors';

describe('CustomTagComponent', () => {
  let component: CustomTagComponent;
  let fixture: ComponentFixture<CustomTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomTagComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default statusId and statusName', () => {
    expect(component.statusId).toBe('');
    expect(component.statusName).toBe('');
  });

  it('should set statusId and statusName from inputs', () => {
    component.statusId = '1';
    component.statusName = 'Active';
    fixture.detectChanges();
    expect(component.statusId).toBe('1');
    expect(component.statusName).toBe('Active');
  });

  it('getColors should return correct color for existing statusId', () => {
    component.statusId = '2';
    expect(component.getColors()).toEqual(STATUS_COLOR_MAP['2']);
  });

  it('getColors should return default color for non-existent statusId', () => {
    component.statusId = 'no-existe';
    expect(component.getColors()).toEqual(STATUS_COLOR_MAP['']);
  });

  it('getColors should work with numeric statusId', () => {
    component.statusId = 3;
    expect(component.getColors()).toEqual(STATUS_COLOR_MAP['3']);
  });

  it('should apply correct class when tiny is true', () => {
    component.tiny = true;
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div');
    expect(el.className).toContain('text-[9px]');
  });

  it('should apply correct class when tiny is false', () => {
    component.tiny = false;
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div');
    expect(el.className).toContain('text-[12px]');
  });
});
