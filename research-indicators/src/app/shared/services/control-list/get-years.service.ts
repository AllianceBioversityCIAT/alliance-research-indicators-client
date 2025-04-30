import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetYear } from '@shared/interfaces/get-year.interface';

@Injectable({
  providedIn: 'root'
})
export class GetYearsService {
  apiService = inject(ApiService);
  loading = signal(true);

  list = signal<GetYear[]>([]);
  isOpenSearch = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.apiService.GET_Years();
    this.list.set(response.data);
    this.loading.set(false);
  }
}
