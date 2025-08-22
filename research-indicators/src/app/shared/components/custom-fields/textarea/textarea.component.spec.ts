import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextareaComponent } from './textarea.component';
import { signal } from '@angular/core';

describe('TextareaComponent', () => {
  let component: TextareaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaComponent]
    }).compileComponents();

    component = TestBed.createComponent(TextareaComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should have default values', () => {
      expect(component.optionValue).toBe('');
      expect(component.label).toBe('');
      expect(component.helperText).toBe('');
      expect(component.description).toBe('');
      expect(component.isRequired).toBe(false);
      expect(component.disabled).toBe(false);
      expect(component.rows).toBe(10);
      expect(component.styleClass).toBe('');
      expect(component.size).toBe('');
      expect(component.placeholder).toBe('');
      expect(component.maxLength).toBe(40000);
    });

    it('should accept custom input values', () => {
      component.optionValue = 'test';
      component.label = 'Test Label';
      component.helperText = 'Helper text';
      component.description = 'Description';
      component.isRequired = true;
      component.disabled = true;
      component.rows = 5;
      component.styleClass = 'custom-class';
      component.size = 'large';
      component.placeholder = 'Enter text';
      component.maxLength = 1000;

      expect(component.optionValue).toBe('test');
      expect(component.label).toBe('Test Label');
      expect(component.helperText).toBe('Helper text');
      expect(component.description).toBe('Description');
      expect(component.isRequired).toBe(true);
      expect(component.disabled).toBe(true);
      expect(component.rows).toBe(5);
      expect(component.styleClass).toBe('custom-class');
      expect(component.size).toBe('large');
      expect(component.placeholder).toBe('Enter text');
      expect(component.maxLength).toBe(1000);
    });
  });

  describe('body signal', () => {
    it('should have initial value', () => {
      expect(component.body()).toEqual({ value: '' });
    });

    it('should be able to update value', () => {
      component.body.set({ value: 'new value' });
      expect(component.body()).toEqual({ value: 'new value' });
    });
  });

  describe('showMaxReachedMessage signal', () => {
    it('should have initial value', () => {
      expect(component.showMaxReachedMessage()).toBe(false);
    });

    it('should be able to update value', () => {
      component.showMaxReachedMessage.set(true);
      expect(component.showMaxReachedMessage()).toBe(true);
    });
  });

  describe('setValue method', () => {
    it('should handle empty string', () => {
      component.setValue('');
      expect(component.showMaxReachedMessage()).toBe(false);
    });

    it('should handle short value', () => {
      component.showMaxReachedMessage.set(true);
      component.setValue('test');
      expect(component.showMaxReachedMessage()).toBe(false);
    });

    it('should handle long value', () => {
      const longValue = 'a'.repeat(50000);
      component.setValue(longValue);
      expect(component.showMaxReachedMessage()).toBe(false);
    });
  });

  describe('isInvalid computed', () => {
    it('should return false when not required', () => {
      component.isRequired = false;
      expect(component.isInvalid()).toBe(false);
    });
  });
});
