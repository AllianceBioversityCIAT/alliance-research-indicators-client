import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { GlobalTarget } from '@shared/interfaces/global-target.interface';

@Injectable({ providedIn: 'root' })
export class GlobalTargetsService {
  apiService = inject(ApiService);
  loading = signal(true);

  list = signal<GlobalTarget[]>([]);
  isOpenSearch = signal(false);
  
  constructor() {
    this.loadData();
  }

  private async loadData() {
    await this.main();
  }

  async main() {
    this.loading.set(true);
    try {
      const response = await this.apiService.GET_GlobalTargets();
      const data = Array.isArray(response?.data) ? response.data : [];
      this.list.set(data);
    } catch {
      this.list.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
