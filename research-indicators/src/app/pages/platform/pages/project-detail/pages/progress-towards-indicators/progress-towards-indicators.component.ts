import { Component, OnInit, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { IndicatorDetailModalComponent } from './components/indicator-detail-modal.component';
import { MainChartModalComponent } from './components/main-chart-modal.component';
import { ContributorsOverlayComponent } from './components/contributors-overlay.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { GetIndicatorsProgress } from '../../../../../../shared/interfaces/get-indicators-progress.interface';
import { ActivatedRoute } from '@angular/router';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { SetUpProjectService } from '../../../set-up-project/set-up-project.service';

@Component({
  selector: 'app-progress-towards-indicators',
  imports: [
    TableModule,
    TagModule,
    ButtonModule,
    ProgressBarModule,
    TooltipModule,
    IndicatorDetailModalComponent,
    MainChartModalComponent,
    ContributorsOverlayComponent
  ],
  templateUrl: './progress-towards-indicators.component.html',
  styleUrl: './progress-towards-indicators.component.scss'
})
export default class ProgressTowardsIndicatorsComponent implements OnInit {
  api = inject(ApiService);
  route = inject(ActivatedRoute);
  cache = inject(CacheService);
  setupProjectService = inject(SetUpProjectService);

  indicators = signal<GetIndicatorsProgress[]>([]);

  // Modal properties
  showDetailModal = false;
  selectedIndicator: GetIndicatorsProgress | null = null;
  showMainChartModal = false;

  ngOnInit() {
    this.GET_IndicatorsProgress();
  }

  GET_IndicatorsProgress() {
    this.api.GET_IndicatorsProgress(this.cache.currentProjectId()).then(res => {
      res.data.map(indicator => {
        indicator.base_line = Number(indicator.base_line);
        indicator.target_value = Number(indicator.target_value);
        indicator.total_contributions = 0;
        indicator.total_average_contributions = 0;

        indicator.contributions.map(contribution => {
          contribution.is_no_contribution = contribution.contribution_value === null;
          contribution.contribution_value = contribution.is_no_contribution ? null : Number(contribution.contribution_value);

          if (!contribution.is_no_contribution) {
            indicator.total_contributions += contribution.contribution_value!;
            // } else if (indicator.number_type === 'average') {
            //   console.log(indicator.contributions.filter(c => !c.is_no_contribution).length);
            //   indicator.total_contributions += contribution.contribution_value! / indicator.contributions.filter(c => !c.is_no_contribution).length;
            // }
          }
        });

        indicator.total_average_contributions =
          Math.round((indicator.total_contributions / indicator.contributions.filter(c => !c.is_no_contribution).length) * 100) / 100;

        const percentageProgress = (indicator.total_contributions / indicator.target_value) * 100;
        indicator.percentageProgress = percentageProgress > 100 ? 100 : Math.round(percentageProgress * 10000) / 10000;
      });

      this.indicators.set(res.data);
    });
  }

  getRemainingStatus(indicator: GetIndicatorsProgress): 'remaining' | 'exceeded' | 'exact' {
    if (!indicator.target_value) return 'exact';

    const difference = indicator.total_contributions - indicator.target_value;
    if (difference === 0) return 'exact';
    if (difference > 0) return 'exceeded';
    return 'remaining';
  }

  getRemainingStatusText(indicator: GetIndicatorsProgress): string {
    const status = this.getRemainingStatus(indicator);
    const difference = Math.abs(indicator.total_contributions - indicator.target_value);

    switch (status) {
      case 'remaining':
        return `${difference} remaining`;
      case 'exceeded':
        return `+${difference} exceeded`;
      default:
        return '';
    }
  }

  openDetail(indicator: GetIndicatorsProgress) {
    this.setupProjectService.progressIndicatorsData.set({ showSplitter: true, indicator });
  }

  getRemainingChipClass(indicator: GetIndicatorsProgress): string {
    const status = this.getRemainingStatus(indicator);
    const baseClass = 'px-1.5 py-0.5 rounded flex items-center gap-1';

    switch (status) {
      case 'remaining':
        return `${baseClass} bg-yellow-50 border border-yellow-200`;
      case 'exceeded':
        return `${baseClass} bg-green-50 border border-green-200`;
      default:
        return baseClass;
    }
  }

  getRemainingTextClass(indicator: GetIndicatorsProgress): string {
    const status = this.getRemainingStatus(indicator);

    switch (status) {
      case 'remaining':
        return 'text-yellow-600';
      case 'exceeded':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  }

  openDetailModal(indicator: GetIndicatorsProgress): void {
    this.selectedIndicator = indicator;
    this.showDetailModal = true;
  }

  openMainChartModal(): void {
    this.showMainChartModal = true;
  }

  openIndicatorsInNewTab(): void {
    const url = `/project-detail/${this.cache.currentProjectId()}/set-up-project/indicators`;
    window.open(url, '_blank');
  }
}
