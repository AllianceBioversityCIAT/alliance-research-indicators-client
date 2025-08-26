import { Component, OnInit, OnChanges, ElementRef, ViewChild, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, DatasetComponent, TransformComponent } from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts';
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  LegendComponentOption,
  DatasetComponentOption
} from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import { GetIndicatorsProgress } from '../../../../../../shared/interfaces/get-indicators-progress.interface';

// Register ECharts components
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

type ECOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | DatasetComponentOption
>;

@Component({
  selector: 'app-indicators-chart',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="chart-container bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div class="mb-4 flex justify-between items-start">
        <div>
          <h4 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <i class="pi pi-chart-bar text-blue-600"></i>
            Indicators Progress Overview
          </h4>
          <p class="text-sm text-gray-600">Visual representation of indicators performance vs targets</p>
        </div>
        <p-button
          icon="pi pi-external-link"
          label="View Chart"
          size="small"
          severity="info"
          [outlined]="true"
          (onClick)="onViewChart()"
          pTooltip="View detailed chart with individual indicators"
          tooltipPosition="left"
          class="text-xs">
        </p-button>
      </div>
      <div #chartContainer class="chart-element" style="width: 100%; height: 400px;"></div>
    </div>
  `,
  styles: [
    `
      .chart-container {
        margin-bottom: 1rem;
      }
      .chart-element {
        min-height: 400px;
      }
    `
  ]
})
export class IndicatorsChartComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() indicators: GetIndicatorsProgress[] = [];
  @Output() viewChart = new EventEmitter<void>();

  private chart: echarts.ECharts | null = null;

  ngOnInit() {
    this.initChart();
    this.updateChart(this.indicators);
  }

  ngOnChanges() {
    if (this.chart) {
      this.updateChart(this.indicators);
    }
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
          text: 'No Indicators Data Available',
          subtext: 'Add indicators to view progress visualization',
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

    // Use codes for better space efficiency in main chart
    const indicatorNames = indicators.map(ind => ind.code);
    const progressData = indicators.map(ind => this.calculateProgress(ind));
    const currentValues = indicators.map(ind => ind.total_contributions);
    const targetValues = indicators.map(ind => ind.target_value);
    const baselineValues = indicators.map(ind => ind.base_line || 0);

    const option: ECOption = {
      title: {
        text: 'Indicators Progress Dashboard',
        subtext: 'Current Progress vs Targets',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex;
          const indicator = indicators[dataIndex];
          const progress = this.calculateProgress(indicator);

          return `
            <div style="padding: 8px;">
              <strong>${indicator.name}</strong><br/>
              <span style="color: #666;">Code: ${indicator.code}</span><br/>
              <span style="color: #666;">Type: ${indicator.type}</span><br/>
              <hr style="margin: 8px 0;"/>
              Baseline: ${indicator.base_line} ${indicator.target_unit}<br/>
              Current: ${indicator.total_contributions} ${indicator.target_unit}<br/>
              Target: ${indicator.target_value} ${indicator.target_unit}<br/>
              <strong>Progress: ${progress}%</strong>
            </div>
          `;
        }
      },
      legend: {
        data: ['Baseline', 'Current Value', 'Target Value'],
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: indicatorNames,
        axisLabel: {
          rotate: 45,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        name: 'Values',
        nameLocation: 'middle',
        nameGap: 50
      },
      series: [
        {
          name: 'Baseline',
          type: 'bar',
          data: baselineValues,
          itemStyle: {
            color: '#94a3b8'
          },
          barWidth: '20%'
        },
        {
          name: 'Current Value',
          type: 'bar',
          data: currentValues,
          itemStyle: {
            color: (params: any) => {
              const progress = progressData[params.dataIndex];
              if (progress >= 100) return '#22c55e'; // Green for completed
              if (progress >= 75) return '#3b82f6'; // Blue for good progress
              if (progress >= 50) return '#6366f1'; // Indigo for moderate progress
              return '#3b82f6'; // Blue for low progress (changed from red)
            }
          },
          barWidth: '20%'
        },
        {
          name: 'Target Value',
          type: 'bar',
          data: targetValues,
          itemStyle: {
            color: '#1f2937',
            opacity: 0.3
          },
          barWidth: '20%'
        }
      ]
    };

    this.chart.setOption(option);
  }

  onViewChart() {
    this.viewChart.emit();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }
}
