import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetOsSubNationals } from '../../interfaces/get-os-subnational.interface';

@Injectable({
  providedIn: 'root'
})
export class GetOsSubnationalService {
  api = inject(ApiService);
  list = signal<GetOsSubNationals[]>([]);
  loading = signal(false);
  isOpenSearch = signal(true);

  async update(search: string) {
    this.loading.set(true);
    const response = await this.api.GET_OpenSearchSubNationals(search);
    this.list.set(response.data);
    this.loading.set(false);
  }
}
