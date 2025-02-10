/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  effect,
  inject,
  Input,
  signal,
  TemplateRef,
  WritableSignal,
  OnInit,
  output
} from '@angular/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { ActionsService } from '../../../services/actions.service';
import { ServiceLocatorService } from '../../../services/service-locator.service';
import { ControlListServices } from '../../../interfaces/services.interface';
import { CacheService } from '../../../services/cache/cache.service';
import { SkeletonModule } from 'primeng/skeleton';
import { UtilsService } from '../../../services/utils.service';

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
  utils = inject(UtilsService);
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
  @Input() hideSelected = false;
  selectEvent = output<any>();

  service: any;

  body: WritableSignal<any> = signal({ value: null });

  selectedOptions = computed(() => {
    return this.utils.getNestedProperty(this.signal(), this.signalOptionValue);
  });
  firstLoad = signal(true);

  onChange = effect(
    () => {
      const hasNoLabelList = this.utils
        .getNestedProperty(this.signal(), this.signalOptionValue)
        ?.filter((item: any) => !Object.prototype.hasOwnProperty.call(item, this.optionLabel));
      if (!this.currentResultIsLoading() && this.service?.list().length && this.firstLoad() && hasNoLabelList?.length) {
        this.signal.update((current: any) => {
          this.utils.setNestedPropertyWithReduce(
            current,
            this.signalOptionValue,
            this.utils.getNestedProperty(current, this.signalOptionValue)?.map((item: any) => {
              const itemFound = this.service?.list().find((option: any) => option[this.optionValue] === item[this.optionValue]);
              return { ...item, ...itemFound };
            })
          );
          return {
            ...current
          };
        });
        this.body.set({ value: this.utils.getNestedProperty(this.signal(), this.signalOptionValue)?.map((item: any) => item[this.optionValue]) });
        this.firstLoad.set(false);
      } else {
        if (
          this.utils.getNestedProperty(this.signal(), this.signalOptionValue).length &&
          !this.currentResultIsLoading() &&
          this.service?.list().length &&
          this.firstLoad()
        )
          this.body.set({ value: this.utils.getNestedProperty(this.signal(), this.signalOptionValue)?.map((item: any) => item[this.optionValue]) });
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

  onFilter(event: any) {
    if (this.service?.isOpenSearch()) this.service.update(event.filter);
  }

  setValue(event: number[]) {
    this.body.set({ value: event });

    this.signal.update((current: any) => {
      const existingValues = this.objectArrayToIdArray(this.utils.getNestedProperty(current, this.signalOptionValue), this.optionValue);

      // Find new options to add
      const newOption = this.service
        ?.list()
        .find((option: any) => event?.includes(option[this.optionValue]) && !existingValues?.includes(option[this.optionValue]));

      if (newOption) {
        const currentValues = this.utils.getNestedProperty(current, this.signalOptionValue) || [];
        this.utils.setNestedPropertyWithReduce(current, this.signalOptionValue, [...currentValues, newOption]);
      }

      // Remove options that are no longer selected
      const filteredOptions = this.utils
        .getNestedProperty(current, this.signalOptionValue)
        .filter((item: any) => event?.includes(item[this.optionValue]));
      this.utils.setNestedPropertyWithReduce(current, this.signalOptionValue, filteredOptions);

      this.selectEvent.emit(current);
      return { ...current };
    });
  }

  objectArrayToIdArray(array: any[], attribute: string) {
    return array?.map((item: any) => item[attribute]);
  }

  removeOption(option: any) {
    this.signal.update((current: any) => {
      const updatedOptions = this.utils
        .getNestedProperty(current, this.signalOptionValue)
        .filter((item: any) => item[this.optionValue] !== option[this.optionValue]);

      // Update the body signal with the new list of option values
      this.body.set({ value: this.objectArrayToIdArray(updatedOptions, this.optionValue) });

      this.utils.setNestedPropertyWithReduce(current, this.signalOptionValue, updatedOptions);
      return { ...current };
    });
  }
}
