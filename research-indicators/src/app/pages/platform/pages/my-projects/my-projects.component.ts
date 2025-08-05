import { Component, computed, inject, signal, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectItemComponent } from '../../../../shared/components/project-item/project-item.component';
import { ApiService } from '@shared/services/api.service';
import { FormsModule } from '@angular/forms';
import { CustomProgressBarComponent } from '@shared/components/custom-progress-bar/custom-progress-bar.component';
import { GetContractsByUserService } from '@shared/services/control-list/get-contracts-by-user.service';
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
import { ResultsCenterService } from '../results-center/results-center.service';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { CustomTagComponent } from '../../../../shared/components/custom-tag/custom-tag.component';
import { Result } from '@shared/interfaces/result/result.interface';
import { MultiselectComponent } from '../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { SectionSidebarComponent } from '../../../../shared/components/section-sidebar/section-sidebar.component';

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
    SectionSidebarComponent
  ],
  templateUrl: './my-projects.component.html',
  styleUrl: './my-projects.component.scss'
})
export default class MyProjectsComponent implements OnInit, AfterViewInit {
  api = inject(ApiService);
  getContractsByUserService = inject(GetContractsByUserService);
  resultsCenterService = inject(ResultsCenterService);
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
  @ViewChild('startDateSelect') startDateSelect?: MultiselectComponent;
  @ViewChild('endDateSelect') endDateSelect?: MultiselectComponent;

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

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 5);
  }

  onAllProjectsPageChange(event: PaginatorState) {
    this.allProjectsFirst.set(event.first ?? 0);
    this.allProjectsRows.set(event.rows ?? 10);
  }

  ngOnInit(): void {
    this.resultsCenterService.clearAllFilters();
  }

  ngAfterViewInit() {
    this.resultsCenterService.multiselectRefs.set({
      status: this.statusSelect!,
      lever: this.leverSelect!,
      startDate: this.startDateSelect!,
      endDate: this.endDateSelect!
    });
  }

  onActiveItemChange = (event: MenuItem): void => {
    this.myProjectsFilterItem.set(event);
  };

  // Methods results table
  setSearchInputFilter($event: Event) {
    this.resultsCenterService.searchInput.set(($event.target as HTMLInputElement).value);
  }

  showFiltersSidebar() {
    this.resultsCenterService.showFiltersSidebar.set(true);
  }

  showConfigurationsSidebar() {
    this.resultsCenterService.showConfigurationsSidebar.set(true);
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
}
