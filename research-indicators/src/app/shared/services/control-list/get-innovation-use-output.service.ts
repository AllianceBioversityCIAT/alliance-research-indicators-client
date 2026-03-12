import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { Result } from '../../interfaces/result/result.interface';
@Injectable({
  providedIn: 'root'
})
export class GetInnoUseOutputService {
  api = inject(ApiService);
  list = signal<Result[]>([]);
  loading = signal(true);
  isOpenSearch = signal(false);

  constructor() {
    this.initialize();
  }

  initialize() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_Results({
      'indicator-codes': [6]
    });

    const data = response?.data?.data;
    this.list.set(Array.isArray(data) ? data : []);

    this.loading.set(false);
  }
}
