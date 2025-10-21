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
import { PatchOicr, QuantificationPayload, NotableReferencePayload } from '@shared/interfaces/oicr-creation.interface';
import { QuantificationItemComponent, QuantificationItemData } from './components/quantification-item/quantification-item.component';
import { OtherReferenceItemComponent, OtherReferenceItemData } from './components/other-reference-item/other-reference-item.component';
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { AuthorsContactPersonsTableComponent } from './components/authors-contact-persons-table/authors-contact-persons-table.component';
import { ContactPersonRow, ContactPersonResponse, ContactPersonFormData } from '@shared/interfaces/contact-person.interface';
import { NgTemplateOutlet } from '@angular/common';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';
import { ImpactAreasComponent } from './components/impact-areas/impact-areas.component';
import { SelectComponent } from '@shared/components/custom-fields/select/select.component';
import { RolesService } from '@shared/services/cache/roles.service';

@Component({
  selector: 'app-oicr-details',
  imports: [NavigationButtonsComponent, FormsModule, FormHeaderComponent, CheckboxModule, AccordionModule, NgTemplateOutlet, AuthorsContactPersonsTableComponent, OicrFormFieldsComponent, QuantificationItemComponent, OtherReferenceItemComponent, InputComponent, ImpactAreasComponent, SelectComponent],
  templateUrl: './oicr-details.component.html'
})
export default class OicrDetailsComponent {
  rolesService = inject(RolesService);
  api = inject(ApiService);
  router = inject(Router);
  body: WritableSignal<PatchOicr> = signal({
    oicr_internal_code: '',
    tagging: { tag_id: 0 },
    outcome_impact_statement: '',
    short_outcome_impact_statement: '',
    maturity_level_id: 0,
    link_result: { external_oicr_id: 0 },
    for_external_use: false,
    for_external_use_description: ''
  });

  quantifications = signal<QuantificationItemData[]>([{ number: null, unit: '', comments: '' }]);
  otherReferences = signal<OtherReferenceItemData[]>([{ type_id: null, link: '' }]);
  extrapolatedEstimates = signal<QuantificationItemData[]>([{ number: null, unit: '', comments: '' }]);
  contactPersons = signal<ContactPersonRow[]>([]);

  addQuantification() {
    if (!this.submission.isEditableStatus()) return;
    this.quantifications.update(list => [...list, { number: null, unit: '', comments: '' }]);
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
    this.extrapolatedEstimates.update(list => [...list, { number: null, unit: '', comments: '' }]);
  }

  removeExtrapolatedEstimate(index: number) {
    if (!this.submission.isEditableStatus()) return;
    this.extrapolatedEstimates.update(list => list.filter((_, i) => i !== index));
  }

  updateExtrapolatedEstimate(index: number, data: QuantificationItemData) {
    this.extrapolatedEstimates.update(list => list.map((it, i) => (i === index ? data : it)));
  }

  onAddContactPerson() {
    this.allModalsService.toggleModal('addContactPerson');
  }

  async loadContactPersons() {
    const res = await this.api.GET_AutorContact(this.cache.getCurrentNumericResultId());
    
    let dataArray: ContactPersonResponse[] = [];
    if (res.data) {
      if (Array.isArray(res.data)) {
        dataArray = res.data;
      } else {
        dataArray = [res.data];
      }
    }
    
    
    const mappedData: ContactPersonRow[] = dataArray.map((item: ContactPersonResponse) => ({
      id: item.result_user_id,
      name: `${item.user?.first_name || ''} ${item.user?.last_name || ''}`.trim(),
      position: item.user?.position || '-',
      affiliation: item.user?.affiliation || item.user?.center || '-',
      email: item.user?.email || '-',
      role: item.role.name || '-',
      user_id: item.user_id,
      informative_role_id: item.informative_role_id
    }));
    
    this.contactPersons.set(mappedData);
  }

  async onDeleteContactPerson(row: ContactPersonRow) {
    if (!row?.id) return;
    const resultId = this.cache.getCurrentNumericResultId();
    const res = await this.api.DELETE_AutorContact(row.id, resultId);
    if (res.successfulRequest) {
      await this.loadContactPersons();
      this.actions.showToast({ severity: 'success', summary: 'Contact person', detail: 'Deleted successfully' });
    }
  }

  cache = inject(CacheService);
  actions = inject(ActionsService);
  loading = signal(false);
  submission = inject(SubmissionService);
  versionWatcher = inject(VersionWatcherService);
  route = inject(ActivatedRoute);
  allModalsService = inject(AllModalsService);

  constructor() {
    this.versionWatcher.onVersionChange(() => {
      this.getData();
    });
    this.setupModalActions();
  }

  setupModalActions() {
    this.allModalsService.setAddContactPersonConfirm((data: ContactPersonFormData) => this.onConfirmAddContactPerson(data));
    this.allModalsService.setDisabledAddContactPerson(() => this.isAddContactPersonDisabled());
  }

  isAddContactPersonDisabled(): boolean {
    return !this.submission.isEditableStatus();
  }

  async onConfirmAddContactPerson(data: ContactPersonFormData) {
    if (!data?.contact_person_id || !data?.role_id) {
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'Please select both contact person and role' });
      return;
    }
    
    const contactPersonData = {
      user_id: data.contact_person_id,
      informative_role_id: data.role_id
    };
    
    try {
      await this.api.POST_AutorContact(contactPersonData, this.cache.getCurrentNumericResultId());
      await this.loadContactPersons();
      this.actions.showToast({ severity: 'success', summary: 'Contact person', detail: 'Added successfully' });
      this.allModalsService.toggleModal('addContactPerson');
    } catch {
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'Failed to add contact person' });
    }
  }
  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_Oicr(this.cache.getCurrentNumericResultId());
    this.loadContactPersons()
    const data = response.data || {};
    const apiData = data;

    this.body.set(data);
    // Map quantifications (actual_count)
    const apiActual = Array.isArray(apiData.actual_count) ? apiData.actual_count : [];
    if (apiActual.length > 0) {
      this.quantifications.set(
        apiActual.map((q: QuantificationPayload) => {
          let parsedNumber: number | null = null;
          const raw = q?.quantification_number as unknown as number | string | null | undefined;
          if (typeof raw === 'number') parsedNumber = raw;
          else if (raw !== undefined && raw !== null) {
            const n = Number(raw);
            parsedNumber = Number.isNaN(n) ? null : n;
          }
          return {
            number: parsedNumber,
            unit: q?.unit ?? '',
            comments: q?.description ?? ''
          };
        })
      );
    } else {
      this.quantifications.set([{ number: null, unit: '', comments: '' }]);
    }

    const apiExtrap = Array.isArray(apiData.extrapolate_estimates) ? apiData.extrapolate_estimates : [];
    if (apiExtrap.length > 0) {
      this.extrapolatedEstimates.set(
        apiExtrap.map((q: QuantificationPayload) => {
          let parsedNumber: number | null = null;
          const raw = q?.quantification_number as unknown as number | string | null | undefined;
          if (typeof raw === 'number') parsedNumber = raw;
          else if (raw !== undefined && raw !== null) {
            const n = Number(raw);
            parsedNumber = Number.isNaN(n) ? null : n;
          }
          return {
            number: parsedNumber,
            unit: q?.unit ?? '',
            comments: q?.description ?? ''
          };
        })
      );
    } else {
      this.extrapolatedEstimates.set([{ number: null, unit: '', comments: '' }]);
    }

    const apiNotable = Array.isArray(apiData.notable_references) ? apiData.notable_references : [];
    if (apiNotable.length > 0) {
      this.otherReferences.set(
        apiNotable.map((r: NotableReferencePayload) => ({ type_id: r?.notable_reference_type_id ?? null, link: r?.link ?? '' }))
      );
    } else {
      this.otherReferences.set([{ type_id: null, link: '' }]);
    }
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

        const payload: PatchOicr = {
          ...current,
          actual_count: this.quantifications().map<QuantificationPayload>(q => ({
            quantification_number: q.number ?? 0,
            unit: q.unit ?? '',
            description: q.comments ?? ''
          })),
          extrapolate_estimates: this.extrapolatedEstimates().map<QuantificationPayload>(q => ({
            quantification_number: q.number ?? 0,
            unit: q.unit ?? '',
            description: q.comments ?? ''
          })),
          notable_references: this.otherReferences().map<NotableReferencePayload>(r => ({
            notable_reference_type_id: r.type_id ?? null,
            link: r.link ?? ''
          })),
          result_impact_areas: current.result_impact_areas || []
        };

        const response = await this.api.PATCH_Oicr(numericResultId, payload);

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
