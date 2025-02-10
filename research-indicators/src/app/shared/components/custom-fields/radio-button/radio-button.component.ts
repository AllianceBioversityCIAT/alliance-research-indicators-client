/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, effect, inject, Input, OnInit, output, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CacheService } from '../../../services/cache/cache.service';
import { SkeletonModule } from 'primeng/skeleton';
import { ActionsService } from '../../../services/actions.service';
import { ServiceLocatorService } from '../../../services/service-locator.service';
import { ControlListServices } from '../../../interfaces/services.interface';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-radio-button',
  standalone: true,
  imports: [RadioButtonModule, FormsModule, SkeletonModule],
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.scss'
})
export class RadioButtonComponent implements OnInit {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  cache = inject(CacheService);
  actions = inject(ActionsService);
  utils = inject(UtilsService);
  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionLabel = '';
  @Input() optionValue = { body: '', option: '' };
  @Input() serviceName: ControlListServices = '';
  @Input() label = '';
  @Input() description = '';
  selectEvent = output<any>();
  service: any;
  body = signal({ value: null });
  firstTime = signal(true);
  onChange = effect(
    () => {
      if (!this.currentResultIsLoading() && this.firstTime() && !this.service.loading()) {
        this.setValue(this.utils.getNestedPropertySignal(this.signal, this.optionValue.body));
        this.firstTime.set(false);
      }
    },
    { allowSignalWrites: true }
  );

  constructor(private serviceLocator: ServiceLocatorService) {}
  ngOnInit(): void {
    this.service = this.serviceLocator.getService(this.serviceName);
  }

  setValue(value: any) {
    this.body.set({ value: value });
    this.utils.setNestedPropertyWithReduceSignal(this.signal, this.optionValue.body, value);
    this.selectEvent.emit(value);
  }
}
