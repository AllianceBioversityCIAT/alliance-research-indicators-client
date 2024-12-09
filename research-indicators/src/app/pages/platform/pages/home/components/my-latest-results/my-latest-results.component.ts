import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

interface Result {
  icon: string;
  indicator: string;
  name: string;
  project: string;
  type: string;
}

@Component({
  selector: 'app-my-latest-results',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './my-latest-results.component.html',
  styleUrl: './my-latest-results.component.scss'
})
export class MyLatestResultsComponent {
  results: Result[] = [
    {
      icon: 'group',
      indicator: 'CAPACITY SHARING FOR DEVELOPMENT',
      name: 'Implementing precision agriculture techniques to optimize water',
      project: 'A1569 - Research for Low-Emission Food Systems',
      type: 'output-icon'
    },
    {
      icon: 'folder_open',
      indicator: 'POLICY CHANGE',
      name: 'THE IMPACT OF CLIMATE CHANGE ON MIGRATION PATTERNS',
      project: 'P100 - AMAZON BIODIVERSITY FUND BRAZIL FUNDO DE INV..',
      type: 'outcome-icon'
    },
    {
      icon: 'flag',
      indicator: 'INNOVATION DEVELOPMENT',
      name: 'Strategies for enhancing soil fertility and crop yield in lands',
      project: 'A1659 - FOOD SYSTEMS TRANSFORMATION TO ADAPT AND..',
      type: 'output-icon'
    }
  ];
}
