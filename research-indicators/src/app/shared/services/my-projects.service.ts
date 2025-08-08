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
  showFiltersSidebar = signal(false);
  multiselectRefs = signal<Record<string, MultiselectComponent>>({});
  searchInput = signal('');

  myProjectsFilterItems: MenuItem[] = [
    { id: 'all', label: 'All Projects' },
    { id: 'my', label: 'My Projects' }
  ];
  myProjectsFilterItem = signal<MenuItem | undefined>(this.myProjectsFilterItems[0]);

  constructor() {
    // No llamar a main() aquí para evitar que se cargue con current-user: false por defecto
    // Los datos se cargarán desde el componente según el tab activo
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
    const params: Record<string, unknown> = {};

    // Agregar el parámetro current-user según el tab activo
    const currentTab = this.myProjectsFilterItem();
    if (currentTab?.id === 'my') {
      params['current-user'] = true;
    } else {
      params['current-user'] = false;
    }

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
      params['start-date'] = filters.startDate;
    }

    if (filters.endDate) {
      params['end-date'] = filters.endDate;
    }

    this.main(params);
  };

  // Computed para contar filtros activos
  countFiltersSelected = computed(() => {
    const filters = this.tableFilters();
    let count = 0;

    if (filters.contractCode) count++;
    if (filters.projectName) count++;
    if (filters.principalInvestigator) count++;
    if (filters.levers.length > 0) count++;
    if (filters.statusCodes.length > 0) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;

    return count > 0 ? count.toString() : undefined;
  });

  getActiveFilters = computed(() => {
    const filters: { label: string }[] = [];
    const activeFilters = this.tableFilters();

    if (activeFilters.contractCode) {
      filters.push({ label: 'CONTRACT CODE' });
    }

    if (activeFilters.projectName) {
      filters.push({ label: 'PROJECT NAME' });
    }

    if (activeFilters.principalInvestigator) {
      filters.push({ label: 'PRINCIPAL INVESTIGATOR' });
    }

    if (activeFilters.statusCodes.length > 0) {
      filters.push({ label: 'STATUS' });
    }

    if (activeFilters.levers.length > 0) {
      filters.push({ label: 'LEVER' });
    }

    if (activeFilters.startDate) {
      filters.push({ label: 'START DATE' });
    }

    if (activeFilters.endDate) {
      filters.push({ label: 'END DATE' });
    }

    return filters;
  });

  onActiveItemChange = (event: MenuItem): void => {
    this.myProjectsFilterItem.set(event);

    this.searchInput.set('');
    this.tableFilters.set(new MyProjectsFilters());

    this.cleanMultiselects();

    if (event.id === 'my') {
      const params = { 'current-user': true };
      this.main(params);
    } else {
      const params = { 'current-user': false };
      this.main(params);
    }
  };

  showFilterSidebar(): void {
    this.showFiltersSidebar.set(true);
  }

  cleanMultiselects() {
    const refs = this.multiselectRefs();
    Object.values(refs).forEach(multiselect => {
      multiselect.clear();
    });
  }

  clearAllFilters() {
    this.tableFilters.set(new MyProjectsFilters());
    this.searchInput.set('');
    this.cleanMultiselects();

    // Cargar datos según el tab activo
    const currentTab = this.myProjectsFilterItem();
    if (currentTab?.id === 'my') {
      this.main({ 'current-user': true });
    } else {
      this.main({ 'current-user': false });
    }
  }

  clearFilters() {
    this.tableFilters.set(new MyProjectsFilters());
    this.cleanMultiselects();

    // Cargar datos según el tab activo
    const currentTab = this.myProjectsFilterItem();
    if (currentTab?.id === 'my') {
      this.main({ 'current-user': true });
    } else {
      this.main({ 'current-user': false });
    }
  }

  refresh() {
    // Cargar datos según el tab activo
    const currentTab = this.myProjectsFilterItem();
    if (currentTab?.id === 'my') {
      this.main({ 'current-user': true });
    } else {
      this.main({ 'current-user': false });
    }
  }
}
