import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { GetContractsByUser, IndicatorElement } from '@shared/interfaces/get-contracts-by-user.interface';
import { GetProjectDetail, GetProjectDetailIndicator } from '@shared/interfaces/get-project-detail.interface';
import { FindContracts } from '@shared/interfaces/find-contracts.interface';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';
import { ProjectUtilsService } from '@shared/services/project-utils.service';
import { CacheService } from '../../services/cache/cache.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-project-item',
  imports: [RouterLink, DatePipe, CustomTagComponent, ButtonModule],
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.scss'
})
export class ProjectItemComponent implements OnInit {
  @Input() isHeader = false;
  @Input() hideSetup = false;
  @Input() project: GetContractsByUser | GetProjectDetail | FindContracts = {};
  cache = inject(CacheService);
  private projectUtils = inject(ProjectUtilsService);

  // Local property for processed indicators
  processedIndicators: (IndicatorElement | GetProjectDetailIndicator)[] = [];

  ngOnInit(): void {
    if (this.project.indicators && this.project.indicators.length > 0) {
      // Create a local copy of indicators and process them
      this.processedIndicators = this.projectUtils.sortIndicators([...this.project.indicators]);
    } else {
      this.processedIndicators = [];
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
