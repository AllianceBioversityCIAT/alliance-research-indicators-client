import { Component } from '@angular/core';
import { SubmissionHistoryItemComponent } from '../submission-history-item/submission-history-item.component';
import { SubmissionHistoryItem } from '@shared/interfaces/submission-history-item.interface';

@Component({
  selector: 'app-submission-history-content',
  standalone: true,
  imports: [SubmissionHistoryItemComponent],
  templateUrl: './submission-history-content.component.html',
  styleUrl: './submission-history-content.component.scss'
})
export class SubmissionHistoryContentComponent {
  users: SubmissionHistoryItem[] = [
    {
      name: 'John Doe',
      initials: 'JD',
      status: 'Submitted',
      date: '02/11/2025',
      time: '2:00 p.m'
    },
    {
      name: 'Jane Smith',
      initials: 'JS',
      status: 'Unsubmitted',
      date: '02/10/2025',
      time: '10:30 a.m'
    },
    {
      name: 'Alice Johnson',
      initials: 'AJ',
      status: 'Submitted',
      date: '01/22/2025',
      time: '4:45 p.m'
    },
    {
      name: 'Bob Brown',
      initials: 'BB',
      status: 'Unsubmitted',
      date: '01/30/2025',
      time: '1:15 p.m'
    },
    {
      name: 'Charlie Davis',
      initials: 'CD',
      status: 'Unsubmitted',
      date: '01/18/2025',
      time: '9:00 a.m'
    }
  ];
}
