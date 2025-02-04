import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ActionsService } from '@services/actions.service';
import { CacheService } from '@services/cache/cache.service';
import { Router } from '@angular/router';
import { PatchPartners } from '@interfaces/patch-partners.interface';
import { ApiService } from '@services/api.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { environment } from '../../../../../../../environments/environment';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [ButtonModule, FormsModule, MultiselectComponent],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss'
})
export default class PartnersComponent {
  actions = inject(ActionsService);
  cache = inject(CacheService);
  router = inject(Router);
  api = inject(ApiService);
  body = signal<PatchPartners>(new PatchPartners());
  loading = signal(false);
  environment = environment;

  constructor() {
    this.getData();
  }

  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_Partners(this.cache.currentResultId());
    this.body.set(response.data);
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
