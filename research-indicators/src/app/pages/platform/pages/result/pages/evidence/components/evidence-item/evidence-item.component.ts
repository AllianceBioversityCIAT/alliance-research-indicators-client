import { Component, effect, EventEmitter, Input, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { TextareaComponent } from '../../../../../../../../shared/components/custom-fields/textarea/textarea.component';
import { FormsModule } from '@angular/forms';
import { Evidence, PatchResultEvidences } from '../../../../../../../../shared/interfaces/patch-result-evidences.interface';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-evidence-item',
    imports: [TextareaComponent, FormsModule, InputTextModule],
    templateUrl: './evidence-item.component.html',
})
export class EvidenceItemComponent implements OnInit {
  @Output() deleteEvidenceEvent = new EventEmitter();
  @Input() evidence: Evidence = new Evidence();
  @Input() index: number | null = null;
  @Input() bodySignal: WritableSignal<PatchResultEvidences> = signal(new PatchResultEvidences());
  body = signal<Evidence>(new Evidence());

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
          body.evidence[this.index!].evidence_description = currentEvidence.evidence_description;
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
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[\w\-./?%&=]*)?$/;
    return urlPattern.test(website.trim());
  };

  setValue(value: string) {
   value = value.toLowerCase();
    this.body.set({
      ...this.body(),
      evidence_url: value
    });
  }
}