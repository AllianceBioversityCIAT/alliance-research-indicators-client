import { Component, effect, EventEmitter, inject, Input, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { TextareaComponent } from '../../../../../../../../shared/components/custom-fields/textarea/textarea.component';
import { FormsModule } from '@angular/forms';
import { Evidence, PatchResultEvidences } from '../../../../../../../../shared/interfaces/patch-result-evidences.interface';
import { InputTextModule } from 'primeng/inputtext';
import { SubmissionService } from '@shared/services/submission.service';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-evidence-item',
  imports: [TextareaComponent, CheckboxModule, FormsModule, InputTextModule],
  templateUrl: './evidence-item.component.html'
})
export class EvidenceItemComponent implements OnInit {
  @Output() deleteEvidenceEvent = new EventEmitter();
  @Input() evidence: Evidence = new Evidence();
  @Input() index: number | null = null;
  @Input() evidenceNumber: number | null = null;
  @Input() bodySignal: WritableSignal<PatchResultEvidences> = signal(new PatchResultEvidences());
  body = signal<Evidence>(new Evidence());
  submission = inject(SubmissionService);
  isPrivate = false;

  syncBody = effect(() => {
    if (this.index === null) return;
    const parentEvidence = this.bodySignal().evidence?.[this.index];
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

      this.bodySignal.update((body: PatchResultEvidences) => {
        if (!body.evidence) {
          body.evidence = [];
        }

        // Ensure array has enough elements
        while (body.evidence.length <= this.index!) {
          body.evidence.push(new Evidence());
        }

        const currentEvidence = this.body();
        if (currentEvidence) {
          body.evidence[this.index!].evidence_url = currentEvidence.evidence_url;
          if (JSON.stringify(body.evidence[this.index!]) !== JSON.stringify(currentEvidence)) {
            body.evidence[this.index!] = { ...currentEvidence };
          }
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

  validateWebsite = (website: string): boolean => {
    if (!website || website.trim() === '') {
      return true;
    }
    const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/g;
    return urlPattern.test(website.trim());
  };

  isFieldInvalid(): boolean {
    const url = this.body().evidence_url;
    return !url || url.trim() === '';
  }

  setValue(value: string) {
    value = value.toLowerCase();
    this.body.set({
      ...this.body(),
      evidence_url: value
    });
  }
}
