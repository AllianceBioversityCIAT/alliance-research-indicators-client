import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { ButtonModule } from 'primeng/button';

interface Result {
  icon: string;
  indicator: string;
  title: string;
  description: string;
  code: string;
  keywords: string[];
}

@Component({
  selector: 'app-search-a-result',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './search-a-result.component.html',
  styleUrl: './search-a-result.component.scss'
})
export default class SearchAResultComponent {
  api = inject(ApiService);

  resultList: WritableSignal<Result[]> = signal([]);

  results = signal<Result[]>([
    {
      icon: 'flag',
      indicator: 'INNOVATION DEVELOPMENT',
      title: 'Combining approaches for systemic behaviour change in groundwater governance',
      description:
        'Over-extraction of groundwater is a prominent challenge in India, with profound implication for food security, livelihoods, and economic development. As groundwater is an mobile common pool resource, sustainable governance of groundwater is complex, multifaceted, requiring coordination among stakeholders at different scales.',
      code: 'A1555',
      keywords: ['Groundwater Governance', 'Systemic Change', 'Behavioral Approaches']
    },
    {
      icon: 'folder_open',
      indicator: 'POLICY CHANGE',
      title: 'Integrating Strategies for Transformative Change in Resource Management',
      description:
        'Groundwater overuse is a significant challenge in India, deeply affecting food security, livelihoods, and economic stability. As an "invisible" and shared resource, its sustainable management demands a comprehensive approach, addressing the diverse social, economic, and environmental factors.',
      code: 'A145',
      keywords: ['Integrated  Governance', 'Water Sustainability', 'Water Preservation']
    }
  ]);
}
