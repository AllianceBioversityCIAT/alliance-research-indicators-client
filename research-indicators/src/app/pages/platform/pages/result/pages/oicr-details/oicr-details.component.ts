import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { SubmissionService } from '@shared/services/submission.service';
import { ActionsService } from '@shared/services/actions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { OicrFormFieldsComponent } from '@shared/components/custom-fields/oicr-form-fields/oicr-form-fields.component';
import { PatchOicr } from '@shared/interfaces/oicr-creation.interface';
import { QuantificationItemComponent, QuantificationItemData } from './components/quantification-item/quantification-item.component';
import { OtherReferenceItemComponent, OtherReferenceItemData } from './components/other-reference-item/other-reference-item.component';
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { AuthorsContactPersonsTableComponent, ContactPersonRow } from './components/authors-contact-persons-table/authors-contact-persons-table.component';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-oicr-details',
  imports: [NavigationButtonsComponent, FormsModule, FormHeaderComponent, CheckboxModule, AccordionModule, NgTemplateOutlet, AuthorsContactPersonsTableComponent, OicrFormFieldsComponent, QuantificationItemComponent, OtherReferenceItemComponent],
  templateUrl: './oicr-details.component.html'
})
export default class OicrDetailsComponent {
  api = inject(ApiService);
  router = inject(Router);
  body: WritableSignal<PatchOicr> = signal({
    oicr_internal_code: '',
    tagging: { tag_id: 0 },
    outcome_impact_statement: '',
    short_outcome_impact_statement: '',
    maturity_level_id: 0,
    link_result: { external_oicr_id: 0 }
  });

  quantifications = signal<QuantificationItemData[]>([{ number: '', unit: '', comments: '' }]);
  otherReferences = signal<OtherReferenceItemData[]>([{ type_id: null, link: '' }]);
  extrapolatedEstimates = signal<QuantificationItemData[]>([{ number: '', unit: '', comments: '' }]);
  contactPersons = signal<ContactPersonRow[]>([]);

  addQuantification() {
    if (!this.submission.isEditableStatus()) return;
    this.quantifications.update(list => [...list, { number: '', unit: '', comments: '' }]);
  }

  removeQuantification(index: number) {
    if (!this.submission.isEditableStatus()) return;
    this.quantifications.update(list => list.filter((_, i) => i !== index));
  }

  updateQuantification(index: number, data: QuantificationItemData) {
    this.quantifications.update(list => list.map((q, i) => (i === index ? data : q)));
  }

  addOtherReference() {
    if (!this.submission.isEditableStatus()) return;
    this.otherReferences.update(list => [...list, { type_id: null, link: '' }]);
  }

  removeOtherReference(index: number) {
    if (!this.submission.isEditableStatus()) return;
    this.otherReferences.update(list => list.filter((_, i) => i !== index));
  }

  updateOtherReference(index: number, data: OtherReferenceItemData) {
    this.otherReferences.update(list => list.map((it, i) => (i === index ? data : it)));
  }

  addExtrapolatedEstimate() {
    if (!this.submission.isEditableStatus()) return;
    this.extrapolatedEstimates.update(list => [...list, { number: '', unit: '', comments: '' }]);
  }

  removeExtrapolatedEstimate(index: number) {
    if (!this.submission.isEditableStatus()) return;
    this.extrapolatedEstimates.update(list => list.filter((_, i) => i !== index));
  }

  updateExtrapolatedEstimate(index: number, data: QuantificationItemData) {
    this.extrapolatedEstimates.update(list => list.map((it, i) => (i === index ? data : it)));
  }

  onAddContactPerson() {
    console.warn('onAddContactPerson');
  }

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
  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_Oicr(this.cache.getCurrentNumericResultId());

    const data = response.data || {};

    this.body.set(data);
    this.loading.set(false);
  }

  async saveData(page?: 'back' | 'next'): Promise<void> {
    try {
      this.loading.set(true);
      const numericResultId = this.cache.getCurrentNumericResultId();
      const version = this.route.snapshot.queryParamMap.get('version');
      const queryParams = version ? { version } : undefined;

      if (this.submission.isEditableStatus()) {
        const current = this.body();
        const response = await this.api.PATCH_Oicr(numericResultId, current);

        if (!response.successfulRequest) {
          return;
        }

        await this.getData();
        this.actions.showToast({
          severity: 'success',
          summary: 'OICR Details',
          detail: 'Data saved successfully'
        });
      }

      if (page === 'back') {
        this.router.navigate(['result', this.cache.currentResultId(), 'alliance-alignment'], {
          queryParams,
          replaceUrl: true
        });
      }
      if (page === 'next')
        this.router.navigate(['result', this.cache.currentResultId(), 'partners'], {
          queryParams,
          replaceUrl: true
        });
    } finally {
      this.loading.set(false);
    }
  }

  clearOicrSelection(): void {
    this.body.update(current => ({
      ...current,
      link_result: { external_oicr_id: 0 }
    }));
  }
}
