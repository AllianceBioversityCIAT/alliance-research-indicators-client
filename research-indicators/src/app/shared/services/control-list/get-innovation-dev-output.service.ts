import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetInnoDevOutput } from '../../interfaces/get-innovation-outputs.interface';
import { IndicatorsEnum } from '../../enums/indicators-enum';

@Injectable({
  providedIn: 'root'
})
export class GetInnoDevOutputService {
  api = inject(ApiService);
  list = signal<GetInnoDevOutput[]>([]);
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
    const response = await this.api.GET_Results(IndicatorsEnum.INNOVATION_DEV);
    if (response?.data) {
      this.list.set(response.data as GetInnoDevOutput[]);
    } else {
      this.list.set([]);
    }

    this.loading.set(false);
  }
}
