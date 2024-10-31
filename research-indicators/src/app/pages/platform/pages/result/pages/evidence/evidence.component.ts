import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { Router } from '@angular/router';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { Evidence, PatchResultEvidences } from '../../../../../../shared/interfaces/patch-result-evidences.interface';
import { SaveOnWritingDirective } from '../../../../../../shared/directives/save-on-writing.directive';

@Component({
  selector: 'app-evidence',
  standalone: true,
  imports: [ButtonModule, InputTextareaModule, FormsModule, InputTextModule, SaveOnWritingDirective],
  templateUrl: './evidence.component.html',
  styleUrl: './evidence.component.scss'
})
export default class EvidenceComponent {
  value: undefined;
  actions = inject(ActionsService);
  cache = inject(CacheService);
  router = inject(Router);
  api = inject(ApiService);
  body = signal<PatchResultEvidences>(new PatchResultEvidences());

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
    const response = await this.api.GET_ResultEvidences(this.cache.currentResultId());
    this.body.set(response.data || new PatchResultEvidences());
  }

  async saveData(page?: 'next' | 'back') {
    await this.api.PATCH_ResultEvidences(this.cache.currentResultId(), this.body());
    this.actions.showToast('success', 'Evidence', 'Data saved successfully');
    if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'partners']);
  }

  onSaveSection = effect(() => {
    if (this.actions.saveCurrentSectionValue()) this.saveData();
  });
}
