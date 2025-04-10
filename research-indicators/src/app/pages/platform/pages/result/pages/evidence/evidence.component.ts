import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { Router } from '@angular/router';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { Evidence, PatchResultEvidences } from '../../../../../../shared/interfaces/patch-result-evidences.interface';
import { EvidenceItemComponent } from './components/evidence-item/evidence-item.component';

@Component({
  selector: 'app-evidence',
  imports: [ButtonModule, FormsModule, InputTextModule, EvidenceItemComponent],
  templateUrl: './evidence.component.html',
})
export default class EvidenceComponent {
  value: undefined;
  actions = inject(ActionsService);
  cache = inject(CacheService);
  router = inject(Router);
  api = inject(ApiService);
  body = signal<PatchResultEvidences>(new PatchResultEvidences());
  example = signal({ evidence_url: signal('test') });
  loading = signal(false);

  constructor() {
    this.getData();
  }

  addEvidence() {
    this.body().evidence.push(new Evidence());
  }

  deleteEvidence(index: number) {
    this.body().evidence.splice(index, 1);
    this.actions.saveCurrentSection();
  }

  async getData() {
    this.loading.set(true);
  
    const response = await this.api.GET_ResultEvidences(this.cache.currentResultId());
    const data = response.data;
  
    if (!data.evidence || data.evidence.length === 0) {
      data.evidence = [new Evidence()];
    }
  
    this.body.set(data);
    this.loading.set(false);
  }
  

  async saveData(page?: 'next' | 'back') {
    this.loading.set(true);
    await this.api.PATCH_ResultEvidences(this.cache.currentResultId(), this.body());
    this.actions.showToast({ severity: 'success', summary: 'Evidence', detail: 'Data saved successfully' });
    await this.getData();
    if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'geographic-scope']);
    this.loading.set(false);
  }
}
