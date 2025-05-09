import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { GetContractsService } from '@services/control-list/get-contracts.service';
import { FormsModule } from '@angular/forms';
import { GetLeversService } from '@services/control-list/get-levers.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { ButtonModule } from 'primeng/button';
import { GetAllianceAlignment } from '../../../../../../shared/interfaces/get-alliance-alignment.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, NgStyle } from '@angular/common';
import { environment } from '../../../../../../../environments/environment';
import { SubmissionService } from '@shared/services/submission.service';
import { VersionSelectorComponent } from '../../components/version-selector/version-selector.component';
import { VersionWatcherService } from '@shared/services/version-watcher.service';

@Component({
  selector: 'app-alliance-alignment',
  imports: [MultiSelectModule, VersionSelectorComponent, NgStyle, FormsModule, MultiselectComponent, ButtonModule, DatePipe],
  templateUrl: './alliance-alignment.component.html'
})
export default class AllianceAlignmentComponent implements OnInit {
  environment = environment;
  getContractsService = inject(GetContractsService);
  getLeversService = inject(GetLeversService);
  body: WritableSignal<GetAllianceAlignment> = signal({
    contracts: [],
    levers: []
  });
  apiService = inject(ApiService);
  cache = inject(CacheService);
  actions = inject(ActionsService);
  router = inject(Router);
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
    const response = await this.apiService.GET_Alignments(this.cache.currentResultId());
    this.body.set(response.data);
  }

  canRemove = (): boolean => {
    return this.submission.isEditableStatus();
  };

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

    const nextPath = this.cache.currentResultIndicatorSectionPath();

    if (this.submission.isEditableStatus()) {
      const response = await this.apiService.PATCH_Alignments(resultId, this.body());
      if (response.successfulRequest) {
        this.actions.showToast({
          severity: 'success',
          summary: 'Alliance Alignment',
          detail: 'Data saved successfully'
        });

        await this.getData();

        if (page === 'back') navigateTo('general-information');
        if (page === 'next') navigateTo(nextPath);
      }
    } else {
      if (page === 'back') navigateTo('general-information');
      if (page === 'next') navigateTo(nextPath);
    }

    this.loading.set(false);
  }

  get showPrimaryLeverError(): boolean {
    const levers = this.body().levers ?? [];
    return levers.length > 1 && !levers.some(l => l.is_primary);
  }

  markAsPrimary(item: { is_primary: boolean }, type: 'contract' | 'lever') {
    this.body.update(current => {
      if (type === 'contract') {
        current.contracts.forEach(contract => (contract.is_primary = false));
      } else if (type === 'lever') {
        current.levers.forEach(lever => (lever.is_primary = false));
      }
      return { ...current };
    });
    item.is_primary = !item.is_primary;
    this.actions.saveCurrentSection();
  }
}
