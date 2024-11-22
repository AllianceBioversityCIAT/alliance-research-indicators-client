import { Component, Input } from '@angular/core';
import { ResultsTableComponent } from '@shared/components/results-table/results-table.component';
import MyProjectsComponent from '../my-projects/my-projects.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [ResultsTableComponent, MyProjectsComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export default class ProjectDetailComponent {
  @Input() isHeader = false;
  @Input() project_id = '';
  @Input() project_name = '';
}
