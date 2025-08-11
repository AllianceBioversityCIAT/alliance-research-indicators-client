import { inject, Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { FindContracts } from '@shared/interfaces/find-contracts.interface';
import { MultiselectComponent } from '../components/custom-fields/multiselect/multiselect.component';
import { MenuItem } from 'primeng/api';
import { CacheService } from './cache/cache.service';

export class MyProjectsFilters {
  contractCode = '';
  projectName = '';
  principalInvestigator = '';
  levers: { id: number; short_name: string }[] = [];
  statusCodes: { name: string; value: string }[] = [];
  startDate = '';
  endDate = '';
}

@Injectable({
  providedIn: 'root'
})
export class MyProjectsService {
  api = inject(ApiService);
  cache = inject(CacheService);

  list = signal<FindContracts[]>([]);
  loading = signal(true);
  isOpenSearch = signal(false);

  tableFilters = signal(new MyProjectsFilters());
  appliedFilters = signal(new MyProjectsFilters());
  showFiltersSidebar = signal(false);
  multiselectRefs = signal<Record<string, MultiselectComponent>>({});
  searchInput = signal('');
  hasFilters = signal(false);

  myProjectsFilterItems: MenuItem[] = [
    { id: 'all', label: 'All Projects' },
    { id: 'my', label: 'My Projects' }
  ];
  myProjectsFilterItem = signal<MenuItem | undefined>(this.myProjectsFilterItems[0]);

  private getBaseParams(): Record<string, unknown> {
    const currentTab = this.myProjectsFilterItem();
    return { 'current-user': currentTab?.id === 'my' };
  }

  private resetFilters(): void {
    this.tableFilters.set(new MyProjectsFilters());
    this.appliedFilters.set(new MyProjectsFilters());
    this.searchInput.set('');
    this.cleanMultiselects();
    this.hasFilters.set(false);
  }

  private isFilterActive(filterValue: string | { id: number; short_name: string }[] | { name: string; value: string }[]): boolean {
    if (Array.isArray(filterValue)) {
      return filterValue.length > 0;
    }
    return !!filterValue;
  }

  async main(params?: Record<string, unknown>) {
    this.loading.set(true);
    try {
      const response = await this.api.GET_FindContracts(params);
      if (response?.data) {
        this.list.set(response.data);
        this.list.update(current =>
          current.map(item => ({
            ...item,
            full_name: `${item.agreement_id} ${item.projectDescription} ${item.description} ${item.project_lead_description}`
          }))
        );
      } else {
        this.list.set([]);
      }
    } catch (e) {
      console.error('Failed to fetch find contracts:', e);
      this.list.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  applyFilters = () => {
    const filters = this.tableFilters();
    const params = this.getBaseParams();

    if (filters.contractCode) {
      params['contract-code'] = filters.contractCode;
    }

    if (filters.projectName) {
      params['project-name'] = filters.projectName;
    }

    if (filters.principalInvestigator) {
      params['principal-investigator'] = filters.principalInvestigator;
    }

    if (filters.levers.length > 0) {
      params['lever'] = filters.levers.map(lever => lever.id).join(',');
    }

    if (filters.statusCodes.length > 0) {
      params['status'] = filters.statusCodes.map(status => status.value).join(',');
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      params['start-date'] = startDate.toISOString().slice(0, 23);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      params['end-date'] = endDate.toISOString().slice(0, 23);
    }

    this.appliedFilters.set({ ...filters });
    const hasActiveFilters = this.countFiltersSelected() !== undefined;
    this.hasFilters.set(hasActiveFilters);

    this.main(params);
  };

  countFiltersSelected = computed(() => {
    const filters = this.tableFilters();
    const filterChecks = [
      filters.contractCode,
      filters.projectName,
      filters.principalInvestigator,
      filters.levers,
      filters.statusCodes,
      filters.startDate,
      filters.endDate
    ];

    const count = filterChecks.filter(filter => this.isFilterActive(filter)).length;
    return count > 0 ? count.toString() : undefined;
  });

  getActiveFilters = computed(() => {
    const filters = this.appliedFilters();
    const filterConfigs = [
      { value: filters.contractCode, label: 'CONTRACT CODE' },
      { value: filters.projectName, label: 'PROJECT NAME' },
      { value: filters.principalInvestigator, label: 'PRINCIPAL INVESTIGATOR' },
      { value: filters.statusCodes, label: 'STATUS' },
      { value: filters.levers, label: 'LEVER' },
      { value: filters.startDate, label: 'START DATE' },
      { value: filters.endDate, label: 'END DATE' }
    ];

    return filterConfigs.filter(config => this.isFilterActive(config.value)).map(config => ({ label: config.label }));
  });

  onActiveItemChange = (event: MenuItem): void => {
    this.myProjectsFilterItem.set(event);
    this.resetFilters();
    this.main(this.getBaseParams());
  };

  showFilterSidebar(): void {
    this.showFiltersSidebar.set(true);
  }

  cleanMultiselects() {
    const refs = this.multiselectRefs();
    if (refs && Object.keys(refs).length > 0) {
      Object.values(refs).forEach(multiselect => {
        if (multiselect && typeof multiselect.clear === 'function') {
          try {
            multiselect.clear();
          } catch (error) {
            console.warn('Error clearing multiselect:', error);
          }
        }
      });
    }
  }

  clearAllFilters() {
    this.resetFilters();
    this.main(this.getBaseParams());
  }

  clearFilters() {
    this.resetFilters();
    this.main(this.getBaseParams());
  }

  refresh() {
    this.main(this.getBaseParams());
  }
}
