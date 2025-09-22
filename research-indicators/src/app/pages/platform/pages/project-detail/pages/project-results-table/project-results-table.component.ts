import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ResultTable } from '@shared/interfaces/result/result.interface';
import { Button } from 'primeng/button';
import { ApiService } from '@services/api.service';
import { FilterByTextWithAttrPipe } from '@pipes/filter-by-text-with-attr.pipe';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomTagComponent } from '@components/custom-tag/custom-tag.component';
import { CacheService } from '@services/cache/cache.service';
import { AllModalsService } from '@services/cache/all-modals.service';
import { CreateResultManagementService } from '@shared/components/all-modals/modals-content/create-result-modal/services/create-result-management.service';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';
import { CurrentResultService } from '@shared/services/cache/current-result.service';
import { ProjectResultsTableService } from './project-results-table.service';
@Component({
  selector: 'app-project-results-table',
  imports: [TableModule, InputTextModule, Button, FilterByTextWithAttrPipe, DatePipe, FormsModule, RouterLink, CustomTagComponent, S3ImageUrlPipe],
  templateUrl: './project-results-table.component.html',
  styleUrl: './project-results-table.component.scss'
})
export default class ProjectResultsTableComponent implements OnInit, OnDestroy {
  api = inject(ApiService);
  cacheService = inject(CacheService);
  allModalsService = inject(AllModalsService);
  contractId = this.cacheService.currentProjectId();
  createResultManagementService = inject(CreateResultManagementService);
  currentResultService = inject(CurrentResultService);
  loading = signal(true);
  projectResultsTableService = inject(ProjectResultsTableService);

  activityValues: number[] = [0, 100];

  getScrollHeight = computed(
    () =>
      `calc(100vh - ${this.cacheService.headerHeight() + this.cacheService.navbarHeight() + this.cacheService.tableFiltersSidebarHeight() + (this.cacheService.hasSmallScreen() ? 240 : 349)}px)`
  );

  columns: ResultTable[] = [
    { attr: 'result_official_code', header: 'Code' },
    { attr: 'title', header: 'Title' },
    { attr: 'indicatorName', header: 'Indicator' },
    { attr: 'statusName', header: 'Status' },
    { attr: 'report_year_id', header: 'Year' },
    { attr: 'creatorName', header: 'Creator' },
    { attr: 'created_at', header: 'Creation Date', pipe: true }
  ];

  ngOnInit() {
    this.projectResultsTableService.contractId = this.contractId;
    this.projectResultsTableService.getData();
  }

  clear(table: Table) {
    table.clear();
    this.cacheService.projectResultsSearchValue.set('');
  }

  openCreateResultForProject() {
    this.createResultManagementService.setContractId(this.contractId);
    this.createResultManagementService.setPresetFromProjectResultsTable(true);
    this.allModalsService.openModal('createResult');
  }

  ngOnDestroy() {
    this.createResultManagementService.setContractId(null);
    this.createResultManagementService.setPresetFromProjectResultsTable(false);
  }

  getSeverity(status: string) {
    switch (status) {
      case 'EDITING':
        return 'danger';

      case 'SUBMMITED':
        return 'negotiation';

      case 'ACCEPT':
        return 'success';

      case 'renewal':
    }
    return null;
  }
}
