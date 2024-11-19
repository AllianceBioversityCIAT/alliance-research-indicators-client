/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, computed, Input, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SaveOnWritingDirective } from '../../../directives/save-on-writing.directive';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule, InputTextModule, SaveOnWritingDirective],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionValue = '';
  @Input() pattern: 'email' | 'url' | '' = '';
  @Input() label = '';
  @Input() description = '';

  inputValid = computed(() => {
    if (this.pattern) {
      const valid = new RegExp(this.getPattern().pattern).test(this.signal()[this.optionValue]);

      return { valid: valid, class: valid ? '' : 'ng-invalid ng-dirty', message: this.getPattern().message };
    }
    return { valid: true, class: '', message: '' };
  });

  setValue(value: string) {
    this.signal.set({ ...this.signal(), [this.optionValue]: value });
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
