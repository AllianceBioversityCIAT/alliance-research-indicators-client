import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class GetContractsService {
  api = inject(ApiService);
  list = signal<any[]>([]);

  constructor() {
    this.main();
  }

  async main() {
    const response = await this.api.GET_Contracts();
    this.list.set(response.data);
    console.log(this.list());
  }
}
