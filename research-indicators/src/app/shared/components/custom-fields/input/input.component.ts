/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, computed, effect, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SaveOnWritingDirective } from '../../../directives/save-on-writing.directive';
import { SkeletonModule } from 'primeng/skeleton';
import { CacheService } from '../../../services/cache/cache.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { getNestedProperty, setNestedPropertyWithReduce } from '../../../utils/setNestedPropertyWithReduce';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule, InputTextModule, SaveOnWritingDirective, SkeletonModule, InputNumberModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionValue = '';
  @Input() pattern: 'email' | 'url' | '' = '';
  @Input() label = '';
  @Input() description = '';
  @Input() type: 'text' | 'number' = 'text';
  body = signal({ value: null });
  firstTime = signal(true);

  onChange = effect(
    () => {
      if (this.firstTime()) {
        this.body.set({ value: getNestedProperty(this.signal(), this.optionValue) });
        this.firstTime.set(false);
      }
    },
    { allowSignalWrites: true }
  );

  inputValid = computed(() => {
    if (this.pattern) {
      const valid = new RegExp(this.getPattern().pattern).test(this.signal()[this.optionValue]);

      return { valid: valid, class: valid ? '' : 'ng-invalid ng-dirty', message: this.getPattern().message };
    }
    return { valid: true, class: '', message: '' };
  });

  setValue(value: any) {
    // this.signal.set({ ...this.signal(), [this.optionValue]: value });
    this.body.set({ value: value });
    setNestedPropertyWithReduce(this.signal(), this.optionValue, value);
  }

  getPattern() {
    switch (this.pattern) {
      case 'email':
        return { pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', message: 'Please enter a valid email address.' };
      case 'url':
        return { pattern: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?(#[a-zA-Z0-9._~:/?[\]@!$&'()*+,;=%-]*)?$/, message: 'Please enter a valid URL.' };
      default:
        return { pattern: '', message: '' };
    }
  }
}
