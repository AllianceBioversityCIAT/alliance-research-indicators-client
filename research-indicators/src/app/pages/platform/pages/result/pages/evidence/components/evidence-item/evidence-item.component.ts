import { Component, effect, EventEmitter, inject, Input, OnInit, Output, signal, WritableSignal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Evidence, PatchResultEvidences } from '../../../../../../../../shared/interfaces/patch-result-evidences.interface';
import { InputTextModule } from 'primeng/inputtext';
import { SubmissionService } from '@shared/services/submission.service';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-evidence-item',
  standalone: true,
  imports: [CheckboxModule, FormsModule, InputTextModule, TextareaModule, NgTemplateOutlet],
  templateUrl: './evidence-item.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      app-evidence-item input:-webkit-autofill,
      app-evidence-item input:-webkit-autofill:hover,
      app-evidence-item input:-webkit-autofill:focus,
      app-evidence-item input:-webkit-autofill:active {
        -webkit-text-fill-color: #1689ca !important;
        -webkit-box-shadow: 0 0 0 30px white inset !important;
        transition: background-color 5000s ease-in-out 0s;
      }

      app-evidence-item input {
        color: #1689ca !important;
      }
    `
  ]
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
  private updateTimeout: ReturnType<typeof setTimeout> | undefined;

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

  get isDescriptionMissing(): boolean {
    return !this.body()?.evidence_description;
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
    // Clear any existing timeout
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    // Update the value immediately for validation
    const lowerCaseValue = value.toLowerCase();

    // Update the body with debounce to prevent duplicate updates
    this.updateTimeout = setTimeout(() => {
      if (this.body().evidence_url !== lowerCaseValue) {
        this.body.set({
          ...this.body(),
          evidence_url: lowerCaseValue
        });
      }
    }, 300); // Reduced timeout to 300ms for better responsiveness
  }
}
