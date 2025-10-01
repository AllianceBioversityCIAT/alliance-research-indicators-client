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
  hasFilters = computed(() => {
    const filters = this.appliedFilters();
    const filterChecks = [
      filters.contractCode,
      filters.projectName,
      filters.principalInvestigator,
      filters.levers,
      filters.statusCodes,
      filters.startDate,
      filters.endDate
    ];
    return filterChecks.some(filter => this.isFilterActive(filter));
  });

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
  }

  private isFilterActive(filterValue: string | { id: number; short_name: string }[] | { name: string; value: string }[]): boolean {
    if (Array.isArray(filterValue)) {
      return filterValue.length > 0;
    }
    return !!filterValue;
  }

  private getLeverDisplayName(item: FindContracts): string {
    if (item.lever_name) {
      return item.lever_name;
    }
    if (item.lever && typeof item.lever === 'object') {
      return item.lever.short_name || item.lever.name || '';
    }
    if (typeof item.lever === 'string') {
      return item.lever;
    }
    return '';
  }

  async main(params?: Record<string, unknown>) {
    this.loading.set(true);
    try {
      const response = await this.api.GET_FindContracts(params);
      if (response?.data?.data) {
        this.list.set(response.data.data);
        this.list.update(current =>
          current.map(item => ({
            ...item,
            full_name: `${item.agreement_id} ${item.projectDescription} ${item.description} ${item.project_lead_description}`,
            display_principal_investigator: item.principal_investigator || item.project_lead_description || '',
            display_lever_name: this.getLeverDisplayName(item)
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

    this.main(params);
  };

  countFiltersSelected = computed(() => {
    const f = this.tableFilters();
    const total =
      (f.contractCode ? 1 : 0) +
      (f.projectName ? 1 : 0) +
      (f.principalInvestigator ? 1 : 0) +
      (f.levers?.length ?? 0) +
      (f.statusCodes?.length ?? 0) +
      (f.startDate ? 1 : 0) +
      (f.endDate ? 1 : 0);
    return total > 0 ? total.toString() : undefined;
  });

  getActiveFilters = computed(() => {
    const filters = this.appliedFilters();
    const items: { label: string; value: string; id?: string | number }[] = [];

    const formatDate = (iso: string): string => {
      if (!iso) return '';
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mm = months[d.getMonth()];
      const dd = d.getDate().toString().padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${mm}, ${dd} /${yyyy}`;
    };

    if (filters.contractCode) items.push({ label: 'CONTRACT CODE', value: filters.contractCode });
    if (filters.projectName) items.push({ label: 'PROJECT NAME', value: filters.projectName });
    if (filters.principalInvestigator) items.push({ label: 'PRINCIPAL INVESTIGATOR', value: filters.principalInvestigator });

    if (Array.isArray(filters.statusCodes)) {
      filters.statusCodes.forEach(s => items.push({ label: 'STATUS', value: s.name, id: s.value }));
    }
    if (Array.isArray(filters.levers)) {
      filters.levers.forEach(l => items.push({ label: 'LEVER', value: l.short_name || l.id.toString(), id: l.id }));
    }
    if (filters.startDate) items.push({ label: 'START DATE', value: formatDate(filters.startDate) });
    if (filters.endDate) items.push({ label: 'END DATE', value: formatDate(filters.endDate) });

    return items;
  });

  removeFilter(label: string, id?: string | number): void {
    const mapping: Record<string, keyof MyProjectsFilters> = {
      'CONTRACT CODE': 'contractCode',
      'PROJECT NAME': 'projectName',
      'PRINCIPAL INVESTIGATOR': 'principalInvestigator',
      STATUS: 'statusCodes',
      LEVER: 'levers',
      'START DATE': 'startDate',
      'END DATE': 'endDate'
    };
    const key = mapping[label];
    if (!key) return;

    this.tableFilters.update(prev => {
      const next: MyProjectsFilters = { ...prev };
      switch (key) {
        case 'statusCodes':
          next.statusCodes = id != null ? next.statusCodes.filter(s => s.value !== id) : [];
          break;
        case 'levers':
          next.levers = id != null ? next.levers.filter(l => l.id !== id) : [];
          break;
        case 'contractCode':
          next.contractCode = '';
          break;
        case 'projectName':
          next.projectName = '';
          break;
        case 'principalInvestigator':
          next.principalInvestigator = '';
          break;
        case 'startDate':
          next.startDate = '';
          break;
        case 'endDate':
          next.endDate = '';
          break;
      }
      return next;
    });

    const refs = this.multiselectRefs();
    const refKeyByLabel: Record<string, 'status' | 'lever'> = { STATUS: 'status', LEVER: 'lever' };
    const refKey = refKeyByLabel[label];
    const ref: MultiselectComponent | undefined = refKey ? refs[refKey] : undefined;
    if (ref && id != null && typeof ref.removeById === 'function') {
      try {
        ref.removeById(id);
      } catch {
        // noop
      }
    } else if (ref && id == null && typeof ref.clear === 'function') {
      try {
        ref.clear();
      } catch {
        // do nothing
      }
    }

    this.applyFilters();
  }

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

  resetState() {
    this.resetFilters();
    this.list.set([]);
    this.loading.set(true);
    this.isOpenSearch.set(false);
    this.showFiltersSidebar.set(false);
    this.multiselectRefs.set({});
    this.myProjectsFilterItem.set(this.myProjectsFilterItems[0]);
  }
}
