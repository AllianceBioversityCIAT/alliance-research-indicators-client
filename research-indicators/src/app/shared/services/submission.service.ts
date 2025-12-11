import { computed, Injectable, signal, inject } from '@angular/core';
import { CacheService } from './cache/cache.service';
import { ReviewOption } from '../interfaces/review-option.interface';
import { RolesService } from './cache/roles.service';

export interface SubmissionStatus {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  cache = inject(CacheService);
  rolesService = inject(RolesService);
  comment = signal('');
  melRegionalExpert = signal('');
  oicrNo = signal('');
  sharePointFolderLink = signal('');
  statusSelected = signal<ReviewOption | null>(null);
  canSubmitResult = computed(() => {
    return (
      this.cache.allGreenChecksAreTrue() &&
      Object.values(this.cache.greenChecks()).length &&
      (this.cache.isMyResult() || this.cache.currentMetadata().is_principal_investigator || this.rolesService.isAdmin())
    );
  });
  submissionStatuses = signal<SubmissionStatus[]>([
    { id: 1, name: 'Editing' },
    { id: 2, name: 'Submitted' },
    { id: 3, name: 'Accepted' },
    { id: 4, name: 'Draft' },
    { id: 5, name: 'Pending Revision' },
    { id: 6, name: 'Approved' },
    { id: 7, name: 'Do not approve' },
    { id: 8, name: 'Deleted' },
    { id: 9, name: 'Requested' },
    { id: 10, name: 'Approved' },
    { id: 11, name: 'Postponed' },
    { id: 12, name: 'Science Edition' },
    { id: 13, name: 'KM Curation' },
    { id: 14, name: 'Published' }
  ]);

  currentResultIsSubmitted = computed(() => this.cache.currentMetadata().status_id == 2);

  refreshSubmissionHistory = signal(0);

  isEditableStatus = computed(() => {
    const editableStatuses = [4, 5, 12, 13,14];
    const hasEditableStatus = editableStatuses.includes(this.cache.currentMetadata().status_id ?? -1);
    const platformCode = this.cache.getCurrentPlatformCode();
    const isStarPlatform = platformCode === 'STAR';
    const hasNoPlatformCode = platformCode === '';
    return hasEditableStatus && (isStarPlatform || hasNoPlatformCode);
  });

  isSubmitted = computed(() => {
    const editableStatuses = [2];
    return editableStatuses.includes(this.cache.currentMetadata().status_id ?? -1);
  });

  getStatusNameById(id: number): string {
    const status = this.submissionStatuses().find(status => status.id === id);
    return status ? status.name : '';
  }
}
