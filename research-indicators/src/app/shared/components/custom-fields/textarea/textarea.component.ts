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
  @Input() description = '';
  @Input() isRequired = false;

  body = signal({ value: null });

  isInvalid = computed(() => {
    return this.isRequired && (!this.signal()[this.optionValue] || this.signal()[this.optionValue].length === 0);
  });

  setValue(value: string) {
    this.signal.set({ ...this.signal(), [this.optionValue]: value });
  }
}
