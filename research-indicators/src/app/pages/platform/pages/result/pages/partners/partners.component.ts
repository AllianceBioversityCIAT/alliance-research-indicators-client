import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ActionsService } from '@services/actions.service';
import { CacheService } from '@services/cache/cache.service';
import { Router } from '@angular/router';
import { PatchPartners } from '@interfaces/patch-partners.interface';
import { ApiService } from '@services/api.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { PartnerSelectedItemComponent } from '../../../../../../shared/components/partner-selected-item/partner-selected-item.component';
import { AllModalsService } from '@shared/services/cache/all-modals.service';

@Component({
  selector: 'app-partners',
  imports: [ButtonModule, FormsModule, MultiselectComponent, PartnerSelectedItemComponent],
  templateUrl: './partners.component.html'
})
export default class PartnersComponent {
  actions = inject(ActionsService);
  cache = inject(CacheService);
  router = inject(Router);
  api = inject(ApiService);
  allModalsService = inject(AllModalsService);
  body = signal<PatchPartners>(new PatchPartners());
  loading = signal(false);

  optionsDisabled: WritableSignal<any[]> = signal([]);

  constructor() {
    this.getData();
  }

  canRemoveInstitution = (item: any): boolean => {
    return item?.institution_role_id === 3 || item?.institution_role_id == null;
  };
  
  
  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_Partners(this.cache.currentResultId());
    this.body.set(response.data);
    this.optionsDisabled.set(response.data.institutions.filter((institution: any) => institution.institution_role_id !== 3));
    this.loading.set(false);
  }

  async saveData(page?: 'next' | 'back') {
    this.loading.set(true);
    const response = await this.api.PATCH_Partners(this.cache.currentResultId(), this.body());
    if (response.successfulRequest) {
      this.actions.showToast({ severity: 'success', summary: 'Partners', detail: 'Data saved successfully' });
      await this.getData();
      if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), this.cache.currentResultIndicatorSectionPath()]);
      if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'geographic-scope']);
    }
    this.loading.set(false);
  }

  // onSaveSection = effect(() => {
  //   if (this.actions.saveCurrentSectionValue()) this.saveData();
  // });
}
