import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { Evidence, PatchResultEvidences } from '../../../../../../shared/interfaces/patch-result-evidences.interface';
import { EvidenceItemComponent } from './components/evidence-item/evidence-item.component';
import { SubmissionService } from '@shared/services/submission.service';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';

@Component({
  selector: 'app-evidence',
  imports: [ButtonModule, FormHeaderComponent, NavigationButtonsComponent, FormsModule, InputTextModule, EvidenceItemComponent],
  templateUrl: './evidence.component.html'
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
  submission = inject(SubmissionService);
  versionWatcher = inject(VersionWatcherService);
  route = inject(ActivatedRoute);

  constructor() {
    this.versionWatcher.onVersionChange(() => {
      this.getData();
    });
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

    const resultId = Number(this.cache.currentResultId());
    const version = this.route.snapshot.queryParamMap.get('version');
    const queryParams = version ? { version } : undefined;

    const navigateTo = (path: string) => {
      this.router.navigate(['result', resultId, path], {
        queryParams,
        replaceUrl: true
      });
    };

    if (this.submission.isEditableStatus()) {
      await this.api.PATCH_ResultEvidences(resultId, this.body());

      this.actions.showToast({
        severity: 'success',
        summary: 'Evidence',
        detail: 'Data saved successfully'
      });

      await this.getData();
    }

    if (page === 'back') navigateTo('geographic-scope');
    if (page === 'next') navigateTo('ip-rights');

    this.loading.set(false);
  }
}
