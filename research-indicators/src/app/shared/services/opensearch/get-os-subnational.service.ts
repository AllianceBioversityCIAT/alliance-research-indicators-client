import { inject, Injectable, signal, WritableSignal } from '@angular/core';
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

  getInstance = async (search: string): Promise<WritableSignal<GetOsSubNationals[]>> => {
    const newSignal = signal<GetOsSubNationals[]>([]);
    const response = await this.api.GET_OpenSearchSubNationals(search);
    response.data.forEach(item => {
      item.sub_national_id = item.id;
    });
    console.log(response.data);
    newSignal.set(response.data);
    return newSignal;
  };
}
