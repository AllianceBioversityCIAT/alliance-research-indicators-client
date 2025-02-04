import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { SelectComponent } from '../../../../../../shared/components/custom-fields/select/select.component';
import { GetCapSharing } from '../../../../../../shared/interfaces/get-cap-sharing.interface';
import { Router } from '@angular/router';
import { InputComponent } from '../../../../../../shared/components/custom-fields/input/input.component';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { CalendarInputComponent } from '../../../../../../shared/components/custom-fields/calendar-input/calendar-input.component';

@Component({
  selector: 'app-capacity-sharing',
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    RadioButtonModule,
    RadioButtonComponent,
    SelectComponent,
    InputComponent,
    CalendarInputComponent,
    MultiselectComponent
  ],
  templateUrl: './capacity-sharing.component.html',
  styleUrl: './capacity-sharing.component.scss'
})
export default class CapacitySharingComponent {
  api = inject(ApiService);
  actions = inject(ActionsService);
  cache = inject(CacheService);
  router = inject(Router);
  body: WritableSignal<GetCapSharing> = signal({});
  loading = signal(false);

  constructor() {
    this.getData();
  }

  isStartDateGreaterThanEndDate = computed(() => {
    const { start_date, end_date } = this.body() || {};
    if (!start_date || !end_date) return false;
    return new Date(start_date).getTime() > new Date(end_date).getTime();
  });

  async getData() {
    this.cache.loadingCurrentResult.set(true);
    const response = await this.api.GET_CapacitySharing();
    this.body.set(response.data);
    this.cache.loadingCurrentResult.set(false);
    this.body.update(current => {
      if (current.start_date) current.start_date = new Date(current.start_date || '');
      if (current.end_date) current.end_date = new Date(current.end_date || '');
      return { ...current };
    });
    this.loading.set(false);
  }

  async saveData(page?: 'next' | 'back') {
    this.loading.set(true);
    this.body.update(current => {
      if (current.start_date) current.start_date = new Date(current.start_date || '').toISOString();
      if (current.end_date) current.end_date = new Date(current.end_date || '').toISOString();

      return { ...current };
    });

    await this.api.PATCH_CapacitySharing(this.body());
    this.actions.showToast({ severity: 'success', summary: 'Capacity Sharing', detail: 'Data saved successfully' });
    await this.getData();
    if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'partners']);
    if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'alliance-alignment']);
    this.loading.set(false);
  }

  // onSaveSection = effect(() => {
  //   if (this.actions.saveCurrentSectionValue()) this.saveData();
  // });
}
