import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { AllModalsService } from '@services/cache/all-modals.service';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { ReviewOption } from '../../../../interfaces/review-option.interface';
import { SubmissionService } from '../../../../services/submission.service';

@Component({
  selector: 'app-submit-result-content',
  imports: [DialogModule, ButtonModule, FormsModule, TextareaModule],
  templateUrl: './submit-result-content.component.html'
})
export class SubmitResultContentComponent {
  allModalsService = inject(AllModalsService);
  metadata = inject(GetMetadataService);
  cache = inject(CacheService);
  api = inject(ApiService);
  submissionService = inject(SubmissionService);
  constructor() {
    this.allModalsService.setSubmitReview(() => this.submitReview());
  }

  reviewOptions = signal<ReviewOption[]>([
    {
      key: 'approve',
      label: 'Approve',
      description: 'Approve this result without changes.',
      icon: 'pi-check-circle',
      color: 'text-[#509C55]',
      message: 'Once this result is approved, no further changes will be allowed.',
      commentLabel: undefined,
      mark: false,
      statusId: 6,
      selected: false
    },
    {
      key: 'revise',
      label: 'Revise',
      description: 'Provide recommendations and changes.',
      icon: 'pi-minus-circle',
      color: 'text-[#e69f00]',
      message: 'The result submitter will address the provided recommendations and resubmit for review.',
      commentLabel: 'Add recommendations/comments',
      mark: true,
      statusId: 5,
      selected: false
    },
    {
      key: 'reject',
      label: 'Reject',
      description: 'Reject this result and specify the reason.',
      icon: 'pi-times-circle',
      color: 'text-[#cf0808]',
      message: 'If the result is rejected, it can no longer be edited or resubmitted.',
      commentLabel: 'Add the reject reason',
      mark: false,
      statusId: 7,
      selected: false
    }
  ]);

  submittionOptions = computed(() =>
    this.reviewOptions().map(option => ({ ...option, selected: option.statusId === this.submissionService.statusSelected()?.statusId }))
  );

  setComment = (event: Event) => this.submissionService.comment.set((event.target as HTMLTextAreaElement).value);

  async submitReview(): Promise<void> {
    const response = await this.api.PATCH_SubmitResult({
      resultId: this.cache.currentResultId(),
      comment: this.submissionService.comment(),
      status: this.submissionService.statusSelected()!.statusId
    });
    if (!response.successfulRequest) return;
    if (this.submissionService.statusSelected()?.statusId === 6) this.submissionService.comment.set('');
    await this.metadata.update(this.cache.currentResultId());
    this.allModalsService.closeModal('submitResult');
  }
}
