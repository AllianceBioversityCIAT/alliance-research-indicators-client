/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, computed, inject, Input, signal, WritableSignal, HostListener } from '@angular/core';
import { TextareaModule } from 'primeng/textarea';
import { SaveOnWritingDirective } from '../../../directives/save-on-writing.directive';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { CacheService } from '../../../services/cache/cache.service';
import { WordCounterComponent } from '../word-counter/word-counter.component';
import { InputValueType } from '@shared/services/word-count.service';
import { TextareaValidationService } from '@shared/services/textarea-validation.service';

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
  @Input() maxLength = 40000;

  body = signal<{ value: string }>({ value: '' });
  showMaxReachedMessage = signal(false);
  textareaValidationService = inject(TextareaValidationService);

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    this.textareaValidationService.handlePasteText(event, this.signal, this.optionValue, this.body, this.showMaxReachedMessage);
  }

  shouldPreventInput(event: KeyboardEvent, currentValue: InputValueType): boolean {
    return this.textareaValidationService.shouldPreventInput(event, currentValue);
  }

  shouldPreventTextInput(event: KeyboardEvent): boolean {
    return this.textareaValidationService.shouldPreventTextInput(event, this.showMaxReachedMessage);
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
    if (value.length <= this.textareaValidationService.maxLength) {
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
