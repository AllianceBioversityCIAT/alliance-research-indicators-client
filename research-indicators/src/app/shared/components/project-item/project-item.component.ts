import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, output, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GetContractsByUser, IndicatorElement } from '@shared/interfaces/get-contracts-by-user.interface';
import { GetProjectDetail, GetProjectDetailIndicator } from '@shared/interfaces/get-project-detail.interface';
import { FindContracts } from '@shared/interfaces/find-contracts.interface';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';
import { ProjectUtilsService } from '@shared/services/project-utils.service';
import { CacheService } from '../../services/cache/cache.service';
import { ButtonModule } from 'primeng/button';
import { ResultsCenterService } from '@pages/platform/pages/results-center/results-center.service';

@Component({
  selector: 'app-project-item',
  imports: [DatePipe, CustomTagComponent, ButtonModule],
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.scss'
})
export class ProjectItemComponent implements OnInit, OnChanges {
  @Input() isHeader = false;
  @Input() hideSetup = false;
  @Input() project: GetContractsByUser | GetProjectDetail | FindContracts = {};
  cache = inject(CacheService);
  private readonly projectUtils = inject(ProjectUtilsService);

  @Input() enableIndicatorFilter = false;

  indicatorClick = output<{ indicator_id: number; name: string }>();

  private readonly resultsCenterService = inject(ResultsCenterService, { optional: true });

  filteredIndicatorIds = computed(() => {
    if (!this.resultsCenterService || !this.enableIndicatorFilter) {
      return new Set<number>();
    }
    return new Set(
      this.resultsCenterService.tableFilters().indicators.map(ind => ind.indicator_id)
    );
  });

  // Local property for processed indicators
  processedIndicators: (IndicatorElement | GetProjectDetailIndicator)[] = [];

  ngOnInit(): void {
    this.processIndicators();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project'] && !changes['project'].firstChange) {
      this.processIndicators();
    }
  }

  private processIndicators(): void {
    if (this.project?.indicators && this.project.indicators.length > 0) {
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

  onIndicatorClick(indicator: IndicatorElement | GetProjectDetailIndicator, event: Event): void {
    if (this.enableIndicatorFilter) {
      event.preventDefault();
      event.stopPropagation();
      const indicatorId = indicator.indicator_id || indicator.indicator?.indicator_id;
      const indicatorName = indicator.indicator?.name || '';
      if (indicatorId) {
        this.indicatorClick.emit({ indicator_id: indicatorId, name: indicatorName });
      }
    }
  }

  isIndicatorFiltered(indicator: IndicatorElement | GetProjectDetailIndicator): boolean {
    if (!this.enableIndicatorFilter || !this.resultsCenterService) {
      return false;
    }
    const indicatorId = indicator.indicator_id || indicator.indicator?.indicator_id;
    return indicatorId ? this.filteredIndicatorIds().has(indicatorId) : false;
  }
}
