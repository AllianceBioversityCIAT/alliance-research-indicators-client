import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ActionsService } from '@services/actions.service';
import { CacheService } from '@services/cache/cache.service';
import { Router } from '@angular/router';
import { PatchPartners } from '@interfaces/patch-partners.interface';
import { ApiService } from '@services/api.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';

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

  constructor() {
    this.getData();
  }

  async getData() {
    const response = await this.api.GET_Partners(this.cache.currentResultId());
    this.body.set(response.data);
  }

  async saveData(page?: 'next' | 'back') {
    const response = await this.api.PATCH_Partners(this.cache.currentResultId(), this.body());
    if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'alliance-alignment']);
    if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'evidence']);
    if (response.successfulRequest) this.actions.showToast({ severity: 'success', summary: 'Partners', detail: 'Data saved successfully' });
    this.getData();
  }

  // onSaveSection = effect(() => {
  //   if (this.actions.saveCurrentSectionValue()) this.saveData();
  // });
}
