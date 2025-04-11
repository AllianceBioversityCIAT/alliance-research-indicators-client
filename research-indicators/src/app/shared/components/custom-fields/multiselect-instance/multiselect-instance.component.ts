/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, computed, ContentChild, effect, inject, Input, signal, TemplateRef, WritableSignal, OnInit, output } from '@angular/core';
import { MultiSelectChangeEvent, MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { ActionsService } from '../../../services/actions.service';
import { ServiceLocatorService } from '../../../services/service-locator.service';
import { ControlListServices } from '../../../interfaces/services.interface';
import { CacheService } from '../../../services/cache/cache.service';
import { SkeletonModule } from 'primeng/skeleton';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-multiselect-instance',
  imports: [MultiSelectModule, FormsModule, SkeletonModule],
  templateUrl: './multiselect-instance.component.html',
  styleUrl: './multiselect-instance.component.scss'
})
export class MultiselectInstanceComponent implements OnInit {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  utils = inject(UtilsService);
  actions = inject(ActionsService);
  serviceLocator = inject(ServiceLocatorService);
  listInstance = signal<any[]>([]);
  loadingList = signal(false);
  @ContentChild('rows') rows!: TemplateRef<any>;

  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionLabel = '';
  @Input() optionValue = '';
  @Input() signalOptionValue = '';
  @Input() serviceName: ControlListServices = '';
  @Input() label = '';
  @Input() description = '';
  @Input() hideSelected = false;
  @Input() disabled = false;
  @Input() endpointParams: any = {};
  selectEvent = output<any>();

  service: any;

  body: WritableSignal<any> = signal({ value: null });

  selectedOptions = computed(() => {
    return this.utils.getNestedProperty(this.signal(), this.signalOptionValue);
  });
  firstLoad = signal(true);

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
    this.body.set({ value: this.objectArrayToIdArray(this.utils.getNestedProperty(this.signal(), this.signalOptionValue), this.optionValue) });

    // Setup debounced search

    this.getListInstance();
  }

  getListInstance = async () => {
    this.loadingList.set(true);
    const signal = await this.service.getInstance(this.endpointParams);
    this.listInstance.set(signal());
    this.loadingList.set(false);
  };

  objectArrayToIdArray(array: any[], attribute: string) {
    return array?.map((item: any) => item[attribute]);
  }

  setValue(event: MultiSelectChangeEvent) {
    this.signal.update((current: any) => {
      const currentArray = this.utils.getNestedProperty(current, this.signalOptionValue) || [];

      // Si el elemento existe en currentArray pero no en event.value, significa que se eliminó
      // Si el elemento existe en event.value pero no en currentArray, significa que se agregó
      const itemExists = currentArray.some((item: any) => item[this.optionValue] === event.itemValue[this.optionValue]);

      if (!itemExists) {
        // El elemento no existe, por lo tanto se está agregando
        this.utils.setNestedPropertyWithReduce(current, this.signalOptionValue, [...currentArray, event.itemValue]);
      } else {
        // El elemento existe, por lo tanto se está eliminando
        const newArray = currentArray.filter((item: any) => item[this.optionValue] !== event.itemValue[this.optionValue]);
        this.utils.setNestedPropertyWithReduce(current, this.signalOptionValue, newArray);
      }

      // Actualizar el body signal con los nuevos valores
      const updatedArray = this.utils.getNestedProperty(current, this.signalOptionValue);
      this.body.set({ value: this.objectArrayToIdArray(updatedArray, this.optionValue) });

      return { ...current };
    });

    // Emitir el evento de selección
    this.selectEvent.emit(event);
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
