import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { FindContracts } from '@shared/interfaces/find-contracts.interface';

@Injectable({
  providedIn: 'root'
})
export class MyProjectsService {
  api = inject(ApiService);
  list = signal<FindContracts[]>([]);
  loading = signal(true);
  isOpenSearch = signal(false);

  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    try {
      const response = await this.api.GET_FindContracts();
      if (response?.data) {
        this.list.set(response.data);
        this.list.update(current =>
          current.map(item => ({
            ...item,
            full_name: `${item.agreement_id} ${item.projectDescription} ${item.description} ${item.project_lead_description}`
          }))
        );
      } else {
        this.list.set([]);
      }
    } catch (e) {
      console.error('Failed to fetch find contracts:', e);
      this.list.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  refresh() {
    this.main();
  }
}
