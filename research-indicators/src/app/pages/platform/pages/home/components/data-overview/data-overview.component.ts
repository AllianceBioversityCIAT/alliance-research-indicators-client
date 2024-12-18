/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { ChartModule } from 'primeng/chart';

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

  indicatorList: WritableSignal<Indicator[]> = signal([]);

  ngOnInit() {
    this.getData();
    this.getIndicatorData();
  }

  async getIndicatorData() {
    await this.api.GET_IndicatorsResultsAmount();
  }

  chartData(data: any) {
    const labels = data.map((item: any) => item?.name);
    const amounts = data.map((item: any) => item?.amount_results);
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    this.data = {
      labels,
      datasets: [
        {
          data: amounts,
          backgroundColor: ['#173F6F', '#1689CA', '#7CB580'],
          hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400'), documentStyle.getPropertyValue('--yellow-400'), documentStyle.getPropertyValue('--green-400')]
        }
      ]
    };
    this.options = {
      cutout: '60%',
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    };
  }

  async getData() {
    const response = await this.api.GET_ResultsStatus();
    this.chartData(response.data);
  }
}
