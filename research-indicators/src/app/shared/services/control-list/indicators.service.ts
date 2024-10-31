import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Indicator, IndicatorTypes } from '@interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class IndicatorsService {
  api = inject(ApiService);
  indicators = signal<IndicatorTypes[]>([]);
  indicatorsGrouped = computed(() => this.generateGroupedIndicators(this.indicators(), 'name', 'indicator_type_id', 'name', 'indicator_id'));
  loading = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_IndicatorTypes();
    this.indicators.set(response.data);
    this.loading.set(false);
  }

  generateGroupedIndicators(data: IndicatorTypes[], parentLabelKey: keyof IndicatorTypes, parentValueKey: keyof IndicatorTypes, itemLabelKey: keyof Indicator, itemValueKey: keyof Indicator): any[] {
    return data.map(parent => ({
      label: parent[parentLabelKey] as string,
      value: parent[parentValueKey] as string,
      items: parent.indicators.map(item => ({
        label: item[itemLabelKey] as string,
        value: item[itemValueKey] as string
      }))
    }));
  }
}
