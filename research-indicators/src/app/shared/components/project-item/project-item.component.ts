import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-project-item',
  standalone: true,
  imports: [],
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.scss'
})
export class ProjectItemComponent {
  @Input() projectId = '';
  @Input() projectName = '';
  @Input() projectTitle = '';
  @Input() projectData = '';
  @Input() indicatorNumber = '';
  @Input() indicatorType = '';
  @Input() isHeader = false;
}
