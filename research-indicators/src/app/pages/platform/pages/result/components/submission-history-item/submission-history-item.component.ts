import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';
import { SubmissionHistoryItem } from '@shared/interfaces/submission-history-item.interface';

@Component({
  selector: 'app-submission-history-item',
  standalone: true,
  imports: [DatePipe, CustomTagComponent],
  templateUrl: './submission-history-item.component.html',
  styleUrl: './submission-history-item.component.scss'
})
export class SubmissionHistoryItemComponent {
  @Input() historyItem: SubmissionHistoryItem = new SubmissionHistoryItem();
}
