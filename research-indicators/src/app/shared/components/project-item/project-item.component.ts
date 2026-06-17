import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetContractsByUser } from '@shared/interfaces/get-contracts-by-user.interface';
import { GetProjectDetail } from '@shared/interfaces/get-project-detail.interface';
import { FindContracts } from '@shared/interfaces/find-contracts.interface';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';
import { ProjectUtilsService } from '@shared/services/project-utils.service';
import { ProjectGeneralInfoComponent } from '@shared/components/project-general-info/project-general-info.component';
import { ProjectIndicatorFiltersComponent } from '@shared/components/project-indicator-filters/project-indicator-filters.component';

@Component({
  selector: 'app-project-item',
  imports: [RouterLink, CustomTagComponent, ProjectGeneralInfoComponent, ProjectIndicatorFiltersComponent],
  templateUrl: './project-item.component.html'
})
export class ProjectItemComponent {
  @Input() isHeader = false;
  @Input() project: GetContractsByUser | GetProjectDetail | FindContracts = {};
  @Input() showGeneralInfo = true;
  @Input() showIndicators = true;
  @Input() detailLink: string[] | null = null;

  private readonly projectUtils = inject(ProjectUtilsService);

  getStatusDisplay() {
    return this.projectUtils.getStatusDisplay(this.project);
  }

  projectTitle(): string {
    const prefix = this.project.projectDescription ? `${this.project.projectDescription} - ` : '';
    return `${prefix}${this.project.description ?? ''}`.trim();
  }
}
