import { Component, computed, inject, signal, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectItemComponent } from '../../../../shared/components/project-item/project-item.component';
import { ApiService } from '@shared/services/api.service';
import { FormsModule } from '@angular/forms';
import { CustomProgressBarComponent } from '@shared/components/custom-progress-bar/custom-progress-bar.component';
import { GetContractsByUserService } from '@shared/services/control-list/get-contracts-by-user.service';
import { MyProjectsService } from '@shared/services/my-projects.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SlicePipe, DatePipe } from '@angular/common';
import { TabMenu, TabMenuModule } from 'primeng/tabmenu';
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

@Component({
  selector: 'app-my-projects',
  imports: [
    ProjectItemComponent,
    SlicePipe,
    DatePipe,
    FormsModule,
    CustomProgressBarComponent,
    PaginatorModule,
    TabMenuModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    TagModule,
    PopoverModule,
    MenuModule,
    CustomTagComponent,
    MultiselectComponent,
    SectionSidebarComponent,
    CalendarInputComponent
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

  first = signal(0);
  rows = signal(5);
  allProjectsFirst = signal(0);
  allProjectsRows = signal(10);
  private readonly _searchValue = signal('');
  isTableView = signal(true);

  @ViewChild('tm') tm!: TabMenu;
  @ViewChild('statusSelect') statusSelect?: MultiselectComponent;
  @ViewChild('leverSelect') leverSelect?: MultiselectComponent;

  myProjectsFilterItems: MenuItem[] = [
    { id: 'all', label: 'All Projects' },
    { id: 'my', label: 'My Projects' }
  ];
  myProjectsFilterItem = signal<MenuItem | undefined>(this.myProjectsFilterItems[0]);

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
  }

  ngAfterViewInit() {
    this.myProjectsService.multiselectRefs.set({
      status: this.statusSelect!,
      lever: this.leverSelect!
    });
  }

  onActiveItemChange = (event: MenuItem): void => {
    this.myProjectsService.onActiveItemChange(event);
  };

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
    console.warn('Table view activated');
  }

  toggleCardView() {
    this.isTableView.set(false);
    console.warn('Card view activated');
  }

  openProject(project: unknown) {
    // TODO: Implement project navigation
    console.warn('Open project:', project);
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
    // TODO: Implement progress calculation based on form completion
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
