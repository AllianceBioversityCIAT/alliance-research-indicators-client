/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, computed, inject, Input, signal, WritableSignal } from '@angular/core';
import { TextareaModule } from 'primeng/textarea';
import { SaveOnWritingDirective } from '../../../directives/save-on-writing.directive';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { CacheService } from '../../../services/cache/cache.service';

@Component({
  selector: 'app-textarea',
  imports: [FormsModule, TextareaModule, SaveOnWritingDirective, SkeletonModule],
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

  body = signal({ value: null });

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
