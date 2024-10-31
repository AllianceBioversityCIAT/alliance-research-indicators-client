import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { Router } from '@angular/router';
import { GetInstitutionsService } from '../../../../../../shared/services/control-list/get-institutions.service';
import { PatchPartners } from '../../../../../../shared/interfaces/patch-partners.interface';
import { ApiService } from '../../../../../../shared/services/api.service';

interface Organizations {
  name: string;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [ButtonModule, FormsModule, MultiSelectModule],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss'
})
export default class PartnersComponent {
  actions = inject(ActionsService);
  cache = inject(CacheService);
  router = inject(Router);
  getInstitutionsService = inject(GetInstitutionsService);
  api = inject(ApiService);
  body = signal<PatchPartners>(new PatchPartners());

  constructor() {
    this.getData();
  }

  async getData() {
    const response: any = await this.api.GET_Partners(this.cache.currentResultId());
    this.body.set(response.data);
    console.log(response.data);
  }

  async saveData(page?: 'next' | 'back') {
    console.log(this.body());
    await this.api.PATCH_Partners(this.cache.currentResultId(), this.body());
    if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'evidence']);
    if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'general-information']);
  }

  onSaveSection = effect(() => {
    if (this.actions.saveCurrentSectionValue()) this.saveData();
  });
}
