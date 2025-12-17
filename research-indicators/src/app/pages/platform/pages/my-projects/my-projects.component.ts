import { Component, computed, inject, signal, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { FormsModule } from '@angular/forms';
import { CustomProgressBarComponent } from '@shared/components/custom-progress-bar/custom-progress-bar.component';
import { MyProjectsService } from '@shared/services/my-projects.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DatePipe } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PopoverModule } from 'primeng/popover';
import { MenuModule } from 'primeng/menu';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { CustomTagComponent } from '../../../../shared/components/custom-tag/custom-tag.component';
import { Result } from '@shared/interfaces/result/result.interface';
import { MultiselectComponent } from '../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { SectionSidebarComponent } from '../../../../shared/components/section-sidebar/section-sidebar.component';
import { CalendarInputComponent } from '../../../../shared/components/custom-fields/calendar-input/calendar-input.component';
import { FindContracts } from '@shared/interfaces/find-contracts.interface';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { ActionsService } from '@shared/services/actions.service';
import { RippleModule } from 'primeng/ripple';
import { ProjectItemComponent } from '../../../../shared/components/project-item/project-item.component';
import { FiltersActionButtonsComponent } from '@shared/components/filters-action-buttons/filters-action-buttons.component';
import { SearchExportControlsComponent } from '@shared/components/search-export-controls/search-export-controls.component';
import { ProjectUtilsService } from '@shared/services/project-utils.service';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';

@Component({
  selector: 'app-my-projects',
  imports: [
    S3ImageUrlPipe,
    DatePipe,
    FormsModule,
    CustomProgressBarComponent,
    PaginatorModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    TagModule,
    RippleModule,
    PopoverModule,
    MenuModule,
    RouterLink,
    CustomTagComponent,
    MultiselectComponent,
    SectionSidebarComponent,
    CalendarInputComponent,
    OverlayBadgeModule,
    ProjectItemComponent,
    FiltersActionButtonsComponent,
    SearchExportControlsComponent
  ],
  templateUrl: './my-projects.component.html',
  styleUrl: './my-projects.component.scss'
})
export default class MyProjectsComponent implements OnInit, AfterViewInit {
  api = inject(ApiService);
  myProjectsService = inject(MyProjectsService);
  cache = inject(CacheService);
  private readonly router = inject(Router);
  actions = inject(ActionsService);
  projectUtils = inject(ProjectUtilsService);

  first = signal(0);
  rows = signal(10);
  allProjectsFirst = signal(0);
  allProjectsRows = signal(10);
  myProjectsFirst = signal(0);
  myProjectsRows = signal(10);
  private readonly _searchValue = signal('');
  isTableView = signal(true);
  sortField = signal<string>('start_date');
  sortOrder = signal<number>(-1);

  pinnedTab = signal<string>('all');
  selectedTab = signal<string>('all');
  loadingPin = signal(false);
  tableId = 'contract-table';
  applyFiltersLabel = 'Apply Filters';

  @ViewChild('statusSelect') statusSelect?: MultiselectComponent;
  @ViewChild('leverSelect') leverSelect?: MultiselectComponent;

  myProjectsFilterItems: MenuItem[] = [
    {
      id: 'all',
      label: 'All Projects'
    },
    {
      id: 'my',
      label: 'My Projects'
    }
  ];
  myProjectsFilterItem = signal<MenuItem | undefined>(this.myProjectsFilterItems[0]);

  //pinned tab filter items
  orderedFilterItems = computed(() => {
    const pinnedTab = this.pinnedTab();
    if (pinnedTab === 'my') {
      return [
        {
          id: 'my',
          label: 'My Projects',
          tooltip:
            'Projects will appear here when you are assigned as the Principal Investigator of the project contract in Agresso, or if you have contributed at least one result to the project.'
        },
        {
          id: 'all',
          label: 'All Projects'
        }
      ];
    } else {
      return [
        {
          id: 'all',
          label: 'All Projects'
        },
        {
          id: 'my',
          label: 'My Projects',
          tooltip:
            'Projects will appear here when you are assigned as the Principal Investigator of the project contract in Agresso, or if you have contributed at least one result to the project.'
        }
      ];
    }
  });

  get searchValue(): string {
    return this._searchValue();
  }

  set searchValue(value: string) {
    this._searchValue.set(value);
  }

  filteredProjects = computed(() => {
    const projects = this.myProjectsService.list();
    const searchTerm =
      this.myProjectsFilterItem()?.id === 'my' ? this._searchValue().toLowerCase() : this.myProjectsService.searchInput().toLowerCase();

    if (!searchTerm) return projects;

    return projects.filter(project => {
      const fullName = project.full_name?.toLowerCase() || '';
      const agreementId = project.agreement_id?.toLowerCase() || '';
      const description = project.description?.toLowerCase() || '';
      const projectDescription = project.projectDescription?.toLowerCase() || '';
      const principalInvestigator = project.principal_investigator?.toLowerCase() || '';

      return (
        fullName.includes(searchTerm) ||
        agreementId.includes(searchTerm) ||
        description.includes(searchTerm) ||
        projectDescription.includes(searchTerm) ||
        principalInvestigator.includes(searchTerm)
      );
    });
  });

  onPageChange(event: PaginatorState) {
    if (this.myProjectsFilterItem()?.id === 'my') {
      this.myProjectsFirst.set(event.first ?? 0);
      this.myProjectsRows.set(event.rows ?? 10);
      this.loadMyProjectsWithPagination();
    } else {
      this.allProjectsFirst.set(event.first ?? 0);
      this.allProjectsRows.set(event.rows ?? 10);
      this.loadAllProjectsWithPagination();
    }
  }

  onAllProjectsPageChange(event: PaginatorState) {
    this.allProjectsFirst.set(event.first ?? 0);
    this.allProjectsRows.set(event.rows ?? 10);
    this.loadAllProjectsWithPagination();
  }

  ngOnInit(): void {
    this.myProjectsService.resetState();
    this.loadPinnedTab();
  }

  ngAfterViewInit() {
    if (this.statusSelect && this.leverSelect) {
      this.myProjectsService.multiselectRefs.set({
        status: this.statusSelect,
        lever: this.leverSelect
      });

      setTimeout(() => {
        this.myProjectsService.cleanMultiselects();
      }, 100);
    }
  }

  async loadPinnedTab() {
    this.loadingPin.set(true);
    const response = await this.api.GET_Configuration(this.tableId, 'tab');
    if (response?.data) {
      const pinValue = response.data as unknown as { all: string; self: string };

      const allPinned = pinValue.all === '1';
      const selfPinned = pinValue.self === '1';

      if (allPinned) {
        this.pinnedTab.set('all');
        this.myProjectsFilterItem.set(this.myProjectsFilterItems[0]);
        this.myProjectsService.myProjectsFilterItem.set(this.myProjectsFilterItems[0]);
        this.selectedTab.set('all');
        this.loadAllProjects();
      } else if (selfPinned) {
        this.pinnedTab.set('my');
        this.myProjectsFilterItem.set(this.myProjectsFilterItems[1]);
        this.myProjectsService.myProjectsFilterItem.set(this.myProjectsFilterItems[1]);
        this.selectedTab.set('my');
        this.loadMyProjects();
      } else {
        this.selectedTab.set('all');
        this.loadAllProjects();
      }
    } else {
      this.pinnedTab.set('all');
      this.myProjectsFilterItem.set(this.myProjectsFilterItems[0]);
      this.myProjectsService.myProjectsFilterItem.set(this.myProjectsFilterItems[0]);
      this.selectedTab.set('all');
      this.loadAllProjects();
    }
    this.loadingPin.set(false);
  }

  async togglePin(tabId: string) {
    try {
      this.loadingPin.set(true);
      const newPinnedTab = this.pinnedTab() === tabId ? 'all' : tabId;
      const pinValue = newPinnedTab === 'all' ? { all: true, self: false } : { all: false, self: true };

      await this.api.PATCH_Configuration(this.tableId, 'tab', pinValue);
      this.pinnedTab.set(newPinnedTab);

      if (newPinnedTab === 'all') {
        this.myProjectsFilterItem.set(this.myProjectsFilterItems[0]);
        this.myProjectsService.myProjectsFilterItem.set(this.myProjectsFilterItems[0]);
      } else {
        this.myProjectsFilterItem.set(this.myProjectsFilterItems[1]);
        this.myProjectsService.myProjectsFilterItem.set(this.myProjectsFilterItems[1]);
      }

      setTimeout(() => {
        this.myProjectsService.cleanMultiselects();
      }, 0);
    } catch (error) {
      console.error('Error updating pinned tab:', error);
    } finally {
      this.actions.showToast({
        severity: 'success',
        summary: 'Projects',
        detail: `${tabId === 'all' ? 'All Projects' : 'My Projects'} tab pinned successfully`
      });
      this.loadingPin.set(false);
      this.loadPinnedTab();
    }
  }

  isPinned(tabId: string): boolean {
    return this.pinnedTab() === tabId;
  }

  onActiveItemChange = (event: MenuItem): void => {
    this.myProjectsFilterItem.set(event);
    this.myProjectsService.myProjectsFilterItem.set(event);

    this.myProjectsService.clearFilters();
    this._searchValue.set('');

    if (event.id === 'my') {
      this.myProjectsFirst.set(0);
      this.selectedTab.set('my');
      this.loadMyProjects();
    } else {
      this.allProjectsFirst.set(0);
      this.selectedTab.set('all');
      this.loadAllProjects();
    }
  };

  loadMyProjects() {
    const params: Record<string, unknown> = { 'current-user': true, page: 1, limit: this.myProjectsRows() };
    const tableField = this.sortField();
    const sortOrder = this.sortOrder();
    if (tableField) {
      const apiField = this.mapTableFieldToApiField(tableField);
      params['order-field'] = apiField;
      params['direction'] = sortOrder === 1 ? 'ASC' : 'DESC';
    }
    this.myProjectsService.main(params);
  }

  loadAllProjects() {
    const params: Record<string, unknown> = { 'current-user': false, page: 1, limit: this.allProjectsRows() };
    const tableField = this.sortField();
    const sortOrder = this.sortOrder();
    if (tableField) {
      const apiField = this.mapTableFieldToApiField(tableField);
      params['order-field'] = apiField;
      params['direction'] = sortOrder === 1 ? 'ASC' : 'DESC';
    }
    this.myProjectsService.main(params);
  }

  onPinIconClick(tabId: string, event: Event) {
    event.stopPropagation();
    this.togglePin(tabId);
  }

  setSearchInputFilter(query: string) {
    if (this.myProjectsFilterItem()?.id === 'my') {
      this._searchValue.set(query);
      this.myProjectsFirst.set(0);
      this.loadMyProjectsWithPagination(query);
    } else {
      this.myProjectsService.searchInput.set(query);
      this.allProjectsFirst.set(0);
      this.loadAllProjectsWithPagination(query);
    }
  }

  showFiltersSidebar() {
    this.myProjectsService.showFilterSidebar();
  }

  handleClearFilters() {
    this._searchValue.set('');
    this.myProjectsService.searchInput.set('');
    this.myProjectsService.resetFilters();
    // Reload with current pagination after clearing
    if (this.myProjectsFilterItem()?.id === 'my') {
      this.myProjectsFirst.set(0);
      this.loadMyProjectsWithPagination();
    } else {
      this.allProjectsFirst.set(0);
      this.loadAllProjectsWithPagination();
    }
  }

  showConfigurationsSidebar() {
    // Implementation for configurations sidebar
  }

  toggleTableView() {
    this.isTableView.set(true);
  }

  toggleCardView() {
    this.isTableView.set(false);
  }

  openProject(project: FindContracts) {
    if (project.agreement_id) {
      this.router.navigate(['/project-detail', project.agreement_id]);
    }
  }

  getStatusColor(result: Result): string {
    const status = result.result_status?.name?.toLowerCase();
    switch (status) {
      case 'submitted':
        return '#1689CA';
      case 'accepted':
        return '#7CB580';
      case 'editing':
        return '#F58220';
      default:
        return '#8D9299';
    }
  }

  openResult(result: Result) {
    const resultCode = `${result.platform_code}-${result.result_official_code}`;
    this.router.navigate(['/result', resultCode]);
  }

  openResultByYear(result: Result, year: string | number) {
    const resultCode = `${result.platform_code}-${result.result_official_code}`;
    this.router.navigate(['/result', resultCode, year]);
  }

  getScrollHeight() {
    return this.cache.hasSmallScreen() ? 'calc(100vh - 410px)' : 'calc(100vh - 440px)';
  }

  getLoadingState(): boolean {
    return this.myProjectsService.loading();
  }

  getCurrentProjects(): FindContracts[] {
    return this.filteredProjects();
  }

  getCurrentFirst(): number {
    return this.myProjectsFilterItem()?.id === 'my' ? this.myProjectsFirst() : this.allProjectsFirst();
  }

  getCurrentRows(): number {
    return this.myProjectsFilterItem()?.id === 'my' ? this.myProjectsRows() : this.allProjectsRows();
  }

  onCurrentPageChange(event: PaginatorState): void {
    this.onPageChange(event);
  }

  private mapTableFieldToApiField(tableField: string): string {
    const fieldMapping: Record<string, string> = {
      'agreement_id': 'contract-code',
      'description': 'project-name',
      'contract_status': 'status',
      'display_principal_investigator': 'principal-investigator',
      'display_lever_name': 'lever',
      'lead_center': 'lead-center',
      'start_date': 'start-date',
      'end_date': 'end-date'
    };
    return fieldMapping[tableField] || tableField;
  }

  onSort(event: { field: string; order: number }): void {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order);
    
    if (this.myProjectsFilterItem()?.id === 'my') {
      this.myProjectsFirst.set(0);
      this.loadMyProjectsWithPagination();
    } else {
      this.allProjectsFirst.set(0);
      this.loadAllProjectsWithPagination();
    }
  }

  applyFilters(): void {
    const page = this.getCurrentPage();
    const limit = this.getCurrentLimit();
    const tableField = this.sortField();
    const sortOrder = this.sortOrder();
    const apiField = tableField ? this.mapTableFieldToApiField(tableField) : undefined;
    this.myProjectsService.applyFilters({ page, limit, sortField: apiField, sortOrder });
  }

  private getCurrentPage(): number {
    const first = this.myProjectsFilterItem()?.id === 'my' ? this.myProjectsFirst() : this.allProjectsFirst();
    const rows = this.myProjectsFilterItem()?.id === 'my' ? this.myProjectsRows() : this.allProjectsRows();
    return Math.floor((first ?? 0) / (rows || 1)) + 1;
  }

  private getCurrentLimit(): number {
    return this.myProjectsFilterItem()?.id === 'my' ? this.myProjectsRows() : this.allProjectsRows();
  }

  private loadMyProjectsWithPagination(query?: string) {
    const page = Math.floor((this.myProjectsFirst() ?? 0) / (this.myProjectsRows() || 1)) + 1;
    const params: Record<string, unknown> = { 'current-user': true, page, limit: this.myProjectsRows() };
    if (query) {
      params['query'] = query;
    }
    const tableField = this.sortField();
    const sortOrder = this.sortOrder();
    if (tableField) {
      const apiField = this.mapTableFieldToApiField(tableField);
      params['order-field'] = apiField;
      params['direction'] = sortOrder === 1 ? 'ASC' : 'DESC';
    }
    this.myProjectsService.main(params);
  }

  private loadAllProjectsWithPagination(query?: string) {
    const page = Math.floor((this.allProjectsFirst() ?? 0) / (this.allProjectsRows() || 1)) + 1;
    const params: Record<string, unknown> = { 'current-user': false, page, limit: this.allProjectsRows() };
    if (query) {
      params['query'] = query;
    }
    const tableField = this.sortField();
    const sortOrder = this.sortOrder();
    if (tableField) {
      const apiField = this.mapTableFieldToApiField(tableField);
      params['order-field'] = apiField;
      params['direction'] = sortOrder === 1 ? 'ASC' : 'DESC';
    }
    this.myProjectsService.main(params);
  }
}
