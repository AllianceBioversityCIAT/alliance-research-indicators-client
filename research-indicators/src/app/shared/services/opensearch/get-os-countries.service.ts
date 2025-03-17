import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetOsCountries } from '../../interfaces/get-os-countries.interface';

@Injectable({
  providedIn: 'root'
})
export class GetOsCountriesService {
  api = inject(ApiService);
  list = signal<GetOsCountries[]>([]);
  loading = signal(false);
  isOpenSearch = signal(true);
  useInstance = signal(false);
  async update(search: string) {
    this.loading.set(true);
    const response = await this.api.GET_OpenSearchCountries(search);
    this.list.set(response.data);
    this.loading.set(false);
  }
}
