import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { CacheService } from '../cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class GetProjectIndicatorsHierarchyService {
  api = inject(ApiService);
  list = signal<any[]>([]);
  loading = signal(false);
  isOpenSearch = signal(false);

  async update(agreementId: string) {
    this.clear();
    this.loading.set(true);
    const response = await this.api.GET_Hierarchy(agreementId);
    console.log(response.data);
    this.list.set(response.data);
    this.loading.set(false);
  }

  clear() {
    this.list.set([]);
  }
}
