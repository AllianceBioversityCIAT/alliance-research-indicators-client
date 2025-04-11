import { Component, computed, inject, OnInit, effect, signal, WritableSignal } from '@angular/core';
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
import { PartnerSelectedItemComponent } from '../../../../../../shared/components/partner-selected-item/partner-selected-item.component';
import { SubmissionService } from '@shared/services/submission.service';
@Component({
  selector: 'app-capacity-sharing',
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
    MultiselectComponent,
    PartnerSelectedItemComponent
  ],
  templateUrl: './capacity-sharing.component.html'
})
export default class CapacitySharingComponent implements OnInit {
  api = inject(ApiService);
  actions = inject(ActionsService);
  cache = inject(CacheService);
  router = inject(Router);
  body: WritableSignal<GetCapSharing> = signal({});
  submission = inject(SubmissionService);
  loading = signal(false);

  constructor() {
    effect(() => {
      if (!this.isLongTermSelected()) {
        const current = this.body();
        if (current?.degree_id) {
          this.body.update(b => ({
            ...b,
            degree_id: undefined
          }));
        }
      }
    });
  }

  ngOnInit() {
    this.getData();
  }

  isLongTermSelected = computed(() => this.body()?.session_length_id === 2);

  canRemove = (): boolean => {
    return this.submission.isEditableStatus();
  };

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
}
