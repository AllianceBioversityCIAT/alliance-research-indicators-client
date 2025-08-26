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
  selector: 'app-main-chart-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [visible]="visible"
      (onHide)="onClose()"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '95vw', maxWidth: '1200px' }"
      [contentStyle]="{ padding: '0' }"
      styleClass="main-chart-modal">
      <ng-template pTemplate="header">
        <div class="flex items-center gap-3">
          <i class="pi pi-chart-bar text-blue-600 text-xl"></i>
          <div>
            <h3 class="text-lg font-bold text-gray-800 m-0">Indicators Progress Overview</h3>
            <p class="text-sm text-gray-600 m-0">Detailed view of all indicators progress</p>
          </div>
        </div>
      </ng-template>

      <div class="p-6">
        <!-- Chart Container -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div #chartContainer class="chart-element" style="width: 100%; height: 600px;"></div>
        </div>

        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ indicators.length }}</div>
            <div class="text-sm text-blue-500">Total Indicators</div>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ getCompletedCount() }}</div>
            <div class="text-sm text-green-500">Completed (≥100%)</div>
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
        min-height: 600px;
      }

      :host ::ng-deep .main-chart-modal .p-dialog-header {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-bottom: 1px solid #e2e8f0;
      }

      :host ::ng-deep .main-chart-modal .p-dialog-content {
        background: #f8fafc;
      }
    `
  ]
})
export class MainChartModalComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() visible = false;
  @Input() indicators: GetIndicatorsProgress[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();

  private chart: echarts.ECharts | null = null;

  ngOnInit() {
    setTimeout(() => {
      if (this.visible && this.indicators.length > 0) {
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
    if (this.visible && this.indicators.length > 0) {
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

  getCompletedCount(): number {
    return this.indicators.filter(ind => this.calculateProgress(ind) >= 100).length;
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

  private initChart() {
    if (this.chartContainer?.nativeElement && !this.chart) {
      this.chart = echarts.init(this.chartContainer.nativeElement);
    }
  }

  private updateChart() {
    if (!this.chart || !this.indicators.length) return;

    // Use codes for consistency with main chart
    const indicatorNames = this.indicators.map(ind => ind.code);
    const progressData = this.indicators.map(ind => this.calculateProgress(ind));
    const currentValues = this.indicators.map(ind => ind.total_contributions);
    const targetValues = this.indicators.map(ind => ind.target_value);
    const baselineValues = this.indicators.map(ind => ind.base_line || 0);

    const option: ECOption = {
      title: {
        text: 'Indicators Progress Dashboard - Detailed View',
        subtext: `Total Indicators: ${this.indicators.length}`,
        left: 'center',
        textStyle: {
          fontSize: 18,
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
          const indicator = this.indicators[dataIndex];
          const progress = this.calculateProgress(indicator);

          return `
            <div style="padding: 12px; max-width: 300px;">
              <strong style="font-size: 14px;">${indicator.name}</strong><br/>
              <span style="color: #666; font-size: 12px;">Code: ${indicator.code}</span><br/>
              <span style="color: #666; font-size: 12px;">Type: ${indicator.type}</span><br/>
              <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;"/>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                <div>Baseline: <strong>${indicator.base_line || 0}</strong></div>
                <div>Target: <strong>${indicator.target_value}</strong></div>
                <div>Current: <strong>${indicator.total_contributions}</strong></div>
                <div>Progress: <strong>${progress}%</strong></div>
              </div>
              <div style="margin-top: 8px; font-size: 12px;">
                Unit: <strong>${indicator.target_unit}</strong> |
                Contributions: <strong>${indicator.contributions?.length || 0}</strong>
              </div>
            </div>
          `;
        }
      },
      legend: {
        data: ['Baseline', 'Current Value', 'Target Value'],
        bottom: 10,
        textStyle: {
          fontSize: 12
        }
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
          fontSize: 11,
          interval: 0 // Show all labels
        }
      },
      yAxis: {
        type: 'value',
        name: 'Values',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          fontSize: 12
        }
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
}
