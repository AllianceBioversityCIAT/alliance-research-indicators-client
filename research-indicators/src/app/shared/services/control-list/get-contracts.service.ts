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
    const response = await this.api.GET_Contracts();

    if (response?.data) {
      this.list.set(response.data);

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

    this.loading.set(false);
  }
}
