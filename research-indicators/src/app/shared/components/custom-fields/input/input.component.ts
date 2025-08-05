/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, computed, effect, inject, Input, signal, WritableSignal, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SaveOnWritingDirective } from '../../../directives/save-on-writing.directive';
import { SkeletonModule } from 'primeng/skeleton';
import { CacheService } from '../../../services/cache/cache.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { UtilsService } from '../../../services/utils.service';
import { WordCountService } from '../../../services/word-count.service';
import { WordCounterComponent } from '../word-counter/word-counter.component';

type InputValueType = string | number | null;

@Component({
  selector: 'app-input',
  imports: [FormsModule, InputTextModule, SaveOnWritingDirective, SkeletonModule, InputNumberModule, WordCounterComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  utils = inject(UtilsService);
  wordCountService = inject(WordCountService);
  @ViewChild('numberInput', { static: false }) numberInput!: ElementRef;
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
  MAX_SAFE_INTEGER = 18;
  MAX_SAFE_TEXT = 4;
  showMaxReachedMessage = signal(false);

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    if (this.type === 'text') {
      this.handlePasteText(event);
    } else if (this.type === 'number') {
      this.handlePasteNumber(event);
    }
  }

  handlePasteText(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pastedText = clipboardData.getData('text');
    const input = event.target as HTMLInputElement;
    const currentValue = input.value;
    const cursorPosition = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || cursorPosition;

    const beforeCursor = currentValue.substring(0, cursorPosition);
    const afterCursor = currentValue.substring(selectionEnd);
    const newValue = beforeCursor + pastedText + afterCursor;

    if (newValue.length > this.MAX_SAFE_TEXT) {
      const availableSpace = this.MAX_SAFE_TEXT - beforeCursor.length - afterCursor.length;
      const truncatedPastedText = pastedText.substring(0, Math.max(0, availableSpace));
      const finalValue = beforeCursor + truncatedPastedText + afterCursor;

      this.body.set({ value: finalValue });
      this.utils.setNestedPropertyWithReduceSignal(this.signal, this.optionValue, finalValue);

      this.showMaxReachedMessage.set(true);

      setTimeout(() => {
        const newCursorPosition = cursorPosition + truncatedPastedText.length;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      });
    } else {
      const finalValue = newValue;
      this.body.set({ value: finalValue });
      this.utils.setNestedPropertyWithReduceSignal(this.signal, this.optionValue, finalValue);
      this.showMaxReachedMessage.set(false);

      setTimeout(() => {
        const newCursorPosition = cursorPosition + pastedText.length;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      });
    }
  }

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

  shouldPreventNumberInput(event: KeyboardEvent): boolean {
    if (event.ctrlKey || event.metaKey) {
      return false;
    }
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', ' '].includes(event.key)) return false;
    if (!/[\d,]/.test(event.key)) {
      return true;
    }

    const input = event.target as HTMLInputElement;
    const currentValue = input.value;
    const cursorPosition = input.selectionStart;
    if (cursorPosition === null) {
      return true;
    }

    // Simular el nuevo valor con el carácter ingresado
    const newValue = currentValue.substring(0, cursorPosition) + event.key + currentValue.substring(cursorPosition);

    // Formatear el número para contar caracteres correctamente
    const formattedValue = this.formatNumberWithCommas(newValue);

    if (formattedValue.length > this.MAX_SAFE_INTEGER) {
      this.showMaxReachedMessage.set(true);
      return true;
    } else {
      this.showMaxReachedMessage.set(false);
    }

    return false;
  }

  private formatNumberWithCommas(value: string): string {
    // Remover todas las comas existentes
    const cleanValue = value.replace(/,/g, '');

    // Si no hay números, retornar vacío
    if (!cleanValue) return '';

    // No convertir a número para evitar pérdida de precisión
    // Solo formatear con comas cada 3 dígitos desde la derecha
    let formatted = '';
    for (let i = cleanValue.length - 1; i >= 0; i--) {
      if ((cleanValue.length - 1 - i) % 3 === 0 && i !== cleanValue.length - 1) {
        formatted = ',' + formatted;
      }
      formatted = cleanValue[i] + formatted;
    }

    return formatted;
  }

  shouldPreventTextInput(event: KeyboardEvent): boolean {
    if (event.ctrlKey || event.metaKey) {
      return false;
    }

    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
      return false;
    }

    const input = event.target as HTMLInputElement;
    const currentValue = input.value;
    const cursorPosition = input.selectionStart;
    if (cursorPosition === null) {
      return true;
    }

    const newValue = currentValue.substring(0, cursorPosition) + event.key + currentValue.substring(cursorPosition);
    if (newValue.length > this.MAX_SAFE_TEXT) {
      this.showMaxReachedMessage.set(true);
      return true;
    } else {
      this.showMaxReachedMessage.set(false);
    }

    return false;
  }

  handlePasteNumber(event: ClipboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pastedText = clipboardData.getData('text');
    const input = event.target as HTMLInputElement;

    const currentValue = input.value || '';
    const cursorPosition = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || cursorPosition;

    // Filtrar solo números del texto pegado
    const numericPastedText = pastedText.replace(/[^\d]/g, '');

    const beforeCursor = currentValue.substring(0, cursorPosition);
    const afterCursor = currentValue.substring(selectionEnd);
    const newValue = beforeCursor + numericPastedText + afterCursor;

    // Formatear el nuevo valor con comas
    const formattedValue = this.formatNumberWithCommas(newValue);

    if (formattedValue.length > this.MAX_SAFE_INTEGER) {
      // Si el valor formateado excede el límite, truncar desde el final
      const truncatedFormattedValue = formattedValue.substring(0, this.MAX_SAFE_INTEGER);

      this.body.set({ value: truncatedFormattedValue });
      this.utils.setNestedPropertyWithReduceSignal(this.signal, this.optionValue, truncatedFormattedValue);
      this.showMaxReachedMessage.set(true);

      setTimeout(() => {
        // Calcular la nueva posición del cursor
        const newCursorPosition = Math.min(cursorPosition, truncatedFormattedValue.length);
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      });
    } else {
      this.body.set({ value: formattedValue });
      this.utils.setNestedPropertyWithReduceSignal(this.signal, this.optionValue, formattedValue);
      this.showMaxReachedMessage.set(false);

      setTimeout(() => {
        // Calcular la nueva posición del cursor considerando las comas agregadas
        const beforeCursorFormatted = this.formatNumberWithCommas(beforeCursor);
        const newCursorPosition = beforeCursorFormatted.length + numericPastedText.length;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      });
    }
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

  updateMaxReachedMessage = effect(
    () => {
      const value = this.body().value;
      if (this.type === 'number' && value !== null && value !== undefined) {
        const valueString = value.toString();
        // Para números, contar las comas como caracteres
        this.showMaxReachedMessage.set(valueString.length >= this.MAX_SAFE_INTEGER);
      } else if (this.type === 'text' && value !== null && value !== undefined) {
        const valueString = value.toString();
        this.showMaxReachedMessage.set(valueString.length >= this.MAX_SAFE_TEXT);
      } else {
        this.showMaxReachedMessage.set(false);
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

    // Formatear números automáticamente si es tipo number
    if (this.type === 'number' && typeof value === 'string') {
      value = this.formatNumberWithCommas(value);
    }

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

  onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const cursorPosition = input.selectionStart || 0;

    // Formatear el valor
    const formattedValue = this.formatNumberWithCommas(value);

    // Solo actualizar si el valor cambió
    if (formattedValue !== value) {
      // Calcular la nueva posición del cursor
      const beforeCursor = value.substring(0, cursorPosition);
      const beforeCursorFormatted = this.formatNumberWithCommas(beforeCursor);
      const newCursorPosition = beforeCursorFormatted.length;

      // Actualizar el valor
      this.body.set({ value: formattedValue });
      this.utils.setNestedPropertyWithReduceSignal(this.signal, this.optionValue, formattedValue);

      // Restaurar la posición del cursor
      setTimeout(() => {
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      });
    }
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
