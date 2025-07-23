/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, computed, effect, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SaveOnWritingDirective } from '../../../directives/save-on-writing.directive';
import { SkeletonModule } from 'primeng/skeleton';
import { CacheService } from '../../../services/cache/cache.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { UtilsService } from '../../../services/utils.service';
import { WordCountService } from '../../../services/word-count.service';

type InputValueType = string | number | null;

@Component({
  selector: 'app-input',
  imports: [FormsModule, InputTextModule, SaveOnWritingDirective, SkeletonModule, InputNumberModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  utils = inject(UtilsService);
  wordCountService = inject(WordCountService);
  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionValue = '';
  @Input() pattern: 'email' | 'url' | '' = '';
  @Input() label = '';
  @Input() description = '';
  @Input() type: 'text' | 'number' = 'text';
  @Input() placeholder = '';
  @Input() helperText = '';
  @Input() min = 0;
  @Input() validateEmpty = false;
  @Input() isRequired = false;
  @Input() onlyLowerCase = false;
  @Input() autoComplete: 'on' | 'off' = 'on';
  @Input() disabled = false;
  @Input() maxLength?: number;
  @Input() maxWords?: number;

  body = signal<{ value: InputValueType }>({ value: null });
  firstTime = signal(true);

  shouldPreventInput(event: KeyboardEvent, currentValue: InputValueType): boolean {
    if (!this.maxWords || !currentValue) return false;

    const wordCount = this.wordCountService.getWordCount(currentValue);
    if (wordCount < this.maxWords) return false;

    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', ' '].includes(event.key)) return false;

    if (event.ctrlKey || event.metaKey) return false;

    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;
    if (cursorPosition === null) return true;

    const textBeforeCursor = currentValue.toString().substring(0, cursorPosition);
    const words = textBeforeCursor.trim().split(/\s+/);
    const currentWordIndex = words.length - 1;

    if (currentWordIndex < this.maxWords) return false;

    return true;
  }

  onChange = effect(
    () => {
      const externalValue = this.utils.getNestedProperty(this.signal(), this.optionValue);
      if (this.body().value !== externalValue) {
        this.body.set({ value: externalValue });
      }
    },
    { allowSignalWrites: true }
  );

  isInvalid = computed(() => {
    return this.isRequired && !this.body()?.value;
  });

  inputValid = computed(() => {
    const value = this.signal()[this.optionValue];
    if (this.isRequired && (!value || value.length === 0)) {
      return { valid: false, class: 'ng-invalid ng-dirty', message: 'This field is required' };
    }
    if (this.validateEmpty && !value) {
      return { valid: false, class: 'ng-invalid ng-dirty', message: 'Field cannot be empty' };
    }
    if (this.maxWords && value) {
      const wordCount = this.wordCountService.getWordCount(value);

      if (wordCount > this.maxWords) {
        return { valid: false, class: 'ng-invalid ng-dirty', message: `Maximum ${this.maxWords} words allowed` };
      }
    }
    if (this.maxLength && value && value.length > this.maxLength) {
      return { valid: false, class: 'ng-invalid ng-dirty', message: `Maximum ${this.maxLength} characters allowed` };
    }
    if (this.pattern) {
      const valid = new RegExp(this.getPattern().pattern).test(value);
      return { valid: valid, class: valid ? '' : 'ng-invalid ng-dirty', message: this.getPattern().message };
    }
    return { valid: true, class: '', message: '' };
  });

  setValue(value: any) {
    if (this.onlyLowerCase) value = value.toLowerCase();

    if (this.maxWords && typeof value === 'string') {
      const input = document.activeElement as HTMLInputElement;
      const cursorPosition = input?.selectionStart;

      const words = value
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);

      if (words.length > this.maxWords) {
        value = words.slice(0, this.maxWords).join(' ');

        if (cursorPosition !== null && cursorPosition !== undefined) {
          const textBeforeCursor = value.substring(0, cursorPosition);
          const wordsBeforeCursor = textBeforeCursor.trim().split(/\s+/).length - 1;

          if (wordsBeforeCursor < this.maxWords) {
            setTimeout(() => {
              input.setSelectionRange(cursorPosition, cursorPosition);
            });
          }
        }
      }
    }

    this.body.set({ value: value });
    this.utils.setNestedPropertyWithReduceSignal(this.signal, this.optionValue, value);
  }

  getPattern() {
    switch (this.pattern) {
      case 'email':
        return { pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', message: 'Please enter a valid email address.' };
      case 'url':
        return {
          pattern: "^(https?:\\/\\/)?([\\w-]+(\\.[\\w-]+)*\\.([a-z]{2,}))(\\/[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%-]*)?$",
          message: 'Please enter a valid URL.'
        };
      default:
        return { pattern: '', message: '' };
    }
  }
}
