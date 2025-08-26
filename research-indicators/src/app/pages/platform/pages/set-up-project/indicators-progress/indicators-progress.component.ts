import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { GetIndicatorsProgress } from '../../../../../shared/interfaces/get-indicators-progress.interface';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { IndicatorDetailModalComponent } from './components/indicator-detail-modal.component';
import { MainChartModalComponent } from './components/main-chart-modal.component';

@Component({
  selector: 'app-indicators-progress',
  imports: [TableModule, TagModule, ButtonModule, ProgressBarModule, TooltipModule, IndicatorDetailModalComponent, MainChartModalComponent],
  templateUrl: './indicators-progress.component.html',
  styleUrl: './indicators-progress.component.scss'
})
export default class IndicatorsProgressComponent implements OnInit {
  api = inject(ApiService);
  route = inject(ActivatedRoute);

  indicators = signal<GetIndicatorsProgress[]>([]);
  expandedRows: Record<number, boolean> = {};

  // Modal properties
  showDetailModal = false;
  selectedIndicator: GetIndicatorsProgress | null = null;
  showMainChartModal = false;

  ngOnInit() {
    this.GET_IndicatorsProgress();
  }

  GET_IndicatorsProgress() {
    this.api.GET_IndicatorsProgress(this.route.snapshot.params['id']).then(res => {
      res.data.map(indicator => {
        indicator.base_line = Number(indicator.base_line);
        indicator.target_value = Number(indicator.target_value);
        indicator.total_contributions = 0;
        indicator.contributions.map(contribution => {
          contribution.contribution_value = Number(contribution.contribution_value);
          if (indicator.number_type === 'sum') {
            indicator.total_contributions += contribution.contribution_value;
          } else if (indicator.number_type === 'average') {
            indicator.total_contributions += contribution.contribution_value / indicator.contributions.length;
          } else if (indicator.number_type === 'count') {
            indicator.total_contributions += 1;
          }
        });
      });

      this.indicators.set(res.data);

      // Expandir todas las filas por defecto
      res.data.forEach((_, index) => {
        this.expandedRows[index] = true;
      });
    });
  }

  calculateProgress(indicator: GetIndicatorsProgress): number {
    if (!indicator.target_value || indicator.target_value === 0) {
      return 0;
    }

    // Calcular progreso basado en baseline y target
    let progress = 0;
    if (indicator.base_line && indicator.base_line > 0) {
      // Si hay baseline, calcular progreso desde baseline hasta target
      const range = indicator.target_value - indicator.base_line;
      const current = indicator.total_contributions - indicator.base_line;
      progress = (current / range) * 100;
    } else {
      // Si no hay baseline, calcular progreso directo al target
      progress = (indicator.total_contributions / indicator.target_value) * 100;
    }

    // Limitar entre 0 y 100%
    return Math.max(0, Math.min(100, Math.round(progress)));
  }

  getProgressBarClass(indicator: GetIndicatorsProgress): string {
    const progress = this.calculateProgress(indicator);
    if (progress >= 100) return 'custom-progress-complete';
    return 'custom-progress-primary';
  }

  getProgressTextClass(indicator: GetIndicatorsProgress): string {
    const progress = this.calculateProgress(indicator);
    if (progress >= 100) return 'text-green-600';
    return 'text-blue-600';
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

  toggleRow(rowIndex: number): void {
    this.expandedRows[rowIndex] = !this.expandedRows[rowIndex];
  }

  allExpanded(): boolean {
    const totalRows = this.indicators().length;
    if (totalRows === 0) return false;

    const expandedCount = Object.values(this.expandedRows).filter(expanded => expanded).length;
    return expandedCount === totalRows;
  }

  toggleAllRows(): void {
    const shouldExpand = !this.allExpanded();

    this.indicators().forEach((_, index) => {
      this.expandedRows[index] = shouldExpand;
    });
  }

  openDetailModal(indicator: GetIndicatorsProgress): void {
    this.selectedIndicator = indicator;
    this.showDetailModal = true;
  }

  openMainChartModal(): void {
    this.showMainChartModal = true;
  }
}
