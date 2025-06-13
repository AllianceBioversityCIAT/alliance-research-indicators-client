import { Component, effect, EventEmitter, inject, Input, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubmissionService } from '@shared/services/submission.service';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { GetInnovationDetails, Organization } from '@shared/interfaces/get-innovation-details.interface';
import { SelectComponent } from '@shared/components/custom-fields/select/select.component';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';

@Component({
  selector: 'app-organization-item',
  imports: [CheckboxModule, FormsModule, InputComponent, TextareaModule, SelectComponent],
  templateUrl: './organization-item.component.html'
})
export class OrganizationItemComponent implements OnInit {
  @Output() deleteEvidenceEvent = new EventEmitter();
  @Input() evidence: Organization = new Organization();
  @Input() index: number | null = null;
  @Input() evidenceNumber: number | null = null;
  @Input() bodySignal: WritableSignal<GetInnovationDetails> = signal(new GetInnovationDetails());
  body = signal<Organization>(new Organization());
  submission = inject(SubmissionService);
  isPrivate = false;

  syncBody = effect(() => {
    if (this.index === null) return;
    const parentEvidence = this.bodySignal().organizations?.[this.index];
    if (parentEvidence && JSON.stringify(parentEvidence) !== JSON.stringify(this.body())) {
      this.body.set(parentEvidence);
      return;
    }
    if (this.evidence && JSON.stringify(this.evidence) !== JSON.stringify(this.body())) {
      this.body.set(this.evidence);
    }
  });

  onChange = effect(
    () => {
      if (this.index === null) return;

      this.bodySignal.update((body: GetInnovationDetails) => {
        if (!body.organizations) {
          body.organizations = [];
        }

        // Ensure array has enough elements
        while (body.organizations.length <= this.index!) {
          body.organizations.push(new Organization());
        }

        return { ...body };
      });
    },
    { allowSignalWrites: true }
  );

  ngOnInit() {
    this.body.set(this.evidence);
  }

  deleteEvidence() {
    this.deleteEvidenceEvent.emit();
  }

  setValue(value: string) {
    value = value.toLowerCase();
    this.body.set({
      ...this.body()
    });
  }
}
