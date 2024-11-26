import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectItemComponent } from '../../../../shared/components/project-item/project-item.component';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [RouterLink, ProjectItemComponent],
  templateUrl: './my-projects.component.html',
  styleUrl: './my-projects.component.scss'
})
export default class MyProjectsComponent {
  @Input() isHeader = false;

  projectList = [
    {
      projectId: 'A1032',
      projectName: 'EMBRAPA - Establishment of the international coconut gene bank for south america and the caribbean',
      principalInvestigator: 'NGO-EYOK, SUZANNE',
      startDate: '04/05/2024',
      endDate: '20/12/2024',
      indicatorList: [
        { icon: 'group', number: '123', type: 'Capacity Sharing', class: 'output-icon' },
        { icon: 'flag', number: '190', type: 'Innovation Development', class: 'output-icon' },
        { icon: 'lightbulb', number: '154', type: 'Knowledge Product', class: 'output-icon' },
        { icon: 'wb_sunny', number: '110', type: 'Innovation Use', class: 'outcome-icon' },
        { icon: 'pie_chart', number: '146', type: 'Research Output', class: 'outcome-icon' },
        { icon: 'folder_open', number: '146', type: 'Policy Change', class: 'outcome-icon' }
      ]
    }
  ];
}
