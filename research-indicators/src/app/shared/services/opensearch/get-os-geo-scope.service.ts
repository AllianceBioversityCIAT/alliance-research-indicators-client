import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetGeoSearch } from '../../interfaces/get-geo-search.interface';

@Injectable({
  providedIn: 'root'
})
export class GetOsGeoScopeService {
  api = inject(ApiService);
  list = signal<GetGeoSearch[]>([]);
  loading = signal(false);
  isOpenSearch = signal(true);

  async update(scope: string, search: string) {
    this.loading.set(true);
    try {
      const response = await this.api.GET_GeoSearch(scope, search);
      this.list.set(response.data);
    } finally {
      this.loading.set(false);
    }
  }
}
