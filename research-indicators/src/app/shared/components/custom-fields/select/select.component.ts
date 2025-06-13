/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, computed, effect, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
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

@Component({
  selector: 'app-select',
  imports: [FormsModule, SkeletonModule, TooltipModule, SelectModule],
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
  @Input() serviceName: ControlListServices = '';
  @Input() label = '';
  @Input() description = '';
  @Input() placeholder = '';
  @Input() helperText = '';
  @Input() disabled = false;
  @Input() isRequired = false;
  @Input() flagAttributes: { isoAlpha2: string; institution_location_name: string } = { isoAlpha2: '', institution_location_name: '' };

  allModalsService = inject(AllModalsService);

  service: any;
  body = signal({ value: null });
  environment = environment;

  isInvalid = computed(() => {
    return this.isRequired && !this.body()?.value;
  });

  constructor(private serviceLocator: ServiceLocatorService) {}

  onSectionLoad = effect(
    () => {
      if (!this.currentResultIsLoading())
        this.body.update(current => {
          this.utils.setNestedPropertyWithReduce(current, 'value', this.utils.getNestedProperty(this.signal(), this.optionValue.body));
          return { ...current };
        });
    },
    { allowSignalWrites: true }
  );

  ngOnInit(): void {
    this.service = this.serviceLocator.getService(this.serviceName);
  }

  onFilter(event: any) {
    if (this.service?.isOpenSearch()) this.service.update(event.filter);
  }

  setValue(value: any) {
    this.body.set({ value: value });
    this.utils.setNestedPropertyWithReduceSignal(this.signal, this.optionValue.body, value);
  }
}
