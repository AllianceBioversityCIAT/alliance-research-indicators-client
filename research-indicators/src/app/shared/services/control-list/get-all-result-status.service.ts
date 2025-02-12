import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetAllResultStatus } from '../../interfaces/get-all-result-status.interface';
@Injectable({
  providedIn: 'root'
})
export class GetAllResultStatusService {
  api = inject(ApiService);
  list = signal<GetAllResultStatus[]>([]);
  loading = signal(false);
  isOpenSearch = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_AllResultStatus();
    this.list.set(response.data);
    console.log(this.list());
    this.loading.set(false);
  }
}
