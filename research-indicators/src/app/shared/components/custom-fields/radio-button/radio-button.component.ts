/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, effect, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CacheService } from '../../../services/cache/cache.service';
import { SkeletonModule } from 'primeng/skeleton';
import { ActionsService } from '../../../services/actions.service';
import { ServiceLocatorService } from '../../../services/service-locator.service';
import { ControlListServices } from '../../../interfaces/services.interface';
import { setNestedPropertyWithReduce } from '@utils/setNestedPropertyWithReduce';

@Component({
  selector: 'app-radio-button',
  standalone: true,
  imports: [RadioButtonModule, FormsModule, SkeletonModule],
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.scss'
})
export class RadioButtonComponent implements OnInit {
  cache = inject(CacheService);
  actions = inject(ActionsService);
  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionLabel = '';
  @Input() optionValue = { body: '', option: '' };
  @Input() serviceName: ControlListServices = '';
  @Input() label = '';
  @Input() description = '';

  body = signal({ value: null });
  firstTime = signal(false);
  onChange = effect(
    () => {
      if (!this.signal().loading && this.firstTime) {
        this.body.update(current => {
          setNestedPropertyWithReduce(current, 'value', this.getNestedProperty(this.signal(), this.optionValue.body));
          return { ...current };
        });
        this.firstTime.set(true);
      }
    },
    { allowSignalWrites: true }
  );

  service: any;
  constructor(private serviceLocator: ServiceLocatorService) {}
  ngOnInit(): void {
    this.service = this.serviceLocator.getService(this.serviceName);
  }

  changeValue(value: any) {
    this.body.set({ value: value });
    setNestedPropertyWithReduce(this.signal(), this.optionValue.body, value);
    this.actions.saveCurrentSection();
  }

  getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
  }
}
