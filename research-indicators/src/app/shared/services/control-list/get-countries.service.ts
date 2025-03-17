import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetCountries } from '../../interfaces/get-countries.interface';

@Injectable({
  providedIn: 'root'
})
export class GetCountriesService {
  api = inject(ApiService);
  list = signal<GetCountries[]>([]);
  loading = signal(false);
  isOpenSearch = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_Countries();
    this.list.set(response.data);
    this.loading.set(false);
  }
}
