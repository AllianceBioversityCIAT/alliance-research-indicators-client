/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { ChartModule } from 'primeng/chart';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { STATUS_COLOR_MAP } from '@shared/constants/status-colors';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';

interface Indicator {
  indicator_id: number;
  name: string;
  indicator_type_id: number;
  description: string;
  long_description: string;
  icon_src: string;
  other_names: null;
  amount_results: number;
}

interface ChartLegendItem {
  color: string;
  label: string;
  value: number;
}

Chart.register(ChartDataLabels);
Chart.defaults.set('plugins.datalabels', {
  color: '#ffffff',
  font: {
    size: 15
  }
});

@Component({
  selector: 'app-data-overview',
  imports: [ChartModule, S3ImageUrlPipe],
  templateUrl: './data-overview.component.html',
  styleUrl: './data-overview.component.scss'
})
export class DataOverviewComponent implements OnInit {
  api = inject(ApiService);
  results = true;
  data: any;
  options: any;
  chartLegend = signal<ChartLegendItem[]>([]);
  showChart = signal(false);
  showIndicatorList = signal(false);
  indicatorList: WritableSignal<Indicator[]> = signal([]);

  ngOnInit() {
    this.getData();
    this.getIndicatorData();
  }

  async getIndicatorData() {
    const response = await this.api.GET_IndicatorsResultsAmount();
    // Check if any item has amount_results greater than 0
    const hasResults = response.data.some((item: any) => item.amount_results > 0);
    this.showIndicatorList.set(hasResults);
    this.indicatorList.set(response.data);
  }

  chartData(data: any) {
    const filteredData = data.filter((item: any) => item.amount_results > 0);
  
    const labels = filteredData.map((item: any) => item.name);
    const amounts = filteredData.map((item: any) => item.amount_results);
    const backgroundColors = filteredData.map((item: any) => {
    const statusKey = String(item.result_status_id);
    return STATUS_COLOR_MAP[statusKey]?.text || STATUS_COLOR_MAP[''].border;
    });
    
    this.chartLegend.set(
      filteredData.map((item: any, index: number) => ({
        color: backgroundColors[index],
        label: item.name,
        value: item.amount_results
      }))
    );
  
    this.data = {
      labels,
      datasets: [
        {
          data: amounts,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: backgroundColors
        }
      ]
    };
  
    this.options = {
      cutout: '40%',
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      plugins: {
        legend: { display: false },
        datalabels: { display: false }
      }
    };
  }
  

  async getData() {
    const response = await this.api.GET_ResultsStatus();
    // Check if any item has amount_results greater than 0
    const hasResults = response.data.some((item: any) => item.amount_results > 0);
    this.showChart.set(hasResults);
    this.chartData(response.data);
  }
}
