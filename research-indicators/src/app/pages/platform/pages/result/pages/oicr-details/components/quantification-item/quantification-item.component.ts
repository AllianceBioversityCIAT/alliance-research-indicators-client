import { Component, EventEmitter, Input, OnInit, Output, inject, signal, WritableSignal } from '@angular/core';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';
import { TextareaComponent } from '@shared/components/custom-fields/textarea/textarea.component';
import { SubmissionService } from '@shared/services/submission.service';

export interface QuantificationItemData {
  number: string;
  unit: string;
  comments: string;
}

@Component({
  selector: 'app-quantification-item',
  standalone: true,
  imports: [InputComponent, TextareaComponent],
  templateUrl: './quantification-item.component.html'
})
export class QuantificationItemComponent implements OnInit {
  @Input() quantification!: QuantificationItemData;
  @Input() index!: number;
  @Input() quantNumber = 1;
  @Input() headerLabel = 'ACTUAL COUNT';
  @Output() update = new EventEmitter<QuantificationItemData>();
  @Output() delete = new EventEmitter<void>();

  submission = inject(SubmissionService);

  body: WritableSignal<QuantificationItemData> = signal({ number: '', unit: '', comments: '' });

  ngOnInit(): void {
    this.body.set(this.quantification || { number: '', unit: '', comments: '' });
  }

  onValueChange() {
    this.update.emit(this.body());
  }

  onDelete() {
    if (!this.submission.isEditableStatus()) return;
    this.delete.emit();
  }
}


