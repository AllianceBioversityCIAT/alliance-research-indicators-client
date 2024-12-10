import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetDeliveryModality } from '../../interfaces/get-delivery-modality.interface';

@Injectable({
  providedIn: 'root'
})
export class CapSharingDeliveryModalitiesService {
  api = inject(ApiService);
  list = signal<GetDeliveryModality[]>([]);
  loading = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_DeliveryModalities();
    this.list.set(response.data);
    this.loading.set(false);
  }
}
