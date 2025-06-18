import { Component, effect, EventEmitter, inject, Input, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubmissionService } from '@shared/services/submission.service';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { GetInnovationDetails, InstitutionType } from '@shared/interfaces/get-innovation-details.interface';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';
import { NgTemplateOutlet } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { GetInstitutionTypesService } from '@shared/services/control-list/get-institution-types.service';
import { GetClarisaInstitutionsSubTypesService } from '@shared/services/get-clarisa-institutions-subtypes.service';

@Component({
  selector: 'app-organization-item',
  imports: [CheckboxModule, FormsModule, InputComponent, TextareaModule, NgTemplateOutlet, SelectModule],
  templateUrl: './organization-item.component.html'
})
export class OrganizationItemComponent implements OnInit {
  @Output() deleteOrganizationEvent = new EventEmitter();
  @Input() organization: InstitutionType = new InstitutionType();
  @Input() index: number | null = null;
  @Input() organizationNumber: number | null = null;
  @Input() bodySignal: WritableSignal<GetInnovationDetails> = signal(new GetInnovationDetails());
  body = signal<InstitutionType>(new InstitutionType());
  submission = inject(SubmissionService);
  isPrivate = false;

  institutionService = inject(GetInstitutionTypesService);
  subTypesService = inject(GetClarisaInstitutionsSubTypesService);
  showSubTypeSelect = signal(false);

  syncBody = effect(() => {
    if (this.index === null) return;
    const parentOrganization = this.bodySignal().institution_types?.[this.index];
    if (parentOrganization && JSON.stringify(parentOrganization) !== JSON.stringify(this.body())) {
      this.body.set(parentOrganization);
      return;
    }
    if (this.organization && JSON.stringify(this.organization) !== JSON.stringify(this.body())) {
      this.body.set(this.organization);
    }
  });

  onChange = effect(
    () => {
      if (this.index === null) return;

      this.bodySignal.update((body: GetInnovationDetails) => {
        if (!body.institution_types) {
          body.institution_types = [];
        }

        // Ensure array has enough elements
        while (body.institution_types.length <= this.index!) {
          body.institution_types.push(new InstitutionType());
        }

        return { ...body };
      });
    },
    { allowSignalWrites: true }
  );

  async ngOnInit() {
    this.body.set(this.organization);
    if (this.organization.institution_type_id) {
      await this.subTypesService.getSubTypes(2, this.organization.institution_type_id);
      this.showSubTypeSelect.set(this.subTypesService.list().length > 0);
    }
  }

  deleteOrganization() {
    this.deleteOrganizationEvent.emit();
  }

  setValue() {
    this.body.set({
      ...this.body()
    });
  }

  get organizationMissing(): boolean {
    return !this.body()?.institution_type_id;
  }
  get subTypeMissing(): boolean {
    return !this.body()?.sub_institution_type_id;
  }

  async onInstitutionTypeChange(event: number) {
    if (event !== 78) {
      const updatedInstitution = {
        ...this.body(),
        institution_type_id: event,
        institution_type_custom_name: undefined
      };
      this.body.set(updatedInstitution);

      if (this.index !== null) {
        this.bodySignal.update(current => {
          const updatedInstitutions = [...(current.institution_types || [])];
          updatedInstitutions[this.index!] = updatedInstitution;
          return { ...current, institution_types: updatedInstitutions };
        });
      }
    }
    if (event) {
      await this.subTypesService.getSubTypes(2, event);
      this.showSubTypeSelect.set(this.subTypesService.list().length > 0);

      if (!this.showSubTypeSelect()) {
        this.body.update(body => ({
          ...body,
          sub_institution_type_id: undefined
        }));
      }
    } else {
      this.showSubTypeSelect.set(false);
      this.subTypesService.clearList();
      this.body.update(body => ({
        ...body,
        sub_institution_type_id: undefined
      }));
    }
  }
}
