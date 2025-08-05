/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, computed, inject, Input, signal, WritableSignal, HostListener } from '@angular/core';
import { TextareaModule } from 'primeng/textarea';
import { SaveOnWritingDirective } from '../../../directives/save-on-writing.directive';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { CacheService } from '../../../services/cache/cache.service';
import { WordCounterComponent } from '../word-counter/word-counter.component';
import { InputValueType, WordCountService } from '@shared/services/word-count.service';
import { UtilsService } from '@shared/services/utils.service';

@Component({
  selector: 'app-textarea',
  imports: [FormsModule, TextareaModule, SaveOnWritingDirective, SkeletonModule, WordCounterComponent],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss'
})
export class TextareaComponent {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionValue = '';
  @Input() label = '';
  @Input() helperText = '';
  @Input() description = '';
  @Input() isRequired = false;
  @Input() disabled = false;
  @Input() rows = 10;
  @Input() styleClass = '';
  @Input() size = '';
  @Input() placeholder = '';
  @Input() maxLength = 4;

  body = signal<{ value: string }>({ value: '' });
  showMaxReachedMessage = signal(false);
  wordCountService = inject(WordCountService);
  utils = inject(UtilsService);

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    this.handlePasteText(event);
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

    if (newValue.length > this.maxLength) {
      const availableSpace = this.maxLength - beforeCursor.length - afterCursor.length;
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
    if (!this.maxLength || !currentValue) return false;

    const wordCount = this.wordCountService.getWordCount(currentValue);
    if (wordCount < this.maxLength) return false;

    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', ' '].includes(event.key)) return false;
    if (event.ctrlKey || event.metaKey) return false;

    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;
    if (cursorPosition === null) return true;

    const textBeforeCursor = currentValue.toString().substring(0, cursorPosition);
    const words = textBeforeCursor.trim().split(/\s+/);
    const currentWordIndex = words.length - 1;

    if (currentWordIndex < this.maxLength) return false;

    return true;
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
    if (newValue.length > this.maxLength) {
      this.showMaxReachedMessage.set(true);
      return true;
    } else {
      this.showMaxReachedMessage.set(false);
    }

    return false;
  }

  get mainKey() {
    return this.optionValue.includes('.') ? this.optionValue.split('.')[0] : this.optionValue;
  }

  get subKey() {
    return this.optionValue.includes('.') ? this.optionValue.split('.')[1] : null;
  }

  get value() {
    if (this.subKey) {
      return this.signal()[this.mainKey]?.[this.subKey] || '';
    }
    return this.signal()[this.mainKey] || '';
  }

  setValue(value: string) {
    // Ocultar mensaje de máximo si el valor está por debajo del límite
    if (value.length <= this.maxLength) {
      this.showMaxReachedMessage.set(false);
    }

    if (this.subKey) {
      const mainObj = { ...(this.signal()[this.mainKey] || {}) };
      mainObj[this.subKey] = value;
      this.signal.set({ ...this.signal(), [this.mainKey]: mainObj });
    } else {
      this.signal.set({ ...this.signal(), [this.mainKey]: value });
    }
  }

  isInvalid = computed(() => {
    if (this.subKey) {
      return this.isRequired && (!this.signal()[this.mainKey]?.[this.subKey] || this.signal()[this.mainKey][this.subKey].length === 0);
    }
    return this.isRequired && (!this.signal()[this.mainKey] || this.signal()[this.mainKey].length === 0);
  });
}
