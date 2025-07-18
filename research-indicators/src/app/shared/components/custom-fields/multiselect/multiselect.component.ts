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
import { environment } from '../../../../../environments/environment';
import { TooltipModule } from 'primeng/tooltip';
import { AllModalsService } from '@shared/services/cache/all-modals.service';

@Component({
  selector: 'app-multiselect',
  standalone: true,
  imports: [MultiSelectModule, FormsModule, NgTemplateOutlet, SkeletonModule, TooltipModule],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiselectComponent implements OnInit {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  utils = inject(UtilsService);
  actions = inject(ActionsService);
  serviceLocator = inject(ServiceLocatorService);
  allModalsService = inject(AllModalsService);

  @ContentChild('rows') rows!: TemplateRef<any>;
  @ContentChild('selectedItems') selectedItems!: TemplateRef<any>;
  @ContentChild('item') item!: TemplateRef<any>;

  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionLabel = '';
  @Input() optionValue = '';
  @Input() signalOptionValue = '';
  @Input() serviceName: ControlListServices = '';
  @Input() label = '';
  @Input() description = '';
  @Input() hideSelected = false;
  @Input() disabledSelectedScroll = false;
  @Input() flagAttributes: { isoAlpha2: string; institution_location_name: string } = { isoAlpha2: '', institution_location_name: '' };
  @Input() removeCondition: (item: any) => boolean = () => true;
  @Input() removeTooltip = '';
  @Input() disabled = false;
  @Input() optionsDisabled: WritableSignal<any[]> = signal([]);
  @Input() set isRequired(value: boolean) {
    this._isRequired.set(value);
  }
  _isRequired = signal(false);
  @Input() helperText = '';
  @Input() textSpan = '';
  @Input() columnsOnXl = false;

  selectEvent = output<any>();
  environment = environment;

  service: any;

  body: WritableSignal<any> = signal({ value: null });

  useDisabled = computed(() => this.optionsDisabled()?.length);

  listWithDisabled = computed(() => {
    return this.service
      ?.list()
      .map((item: any) => ({ ...item, disabled: this.optionsDisabled().find((option: any) => option[this.optionValue] === item[this.optionValue]) }));
  });

  isInvalid = computed(() => {
    return this._isRequired() && (!this.selectedOptions() || this.selectedOptions()?.length === 0);
  });

  selectedOptions = computed(() => {
    return this.utils.getNestedProperty(this.signal(), this.signalOptionValue);
  });
  firstLoad = signal(true);

  onChange = effect(
    () => {
      const hasNoLabelList = this.utils
        .getNestedProperty(this.signal(), this.signalOptionValue)
        ?.filter((item: any) => !Object.hasOwn(item, this.optionLabel));
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
      } else if (
        this.utils.getNestedProperty(this.signal(), this.signalOptionValue)?.length &&
        !this.currentResultIsLoading() &&
        this.service?.list().length &&
        this.firstLoad()
      ) {
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

  clear() {
    this.body.set({ value: null });
    this.signal.update(prev => ({
      ...prev,
      [this.signalOptionValue]: []
    }));
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
        const currentValues = this.utils.getNestedProperty(current, this.signalOptionValue) ?? [];
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

      this.body.set({ value: this.objectArrayToIdArray(updatedOptions, this.optionValue) });

      this.utils.setNestedPropertyWithReduce(current, this.signalOptionValue, updatedOptions);
      return { ...current };
    });
  }
}
