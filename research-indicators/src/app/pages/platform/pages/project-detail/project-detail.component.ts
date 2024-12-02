import { Component, inject, OnInit, signal } from '@angular/core';
import { ProjectResultsTableComponent } from '@shared/components/project-results-table/project-results-table.component';
import { ProjectItemComponent } from '@shared/components/project-item/project-item.component';
import { ApiService } from '../../../../shared/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { GetProjectDetail, GetProjectDetailIndicator } from '../../../../shared/interfaces/get-project-detail.interface';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [ProjectResultsTableComponent, ProjectItemComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export default class ProjectDetailComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  api = inject(ApiService);
  contractId = signal('');
  currentProject = signal<GetProjectDetail>({});

  ngOnInit(): void {
    this.contractId.set(this.activatedRoute.snapshot.params['id']);
    this.getProjectDetail();
  }

  async getProjectDetail() {
    const response = await this.api.GET_ResultsCount(this.contractId());
    response?.data?.indicators?.map((indicator: GetProjectDetailIndicator) => {
      indicator.full_name = indicator.indicator.name;
    });
    this.currentProject.set(response.data);
  }
}
