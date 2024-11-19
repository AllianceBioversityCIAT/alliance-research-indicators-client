/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChangeDetectionStrategy, Component, computed, ContentChild, effect, inject, Input, signal, TemplateRef, WritableSignal, OnInit } from '@angular/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { ActionsService } from '../../../services/actions.service';
import { ServiceLocatorService } from '../../../services/service-locator.service';
import { ControlListServices } from '../../../interfaces/services.interface';
import { CacheService } from '../../../services/cache/cache.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-multiselect',
  standalone: true,
  imports: [MultiSelectModule, FormsModule, NgTemplateOutlet, SkeletonModule],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiselectComponent implements OnInit {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  actions = inject(ActionsService);
  serviceLocator = inject(ServiceLocatorService);
  @ContentChild('rows') rows!: TemplateRef<any>;

  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionLabel = '';
  @Input() optionValue = '';
  @Input() signalOptionValue = '';
  @Input() serviceName: ControlListServices = '';
  @Input() label = '';
  @Input() description = '';

  service: any;

  selectedOptions = computed(() => {
    return { data: this.objectArrayToIdArray(this.signal()[this.signalOptionValue], this.optionValue) || [] };
  });
  firstLoad = signal(true);

  onChange = effect(
    () => {
      const hasNoLabelList = this.signal()[this.signalOptionValue].filter((item: any) => !Object.prototype.hasOwnProperty.call(item, this.optionLabel));
      if (hasNoLabelList.length && this.firstLoad() && this.service?.list().length) {
        this.signal.update((current: any) => {
          return {
            ...current,
            [this.signalOptionValue]: current[this.signalOptionValue].map((item: any) => {
              const itemFound = this.service?.list().find((option: any) => option[this.optionValue] === item[this.optionValue]);
              return { ...item, ...itemFound };
            })
          };
        });
        this.firstLoad.set(false);
      }
    },
    { allowSignalWrites: true }
  );

  onGlobalLoadingChange = effect(
    () => {
      if (this.currentResultIsLoading()) {
        this.firstLoad.set(true);
      }
    },
    { allowSignalWrites: true }
  );

  ngOnInit(): void {
    this.service = this.serviceLocator.getService(this.serviceName);
  }

  onClickItem(event: number[]) {
    this.signal.update((current: any) => {
      const existingValues = this.objectArrayToIdArray(current[this.signalOptionValue], this.optionValue);
      const newOption = this.service?.list().find((option: any) => event.includes(option[this.optionValue]) && !existingValues.includes(option[this.optionValue]));

      if (newOption) {
        current[this.signalOptionValue].push(newOption);
      }

      return { ...current };
    });
  }

  objectArrayToIdArray(array: any[], attribute: string) {
    return array.map((item: any) => item[attribute]);
  }

  removeOption(option: any) {
    this.signal.update((current: any) => {
      return { ...current, [this.signalOptionValue]: current[this.signalOptionValue].filter((item: any) => item[this.optionValue] !== option[this.optionValue]) };
    });
  }
}
