import { Component, EventEmitter, Input, OnInit, Output, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '@shared/components/custom-fields/select/select.component';
import { InputTextModule } from 'primeng/inputtext';
import { SubmissionService } from '@shared/services/submission.service';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';

export interface OtherReferenceItemData {
  type_id: number | null;
  link: string;
}

@Component({
  selector: 'app-other-reference-item',
  standalone: true,
  imports: [FormsModule, SelectComponent, InputTextModule, InputComponent],
  templateUrl: './other-reference-item.component.html'
})
export class OtherReferenceItemComponent implements OnInit {
  @Input() item!: OtherReferenceItemData;
  @Input() itemNumber = 1;
  @Output() update = new EventEmitter<OtherReferenceItemData>();
  @Output() delete = new EventEmitter<void>();

  submission = inject(SubmissionService);

  body: WritableSignal<OtherReferenceItemData> = signal({ type_id: null, link: '' });

  ngOnInit(): void {
    this.body.set(this.item || { type_id: null, link: '' });
  }

  onLinkChange() {
    this.update.emit(this.body());
  }

  onDelete() {
    if (!this.submission.isEditableStatus()) return;
    this.delete.emit();
  }
}


