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
import { WordCountService } from '../../../services/word-count.service';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;
  let cacheService: jest.Mocked<CacheService>;
  let utilsService: jest.Mocked<UtilsService>;
  let wordCountService: jest.Mocked<WordCountService>;

  beforeEach(async () => {
    const mockCacheService = {
      currentResultIsLoading: signal(false)
    };

    const mockUtilsService = {
      getNestedProperty: jest.fn(),
      setNestedPropertyWithReduceSignal: jest.fn()
    };

    const mockWordCountService = {
      getWordCount: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [InputComponent, FormsModule, InputTextModule, InputNumberModule, SkeletonModule, SaveOnWritingDirective],
      providers: [
        { provide: CacheService, useValue: mockCacheService },
        { provide: UtilsService, useValue: mockUtilsService },
        { provide: WordCountService, useValue: mockWordCountService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    cacheService = TestBed.inject(CacheService) as jest.Mocked<CacheService>;
    utilsService = TestBed.inject(UtilsService) as jest.Mocked<UtilsService>;
    wordCountService = TestBed.inject(WordCountService) as jest.Mocked<WordCountService>;

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

  // Pruebas para shouldPreventInput y maxWords/maxLength
  describe('shouldPreventInput', () => {
    beforeEach(() => {
      component.maxWords = 3;
    });

    it('should return false if maxWords is not set', () => {
      component.maxWords = undefined;
      expect(component.shouldPreventInput({} as KeyboardEvent, 'test')).toBe(false);
    });

    it('should return false if currentValue is falsy', () => {
      expect(component.shouldPreventInput({} as KeyboardEvent, null)).toBe(false);
    });

    it('should return false if wordCount < maxWords', () => {
      wordCountService.getWordCount.mockReturnValue(2);
      expect(component.shouldPreventInput({} as KeyboardEvent, 'one two')).toBe(false);
    });

    it('should return false for allowed keys even if wordCount >= maxWords', () => {
      wordCountService.getWordCount.mockReturnValue(3);
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', ' '];
      for (const key of allowedKeys) {
        expect(component.shouldPreventInput({ key } as KeyboardEvent, 'one two three')).toBe(false);
      }
    });

    it('should return false if ctrlKey or metaKey is pressed', () => {
      wordCountService.getWordCount.mockReturnValue(3);
      expect(component.shouldPreventInput({ key: 'a', ctrlKey: true } as any, 'one two three')).toBe(false);
      expect(component.shouldPreventInput({ key: 'a', metaKey: true } as any, 'one two three')).toBe(false);
    });

    it('should return true if cursorPosition is null', () => {
      wordCountService.getWordCount.mockReturnValue(3);
      const event = { key: 'a', target: { selectionStart: null } } as any;
      expect(component.shouldPreventInput(event, 'one two three')).toBe(true);
    });

    it('should return false if currentWordIndex < maxWords', () => {
      wordCountService.getWordCount.mockReturnValue(3);
      const event = { key: 'a', target: { selectionStart: 3 } } as any;
      // 'one two three', cursor at 3, words before: ['one']
      expect(component.shouldPreventInput(event, 'one two three')).toBe(false);
    });

    it('should return true if currentWordIndex >= maxWords', () => {
      wordCountService.getWordCount.mockReturnValue(3);
      const event = { key: 'a', target: { selectionStart: 13 } } as any;
      // 'one two three', cursor at end, words before: ['one','two','three']
      expect(component.shouldPreventInput(event, 'one two three')).toBe(true);
    });
  });

  describe('inputValid with maxWords and maxLength', () => {
    it('should return invalid if word count exceeds maxWords', () => {
      component.maxWords = 2;
      wordCountService.getWordCount.mockReturnValue(3);
      component.signal = signal({ testField: 'one two three' });
      expect(component.inputValid().valid).toBe(false);
      expect(component.inputValid().message).toContain('Maximum 2 words allowed');
    });

    it('should return invalid if value exceeds maxLength', () => {
      component.maxLength = 5;
      component.signal = signal({ testField: '123456' });
      expect(component.inputValid().valid).toBe(false);
      expect(component.inputValid().message).toContain('Maximum 5 characters allowed');
    });
  });

  describe('setValue with maxWords', () => {
    it('should trim words to maxWords and set cursor if needed', () => {
      component.maxWords = 2;
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      Object.defineProperty(document, 'activeElement', { value: input, configurable: true });
      input.selectionStart = 6;
      const setSelectionRangeSpy = jest.spyOn(input, 'setSelectionRange');
      const longValue = 'one two three';
      component.optionValue = 'testField';
      component.signal = signal({ testField: '' });
      component.setValue(longValue);
      setTimeout(() => {
        expect(setSelectionRangeSpy).toHaveBeenCalled();
        document.body.removeChild(input);
      }, 0);
    });
  });

  // Cobertura directa de getPattern
  describe('getPattern', () => {
    it('should return email pattern', () => {
      component.pattern = 'email';
      expect(component.getPattern()).toEqual({
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        message: 'Please enter a valid email address.'
      });
    });
    it('should return url pattern', () => {
      component.pattern = 'url';
      expect(component.getPattern()).toEqual({
        pattern: "^(https?:\\/\\/)?([\\w-]+(\\.[\\w-]+)*\\.([a-z]{2,}))(\\/[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%-]*)?$",
        message: 'Please enter a valid URL.'
      });
    });
    it('should return empty pattern for unknown', () => {
      component.pattern = 'other' as any;
      expect(component.getPattern()).toEqual({ pattern: '', message: '' });
    });
  });

  // Edge cases para setValue y shouldPreventInput
  describe('setValue edge cases', () => {
    it('should handle number value', () => {
      const num = 123;
      component.setValue(num);
      expect(component.body().value).toBe(num);
      expect(utilsService.setNestedPropertyWithReduceSignal).toHaveBeenCalledWith(component.signal, component.optionValue, num);
    });
    it('should handle null value', () => {
      component.setValue(null);
      expect(component.body().value).toBe(null);
      expect(utilsService.setNestedPropertyWithReduceSignal).toHaveBeenCalledWith(component.signal, component.optionValue, null);
    });
    it('should handle undefined value', () => {
      component.setValue(undefined);
      expect(component.body().value).toBe(undefined);
      expect(utilsService.setNestedPropertyWithReduceSignal).toHaveBeenCalledWith(component.signal, component.optionValue, undefined);
    });
    it('should handle value with multiple spaces and tabs', () => {
      component.maxWords = 2;
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      Object.defineProperty(document, 'activeElement', { value: input, configurable: true });
      input.selectionStart = 10;
      const setSelectionRangeSpy = jest.spyOn(input, 'setSelectionRange');
      const value = 'one    \t\ttwo   three';
      component.optionValue = 'testField';
      component.signal = signal({ testField: '' });
      component.setValue(value);
      setTimeout(() => {
        expect(setSelectionRangeSpy).toHaveBeenCalled();
        document.body.removeChild(input);
      }, 0);
    });
    it('should handle value with only spaces', () => {
      component.setValue('     ');
      expect(component.body().value).toBe('     ');
    });
    it('should handle value with newlines', () => {
      component.maxWords = 2;
      const value = 'one\ntwo\nthree';
      component.setValue(value);
      expect(component.body().value).toContain('one two');
    });
  });

  describe('shouldPreventInput edge cases', () => {
    it('should return false for number value', () => {
      component.maxWords = 2;
      expect(component.shouldPreventInput({} as KeyboardEvent, 123)).toBe(false);
    });
    it('should return false for empty string', () => {
      component.maxWords = 2;
      expect(component.shouldPreventInput({} as KeyboardEvent, '')).toBe(false);
    });
    it('should handle value with multiple spaces and tabs', () => {
      component.maxWords = 2;
      wordCountService.getWordCount.mockReturnValue(3);
      const event = { key: 'a', target: { selectionStart: 10 } } as any;
      expect(component.shouldPreventInput(event, 'one    \t\ttwo   three')).toBe(true);
    });
  });

  // Combinaciones de inputs
  describe('combinaciones de inputs', () => {
    it('should handle onlyLowerCase with number', () => {
      component.onlyLowerCase = true;
      component.setValue(123);
      expect(component.body().value).toBe(123);
    });
    it('should handle maxWords and maxLength together', () => {
      component.maxWords = 2;
      component.maxLength = 5;
      wordCountService.getWordCount.mockReturnValue(3);
      component.signal = signal({ testField: 'one two three' });
      expect(component.inputValid().valid).toBe(false);
      component.signal = signal({ testField: '123456' });
      expect(component.inputValid().valid).toBe(false);
    });
    it('should handle validateEmpty and isRequired together', () => {
      component.isRequired = true;
      component.validateEmpty = true;
      component.signal = signal({ testField: '' });
      expect(component.inputValid().valid).toBe(false);
      expect(component.inputValid().message).toBe('This field is required');
    });
    it('should handle value with exactly maxWords', () => {
      component.maxWords = 3;
      wordCountService.getWordCount.mockReturnValue(3);
      component.signal = signal({ testField: 'one two three' });
      expect(component.inputValid().valid).toBe(true);
    });
    it('should handle value with more than maxWords and extra spaces', () => {
      component.maxWords = 2;
      wordCountService.getWordCount.mockReturnValue(3);
      component.signal = signal({ testField: 'one    two   three' });
      expect(component.inputValid().valid).toBe(false);
    });
  });
});
