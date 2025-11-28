import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetContracts } from '../../interfaces/get-contracts.interface';

@Injectable({
  providedIn: 'root'
})
export class GetContractsService {
  api = inject(ApiService);
  list = signal<GetContracts[]>([]);
  loading = signal(true);
  isOpenSearch = signal(false);
  constructor() {
    this.initialize();
  }

  initialize() {
    this.main();
  }

  async main(filters?: {
    'current-user'?: boolean;
    'contract-code'?: string;
    'project-name'?: string;
    'principal-investigator'?: string;
    lever?: string;
    status?: string;
    'start-date'?: string;
    'order-field'?: string;
    direction?: string;
    'end-date'?: string;
    query?: string;
    page?: string;
    limit?: string;
    project?: string;
    'exclude-pooled-funding'?: boolean;
  }) {
    this.loading.set(true);
    try {
      const response = await this.api.GET_FindContracts(filters);

      if (response?.data?.data && Array.isArray(response.data.data)) {
        this.list.set(response.data.data as GetContracts[]);

        this.list.update(current =>
          current.map(item => ({
            ...item,
            select_label: item.agreement_id + ' - ' + item.description,
            contract_id: item.agreement_id
          }))
        );
      } else {
        this.list.set([]);
      }
    } catch (e) {
      console.error('Failed to fetch contracts:', e);
      this.list.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
