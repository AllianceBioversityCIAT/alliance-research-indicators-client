import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedResultFormComponent } from './shared-result-form.component';

describe('SharedResultFormComponent', () => {
  let component: SharedResultFormComponent;
  let fixture: ComponentFixture<SharedResultFormComponent>;

  beforeEach(async () => {
    (globalThis as any).ResizeObserver = class {
      observe() {
        // intentionally left blank for testing
      }
      unobserve() {
        // intentionally left blank for testing
      }
      disconnect() {
        // intentionally left blank for testing
      }
    };

    await TestBed.configureTestingModule({
      imports: [SharedResultFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SharedResultFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
