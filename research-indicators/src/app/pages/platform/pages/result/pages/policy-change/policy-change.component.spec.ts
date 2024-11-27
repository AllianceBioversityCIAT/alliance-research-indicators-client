import { ComponentFixture, TestBed } from '@angular/core/testing';

import PolicyChangeComponent from './policy-change.component';

describe('PolicyChangeComponent', () => {
  let component: PolicyChangeComponent;
  let fixture: ComponentFixture<PolicyChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyChangeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
