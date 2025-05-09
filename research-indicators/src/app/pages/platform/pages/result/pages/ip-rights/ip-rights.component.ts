import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { RadioButtonComponent } from '@shared/components/custom-fields/radio-button/radio-button.component';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';
import { SubmissionService } from '@shared/services/submission.service';
import { PatchIpOwner } from '@shared/interfaces/patch-ip-owners';
import { ActionsService } from '@shared/services/actions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgStyle } from '@angular/common';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { VersionSelectorComponent } from '../../components/version-selector/version-selector.component';

@Component({
  selector: 'app-ip-rights',
  imports: [ButtonModule, NgStyle, FormsModule, VersionSelectorComponent, RadioButtonComponent, InputComponent],
  templateUrl: './ip-rights.component.html'
})
export default class IpRightsComponent implements OnInit {
  api = inject(ApiService);
  router = inject(Router);
  body: WritableSignal<PatchIpOwner> = signal({});
  cache = inject(CacheService);
  actions = inject(ActionsService);
  loading = signal(false);
  submission = inject(SubmissionService);
  versionWatcher = inject(VersionWatcherService);
  route = inject(ActivatedRoute);

  constructor() {
    this.versionWatcher.onVersionChange(() => {
      this.getData();
    });
  }

  ngOnInit() {
    this.getData();
  }

  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_IpOwner(this.cache.currentResultId());
    this.body.set(response.data);
    this.loading.set(false);
  }

  async saveData(page?: 'back'): Promise<void> {
    this.loading.set(true);

    const resultId = this.cache.currentResultId().toString();
    const version = this.route.snapshot.queryParamMap.get('version');
    const queryParams = version ? { version } : undefined;

    const navigateTo = (path: string) => {
      this.router.navigate(['result', resultId, path], {
        queryParams,
        replaceUrl: true
      });
    };

    if (this.submission.isEditableStatus()) {
      const current = this.body();

      if (current.asset_ip_owner !== 4) {
        current.asset_ip_owner_description = null;
        this.body.set({ ...current });
      }

      const response = await this.api.PATCH_IpOwners(Number(resultId), this.body());
      if (!response.successfulRequest) {
        this.loading.set(false);
        return;
      }

      await this.getData();

      this.actions.showToast({
        severity: 'success',
        summary: 'IP rights',
        detail: 'Data saved successfully'
      });
    }

    if (page === 'back') navigateTo('evidence');

    this.loading.set(false);
  }
}
