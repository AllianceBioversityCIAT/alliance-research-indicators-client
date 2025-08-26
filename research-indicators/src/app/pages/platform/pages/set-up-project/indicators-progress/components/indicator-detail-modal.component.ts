import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, DatasetComponent } from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type { BarSeriesOption } from 'echarts/charts';
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
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

type ECOption = ComposeOption<
  BarSeriesOption | TitleComponentOption | TooltipComponentOption | GridComponentOption | LegendComponentOption | DatasetComponentOption
>;

@Component({
  selector: 'app-indicator-detail-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [visible]="visible"
      (onHide)="onClose()"
      [modal]="true"
      [closable]="true"
      [closeOnEscape]="true"
      [style]="{ width: '90vw', maxWidth: '1000px' }"
      [contentStyle]="{ padding: '0' }"
      styleClass="indicator-detail-modal">
      <ng-template pTemplate="header">
        <div class="flex items-center gap-3">
          <i class="pi pi-chart-bar text-blue-600 text-xl"></i>
          <div>
            <h3 class="text-lg font-bold text-gray-800 m-0">{{ indicator?.name }}</h3>
            <p class="text-sm text-gray-600 m-0">{{ indicator?.code }} - Detailed Breakdown</p>
          </div>
        </div>
      </ng-template>

      <div class="p-4">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-gray-600">{{ indicator?.base_line || 0 }}</div>
            <div class="text-sm text-gray-500">Baseline</div>
            <div class="text-xs text-gray-400">{{ indicator?.target_unit }}</div>
          </div>
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ indicator?.total_contributions || 0 }}</div>
            <div class="text-sm text-blue-500">Current Value</div>
            <div class="text-xs text-blue-400">{{ indicator?.target_unit }}</div>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ indicator?.target_value || 0 }}</div>
            <div class="text-sm text-green-500">Target</div>
            <div class="text-xs text-green-400">{{ indicator?.target_unit }}</div>
          </div>
          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-purple-600">{{ getProgressPercentage() }}%</div>
            <div class="text-sm text-purple-500">Progress</div>
            <div class="text-xs text-purple-400">vs Target</div>
          </div>
        </div>

        <!-- Chart Container -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-chart-line text-blue-600"></i>
            Contributions Breakdown
          </h4>
          <div #chartContainer class="chart-element" style="width: 100%; height: 400px;"></div>
        </div>

        <!-- Contributions List -->
        <div class="mt-6">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-list text-blue-600"></i>
            Individual Contributions ({{ indicator?.contributions?.length || 0 }})
          </h4>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            @for (contribution of indicator?.contributions; track contribution.result_id) {
              <div class="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                <div class="flex-1">
                  <div class="font-medium text-gray-800">{{ contribution.title }}</div>
                  <div class="text-sm text-gray-600">Code: {{ contribution.result_official_code }}</div>
                  @if (contribution.description) {
                    <div class="text-xs text-gray-500 mt-1">{{ contribution.description }}</div>
                  }
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-blue-600">{{ contribution.contribution_value }}</div>
                  <div class="text-xs text-gray-500">{{ indicator?.target_unit }}</div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button label="Close" icon="pi pi-times" (onClick)="onClose()" [text]="true" />
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .chart-element {
        min-height: 400px;
      }

      :host ::ng-deep .indicator-detail-modal .p-dialog-header {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-bottom: 1px solid #e2e8f0;
      }

      :host ::ng-deep .indicator-detail-modal .p-dialog-content {
        background: #f8fafc;
      }
    `
  ]
})
export class IndicatorDetailModalComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() visible = false;
  @Input() indicator: GetIndicatorsProgress | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  private chart: echarts.ECharts | null = null;

  ngOnInit() {
    // Initialize chart when modal becomes visible
    setTimeout(() => {
      if (this.visible && this.indicator) {
        this.initChart();
        this.updateChart();
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  ngOnChanges() {
    if (this.visible && this.indicator) {
      setTimeout(() => {
        if (!this.chart) {
          this.initChart();
        }
        this.updateChart();
      }, 100);
    }
  }

  onClose() {
    this.visibleChange.emit(false);
  }

  getProgressPercentage(): number {
    if (!this.indicator || !this.indicator.target_value) return 0;

    let progress = 0;
    if (this.indicator.base_line && this.indicator.base_line > 0) {
      const range = this.indicator.target_value - this.indicator.base_line;
      const current = this.indicator.total_contributions - this.indicator.base_line;
      progress = (current / range) * 100;
    } else {
      progress = (this.indicator.total_contributions / this.indicator.target_value) * 100;
    }

    return Math.max(0, Math.min(100, Math.round(progress)));
  }

  private initChart() {
    if (this.chartContainer?.nativeElement && !this.chart) {
      this.chart = echarts.init(this.chartContainer.nativeElement);
    }
  }

  private updateChart() {
    if (!this.chart || !this.indicator) return;

    const contributions = this.indicator.contributions || [];
    const contributionNames = contributions.map(c => c.result_official_code.toString());
    const contributionValues = contributions.map(c => c.contribution_value);

    // Add baseline and target as reference lines
    const baselineValue = this.indicator.base_line || 0;
    const targetValue = this.indicator.target_value || 0;

    const option: ECOption = {
      title: {
        text: 'Contributions by Result Code',
        subtext: `Target: ${targetValue} ${this.indicator.target_unit} | Baseline: ${baselineValue} ${this.indicator.target_unit}`,
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
          const contribution = contributions[dataIndex];

          return `
            <div style="padding: 8px;">
              <strong>${contribution.title}</strong><br/>
              <span style="color: #666;">Code: ${contribution.result_official_code}</span><br/>
              <span style="color: #666;">Value: ${contribution.contribution_value} ${this.indicator?.target_unit}</span><br/>
              ${contribution.description ? `<hr style="margin: 4px 0;"/><span style="color: #888; font-size: 12px;">${contribution.description}</span>` : ''}
            </div>
          `;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: contributionNames,
        axisLabel: {
          rotate: 45,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        name: this.indicator.target_unit,
        nameLocation: 'middle',
        nameGap: 50,
        // Add reference lines for baseline and target
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#e0e0e0'
          }
        }
      },
      series: [
        {
          name: 'Contributions',
          type: 'bar',
          data: contributionValues,
          itemStyle: {
            color: (params: any) => {
              const value = params.value;
              const progress = this.getProgressPercentage();
              if (progress >= 100) return '#22c55e'; // Green for completed
              if (progress >= 75) return '#3b82f6'; // Blue for good progress
              if (progress >= 50) return '#f59e0b'; // Orange for moderate progress
              return '#ef4444'; // Red for low progress
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          }
        }
      ],
      // Add reference lines
      graphic: [
        // Baseline line
        baselineValue > 0
          ? {
              type: 'line',
              shape: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0
              },
              style: {
                stroke: '#94a3b8',
                lineWidth: 2,
                lineDash: [5, 5]
              },
              z: 100
            }
          : {},
        // Target line
        targetValue > 0
          ? {
              type: 'line',
              shape: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0
              },
              style: {
                stroke: '#1f2937',
                lineWidth: 2,
                lineDash: [5, 5]
              },
              z: 100
            }
          : {}
      ].filter(g => Object.keys(g).length > 0)
    };

    this.chart.setOption(option);
  }
}
