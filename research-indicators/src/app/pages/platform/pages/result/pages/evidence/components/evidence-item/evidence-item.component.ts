import { Component, effect, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { InputComponent } from '../../../../../../../../shared/components/custom-fields/input/input.component';
import { TextareaComponent } from '../../../../../../../../shared/components/custom-fields/textarea/textarea.component';
import { FormsModule } from '@angular/forms';
import { Evidence } from '../../../../../../../../shared/interfaces/patch-result-evidences.interface';

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
  body = signal<Evidence>(new Evidence());

  onChange = effect(() => {
    this.evidence = this.body();
  });

  ngOnInit() {
    this.body.set(this.evidence);
  }

  deleteEvidence() {
    this.deleteEvidenceEvent.emit();
  }
}
