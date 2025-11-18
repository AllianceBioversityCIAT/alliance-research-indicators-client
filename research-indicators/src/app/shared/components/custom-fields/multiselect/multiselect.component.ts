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
  OnChanges,
  SimpleChanges,
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
export class MultiselectComponent implements OnInit, OnChanges {
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
  @Input() hideTemplate = false;
  @Input() disabledSelectedScroll = false;
  @Input() flagAttributes: { isoAlpha2: string; institution_location_name: string } = { isoAlpha2: '', institution_location_name: '' };
  @Input() removeCondition: (item: any) => boolean = () => true;
  @Input() removeTooltip = '';
  @Input() disabled = false;
  @Input() filterBy = '';
  @Input() optionsDisabled: WritableSignal<any[]> = signal([]);
  @Input() set isRequired(value: boolean) {
    this._isRequired.set(value);
  }
  _isRequired = signal(false);
  @Input() helperText = '';
  @Input() textSpan = '';
  @Input() columnsOnXl = false;
  @Input() placeholder = '';
  @Input() serviceParams: unknown;

  @Input() scrollHeight = '268px';
  @Input() itemHeight = 41;
  @Input() enableVirtualScroll = true;
  @Input() dark = false;
  selectEvent = output<any>();
  environment = environment;

  service: any;
  // Local per-component signals for parameterized services
  optionsSig: WritableSignal<any[]> = signal<any[]>([]);
  loadingSig: WritableSignal<boolean> = signal<boolean>(false);

  body: WritableSignal<any> = signal({ value: null });

  useDisabled = computed(() => this.optionsDisabled()?.length);

  listWithDisabled = computed(() => {
    const items = this.optionsSig() ?? [];
    return items.map((item: any) => ({
      ...item,
      disabled: this.optionsDisabled().find((option: any) => option[this.optionValue] === item[this.optionValue])
    }));
  });

  isInvalid = computed(() => {
    return this._isRequired() && (!this.selectedOptions() || this.selectedOptions()?.length === 0);
  });

  selectedOptions = computed(() => {
    const items = this.utils.getNestedProperty(this.signal(), this.signalOptionValue);
    const normalized = Array.isArray(items) ? items : [];
    return normalized.map((item: any) => ({
      ...item,
      disabled: Boolean(this.optionsDisabled().find((option: any) => option[this.optionValue] === item[this.optionValue]))
    }));
  });
  firstLoad = signal(true);

  onChange = effect(
    () => {
      const hasNoLabelList = this.utils
        .getNestedProperty(this.signal(), this.signalOptionValue)
        ?.filter((item: any) => !Object.hasOwn(item, this.optionLabel));
      if (!this.currentResultIsLoading() && this.optionsSig()?.length && this.firstLoad() && hasNoLabelList?.length) {
        this.signal.update((current: any) => {
          this.utils.setNestedPropertyWithReduce(
            current,
            this.signalOptionValue,
            this.utils.getNestedProperty(current, this.signalOptionValue)?.map((item: any) => {
              const itemFound = this.optionsSig()?.find((option: any) => option[this.optionValue] === item[this.optionValue]);
              return { ...item, ...itemFound };
            })
          );
          return {
            ...current
          };
        });
        this.setBodyFromSignal();
        this.firstLoad.set(false);
      /* istanbul ignore next */
      } else if (
        this.utils.getNestedProperty(this.signal(), this.signalOptionValue)?.length &&
        !this.currentResultIsLoading() &&
        this.optionsSig()?.length &&
        this.firstLoad()
      ) {
        /* istanbul ignore next */
        this.setBodyFromSignal();
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
    this.bindServiceSignals();
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serviceName'] || changes['serviceParams']) {
      this.service = this.serviceLocator.getService(this.serviceName);
      this.bindServiceSignals();
      this.loadData();
    }
  }

  private bindServiceSignals() {
    if (this.service?.getList && this.service?.getLoading) {
      const listSig = this.service.getList(this.serviceParams as any);
      const loadingSig = this.service.getLoading(this.serviceParams as any);
      if (listSig) this.optionsSig = listSig;
      if (loadingSig) this.loadingSig = loadingSig;
    } else {
      if (this.service?.list) this.optionsSig = this.service.list;
      if (this.service?.loading) this.loadingSig = this.service.loading;
    }
  }

  private async loadData() {
    if (this.service && typeof this.service.main === 'function') {
      try {
        await this.service.main(this.serviceParams as any);
      } catch {
        // ignore
      }
    }
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
      const newOption = this.optionsSig()
        .find((option: any) => event?.includes(option[this.optionValue]) && !existingValues?.includes(option[this.optionValue]));

      if (newOption) {
        /* istanbul ignore next */
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

  setBodyFromSignal(): void {
    this.body.set({
      value: this.utils
        .getNestedProperty(this.signal(), this.signalOptionValue)
        ?.map((item: any) => item[this.optionValue])
    });
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

  removeById(id: string | number) {
    const option = this.service?.list()?.find((o: any) => o?.[this.optionValue] === id);
    if (option) this.removeOption(option);
  }
}
