/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, computed, effect, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SaveOnWritingDirective } from '../../../directives/save-on-writing.directive';
import { SkeletonModule } from 'primeng/skeleton';
import { CacheService } from '../../../services/cache/cache.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { UtilsService } from '../../../services/utils.service';
@Component({
  selector: 'app-input',
  imports: [FormsModule, InputTextModule, SaveOnWritingDirective, SkeletonModule, InputNumberModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  utils = inject(UtilsService);
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
  body = signal<{ value: string | number | null }>({ value: null });
  firstTime = signal(true);

  getWordCount(value: string | number | null): number {
    if (!value) return 0;
    const str = value.toString().trim();
    // Contamos palabras separadas por espacios, ignorando espacios múltiples
    return str.split(/\s+/).filter(word => word.length > 0).length;
  }

  shouldPreventInput(event: KeyboardEvent, currentValue: string | number | null): boolean {
    if (!this.maxWords || !currentValue) return false;

    const wordCount = this.getWordCount(currentValue);
    if (wordCount < this.maxWords) return false;

    // Permitir teclas de navegación y borrado
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', ' '].includes(event.key)) return false;

    // Permitir atajos de teclado
    if (event.ctrlKey || event.metaKey) return false;

    // Verificar si estamos editando una palabra existente
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;
    if (cursorPosition === null) return true;

    // Obtener la palabra actual donde está el cursor
    const textBeforeCursor = currentValue.toString().substring(0, cursorPosition);
    const words = textBeforeCursor.trim().split(/\s+/);
    const currentWordIndex = words.length - 1;

    // Si estamos en medio de una palabra existente, permitir la edición
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
      const wordCount = this.getWordCount(value);
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

      // Dividimos el texto en palabras
      const words = value
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);

      // Si excede el límite, tomamos solo las primeras maxWords palabras
      if (words.length > this.maxWords) {
        value = words.slice(0, this.maxWords).join(' ');

        // Si el cursor estaba en una posición válida, intentamos mantenerlo
        if (cursorPosition !== null && cursorPosition !== undefined) {
          // Calculamos la posición relativa del cursor en la palabra actual
          const textBeforeCursor = value.substring(0, cursorPosition);
          const wordsBeforeCursor = textBeforeCursor.trim().split(/\s+/).length - 1;

          // Si el cursor estaba en una palabra que se mantiene, restauramos su posición
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
