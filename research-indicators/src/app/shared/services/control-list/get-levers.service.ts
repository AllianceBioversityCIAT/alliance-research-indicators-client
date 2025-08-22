import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetLevers } from '@shared/interfaces/get-levers.interface';

@Injectable({
  providedIn: 'root'
})
export class GetLeversService {
  apiService = inject(ApiService);
  loading = signal(true);

  list = signal<GetLevers[]>([]);
  isOpenSearch = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    try {
      const response = await this.apiService.GET_Levers();
      const data = Array.isArray(response?.data) ? response.data : [];
      this.list.set(data);
    } catch {
      this.list.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
