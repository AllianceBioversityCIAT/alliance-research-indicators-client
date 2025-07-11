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
  body = signal({ value: null });
  firstTime = signal(true);

  onChange = effect(() => {
    const externalValue = this.utils.getNestedProperty(this.signal(), this.optionValue);
    if (this.body().value !== externalValue) {
      this.body.set({ value: externalValue });
    }
  }, { allowSignalWrites: true });


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
    if (this.pattern) {
      const valid = new RegExp(this.getPattern().pattern).test(value);
      return { valid: valid, class: valid ? '' : 'ng-invalid ng-dirty', message: this.getPattern().message };
    }
    return { valid: true, class: '', message: '' };
  });

  setValue(value: any) {
    if (this.onlyLowerCase) value = value.toLowerCase();

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
