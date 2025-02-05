/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { ChartModule } from 'primeng/chart';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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
  standalone: true,
  imports: [ChartModule],
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
    // Filter out items with zero amount_results
    const filteredData = data.filter((item: any) => item.amount_results > 0);

    const labels = filteredData.map((item: any) => item?.name);
    const amounts = filteredData.map((item: any) => item?.amount_results);
    const colors = ['#173F6F', '#1689CA', '#7CB580'];

    // Update chart legend
    this.chartLegend.set(
      filteredData.map((item: any, index: number) => ({
        color: colors[index],
        label: item.name,
        value: item.amount_results
      }))
    );

    const documentStyle = getComputedStyle(document.documentElement);
    this.data = {
      labels,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors,
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--blue-400'),
            documentStyle.getPropertyValue('--yellow-400'),
            documentStyle.getPropertyValue('--green-400')
          ]
        }
      ]
    };
    this.options = {
      cutout: '60%',
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          formatter: (value: number) => {
            return value > 0 ? value : '';
          },
          color: '#ffffff',
          font: {
            size: 14,
            weight: 600
          }
        }
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
