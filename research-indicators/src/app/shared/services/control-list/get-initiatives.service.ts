import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GenericList } from '@shared/interfaces/generic-list.interface';

@Injectable({
  providedIn: 'root'
})
export class GetInitiativesService {
  apiService = inject(ApiService);
  loading = signal(true);

  list = signal<GenericList[]>([]);
  isOpenSearch = signal(false);

  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    try {
      const response = await this.apiService.GET_Initiatives();
      const data = Array.isArray(response?.data) ? response.data : [];
      this.list.set(data);
    } catch {
      this.list.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
