import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { GetCapSharingService } from '../../../../../../shared/services/control-list/get-cap-sharing.service';
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
  imports: [ButtonModule, FormsModule, DropdownModule, CalendarModule, RadioButtonModule, RadioButtonComponent, SelectComponent, InputComponent, CalendarInputComponent, MultiselectComponent],
  templateUrl: './capacity-sharing.component.html',
  styleUrl: './capacity-sharing.component.scss'
})
export default class CapacitySharingComponent {
  getCapSharingService = inject(GetCapSharingService);
  api = inject(ApiService);
  actions = inject(ActionsService);
  cache = inject(CacheService);
  router = inject(Router);
  body: WritableSignal<GetCapSharing> = signal({});
  loading = signal(false);
  yesOrNoOptions: WritableSignal<{ list: { name: string; value: boolean | number }[]; loading: boolean }> = signal({
    list: [
      { name: 'Yes', value: 0 },
      { name: 'No', value: 1 }
    ],
    loading: false
  });

  constructor() {
    this.getData();
  }

  async getData() {
    this.cache.loadingCurrentResult.set(true);
    const response = await this.api.GET_CapacitySharing();
    this.body.set(response.data);
    this.cache.loadingCurrentResult.set(false);
    this.body.update(current => {
      if (current.start_date) current.start_date = new Date(current.start_date || '');
      if (current.end_date) current.end_date = new Date(current.end_date || '');
      this.mapAuxValues(current);
      return { ...current };
    });
    this.loading.set(false);
  }

  mapAuxValues(current: GetCapSharing) {
    current.loaded = true;
    current.aux_trainee_name = current.individual?.trainee_name;
    current.aux_institution_id = current?.individual?.affiliation?.institution_id;
    current.aux_isoAlpha2 = current?.individual?.nationality?.isoAlpha2;
    current.aux_language_id = current?.training_supervisor_languages?.language_id;
    current.aux_user_id = current?.training_supervisor?.user_id;
    // group training
    current.aux_session_participants_total = current.group?.session_participants_total;
    current.aux_session_participants_male = current.group?.session_participants_male;
    current.aux_session_participants_female = current.group?.session_participants_female;
    current.aux_session_participants_non_binary = current.group?.session_participants_non_binary;
    current.aux_session_purpose_id = current.group?.session_purpose_id;
    current.aux_session_purpose_description = current.group?.session_purpose_description;
    current.aux_is_attending_organization = current.group?.is_attending_organization;
    current.aux_trainee_organization_representative = current.group?.trainee_organization_representative;
  }

  deMapAuxValues(current: GetCapSharing) {
    if (!current.individual) current.individual = {};

    current.individual.trainee_name = current.aux_trainee_name;
    current.individual.affiliation = { institution_id: current.aux_institution_id };
    current.individual.nationality = { isoAlpha2: current.aux_isoAlpha2 };
    current.training_supervisor_languages = { language_id: current.aux_language_id };
    current.training_supervisor = { user_id: current.aux_user_id };
    if (current.group) {
      current.group.session_participants_total = current.aux_session_participants_total;
      current.group.session_participants_male = current.aux_session_participants_male;
      current.group.session_participants_female = current.aux_session_participants_female;
      current.group.session_participants_non_binary = current.aux_session_participants_non_binary;
      current.group.session_purpose_id = current.aux_session_purpose_id;
      current.group.session_purpose_description = current.aux_session_purpose_description;
      current.group.is_attending_organization = current.aux_is_attending_organization;
      current.group.trainee_organization_representative = current.aux_trainee_organization_representative;
    }
  }

  async saveData(page?: 'next' | 'back') {
    this.body.update(current => {
      if (current.start_date) current.start_date = new Date(current.start_date || '').toISOString();
      if (current.end_date) current.end_date = new Date(current.end_date || '').toISOString();

      this.deMapAuxValues(current);
      return { ...current };
    });

    await this.api.PATCH_CapacitySharing(this.body());
    if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'partners']);
    if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'alliance-alignment']);
    this.actions.showToast({ severity: 'success', summary: 'Capacity Sharing', detail: 'Data saved successfully' });
    this.getData();
  }

  // onSaveSection = effect(() => {
  //   if (this.actions.saveCurrentSectionValue()) this.saveData();
  // });
}
