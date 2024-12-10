import { Component } from '@angular/core';

interface Indicator {
  icon: string;
  number: number;
  name: string;
  type: string;
}

@Component({
  selector: 'app-data-overview',
  standalone: true,
  imports: [],
  templateUrl: './data-overview.component.html',
  styleUrl: './data-overview.component.scss'
})
export class DataOverviewComponent {
  results = true;

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
}
