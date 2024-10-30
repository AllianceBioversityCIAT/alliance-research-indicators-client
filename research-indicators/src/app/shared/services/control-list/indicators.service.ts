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
  constructor() {
    this.main();
  }

  async main() {
    const response = await this.api.GET_IndicatorTypes();
    this.indicators.set(response.data);
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
