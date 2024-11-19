/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SaveOnWritingDirective } from '../../../directives/save-on-writing.directive';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { CacheService } from '../../../services/cache/cache.service';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [FormsModule, InputTextareaModule, SaveOnWritingDirective, SkeletonModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss'
})
export class TextareaComponent {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionValue = '';
  @Input() label = '';
  @Input() description = '';

  setValue(value: string) {
    this.signal.set({ ...this.signal(), [this.optionValue]: value });
  }
}
