import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { AllModalsService } from '@services/cache/all-modals.service';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';

@Component({
  selector: 'app-submit-result-content',
  imports: [DialogModule, ButtonModule, FormsModule, TextareaModule, NgClass],
  templateUrl: './submit-result-content.component.html'
})
export class SubmitResultContentComponent implements OnInit {
  allModalsService = inject(AllModalsService);
  metadata = inject(GetMetadataService);
  cache = inject(CacheService);

  api = inject(ApiService);

  selectedAction: string = '';
  comments: string = '';

  reviewOptions = [
    {
      key: 'approve',
      label: 'Approve',
      description: 'Approve this result without changes.',
      icon: 'pi-check-circle',
      color: 'text-[#509C55]',
      message: 'Once this result is approved, no further changes will be allowed.',
      commentLabel: undefined,
      mark: false
    },
    {
      key: 'revise',
      label: 'Revise',
      description: 'Provide recommendations and changes.',
      icon: 'pi-minus-circle',
      color: 'text-[#e69f00]',
      message: 'The result submitter will address the provided recommendations and resubmit for review.',
      commentLabel: 'Add recommendations/comments',
      mark: true
    },
    {
      key: 'reject',
      label: 'Reject',
      description: 'Reject this result and specify the reason.',
      icon: 'pi-times-circle',
      color: 'text-[#cf0808]',
      message: 'If the result is rejected, it can no longer be edited or resubmitted.',
      commentLabel: 'Add the reject reason',
      mark: false
    }
  ];

  get selectedReviewOption() {
    return this.reviewOptions.find(option => option.key === this.selectedAction);
  }

  setSelectedAction(action: string): void {
    this.selectedAction = action;
  }

  ngOnInit(): void {
    this.initializeSelection();
  }

  initializeSelection(): void {
    const markedOption = this.reviewOptions.find(option => option.mark);
    if (markedOption) {
      this.selectedAction = markedOption.key;
    }
  }

  async submitReview(): Promise<void> {
    console.log(this.cache.currentMetadata().status_id);
    await this.api.PATCH_SubmitResult(this.cache.currentResultId(), { comment: this.comments || '' });
    this.metadata.update(this.cache.currentResultId());
  }
}
