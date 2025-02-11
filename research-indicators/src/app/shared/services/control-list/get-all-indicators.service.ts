import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetAllIndicators } from '../../interfaces/get-all-indicators.interface';
@Injectable({
  providedIn: 'root'
})
export class GetAllIndicatorsService {
  apiService = inject(ApiService);
  list = signal<GetAllIndicators[]>([]);
  loading = signal(true);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.apiService.GET_AllIndicators();
    this.list.set(response.data);
    this.loading.set(false);
  }

  getInstance = async (): Promise<WritableSignal<GetAllIndicators[]>> => {
    const newSignal = signal<GetAllIndicators[]>([]);
    const response = await this.apiService.GET_AllIndicators();
    newSignal.set(response.data);
    return newSignal;
  };
}
