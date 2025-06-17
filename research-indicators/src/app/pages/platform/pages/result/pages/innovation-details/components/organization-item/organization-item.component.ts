import { Component, effect, EventEmitter, inject, Input, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubmissionService } from '@shared/services/submission.service';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { GetInnovationDetails, InstitutionType } from '@shared/interfaces/get-innovation-details.interface';
import { SelectComponent } from '@shared/components/custom-fields/select/select.component';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';

@Component({
  selector: 'app-organization-item',
  imports: [CheckboxModule, FormsModule, InputComponent, TextareaModule, SelectComponent],
  templateUrl: './organization-item.component.html'
})
export class OrganizationItemComponent implements OnInit {
  @Output() deleteEvidenceEvent = new EventEmitter();
  @Input() evidence: InstitutionType = new InstitutionType();
  @Input() index: number | null = null;
  @Input() evidenceNumber: number | null = null;
  @Input() bodySignal: WritableSignal<GetInnovationDetails> = signal(new GetInnovationDetails());
  body = signal<InstitutionType>(new InstitutionType());
  submission = inject(SubmissionService);
  isPrivate = false;

  syncBody = effect(() => {
    if (this.index === null) return;
    const parentEvidence = this.bodySignal().institution_types?.[this.index];
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

  ngOnInit() {
    this.body.set(this.evidence);
  }

  deleteEvidence() {
    this.deleteEvidenceEvent.emit();
  }

  setValue() {
    this.body.set({
      ...this.body()
    });
  }
}
