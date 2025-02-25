import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTagComponent } from './custom-tag.component';

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
});
