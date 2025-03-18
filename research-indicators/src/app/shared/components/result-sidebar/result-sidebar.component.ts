import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CacheService } from '../../services/cache/cache.service';
import { GreenChecks } from '../../interfaces/get-green-checks.interface';
import { CommonModule } from '@angular/common';
import { ActionsService } from '@shared/services/actions.service';
import { TooltipModule } from 'primeng/tooltip';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { ApiService } from '../../services/api.service';
import { GetMetadataService } from '../../services/get-metadata.service';
import { SubmissionService } from '../../services/submission.service';

interface submissionAlertData {
  severity: 'success' | 'warning';
  summary: string;
  detail: string;
}
interface SidebarOption {
  label: string;
  path: string;
  indicator_id?: number;
  disabled?: boolean;
  underConstruction?: boolean;
  hide?: boolean;
  greenCheckKey: string;
  greenCheck?: boolean;
}

@Component({
  selector: 'app-result-sidebar',
  imports: [RouterLink, RouterLinkActive, ButtonModule, CommonModule, TooltipModule],
  templateUrl: './result-sidebar.component.html',
  styleUrl: './result-sidebar.component.scss'
})
export class ResultSidebarComponent {
  cache = inject(CacheService);
  actions = inject(ActionsService);
  allModalsService = inject(AllModalsService);
  api = inject(ApiService);
  metadata = inject(GetMetadataService);
  submissionService = inject(SubmissionService);
  allOptionsWithGreenChecks = computed(() => {
    return this.allOptions()
      .filter(option => option?.indicator_id === this.cache.currentMetadata()?.indicator_id || !option?.indicator_id)
      .map(option => ({
        ...option,
        greenCheck: Boolean(this.cache.greenChecks()[option.greenCheckKey as keyof GreenChecks])
      }));
  });

  allOptions: WritableSignal<SidebarOption[]> = signal([
    {
      label: 'General information',
      path: 'general-information',
      greenCheckKey: 'general_information'
    },
    {
      label: 'Alliance Alignment',
      path: 'alliance-alignment',
      greenCheckKey: 'alignment'
    },
    {
      label: 'Capacity Sharing',
      path: 'capacity-sharing',
      indicator_id: 1,
      greenCheckKey: 'cap_sharing'
    },
    {
      label: 'Policy Change details',
      path: 'policy-change',
      indicator_id: 4,
      greenCheckKey: 'completness'
    },
    {
      label: 'Partners',
      path: 'partners',
      greenCheckKey: 'partners'
    },
    {
      label: 'Geographic scope',
      path: 'geographic-scope',
      underConstruction: false,
      hide: false,
      greenCheckKey: 'geo_location'
    },
    {
      label: 'Evidence',
      path: 'evidence',
      greenCheckKey: 'evidences'
    }
  ]);

  submissionAlertData = computed(
    (): submissionAlertData => ({
      severity: 'success',
      summary: 'CONFIRM SUBMISSION',
      detail: `The result <span class="font-medium">"${this.cache.currentMetadata().result_title}"</span> is about to be <span class="font-medium">submitted</span>. Once confirmed, no further changes can be made. If you have any comments, feel free to add them below.`
    })
  );

  unsavedChangesAlertData = computed(
    (): submissionAlertData => ({
      severity: 'warning',
      summary: 'CONFIRM UNSUBMISSION',
      detail: `You are about to <span class="font-medium">unsubmit</span> the result <span class="font-medium">"${this.cache.currentMetadata().result_title}"</span>. To continue, please provide a brief reason for the unsubmission.`
    })
  );

  submmitConfirm() {
    const { severity, summary, detail } = this.submissionService.currentResultIsSubmitted()
      ? this.unsavedChangesAlertData()
      : this.submissionAlertData();

    console.log(this.cache.currentMetadata().status_id);

    this.actions.showGlobalAlert({
      severity,
      summary,
      detail,
      commentLabel: this.submissionService.currentResultIsSubmitted() ? 'Feedback about the unsubmission' : 'Comment',
      commentRequired: this.submissionService.currentResultIsSubmitted(),
      confirmCallback: {
        label: 'Submit',
        event: async (comment?: string) => {
          await this.api.PATCH_SubmitResult({
            resultId: this.cache.currentResultId(),
            comment: comment || '',
            status: this.submissionService.currentResultIsSubmitted() ? 4 : 2
          });
          this.metadata.update(this.cache.currentResultId());
          return;
        }
      }
    });
  }
}
