import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { IndicatorTypes } from '../interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class IndicatorsService {
  api = inject(ApiService);
  indicators = signal<IndicatorTypes[]>([]);

  constructor() {
    this.main();
  }

  async main() {
    const response = await this.api.GET_IndicatorTypes();
    this.indicators.set(response.data);
  }
}
