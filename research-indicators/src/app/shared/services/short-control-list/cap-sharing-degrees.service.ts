import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { Degree } from '../../interfaces/get-cap-sharing.interface';

@Injectable({
  providedIn: 'root'
})
export class CapSharingDegreesService {
  api = inject(ApiService);
  list = signal<Degree[]>([]);
  loading = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_Degrees();
    this.list.set(response.data);
    this.loading.set(false);
  }
}
