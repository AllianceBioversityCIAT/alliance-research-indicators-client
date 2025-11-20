import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { ApiService } from '@shared/services/api.service';
import { Result, ResultConfig } from '@shared/interfaces/result/result.interface';
import { TooltipModule } from 'primeng/tooltip';
import { ActionsService } from '@shared/services/actions.service';
import { LinkResultsResponse } from '@shared/interfaces/link-results.interface';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';

const MODAL_INDICATOR_CODES = [1, 2, 4, 5] as const;

@Component({
  selector: 'app-links-to-result',
  imports: [FormHeaderComponent, NavigationButtonsComponent, S3ImageUrlPipe, TooltipModule, CustomTagComponent],
  templateUrl: './links-to-result.component.html'
})
export default class LinksToResultComponent implements OnInit {
  private router = inject(Router);
  private cache = inject(CacheService);
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private actions = inject(ActionsService);
  submission = inject(SubmissionService);
  allModalsService = inject(AllModalsService);

  linkedResults = signal<Result[]>([]);
  loading = signal(false);
  removing = signal<number | null>(null);
  private previousModalState = false;

  constructor() {
    // Reload linked results when modal closes
    effect(() => {
      const isModalOpen = this.allModalsService.modalConfig().selectLinkedResults.isOpen;
      if (this.previousModalState && !isModalOpen) {
        // Modal was just closed, reload data
        void this.loadLinkedResults();
      }
      this.previousModalState = isModalOpen;
    });
  }

  ngOnInit(): void {
    void this.loadLinkedResults();
  }

  async loadLinkedResults(): Promise<void> {
    this.loading.set(true);
    try {
      const resultId = this.cache.getCurrentNumericResultId();
      const response = await this.api.GET_LinkedResults(resultId);
      const linkedResultIds = response.data?.link_results?.map(item => item.other_result_id) ?? [];
      
      if (linkedResultIds.length === 0) {
        this.linkedResults.set([]);
        return;
      }

      // Load all results with the same config as the modal
      const resultFilter = {
        'indicator-codes-tabs': [...MODAL_INDICATOR_CODES],
        'indicator-codes-filter': []
      };
      
      const resultConfig: ResultConfig = {
        indicators: true,
        'result-status': true,
        contracts: true,
        'primary-contract': true,
        'primary-lever': true,
        levers: true,
        'audit-data': true,
        'audit-data-object': true
      };

      const resultsResponse = await this.api.GET_Results(resultFilter, resultConfig);
      const allResults = Array.isArray(resultsResponse?.data) ? resultsResponse.data : [];
      
      // Filter to only include linked results
      const matched = allResults.filter(result => 
        linkedResultIds.includes(result.result_id)
      );
      
      this.linkedResults.set(matched);
    } catch (error) {
      console.error('Error loading linked results', error);
      this.linkedResults.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  formatResultCode(code: string | number): string {
    if (!code) return String(code || '');
    return String(code).padStart(3, '0');
  }

  getIndicatorIcon(result: Result): { icon: string; color: string } {
    const indicatorName = result.indicators?.name?.toLowerCase() || '';
    const iconSrc = result.indicators?.icon_src || '';
console.log(indicatorName);
    // Mapeo basado en el nombre del indicador (case-insensitive)
    if (indicatorName.includes('innovation development')) {
      return { icon: 'pi pi-flag', color: '#7CB580' };
    }
    if (indicatorName.includes('innovation use')) {
      return { icon: 'pi pi-sun', color: '#F58220' };
    }
    if (indicatorName.includes('capacity sharing')) {
      return { icon: 'pi pi-users', color: '#7CB580' };
    }
    if (indicatorName.includes('oicr') || indicatorName.includes('outcome impact case report')) {
      return { icon: 'pi pi-chart-pie', color: '#F58220' };
    }
    if (indicatorName.includes('knowledge product')) {
      return { icon: 'pi pi-lightbulb', color: '#7CB580' };
    }
    if (indicatorName.includes('policy change')) {
      return { icon: 'pi pi-folder-open', color: '#F58220' };
    }

    // Fallback al icono del API si existe
    if (iconSrc) {
      // Determinar color basado en el tipo de indicador
      const isOutcome = indicatorName.includes('outcome') || iconSrc.includes('pi-sun') || iconSrc.includes('pi-chart-pie') || iconSrc.includes('pi-folder-open');
      return { icon: iconSrc, color: isOutcome ? '#F58220' : '#7CB580' };
    }

    return { icon: 'pi-circle', color: '#7CB580' };
  }

  async removeLinkedResult(resultId: number): Promise<void> {
    if (!this.submission.isEditableStatus()) return;

    this.removing.set(resultId);
    try {
      const currentResults = this.linkedResults();
      const updatedResults = currentResults.filter(r => r.result_id !== resultId);

      const payload: LinkResultsResponse = {
        link_results: updatedResults.map(result => ({
          other_result_id: Number(result.result_id)
        }))
      };

      const currentResultId = this.cache.getCurrentNumericResultId();
      await this.api.PATCH_LinkedResults(currentResultId, payload);

      this.actions.showToast({
        severity: 'success',
        summary: 'Linked results',
        detail: 'Result unlinked successfully'
      });

      this.linkedResults.set(updatedResults);
    } catch (error) {
      this.actions.showToast({
        severity: 'error',
        summary: 'Linked results',
        detail: 'Unable to unlink result, please try again'
      });
      console.error(error);
    } finally {
      this.removing.set(null);
    }
  }

  navigate(page?: 'next' | 'back'): void {
    const version = this.route.snapshot.queryParamMap.get('version');
    const queryParams = version ? { version } : undefined;

    if (page === 'back') {
      this.router.navigate(['result', this.cache.currentResultId(), 'geographic-scope'], {
        queryParams,
        replaceUrl: true
      });
      return;
    }

    if (page === 'next') {
      this.router.navigate(['result', this.cache.currentResultId(), 'evidence'], {
        queryParams,
        replaceUrl: true
      });
    }
  }

  openSearchLinkedResults(): void {
    this.allModalsService.openModal('selectLinkedResults');
  }
}

