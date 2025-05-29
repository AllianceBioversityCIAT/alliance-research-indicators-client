import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedResultFormComponent } from './shared-result-form.component';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { By } from '@angular/platform-browser';

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
      imports: [SelectModule, TooltipModule, FormsModule],
      providers: [DatePipe, ChangeDetectorRef]
    }).compileComponents();

    fixture = TestBed.createComponent(SharedResultFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit validityChanged on ngOnChanges', () => {
    const spy = jest.spyOn(component.validityChanged, 'emit');
    component.contractId = null;
    component.ngOnChanges();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should emit contractIdChange and validityChanged when contract is changed', () => {
    const contractId = 123;
    const emitSpy = jest.spyOn(component.contractIdChange, 'emit');
    const validitySpy = jest.spyOn(component.validityChanged, 'emit');

    component.onContractChange(contractId);

    expect(component.contractId).toBe(contractId);
    expect(emitSpy).toHaveBeenCalledWith(contractId);
    expect(validitySpy).toHaveBeenCalledWith(true);
  });

  it('should shorten description based on containerWidth', () => {
    component.containerWidth = 800;
    const longText = 'A'.repeat(100);
    const result = component.getShortDescription(longText);
    expect(result.endsWith('...')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(76); // 73 + '...'
  });

  it('should return full description if shorter than limit', () => {
    component.containerWidth = 1300;
    const shortText = 'Short description';
    const result = component.getShortDescription(shortText);
    expect(result).toBe(shortText);
  });

  it('should render the p-select with correct placeholder', () => {
    fixture.detectChanges();
    const selectElement = fixture.debugElement.query(By.css('p-select'));
    expect(selectElement).toBeTruthy();
    expect(selectElement.attributes['placeholder']).toBe('Search by project code, project name or principal investigator');
  });

  it('should show warning message when isInvalid and showWarning are true', () => {
    component.contractId = null;
    component.showWarning = true;
    fixture.detectChanges();

    const warningEl = fixture.debugElement.query(By.css('.test-warning'));
    expect(warningEl.nativeElement.textContent).toContain('This field is required');
  });
});
