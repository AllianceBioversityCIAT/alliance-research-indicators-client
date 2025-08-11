import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { GetContractsByUser } from '@shared/interfaces/get-contracts-by-user.interface';
import { GetProjectDetail } from '@shared/interfaces/get-project-detail.interface';
import { FindContracts } from '@shared/interfaces/find-contracts.interface';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';
import { ProjectUtilsService } from '@shared/services/project-utils.service';
import { ButtonModule } from 'primeng/button';
import { CacheService } from '../../services/cache/cache.service';
@Component({
  selector: 'app-project-item',
  imports: [RouterLink, DatePipe, ButtonModule, CustomTagComponent],
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.scss'
})
export class ProjectItemComponent implements OnInit {
  @Input() isHeader = false;
  @Input() project: GetContractsByUser | GetProjectDetail | FindContracts = {};
  cache = inject(CacheService);
  private projectUtils = inject(ProjectUtilsService);

  ngOnInit(): void {
    if (this.project.indicators && this.project.indicators.length > 0) {
      this.project.indicators = this.projectUtils.sortIndicators(this.project.indicators);
    }
  }

  getStatusDisplay() {
    return this.projectUtils.getStatusDisplay(this.project);
  }

  getLeverName(): string {
    return this.projectUtils.getLeverName(this.project);
  }

  hasField(fieldName: string): boolean {
    return this.projectUtils.hasField(this.project, fieldName);
  }
}
