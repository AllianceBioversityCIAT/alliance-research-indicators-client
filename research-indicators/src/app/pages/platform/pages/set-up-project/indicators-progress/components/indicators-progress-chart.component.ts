import { Component, OnInit, OnChanges, ElementRef, ViewChild, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type { PieSeriesOption } from 'echarts/charts';
import type { TitleComponentOption, TooltipComponentOption, LegendComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import { GetIndicatorsProgress } from '../../../../../../shared/interfaces/get-indicators-progress.interface';

// Register ECharts components
echarts.use([PieChart, TitleComponent, TooltipComponent, LegendComponent, LabelLayout, CanvasRenderer]);

type ECOption = ComposeOption<PieSeriesOption | TitleComponentOption | TooltipComponentOption | LegendComponentOption>;

@Component({
  selector: 'app-indicators-progress-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div class="mb-4">
        <h4 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i class="pi pi-chart-pie text-blue-600"></i>
          Progress Distribution
        </h4>
        <p class="text-sm text-gray-600">Overall progress status across all indicators</p>
      </div>
      <div #chartContainer class="chart-element" style="width: 100%; height: 350px;"></div>
    </div>
  `,
  styles: [
    `
      .chart-container {
        margin-bottom: 1rem;
      }
      .chart-element {
        min-height: 350px;
      }
    `
  ]
})
export class IndicatorsProgressChartComponent implements OnInit, OnChanges {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() indicators = signal<GetIndicatorsProgress[]>([]);

  private chart: echarts.ECharts | null = null;

  ngOnInit() {
    this.initChart();
    this.updateChart(this.indicators());
  }

  ngOnChanges() {
    if (this.chart && this.indicators().length >= 0) {
      this.updateChart(this.indicators());
    }
  }

  private getDummyData(): GetIndicatorsProgress[] {
    return [
      {
        indicator_id: 1,
        code: 'IND-001',
        name: 'Climate Resilient Crops',
        description: 'Farmers adopting climate-resilient varieties',
        target_unit: 'farmers',
        number_type: 'sum',
        number_format: 'number',
        target_value: 1000,
        base_line: 100,
        year: [2024],
        type: 'outcome',
        contributions: [],
        total_contributions: 850 // 85% progress
      },
      {
        indicator_id: 2,
        code: 'IND-002',
        name: 'Water Efficiency',
        description: 'Water use efficiency improvement',
        target_unit: '%',
        number_type: 'average',
        number_format: 'percentage',
        target_value: 25,
        base_line: 5,
        year: [2024],
        type: 'output',
        contributions: [],
        total_contributions: 20 // 75% progress
      },
      {
        indicator_id: 3,
        code: 'IND-003',
        name: 'Research Publications',
        description: 'Peer-reviewed publications',
        target_unit: 'publications',
        number_type: 'count',
        number_format: 'number',
        target_value: 15,
        base_line: 2,
        year: [2024],
        type: 'output',
        contributions: [],
        total_contributions: 8 // 46% progress
      },
      {
        indicator_id: 4,
        code: 'IND-004',
        name: 'Food Security Index',
        description: 'Regional food security improvement',
        target_unit: 'points',
        number_type: 'average',
        number_format: 'decimal',
        target_value: 7.5,
        base_line: 4.2,
        year: [2024],
        type: 'impact',
        contributions: [],
        total_contributions: 6.8 // 79% progress
      }
    ];
  }

  private initChart() {
    if (this.chartContainer?.nativeElement) {
      this.chart = echarts.init(this.chartContainer.nativeElement);
    }
  }

  private calculateProgress(indicator: GetIndicatorsProgress): number {
    if (!indicator.target_value || indicator.target_value === 0) {
      return 0;
    }

    let progress = 0;
    if (indicator.base_line && indicator.base_line > 0) {
      const range = indicator.target_value - indicator.base_line;
      const current = indicator.total_contributions - indicator.base_line;
      progress = (current / range) * 100;
    } else {
      progress = (indicator.total_contributions / indicator.target_value) * 100;
    }

    return Math.max(0, Math.min(100, Math.round(progress)));
  }

  private updateChart(indicators: GetIndicatorsProgress[]) {
    if (!this.chart) return;

    // Show empty state if no data
    if (!indicators || indicators.length === 0) {
      const emptyOption: ECOption = {
        title: {
          text: 'No Progress Data Available',
          subtext: 'Add indicators with contributions to view progress distribution',
          left: 'center',
          top: 'center',
          textStyle: {
            fontSize: 16,
            color: '#666'
          },
          subtextStyle: {
            fontSize: 12,
            color: '#999'
          }
        }
      };
      this.chart.setOption(emptyOption);
      return;
    }

    // Categorize indicators by progress level
    const progressCategories = {
      completed: 0, // >= 100%
      onTrack: 0, // >= 75%
      atRisk: 0, // >= 50%
      critical: 0 // < 50%
    };

    indicators.forEach(indicator => {
      const progress = this.calculateProgress(indicator);
      if (progress >= 100) {
        progressCategories.completed++;
      } else if (progress >= 75) {
        progressCategories.onTrack++;
      } else if (progress >= 50) {
        progressCategories.atRisk++;
      } else {
        progressCategories.critical++;
      }
    });

    const option: ECOption = {
      title: {
        text: 'Progress Status Distribution',
        subtext: `Total Indicators: ${indicators.length}`,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        bottom: 10,
        left: 'center'
      },
      series: [
        {
          name: 'Progress Status',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: progressCategories.completed,
              name: 'Completed (≥100%)',
              itemStyle: { color: '#22c55e' }
            },
            {
              value: progressCategories.onTrack,
              name: 'On Track (≥75%)',
              itemStyle: { color: '#3b82f6' }
            },
            {
              value: progressCategories.atRisk,
              name: 'At Risk (≥50%)',
              itemStyle: { color: '#f59e0b' }
            },
            {
              value: progressCategories.critical,
              name: 'Critical (<50%)',
              itemStyle: { color: '#ef4444' }
            }
          ].filter(item => item.value > 0) // Only show categories with data
        }
      ]
    };

    this.chart.setOption(option);
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }
}
