import { Component } from '@angular/core';

interface Indicator {
  icon: string;
  name: string;
  type: string;
  subtitle: string;
  description: string;
}

@Component({
  selector: 'app-discover-hero',
  imports: [],
  templateUrl: './discover-hero.component.html',
  styleUrl: './discover-hero.component.scss'
})
export class DiscoverHeroComponent {
  indicators: Indicator[] = [
    {
      icon: 'pi-flag',
      name: 'Innovation Development',
      type: 'output-icon',
      subtitle: 'OUTPUT',
      description:
        'A new, improved, or adapted output such as technologies, products, services, policies, or organizational arrangements with potential.'
    },
    {
      icon: 'pi-sun',
      name: 'Innovation Use',
      type: 'outcome-icon',
      subtitle: 'OUTCOME',
      description:
        'A metric to evaluate how widely an innovation is used, identifying user types and conditions, on a scale from no use to common use.'
    },
    {
      icon: 'pi-users',
      name: 'Capacity Sharing',
      type: 'output-icon',
      subtitle: 'OUTPUT',
      description: 'Individuals trained or engaged by Alliance staff to foster changes in knowledge, attitudes, skills, and practices.'
    },
    {
      icon: 'pi-chart-pie',
      name: 'OICRs',
      type: 'outcome-icon',
      subtitle: 'OUTCOME',
      description: 'A report based on evidence that details outcomes or impacts from the work of CGIAR programs, initiatives, or centers.'
    },
    {
      icon: 'pi-lightbulb',
      name: 'Knowledge Product',
      type: 'output-icon',
      subtitle: 'OUTPUT',
      description:
        'As defined by the CGIAR Open and FAIR Data Assets Policy, focusing on data assets integral to the Initiative/Project’s Theory of Change.'
    },
    {
      icon: 'pi-folder-open',
      name: 'Policy Change',
      type: 'outcome-icon',
      subtitle: 'OUTCOME',
      description:
        'Modified policies, strategies, legal instruments, programs, budgets, or investments at various scales in design or implementation.'
    }
  ];
}
