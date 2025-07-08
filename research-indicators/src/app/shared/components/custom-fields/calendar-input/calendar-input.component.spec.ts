import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarInputComponent } from './calendar-input.component';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { SkeletonModule } from 'primeng/skeleton';
import { CacheService } from '../../../services/cache/cache.service';
import { signal } from '@angular/core';

describe('CalendarInputComponent', () => {
  let component: CalendarInputComponent;
  let fixture: ComponentFixture<CalendarInputComponent>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockCacheService = {
      currentResultIsLoading: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [CalendarInputComponent, FormsModule, CalendarModule, SkeletonModule],
      providers: [{ provide: CacheService, useValue: mockCacheService }]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarInputComponent);
    component = fixture.componentInstance;
    cacheService = TestBed.inject(CacheService) as jest.Mocked<CacheService>;

    // Configuración inicial del componente
    component.signal = signal({});
    component.optionValue = 'testField';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.minDate).toBeNull();
    expect(component.maxDate).toBeNull();
    expect(component.isRequired).toBe(false);
    expect(component.disabled).toBe(false);
  });

  it('should show loading skeleton when currentResultIsLoading is true', () => {
    cacheService.currentResultIsLoading.set(true);
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('p-skeleton');
    expect(skeleton).toBeTruthy();
  });

  it('should show calendar input when not loading', () => {
    cacheService.currentResultIsLoading.set(false);
    fixture.detectChanges();

    const calendar = fixture.nativeElement.querySelector('p-calendar');
    expect(calendar).toBeTruthy();
  });

  it('should show required asterisk when isRequired is true', () => {
    component.isRequired = true;
    component.label = 'Test Label';
    fixture.detectChanges();

    const asterisk = fixture.nativeElement.querySelector('.text-red-500');
    expect(asterisk).toBeTruthy();
  });

  it('should show description when provided', () => {
    component.description = 'Test description';
    fixture.detectChanges();

    const description = fixture.nativeElement.querySelector('small.description');
    expect(description.textContent).toContain('Test description');
  });

  it('should validate required field', () => {
    component.isRequired = true;
    component.signal = signal({ testField: '' });
    fixture.detectChanges();

    expect(component.isInvalid()).toBe(true);
    expect(component.inputValid().valid).toBe(false);
    expect(component.inputValid().message).toBe('This field is required');
  });

  it('should not show validation error when field is valid', () => {
    component.isRequired = true;
    component.signal = signal({ testField: new Date() });
    fixture.detectChanges();

    expect(component.isInvalid()).toBe(false);
    expect(component.inputValid().valid).toBe(true);
    expect(component.inputValid().message).toBe('');
  });

  it('should handle setValue correctly', () => {
    const testDate = new Date();
    component.signal = signal({ testField: null });

    component.setValue(testDate.toISOString());

    expect(component.signal().testField).toBe(testDate.toISOString());
  });

  it('should handle minDate and maxDate constraints', () => {
    const minDate = new Date('2024-01-01');
    const maxDate = new Date('2024-12-31');

    component.minDate = minDate;
    component.maxDate = maxDate;
    fixture.detectChanges();

    const calendar = fixture.nativeElement.querySelector('p-calendar');
    expect(calendar.getAttribute('minDate')).toBeDefined();
    expect(calendar.getAttribute('maxDate')).toBeDefined();
  });

  it('should be disabled when disabled property is true', () => {
    component.disabled = true;
    fixture.detectChanges();

    const calendar = fixture.nativeElement.querySelector('p-calendar');
    expect(calendar.getAttribute('disabled')).toBe('true');
  });

  it('should show validation error message when field is invalid', () => {
    component.isRequired = true;
    component.signal = signal({ testField: '' });
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.text-[#E69F00]');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('This field is required');
  });

  it('should handle empty value in isInvalid computed property', () => {
    component.isRequired = true;
    component.signal = signal({ testField: '' });
    fixture.detectChanges();

    expect(component.isInvalid()).toBe(true);
  });

  it('should handle null value in isInvalid computed property', () => {
    component.isRequired = true;
    component.signal = signal({ testField: null });
    fixture.detectChanges();

    expect(component.isInvalid()).toBe(true);
  });

  it('should handle valid value in isInvalid computed property', () => {
    component.isRequired = true;
    component.signal = signal({ testField: new Date() });
    fixture.detectChanges();

    expect(component.isInvalid()).toBe(false);
  });

  it('should handle inputValid computed property with empty value', () => {
    component.isRequired = true;
    component.signal = signal({ testField: '' });
    fixture.detectChanges();

    const result = component.inputValid();
    expect(result.valid).toBe(false);
    expect(result.class).toBe('ng-invalid ng-dirty');
    expect(result.message).toBe('This field is required');
  });

  it('should handle inputValid computed property with valid value', () => {
    component.signal = signal({ testField: new Date() });
    fixture.detectChanges();

    const result = component.inputValid();
    expect(result.valid).toBe(true);
    expect(result.class).toBe('ng-valid ng-dirty');
    expect(result.message).toBe('');
  });
});
