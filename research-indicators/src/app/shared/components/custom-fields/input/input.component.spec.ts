import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { SaveOnWritingDirective } from '../../../directives/save-on-writing.directive';
import { CacheService } from '../../../services/cache/cache.service';
import { UtilsService } from '../../../services/utils.service';
import { signal } from '@angular/core';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;
  let cacheService: jest.Mocked<CacheService>;
  let utilsService: jest.Mocked<UtilsService>;

  beforeEach(async () => {
    const mockCacheService = {
      currentResultIsLoading: signal(false)
    };

    const mockUtilsService = {
      getNestedProperty: jest.fn(),
      setNestedPropertyWithReduceSignal: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [InputComponent, FormsModule, InputTextModule, InputNumberModule, SkeletonModule, SaveOnWritingDirective],
      providers: [
        { provide: CacheService, useValue: mockCacheService },
        { provide: UtilsService, useValue: mockUtilsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    cacheService = TestBed.inject(CacheService) as jest.Mocked<CacheService>;
    utilsService = TestBed.inject(UtilsService) as jest.Mocked<UtilsService>;

    // Configuración inicial del componente
    component.signal = signal({});
    component.optionValue = 'testField';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.type).toBe('text');
    expect(component.autoComplete).toBe('on');
    expect(component.disabled).toBe(false);
    expect(component.validateEmpty).toBe(false);
    expect(component.isRequired).toBe(false);
    expect(component.onlyLowerCase).toBe(false);
    expect(component.min).toBe(0);
  });

  it('should show loading skeleton when currentResultIsLoading is true', () => {
    cacheService.currentResultIsLoading.set(true);
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('p-skeleton');
    expect(skeleton).toBeTruthy();
  });

  it('should show text input when type is text', () => {
    component.type = 'text';
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
  });

  it('should show number input when type is number', () => {
    component.type = 'number';
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('p-inputnumber');
    expect(input).toBeTruthy();
  });

  it('should show required asterisk when isRequired is true', () => {
    component.isRequired = true;
    component.label = 'Test Label';
    fixture.detectChanges();

    const asterisk = fixture.nativeElement.querySelector('.text-red-500');
    expect(asterisk).toBeTruthy();
  });

  it('should show helper text when provided', () => {
    component.helperText = 'Helper text';
    fixture.detectChanges();

    const helperText = fixture.nativeElement.querySelector('small.text-[#8D9299]');
    expect(helperText.textContent).toContain('Helper text');
  });

  it('should validate required field', () => {
    component.isRequired = true;
    component.signal = signal({ testField: '' });
    fixture.detectChanges();

    expect(component.inputValid().valid).toBe(false);
    expect(component.inputValid().message).toBe('This field is required');
  });

  it('should validate email pattern', () => {
    component.pattern = 'email';
    component.signal = signal({ testField: 'invalid-email' });
    fixture.detectChanges();

    expect(component.inputValid().valid).toBe(false);
    expect(component.inputValid().message).toBe('Please enter a valid email address.');
  });

  it('should validate URL pattern', () => {
    component.pattern = 'url';
    component.signal = signal({ testField: 'invalid-url' });
    fixture.detectChanges();

    expect(component.inputValid().valid).toBe(false);
    expect(component.inputValid().message).toBe('Please enter a valid URL.');
  });

  it('should convert to lowercase when onlyLowerCase is true', () => {
    component.onlyLowerCase = true;
    const testValue = 'TEST VALUE';

    component.setValue(testValue);

    expect(utilsService.setNestedPropertyWithReduceSignal).toHaveBeenCalledWith(component.signal, component.optionValue, testValue.toLowerCase());
  });

  it('should update value and trigger signal update', () => {
    const testValue = 'test value';
    utilsService.setNestedPropertyWithReduceSignal.mockImplementation((signal, path, value) => {
      signal.set({ [path]: value });
    });

    component.setValue(testValue);

    expect(component.body().value).toBe(testValue);
    expect(utilsService.setNestedPropertyWithReduceSignal).toHaveBeenCalledWith(component.signal, component.optionValue, testValue);
  });

  it('should show validation error message when field is invalid', () => {
    component.isRequired = true;
    component.signal = signal({ testField: '' });
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.text-[#E69F00]');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('This field is required');
  });

  it('should be disabled when disabled property is true', () => {
    component.disabled = true;
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });

  it('should show description when provided', () => {
    component.description = 'Test description';
    fixture.detectChanges();

    const description = fixture.nativeElement.querySelector('small.description');
    expect(description.textContent).toContain('Test description');
  });

  // Nuevas pruebas para mejorar la cobertura

  it('should handle empty pattern validation', () => {
    component.pattern = '';
    component.signal = signal({ testField: 'any value' });
    fixture.detectChanges();

    expect(component.inputValid().valid).toBe(true);
    expect(component.inputValid().message).toBe('');
  });

  it('should handle validateEmpty when value is empty', () => {
    component.validateEmpty = true;
    component.signal = signal({ testField: '' });
    fixture.detectChanges();

    expect(component.inputValid().valid).toBe(false);
    expect(component.inputValid().message).toBe('Field cannot be empty');
  });

  it('should handle validateEmpty when value is not empty', () => {
    component.validateEmpty = true;
    component.signal = signal({ testField: 'some value' });
    fixture.detectChanges();

    expect(component.inputValid().valid).toBe(true);
    expect(component.inputValid().message).toBe('');
  });

  it('should handle valid email pattern', () => {
    component.pattern = 'email';
    component.signal = signal({ testField: 'test@example.com' });
    fixture.detectChanges();

    expect(component.inputValid().valid).toBe(true);
    expect(component.inputValid().message).toBe('');
  });

  it('should handle valid URL pattern', () => {
    component.pattern = 'url';
    component.signal = signal({ testField: 'https://example.com' });
    fixture.detectChanges();

    expect(component.inputValid().valid).toBe(true);
    expect(component.inputValid().message).toBe('');
  });

  it('should handle effect when external value changes', () => {
    const externalValue = 'external value';
    utilsService.getNestedProperty.mockReturnValue(externalValue);

    component.signal.set({ testField: externalValue });
    fixture.detectChanges();

    expect(component.body().value).toBe(externalValue);
  });

  it('should handle effect when external value is null', () => {
    utilsService.getNestedProperty.mockReturnValue(null);

    component.signal.set({ testField: null });
    fixture.detectChanges();

    expect(component.body().value).toBe(null);
  });

  it('should handle number input with min value', () => {
    component.type = 'number';
    component.min = 5;
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('p-inputnumber');
    expect(input.getAttribute('min')).toBe('5');
  });

  it('should handle autocomplete off', () => {
    component.autoComplete = 'off';
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('autocomplete')).toBe('off');
  });

  it('should handle placeholder text', () => {
    component.placeholder = 'Enter text here';
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('placeholder')).toBe('Enter text here');
  });

  it('should handle isInvalid computed property', () => {
    component.isRequired = true;
    component.signal = signal({ testField: '' });
    fixture.detectChanges();

    expect(component.isInvalid()).toBe(true);

    component.signal.set({ testField: 'some value' });
    fixture.detectChanges();

    expect(component.isInvalid()).toBe(false);
  });
});
