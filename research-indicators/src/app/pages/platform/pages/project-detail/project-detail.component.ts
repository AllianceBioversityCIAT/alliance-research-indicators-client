import { Component } from '@angular/core';
import MyProjectsComponent from '../my-projects/my-projects.component';
import { ProjectResultsTableComponent } from '@shared/components/project-results-table/project-results-table.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [ProjectResultsTableComponent, MyProjectsComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export default class ProjectDetailComponent {}
