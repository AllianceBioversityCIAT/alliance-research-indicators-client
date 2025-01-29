import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ProjectItemComponent } from '../../../../shared/components/project-item/project-item.component';
import { ApiService } from '@shared/services/api.service';
import { GetProjectDetail } from '@shared/interfaces/get-project-detail.interface';
import { FilterByTextWithAttrPipe } from '../../../../shared/pipes/filter-by-text-with-attr.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [ProjectItemComponent, FilterByTextWithAttrPipe, FormsModule],
  templateUrl: './my-projects.component.html',
  styleUrl: './my-projects.component.scss'
})
export default class MyProjectsComponent {
  api = inject(ApiService);
  searchValue = '';

  projectList: WritableSignal<GetProjectDetail[]> = signal([]);

  constructor() {
    this.getData();
  }

  async getData() {
    const response = await this.api.GET_ContractsByUser();
    response?.data?.map(
      (project: GetProjectDetail) =>
        (project.full_name = `${project.agreement_id} ${project.projectDescription} ${project.description} ${project.project_lead_description}`)
    );

    this.projectList.set(response.data);
  }
}
