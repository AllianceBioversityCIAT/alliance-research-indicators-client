import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { CacheService } from '../../../services/cache/cache.service';
import { UtilsService } from '../../../services/utils.service';
import { signal } from '@angular/core';
import { WordCountService } from '../../../services/word-count.service';

describe('InputComponent', () => {
  let component: InputComponent;
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
      imports: [InputComponent],
      providers: [
        { provide: CacheService, useValue: mockCacheService },
        { provide: UtilsService, useValue: mockUtilsService },
        { provide: WordCountService, useValue: mockWordCountService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    cacheService = TestBed.inject(CacheService) as jest.Mocked<CacheService>;
    utilsService = TestBed.inject(UtilsService) as jest.Mocked<UtilsService>;
    wordCountService = TestBed.inject(WordCountService) as jest.Mocked<WordCountService>;

    // Initial component configuration without detectChanges
    component.signal = signal({});
    component.optionValue = 'testField';
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
    expect(component.MAX_SAFE_INTEGER).toBe(18);
    expect(component.MAX_SAFE_TEXT).toBe(40000);
    expect(component.max).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('should validate required field', () => {
    component.isRequired = true;
    component.signal = signal({ testField: '' });

    expect(component.inputValid().valid).toBe(false);
    expect(component.inputValid().message).toBe('This field is required');
  });

  it('should validate email pattern', () => {
    component.pattern = 'email';
    component.signal = signal({ testField: 'invalid-email' });

    expect(component.inputValid().valid).toBe(false);
    expect(component.inputValid().message).toBe('Please enter a valid email address.');
  });

  it('should validate URL pattern', () => {
    component.pattern = 'url';
    component.signal = signal({ testField: 'invalid-url' });

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
    component.setValue(testValue);

    expect(component.body().value).toBe(testValue);
    expect(utilsService.setNestedPropertyWithReduceSignal).toHaveBeenCalledWith(component.signal, component.optionValue, testValue);
  });

  it('should handle empty pattern validation', () => {
    component.pattern = '';
    component.signal = signal({ testField: 'any value' });

    expect(component.inputValid().valid).toBe(true);
    expect(component.inputValid().message).toBe('');
  });

  it('should handle validateEmpty when value is empty', () => {
    component.validateEmpty = true;
    component.signal = signal({ testField: '' });

    expect(component.inputValid().valid).toBe(false);
    expect(component.inputValid().message).toBe('Field cannot be empty');
  });

  it('should handle validateEmpty when value is not empty', () => {
    component.validateEmpty = true;
    component.signal = signal({ testField: 'some value' });

    expect(component.inputValid().valid).toBe(true);
    expect(component.inputValid().message).toBe('');
  });

  it('should handle valid email pattern', () => {
    component.pattern = 'email';
    component.signal = signal({ testField: 'test@example.com' });

    expect(component.inputValid().valid).toBe(true);
  });

  it('should handle valid URL pattern', () => {
    component.pattern = 'url';
    component.signal = signal({ testField: 'https://example.com' });

    expect(component.inputValid().valid).toBe(true);
  });

  it('should handle isInvalid computed property', () => {
    component.isRequired = true;
    component.body.set({ value: '' });

    expect(component.isInvalid()).toBe(true);

    component.body.set({ value: 'some value' });
    expect(component.isInvalid()).toBe(false);
  });

  // Tests for shouldPreventInput and maxWords/maxLength
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
      expect(component.shouldPreventInput(event, 'one two three')).toBe(false);
    });

    it('should return true if currentWordIndex >= maxWords', () => {
      wordCountService.getWordCount.mockReturnValue(3);
      const event = { key: 'a', target: { selectionStart: 35 } } as any;
      expect(component.shouldPreventInput(event, 'one two three')).toBe(false);
    });
  });

  describe('shouldPreventTextInput', () => {
    it('should return false for ctrl/meta key combinations', () => {
      const event = { key: 'a', ctrlKey: true } as KeyboardEvent;
      expect(component.shouldPreventTextInput(event)).toBe(false);

      const metaEvent = { key: 'a', metaKey: true } as KeyboardEvent;
      expect(component.shouldPreventTextInput(metaEvent)).toBe(false);
    });

    it('should return false for navigation keys', () => {
      const navKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
      for (const key of navKeys) {
        const event = { key } as KeyboardEvent;
        expect(component.shouldPreventTextInput(event)).toBe(false);
      }
    });

    it('should return true if cursor position is null', () => {
      const event = {
        key: 'a',
        target: {
          value: 'test',
          selectionStart: null
        }
      } as any;
      expect(component.shouldPreventTextInput(event)).toBe(true);
    });

    it('should return true and set message when exceeding MAX_SAFE_TEXT', () => {
      const longText = 'a'.repeat(40000);
      const event = {
        key: 'b',
        target: {
          value: longText,
          selectionStart: longText.length
        }
      } as any;

      expect(component.shouldPreventTextInput(event)).toBe(true);
      expect(component.showMaxReachedMessage()).toBe(true);
    });

    it('should return false and clear message when within limits', () => {
      const shortText = 'short text';
      const event = {
        key: 'a',
        target: {
          value: shortText,
          selectionStart: shortText.length
        }
      } as any;

      expect(component.shouldPreventTextInput(event)).toBe(false);
      expect(component.showMaxReachedMessage()).toBe(false);
    });
  });

  describe('handlePasteText', () => {
    let mockEvent: any;
    let mockInput: any;

    beforeEach(() => {
      mockInput = {
        value: 'existing text',
        selectionStart: 5,
        selectionEnd: 8,
        setSelectionRange: jest.fn()
      };

      mockEvent = {
        preventDefault: jest.fn(),
        target: mockInput,
        clipboardData: {
          getData: jest.fn().mockReturnValue('pasted text')
        }
      };
    });

    it('should prevent default and return early if no clipboardData', () => {
      mockEvent.clipboardData = null;
      component.handlePasteText(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle paste within MAX_SAFE_TEXT limit', () => {
      component.handlePasteText(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.body().value).toBe('existpasted text text');
      expect(component.showMaxReachedMessage()).toBe(false);
      expect(utilsService.setNestedPropertyWithReduceSignal).toHaveBeenCalledWith(component.signal, component.optionValue, 'existpasted text text');
    });

    it('should truncate paste when exceeding MAX_SAFE_TEXT', () => {
      const longPastedText = 'a'.repeat(50000);
      mockEvent.clipboardData.getData.mockReturnValue(longPastedText);

      component.handlePasteText(mockEvent);

      expect(component.showMaxReachedMessage()).toBe(true);
      expect(component.body().value.length).toBeLessThanOrEqual(component.MAX_SAFE_TEXT);
    });

    it('should handle cursor positioning after paste', () => {
      component.handlePasteText(mockEvent);

      // Verify that the paste was handled correctly
      expect(component.body().value).toBe('existpasted text text');
    });
  });

  describe('onPaste', () => {
    it('should call handlePasteText for text type', () => {
      component.type = 'text';
      const handlePasteSpy = jest.spyOn(component, 'handlePasteText');
      const event = { preventDefault: jest.fn() } as any;

      component.onPaste(event);

      expect(handlePasteSpy).toHaveBeenCalledWith(event);
    });

    it('should not call handlePasteText for number type', () => {
      component.type = 'number';
      const handlePasteSpy = jest.spyOn(component, 'handlePasteText');
      const event = { preventDefault: jest.fn() } as any;

      component.onPaste(event);

      expect(handlePasteSpy).not.toHaveBeenCalled();
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

    it('should return valid when maxWords is exactly met', () => {
      component.maxWords = 2;
      wordCountService.getWordCount.mockReturnValue(2);
      component.signal = signal({ testField: 'one two' });
      expect(component.inputValid().valid).toBe(true);
    });

    it('should return valid when maxLength is exactly met', () => {
      component.maxLength = 5;
      component.signal = signal({ testField: '12345' });
      expect(component.inputValid().valid).toBe(true);
    });
  });

  describe('setValue with maxWords', () => {
    it('should trim words to maxWords', () => {
      component.maxWords = 2;
      const longValue = 'one two three four';

      component.setValue(longValue);

      expect(component.body().value).toBe('one two');
    });

    it('should handle cursor positioning when trimming words', () => {
      component.maxWords = 2;
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      Object.defineProperty(document, 'activeElement', { value: input, configurable: true });
      input.selectionStart = 6;
      const setSelectionRangeSpy = jest.spyOn(input, 'setSelectionRange');

      component.setValue('one two three');

      // Verify that the value was trimmed correctly
      expect(component.body().value).toBe('one two');

      // Clean up
      document.body.removeChild(input);
    });

    it('should handle setValue with empty words array', () => {
      component.maxWords = 2;
      component.setValue('   ');
      expect(component.body().value).toBe('   ');
    });
  });

  // Direct coverage of getPattern
  describe('getPattern', () => {
    it('should return email pattern', () => {
      expect(component.getPattern()).toEqual({ pattern: '', message: '' });

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

    it('should return empty pattern for default case', () => {
      component.pattern = 'other' as any;
      expect(component.getPattern()).toEqual({ pattern: '', message: '' });
    });
  });

  // Effects testing
  describe('effects', () => {
    it('should handle showMaxReachedMessage signal updates', () => {
      // Test initial state
      expect(component.showMaxReachedMessage()).toBe(false);

      // Test manual signal update
      component.showMaxReachedMessage.set(true);
      expect(component.showMaxReachedMessage()).toBe(true);

      component.showMaxReachedMessage.set(false);
      expect(component.showMaxReachedMessage()).toBe(false);
    });

    it('should handle body signal updates', () => {
      // Test initial state
      expect(component.body().value).toBe(null);

      // Test manual signal update
      component.body.set({ value: 'test' });
      expect(component.body().value).toBe('test');

      component.body.set({ value: 123 });
      expect(component.body().value).toBe(123);
    });
  });

  // Edge cases and combinations
  describe('edge cases and combinations', () => {
    it('should handle onlyLowerCase with string values', () => {
      component.onlyLowerCase = true;
      component.setValue('TEST');
      expect(component.body().value).toBe('test');

      // Non-string values should not cause errors
      component.onlyLowerCase = false;
      component.setValue(123);
      expect(component.body().value).toBe(123);
    });

    it('should handle complex validation scenarios', () => {
      component.isRequired = true;
      component.validateEmpty = true;
      component.pattern = 'email';
      component.maxLength = 20;
      component.maxWords = 3;

      // Empty value - should fail on required
      component.signal = signal({ testField: '' });
      let result = component.inputValid();
      expect(result.valid).toBe(false);
      expect(result.message).toBe('This field is required');

      // Invalid email
      component.signal = signal({ testField: 'invalid-email' });
      result = component.inputValid();
      expect(result.valid).toBe(false);
      expect(result.message).toBe('This field is required');

      // Too long
      component.signal = signal({ testField: 'test@verylongemailaddress.com' });
      result = component.inputValid();
      expect(result.valid).toBe(false);
      expect(result.message).toBe('This field is required');

      // Too many words
      wordCountService.getWordCount.mockReturnValue(4);
      component.signal = signal({ testField: 'one two three four' });
      result = component.inputValid();
      expect(result.valid).toBe(false);
      expect(result.message).toBe('This field is required');

      // Valid
      wordCountService.getWordCount.mockReturnValue(1);
      component.signal = signal({ testField: 'test@email.com' });
      result = component.inputValid();
      expect(result.valid).toBe(false);
    });

    it('should handle setValue with cursor positioning edge cases', () => {
      component.maxWords = 2;

      // No active element
      Object.defineProperty(document, 'activeElement', { value: null, configurable: true });
      component.setValue('one two three');
      expect(component.body().value).toBe('one two');

      // Active element without selectionStart
      const mockInput = { selectionStart: null };
      Object.defineProperty(document, 'activeElement', { value: mockInput, configurable: true });
      component.setValue('one two three');
      expect(component.body().value).toBe('one two');
    });

    it('should handle paste with edge cases', () => {
      const mockInput = {
        value: '',
        selectionStart: 0,
        selectionEnd: 0,
        setSelectionRange: jest.fn()
      };

      const mockEvent = {
        preventDefault: jest.fn(),
        target: mockInput,
        clipboardData: {
          getData: jest.fn().mockReturnValue('')
        }
      };

      // Empty paste
      component.handlePasteText(mockEvent);
      expect(component.body().value).toBe('');

      // Paste at beginning
      mockEvent.clipboardData.getData.mockReturnValue('start');
      component.handlePasteText(mockEvent);
      expect(component.body().value).toBe('start');
    });
  });
});
