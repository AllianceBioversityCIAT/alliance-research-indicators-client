import { Component, inject, signal } from '@angular/core';
import { TextareaComponent } from '../../../../../../shared/components/custom-fields/textarea/textarea.component';
import { SelectComponent } from '../../../../../../shared/components/custom-fields/select/select.component';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { GetPolicyChange } from '../../../../../../shared/interfaces/get-get-policy-change.interface';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-policy-change',
  standalone: true,
  imports: [RadioButtonComponent, TextareaComponent, MultiselectComponent, SelectComponent, ButtonModule],
  templateUrl: './policy-change.component.html',
  styleUrl: './policy-change.component.scss'
})
export default class PolicyChangeComponent {
  api = inject(ApiService);
  cache = inject(CacheService);
  actions = inject(ActionsService);
  router = inject(Router);
  body = signal<GetPolicyChange>({});
  loading = signal(false);

  policyStages = signal<{ list: { id: number; name: string }[]; loading: boolean }>({
    list: [
      { id: 1, name: 'Stage 1: Research taken up by next user, policy change not yet enacted' },
      { id: 2, name: 'Stage 2: Policy enacted' },
      { id: 3, name: 'Stage 3: Evidence of impact of policy' }
    ],
    loading: false
  });

  constructor() {
    this.getData();
  }

  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_PolicyChange(this.cache.currentResultId());
    response.data.loaded = true;
    this.body.set(response.data);
    this.loading.set(false);
  }

  async saveData(page?: 'next' | 'back') {
    this.loading.set(true);
    const response = await this.api.PATCH_PolicyChange(this.cache.currentResultId(), this.body());
    if (response.successfulRequest) {
      this.actions.showToast({ severity: 'success', summary: 'Policy Change', detail: 'Data saved successfully' });
      await this.getData();
      if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'partners']);
      if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'alliance-alignment']);
    }
    this.loading.set(false);
  }
}
