/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CacheService } from '../../../services/cache/cache.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-calendar-input',
  standalone: true,
  imports: [CalendarModule, FormsModule, SkeletonModule],
  templateUrl: './calendar-input.component.html',
  styleUrl: './calendar-input.component.scss'
})
export class CalendarInputComponent {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionValue = '';
  @Input() label = '';
  @Input() description = '';
  @Input() minDate: any = null;
  @Input() maxDate: any = null;
  setValue(value: string) {
    this.signal.set({ ...this.signal(), [this.optionValue]: value });
  }
}
