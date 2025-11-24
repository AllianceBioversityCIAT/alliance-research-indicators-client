import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
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
import { CustomTagComponent } from '../custom-tag/custom-tag.component';
import { SetUpProjectService } from '../../../pages/platform/pages/set-up-project/set-up-project.service';
import { StatusDropdownComponent } from '../status-dropdown/status-dropdown.component';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';
import { RolesService } from '@shared/services/cache/roles.service';

interface SubmissionAlertData {
  severity: 'success' | 'warning';
  summary: string;
  detail: string;
  placeholder: string;
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
  imports: [CustomTagComponent, StatusDropdownComponent, RouterLink, RouterLinkActive, ButtonModule, CommonModule, TooltipModule, S3ImageUrlPipe],
  templateUrl: './result-sidebar.component.html',
  styleUrl: './result-sidebar.component.scss'
})
export class ResultSidebarComponent implements OnInit {
  cache = inject(CacheService);
  actions = inject(ActionsService);
  allModalsService = inject(AllModalsService);
  api = inject(ApiService);
  setUpProjectService = inject(SetUpProjectService);
  metadata = inject(GetMetadataService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  submissionService = inject(SubmissionService);
  roles = inject(RolesService);
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
      label: 'OICR Details',
      path: 'oicr-details',
      indicator_id: 5,
      greenCheckKey: 'oicr'
    },
    {
      label: 'Innovation details',
      path: 'innovation-details',
      indicator_id: 2,
      greenCheckKey: 'innovation_dev'
    },
    {
      label: 'CapSharing details',
      path: 'capacity-sharing',
      indicator_id: 1,
      greenCheckKey: 'cap_sharing'
    },
    {
      label: 'Policy Change details',
      path: 'policy-change',
      indicator_id: 4,
      greenCheckKey: 'policy_change'
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
      label: 'Links to result',
      path: 'links-to-result',
      greenCheckKey: 'link_result'
    },
    {
      label: 'Evidence',
      path: 'evidence',
      greenCheckKey: 'evidences'
    },
    {
      label: 'IP Rights',
      path: 'ip-rights',
      indicator_id: 1,
      greenCheckKey: 'ip_rights'
    },
    {
      label: 'IP Rights',
      path: 'ip-rights',
      indicator_id: 2,
      greenCheckKey: 'ip_rights'
    }
  ]);

  ngOnInit() {
    if (this.cache.onlyMvpUsers()) this.allOptions.update(prev => [...prev, ...this.setUpProjectService.mvpSidebarSections()]);
  }

  submissionAlertData = computed(
    (): SubmissionAlertData => ({
      severity: 'success',
      placeholder: 'Add any additional comments here',
      summary: 'CONFIRM SUBMISSION',
      detail: `The result <span class="font-medium">"${this.cache.currentMetadata().result_title}"</span> is about to be <span class="font-medium">submitted</span>. Once confirmed, no further changes can be made. If you have any comments, feel free to add them below.`
    })
  );

  unsavedChangesAlertData = computed(
    (): SubmissionAlertData => ({
      severity: 'warning',
      placeholder: 'Please share your feedback about the unsubmission',
      summary: 'CONFIRM UNSUBMISSION',
      detail: `You are about to <span class="font-medium">unsubmit</span> the result <span class="font-medium">"${this.cache.currentMetadata().result_title}"</span>. To continue, please provide a brief reason for the unsubmission.`
    })
  );

  getCompletedCount(): number {
    return this.allOptionsWithGreenChecks().filter(option => option.greenCheck).length;
  }

  getTotalCount(): number {
    return this.allOptionsWithGreenChecks().filter(option => !option.hide).length;
  }

  submmitConfirm() {
    const { severity, placeholder, summary, detail } = this.submissionService.currentResultIsSubmitted()
      ? this.unsavedChangesAlertData()
      : this.submissionAlertData();

    this.actions.showGlobalAlert({
      severity,
      summary,
      detail,
      placeholder,
      commentLabel: this.submissionService.currentResultIsSubmitted() ? 'Feedback about the unsubmission' : 'Comment',
      commentRequired: this.submissionService.currentResultIsSubmitted(),
      confirmCallback: {
        label: 'Confirm',
        event: (data?: { comment?: string; selected?: string }) => {
          (async () => {
            const response = await this.api.PATCH_SubmitResult({
              resultCode: this.cache.getCurrentNumericResultId(),
              comment: data?.comment ?? '',
              status: this.submissionService.currentResultIsSubmitted() ? 4 : 2
            });
            this.metadata.update(this.cache.getCurrentNumericResultId());
            this.submissionService.refreshSubmissionHistory.update(v => v + 1);
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
          })();
        }
      }
    });
  }

  navigateTo(option: SidebarOption, event: Event) {
    if (option.disabled) {
      event.preventDefault();
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    const version = this.route.snapshot.queryParamMap.get('version');
    const commands = ['/result', id, option.path];

    const queryParams = version ? { version } : {};

    this.router.navigate(commands, {
      queryParams,
      replaceUrl: true
    });
  }

  getRouterLink(option: SidebarOption): string[] | null {
    if (option.disabled) return null;

    const id = this.route.snapshot.paramMap.get('id');
    return ['/result', id!, option.path];
  }

  async onStatusChange(newStatusId: number): Promise<void> {
    try {
      const response = await this.api.PATCH_SubmitResult({
        resultCode: this.cache.getCurrentNumericResultId(),
        comment: '',
        status: newStatusId
      });
      
      if (response.successfulRequest) {
        this.metadata.update(this.cache.getCurrentNumericResultId());
        this.actions.showToast({
          severity: 'success',
          summary: 'Status updated',
          detail: 'The status has been updated successfully'
        });
      } else {
        this.actions.showToast({
          severity: 'error',
          summary: 'Error',
          detail: response.errorDetail?.errors || 'Unable to update status, please try again'
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      this.actions.showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to update status, please try again'
      });
    }
  }
}
