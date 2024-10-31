import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class GetContractsService {
  api = inject(ApiService);
  list = signal<any[]>([]);
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
