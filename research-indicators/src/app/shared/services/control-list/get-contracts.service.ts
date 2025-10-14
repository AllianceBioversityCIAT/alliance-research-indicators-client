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

  async main() {
    this.loading.set(true);
    try {
      const response = await this.api.GET_FindContracts();

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
