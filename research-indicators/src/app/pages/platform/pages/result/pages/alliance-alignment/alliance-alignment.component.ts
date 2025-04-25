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
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../../../../environments/environment';
import { SubmissionService } from '@shared/services/submission.service';

@Component({
  selector: 'app-alliance-alignment',
  imports: [MultiSelectModule, FormsModule, MultiselectComponent, ButtonModule, DatePipe],
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
    if (this.submission.isEditableStatus()) {
      const response = await this.apiService.PATCH_Alignments(this.cache.currentResultId(), this.body());
      if (response.successfulRequest) {
        this.actions.showToast({ severity: 'success', summary: 'Alliance Alignment', detail: 'Data saved successfully' });
        await this.getData();
        if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'general-information']);
        if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), this.cache.currentResultIndicatorSectionPath()]);
      }
    } else {
      if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'general-information']);
      if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), this.cache.currentResultIndicatorSectionPath()]);
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
