import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { GetIndicatorsProgress } from '../../../../../shared/interfaces/get-indicators-progress.interface';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-indicators-progress',
  imports: [TableModule, TagModule, ButtonModule, ProgressBarModule, TooltipModule],
  templateUrl: './indicators-progress.component.html',
  styleUrl: './indicators-progress.component.scss'
})
export default class IndicatorsProgressComponent implements OnInit {
  api = inject(ApiService);
  route = inject(ActivatedRoute);

  indicators = signal<GetIndicatorsProgress[]>([]);
  expandedRows: Record<number, boolean> = {};

  ngOnInit() {
    this.GET_IndicatorsProgress();
  }

  GET_IndicatorsProgress() {
    this.api.GET_IndicatorsProgress(this.route.snapshot.params['id']).then(res => {
      console.log(res.data);
      res.data.map(indicator => {
        indicator.base_line = Number(indicator.base_line);
        indicator.target_value = Number(indicator.target_value);
        indicator.total_contributions = 0;
        console.log(indicator.number_type);
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
      console.log(res.data);
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
    if (progress >= 100) return 'custom-progress-success';
    if (progress >= 75) return 'custom-progress-good';
    if (progress >= 50) return 'custom-progress-warning';
    return 'custom-progress-danger';
  }

  getProgressTextClass(indicator: GetIndicatorsProgress): string {
    const progress = this.calculateProgress(indicator);
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getRemainingText(indicator: GetIndicatorsProgress): string {
    const remaining = indicator.target_value - indicator.total_contributions;
    if (remaining <= 0) {
      return 'Target achieved!';
    }
    return `${remaining} remaining`;
  }

  toggleRow(rowIndex: number): void {
    this.expandedRows[rowIndex] = !this.expandedRows[rowIndex];
  }
}
