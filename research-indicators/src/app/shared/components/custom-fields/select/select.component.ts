/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  computed,
  effect,
  inject,
  Input,
  OnInit,
  signal,
  WritableSignal,
  TemplateRef,
  ContentChild,
  Output,
  EventEmitter
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ControlListServices } from '../../../interfaces/services.interface';
import { ServiceLocatorService } from '../../../services/service-locator.service';
import { CacheService } from '../../../services/cache/cache.service';
import { SkeletonModule } from 'primeng/skeleton';
import { UtilsService } from '../../../services/utils.service';
import { environment } from '../../../../../environments/environment';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-select',
  imports: [FormsModule, SkeletonModule, TooltipModule, SelectModule, NgTemplateOutlet],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent implements OnInit {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  utils = inject(UtilsService);
  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionLabel = '';
  @Input() optionLabel2 = '';
  @Input() optionValue = { body: '', option: '' };
  @Input() customFilterBy = '';
  @Input() serviceName: ControlListServices = '';
  @Input() label = '';
  @Input() description = '';
  @Input() placeholder = '';
  @Input() helperText = '';
  @Input() disabled = false;
  @Input() scrollHeight = '270px';
  @Input() isRequired = false;
  @Input() flagAttributes: { isoAlpha2: string; institution_location_name: string } = { isoAlpha2: '', institution_location_name: '' };
  @Input() hideSelected = true;
  @Input() textSpan = '';
  @Output() selectEvent = new EventEmitter<any>();

  @ContentChild('item') itemTemplate?: TemplateRef<any>;
  @ContentChild('selectedItemTemplate') selectedItemTemplate?: TemplateRef<any>;
  @ContentChild('selectedItems') selectedItemsTemplate?: TemplateRef<any>;
  @ContentChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  @ContentChild('rows') rowsTemplate?: TemplateRef<any>;

  allModalsService = inject(AllModalsService);

  service: any;
  body = signal({ value: null });
  environment = environment;

  isInvalid = computed(() => {
    return this.isRequired && !this.body()?.value;
  });

  selectedOption = computed(() => {
    const selectedValue = this.body()?.value;
    if (!selectedValue) return null;
    return this.service?.list()?.find((item: any) => item[this.optionValue.option] === selectedValue);
  });

  constructor(private serviceLocator: ServiceLocatorService) {}

  onSectionLoad = effect(
    () => {
      if (!this.currentResultIsLoading()) {
        this.body.update(current => {
          let value = null;

          if (this.optionValue.body.includes('.')) {
            const parts = this.optionValue.body.split('.');
            const signalValue = this.signal();

            if (Array.isArray(signalValue[parts[0]])) {
              const array = signalValue[parts[0]];
              if (array.length > 0 && array[0][parts[1]]) {
                value = array[0][parts[1]];
              }
            } else {
              value = this.utils.getNestedProperty(signalValue, this.optionValue.body);
            }
          } else {
            value = this.utils.getNestedProperty(this.signal(), this.optionValue.body);
          }

          this.utils.setNestedPropertyWithReduce(current, 'value', value);
          return { ...current };
        });
      }
    },
    { allowSignalWrites: true }
  );

  ngOnInit() {
    this.service = this.serviceLocator.getService(this.serviceName);
  }

  onFilter(event: any) {
    if (this.service?.isOpenSearch()) this.service.update(event.filter);
  }

  setValue(value: any) {
    this.selectEvent.emit(value);
    this.body.set({ value: value });

    this.signal.update(currentSignal => {
      const newSignal = { ...currentSignal };

      if (this.optionValue.body.includes('.')) {
        const parts = this.optionValue.body.split('.');
        if (Array.isArray(newSignal[parts[0]])) {
          const arrayName = parts[0];
          const propertyName = parts[1];

          if (!newSignal[arrayName] || !Array.isArray(newSignal[arrayName])) {
            newSignal[arrayName] = [];
          }

          if (newSignal[arrayName].length === 0) {
            newSignal[arrayName].push({ [propertyName]: value });
          } else {
            newSignal[arrayName][0][propertyName] = value;
          }
        } else {
          // Propiedad simple
          this.utils.setNestedPropertyWithReduce(newSignal, this.optionValue.body, value);
        }
      } else {
        this.utils.setNestedPropertyWithReduce(newSignal, this.optionValue.body, value);
      }

      return newSignal;
    });
  }
}
