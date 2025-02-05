import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetInnoUseOutput } from '../../interfaces/get-innovation-outputs.interface';
import { IndicatorsEnum } from '../../enums/indicators-enum';
@Injectable({
  providedIn: 'root'
})
export class GetInnoUseOutputService {
  api = inject(ApiService);
  list = signal<GetInnoUseOutput[]>([]);
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
    const response = await this.api.GET_Results(IndicatorsEnum.INNOVATION_USE);

    if (response?.data) {
      this.list.set(response.data as GetInnoUseOutput[]);
    } else {
      this.list.set([]);
    }

    this.loading.set(false);
  }
}
