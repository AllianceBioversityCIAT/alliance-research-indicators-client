import { Component, inject, OnInit, signal } from '@angular/core';
import { SubmissionHistoryItemComponent } from '../submission-history-item/submission-history-item.component';
import { SubmissionHistoryItem } from '@shared/interfaces/submission-history-item.interface';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@services/cache/cache.service';
@Component({
  selector: 'app-submission-history-content',
  standalone: true,
  imports: [SubmissionHistoryItemComponent],
  templateUrl: './submission-history-content.component.html',
  styleUrl: './submission-history-content.component.scss'
})
export class SubmissionHistoryContentComponent implements OnInit {
  api = inject(ApiService);
  cache = inject(CacheService);
  historyList = signal<SubmissionHistoryItem[]>([]);

  ngOnInit(): void {
    this.getSubmitionHistory();
  }

  async getSubmitionHistory() {
    const response = await this.api.GET_SubmitionHistory(this.cache.currentResultId());
    this.historyList.set(response.data);
  }
}
