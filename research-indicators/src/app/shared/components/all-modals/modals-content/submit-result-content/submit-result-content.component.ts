import { Component, computed, effect, inject, signal } from '@angular/core';
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
import { ActionsService } from '@shared/services/actions.service';

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
  actions = inject(ActionsService);

  constructor() {
    this.allModalsService.setSubmitReview(() => this.submitReview());
    this.allModalsService.setDisabledSubmitReview(() => this.disabledConfirmSubmit());

    let wasVisible = false;
    effect(() => {
      const visible = this.allModalsService.modalConfig().submitResult.isOpen;
      if (!wasVisible && visible) {
        this.setInitialSelectedReviewOption();
      }
      wasVisible = visible;
    });
  }
  setInitialSelectedReviewOption(): void {
    const currentStatusId = this.cache.currentMetadata()?.status_id;
    if (currentStatusId == null) return;

    const matchingOption = this.reviewOptions().find(option => option.statusId === currentStatusId);
    if (matchingOption) {
      this.submissionService.statusSelected.set(matchingOption);
    }
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
      statusId: 7,
      selected: false
    }
  ]);

  submittionOptions = computed(() =>
    this.reviewOptions().map(option => ({ ...option, selected: option.statusId === this.submissionService.statusSelected()?.statusId }))
  );

  setComment = (event: Event) => this.submissionService.comment.set((event.target as HTMLTextAreaElement).value);

  disabledConfirmSubmit = (): boolean => {
    const selected = this.submissionService.statusSelected();
    const comment = this.submissionService.comment();
    return !!selected?.commentLabel && !comment?.trim();
  };

  async submitReview(): Promise<void> {
    const response = await this.api.PATCH_SubmitResult({
      resultCode: this.cache.currentResultId(),
      comment: this.submissionService.comment(),
      status: this.submissionService.statusSelected()!.statusId
    });
    if (!response.successfulRequest) {
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: response.errorDetail.errors });
    } else if (!this.submissionService.currentResultIsSubmitted()) {
      this.actions.showGlobalAlert({
        severity: 'success',
        hasNoButton: true,
        summary: 'RESULT SUBMITTED',
        detail: 'The result was submitted successfully.'
      });
    }
    if (this.submissionService.statusSelected()?.statusId === 6) this.submissionService.comment.set('');
    await this.metadata.update(this.cache.currentResultId());
    this.allModalsService.closeModal('submitResult');
  }
}
