import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { Oicr } from '@shared/interfaces/oicr-creation.interface';

@Injectable({
  providedIn: 'root'
})
export class OicrResultsService {
  apiService = inject(ApiService);
  loading = signal(true);

  list = signal<Oicr[]>([]);
  isOpenSearch = signal(false);

  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    try {
      const response = await this.apiService.GET_OicrResults();
      const data = Array.isArray(response?.data) ? response.data : [];
      this.list.set(data);
    } catch {
      this.list.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
