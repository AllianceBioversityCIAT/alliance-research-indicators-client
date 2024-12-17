import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { ChartModule } from 'primeng/chart';

interface Indicator {
  icon: string;
  number: number;
  name: string;
  type: string;
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

  indicators: Indicator[] = [
    {
      icon: 'group',
      number: 128,
      name: 'CAPACITY SHARING FOR DEVELOPMENT',
      type: 'output-icon'
    },
    {
      icon: 'flag',
      number: 153,
      name: 'INNOVATION DEVELOPMENT',
      type: 'output-icon'
    },
    {
      icon: 'lightbulb',
      number: 155,
      name: 'Knowledge PRODUCT',
      type: 'output-icon'
    },
    {
      icon: 'sunny',
      number: 155,
      name: 'INNOVATION USE',
      type: 'outcome-icon'
    },
    {
      icon: 'pie_chart',
      number: 155,
      name: 'OICRS',
      type: 'outcome-icon'
    },
    {
      icon: 'folder_open',
      number: 155,
      name: 'POLICY CHANGE',
      type: 'outcome-icon'
    }
  ];

  ngOnInit() {
    this.getData();
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
          backgroundColor: [documentStyle.getPropertyValue('--blue-500'), documentStyle.getPropertyValue('--yellow-500'), documentStyle.getPropertyValue('--green-500')],
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
