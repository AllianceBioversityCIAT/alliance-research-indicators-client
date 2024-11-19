import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ApiService } from '@services/api.service';
import { CacheService } from '@services/cache/cache.service';
import { ChipsModule } from 'primeng/chips';
import { GeneralInformation } from '@interfaces/result/general-information.interface';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { SaveOnWritingDirective } from '../../../../../../shared/directives/save-on-writing.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { InputComponent } from '../../../../../../shared/components/custom-fields/input/input.component';
import { TextareaComponent } from '../../../../../../shared/components/custom-fields/textarea/textarea.component';
import { GetResultsService } from '../../../../../../shared/services/control-list/get-results.service';
import { GetUserStaffService } from '../../../../../../shared/services/control-list/get-user-staff.service';
import { SelectComponent } from '../../../../../../shared/components/custom-fields/select/select.component';

interface Option {
  name: string;
}

@Component({
  selector: 'app-general-information',
  standalone: true,
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule, DropdownModule, InputTextareaModule, ReactiveFormsModule, ChipsModule, SaveOnWritingDirective, InputComponent, TextareaComponent, SelectComponent],
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss'
})
export default class GeneralInformationComponent {
  actions = inject(ActionsService);
  api = inject(ApiService);
  cache = inject(CacheService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  getResultsService = inject(GetResultsService);
  getUserStaffService = inject(GetUserStaffService);
  options: Option[] | undefined;
  body: WritableSignal<GeneralInformation> = signal({ title: '', description: '', keywords: [], user_id: '', main_contact_person: { user_id: '' } });

  constructor() {
    this.getData();
  }

  async getData() {
    const response = await this.api.GET_GeneralInformation(this.cache.currentResultId());
    response.data.user_id = response.data.main_contact_person.user_id;
    this.body.set(response.data);
  }

  async saveData(page?: 'next') {
    this.body.update((current: GeneralInformation) => {
      current.main_contact_person = { user_id: current.user_id };
      return { ...current };
    });
    await this.api.PATCH_GeneralInformation(this.cache.currentResultId(), this.body());
    this.actions.showToast({ severity: 'success', summary: 'General Information', detail: 'Data saved successfully' });
    if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'alliance-alignment']);
    this.getResultsService.updateList();
    this.getData();
  }
  // onSaveSection = effect(() => {
  //   if (this.actions.saveCurrentSectionValue()) this.saveData();
  // });
}
