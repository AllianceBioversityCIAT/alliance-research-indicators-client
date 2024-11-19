import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetLevers } from '../../interfaces/get-levers.interface';

@Injectable({
  providedIn: 'root'
})
export class GetLeversService {
  apiService = inject(ApiService);
  loading = signal(true);
  list = signal<GetLevers[]>([]);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.apiService.GET_Levers();
    console.log(response);
    this.list.set(response.data);
    this.list.update(current => current.map(item => ({ ...item, lever_id: item.id })));
    this.loading.set(false);
  }
}
