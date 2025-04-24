import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { IpOwners } from '../../interfaces/get-cap-sharing.interface';

@Injectable({
  providedIn: 'root'
})
export class IpOwnerService {
  api = inject(ApiService);
  list = signal<IpOwners[]>([]);
  loading = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_IpOwners();
    this.list.set(response.data);
    this.loading.set(false);
  }
}
