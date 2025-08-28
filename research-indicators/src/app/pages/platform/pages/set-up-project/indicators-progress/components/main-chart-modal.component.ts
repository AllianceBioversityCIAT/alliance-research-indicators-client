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
      [(visible)]="visible"
      (onHide)="onClose()"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '95vw', maxWidth: '1200px' }"
      [contentStyle]="{ padding: '0' }"
      styleClass="main-chart-modal">
      <ng-template pTemplate="header">
        <div class="flex items-center gap-3">
          <i class="pi pi-chart-bar atc-primary-blue-500 text-xl"></i>
          <div>
            <h3 class="text-lg font-semibold atc-grey-800 m-0">Sum Indicators Progress</h3>
            <p class="text-sm atc-grey-600 m-0">Progress comparison of all sum indicators</p>
          </div>
        </div>
      </ng-template>

      <div class="p-4">
        <!-- Chart Container -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div #chartContainer class="chart-element" style="width: 100%; height: 400px;"></div>
        </div>

        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-w-md mx-auto">
          <div class="abc-primary-blue-100 rounded-lg p-4 text-center">
            <div class="text-2xl font-semibold atc-primary-blue-500">{{ indicators.length }}</div>
            <div class="text-sm atc-primary-blue-500 font-medium">Total Indicators</div>
          </div>
          <div class="abc-green-100 rounded-lg p-4 text-center">
            <div class="text-2xl font-semibold atc-green-600">{{ getCompletedCount() }}</div>
            <div class="text-sm atc-green-600 font-medium">Completed (100%)</div>
          </div>
        </div>

        <!-- Indicators List -->
        <div class="mt-6">
          <h4 class="text-lg font-semibold atc-grey-800 mb-4 flex items-center gap-2">
            <i class="pi pi-list atc-primary-blue-500"></i>
            Sum Indicators Progress ({{ getFilteredIndicators().length }})
          </h4>
          @if (getFilteredIndicators().length > 0) {
            <div class="space-y-3 max-h-80 overflow-y-auto">
              @for (indicator of getFilteredIndicators(); track indicator.code) {
                <div class="bg-white rounded-lg p-4 flex justify-between items-center shadow-sm">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="abc-primary-blue-500 atc-white-1 px-2 py-1 rounded text-xs font-mono font-medium">
                        {{ indicator.code }}
                      </span>
                      <span class="abc-grey-100 atc-grey-800 px-2 py-1 rounded text-xs font-medium capitalize">{{ indicator.number_type }}</span>
                    </div>
                    <div class="font-medium atc-grey-800">{{ indicator.name }}</div>
                    <div class="text-xs atc-grey-600 mt-1">{{ indicator.description }}</div>
                  </div>
                  <div class="text-right ml-4">
                    <div class="text-lg font-semibold" [ngClass]="indicator.percentageProgress >= 100 ? 'atc-green-600' : 'atc-orange-600'">
                      {{ indicator.total_contributions }}
                    </div>
                    <div class="text-xs atc-grey-500">{{ indicator.target_unit }}</div>
                    <div class="text-xs font-medium mt-1" [ngClass]="indicator.percentageProgress >= 100 ? 'atc-green-600' : 'atc-orange-600'">
                      {{ indicator.percentageProgress }}% Complete
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center py-8 abc-grey-100 rounded-lg">
              <i class="pi pi-chart-line text-3xl mb-3 block atc-grey-400"></i>
              <h4 class="text-base font-semibold atc-grey-700 mb-2">No Sum Indicators Found</h4>
              <p class="text-sm atc-grey-500">No sum indicators available to display.</p>
            </div>
          }
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

      :host ::ng-deep .main-chart-modal .p-dialog-header {
        background: var(--ac-grey-100);
        border-bottom: 1px solid var(--ac-grey-200);
        padding: 1.5rem;
      }

      :host ::ng-deep .main-chart-modal .p-dialog-content {
        background: var(--ac-grey-100);
      }

      :host ::ng-deep .main-chart-modal .p-dialog {
        border-radius: 12px;
        overflow: hidden;
        box-shadow:
          0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -2px rgba(0, 0, 0, 0.05);
        border: none;
      }

      :host ::ng-deep .main-chart-modal .p-dialog-header-close {
        color: var(--ac-grey-600);
      }

      :host ::ng-deep .main-chart-modal .p-dialog-header-close:hover {
        color: var(--ac-primary-blue-500);
        background: var(--ac-grey-200);
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
    return this.indicators.filter(ind => {
      return ind.percentageProgress >= 100 && ind.number_type !== 'average';
    }).length;
  }

  getFilteredIndicators(): GetIndicatorsProgress[] {
    return this.indicators.filter(indicator => {
      return indicator.number_type !== 'average';
    });
  }

  private initChart() {
    if (this.chartContainer?.nativeElement && !this.chart) {
      this.chart = echarts.init(this.chartContainer.nativeElement);
    }
  }

  private updateChart() {
    if (!this.chart || !this.indicators.length) return;

    // Filter indicators: exclude only average type
    const filteredIndicators = this.indicators.filter(indicator => {
      return indicator.number_type !== 'average';
    });

    if (filteredIndicators.length === 0) {
      // Show empty state message
      const option = {
        title: {
          text: 'No Sum Indicators Found',
          subtext: 'No sum indicators available to display',
          left: 'center',
          top: 'center',
          textStyle: { fontSize: 16, color: '#666' },
          subtextStyle: { fontSize: 12, color: '#999' }
        }
      };
      this.chart.setOption(option);
      return;
    }

    // Use codes for consistency with main chart
    const indicatorNames = filteredIndicators.map(ind => ind.code);
    const progressData = filteredIndicators.map(ind => ind.percentageProgress);

    const option: ECOption = {
      title: {
        text: 'Sum Indicators Progress Dashboard',
        subtext: `Showing ${filteredIndicators.length} sum indicators (${this.indicators.length} total)`,
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
        formatter: (params: unknown) => {
          const dataIndex = (params as { dataIndex: number }[])[0].dataIndex;
          const indicator = filteredIndicators[dataIndex];
          const progress = indicator.percentageProgress;

          const truncatedName = indicator.name.length > 50 ? indicator.name.substring(0, 50) + '...' : indicator.name;

          return `
            <div style="padding: 12px; max-width: 350px; word-wrap: break-word;">
              <strong style="font-size: 14px; line-height: 1.3; display: block; margin-bottom: 4px;">${truncatedName}</strong>
              <span style="color: #666; font-size: 12px;">Code: ${indicator.code}</span><br/>
              <span style="color: #666; font-size: 12px;">Type: ${indicator.number_type}</span><br/>
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
        name: 'Progress (%)',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          fontSize: 12
        },
        max: 100,
        min: 0
      },
      series: [
        {
          name: 'Progress',
          type: 'bar',
          data: progressData,
          itemStyle: {
            color: '#173f6f' // Primary blue 500 from design system
          },
          barWidth: '60%'
        }
      ]
    };

    this.chart.setOption(option);
  }
}
