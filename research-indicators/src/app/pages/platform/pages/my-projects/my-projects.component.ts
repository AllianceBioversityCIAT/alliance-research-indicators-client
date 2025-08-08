import { Component, computed, inject, signal, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectItemComponent } from '../../../../shared/components/project-item/project-item.component';
import { ApiService } from '@shared/services/api.service';
import { FormsModule } from '@angular/forms';
import { CustomProgressBarComponent } from '@shared/components/custom-progress-bar/custom-progress-bar.component';
import { GetContractsByUserService } from '@shared/services/control-list/get-contracts-by-user.service';
import { MyProjectsService } from '@shared/services/my-projects.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SlicePipe, DatePipe, NgTemplateOutlet } from '@angular/common';
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

@Component({
  selector: 'app-my-projects',
  imports: [
    ProjectItemComponent,
    SlicePipe,
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
    CustomTagComponent,
    MultiselectComponent,
    SectionSidebarComponent,
    CalendarInputComponent,
    OverlayBadgeModule,
    NgTemplateOutlet
  ],
  templateUrl: './my-projects.component.html',
  styleUrl: './my-projects.component.scss'
})
export default class MyProjectsComponent implements OnInit, AfterViewInit {
  api = inject(ApiService);
  getContractsByUserService = inject(GetContractsByUserService);
  myProjectsService = inject(MyProjectsService);
  cache = inject(CacheService);
  private router = inject(Router);
  actions = inject(ActionsService);

  first = signal(0);
  rows = signal(5);
  allProjectsFirst = signal(0);
  allProjectsRows = signal(10);
  private readonly _searchValue = signal('');
  isTableView = signal(true);

  // Pin functionality
  pinnedTab = signal<string>('all');
  loadingPin = signal(false);
  tableId = 'contract-table';

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
          label: 'My Projects'
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
          label: 'My Projects'
        }
      ];
    }
  });

  get searchValue(): string {
    return this._searchValue();
  }

  set searchValue(value: string) {
    this._searchValue.set(value);
    this.first.set(0);
  }

  filteredProjects = computed(() => {
    return this.getContractsByUserService.list().filter(project => project.full_name?.toLowerCase().includes(this._searchValue().toLowerCase()));
  });

  filteredAllProjects = computed(() => {
    return this.myProjectsService
      .list()
      .filter(
        project =>
          project.full_name?.toLowerCase().includes(this.myProjectsService.searchInput().toLowerCase()) ||
          project.agreement_id?.toLowerCase().includes(this.myProjectsService.searchInput().toLowerCase()) ||
          project.projectDescription?.toLowerCase().includes(this.myProjectsService.searchInput().toLowerCase()) ||
          project.description?.toLowerCase().includes(this.myProjectsService.searchInput().toLowerCase())
      );
  });

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 5);
  }

  onAllProjectsPageChange(event: PaginatorState) {
    this.allProjectsFirst.set(event.first ?? 0);
    this.allProjectsRows.set(event.rows ?? 10);
  }

  ngOnInit(): void {
    this.myProjectsService.clearAllFilters();
    this.loadPinnedTab();
  }

  ngAfterViewInit() {
    this.myProjectsService.multiselectRefs.set({
      status: this.statusSelect!,
      lever: this.leverSelect!
    });
  }

  // Pin functionality methods
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
      } else if (selfPinned) {
        this.pinnedTab.set('my');
        this.myProjectsFilterItem.set(this.myProjectsFilterItems[1]);
      }
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
    this.myProjectsService.onActiveItemChange(event);
  };

  onPinIconClick(tabId: string, event: Event) {
    event.stopPropagation();
    this.togglePin(tabId);
  }

  // Methods results table
  setSearchInputFilter($event: Event) {
    this.myProjectsService.searchInput.set(($event.target as HTMLInputElement).value);
  }

  showFiltersSidebar() {
    this.myProjectsService.showFiltersSidebar.set(true);
  }

  showConfigurationsSidebar() {
    this.myProjectsService.showFiltersSidebar.set(true);
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

  calculateProgressFor(): number {
    return 75;
  }

  openResult(result: Result) {
    this.router.navigate(['/result', result.result_official_code]);
  }

  openResultByYear(result_official_code: string, year: string | number) {
    this.router.navigate(['/result', result_official_code, year]);
  }

  getScrollHeight() {
    return `calc(100vh - ${this.cache.headerHeight() + this.cache.navbarHeight() + this.cache.tableFiltersSidebarHeight() + (this.cache.hasSmallScreen() ? 240 : 270)}px)`;
  }

  getLeverDisplay(project: FindContracts): string {
    if (project.lever_name) {
      return project.lever_name;
    }
    if (project.lever) {
      if (typeof project.lever === 'object') {
        return project.lever.short_name || project.lever.name || '-';
      }
      return project.lever;
    }
    return '-';
  }

  getApplyFiltersLabel(): string {
    const count = Number(this.myProjectsService.countFiltersSelected()) || 0;
    return count > 0 ? `Apply Filters (${count})` : 'Apply Filters';
  }

  getStatusDisplay(project: FindContracts | { status_id?: number; status_name?: string; contract_status?: string }): {
    statusId: number;
    statusName: string;
  } {
    if ('contract_status' in project && project.contract_status) {
      const statusName = project.contract_status.toLowerCase();

      const statusMap: Record<string, { id: number; name: string }> = {
        ongoing: { id: 1, name: 'Ongoing' },
        completed: { id: 2, name: 'Completed' },
        suspended: { id: 3, name: 'Suspended' },
        approved: { id: 6, name: 'Approved' }
      };

      const status = statusMap[statusName];
      if (status) {
        return {
          statusId: status.id,
          statusName: status.name
        };
      }
    }

    if (project.status_name) {
      const statusName = project.status_name.toLowerCase();

      const statusMap: Record<string, { id: number; name: string }> = {
        ongoing: { id: 1, name: 'Ongoing' },
        completed: { id: 2, name: 'Completed' },
        suspended: { id: 3, name: 'Suspended' },
        approved: { id: 6, name: 'Approved' }
      };

      const status = statusMap[statusName];
      if (status) {
        return {
          statusId: status.id,
          statusName: status.name
        };
      }
    }

    if (project.status_id) {
      const statusNameMap: Record<number, string> = {
        1: 'Ongoing',
        2: 'Completed',
        3: 'Suspended',
        6: 'Approved'
      };

      return {
        statusId: project.status_id,
        statusName: statusNameMap[project.status_id] || 'Unknown'
      };
    }
    return {
      statusId: 1,
      statusName: 'Ongoing'
    };
  }
}
