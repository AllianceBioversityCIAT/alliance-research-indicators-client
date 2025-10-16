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
import { Router } from '@angular/router';
import { SelectComponent } from '@shared/components/custom-fields/select/select.component';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';
import { OicrHeaderComponent } from '@shared/components/oicr-header/oicr-header.component';
import { PatchSubmitResultLatest } from '@shared/interfaces/patch_submit-result.interface';
import { CurrentResultService } from '@shared/services/cache/current-result.service';
import { ProjectResultsTableService } from '@shared/components/project-results-table/project-results-table.service';
import { ResultsCenterService } from '@pages/platform/pages/results-center/results-center.service';

@Component({
  selector: 'app-submit-result-content',
  imports: [DialogModule, ButtonModule, FormsModule, TextareaModule, SelectComponent, InputComponent, OicrHeaderComponent],
  templateUrl: './submit-result-content.component.html'
})
export class SubmitResultContentComponent {
  allModalsService = inject(AllModalsService);
  metadata = inject(GetMetadataService);
  cache = inject(CacheService);
  api = inject(ApiService);
  submissionService = inject(SubmissionService);
  actions = inject(ActionsService);
  currentResultService = inject(CurrentResultService);
  projectResultsTableService = inject(ProjectResultsTableService);
  resultsCenterService = inject(ResultsCenterService);
  private readonly router = inject(Router);

  form = signal<PatchSubmitResultLatest>({ mel_regional_expert: '', oicr_internal_code: '', sharepoint_link: '' });

  constructor() {
    this.allModalsService.setSubmitReview(() => this.submitReview());
    this.allModalsService.setDisabledSubmitReview(() => this.disabledConfirmSubmit());

    let wasVisible = false;
    effect(() => {
      const visible = this.allModalsService.modalConfig().submitResult.isOpen;
      if (!wasVisible && visible) {
        this.setInitialSelectedReviewOption();
        this.form.set({
          mel_regional_expert: this.submissionService.melRegionalExpert(),
          oicr_internal_code: this.submissionService.oicrNo(),
          sharepoint_link: this.submissionService.sharePointFolderLink()
        });
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

  private readonly baseReviewOptions: ReviewOption[] = [
    {
      key: 'approve',
      label: 'Approve',
      description: 'Approve this result without changes.',
      icon: 'pi-check-circle',
      color: 'text-[#509C55]',
      message: 'Once this result is approved, no further changes will be allowed.',
      commentLabel: undefined,
      placeholder: '',
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
      placeholder: '',
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
      placeholder: '',
      statusId: 7,
      selected: false
    }
  ];

  reviewOptions = computed<ReviewOption[]>(() => {
    const isLatest = this.allModalsService.submitResultOrigin?.() === 'latest';
    return this.baseReviewOptions.map(opt => {
      if (!isLatest) return opt;
      if (opt.key === 'approve') {
        return { ...opt, description: 'OICR development will continue with PISA support.', statusId: 4 };
      }
      if (opt.key === 'revise') {
        return { ...opt, label: 'Postpone', description: 'Not enough evidence for this reporting year.', commentLabel: 'Justification', placeholder: 'Please briefly elaborate your decision', statusId: 11 };
      }
      if (opt.key === 'reject') {
        return { ...opt, commentLabel: 'Justification', placeholder: 'Please briefly elaborate your decision' };
      }
      return opt;
    });
  });

  submittionOptions = computed(() =>
    this.reviewOptions().map(option => ({ ...option, selected: option.statusId === this.submissionService.statusSelected()?.statusId }))
  );

  setComment = (event: Event) => this.submissionService.comment.set((event.target as HTMLTextAreaElement).value);


  updateForm<K extends keyof PatchSubmitResultLatest>(key: K, value: PatchSubmitResultLatest[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  disabledConfirmSubmit = (): boolean => {
    const selected = this.submissionService.statusSelected();
    const comment = this.submissionService.comment();
    const isLatest = this.allModalsService.submitResultOrigin?.() === 'latest';
    const commentRequired = !!selected?.commentLabel && !comment?.trim();
    
    if (!selected) return true;
    
    if (isLatest && selected?.statusId === 4) {
      const form = this.form();
      const allFieldsFilled = form.mel_regional_expert?.trim() && form.oicr_internal_code?.trim() && form.sharepoint_link?.trim();
      return commentRequired || !allFieldsFilled;
    }
    
    return commentRequired;
  };

  private async refreshTables(): Promise<void> {
    try {
      if (this.projectResultsTableService.contractId) {
        await this.projectResultsTableService.getData();
      }
      await this.resultsCenterService.main();
    } catch (error) {
      console.error('Error refreshing tables:', error);
    }
  }

  private buildLatestBody(isApprove: boolean, formValue: PatchSubmitResultLatest): PatchSubmitResultLatest | undefined {
    if (!isApprove) return undefined;
    return {
      oicr_internal_code: formValue?.oicr_internal_code || '',
      mel_regional_expert: formValue?.mel_regional_expert || '',
      sharepoint_link: formValue?.sharepoint_link || ''
    };
  }

  private async handlePostSubmitForLegacyFlow(): Promise<boolean> {
    const response = await this.api.PATCH_SubmitResult({
      resultCode: this.cache.getCurrentNumericResultId(),
      comment: this.submissionService.comment(),
      status: this.submissionService.statusSelected()!.statusId
    });
    if (!response.successfulRequest) return false;
    if (this.submissionService.statusSelected()?.statusId === 6) this.submissionService.comment.set('');
    await this.metadata.update(this.cache.getCurrentNumericResultId());
    this.cache.lastResultId.set(null);
    this.cache.lastVersionParam.set(null);
    this.cache.liveVersionData.set(null);
    this.cache.versionsList.set([]);

    const currentPath = this.router.url.split('?')[0];
    await this.router.navigate([currentPath], { queryParams: {}, replaceUrl: true });

    await new Promise(resolve => setTimeout(resolve, 100));

    if (this.submissionService.statusSelected()?.statusId === 6) {
      const versionsResponse = await this.api.GET_Versions(this.cache.getCurrentNumericResultId());
      const versions = Array.isArray(versionsResponse.data.versions) ? versionsResponse.data.versions : [];
      this.cache.versionsList.set(versions);
      if (versions.length > 0) {
        await this.router.navigate([currentPath], {
          queryParams: { version: versions[0].report_year_id },
          replaceUrl: true
        });
      }
    }
    return true;
  }

  async submitReview(): Promise<void> {
    if (this.allModalsService.submitResultOrigin?.() === 'latest') {
      const isApprove = this.submissionService.statusSelected()?.statusId === 4;
      const formValue = this.form();
      const body = this.buildLatestBody(isApprove, formValue);
      const response = await this.api.PATCH_SubmitResult(
        {
          resultCode: this.cache.getCurrentNumericResultId(),
          comment: this.submissionService.comment(),
          status: this.submissionService.statusSelected()!.statusId
        },
        body
      );
      
      if (!response.successfulRequest) return;
      
      this.form.set({ mel_regional_expert: '', oicr_internal_code: '', sharepoint_link: '' });
      this.submissionService.comment.set('');
      this.submissionService.statusSelected.set(null);
      
      this.allModalsService.closeModal('submitResult');
      await this.refreshTables();
      this.actions.showGlobalAlert({
        severity: 'success',
        summary: 'Review submitted successfully',
        hasNoCancelButton: true,
        detail: 'Your review has been submitted and the OICR development process will continue with PISA support.',
        confirmCallback: {
          label: 'Done',
          event: () => {
            this.allModalsService.closeAllModals();
          }
        }
      });
    }
    else {
      const success = await this.handlePostSubmitForLegacyFlow();
      if (success) {
        this.allModalsService.closeModal('submitResult');
      }
    }
  }
}
