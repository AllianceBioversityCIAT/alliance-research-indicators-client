import { Component, effect, EventEmitter, Input, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { InputComponent } from '../../../../../../../../shared/components/custom-fields/input/input.component';
import { TextareaComponent } from '../../../../../../../../shared/components/custom-fields/textarea/textarea.component';
import { FormsModule } from '@angular/forms';
import { Evidence, PatchResultEvidences } from '../../../../../../../../shared/interfaces/patch-result-evidences.interface';

@Component({
  selector: 'app-evidence-item',
  standalone: true,
  imports: [InputComponent, TextareaComponent, FormsModule],
  templateUrl: './evidence-item.component.html',
  styleUrl: './evidence-item.component.scss'
})
export class EvidenceItemComponent implements OnInit {
  @Output() deleteEvidenceEvent = new EventEmitter();
  @Input() evidence: Evidence = new Evidence();
  @Input() index: number | null = null;
  @Input() bodySignal: WritableSignal<PatchResultEvidences> = signal(new PatchResultEvidences());
  body = signal<Evidence>(new Evidence());

  onChange = effect(
    () => {
      this.bodySignal.update((body: PatchResultEvidences) => {
        body.evidence[this.index!].evidence_url = this.body()?.evidence_url;
        body.evidence[this.index!].evidence_description = this.body()?.evidence_description;
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
}
