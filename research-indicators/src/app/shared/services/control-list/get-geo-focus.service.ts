import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class GetGeoFocusService {
  api = inject(ApiService);
  list = signal<{ value: string; label: string }[]>([]);
  loading = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    this.list.set([
      { value: '1', label: 'Global' },
      { value: '2', label: 'Regional' },
      { value: '3', label: 'Country' },
      { value: '4', label: 'Sub-national' },
      { value: '50', label: 'This is yet to be determined' }
    ]);
    this.loading.set(false);
  }
}
