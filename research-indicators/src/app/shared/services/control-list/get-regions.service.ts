import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetRegion } from '../../interfaces/get-region.interface';

@Injectable({
  providedIn: 'root'
})
export class GetRegionsService {
  api = inject(ApiService);
  list = signal<GetRegion[]>([]);
  loading = signal(true);
  isOpenSearch = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    const response = await this.api.GET_Regions();
    response.data.map((region: GetRegion) => {
      region.region_id = region.um49Code;
      region.sub_national_id = region.um49Code;
    });
    this.list.set(response.data);
    this.loading.set(false);
  }
}
