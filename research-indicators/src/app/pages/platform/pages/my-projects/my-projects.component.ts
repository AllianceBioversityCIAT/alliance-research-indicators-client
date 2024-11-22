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
  @Input() project_id = '';
  @Input() project_name = '';

  indicatorList = [
    { icon: 'group', number: '123', type: 'Capacity Sharing' },
    { icon: 'flag', number: '123', type: 'Innovation Development' },
    { icon: 'lightbulb', number: '123', type: 'Knowledge Product' },
    { icon: 'wb_sunny', number: '123', type: 'Innovation Use' },
    { icon: 'pie_chart', number: '123', type: 'Research Output' },
    { icon: 'folder_open', number: '123', type: 'Policy Change' }
  ];
}
