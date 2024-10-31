import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetContracts } from '../../interfaces/get-contracts.interface';

@Injectable({
  providedIn: 'root'
})
export class GetContractsService {
  api = inject(ApiService);
  list = signal<GetContracts[]>([]);
  loading = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_Contracts();
    this.list.set(response.data);
    this.loading.set(false);
  }
}
