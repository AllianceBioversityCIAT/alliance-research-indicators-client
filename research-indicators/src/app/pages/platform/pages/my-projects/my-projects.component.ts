import { Component, inject, signal, WritableSignal } from '@angular/core';
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

  projectList: WritableSignal<GetProjectDetail[]> = signal([]);

  constructor() {
    this.getData();
  }

  async getData() {
    const response = await this.api.GET_ContractsByUser();
    this.projectList.set(response.data);
  }
}
