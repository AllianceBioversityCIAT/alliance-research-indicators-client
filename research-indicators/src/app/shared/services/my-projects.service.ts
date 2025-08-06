import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { FindContracts } from '@shared/interfaces/find-contracts.interface';

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
  list = signal<FindContracts[]>([]);
  loading = signal(true);
  isOpenSearch = signal(false);

  tableFilters = signal(new MyProjectsFilters());

  constructor() {
    this.main();
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
      params['lever'] = filters.levers[0]?.id;
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

  clearFilters() {
    this.tableFilters.set(new MyProjectsFilters());
    this.main();
  }

  refresh() {
    this.main();
  }
}
