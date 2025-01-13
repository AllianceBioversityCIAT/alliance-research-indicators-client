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
      response.data.forEach((item: GetContracts) => {
        item.display_label = item.agreement_id + ' - ' + item.description;
      });
      this.list.set(response.data);
    } else {
      this.list.set([]);
    }

    this.loading.set(false);
  }
}
