import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { ProjectItemComponent } from '../../../../shared/components/project-item/project-item.component';
import { ApiService } from '@shared/services/api.service';
import { GetProjectDetail } from '@shared/interfaces/get-project-detail.interface';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [ProjectItemComponent],
  templateUrl: './my-projects.component.html',
  styleUrl: './my-projects.component.scss'
})
export default class MyProjectsComponent {
  api = inject(ApiService);
  @Input() isHeader = false;
  @Input() projectId = '';
  @Input() projectName = '';
  @Input() projectTitle = '';
  @Input() projectData = '';
  @Input() indicatorNumber = '';
  @Input() indicatorType = '';

  projectList: WritableSignal<GetProjectDetail[]> = signal([]);

  constructor() {
    this.getData();
  }

  async getData() {
    const response = await this.api.GET_ContractsByUser();
    this.projectList.set(response.data);
  }
}
