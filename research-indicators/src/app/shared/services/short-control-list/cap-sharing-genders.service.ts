import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { Gender } from '../../interfaces/get-cap-sharing.interface';

@Injectable({
  providedIn: 'root'
})
export class CapSharingGendersService {
  api = inject(ApiService);
  list = signal<Gender[]>([]);
  loading = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_Gender();
    this.list.set(response.data);
    this.loading.set(false);
  }
}
