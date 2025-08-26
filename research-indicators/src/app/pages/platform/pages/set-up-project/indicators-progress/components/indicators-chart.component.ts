import { Component, OnInit, ElementRef, ViewChild, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
  template: `
    <div class="chart-container bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div class="mb-4">
        <h4 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i class="pi pi-chart-bar text-blue-600"></i>
          Indicators Progress Overview
        </h4>
        <p class="text-sm text-gray-600">Visual representation of indicators performance vs targets</p>
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
export class IndicatorsChartComponent implements OnInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() indicators = signal<GetIndicatorsProgress[]>([]);

  private chart: echarts.ECharts | null = null;

  // Dummy data for demonstration
  private dummyData: GetIndicatorsProgress[] = [
    {
      indicator_id: 1,
      code: 'IND-001',
      name: 'Climate Resilient Crops Adopted',
      description: 'Number of farmers adopting climate-resilient crop varieties',
      target_unit: 'farmers',
      number_type: 'sum',
      number_format: 'number',
      target_value: 1000,
      base_line: 100,
      year: [2024, 2025],
      type: 'outcome',
      contributions: [
        {
          result_id: 1,
          result_official_code: 101,
          title: 'Training Program A',
          description: 'Farmer training on drought-resistant varieties',
          contribution_value: 350
        },
        {
          result_id: 2,
          result_official_code: 102,
          title: 'Seed Distribution Initiative',
          description: 'Distribution of improved seed varieties',
          contribution_value: 280
        }
      ],
      total_contributions: 630
    },
    {
      indicator_id: 2,
      code: 'IND-002',
      name: 'Water Use Efficiency Improved',
      description: 'Percentage improvement in water use efficiency',
      target_unit: '%',
      number_type: 'average',
      number_format: 'percentage',
      target_value: 25,
      base_line: 5,
      year: [2024],
      type: 'output',
      contributions: [
        {
          result_id: 3,
          result_official_code: 201,
          title: 'Irrigation Technology',
          description: 'Implementation of drip irrigation systems',
          contribution_value: 18
        }
      ],
      total_contributions: 18
    },
    {
      indicator_id: 3,
      code: 'IND-003',
      name: 'Research Publications',
      description: 'Number of peer-reviewed publications on sustainable agriculture',
      target_unit: 'publications',
      number_type: 'count',
      number_format: 'number',
      target_value: 15,
      base_line: 2,
      year: [2024, 2025],
      type: 'output',
      contributions: [
        {
          result_id: 4,
          result_official_code: 301,
          title: 'Research Study 1',
          description: 'Impact of climate change on crop yields',
          contribution_value: 1
        },
        {
          result_id: 5,
          result_official_code: 302,
          title: 'Research Study 2',
          description: 'Sustainable farming practices evaluation',
          contribution_value: 1
        },
        {
          result_id: 6,
          result_official_code: 303,
          title: 'Research Study 3',
          description: 'Water management techniques',
          contribution_value: 1
        }
      ],
      total_contributions: 8
    },
    {
      indicator_id: 4,
      code: 'IND-004',
      name: 'Food Security Index',
      description: 'Improvement in regional food security index',
      target_unit: 'index points',
      number_type: 'average',
      number_format: 'decimal',
      target_value: 7.5,
      base_line: 4.2,
      year: [2024],
      type: 'impact',
      contributions: [
        {
          result_id: 7,
          result_official_code: 401,
          title: 'Community Program',
          description: 'Community-based food security initiatives',
          contribution_value: 6.1
        }
      ],
      total_contributions: 6.1
    }
  ];

  ngOnInit() {
    this.initChart();
    // Use dummy data if no real data is provided
    const dataToUse = this.indicators().length > 0 ? this.indicators() : this.dummyData;
    this.updateChart(dataToUse);
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
              if (progress >= 50) return '#f59e0b'; // Orange for moderate progress
              return '#ef4444'; // Red for low progress
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

  ngOnDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }
}
