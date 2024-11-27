/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, effect, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ControlListServices } from '../../../interfaces/services.interface';
import { ServiceLocatorService } from '../../../services/service-locator.service';
import { CacheService } from '../../../services/cache/cache.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [DropdownModule, FormsModule, SkeletonModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent implements OnInit {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  @Input() signal: WritableSignal<any> = signal({});
  @Input() options: WritableSignal<any> = signal({});
  @Input() optionLabel = '';
  @Input() optionValue = { body: '', option: '' };
  @Input() serviceName: ControlListServices = '';
  @Input() label = '';
  @Input() description = '';
  @Input() disabled = false;

  service: any;
  value = '';

  constructor(private serviceLocator: ServiceLocatorService) {}

  onSectionLoad = effect(() => {
    if (!this.currentResultIsLoading()) this.value = this.signal()[this.optionValue.body];
  });

  ngOnInit(): void {
    this.service = this.serviceLocator.getService(this.serviceName);
  }

  onClickItem(event: any) {
    this.signal.update((current: any) => {
      current[this.optionValue.body] = event;
      return { ...current };
    });
  }
}
