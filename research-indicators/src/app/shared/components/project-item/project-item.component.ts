import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Indicator {
  icon: string;
  number: string;
  type: string;
  class: string;
}

interface Project {
  projectId?: string;
  projectName?: string;
  principalInvestigator?: string;
  startDate?: string;
  endDate?: string;
  indicatorList?: Indicator[];
}

@Component({
  selector: 'app-project-item',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.scss'
})
export class ProjectItemComponent {
  @Input() isHeader = false;
  @Input() project: Project = {};
}
