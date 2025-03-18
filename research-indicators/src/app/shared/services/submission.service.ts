import { computed, Injectable, signal, inject } from '@angular/core';
import { CacheService } from './cache/cache.service';

export interface SubmissionStatus {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  cache = inject(CacheService);
  canSubmitResult = computed(() => {
    return this.cache.allGreenChecksAreTrue() && Object.values(this.cache.greenChecks()).length && this.cache.isMyResult();
  });
  submissionStatuses = signal<SubmissionStatus[]>([
    { id: 1, name: 'Editing' },
    { id: 2, name: 'Submitted' },
    { id: 3, name: 'Accepted' },
    { id: 4, name: 'Draft' },
    { id: 5, name: 'Revised' },
    { id: 6, name: 'Approved' },
    { id: 7, name: 'Rejected' },
    { id: 8, name: 'Deleted' }
  ]);

  currentResultIsSubmitted = computed(() => this.cache.currentMetadata().status_id !== 4);

  getStatusNameById(id: number): string {
    const status = this.submissionStatuses().find(status => status.id === id);
    return status ? status.name : '';
  }
}
