import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class GetOsCountriesService {
  api = inject(ApiService);
  list = signal<any[]>([]);
  loading = signal(false);
  isOpenSearch = signal(true);
  async update(search: string) {
    this.loading.set(true);
    const response = await this.api.GET_OpenSearchCountries(search);
    this.list.set(response.data);
    this.loading.set(false);
  }
}
