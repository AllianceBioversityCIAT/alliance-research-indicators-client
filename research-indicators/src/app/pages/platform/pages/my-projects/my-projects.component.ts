import { Component, computed, inject, signal, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { FormsModule } from '@angular/forms';
import { CustomProgressBarComponent } from '@shared/components/custom-progress-bar/custom-progress-bar.component';
import { MyProjectsService } from '@shared/services/my-projects.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SlicePipe, DatePipe } from '@angular/common';
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
    SlicePipe,
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
    return this.myProjectsService.list();
  });

  onPageChange(event: PaginatorState) {
    const rows = event.rows ?? 10;
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;

    if (this.myProjectsFilterItem()?.id === 'my') {
      this.myProjectsFirst.set(first);
      this.myProjectsRows.set(rows);
      this.myProjectsService.setLimit(rows);
      this.myProjectsService.setPage(page);
      this.loadMyProjects();
    } else {
      this.allProjectsFirst.set(first);
      this.allProjectsRows.set(rows);
      this.myProjectsService.setLimit(rows);
      this.myProjectsService.setPage(page);
      this.loadAllProjects();
    }
  }

  onAllProjectsPageChange(event: PaginatorState) {
    const rows = event.rows ?? this.myProjectsService.limit();
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;

    this.allProjectsFirst.set(first);
    this.allProjectsRows.set(rows);

    this.myProjectsService.setLimit(rows);
    this.myProjectsService.setPage(page);

    if (this.myProjectsFilterItem()?.id === 'my') {
      this.loadMyProjects();
    } else {
      this.loadAllProjects();
    }
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
    this.myProjectsService.searchInput.set('');

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
    const params: Record<string, unknown> = { 'current-user': true };
    const searchQuery = this.myProjectsService.searchInput();
    if (searchQuery) {
      params['query'] = searchQuery;
    }
    this.myProjectsService.main(params);
  }

  loadAllProjects() {
    const params: Record<string, unknown> = { 'current-user': false };
    const searchQuery = this.myProjectsService.searchInput();
    if (searchQuery) {
      params['query'] = searchQuery;
    }
    this.myProjectsService.main(params);
  }

  onPinIconClick(tabId: string, event: Event) {
    event.stopPropagation();
    this.togglePin(tabId);
  }

  setSearchInputFilter($event: Event) {
    const target = $event.target as HTMLInputElement;
    const value = target.value;

    if (this.myProjectsFilterItem()?.id === 'my') {
      this._searchValue.set(value);
      this.myProjectsService.searchInput.set(value);
      this.myProjectsService.setPage(1);
      this.loadMyProjects();
    } else {
      this.myProjectsService.searchInput.set(value);
      this.myProjectsService.setPage(1);
      this.loadAllProjects();
    }
  }

  showFiltersSidebar() {
    this.myProjectsService.showFilterSidebar();
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
    return this.myProjectsFilterItem()?.id === 'my' ? this.myProjectsFirst() : this.allProjectsRows();
  }

  getCurrentRows(): number {
    return this.myProjectsFilterItem()?.id === 'my' ? this.myProjectsRows() : this.allProjectsRows();
  }

  onCurrentPageChange(event: PaginatorState): void {
    this.onPageChange(event);
  }

  onRowsChange(event: PaginatorState): void {
    this.onPageChange(event);
  }
}
